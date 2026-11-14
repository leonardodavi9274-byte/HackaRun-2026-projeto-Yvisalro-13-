begin;
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to service_role;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create or replace function app_private.app_trim(v text) returns text
language sql immutable strict set search_path='' as $$
 select btrim(v, U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
$$;
revoke all on function app_private.app_trim(text) from public,anon,authenticated;
grant execute on function app_private.app_trim(text) to service_role;
create table public.consumer_profiles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(display_name=app_private.app_trim(display_name) and char_length(display_name) between 2 and 100),
 photo_object_path text, onboarding_completed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.consumer_profiles enable row level security;
revoke all on public.consumer_profiles from anon,authenticated;
grant all on public.consumer_profiles to service_role;
commit;
