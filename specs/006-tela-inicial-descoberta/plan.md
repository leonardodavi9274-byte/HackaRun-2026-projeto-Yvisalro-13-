# Implementation Plan: Tela inicial e descoberta

**Branch**: 006-tela-inicial-descoberta | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

## Summary

Entregar a tela 05 — Início como experiência pública. A tela agrega categorias, stories, ofertas e carrosséis de um catálogo persistido no Supabase por API pública somente de leitura. O primeiro conteúdo será fictício, persistido e marcado como demonstração, pois o painel de catálogo ainda não existe. A sessão é opcional e só poderá contribuir com preferências quando houver dados autorizados.

## Technical Context

**Language/Version**: React 19.3.1 com JavaScript/JSX; Node.js 24.22.3; TypeScript 7.0.2.

**Primary Dependencies**: Vite 8.3.8, Express 5.3.0 e Supabase JS 2.119.0, já fixados. Sem nova dependência.

**Storage**: PostgreSQL no Supabase. Novas tabelas para shopping, lojas, categorias do catálogo, produtos, ofertas, stories e carrosséis; separadas das categorias de interesse da conta.

**Testing**: Política do projeto sem testes como etapa de conclusão. Não criar nem executar testes. Quickstart registra inicialização e conferência manual futura, sem declarar resultados.

**Target Platform**: Aplicação web responsiva, navegador moderno entre 360 e 1440 px; backend Node.js 24.

**Project Type**: Aplicação web com frontend React e WebAPI Express existentes.

**Performance Goals**: Limitar resposta a 12 categorias, 10 stories, 8 ofertas e 6 carrosséis com até 10 itens cada. Meta inicial da API: até 1 s p95 local com seed de demonstração; não verificada.

**Constraints**: Preservar tecnologias confirmadas e banco único; leitura pública sem escrita; RLS restringe conteúdo publicado e vigente; não expor segredos; conteúdo demo sempre identificado; manter landing de apresentação em / e tornar /inicio público. Sem compras, pagamentos, reserva ou painel de catálogo.

**Scale/Scope**: Um shopping padrão por resposta. Dados de demonstração limitados pelos máximos da API. Escrita de catálogo fica para o painel empresarial futuro.

**Operational Inputs**: Projeto Supabase de desenvolvimento com URL, publishable key e schema aplicado. Sem configuração, mostrar indisponibilidade, sem catálogo simulado no frontend.

## Constitution Check

**Gate inicial:** aprovado. A persistência é necessária à feature e não altera tecnologia, política sem testes ou escopo da vitrine.

| Regra | Aplicação | Gate após design |
| --- | --- | --- |
| I — Descoberta confiável | Identificar loja, preço, estoque, validade e conteúdo demo; não inventar dados. | Aprovado |
| II — Rastreabilidade | Histórias/FRs da spec vinculados a API, UI e entidades; decisões em research.md. | Aprovado |
| III — Identidade e comunicação | GET público via publishable key e RLS; nenhuma chave privilegiada no navegador ou neste leitor. | Aprovado |
| IV — Experiência acessível | Estados independentes, mensagens, teclado, foco e alternativa aos gestos do carrossel. | Aprovado |
| V — Simplicidade | Reutilizar base e HTTP client; um GET agregado; sem serviço ou dependência nova. | Aprovado |
| Tecnologias/segredos | React/JSX, Express/TS, PostgreSQL/Supabase; chaves secret ficam no servidor. | Aprovado |
| Política sem testes | Não gerar nem executar testes; guia não afirma resultados. | Aprovado |
| Entrega | Branch da feature; implementação futura em branch e PR. Sem commit/push/merge. | Aprovado |

**Reavaliação pós-design:** aprovada. As tabelas têm RLS, SELECT público limitado e nenhum grant de escrita para anon/authenticated. O backend usa cliente com publishable key sem sessão de usuário. Seed demo é separado e identificável. Nenhuma exceção constitucional.

## Project Structure

### Documentation (this feature)

~~~text
specs/006-tela-inicial-descoberta/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   └── ui.md
└── checklists/requirements.md
~~~

### Source Code

~~~text
frontend/src/
  app/App.jsx                         liberar /inicio a visitantes
  features/home/
    models/home.js                    modelo e estados do agregado
    repositories/home.repository.js   GET pelo HTTP client existente
    viewmodels/useHomeViewModel.js    carregamento e retry
    views/                            Home, cabeçalho, busca, trilhos, detalhes
  styles/home.css                     estilo isolado
backend/supabase/
  migrations/0015_home_catalog.sql    tabelas, índices, RLS e grants
  seed/home-demo.sql                  registros fictícios com is_demo
backend/src/
  domain/home/home-content.ts
  application/services/home-content.service.ts
  infrastructure/supabase/home-content.repository.ts
  presentation/http/controllers/home.controller.ts
  presentation/http/routes/home.routes.ts
~~~

**Structure Decision**: Estender os workspaces existentes e usar separação domain/application/infrastructure/presentation do backend. Não adicionar roteador, serviço ou cliente externo. A landing em / permanece separada de /inicio.

## Complexity Tracking

Nenhuma violação constitucional.
