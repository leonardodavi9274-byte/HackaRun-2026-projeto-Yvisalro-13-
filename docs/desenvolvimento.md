# Desenvolvimento local — frontend e WebAPI

A base técnica está em duas pastas: `frontend/` (React/Vite) e `backend/`
(Node.js/TypeScript/Express). O [plano da feature 003](../specs/003-base-webapi-frontend/plan.md)
explica as responsabilidades de cada camada. As funções de produto continuam em planejamento.

## Instalar e iniciar

Com Node.js 24 LTS e npm disponíveis, execute na raiz:

```sh
npm install
npm run dev
```

O comando inicia os dois serviços no mesmo terminal. `Ctrl+C` encerra a execução.
Também é possível usar terminais separados com `npm run dev:backend` e `npm run dev:frontend`.

| Serviço | Endereço local |
| --- | --- |
| Frontend | `http://127.0.0.1:5173` |
| WebAPI | `http://127.0.0.1:3000/api/v1` |
| Saúde da WebAPI | `http://127.0.0.1:3000/api/v1/health` |

Os servidores escutam apenas a máquina local. Portas ocupadas devem ser liberadas ou
reconfiguradas; o frontend não troca de porta silenciosamente.

## Modo demonstração (sem Supabase)

Sem `backend/.env` (ou sem `SUPABASE_URL` e `SUPABASE_SECRET_KEY`), `npm run dev` já abre o sistema
em modo demonstração: a WebAPI serve, em memória, a planta em escala real do Shopping Veredas Douradas
(fictício, Térreo e Praça de Alimentação) com as lojas do protótipo posicionadas, as promoções e
o frontend mostra as 11 telas do protótipo (`docs/imagens/achei/`) com um catálogo fictício.

| Tela | Endereço |
| --- | --- |
| 01 Login | `/entrar` (botão **Preencher** usa a conta fictícia `marina.souza@exemplo.com`) |
| 02–03 Cadastro e preferências | `/cadastro`, `/cadastro/preferencias` |
| 04 Recuperação de senha | `/recuperar-senha` (o código aparece na tela; nenhum e-mail é enviado) |
| 05 Início e 11 Oferta próxima | `/inicio` (a oferta surge após alguns segundos, nunca com rota ativa) |
| 06 Busca | `/buscar?q=fone bluetooth até 300` |
| 07 Stories | `/stories?loja=moda-leve` |
| 08 Desejos e Avise-me | `/desejos` |
| 09–10 Mapa e rota | `/mapa`, `/mapa?loja=pixel-house` |
| Perfil | `/perfil` (interesses, e-mails, sair, restaurar dados) |

Lojas, produtos, preços, estoques, distâncias e contas são fictícios. Contas, desejos e buscas
ficam apenas no `localStorage` do navegador; senhas criadas na demonstração são guardadas como
hash. `VITE_DEMO_MODE=true` força o modo; `VITE_DEMO_MODE=false` o desliga (use em produção).
Abra `http://127.0.0.1:5173`: o Vite escuta só nesse endereço e a API confere a origem.

## Windows sem Node.js instalado

O projeto suporta uma cópia portátil em `.tools/`, ignorada pelo Git. O bootstrap baixa
a versão indicada em `.node-version` do site oficial e confere seu SHA256 antes de extrair:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run dev
```

O parâmetro de execução se limita ao processo PowerShell iniciado; não altera a política
da máquina. A primeira instalação precisa de acesso à internet. O wrapper `npm.ps1`
localiza o Node.js portátil e permite usar os demais comandos npm da raiz:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run build
```

## Configurar o ambiente

Os arquivos `.env` são opcionais. Os padrões iniciam os dois serviços sem Supabase.
Se necessário, copie `backend/.env.example` para `backend/.env` e `frontend/.env.example`
para `frontend/.env`. Reinicie o serviço após alterar suas variáveis.

No backend, configure `SUPABASE_URL` e `SUPABASE_SECRET_KEY` quando houver um projeto
Supabase real. Mantenha a chave apenas no servidor. `.env` e variações locais estão no
`.gitignore`. Apenas `.env.example`, sem credenciais, é versionado.

Para usar as funções de identidade e cadastro, configure também `SUPABASE_PUBLISHABLE_KEY`,
`APP_SECURITY_KEY`, `TERMS_URL` e `PRIVACY_URL` conforme o exemplo e a configuração real
do ambiente. Use um Supabase de desenvolvimento separado da produção quando disponível.
Consulte a [base de execução e publicação](base-execucao-sistema.md) para os requisitos
de acesso por outros computadores e para a configuração futura do ambiente hospedado.

Sem configuração, `database.configured` é `false`. A resposta de saúde sempre identifica
`database.connection` como `not_checked`: a base não abre uma consulta nem cria tabelas.
O middleware de identidade está preparado; login e autorização por empresa ainda precisam
ser implementados junto às rotas de negócio.

## Build e execução de produção local

```sh
npm run build
npm run start:backend
```

