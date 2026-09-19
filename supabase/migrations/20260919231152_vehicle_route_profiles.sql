-- Additive customer drafts; no quote, entitlement, or payment authority.
alter table public.vehicles add column technical jsonb
 check(technical is null or (jsonb_typeof(technical)='object' and octet_length(technical::text)<=5000));
grant insert(technical) on public.vehicles to authenticated;
grant update(plate,registration_country,technical) on public.vehicles to authenticated;
alter table public.journeys add column route_request jsonb
 check(route_request is null or (jsonb_typeof(route_request)='object' and octet_length(route_request::text)<=2000));
alter table public.journeys add column vehicle_snapshot jsonb
 check(vehicle_snapshot is null or (jsonb_typeof(vehicle_snapshot)='object' and octet_length(vehicle_snapshot::text)<=6000));
alter table public.journeys drop constraint journeys_destinations_check;
alter table public.journeys add constraint journeys_destinations_check check(
 jsonb_typeof(destinations)='array' and jsonb_array_length(destinations)<=9 and octet_length(destinations::text)<5000
 and (jsonb_array_length(destinations)>=1 or route_request is not null));
grant insert(route_request,vehicle_snapshot) on public.journeys to authenticated;
comment on column public.vehicles.technical is 'Unverified owner-provided registration details. Validate using technicalSchema on every consumption; never a legal or pricing authority.';
comment on column public.journeys.route_request is 'Ungeocoded origin/destination and trip dates. No automatic route or coverage is implied.';
comment on column public.journeys.vehicle_snapshot is 'Unverified draft vehicle data captured at save time. Revalidate before routing or quoting.';
