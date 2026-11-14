# Configuração do Supabase

Aplicar as migrações SQL em ordem numérica, no SQL Editor de um projeto de desenvolvimento pertencente à equipe. Cada arquivo é executado em transação; registrar os nomes aplicados e não reescrever migrações já executadas. A criação dos arquivos não significa aplicação no serviço.

O esquema app_private não deve constar nos esquemas expostos pela Data API. As funções hy_* são restritas a service_role; todas as tabelas de negócio têm RLS e não concedem DML aos clientes. A API autoriza cada sujeito mesmo usando chave privilegiada.

Configurar e-mail/senha, confirmação habilitada, mínimo 8 caracteres, validade 3600 segundos e reenvio mínimo 60 segundos. Site URL local: http://127.0.0.1:5173. Template de confirmação:

{{ .SiteURL }}/cadastro/confirmar#token_hash={{ .TokenHash }}&type=email

Configurar SMTP próprio para consumidores externos; não desligar confirmação para contornar falta de SMTP. Criar bucket consumer-avatars privado, com image/webp e limite de 5242880 bytes. Não permitir listagem, leitura pública ou upload direto do cliente.

Preencher backend/.env a partir do exemplo, mantendo segredos fora do Git. Termos e Política precisam de conteúdo e destinos reais. Sem configuração completa o cadastro retorna 503, preservando a saúde da base.

Consulte ../../specs/004-cadastro-preferencias/quickstart.md para pré-requisitos. Nenhuma configuração externa foi feita ao criar este documento.
