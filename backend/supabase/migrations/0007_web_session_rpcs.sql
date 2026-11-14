begin;
create function public.hy_create_session(p_hash text,p_user uuid,p_tokens text,p_expires bigint) returns void
language sql security invoker set search_path='' as $$
 insert into app_private.web_sessions(session_hash,user_id,encrypted_tokens,key_version,access_expires_at) values(p_hash,p_user,p_tokens::bytea,'v1',to_timestamp(p_expires));
$$;
create function public.hy_get_session(p_hash text) returns jsonb language sql security invoker set search_path='' as $$
 select to_jsonb(s) from app_private.web_sessions s where session_hash=p_hash and revoked_at is null and expires_at>now();
$$;
create function public.hy_claim_session(p_hash text,p_owner uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare s app_private.web_sessions;begin
 update app_private.web_sessions set refresh_lease_owner=p_owner,refresh_lease_expires_at=now()+interval '30 seconds'
 where session_hash=p_hash and revoked_at is null and expires_at>now() and (refresh_lease_expires_at is null or refresh_lease_expires_at<now()) returning * into s;
 if not found then return null;end if;return to_jsonb(s);end;
$$;
create function public.hy_rotate_session(p_hash text,p_owner uuid,p_revision bigint,p_tokens text,p_expires bigint) returns boolean language plpgsql security invoker set search_path='' as $$
begin update app_private.web_sessions set encrypted_tokens=p_tokens::bytea,access_expires_at=to_timestamp(p_expires),revision=revision+1,updated_at=now(),refresh_lease_owner=null,refresh_lease_expires_at=null
 where session_hash=p_hash and revision=p_revision and refresh_lease_owner=p_owner and refresh_lease_expires_at>now() and revoked_at is null and expires_at>now();
 return found;end;
$$;
create function public.hy_revoke_session(p_hash text) returns void language sql security invoker set search_path='' as $$
 update app_private.web_sessions set revoked_at=now(),updated_at=now() where session_hash=p_hash;
$$;
do $permissions$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and left(p.proname,3)='hy_' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $permissions$;
commit;
