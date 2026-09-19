
create table public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 environment text not null default 'test' check(environment='test'),
 status text not null default 'awaiting_payment' check(status in ('awaiting_payment','paid','issuing','issued','partial','manual_review','failed','refunded')),
 currency text not null check(currency ~ '^[A-Z]{3}$'), total_minor bigint not null check(total_minor>0 and total_minor<=100000000),
 vehicle jsonb not null, request_items jsonb not null, consent_version text not null, payment_session text unique, payment_intent text unique,
 created_at timestamptz not null default now(), paid_at timestamptz
);
create index orders_owner on public.orders(user_id,created_at desc);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
 country text not null check(country in ('AT','HU','RO','BG','CZ','SK','SI','CH','MD')),
 product_snapshot jsonb not null, amount_minor bigint not null check(amount_minor>0), cost_minor bigint not null check(cost_minor>=0),
 status text not null default 'pending' check(status in ('pending','processing','issued','rejected','unconfirmed','refunded')),
 provider text not null check(provider like 'mock-%'), idempotency_key uuid not null unique default gen_random_uuid(),
 provider_reference text unique, valid_from timestamptz, valid_until timestamptz, document_text text,
 updated_at timestamptz not null default now()
);
create index order_items_order on public.order_items(order_id);
create table public.payment_events (
 id text primary key, order_id uuid not null references public.orders(id), event_type text not null,
 created_at timestamptz not null default now()
);
create index payment_events_order on public.payment_events(order_id);
create table public.issuance_jobs (
 id uuid primary key default gen_random_uuid(), item_id uuid not null unique references public.order_items(id),
 status text not null default 'queued' check(status in ('queued','running','done','manual_review')),
 attempts integer not null default 0, locked_at timestamptz, created_at timestamptz not null default now()
);
create index issuance_jobs_status on public.issuance_jobs(status,created_at);
create table public.audit_logs(
 id uuid primary key default gen_random_uuid(), actor_id uuid, action text not null, entity_id uuid,
 details jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.service_subscriptions(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 environment text not null default 'test' check(environment='test'),
 plan_code text not null, interval text not null check(interval in ('month','year')),
 stripe_reference text unique, status text not null check(status in ('incomplete','active','past_due','canceled')),
 cancel_at_period_end boolean not null default false,current_period_end timestamptz,
 consent_version text not null, created_at timestamptz not null default now()
);
create index service_subscriptions_owner on public.service_subscriptions(user_id);
create table public.renewal_mandates(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 environment text not null default 'test' check(environment='test'), vehicle_id uuid not null references public.vehicles(id),
 country text not null check(country in ('AT','HU','RO','BG','CZ','SK','SI','CH','MD')), product_code text not null, status text not null check(status in ('pending','active','paused','canceled')),
 consent_version text not null, next_review_at timestamptz, created_at timestamptz not null default now()
);
create index renewal_mandates_owner on public.renewal_mandates(user_id);
create index renewal_mandates_vehicle on public.renewal_mandates(vehicle_id);
do $$ declare t text; begin
 foreach t in array array['orders','order_items','payment_events','issuance_jobs','audit_logs','service_subscriptions','renewal_mandates'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant select on public.orders,public.order_items,public.service_subscriptions,public.renewal_mandates to authenticated;
create policy orders_read on public.orders for select to authenticated using((select auth.uid())=user_id);
create policy items_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=(select auth.uid())));
create policy subscriptions_read on public.service_subscriptions for select to authenticated using((select auth.uid())=user_id);
create policy mandates_read on public.renewal_mandates for select to authenticated using((select auth.uid())=user_id);

