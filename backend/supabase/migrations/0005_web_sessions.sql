begin;
create table app_private.web_sessions(
 session_hash text primary key,user_id uuid not null references auth.users(id) on delete cascade,
 encrypted_tokens bytea not null,key_version text not null,access_expires_at timestamptz not null,
 expires_at timestamptz not null default now()+interval '7 days',revision bigint not null default 1,
 refresh_lease_owner uuid,refresh_lease_expires_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),revoked_at timestamptz
);
create index on app_private.web_sessions(user_id);
grant all on app_private.web_sessions to service_role;
commit;
