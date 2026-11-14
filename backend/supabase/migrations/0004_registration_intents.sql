begin;
create table app_private.registration_intents(
 id uuid primary key,request_token_hash text not null,binding_proof_hash text not null,
 normalized_email text not null check(normalized_email=lower(app_private.app_trim(normalized_email)) and length(normalized_email)<=254),
 request_hash text not null,snapshot jsonb,
 user_id uuid unique references auth.users(id) on delete cascade,
 identity_state text not null default 'not_started' check(identity_state in('not_started','in_flight','unknown','bound','not_created')),
 data_state text not null default 'pending' check(data_state in('pending','saved')),
 photo_state text not null check(photo_state in('not_requested','awaiting_upload','saved','waived')),
 photo_revision bigint not null default 0,latest_photo_mutation_id uuid,
 email_dispatch_state text not null default 'not_requested' check(email_dispatch_state in('not_requested','accepted','failed','unknown')),
 lease_owner uuid,lease_expires_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 capability_expires_at timestamptz not null default now()+interval '24 hours'
);
grant all on app_private.registration_intents to service_role;
commit;
