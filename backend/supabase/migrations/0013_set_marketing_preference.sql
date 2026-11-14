begin;
create function public.hy_set_marketing(p_user uuid,p_mutation uuid,p_allowed boolean,p_notice text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare m public.marketing_preferences; old public.marketing_consent_events; h text; eid uuid; replay boolean:=false;
begin
 if p_notice is distinct from 'marketing-email-v1' then raise exception 'NOTICE_VERSION_CHANGED';end if;
 if p_allowed is null then raise exception 'VALIDATION_ERROR';end if;
 select * into m from public.marketing_preferences where user_id=p_user for update;
 if not found then raise exception 'PROFILE_PENDING';end if;
 h:=encode(sha256(convert_to(jsonb_build_object('allowed',p_allowed,'noticeVersion',p_notice)::text,'UTF8')),'hex');
 select * into old from public.marketing_consent_events where user_id=p_user and mutation_id=p_mutation;
 if found then
  if old.payload_hash<>h then raise exception 'IDEMPOTENCY_CONFLICT';end if;replay:=true;
 else
  eid:=pg_catalog.gen_random_uuid();
  insert into public.marketing_consent_events(id,user_id,allowed,source,notice_version,mutation_id,payload_hash) values(eid,p_user,p_allowed,'account_preferences',p_notice,p_mutation,h);
  update public.marketing_preferences set allowed=p_allowed,revision=revision+1,changed_at=now(),last_event_id=eid where user_id=p_user returning * into m;
 end if;
 return jsonb_build_object('marketing',jsonb_build_object('allowed',m.allowed,'revision',m.revision,'changedAt',m.changed_at,'noticeVersion',p_notice),'receipt',jsonb_build_object('mutationId',p_mutation,'replayed',replay,'superseded',false));
end;$$;
do $permissions$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and left(p.proname,3)='hy_' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $permissions$;
commit;
