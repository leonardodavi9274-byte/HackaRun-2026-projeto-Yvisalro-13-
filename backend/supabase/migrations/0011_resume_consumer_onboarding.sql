begin;
-- Evolve a transação sem reescrever migrações já aplicadas.
create or replace function public.hy_initialize_onboarding(p_user uuid,p_mutation uuid,p_input jsonb,p_actor uuid,p_bootstrap_owner uuid,p_finalize boolean) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare i app_private.registration_intents; old app_private.onboarding_operations; v jsonb; h text; eid uuid; replay boolean:=false;
begin
 select * into i from app_private.registration_intents where user_id=p_user for update;
 if not found then raise exception 'UNAUTHENTICATED';end if;
 if p_actor is distinct from p_user then
  if not coalesce(p_actor is null and p_bootstrap_owner is not null and p_bootstrap_owner=i.lease_owner and i.lease_expires_at>now(),false) then raise exception 'UNAUTHENTICATED';end if;
 end if;
 h:=pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(coalesce(p_input,'{}'::jsonb)::text,'UTF8')),'hex');
 select * into old from app_private.onboarding_operations where user_id=p_user and mutation_id=p_mutation;
 if found then
  if old.request_hash<>h then raise exception 'IDEMPOTENCY_CONFLICT';end if; replay:=true;
 else
  if i.data_state='saved' and p_input is not null then raise exception 'ONBOARDING_ALREADY_SAVED';end if;
  if i.data_state<>'saved' then
   v:=coalesce(p_input,i.snapshot);perform app_private.validate_snapshot(v);
   insert into public.consumer_profiles(user_id,display_name) values(p_user,app_private.app_trim(v->>'name'));
   insert into public.consumer_category_interests(user_id,category_id) select p_user,x from jsonb_array_elements_text(v->'categoryIds') x;
   insert into public.consumer_product_interests(user_id,position,term) select p_user,n::smallint,app_private.app_trim(x) from jsonb_array_elements_text(v->'productInterests') with ordinality a(x,n);
   eid:=pg_catalog.gen_random_uuid();
   insert into public.marketing_consent_events(id,user_id,allowed,source,notice_version,mutation_id,payload_hash) values(eid,p_user,(v->'marketing'->>'allowed')::boolean,case when p_actor is null then 'registration' else 'onboarding_resume' end,'marketing-email-v1',p_mutation,h);
   insert into public.marketing_preferences(user_id,allowed,revision,last_event_id) values(p_user,(v->'marketing'->>'allowed')::boolean,1,eid);
   update app_private.registration_intents set data_state='saved',snapshot=null,updated_at=now() where id=i.id;
  end if;
  insert into app_private.onboarding_operations(user_id,mutation_id,operation,request_hash) values(p_user,p_mutation,case when i.data_state='saved' then 'finalize' when p_input is null then 'initialize' else 'correct' end,h);
 end if;
 if p_finalize and p_actor=p_user and i.photo_state in('not_requested','saved','waived') then
  update public.consumer_profiles set onboarding_completed_at=coalesce(onboarding_completed_at,now()),updated_at=now() where user_id=p_user;
 end if;
 return jsonb_build_object('mutationId',p_mutation,'replayed',replay,'superseded',false);
end;$$;
do $permissions$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and left(p.proname,3)='hy_' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $permissions$;
commit;
