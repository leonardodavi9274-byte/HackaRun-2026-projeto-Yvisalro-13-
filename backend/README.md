# Hackarum-Yvisalro — WebAPI

WebAPI Node.js/TypeScript/Express 5 com cadastro, confirmação de e-mail, sessão, retomada, interesses, publicidade e avatar privado implementados no código. A integração real depende da aplicação das migrações e configuração do Supabase/SMTP/documentos; veja [guia da feature 004](../specs/004-cadastro-preferencias/quickstart.md).

## Rotas

Todas usam /api/v1, exceto o alias /health. A saúde informa presença de configuração, não conexão verificada.

| Grupo | Rotas |
| --- | --- |
| Base | GET /, GET /health; alias GET /health fora do prefixo |
| Configuração | GET /registration-config, GET /interest-categories |
| Cadastro | POST /auth/registrations, GET /auth/registrations/:registrationId |
| Identidade | POST /auth/email/verify, POST /auth/email/resend |
| Sessão | POST /auth/sessions, GET /auth/session, DELETE /auth/session |
| Conta | GET /me, GET /me/onboarding, POST /me/onboarding/complete |
| Publicidade | PATCH /me/marketing-preference |
| Foto | PUT/DELETE /me/onboarding/avatar, GET /me/avatar |

Sucesso: { data: ... }. Erro: { error: { code, message, requestId, fields?, retryAfterSeconds? } }. Requisições de mutação web exigem Origin permitido e X-App-Request: web. Os cabeçalhos de idempotência e todos os payloads estão no [contrato HTTP](../specs/004-cadastro-preferencias/contracts/api.md).

## Arquitetura

Controllers traduzem HTTP; serviços dependem de portas; domínio valida dados e projeta estados; adaptadores usam Supabase e Sharp. app.ts compõe as dependências. A identidade usa cliente publicável por requisição; o cliente privilegiado nunca recebe sessão de usuário.

A sessão web usa cookie opaco HttpOnly, tokens criptografados no PostgreSQL e renovação serializada. A API valida getUser antes de operações privadas e deriva o proprietário dessa identidade. RLS não substitui autorização: a chave privilegiada do servidor ignora RLS.

Perfil/interesses/consentimento são transacionais; Auth, SMTP e Storage têm confirmações separadas. Repetição não reativa publicidade antiga, recria conta ou associa upload ultrapassado por uma dispensa.

## Executar

Na raiz, com Node.js 24.22.3:

~~~sh
npm ci
npm run dev:backend
npm run build --workspace backend
~~~

No Windows sem Node global, usar scripts/npm.ps1 conforme [desenvolvimento](../docs/desenvolvimento.md). start:backend depende do build; não disputar a porta 3000 com desenvolvimento.

## Configuração

Copiar .env.example para .env e preencher as entradas reais. Nunca versionar chaves ou usar VITE_* para segredos. APP_SECURITY_KEY representa 32 bytes em base64 e não possui fallback inseguro.

[Migrações e preparação](supabase/README.md): aplicar 0001–0014 em ordem no projeto da equipe, configurar Auth e SMTP, criar bucket consumer-avatars privado e informar URLs reais de Termos/Política.

Sem configuração, a saúde continua disponível e operações dependentes retornam indisponibilidade. A feature 010 acrescenta código para catálogo de demonstração e busca; ele depende das migrações e do corte coordenado. Autorização empresarial, recuperação completa, provedores sociais e campanhas continuam fora deste recorte.

## Catálogo de demonstração

GETs públicos em `/api/v1/catalog`: `/categories`, `/offers`, `/products/:id`, `/offers/:id`, `/variants/:id` e `/variants/:id/similar`. Filtros, erros e estados estão no [contrato](../specs/010-busca-comparacao-produtos/contracts/api.md). A fonte de promoções passa ao mesmo catálogo canônico; a ativação depende da [transição coordenada](../docs/migracao-catalogo-promocoes.md). Nenhuma migração remota foi aplicada nesta implementação.

Build de backend concluído em 2026-11-14. Não foram executados testes, cadastros, migrações remotas ou envios reais nesta execução.
