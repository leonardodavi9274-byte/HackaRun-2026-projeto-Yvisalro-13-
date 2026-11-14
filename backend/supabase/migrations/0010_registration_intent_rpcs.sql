begin;
create function public.hy_registration_create(p_id uuid,p_token text,p_proof text,p_email text,p_hash text,p_snapshot jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare i app_private.registration_intents;
begin
 select * into i from app_private.registration_intents where id=p_id for update;
 if found then
  if i.request_token_hash<>p_token then raise exception 'REGISTRATION_PROOF_INVALID';end if;
  if i.capability_expires_at<=now() then raise exception 'REGISTRATION_PROOF_EXPIRED';end if;
  if i.request_hash<>p_hash then raise exception 'IDEMPOTENCY_CONFLICT';end if;
  return to_jsonb(i);
 end if;
 perform app_private.validate_snapshot(p_snapshot);
 insert into app_private.registration_intents(id,request_token_hash,binding_proof_hash,normalized_email,request_hash,snapshot,photo_state)
 values(p_id,p_token,p_proof,p_email,p_hash,p_snapshot,case when (p_snapshot->>'photoRequested')::boolean then 'awaiting_upload' else 'not_requested' end) on conflict(id) do nothing;
 select * into i from app_private.registration_intents where id=p_id for update;
 if i.request_token_hash<>p_token then raise exception 'REGISTRATION_PROOF_INVALID';end if;
 if i.capability_expires_at<=now() then raise exception 'REGISTRATION_PROOF_EXPIRED';end if;
 if i.request_hash<>p_hash then raise exception 'IDEMPOTENCY_CONFLICT';end if;
 return to_jsonb(i);
end;$$;
create function public.hy_registration_by_id(p_id uuid,p_token text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i app_private.registration_intents;
begin select * into i from app_private.registration_intents where id=p_id;
 if not found or i.request_token_hash<>p_token then raise exception 'REGISTRATION_PROOF_INVALID';end if;
 if i.capability_expires_at<=now() then raise exception 'REGISTRATION_PROOF_EXPIRED';end if;return to_jsonb(i)-array['snapshot','normalized_email','request_token_hash','binding_proof_hash','request_hash'];end;$;
create function public.hy_registration_by_user(p_user uuid) returns jsonb language sql security invoker set search_path='' as $$
 select to_jsonb(i) from app_private.registration_intents i where user_id=p_user;
$$;
create function public.hy_registration_claim(p_id uuid,p_owner uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i app_private.registration_intents;begin
 update app_private.registration_intents set identity_state='in_flight',lease_owner=p_owner,lease_expires_at=now()+interval '30 seconds',updated_at=now()
 where id=p_id and user_id is null and (lease_expires_at is null or lease_expires_at<now()) returning * into i;
 if not found then return null;end if;return to_jsonb(i);
end;$$;
create function public.hy_registration_finish(p_id uuid,p_owner uuid,p_state text,p_dispatch text) returns void language sql security invoker set search_path='' as $$
 update app_private.registration_intents set identity_state=case when user_id is null then p_state else 'bound' end,email_dispatch_state=p_dispatch,lease_expires_at=now(),updated_at=now()
 where id=p_id and lease_owner=p_owner;
$$;
do $permissions$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and left(p.proname,3)='hy_' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $permissions$;
commit;
