# Implementation Plan: Mapa do shopping, lojas próximas e trajeto simulado

**Branch Git atual**: `004-cadastro` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Identificador do workflow**: `005-mapa-rota-lojas`. O `setup-plan` retornou esse valor em BRANCH a partir do `.specify/feature.json`; nenhuma branch foi criada ou trocada. A implementação deve ocorrer em branch própria a partir da `main` atualizada.

**Input**: [specs/005-mapa-rota-lojas/spec.md](spec.md), com as três decisões registradas em Clarifications (2026-11-14).

## Summary

Entregar a aba **Mapa** das telas 09 e 10: mapa interno de um único shopping, com pisos, marcadores de sacola (logo opcional com zoom), busca e lista textual de lojas, ponto de partida escolhido pela pessoa e trajeto simulado passo a passo, inclusive entre pisos. A geolocalização do dispositivo só informa se a pessoa está no shopping, e a posição nunca sai do navegador.

Shopping, versões do mapa e lojas de demonstração ficam no PostgreSQL do Supabase. O desenho do mapa é um documento JSON versionado, em metros, servido por um único endpoint público `GET /api/v1/mall`. Desenho (SVG), busca de caminho (Dijkstra), instruções e proximidade são calculados no frontend, que segue o MVVM existente. Um provedor React expõe o estado de rota ativa para a futura oferta de proximidade. O mapa provisório pode ser trocado pela planta da coordenação inserindo uma nova versão, sem mudar código.

Este plano termina no design da Fase 1: não implementa código, migrações ou tarefas.

## Technical Context

**Language/Version**: Node.js 24.22.3 e TypeScript 7.0.2 (ESM, type stripping) no backend; JavaScript/JSX no frontend. Versões conforme manifests e lockfile.

**Primary Dependencies**: Express 5.3.0, Supabase JS 2.119.0, React 19.3.1 e Vite 8.3.8 existentes. **Nenhuma dependência nova**: SVG, Geolocation API e Dijkstra são nativos ou pequenos o bastante para código próprio (research D3, D5 e D6).

**Storage**: PostgreSQL no Supabase (`malls`, `mall_maps` com `jsonb`, `stores`), reutilizando `interest_categories`. Bucket público opcional `store-logos` no Storage. Nada desta feature é gravado no navegador.

**Testing**: fluxo sem testes da constituição 1.0.0. Não criar suítes, scripts de teste ou TDD. Verificação na implementação é a compilação (`npm run build`); [quickstart.md](quickstart.md) é um roteiro de conferência futura, sem resultados alegados.

**Target Platform**: web responsiva em navegadores atuais, de 360 a 1440 px; contexto seguro (127.0.0.1 em desenvolvimento, HTTPS em publicação) para a geolocalização. Aplicativo Flutter fora do recorte.

**Project Type**: aplicação web, frontend e backend em npm workspaces, com uma única API de negócio.

**Performance Goals**: SC-001 (encontrar a loja e iniciar a rota em até 30 s para 90% dos participantes de eventual avaliação). Cálculo de rota e de proximidade sem espera perceptível para um grafo de até cerca de 1.000 nós. Uma requisição carrega todo o mapa; depois disso, rotas funcionam sem conexão.

**Constraints**: um shopping ativo; posição do dispositivo só em memória e nunca enviada; texto, seta e traçado sempre derivados do mesmo cálculo; sem **Reservar item**; sem produtos ou ofertas até existir o catálogo; documento do mapa validado antes de ser servido.

**Scale/Scope**: 1 shopping, 3 pisos e cerca de 18 lojas no mapa provisório; 1 endpoint; 1 página (`/mapa`) com seus painéis; 1 componente de navegação inferior. Fora: busca por produto, ofertas, tela 11, roteiro com várias lojas, preferência por elevador, reserva, painel empresarial e app móvel.

**Operational Inputs**: planta do shopping, coordenadas de referência e autorização de uso, todas vindas da coordenação. Não bloqueiam a implementação graças ao mapa provisório (research D11).

