begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002');
insert into public.fleet_companies(id,owner_id,name,tax_id,country,billing_address,billing_email) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Company A','A001','RO','Test address A','a@example.test'),
 ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Company B','B002','RO','Test address B','b@example.test');
insert into public.fleet_assets(id,company_id,plate,registration_country,kind) values
 ('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','TM01AAA','RO','truck'),
 ('20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','TM02BBB','RO','truck');
insert into public.fleet_documents(id,company_id,issuer_id,kind,reference,currency,issued_on,buyer_snapshot,source_key) values
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','issuer','invoice','INV1','EUR','2026-09-20','{}','doc1'),
 ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','issuer','invoice','INV2','EUR','2026-09-20','{}','doc2');
insert into public.fleet_ledger(company_id,vehicle_id,document_id,source_key,plate_snapshot,posting_date,country,description,currency,gross_minor) values
 ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','line1','TM01AAA','2026-09-20','RO','Demo','EUR',1200),
 ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000002','line2','TM02BBB','2026-09-20','RO','Demo','EUR',2200);
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ declare n integer; begin
 if (select count(*) from public.fleet_companies)<>1 then raise exception 'company isolation failed';end if;
 if (select count(*) from public.fleet_assets)<>1 then raise exception 'asset isolation failed';end if;
 if (select count(*) from public.fleet_documents)<>1 then raise exception 'document isolation failed';end if;
 if (select count(*) from public.fleet_ledger)<>1 then raise exception 'ledger isolation failed';end if;
 update public.fleet_assets set label='forbidden' where id='20000000-0000-4000-8000-000000000002';
 get diagnostics n=row_count; if n<>0 then raise exception 'cross tenant edit succeeded';end if;
 begin
  insert into public.fleet_assets(company_id,plate,registration_country,kind) values ('30000000-0000-4000-8000-000000000002','TM99BAD','RO','truck');
  raise exception 'cross tenant insert succeeded';
 exception when insufficient_privilege then null;end;
 begin
  update public.fleet_companies set owner_id='10000000-0000-4000-8000-000000000002';
  raise exception 'owner transfer succeeded';
 exception when insufficient_privilege then null;end;
 begin
  update public.fleet_companies set payment_mode='credit';
  raise exception 'credit enabled by customer';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.fleet_ledger(company_id,vehicle_id,source_key,plate_snapshot,posting_date,country,description,currency,gross_minor)
  values ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','fake','FAKE','2026-09-20','RO','fake','EUR',1);
  raise exception 'customer forged ledger';
 exception when insufficient_privilege then null;end;
 begin
  delete from public.fleet_documents;
  raise exception 'customer deleted invoice';
 exception when insufficient_privilege then null;end;
 insert into public.fleet_purchase_drafts(company_id,title,snapshot) values ('30000000-0000-4000-8000-000000000001','Valid draft','{}');
 begin
  insert into public.fleet_purchase_drafts(company_id,title,snapshot) values ('30000000-0000-4000-8000-000000000002','Invalid draft','{}');
  raise exception 'foreign draft succeeded';
 exception when insufficient_privilege then null;end;
 begin
  update public.fleet_purchase_drafts set status='paid';
  raise exception 'customer marked draft paid';
 exception when insufficient_privilege then null;end;
 update public.fleet_assets set archived_at=now() where id='20000000-0000-4000-8000-000000000001';
 if (select count(*) from public.fleet_assets where archived_at is not null)<>1 then raise exception 'owner archive failed';end if;
 update public.fleet_assets set archived_at=null where id='20000000-0000-4000-8000-000000000001';
end $$;
reset role;
do $$ begin
 begin
 insert into public.fleet_ledger(company_id,vehicle_id,source_key,plate_snapshot,posting_date,country,description,currency,gross_minor)
 values ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','foreign-fk','TEST','2026-09-20','RO','test','EUR',1);
 raise exception 'cross tenant asset FK succeeded';
 exception when foreign_key_violation then null;end;
 begin
 insert into public.fleet_ledger(company_id,vehicle_id,document_id,source_key,plate_snapshot,posting_date,country,description,currency,gross_minor)
 values ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','foreign-doc','TEST','2026-09-20','RO','test','EUR',1);
 raise exception 'cross tenant invoice FK succeeded';
 exception when foreign_key_violation then null;end;
 begin
 insert into public.fleet_documents(company_id,issuer_id,kind,reference,currency,issued_on,buyer_snapshot,source_key) values
 ('30000000-0000-4000-8000-000000000001','issuer','invoice','INV-DUP','EUR','2026-09-20','{}','doc1');
 raise exception 'duplicate fiscal source succeeded';
 exception when unique_violation then null;end;
end $$;
set local role anon;
do $$ begin
 begin perform * from public.fleet_companies;raise exception 'anon companies readable';exception when insufficient_privilege then null;end;
 begin perform * from public.fleet_documents;raise exception 'anon documents readable';exception when insufficient_privilege then null;end;
 begin perform * from public.fleet_ledger;raise exception 'anon ledger readable';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: tenant isolation, privilege boundaries, immutable financial records, source deduplication, composite foreign keys, anonymous denial' as result;
rollback;
