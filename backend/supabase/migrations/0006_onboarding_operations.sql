begin;
create table app_private.onboarding_operations(
 user_id uuid not null references auth.users(id) on delete cascade,mutation_id uuid not null,
 operation text not null check(operation in('initialize','correct','finalize')),
 request_hash text not null,applied_at timestamptz not null default now(),
 primary key(user_id,mutation_id)
);
grant all on app_private.onboarding_operations to service_role;
commit;
