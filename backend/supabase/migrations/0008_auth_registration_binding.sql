begin;
create function app_private.bind_registration() returns trigger language plpgsql security definer set search_path='' as $$
declare i app_private.registration_intents; rid text:=new.raw_user_meta_data->>'registration_id'; proof text:=new.raw_user_meta_data->>'registration_proof';
begin
 if rid is null then return new;end if;
 select * into i from app_private.registration_intents where id=rid::uuid for update;
 if not found or i.user_id is not null or i.capability_expires_at<=now() or i.normalized_email<>lower(app_private.app_trim(new.email)) or proof is null
 or i.binding_proof_hash<>pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(proof,'UTF8')),'hex') then raise exception 'INVALID_REGISTRATION_BINDING';end if;
 update app_private.registration_intents set user_id=new.id,identity_state='bound',updated_at=now() where id=i.id;
 return new;
end;$$;
revoke all on function app_private.bind_registration() from public,anon,authenticated,service_role;
create trigger hy_bind_registration after insert on auth.users for each row execute function app_private.bind_registration();
commit;
