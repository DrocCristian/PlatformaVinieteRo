-- Customer drafts only; never payment or issuance authority.
alter table public.fleet_assets add column identity jsonb check(identity is null or (jsonb_typeof(identity)='object' and octet_length(identity::text)<=500));
grant insert(identity),update(identity) on public.fleet_assets to authenticated;
create table public.purchase_drafts (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),company_id uuid references public.fleet_companies(id),
 title text not null check(length(title) between 2 and 100),snapshot jsonb not null check(jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<=250000),
 status text not null default 'draft' check(status='draft'),created_at timestamptz not null default now()
);
create index purchase_drafts_owner on public.purchase_drafts(user_id,created_at desc);
create index purchase_drafts_company on public.purchase_drafts(company_id);
alter table public.purchase_drafts enable row level security;
revoke all on public.purchase_drafts from public,anon,authenticated;
grant select on public.purchase_drafts to authenticated;
grant insert(user_id,company_id,title,snapshot) on public.purchase_drafts to authenticated;
create policy purchase_read on public.purchase_drafts for select to authenticated using(user_id=(select auth.uid()) and (company_id is null or exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid()))));
create policy purchase_create on public.purchase_drafts for insert to authenticated with check(user_id=(select auth.uid()) and (company_id is null or exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid()))));
comment on table public.purchase_drafts is 'Untrusted requests. Revalidate ownership, identity, rules and supplier quotes at checkout. No payment or entitlement implied.';
