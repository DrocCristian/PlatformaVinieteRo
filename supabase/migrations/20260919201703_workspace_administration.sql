
create function public.staff_has_role(allowed text[])
returns boolean language sql stable security invoker set search_path='' as $$
select coalesce((select auth.jwt())->>'aal'='aal2' and ((select auth.jwt())->'app_metadata'->>'vignexo_role')=any(allowed),false);
$$;
revoke all on function public.staff_has_role(text[]) from public,anon;
grant execute on function public.staff_has_role(text[]) to authenticated,service_role;
alter table public.support_cases add column response text check(char_length(response)<=4000);
alter table public.support_cases add column responded_at timestamptz;
grant update(status,response) on public.support_cases to authenticated;
create policy staff_support_read on public.support_cases for select to authenticated using(public.staff_has_role(array['superadmin','support']));
create policy staff_support_update on public.support_cases for update to authenticated using(public.staff_has_role(array['superadmin','support'])) with check(public.staff_has_role(array['superadmin','support']));
create policy staff_orders_read on public.orders for select to authenticated using(public.staff_has_role(array['superadmin','accounting','support']));
create policy staff_items_read on public.order_items for select to authenticated using(public.staff_has_role(array['superadmin','accounting','support']));
grant select on public.audit_logs to authenticated;
create policy staff_audit_read on public.audit_logs for select to authenticated using(public.staff_has_role(array['superadmin']));

create function public.audit_support_update() returns trigger language plpgsql security definer set search_path='' as $$
begin
 new.responded_at:=now();
 insert into public.audit_logs(actor_id,action,entity_id,details) values((select auth.uid()),'support_updated',new.id,jsonb_build_object('old_status',old.status,'new_status',new.status));
 return new;
end $$;
revoke all on function public.audit_support_update() from public,anon,authenticated;
create trigger support_update_audit before update on public.support_cases for each row execute function public.audit_support_update();

create function public.limit_workspace_inserts() returns trigger language plpgsql security definer set search_path='' as $$
declare n bigint;
begin
 perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,0));
 if tg_table_name='support_cases' then
 select count(*) into n from public.support_cases where user_id=new.user_id and created_at>now()-interval '1 day';
 if n>=20 then raise exception 'Daily support limit';end if;
 elsif tg_table_name='journeys' then
 select count(*) into n from public.journeys where user_id=new.user_id;
 if n>=1000 then raise exception 'Journey storage limit';end if;
 end if;
 return new;
end $$;
revoke all on function public.limit_workspace_inserts() from public,anon,authenticated;
create trigger support_insert_limit before insert on public.support_cases for each row execute function public.limit_workspace_inserts();
create trigger journeys_insert_limit before insert on public.journeys for each row execute function public.limit_workspace_inserts();
