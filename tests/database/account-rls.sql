begin;
insert into auth.users (id,email) values ('00000000-0000-4000-a000-000000000001','rls-a@example.invalid'),('00000000-0000-4000-a000-000000000002','rls-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000001","role":"authenticated"}',true);
insert into public.profiles (id,display_name) values ('00000000-0000-4000-a000-000000000001','Test A');
insert into public.vehicles (user_id,plate,registration_country,label) values ('00000000-0000-4000-a000-000000000001','TESTA123','RO','RLS test');
do $$ begin
 if (select count(*) from public.vehicles) <> 1 then raise exception 'Owner cannot read vehicle'; end if;
 begin
 insert into public.vehicles(user_id,plate,registration_country) values('00000000-0000-4000-a000-000000000002','BAD123','RO');
 raise exception 'Cross-owner INSERT allowed';
 exception when insufficient_privilege then null; end;
 begin
 update public.vehicles set user_id='00000000-0000-4000-a000-000000000002';
 raise exception 'Owner reassignment allowed';
 exception when insufficient_privilege then null; end;
end $$;
update public.vehicles set archived_at=now() where plate='TESTA123';
update public.vehicles set archived_at=null where plate='TESTA123';
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000002","role":"authenticated"}',true);
do $$ declare affected integer; begin
 if (select count(*) from public.vehicles) <> 0 then raise exception 'Cross-owner SELECT allowed'; end if;
 if (select count(*) from public.profiles) <> 0 then raise exception 'Cross-owner profile SELECT allowed'; end if;
 update public.vehicles set label='Unauthorized'; get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'Cross-owner UPDATE allowed'; end if;
 begin
 insert into public.profiles(id,display_name) values('00000000-0000-4000-a000-000000000001','Bad');
 raise exception 'Cross-owner profile INSERT allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
 begin perform * from public.vehicles; raise exception 'Anonymous SELECT allowed'; exception when insufficient_privilege then null; end;
 begin perform * from public.profiles; raise exception 'Anonymous profile SELECT allowed'; exception when insufficient_privilege then null; end;
end $$;
rollback;