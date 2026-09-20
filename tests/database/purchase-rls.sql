begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002');
insert into public.fleet_companies(id,owner_id,name,tax_id,country,billing_address,billing_email) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Test A','A1','RO','Test address','a@example.test'),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Test B','B1','RO','Test address','b@example.test');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.purchase_drafts(user_id,title,snapshot) values('10000000-0000-4000-8000-000000000001','My draft','{}');
insert into public.purchase_drafts(user_id,company_id,title,snapshot) values('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Company draft','{}');
do $$ begin
 if (select count(*) from public.purchase_drafts)<>2 then raise exception 'own drafts invisible';end if;
 begin insert into public.purchase_drafts(user_id,title,snapshot) values('10000000-0000-4000-8000-000000000002','Wrong user','{}');raise exception 'foreign user accepted';exception when insufficient_privilege then null;end;
 begin insert into public.purchase_drafts(user_id,company_id,title,snapshot) values('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','Wrong company','{}');raise exception 'foreign company accepted';exception when insufficient_privilege then null;end;
 begin update public.purchase_drafts set status='paid';raise exception 'status writable';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin if (select count(*) from public.purchase_drafts)<>0 then raise exception 'cross user read';end if;end $$;
set local role anon;
do $$ begin begin perform * from public.purchase_drafts;raise exception 'anon read';exception when insufficient_privilege then null;end;end $$;
reset role;
select 'PASS: private drafts, company ownership, immutable state, anonymous denial' as result;
rollback;
