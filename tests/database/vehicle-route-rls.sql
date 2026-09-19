begin;
insert into auth.users(id,email) values
('00000000-0000-4000-a000-000000000101','route-a@example.invalid'),
('00000000-0000-4000-a000-000000000102','route-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000101","role":"authenticated"}',true);
insert into public.vehicles(user_id,plate,registration_country,technical) values
('00000000-0000-4000-a000-000000000101','ROUTETEST','RO','{"kind":"car","f1":3500}');
update public.vehicles set technical='{"kind":"goods","f1":7500}',plate='ROUTENEW' where plate='ROUTETEST';
insert into public.journeys(user_id,title,plate,registration_country,destinations,route_request,vehicle_snapshot) values
('00000000-0000-4000-a000-000000000101','Route test','ROUTENEW','RO','[]','{"origin":"Cluj","destination":"Viena","departure":"2099-01-01","returnDate":"2099-01-02"}','{"technical":{"f1":7500}}');
do $$ begin
 if (select count(*) from public.vehicles where plate='ROUTENEW' and technical->>'f1'='7500')<>1 then raise exception 'Profile save failed';end if;
 if (select count(*) from public.journeys where title='Route test')<>1 then raise exception 'Route save failed';end if;
 begin
 update public.vehicles set technical='[]';raise exception 'Invalid JSON accepted';
 exception when check_violation then null;end;
 begin
 insert into public.journeys(user_id,title,plate,registration_country,destinations) values('00000000-0000-4000-a000-000000000101','Empty','ROUTENEW','RO','[]');
 raise exception 'Empty legacy journey accepted';exception when check_violation then null;end;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000102","role":"authenticated"}',true);
do $$ declare affected integer;begin
 if (select count(*) from public.vehicles)<>0 then raise exception 'Cross-owner vehicle read';end if;
 if (select count(*) from public.journeys)<>0 then raise exception 'Cross-owner route read';end if;
 update public.vehicles set technical='{}';get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Cross-owner technical update';end if;
 begin
 insert into public.journeys(user_id,title,plate,registration_country,destinations,route_request) values('00000000-0000-4000-a000-000000000101','Forbidden','TEST123','RO','[]','{}');
 raise exception 'Cross-owner route insert';exception when insufficient_privilege then null;end;
end $$;
set local role anon;
do $$ begin
 begin perform technical from public.vehicles;raise exception 'Anonymous profile read';exception when insufficient_privilege then null;end;
 begin perform route_request from public.journeys;raise exception 'Anonymous route read';exception when insufficient_privilege then null;end;
end $$;
rollback;
