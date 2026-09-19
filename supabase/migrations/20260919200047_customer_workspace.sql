
create table public.journeys (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 80),
 plate text not null check(plate ~ '^[A-Z0-9]{2,12}$'),
 registration_country text not null check(registration_country ~ '^[A-Z]{2}$'),
 destinations jsonb not null check(jsonb_typeof(destinations)='array' and jsonb_array_length(destinations) between 1 and 9 and octet_length(destinations::text)<5000),
 archived_at timestamptz, created_at timestamptz not null default now()
);
create index journeys_owner on public.journeys(user_id,created_at desc);
alter table public.journeys enable row level security;
revoke all on public.journeys from anon,authenticated;
grant select on public.journeys to authenticated;
grant insert(user_id,title,plate,registration_country,destinations) on public.journeys to authenticated;
grant update(title,archived_at) on public.journeys to authenticated;
create policy journeys_select on public.journeys for select to authenticated using ((select auth.uid())=user_id);
create policy journeys_insert on public.journeys for insert to authenticated with check((select auth.uid())=user_id);
create policy journeys_update on public.journeys for update to authenticated using ((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create table public.support_cases (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 subject text not null check(char_length(subject) between 3 and 120),
 message text not null check(char_length(message) between 10 and 4000),
 kind text not null check(kind in ('general','fine','privacy')),
 deadline date, status text not null default 'open' check(status in ('open','reviewing','resolved')),
 created_at timestamptz not null default now()
);
create index support_cases_owner on public.support_cases(user_id,created_at desc);
alter table public.support_cases enable row level security;
revoke all on public.support_cases from anon,authenticated;
grant select on public.support_cases to authenticated;
grant insert(user_id,subject,message,kind,deadline) on public.support_cases to authenticated;
create policy support_select on public.support_cases for select to authenticated using ((select auth.uid())=user_id);
create policy support_insert on public.support_cases for insert to authenticated with check((select auth.uid())=user_id);
create table public.notification_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 expiration_email boolean not null default false, language text not null default 'ro' check(language in ('ro','en','de')),
 consent_version text not null default 'reminders-v1' check(consent_version='reminders-v1'),
 updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
revoke all on public.notification_preferences from anon,authenticated;
grant select on public.notification_preferences to authenticated;
grant insert(user_id,expiration_email,language) on public.notification_preferences to authenticated;
grant update(expiration_email,language) on public.notification_preferences to authenticated;
create policy preferences_select on public.notification_preferences for select to authenticated using ((select auth.uid())=user_id);
create policy preferences_insert on public.notification_preferences for insert to authenticated with check((select auth.uid())=user_id);
create policy preferences_update on public.notification_preferences for update to authenticated using ((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create function public.touch_notification_preferences() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at=now(); return new; end $$;
revoke all on function public.touch_notification_preferences() from public,anon,authenticated;
create trigger preferences_touch before update on public.notification_preferences for each row execute function public.touch_notification_preferences();
comment on table public.journeys is 'Travel plans only: no purchase, toll coverage or issued entitlement.';
comment on table public.support_cases is 'Customer requests; submission does not suspend deadlines or guarantee legal representation.';

