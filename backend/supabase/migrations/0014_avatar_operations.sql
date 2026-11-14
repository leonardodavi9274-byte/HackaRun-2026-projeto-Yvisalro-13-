begin;
create table app_private.avatar_operations(
 user_id uuid not null references auth.users(id) on delete cascade,mutation_id uuid not null,
 operation_kind text not null check(operation_kind in('upload','waive')),request_hash text not null,
 claimed_photo_revision bigint not null,raw_digest text,output_digest text,object_path text,
 state text not null check(state in('pending','uploaded','associated','waived','superseded')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 primary key(user_id,mutation_id),
 check((operation_kind='waive' and raw_digest is null and output_digest is null and object_path is null) or (operation_kind='upload' and raw_digest is not null and object_path is not null))
);
grant all on app_private.avatar_operations to service_role;
create function public.hy_avatar_claim(p_user uuid,p_mutation uuid,p_kind text,p_digest text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i app_private.registration_intents; a app_private.avatar_operations; p public.consumer_profiles; h text;
begin
 select * into i from app_private.registration_intents where user_id=p_user for update;
 if not found then raise exception 'PROFILE_PENDING';end if;
 select * into p from public.consumer_profiles where user_id=p_user for update;
 if not found or i.data_state<>'saved' then raise exception 'PROFILE_PENDING';end if;
 if p_kind not in('upload','waive') or (p_kind='upload' and (p_digest is null or p_digest!~'^[0-9a-f]{64}$')) or (p_kind='waive' and p_digest is not null) then raise exception 'VALIDATION_ERROR';end if;
 h:=encode(sha256(convert_to(p_kind||':'||coalesce(p_digest,''),'UTF8')),'hex');
 select * into a from app_private.avatar_operations where user_id=p_user and mutation_id=p_mutation;
 if found then
  if a.request_hash<>h then raise exception 'IDEMPOTENCY_CONFLICT';end if;
  if a.mutation_id is distinct from i.latest_photo_mutation_id then
   update app_private.avatar_operations set state='superseded',updated_at=now() where user_id=p_user and mutation_id=p_mutation returning * into a;
  end if;
  return to_jsonb(a);
 end if;
 if p.onboarding_completed_at is not null then raise exception 'ONBOARDING_ALREADY_COMPLETED';end if;
 update app_private.registration_intents set photo_revision=photo_revision+1,latest_photo_mutation_id=p_mutation,photo_state=case when p_kind='upload' then 'awaiting_upload' else photo_state end,updated_at=now() where id=i.id returning * into i;
 insert into app_private.avatar_operations(user_id,mutation_id,operation_kind,request_hash,claimed_photo_revision,raw_digest,object_path,state)
 values(p_user,p_mutation,p_kind,h,i.photo_revision,p_digest,case when p_kind='upload' then p_user::text||'/'||p_mutation::text||'.webp' end,'pending') returning * into a;
 return to_jsonb(a);
end;$$;
create function public.hy_avatar_uploaded(p_user uuid,p_mutation uuid,p_digest text) returns void language plpgsql security invoker set search_path='' as $$
begin
 update app_private.avatar_operations set state='uploaded',output_digest=p_digest,updated_at=now() where user_id=p_user and mutation_id=p_mutation and operation_kind='upload' and state in('pending','uploaded');
end;$$;
create function public.hy_avatar_finish(p_user uuid,p_mutation uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i app_private.registration_intents; a app_private.avatar_operations; p public.consumer_profiles; replay boolean:=false; superseded boolean:=false;
begin
 select * into i from app_private.registration_intents where user_id=p_user for update;
 select * into p from public.consumer_profiles where user_id=p_user for update;
 select * into a from app_private.avatar_operations where user_id=p_user and mutation_id=p_mutation for update;
 if a.user_id is null or i.user_id is null or p.user_id is null then raise exception 'PROFILE_PENDING';end if;
 replay:=a.state in('associated','waived');
 if a.state='superseded' or i.latest_photo_mutation_id is distinct from p_mutation or (p.onboarding_completed_at is not null and not replay) then
  superseded:=true;
  update app_private.avatar_operations set state='superseded',updated_at=now() where user_id=p_user and mutation_id=p_mutation;
 elsif not replay then
  if a.claimed_photo_revision<>i.photo_revision then raise exception 'IDEMPOTENCY_CONFLICT';end if;
  if a.operation_kind='upload' and (a.state<>'uploaded' or a.output_digest is null) then raise exception 'VALIDATION_ERROR';end if;
  update public.consumer_profiles set photo_object_path=case when a.operation_kind='upload' then a.object_path end,
   onboarding_completed_at=coalesce(onboarding_completed_at,now()),updated_at=now() where user_id=p_user;
  update app_private.registration_intents set photo_state=case when a.operation_kind='upload' then 'saved' else 'waived' end,updated_at=now() where id=i.id;
  update app_private.avatar_operations set state=case when a.operation_kind='upload' then 'associated' else 'waived' end,updated_at=now() where user_id=p_user and mutation_id=p_mutation;
 end if;
 return jsonb_build_object('mutationId',p_mutation,'replayed',replay,'superseded',superseded);
end;$$;
create function public.hy_avatar_path(p_user uuid) returns text language sql security invoker set search_path='' as $$
 select photo_object_path from public.consumer_profiles where user_id=p_user;
$$;
do $permissions$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and left(p.proname,3)='hy_' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $permissions$;
commit;
