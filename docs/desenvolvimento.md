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
| Frontend | `http://localhost:5173` |
| WebAPI | `http://127.0.0.1:3000/api/v1` |
| Saúde da WebAPI | `http://127.0.0.1:3000/api/v1/health` |

Os servidores escutam apenas a máquina local. Portas ocupadas devem ser liberadas ou
reconfiguradas; o frontend não troca de porta silenciosamente.

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
use outro terminal com `npm run preview:frontend`. Esse modo não oferece o proxy do Vite;
defina uma URL absoluta em `VITE_API_BASE_URL` antes do build ou forneça um proxy externo.
Se usar a porta 4173, inclua essa origem em `FRONTEND_ORIGIN` no backend.

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