## Constitution Check

**Gate inicial, antes da pesquisa:** aprovado. Nenhuma tecnologia nova, nenhuma mudança na política sem testes.

| Princípio/regra | Decisão aplicável | Gate após design |
| --- | --- | --- |
| I — Descoberta confiável e escopo explícito | Mapa, shopping e lojas marcados como demonstração (`isDemo`, **Mapa de demonstração**); sem ofertas ou produtos inventados; busca sem resultado informa a ausência. | Aprovado |
| II — Rastreabilidade | US1–US5 e FR-001–FR-021 mapeados abaixo; divergências das telas 09 e 10 registradas na spec. | Aprovado |
| III — Identidade e comunicação | Endpoint público sem dados pessoais; chave privilegiada só no servidor; localização nunca enviada nem guardada (FR-014). Nenhuma confirmação antes do serviço. | Aprovado |
| IV — Experiência acessível | Lista textual por piso e categoria; marcadores e controles como botões com nome; piso, seleção e rota indicados por texto. Partida escolhida pela pessoa, GPS não apresentado como posição interna. Anúncios pausados na rota; texto, seta e traçado coerentes (D4). | Aprovado |
| V — Simplicidade e transparência | Sem dependência nova; um endpoint; 3D só como sombra; banco único com documento `jsonb`; navegação só com destinos existentes (D12). | Aprovado |
| Tecnologias e segredos | React JSX, Express/TypeScript e Supabase já ratificados; nenhuma chave no cliente. | Aprovado |
| Processo sem testes | Nenhum teste gerado; quickstart é roteiro futuro. | Aprovado |
| Branch/entrega | Planejamento local, sem commit; implementação em branch própria e PR. | Aprovado para a fase atual |

**Reavaliação após Fase 1:** aprovada. O documento `jsonb` não constitui segunda fonte de dados, já que está no mesmo banco e é lido só pela API. O bucket público de logos guarda apenas conteúdo público. Nenhuma exceção constitucional foi necessária; a seção Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/005-mapa-rota-lojas/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── api.md
    └── ui.md
```

`tasks.md` pertence ao comando seguinte (`/speckit-tasks`) e não é gerado agora.

### Source Code (repository root)

Arquivos a criar (+) ou alterar (~) na implementação:

```text
backend/
  supabase/migrations/
    + 0015_mall_map_stores.sql        malls, mall_maps, stores, índices, RLS, grants
    + 0016_demo_mall_seed.sql         Shopping Aurora, mapa provisório (3 pisos), lojas demo
  ~ supabase/README.md                ordem 0015–0016 e troca de mapa
  src/
    + domain/mall/map-document.ts     tipos e validação do documento
    + application/ports/mall-repository.ts
    + application/services/mall.service.ts
    + infrastructure/supabase/mall.repository.ts
    + presentation/http/controllers/mall.controller.ts
    + presentation/http/routes/mall.routes.ts
    ~ presentation/http/routes/index.ts   registrar GET /mall
    ~ presentation/http/controllers/context.ts  serviço mall em Services
    ~ app.ts                          composição do MallService

frontend/src/
  ~ app/App.jsx                       /mapa antes da espera pela sessão; ActiveRouteProvider
  + features/mall-map/                models, repositories, viewmodels, views (contracts/ui.md)
  + shared/components/BottomNav.jsx   Início + Mapa
  ~ features/home/views/HomeView.jsx  incluir BottomNav
  + styles/mall-map.css               mapa, marcadores, folhas e painel lateral
  ~ shared/components/Icon.jsx        ícones de sacola, setas de direção, piso, localização
