# Configuração do Supabase

Aplicar as migrações SQL em ordem numérica, no SQL Editor de um projeto de desenvolvimento pertencente à equipe. Cada arquivo é executado em transação; registrar os nomes aplicados e não reescrever migrações já executadas. A criação dos arquivos não significa aplicação no serviço.

O esquema app_private não deve constar nos esquemas expostos pela Data API. As funções hy_* são restritas a service_role; todas as tabelas de negócio têm RLS e não concedem DML aos clientes. A API autoriza cada sujeito mesmo usando chave privilegiada.

Configurar e-mail/senha, confirmação habilitada, mínimo 8 caracteres, validade 3600 segundos e reenvio mínimo 60 segundos. Site URL local: http://127.0.0.1:5173. Template de confirmação:

{{ .SiteURL }}/cadastro/confirmar#token_hash={{ .TokenHash }}&type=email

Configurar SMTP próprio para consumidores externos; não desligar confirmação para contornar falta de SMTP. Criar bucket consumer-avatars privado, com image/webp e limite de 5242880 bytes. Não permitir listagem, leitura pública ou upload direto do cliente.

Preencher backend/.env a partir do exemplo, mantendo segredos fora do Git. Termos e Política precisam de conteúdo e destinos reais. Sem configuração completa o cadastro retorna 503, preservando a saúde da base.

Consulte ../../specs/004-cadastro-preferencias/quickstart.md para pré-requisitos. Nenhuma configuração externa foi feita ao criar este documento.


## Ordem das migrações e manutenção

0001–0006 definem tabelas e restrições; 0007 define sessões; 0008 vincula a identidade Auth;
0009–0010 inicializam perfil/intenção; 0011–0012 suportam retomada; 0013 altera publicidade;
0014 registra e associa avatar com revisão. Aplicar todos antes de liberar a feature.

O script maintenance/cleanup-registration-state.sql é manual: limpa snapshots confirmados,
intenções não vinculadas expiradas e sessões vencidas/revogadas. Não apaga identidades nem
rascunhos pendentes vinculados à conta.

Para objetos órfãos, identificar operações superseded ou não vigentes, conferir que nenhum
consumer_profiles.photo_object_path ou operação ainda retomável referencia o objeto e então
remover pela API Storage administrativa. Nunca apagar linhas de storage.objects diretamente
ou remover foto vigente. Não executar limpeza automática junto ao cadastro/upload.

Em 2026-11-14, o código e os arquivos SQL foram preparados; nenhum projeto remoto recebeu
essas migrações nesta execução. Os scripts SQL não foram executados contra PostgreSQL/Supabase.
