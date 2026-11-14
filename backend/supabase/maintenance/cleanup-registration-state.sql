-- Executar manualmente com acesso administrativo no projeto da equipe.
-- Não remove identidades Auth nem snapshots pendentes de usuários vinculados.
begin;
update app_private.registration_intents set snapshot=null where data_state='saved' and snapshot is not null;
delete from app_private.registration_intents where user_id is null and capability_expires_at<now() and coalesce(lease_expires_at,'-infinity'::timestamptz)<now();
delete from app_private.web_sessions where expires_at<now() or revoked_at<now()-interval '1 day';
commit;
