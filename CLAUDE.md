# CLAUDE.md

Orientações para o Claude Code neste repositório. Responda e documente em **português (pt-BR)**.

## Projeto

**Hackarum-Yvisalro** — vitrine de produtos, lojas e promoções de um shopping (tema 03),
com trajetos internos simulados. Nomes antigos: **Achei** (imagens) e **Vitrine Perto**
(caminhos em `specs/001-*`). Compras e pagamentos ficam fora do app.

- `frontend/` — React 19 + Vite 8, JavaScript (JSX). MVVM por feature em
  `src/features/<feature>/{models,repositories,viewmodels,views}`; componentes comuns em
  `src/shared/`. Proxy `/api` → `http://127.0.0.1:3000`.
- `backend/` — Node.js 24 + TypeScript 7 + Express 5, executado direto com `node` (type
  stripping: use apenas sintaxe apagável, imports relativos com extensão `.ts`).
  Camadas: `domain/` → `application/{ports,services}` → `infrastructure/` (Supabase, sharp,
  sessões) → `presentation/http/` (rotas, controllers, middlewares). Rotas em `/api/v1`.
- `backend/supabase/migrations/` — SQL numerado sequencialmente (`00NN_*.sql`); ainda não
  executado em banco real.
- `specs/NNN-*/` — artefatos Spec Kit (spec, plan, tasks, contracts) de cada feature.
- `docs/` — documentação do produto e de desenvolvimento.

## Comandos

O Node.js **não está no PATH** desta máquina; use o wrapper com o Node portátil de `.tools/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run build   # compila backend + frontend
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run dev     # API :3000 + web :5173
```

Com Node 24 no PATH, os equivalentes são `npm run build` / `npm run dev`.
Se `.tools/` não existir, rode `scripts/bootstrap.ps1`. Não há linter nem scripts de teste.
`npm run build` é a verificação disponível (o `tsc` do backend usa `noEmitOnError`).

## Regras do projeto (resumo da constituição)

A fonte de verdade é [.specify/memory/constitution.md](.specify/memory/constitution.md). Pontos essenciais:

- **Sem testes**: a equipe decidiu não ter testes automatizados nem manuais obrigatórios.
  Não crie testes nem afirme que cenários foram verificados se não foram executados.
- **Rastreabilidade**: só implemente o que estiver nos requisitos da spec da feature;
  registre decisões e divergências no artefato correspondente.
- **Segurança**: chaves Supabase privilegiadas (`SUPABASE_SECRET_KEY`) só no backend;
  nunca leia nem versione arquivos `.env` (apenas `.env.example`). Autorização na API.
- **UX**: estados de carregamento/vazio/erro/sem conexão; ícones acionáveis com rótulo
  acessível; nada comunicado só por cor. Não confirmar envio/salvamento antes do serviço.
- **Simplicidade**: não adicionar serviços, camadas ou dependências sem finalidade no plano.
  Dependências com versão exata.
- **Relato honesto**: ao concluir, diga o que mudou, o que ficou pendente e as limitações.

## Fluxo de trabalho (Spec Kit)

Skills disponíveis como slash commands: `/speckit-specify` → `/speckit-clarify` →
`/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`
(também `/speckit-checklist`, `/speckit-converge`, `/speckit-constitution`).
Os scripts são PowerShell (`.specify/scripts/powershell/`). Branches de feature seguem
`NNN-nome` (numeração sequencial); integração na `main` via pull request.

O Codex continua configurado (`.agents/skills/`); as cópias para Claude ficam em
`.claude/skills/`. Para atualizar os skills: `specify integration upgrade claude`.