```

**Structure Decision**: manter View → ViewModel → Model/Repository → `http-client` no frontend e controller → serviço → porta/adaptador no backend, como na feature 004. Os modelos de caminho e instruções são funções puras em `models/`, sem React, para que texto e seta dependam de um único cálculo. Nenhuma camada ou repositório genérico novo.

## Phase 0 — Research concluída

[research.md](research.md) registra as decisões D1–D12: dados no Postgres com documento `jsonb` (D1–D2), rota no cliente (D3), instruções de fonte única (D4), SVG com sombra no lugar de 3D (D5), geolocalização só local (D6), estado de rota global em memória (D7), acesso público (D8), reaproveitamento de categorias (D9), logos em bucket público (D10), seed provisório (D11) e navegação inferior mínima (D12). Não restou nenhum `NEEDS CLARIFICATION`.

## Phase 1 — Design e contratos

### Dados e API

- [data-model.md](data-model.md): três tabelas, documento do mapa com regras de validação, estados no navegador, cálculo de direção e tempo e transições da rota.
- [contracts/api.md](contracts/api.md): `GET /api/v1/mall`, resposta única, `floorId` derivado, erros `MAP_UNAVAILABLE` e `MAP_INVALID` e organização em camadas.

### Interface

- [contracts/ui.md](contracts/ui.md): rotas `/mapa` e `/mapa?loja=`, estrutura MVVM, estados da página, textos, acessibilidade, mensagens de localização, integração com outras telas e responsividade.

### Pontos de atenção para a implementação

- **Ordem no `App.jsx`**: `/mapa` precisa ser resolvido junto com `/`, antes de `auth.loading` e `auth.error`; caso contrário, uma falha na sessão bloqueia o mapa público.
- **Sinal da direção**: eixo y para baixo, então `cross > 0` significa direita (data-model). É o ponto em que a divergência da tela 10 pode reaparecer.
- **Seed coerente**: o mapa provisório precisa ter caminho entre todas as entradas e todas as unidades, exceto uma loja propositalmente sem posição, para exercitar o caso de exceção.
- **Geolocalização**: tratar os três códigos de erro da API do navegador e a ausência de `navigator.geolocation`; nunca passar coordenadas ao `http-client`.

### Atualização do contexto do agente

O `CLAUDE.md` já descreve a arquitetura em camadas e os comandos; esta feature não introduz tecnologia nova a registrar.

## Rastreabilidade para geração de tarefas

| Histórias | Requisitos | Entrega prevista / dependência |
| --- | --- | --- |
| Fundação | FR-018, FR-019, FR-020 | Migrações 0015–0016 → validação do documento → `GET /mall` → repositório frontend e estados de carregamento e erro. |
| US1 (P1) | FR-001–005, FR-021 | Fundação → SVG do piso, seletor, zoom, marcadores, detalhes → busca → lista textual → `BottomNav`. |
| US2 (P1) | FR-006–011 | US1 → seleção de partida → Dijkstra → instruções (D4) → banner e painel → passos, chegada, encerrar, substituir → `ActiveRouteProvider`. |
| US3 (P2) | FR-012–014 | US1 → `geolocation.js` → estados e mensagens → seleção manual. Independe de US2. |
| US4 (P2) | FR-015–016 | US2 (partida e distâncias) → painel **Perto de você**. |
| US5 (P3) | FR-017, FR-011 | US1 e US2 → leitura de `?loja=` → loja inexistente → `useActiveRoute()` exportado. |
| Produto | SC-001–SC-007 | Critérios de aceite; sem alegação de medição ou execução neste planejamento. |

Na próxima fase, ordenar a fundação antes das histórias, entregar US1 e US2 como caminho mínimo demonstrável, deixar US3 paralelizável com US2 e gerar tarefas por história, sem suítes de teste.

## Limitações e prontidão

Gate aprovado para `/speckit-tasks`. A execução depende de um projeto Supabase com as migrações 0001–0016 aplicadas; sem ele, `/mapa` mostra indisponibilidade, sem simular dados. A planta, as coordenadas reais e a autorização de uso dependem da coordenação; o mapa provisório cobre o desenvolvimento até lá.

Nenhum código de aplicação foi alterado, nenhuma migração foi criada ou aplicada e nenhum fluxo foi executado neste comando.
