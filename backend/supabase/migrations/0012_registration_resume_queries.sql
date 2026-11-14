begin;
-- Reforça a consulta de retomada sem expor o esquema operacional.
create or replace function public.hy_registration_by_user(p_user uuid) returns jsonb language sql security invoker set search_path='' as $$
 select to_jsonb(i) from app_private.registration_intents i where user_id=p_user;
$$;
do $permissions$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and left(p.proname,3)='hy_' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $permissions$;
commit;
