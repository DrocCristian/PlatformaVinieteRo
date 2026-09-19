create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (char_length(display_name) <= 80),
 created_at timestamptz not null default now()
);
create table public.vehicles (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plate text not null check (plate ~ '^[A-Z0-9]{2,12}$'),
 registration_country text not null check (registration_country in ('RO','AT','HU','BG','CZ','SK','SI','CH','MD','DE','FR','IT')),
 label text not null default '' check (char_length(label) <= 60),
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 unique(user_id, registration_country, plate)
);
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
revoke all on public.profiles, public.vehicles from anon, authenticated;
grant select on public.profiles, public.vehicles to authenticated;
grant insert (id, display_name) on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant insert (user_id, plate, registration_country, label) on public.vehicles to authenticated;
grant update (label, archived_at) on public.vehicles to authenticated;
create policy profiles_select on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy vehicles_select on public.vehicles for select to authenticated using ((select auth.uid()) = user_id);
create policy vehicles_insert on public.vehicles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy vehicles_update on public.vehicles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
comment on table public.vehicles is 'Saved vehicles only. Plate syntax is not legal or product eligibility validation. Archive preserves records; no customer DELETE permission.';
