-- Run with an administrative SQL connection; every fixture is rolled back.
begin;
insert into auth.users(id,email) values('00000000-0000-4000-a000-000000000011','workspace-rls-a@example.invalid'),('00000000-0000-4000-a000-000000000012','workspace-rls-b@example.invalid');
insert into public.support_cases(id,user_id,subject,message,kind) values('00000000-0000-4000-a000-000000000013','00000000-0000-4000-a000-000000000011','RLS test','Temporary support test','general');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000011","role":"authenticated","aal":"aal1"}',true);
insert into public.journeys(user_id,title,plate,registration_country,destinations) values('00000000-0000-4000-a000-000000000011','RLS trip','B123TST','RO','[{"country":"RO","entry":"2099-01-01","exit":"2099-01-02"}]');
do $$ declare n integer;begin
 update public.support_cases set status='resolved' where id='00000000-0000-4000-a000-000000000013';get diagnostics n=row_count;if n<>0 then raise exception 'Customer changed status';end if;
 if has_function_privilege('authenticated','public.confirm_test_payment(text,uuid,text,text,bigint,text,text)','EXECUTE') then raise exception 'Payment forgery privilege';end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000012","role":"authenticated","aal":"aal2","user_metadata":{"vignexo_role":"superadmin"}}',true);
do $$ begin
 if exists(select 1 from public.journeys where user_id='00000000-0000-4000-a000-000000000011') then raise exception 'Cross-owner trip access';end if;
 if exists(select 1 from public.support_cases where id='00000000-0000-4000-a000-000000000013') then raise exception 'User metadata promoted role';end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000012","role":"authenticated","aal":"aal1","app_metadata":{"vignexo_role":"support"}}',true);
do $$ begin if exists(select 1 from public.support_cases where id='00000000-0000-4000-a000-000000000013') then raise exception 'Staff bypassed MFA';end if;end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000012","role":"authenticated","aal":"aal2","app_metadata":{"vignexo_role":"support"}}',true);
update public.support_cases set status='reviewing',response='Verified response' where id='00000000-0000-4000-a000-000000000013';
reset role;
do $$ begin if not exists(select 1 from public.audit_logs where entity_id='00000000-0000-4000-a000-000000000013') then raise exception 'Missing audit';end if;end $$;
select public.create_test_order('00000000-0000-4000-a000-000000000014','00000000-0000-4000-a000-000000000011','{"plate":"B123TST"}','[{"country":"AT","amount_minor":100,"scenario":"success"}]');
update public.orders set payment_session='cs_test_rls' where id='00000000-0000-4000-a000-000000000014';
select public.confirm_test_payment('evt_rls','00000000-0000-4000-a000-000000000014','cs_test_rls','pi_rls',100,'eur','checkout.session.completed');
do $$ begin
 if public.confirm_test_payment('evt_rls','00000000-0000-4000-a000-000000000014','cs_test_rls','pi_rls',100,'eur','checkout.session.completed') then raise exception 'Duplicate event accepted';end if;
 if (select count(*) from public.issuance_jobs j join public.order_items i on i.id=j.item_id where i.order_id='00000000-0000-4000-a000-000000000014')<>1 then raise exception 'Duplicate job';end if;
end $$;
rollback;