-- One transaction verifies order ownership and amount before scheduling each item once.
create function public.confirm_test_payment(p_event text,p_order uuid,p_session text,p_intent text,p_amount bigint,p_currency text,p_type text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare o public.orders;
begin
 select * into o from public.orders where id=p_order for update;
 if p_session is null or p_session not like 'cs_test_%' or p_intent is null or p_amount is null or p_currency is null or not found or o.environment<>'test' or o.payment_session is distinct from p_session or o.total_minor<>p_amount or lower(o.currency)<>lower(p_currency) then
 raise exception 'Payment does not match order'; end if;
 if exists(select 1 from public.payment_events where id=p_event) then return false; end if;
 insert into public.payment_events(id,order_id,event_type) values(p_event,p_order,p_type);
 if o.status='awaiting_payment' then
 update public.orders set status='paid',paid_at=now(),payment_intent=p_intent where id=p_order;
 insert into public.issuance_jobs(item_id) select id from public.order_items where order_id=p_order on conflict(item_id) do nothing;
 insert into public.audit_logs(action,entity_id) values('test_payment_confirmed',p_order);
 end if;
 return true;
end $$;
revoke all on function public.confirm_test_payment(text,uuid,text,text,bigint,text,text) from public,anon,authenticated;
grant execute on function public.confirm_test_payment(text,uuid,text,text,bigint,text,text) to service_role;

create function public.claim_test_jobs(p_limit integer default 10)
returns setof public.issuance_jobs language sql security invoker set search_path='' as $$
 update public.issuance_jobs set status='running',attempts=attempts+1,locked_at=now()
 where id in(select id from public.issuance_jobs where status='queued' order by created_at for update skip locked limit least(greatest(p_limit,1),20))
 returning *;
$$;
revoke all on function public.claim_test_jobs(integer) from public,anon,authenticated;
grant execute on function public.claim_test_jobs(integer) to service_role;
comment on table public.orders is 'TEST ONLY. Real payments and commercial issuance are prohibited by database constraint.';

-- Creating an order and its items is atomic. Only the server can invoke these functions.
create function public.create_test_order(p_id uuid,p_user uuid,p_vehicle jsonb,p_items jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare item jsonb; total bigint;
begin
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 9 then raise exception 'Invalid items';end if;
 select sum((x->>'amount_minor')::bigint) into total from jsonb_array_elements(p_items) x;
 if exists(select 1 from public.orders where id=p_id) then
  if not exists(select 1 from public.orders where id=p_id and user_id=p_user and vehicle=p_vehicle and total_minor=total and request_items=p_items) then raise exception 'Idempotency conflict';end if;
  return p_id;
 end if;
 insert into public.orders(id,user_id,currency,total_minor,vehicle,request_items,consent_version) values(p_id,p_user,'EUR',total,p_vehicle,p_items,'sandbox-v1');
 for item in select value from jsonb_array_elements(p_items) loop
  if item->>'scenario' not in ('success','refusal','timeout') or (item->>'amount_minor')::bigint<>100 then raise exception 'Invalid test product';end if;
  insert into public.order_items(order_id,country,product_snapshot,amount_minor,cost_minor,provider)
  values(p_id,item->>'country',item,100,0,'mock-'||(item->>'country'));
 end loop;
 insert into public.audit_logs(actor_id,action,entity_id) values(p_user,'test_order_created',p_id);
 return p_id;
end $$;
revoke all on function public.create_test_order(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.create_test_order(uuid,uuid,jsonb,jsonb) to service_role;

create function public.finish_test_job(p_job uuid,p_status text,p_reference text,p_document text)
returns void language plpgsql security invoker set search_path='' as $$
declare j public.issuance_jobs; oid uuid; next_status text;
begin
 if p_status not in ('issued','rejected','unconfirmed') then raise exception 'Invalid result';end if;
 if p_status='issued' and (p_reference is null or p_document is null or p_reference not like 'TEST-%' or p_document not like 'SIMULARE%') then raise exception 'Test document required';end if;
 select * into j from public.issuance_jobs where id=p_job for update;
 if not found or j.status<>'running' then raise exception 'Job not running';end if;
 select order_id into oid from public.order_items where id=j.item_id;
 perform 1 from public.orders where id=oid for update;
 update public.order_items set status=p_status,provider_reference=p_reference,document_text=p_document,updated_at=now() where id=j.item_id;
 update public.issuance_jobs set status=case when p_status='unconfirmed' then 'manual_review' else 'done' end where id=p_job;
 select case when bool_or(status='unconfirmed') then 'manual_review'
 when bool_or(status in ('pending','processing')) then 'issuing'
 when bool_and(status='issued') then 'issued'
 when bool_and(status='rejected') then 'failed' else 'partial' end
 into next_status from public.order_items where order_id=oid;
 update public.orders set status=next_status where id=oid;
 insert into public.audit_logs(action,entity_id,details) values('test_issuance_result',oid,jsonb_build_object('item',j.item_id,'status',p_status));
end $$;
revoke all on function public.finish_test_job(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.finish_test_job(uuid,text,text,text) to service_role;

-- A crashed worker must not automatically retry issuance.
create function public.recover_test_jobs()
returns integer language plpgsql security invoker set search_path='' as $$
declare j record; n integer:=0;
begin
 for j in select id from public.issuance_jobs where status='running' and locked_at<now()-interval '5 minutes' for update skip locked loop
  perform public.finish_test_job(j.id,'unconfirmed',null,null);n:=n+1;
 end loop;
 return n;
end $$;
revoke all on function public.recover_test_jobs() from public,anon,authenticated;
grant execute on function public.recover_test_jobs() to service_role;
