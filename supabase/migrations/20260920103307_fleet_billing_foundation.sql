-- Local foundation only. Apply after review and RLS tests; no production migration is run by this task.
create table public.fleet_companies (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 name text not null check(length(name) between 2 and 160),
 tax_id text not null check(length(tax_id) between 2 and 40),
 country text not null check(country ~ '^[A-Z]{2}$'),
 billing_address text not null check(length(billing_address) between 5 and 500),
 billing_email text not null check(length(billing_email) between 3 and 254),
 payment_mode text not null default 'immediate' check(payment_mode='immediate'),
 created_at timestamptz not null default now()
);
create index fleet_companies_owner on public.fleet_companies(owner_id);
alter table public.fleet_companies enable row level security;
revoke all on public.fleet_companies from public,anon,authenticated;
grant select on public.fleet_companies to authenticated;
grant insert(owner_id,name,tax_id,country,billing_address,billing_email) on public.fleet_companies to authenticated;
grant update(name,tax_id,country,billing_address,billing_email) on public.fleet_companies to authenticated;
create policy fleet_company_read on public.fleet_companies for select to authenticated using(owner_id=(select auth.uid()));
create policy fleet_company_create on public.fleet_companies for insert to authenticated with check(owner_id=(select auth.uid()));
create policy fleet_company_edit on public.fleet_companies for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));

create table public.fleet_assets (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.fleet_companies(id),
 plate text not null check(plate ~ '^[A-Z0-9]{2,12}$'),
 registration_country text not null check(registration_country ~ '^[A-Z]{2}$'),
 label text not null default '' check(length(label)<=80),
 kind text not null check(kind in ('car','van','truck','tractor','trailer','semitrailer')),
 f1 integer check(f1 between 1 and 200000),
 f2 integer check(f2 between 1 and 200000),
 f3 integer check(f3 between 1 and 200000),
 axles integer check(axles between 1 and 12),
 euro text not null default 'unknown' check(euro in ('unknown','0','1','2','3','4','5','6','electric')),
 co2_class integer check(co2_class between 1 and 5),
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 unique(id,company_id), unique(company_id,registration_country,plate),
 check(f1 is null or f2 is null or f2<=f1),
 check(f3 is null or f2 is null or f3>=f2),
 check(kind in ('trailer','semitrailer') or axles is null or axles>=2)
);
alter table public.fleet_assets enable row level security;
revoke all on public.fleet_assets from public,anon,authenticated;
grant select on public.fleet_assets to authenticated;
grant insert(company_id,plate,registration_country,label,kind,f1,f2,f3,axles,euro,co2_class) on public.fleet_assets to authenticated;
grant update(label,f1,f2,f3,axles,euro,co2_class,archived_at) on public.fleet_assets to authenticated;
create policy fleet_asset_read on public.fleet_assets for select to authenticated using(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid())));
create policy fleet_asset_create on public.fleet_assets for insert to authenticated with check(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid())));
create policy fleet_asset_edit on public.fleet_assets for update to authenticated using(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid()))) with check(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid())));

create table public.fleet_purchase_drafts (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.fleet_companies(id),
 title text not null check(length(title) between 2 and 100),
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<250000),
 status text not null default 'draft' check(status='draft'),
 created_at timestamptz not null default now()
);
create index fleet_purchase_drafts_company on public.fleet_purchase_drafts(company_id,created_at desc);
alter table public.fleet_purchase_drafts enable row level security;
revoke all on public.fleet_purchase_drafts from public,anon,authenticated;
grant select on public.fleet_purchase_drafts to authenticated;
grant insert(company_id,title,snapshot) on public.fleet_purchase_drafts to authenticated;
create policy fleet_draft_read on public.fleet_purchase_drafts for select to authenticated using(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid())));
create policy fleet_draft_create on public.fleet_purchase_drafts for insert to authenticated with check(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid())));
comment on table public.fleet_purchase_drafts is 'Untrusted customer requests, never evidence of payment, entitlement, tax approval or valid pricing. Checkout must independently re-read and validate all assets and approvals.';

-- Documents and posted ledger are written only by a future trusted accounting integration.
create table public.fleet_documents (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.fleet_companies(id),
 issuer_id text not null,
 kind text not null check(kind in ('invoice','credit_note','supplier_receipt','entitlement')),
 reference text not null,
 currency text not null check(currency ~ '^[A-Z]{3}$'),
 issued_on date not null,
 buyer_snapshot jsonb not null check(jsonb_typeof(buyer_snapshot)='object'),
 source_key text not null unique,
 storage_key text,
 efactura_status text not null default 'not_assessed' check(efactura_status in ('not_assessed','not_required','pending','accepted','rejected')),
 created_at timestamptz not null default now(),
 unique(id,company_id)
);
create index fleet_documents_company on public.fleet_documents(company_id,issued_on);
create table public.fleet_ledger (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.fleet_companies(id),
 vehicle_id uuid not null,
 document_id uuid,
 source_key text not null unique,
 plate_snapshot text not null,
 posting_date date not null,
 country text not null check(country in ('AT','HU','RO','BG','CZ','SK','SI','CH','MD')),
 description text not null,
 currency text not null check(currency ~ '^[A-Z]{3}$'),
 gross_minor bigint not null check(gross_minor between -9007199254740991 and 9007199254740991),
 invoice_reference text,
 created_at timestamptz not null default now(),
 foreign key(vehicle_id,company_id) references public.fleet_assets(id,company_id),
 foreign key(document_id,company_id) references public.fleet_documents(id,company_id)
);
create index fleet_ledger_company_date on public.fleet_ledger(company_id,posting_date,id);
create index fleet_ledger_vehicle on public.fleet_ledger(vehicle_id,company_id);
create index fleet_ledger_document on public.fleet_ledger(document_id,company_id);
alter table public.fleet_documents enable row level security;
alter table public.fleet_ledger enable row level security;
revoke all on public.fleet_documents,public.fleet_ledger from public,anon,authenticated;
grant select on public.fleet_documents,public.fleet_ledger to authenticated;
create policy fleet_document_read on public.fleet_documents for select to authenticated using(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid())));
create policy fleet_ledger_read on public.fleet_ledger for select to authenticated using(exists(select 1 from public.fleet_companies c where c.id=company_id and c.owner_id=(select auth.uid())));
comment on table public.fleet_ledger is 'Posted accounting entries only. Credits use negative amounts; do not mutate issued invoices. Source keys prevent duplicate ingestion. No client insert, update or delete.';
