begin;
create table public.marketing_consent_events(
 id uuid primary key, user_id uuid not null references public.consumer_profiles on delete cascade,
 allowed boolean not null,recorded_at timestamptz not null default now(),
 source text not null check(source in('registration','onboarding_resume','account_preferences')),
 notice_version text not null check(notice_version='marketing-email-v1'),mutation_id uuid not null,
 payload_hash text not null,unique(user_id,mutation_id)
);
create table public.marketing_preferences(
 user_id uuid primary key references public.consumer_profiles on delete cascade,
 allowed boolean not null default false,revision bigint not null check(revision>0),
 changed_at timestamptz not null default now(),last_event_id uuid not null references public.marketing_consent_events
);
alter table public.marketing_preferences enable row level security;
alter table public.marketing_consent_events enable row level security;
revoke all on public.marketing_preferences,public.marketing_consent_events from anon,authenticated;
grant all on public.marketing_preferences,public.marketing_consent_events to service_role;
commit;
