# Tasks: Tela inicial e descoberta

**Input**: Artefatos em `/specs/006-tela-inicial-descoberta/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Não gerar testes. A constituição do projeto estabelece fluxo sem testes; os critérios abaixo servem como verificação futura e não como execução declarada.

## Phase 1: Setup

**Purpose**: Preparar os pontos de extensão da feature sem alterar a landing em `/`.

- [X] T001 Criar o diretório `backend/supabase/seed/` e registrar a convenção de seed demonstrativo em `backend/supabase/README.md`.
- [X] T002 [P] Criar `frontend/src/features/home/models/home.js` com conversores do contrato de `GET /api/v1/home`, limites de seção e estados `ready`, `empty` e `unavailable`.
- [X] T003 [P] Criar `frontend/src/features/home/repositories/home.repository.js` usando `frontend/src/shared/services/http-client.js` para consultar `/home`.
- [X] T004 [P] Criar `frontend/src/styles/home.css` com tokens e regras responsivas próprias da tela inicial entre 360 e 1440 px.

---

## Phase 2: Foundational

**Purpose**: Disponibilizar catálogo persistido e leitura pública antes de qualquer fluxo da tela.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase.

- [X] T005 Criar `backend/supabase/migrations/0019_home_catalog.sql` (renumerada de 0015 e depois 0017; ver research D8) reutilizando `malls`/`stores` da feature 005, com `catalog_categories`, `catalog_products`, `catalog_offers`, `promo_stories`, `home_carousels` e `home_carousel_items`; aplicar todos os limites, enums, FKs e regras de preço/validade descritos em `specs/006-tela-inicial-descoberta/data-model.md`.
- [X] T006 Criar RLS, grants e índices em `backend/supabase/migrations/0019_home_catalog.sql`: somente SELECT anon/authenticated para conteúdo ativo, publicado e vigente; nenhum DML público; índices por status, validade, categoria, ordem e posição.
- [X] T007 Criar `backend/supabase/seed/home-demo.sql` transacional com shopping, lojas, categorias, produtos, ofertas, stories e carrosséis fictícios, todos com `is_demo=true` e dados coerentes.
- [X] T008 Criar `backend/src/domain/home/home-content.ts` com tipos, limites e DTOs do agregado público, usando centavos inteiros BRL, ISO 8601 UTC e estados de seção do contrato.
- [X] T009 Criar `backend/src/infrastructure/supabase/home-content.repository.ts` com cliente Supabase de publishable key sem sessão e consultas de leitura limitadas, ordenadas e filtradas por publicação, validade e relações ativas.
- [X] T010 Criar `backend/src/application/services/home-content.service.ts` para compor consultas independentes em categorias, stories, destaques e carrosséis, retornando 200 com falhas parciais e indisponibilidade global quando tudo falhar.
- [X] T011 Criar `backend/src/presentation/http/controllers/home.controller.ts` e `backend/src/presentation/http/routes/home.routes.ts` para `GET /api/v1/home`, com envelope existente, `HOME_UNAVAILABLE`, no-store e nenhum detalhe interno exposto.
- [X] T012 Integrar `backend/src/presentation/http/routes/home.routes.ts` em `backend/src/presentation/http/routes/index.ts` e registrar a dependência de publishable key em `backend/.env.example` sem expor segredos.

**Checkpoint**: Catálogo persistido, seed e endpoint público disponíveis no desenho, sem rota de escrita.

---

## Phase 3: User Story 1 — Explorar a tela inicial como visitante (Priority: P1) 🎯 MVP

**Goal**: Um visitante abre `/inicio`, vê o conteúdo público e entende estados de carregamento, vazio e erro sem criar conta.

**Independent Test**: Abrir `/inicio` sem sessão e observar conteúdo retornado ou uma mensagem de indisponibilidade sem redirecionamento a `/entrar`.

- [X] T013 [US1] Refatorar guardas em `frontend/src/app/App.jsx` para deixar `/inicio` público, manter protegidas as rotas de cadastro/perfil e não bloquear visitante por falha de consulta de sessão.
- [X] T014 [US1] Refatorar `frontend/src/features/home/viewmodels/useHomeViewModel.js` para carregar o agregado público, preservar retry e expor estados independentes de cada seção.
- [X] T015 [US1] Criar `frontend/src/features/home/views/HomeHeader.jsx` e `frontend/src/features/home/views/HomeSectionState.jsx` com cabeçalho neutro, acesso à conta, skip link e estados acessíveis de carregamento, vazio e erro.
- [X] T016 [US1] Refatorar `frontend/src/features/home/views/HomeView.jsx` para compor a tela pública, mensagem de falha geral e retry, preservando conteúdo de seções carregadas.
- [X] T017 [US1] Integrar `frontend/src/styles/home.css` à tela e garantir foco visível, status textual e ausência de rolagem horizontal entre 360 e 1440 px.

**Checkpoint**: Visitante explora `/inicio` sem autenticação e recebe estados compreensíveis quando a API não fornece conteúdo.

---

## Phase 4: User Story 2 — Pesquisar e navegar por categoria (Priority: P1)

**Goal**: A pessoa inicia uma busca ou abre uma categoria a partir da tela inicial, preservando o termo/identificador para a feature de resultados.

**Independent Test**: Inserir termo e selecionar categoria; a intent preserva respectivamente query e categoryId, e categoria sem itens recebe estado vazio.

- [X] T018 [P] [US2] Criar `frontend/src/features/home/views/SearchBox.jsx` com label, Enter, botão e intent `search(query)` sem alterar o termo digitado.
- [X] T019 [P] [US2] Criar `frontend/src/features/home/views/CategoryRail.jsx` com botões acessíveis, selo demonstrativo e intent `browseCategory(categoryId)`.
- [X] T020 [US2] Atualizar `frontend/src/app/navigation.js` e `frontend/src/app/App.jsx` para transportar intents de busca/categoria para uma URL de resultados compatível com a futura feature 005, sem inventar endpoint de resultados.
- [X] T021 [US2] Integrar `SearchBox.jsx` e `CategoryRail.jsx` em `frontend/src/features/home/views/HomeView.jsx`, tratando categoria vazia e preservando a exploração pública.

**Checkpoint**: Busca e categoria saem do Início com parâmetros preservados, sem exigir login.

---

## Phase 5: User Story 3 — Descobrir oferta por story ou carrossel (Priority: P2)

**Goal**: A pessoa percorre stories, destaques e carrosséis, abre o item correspondente e entende demonstração, estoque e validade.

**Independent Test**: Abrir story, oferta e item de carrossel; o diálogo mostra somente dados recebidos e identifica item expirado/indisponível.

- [X] T022 [P] [US3] Criar `frontend/src/features/home/views/StoryRail.jsx` e `frontend/src/features/home/views/FeaturedOffers.jsx` com cards semânticos, selo demonstrativo e texto de estoque/validade.
- [X] T023 [P] [US3] Criar `frontend/src/features/home/views/ProductCarousel.jsx` com controles Anterior/Próximo nomeados, posição textual, teclado e sem avanço automático/repetição artificial.
- [X] T024 [P] [US3] Criar `frontend/src/features/home/views/StoryViewer.jsx` e `frontend/src/features/home/views/OfferDetails.jsx` como diálogos acessíveis que fecham com Escape e retornam foco ao acionador.
- [X] T025 [US3] Integrar stories, ofertas, carrosséis e diálogos em `frontend/src/features/home/views/HomeView.jsx`; formatar BRL, omitir campos ausentes e tratar expiração com `generatedAt`/`validUntil`.
- [X] T026 [US3] Completar estilos de trilhos, cards, selo demonstrativo, estados de estoque/expiração e diálogo em `frontend/src/styles/home.css`, respeitando reduced motion e responsividade.

**Checkpoint**: Todo conteúdo de descoberta navega por teclado e expõe apenas informações cadastradas, com demonstração claramente marcada.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Conferir a aderência aos contratos, documentação e build sem declarar testes executados.

- [X] T027 Atualizar `specs/006-tela-inicial-descoberta/quickstart.md` com os caminhos efetivos da migração, seed e rota implementados.
- [X] T028 Conferir `README.md` e `docs/frontend.md` para ajustar somente referências de estado que passaram a existir na tela 05, sem afirmar dados reais ou publicação de produção.
- [X] T029 Executar `npm run build` na raiz e registrar em `specs/006-tela-inicial-descoberta/tasks.md` apenas a marcação das tarefas concluídas; não alegar cenários funcionais não executados.

---

## Dependencies & Execution Order

- Setup T001–T004 precede Fundação.
- Fundação T005–T012 bloqueia US1, US2 e US3.
- US1 (T013–T017) é o MVP e deve preceder a integração de US2/US3 em `HomeView.jsx`.
- US2 (T018–T021) e US3 (T022–T026) dependem de US1 e compartilham `HomeView.jsx`, portanto a integração final é sequencial.
- Polish T027–T029 ocorre após as histórias.

## Parallel Opportunities

- T002–T004 podem ocorrer em paralelo.
- T007–T009 podem ser preparados em paralelo após o schema de T005 estar definido.
- T018/T019 e T022/T024 podem ser desenvolvidos em paralelo por alterarem arquivos próprios.

## Implementation Strategy

1. Preparar catálogo e endpoint de leitura.
2. Entregar US1 para visitantes como MVP.
3. Integrar busca/categorias (US2) e conteúdo promocional (US3).
4. Atualizar documentação e compilar a aplicação.