Os resultados ficam em `backend/dist/` e `frontend/dist/`. Para visualizar o build web,
use outro terminal com `npm run preview:frontend`. Esse modo não oferece o proxy `/api`
do servidor de desenvolvimento. Os fluxos autenticados atuais exigem um proxy externo
na mesma origem que encaminhe `/api` para a API; apenas definir uma URL absoluta de outra
origem não faz os cookies de sessão serem enviados pelo cliente atual. Ajuste `APP_ORIGIN`
e `FRONTEND_ORIGIN` à origem acessada, inclusive à porta, conforme a configuração usada.

O build é compilação, não execução de testes. Conforme decisão da equipe, esta base
não possui testes automatizados, testes manuais obrigatórios nem scripts de teste.

## O que foi inicializado

- Frontend com View, ViewModel, Model, Repository e cliente HTTP.
- WebAPI com domínio, serviço de aplicação, infraestrutura Supabase e camada HTTP.
- Rotas de saúde e identificação, erros JSON, CORS e cabeçalhos de segurança.
- Scripts npm independentes e execução conjunta por workspaces.
- Adaptador Supabase e middleware de autenticação, sem conexão ou dados reais configurados.

Ainda faltam os fluxos funcionais das 11 telas, as regras de catálogo e empresas,
o esquema do banco, contas, alertas, mapa e publicação. O canvas de design foi preservado.

## Registro desta inicialização

Em 2026-11-13, os builds de frontend e backend foram concluídos. O modo de desenvolvimento
foi iniciado nas portas 5173 e 3000; o frontend respondeu HTTP 200, e a saúde da WebAPI
respondeu `ok` diretamente e pelo proxy do Vite. `database.configured` ficou `false` e
`database.connection`, `not_checked`. Esse registro confirma disponibilidade da base
local, sem comprovar funcionalidades futuras ou conexão com o banco.


## Implementação do cadastro — 2026-11-14

A feature 004 acrescenta as telas /cadastro, /cadastro/preferencias, /cadastro/confirmar,
/entrar, /inicio e /perfil/preferencias, com integração HTTP para identidade, retomada,
interesses, publicidade e foto privada. A página de apresentação da base permanece em /.

Os exemplos de ambiente foram ampliados. Usar http://127.0.0.1:5173 para manter origem e
cookie iguais aos do link de confirmação. O modo preview continua dependendo de proxy
/api de mesma origem para este fluxo autenticado.

Nesta execução, npm run build compilou backend (TypeScript) e frontend (Vite) com sucesso.
Sharp 0.35.5 foi instalado no backend, com versão exata no manifest/lockfile. Não foram
executados testes automatizados ou manuais, nem cenários de cadastro, e-mail ou upload.

O ambiente não contém backend/.env configurado, Docker, psql ou CLI Supabase disponíveis.
A integração Supabase foi localizada como disponível, mas sua instalação/conexão não foi
confirmada. As migrações 0001–0014 foram escritas e revisadas como código; não foram
executadas em PostgreSQL/Supabase. Não houve configuração de SMTP/bucket ou publicação.

Para ativar a integração, usar o [guia da feature](../specs/004-cadastro-preferencias/quickstart.md)
e concluir T070 no [tasks.md](../specs/004-cadastro-preferencias/tasks.md). A ausência dos
serviços reais não é tratada pela aplicação como autenticação ou salvamento bem-sucedido.

## Preparação para autenticação 007

Esta seção descreve a configuração necessária para o futuro funcionamento dos fluxos; ela não afirma que a recuperação ou o login social estejam implementados ou ativados. Antes de habilitá-los, resolver os bloqueios de segurança B1–B3 em [plan.md](../specs/007-autenticacao-supabase/plan.md), inclusive a confirmação adicional antes de vincular contas e a restrição de senha em contas exclusivamente sociais.

Para e-mail transacional, configure no projeto Supabase um [provedor SMTP próprio](https://supabase.com/docs/guides/auth/auth-smtp), remetente e domínio autorizados. No [modelo de recuperação](https://supabase.com/docs/guides/auth/auth-email-templates), inclua o código `{{ .Token }}`; configure seis dígitos, validade de 600 segundos e intervalo mínimo de 60 segundos segundo as opções disponíveis no projeto. A validade de OTP pode afetar também a confirmação de cadastro: reveja o fluxo 004 antes de aplicar. Os limites de tentativas são os do Supabase e o aceite de uma solicitação não comprova entrega ao destinatário. Esses e-mails transacionais não dependem de consentimento publicitário e não configuram campanhas.

Para Google e Apple, prepare as credenciais dos provedores e a lista restrita de URLs de retorno por ambiente conforme os guias oficiais de [Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [Apple](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple) e [URLs de retorno](https://supabase.com/docs/guides/auth/redirect-urls). Planeje a rotação do segredo Apple conforme as exigências do provedor. Guarde credenciais em configurações protegidas dos respectivos serviços, fora do Git; não as coloque em `backend/.env.example` ou no frontend. Ter credenciais configuradas não resolve, por si só, os bloqueios do plano.
