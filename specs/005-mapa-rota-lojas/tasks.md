---
description: "Tarefas de implementação do mapa do shopping, lojas próximas e trajeto simulado"
---

# Tasks: Mapa do shopping, lojas próximas e trajeto simulado

**Input**: documentos de specs/005-mapa-rota-lojas/.
**Created**: 2026-11-14.
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [API](contracts/api.md), [telas](contracts/ui.md) e [quickstart.md](quickstart.md).
**Governança**: [constituição 1.0.0](../../.specify/memory/constitution.md).
**Estado**: 58/58 tarefas concluídas em código e documentação em 2026-11-14, na branch 005-mapa-rota-lojas (criada a partir de 004-cadastro, porque a main ainda não contém a feature 004). Verificação realizada: `npm run build` (backend e frontend) sem erros e validação do documento do seed 0016 pela regra do domínio. Não realizado: aplicação das migrações 0015–0016 no Supabase, execução da aplicação no navegador e o roteiro do quickstart; acessibilidade (T054) e responsividade (T055) foram revisadas no código, sem conferência visual. Sem testes, conforme a constituição.
**Tests**: não gerar testes automatizados/manuais obrigatórios, TDD ou scripts de testes (constituição, fluxo sem testes). "Independent Test" abaixo é critério de aceite esperado, não atividade executada. A única verificação prevista é a compilação (`npm run build`), que não comprova cenários funcionais.

**Organization**: histórias em prioridade US1 (P1), US2 (P1), US3 (P2), US4 (P2), US5 (P3), preservando os números da spec. A fundação contém persistência, `GET /api/v1/mall`, repositório frontend e a página `/mapa` com estados de carregamento e erro, porque todas as histórias dependem do mapa carregado.

## Format: ID, paralelismo e história

Cada tarefa usa checkbox não marcado, ID sequencial, marcador [P] quando há independência de arquivos, etiqueta [USn] somente nas fases de histórias e caminhos exatos relativos à raiz. Dependências diretas aparecem ao final de cada linha; as barreiras de fases também se aplicam. [P] não autoriza ignorar dependências incompletas nem editar arquivos compartilhados simultaneamente.

Os trechos entre aspas nas tarefas de dados reproduzem literalmente as restrições de [data-model.md](data-model.md); devem orientar SQL, DTOs e validação, sem delegar esses limites à implementação. Não adicionar dependências npm (plan: "Nenhuma dependência nova").

## Path Conventions

- Backend existente: backend/src/ (domain → application/ports → application/services → infrastructure/supabase → presentation/http) e backend/supabase/migrations/.
- Frontend existente: frontend/src/, JavaScript/JSX e MVVM (View → ViewModel → Model/Repository → shared/services/http-client.js).
- Nova feature frontend: frontend/src/features/mall-map/{models,repositories,viewmodels,views}/, conforme [contracts/ui.md](contracts/ui.md).
- Migrações 0015 e 0016 são aplicadas em ordem numérica após 0001–0014.
- Trabalhar em branch própria criada a partir da `main` atualizada, preservando alterações já presentes no workspace. Esta geração não cria branch, não aplica SQL e não configura serviços.

---

## Phase 1: Setup — preparação

**Purpose**: Registrar procedimento de dados e preparar recursos visuais compartilhados, sem trocar tecnologias.

- [X] T001 Atualizar backend/supabase/README.md com a ordem de aplicação 0015_mall_map_stores.sql → 0016_demo_mall_seed.sql após 0001–0014, o bucket público opcional `store-logos` e o procedimento de troca do mapa provisório pela planta da coordenação descrito em specs/005-mapa-rota-lojas/quickstart.md (inserir versão com `active = false`, atualizar `stores.unit_id`, desativar/ativar na mesma transação, ajustar `malls.reference_lat`, `reference_lng`, `area_radius_m` e `is_demo`).
- [X] T002 [P] Ampliar frontend/src/shared/components/Icon.jsx com ícones de sacola, localização, piso, lista, mais/menos (zoom), fechar e as setas de direção `straight`, `slight-left`, `slight-right`, `left`, `right`, `u-turn`, `floor-change` e `arrive`; cada ícone decorativo com `aria-hidden`, nome acessível sempre fornecido pelo componente que o usa.
- [X] T003 [P] Criar frontend/src/styles/mall-map.css com a base visual das telas 09 e 10 usando os tokens de frontend/src/styles/global.css: página em tela cheia, área do mapa, folhas inferiores até 720 px e painel lateral fixo à esquerda acima de 720 px, sem rolagem horizontal entre 360 e 1440 px.

**Checkpoint**: procedimento de dados registrado e base visual disponível.

---

## Phase 2: Foundational — pré-requisitos compartilhados

**Purpose**: Persistência, validação do documento, endpoint público e carregamento da página `/mapa`.

**⚠️ Barreira**: concluir T004–T017 antes de qualquer história. Nenhum mapa vazio pode ser apresentado como shopping sem lojas (FR-020).

### Banco de dados

- [X] T004 Criar backend/supabase/migrations/0015_mall_map_stores.sql com: `malls` (id: "`text` PK — Identificador estável, ex.: `aurora`"; name: "Não vazio"; reference_lat: "Entre -90 e 90"; reference_lng: "Entre -180 e 180"; area_radius_m: "Entre 50 e 5000; padrão 500"; is_demo `boolean`; active: "No máximo um shopping ativo (índice único parcial `where active`)"), `mall_maps` (id `uuid` PK; mall_id `text` FK → `malls`; version_label: "Único por shopping"; source: "`provisional` ou `coordination`"; document `jsonb`; active: "Exatamente uma versão ativa por shopping (índice único parcial)"; created_at: "Padrão `now()`") e `stores` (id: "Identificador estável usado em `/mapa?loja=`"; mall_id FK → `malls`; name: "1 a 80 caracteres"; category_id: "FK → `interest_categories`"; unit_id: "`text` nulo — Nulo ou ausente no mapa ativo = loja sem posição"; logo_url: "`text` nulo — URL pública no bucket `store-logos`; nulo = marcador de sacola"; is_demo `boolean`; active: "Lojas inativas não são retornadas"). Não guardar piso em `stores`. Habilitar RLS, não conceder nada a `anon` e `authenticated`, acesso apenas por `service_role`; índices por `mall_id` e pelos parciais de `active`. (Dep.: T001.)
- [X] T005 Criar backend/supabase/migrations/0016_demo_mall_seed.sql com o Shopping Aurora (`id = 'aurora'`, `is_demo = true`, referência provisória em Palmas -10.1844 / -48.3336, raio 500), a versão `provisorio-1` com `source = 'provisional'` e `active = true`, e cerca de 18 lojas fictícias com `is_demo = true` usando categorias existentes de `interest_categories` (incluir `grao-fino`, Café e doces, no P1, para o roteiro). O documento `schemaVersion: 1` deve ter três pisos (P1–P3) em metros, com contorno, corredores, unidades com `door` e `anchor`, pontos `entrance`, `escalator`, `stairs`, `elevator` e `landmark`, nós e arestas `walk` e entre pisos (`escalator`, `stairs`, `elevator` com `lengthM > 0`), respeitando as regras 1–7 do data-model. Garantir caminho entre todas as entradas e todas as unidades, e incluir uma loja ativa com `unit_id` nulo para o caso "Localização no mapa indisponível". (Dep.: T004.)

### Backend

- [X] T006 [P] Criar backend/src/domain/mall/map-document.ts com os tipos do documento (Floor, Unit, Point, Node, Edge, kinds de ponto e de aresta) e a função de validação que retorna o documento tipado ou o motivo da falha, implementando literalmente: "1. `schemaVersion` igual a 1 e ao menos um piso; `id` de pisos, unidades, pontos e nós únicos em todo o documento." "2. `order` dos pisos únicos; `label` não vazio." "3. Polígonos com ao menos 3 vértices, dentro de `width` × `height`." "4. Toda `door`, `point.node` e extremidade de aresta referencia um nó existente." "5. Arestas `walk` ligam nós do mesmo piso, e o comprimento é calculado pela distância euclidiana. Arestas `escalator`, `stairs` ou `elevator` ligam pisos diferentes e exigem `lengthM > 0`." "6. Arestas são bidirecionais." "7. `point.kind` ∈ `entrance`, `escalator`, `stairs`, `elevator`, `landmark`." Unidade sem caminho não invalida o documento. Expor também um índice `unitId → floorId`.
- [X] T007 [P] Criar backend/src/application/ports/mall-repository.ts com a operação `activeMall()` que retorna shopping ativo, mapa ativo (`versionLabel`, `source`, `document` bruto) e lojas ativas com categoria (`id`, `label`), ou `null` quando não houver shopping ou mapa ativo; sem CRUD genérico. (Dep.: T006.)
- [X] T008 Implementar backend/src/infrastructure/supabase/mall.repository.ts com o cliente privilegiado de backend/src/infrastructure/supabase/client.ts e três consultas: `malls` com `active = true`, `mall_maps` ativo do shopping e `stores` ativas com junção em `interest_categories`; erros do Supabase propagados como falha de repositório. (Dep.: T007.)
- [X] T009 Implementar backend/src/application/services/mall.service.ts: validar o documento com T006, derivar `floorId` de cada loja ("Se `unit_id` for nulo ou não existir no mapa ativo, `unitId` e `floorId` vêm `null`"), ordenar lojas por nome com `localeCompare` `pt-BR`, calcular `mall.isDemo` como verdadeiro quando shopping ou mapa (`source = 'provisional'`) forem de demonstração e converter falhas em `503 MAP_UNAVAILABLE` (Supabase não configurado, consulta falhou, sem shopping ou mapa ativo) ou `503 MAP_INVALID` (motivo apenas em log, sem o conteúdo do mapa). (Dep.: T006, T007.)
- [X] T010 Criar backend/src/presentation/http/controllers/mall.controller.ts e backend/src/presentation/http/routes/mall.routes.ts com `GET /mall` público, sem ler cookie de sessão, respondendo `{ "data": { mall, map, stores } }` no formato de specs/005-mapa-rota-lojas/contracts/api.md e erros pelo `api-error.ts`/`error-handler.ts` existentes; mensagem de `MAP_INVALID`: "O mapa está temporariamente indisponível". (Dep.: T009.)
- [X] T011 Registrar `MallService` em backend/src/presentation/http/controllers/context.ts (tipo `Services`), compô-lo em backend/src/app.ts com o repositório de T008 e montar as rotas de T010 em backend/src/presentation/http/routes/index.ts, mantendo `Cache-Control: private, no-store` e `X-Request-Id` dos middlewares existentes. (Dep.: T008, T010.)

### Frontend

- [X] T012 [P] Criar frontend/src/features/mall-map/repositories/mall.repository.js com `loadMall({signal})` chamando `GET /api/v1/mall` por frontend/src/shared/services/http-client.js e distinguindo `MAP_UNAVAILABLE`, `MAP_INVALID` e falha de rede/tempo esgotado; nunca enviar coordenadas ou ponto de partida. (Dep.: T010.)
- [X] T013 [P] Criar frontend/src/features/mall-map/models/map-document.js com funções puras: pisos em ordem, piso por id, unidade e âncora por `unitId`, pontos por piso, nós por id, lojas por piso, loja com/sem posição e caixa do piso para o `viewBox`; sem React. (Dep.: T006.)
- [X] T014 Criar frontend/src/features/mall-map/viewmodels/useMallMapViewModel.js com a parte de carregamento: estados `loading`, `error` (mensagem por código do contrato), `offline` ("Sem conexão. Verifique sua internet e tente novamente.") e `ready`, ação `retry`, `AbortController` no desmonte e manutenção do mapa já carregado em memória se a conexão cair depois. (Dep.: T012, T013.)
- [X] T015 Criar frontend/src/features/mall-map/views/MallMapView.jsx com os estados Carregando (`role="status"` "Carregando o mapa…"), Erro/indisponível (`FormFeedback` + **Tentar novamente**) e Sem conexão, importando frontend/src/styles/mall-map.css; no estado pronto, renderizar o contêiner do mapa que as histórias preenchem. (Dep.: T003, T014.)
- [X] T016 Alterar frontend/src/app/App.jsx para resolver `/mapa` junto com `/`, antes dos retornos de `auth.loading` e `auth.error` (research D8), renderizando `MallMapView` sem exigir sessão; não incluir `/mapa` em `protectedRoute`. (Dep.: T015.)
- [X] T017 [P] Garantir em frontend/src/shared/services/http-client.js que `GET` sem cookie obrigatório funcione para `/api/v1/mall` e que falha de rede seja distinguível de erro HTTP, sem alterar o comportamento das chamadas da feature 004. (Dep.: T012.)

**Checkpoint**: `GET /api/v1/mall` responde conforme o contrato com o seed aplicado e `/mapa` carrega ou mostra indisponibilidade sem sessão.

---

## Phase 3: User Story 1 - Consultar o mapa e encontrar uma loja (Priority: P1) 🎯 MVP

**Goal**: Aba **Mapa** com pisos, zoom, marcadores de sacola, busca, detalhes da loja e lista textual (FR-001–005, FR-018, FR-021).

**Independent Test**: Critério de aceite: abrir **Mapa**, alternar pisos, buscar uma loja de demonstração e identificá-la no mapa e na lista textual com nome, piso e categoria.

- [X] T018 [P] [US1] Criar frontend/src/features/mall-map/models/store-search.js com normalização sem acento e sem caixa (`normalize('NFD')` removendo marcas combinantes, `toLocaleLowerCase('pt-BR')`, aparo), filtro por nome e rótulo de categoria, limite de 8 sugestões e filtro por categoria para a lista; "cafe" e "Café" devem coincidir.
- [X] T019 [US1] Ampliar frontend/src/features/mall-map/viewmodels/useMallMapViewModel.js com piso ativo (inicial: menor `order`), zoom de 1× a 4× via `viewBox`, deslocamento por arraste, roda, pinça e setas do teclado, loja selecionada (troca o piso para o da loja), termo de busca e sugestões (T018), lista aberta/fechada e filtro de categoria. (Dep.: T014, T018.)
- [X] T020 [P] [US1] Criar frontend/src/features/mall-map/views/FloorPlan.jsx com SVG visto de cima: contorno, corredores, unidades com camada de sombra deslocada e borda colorida (aparência 3D opcional, FR-002), `viewBox` controlado pelo ViewModel e camada HTML posicionada para os marcadores. (Dep.: T013.)
- [X] T021 [P] [US1] Criar frontend/src/features/mall-map/views/StoreMarker.jsx como `button` com nome acessível "{loja}, {categoria}, Piso {n}", ícone de sacola, logo (`img` até 64×64 com alt = nome da loja) somente quando `logoUrl` existir e zoom ≥ 2×, e estado selecionado com contorno e texto "Selecionada". (Dep.: T002.)
- [X] T022 [P] [US1] Criar frontend/src/features/mall-map/views/FloorSelector.jsx com botões dos pisos do documento em ordem decrescente, `aria-pressed`, fundo escuro e texto acessível "Piso {n} selecionado" no ativo.
- [X] T023 [P] [US1] Criar frontend/src/features/mall-map/views/ZoomControls.jsx com botões **+** e **−** nomeados "Aproximar mapa" e "Afastar mapa", desabilitados nos limites 1× e 4×. (Dep.: T002.)
- [X] T024 [P] [US1] Criar frontend/src/features/mall-map/views/MapSearch.jsx com placeholder **Buscar loja no mapa**, `role="combobox"`, `listbox` com até 8 sugestões (nome, piso, categoria), setas para navegar, Enter seleciona, **Nenhuma loja encontrada** com **Limpar busca** quando não houver resultado. (Dep.: T018.)
- [X] T025 [P] [US1] Criar frontend/src/features/mall-map/views/StoreDetailsSheet.jsx como diálogo não modal com nome, categoria, piso, **Traçar rota** (recebido por prop; para loja sem posição, indisponível com o texto **Localização no mapa indisponível**) e fechar; foco vai para o título ao abrir.
- [X] T026 [P] [US1] Criar frontend/src/features/mall-map/views/StoreListView.jsx com todas as lojas agrupadas por piso (cabeçalhos), grupo "Localização no mapa indisponível" para lojas sem posição, filtro de categoria com `aria-pressed` e as mesmas ações do marcador (selecionar e **Traçar rota**). (Dep.: T018.)
- [X] T027 [P] [US1] Criar frontend/src/shared/components/BottomNav.jsx com **Início** (para `/inicio`, ou `/entrar` sem sessão) e **Mapa** (`/mapa`), item atual com `aria-current="page"` e indicação textual além da cor; sem Buscar, Desejos ou Perfil (research D12).
- [X] T028 [US1] Compor o estado de consulta em frontend/src/features/mall-map/views/MallMapView.jsx: busca no topo, selo com o nome do shopping, **Mapa de demonstração** quando `mall.isDemo`, seletor de pisos, zoom, marcadores somente do piso ativo, **Ver lista de lojas**, detalhes da loja selecionada e `BottomNav`; sem **Reservar item**, produtos ou ofertas. (Dep.: T019, T020, T021, T022, T023, T024, T025, T026, T027.)
- [X] T029 [US1] Incluir `BottomNav` em frontend/src/features/home/views/HomeView.jsx com **Início** ativo, sem alterar o restante da página. (Dep.: T027.)
- [X] T030 [US1] Completar frontend/src/styles/mall-map.css com estilos de marcadores, selo, seletor de pisos, zoom, busca, detalhes, lista e `BottomNav`, com foco visível e estados indicados por texto além da cor. (Dep.: T028.)

**Checkpoint**: US1 utilizável de forma independente (quickstart, passos 2–6).

---

## Phase 4: User Story 2 - Traçar e seguir um trajeto simulado até a loja (Priority: P1)

**Goal**: Ponto de partida escolhido pela pessoa, rota calculada no cliente com instruções coerentes e estado de rota ativa global (FR-006–011).

**Independent Test**: Critério de aceite: escolher um ponto de partida e uma loja de outro piso, iniciar a rota, avançar até a chegada e encerrar, conferindo traçado, texto, seta, troca de piso e retorno ao mapa.

- [X] T031 [P] [US2] Criar frontend/src/features/mall-map/models/pathfinding.js com grafo bidirecional do documento (arestas `walk` com distância euclidiana; entre pisos com `lengthM`) e Dijkstra `shortestPath(fromNode, toNode)` retornando nós, distância total e `null` quando não houver caminho; sem React. (Dep.: T013.)
- [X] T032 [P] [US2] Criar frontend/src/features/mall-map/models/instructions.js gerando `instructions[]` com `kind` (`straight`, `slight-left`, `slight-right`, `left`, `right`, `u-turn`, `floor-change`, `arrive`), `distanceM`, `floorId`, `connector` e `landmark`, aplicando literalmente: "`cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)`", "`angle = |atan2(cross, dot)|`, com `dot = (b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y)`", "`cross > 0` → **direita**; `cross < 0` → **esquerda** (eixo y para baixo inverte o sinal cartesiano)" e "até 30° `straight`; 30–60° `slight-*`; 60–150° `left`/`right`; acima de 150° `u-turn`"; agrupar retas consecutivas somando distância; instrução própria de troca de piso ("Pegue a escada rolante até o Piso 2"); uma única tabela `kind → {texto, ícone}` para texto e seta (research D4); destino no próprio ponto de partida gera só `arrive`; `etaMin = ceil(totalM / 70)`, mínimo 1. (Dep.: T031.)
- [X] T033 [P] [US2] Criar frontend/src/features/mall-map/viewmodels/ActiveRouteProvider.jsx com contexto em memória (sem `sessionStorage`) e hook exportado `useActiveRoute()` expondo `isActive` (verdadeiro em `ativa` e `chegou`), destino, rota e ações `start`, `replace` e `end`, no padrão de frontend/src/features/registration/viewmodels/RegistrationProvider.jsx.
- [X] T034 [US2] Envolver a aplicação com `ActiveRouteProvider` em frontend/src/app/App.jsx, junto de `RegistrationProvider`, para que o estado esteja disponível em todas as rotas. (Dep.: T016, T033.)
- [X] T035 [US2] Criar frontend/src/features/mall-map/viewmodels/useRouteViewModel.js com as transições do data-model: consulta → escolhendo-partida → ativa(step 0) → ativa(step ±1) → chegou → consulta; ponto de partida apenas escolhido pela pessoa; "escolhendo-partida ──sem caminho──▶ consulta + mensagem "Não foi possível traçar um caminho até esta loja"" sem ativar rota; distância e tempo restantes por passo; piso exibido acompanha o passo atual; substituição de destino ou partida com confirmação pendente. (Dep.: T031, T032, T033.)
- [X] T036 [P] [US2] Criar frontend/src/features/mall-map/views/StartPointPicker.jsx com **Onde você está?**, lista de botões agrupada por piso (entradas, escadas, escadas rolantes, elevadores, referências) e **Cancelar**; os mesmos pontos ficam focáveis no mapa via T039.
- [X] T037 [P] [US2] Criar frontend/src/features/mall-map/views/RouteBanner.jsx com ícone e texto do mesmo `kind` vindos da tabela de T032, linha secundária de referência ("Depois da {referência}"), **Anúncios pausados durante a rota** sempre visível, `aria-live="polite"` e, ao chegar, "Você chegou à {loja}". (Dep.: T002, T032.)
- [X] T038 [P] [US2] Criar frontend/src/features/mall-map/views/RouteSheet.jsx com "{min} min · {m} m", "Chegada na {loja} · Piso {n} via {conexão}", **Anterior**, **Próxima**, **Encerrar rota** e, ao chegar, **Voltar ao mapa**; foco permanece no painel ao avançar; sem **Reservar item**, produto, preço ou estoque.
- [X] T039 [US2] Ampliar frontend/src/features/mall-map/views/FloorPlan.jsx com o traçado da rota no piso exibido (trecho concluído e restante distinguíveis além da cor), pontos de partida como botões no modo escolhendo-partida e o ponto de partida escolhido como marcador próprio (não posição de GPS). (Dep.: T020, T035.)
- [X] T040 [P] [US2] Criar frontend/src/features/mall-map/views/ReplaceRouteDialog.jsx com "Substituir a rota atual até {loja}?", **Substituir** e **Manter rota**, foco preso no diálogo e Esc = Manter rota (complementa contracts/ui.md, "Substituir rota").
- [X] T041 [US2] Integrar em frontend/src/features/mall-map/views/MallMapView.jsx os estados Escolhendo partida, Rota ativa e Chegou: **Traçar rota** de detalhes, marcador e lista aciona T035; troca de piso automática na conexão; mensagem de sem caminho; diálogo de substituição; ao encerrar, mapa volta à consulta e o aviso de anúncios some. (Dep.: T028, T035, T036, T037, T038, T039, T040.)
- [X] T042 [US2] Acrescentar a frontend/src/styles/mall-map.css os estilos de traçado, banner, painel da rota, seletor de partida e diálogo, mantendo folha inferior até 720 px e painel lateral acima. (Dep.: T041.)

**Checkpoint**: US1 e US2 formam o caminho mínimo demonstrável (quickstart, passos 7–12).

---

## Phase 5: User Story 3 - Usar a localização do dispositivo para a descoberta (Priority: P2)

**Goal**: Geolocalização apenas após ação explícita, informando dentro/fora do shopping, com seleção manual e posição nunca enviada nem guardada (FR-012–014).

**Independent Test**: Critério de aceite: abrir o mapa autorizando a localização perto e longe do shopping e, depois, negando a permissão, conferindo mensagem, seleção manual e continuidade do mapa.

- [X] T043 [P] [US3] Criar frontend/src/features/mall-map/models/geolocation.js com haversine até `mall.reference`, classificação `inside`/`outside` pelo `areaRadiusM` e formatação de distância ("abaixo de 1 km em metros arredondados a 10 m; acima, em km com uma casa decimal"); sem React e sem armazenamento.
- [X] T044 [US3] Criar frontend/src/features/mall-map/viewmodels/useLocationViewModel.js com estados `idle`, `requesting`, `inside`, `outside` (distância em metros), `denied`, `unavailable` e `timeout`; chamar `navigator.geolocation.getCurrentPosition` somente pela ação, com `enableHighAccuracy: false`, `timeout: 10000` e `maximumAge: 60000`; tratar os códigos 1/2/3 e a ausência de `navigator.geolocation` como `unavailable`; descartar coordenadas após o cálculo, nunca passá-las ao http-client nem a armazenamento; seleção manual do único shopping ativo. (Dep.: T043.)
- [X] T045 [P] [US3] Criar frontend/src/features/mall-map/views/LocationNotice.jsx com **Usar minha localização** e o texto "Usamos sua localização só para saber se você está no shopping. Ela não é salva."; mensagens da tabela de contracts/ui.md (**Você está no {shopping}** com convite a escolher o ponto de partida; "Você está a aproximadamente {distância} do {shopping}."; **Não foi possível encontrar a localização do dispositivo** com **Escolher shopping manualmente** e, para `unavailable`/`timeout`, **Tentar novamente**; "{shopping} selecionado") anunciadas em `role="status"`.
- [X] T046 [US3] Integrar `LocationNotice` em frontend/src/features/mall-map/views/MallMapView.jsx no estado de consulta, sem bloquear o mapa em nenhum estado e sem desenhar a posição do dispositivo no mapa interno; o convite de `inside` abre o `StartPointPicker` quando US2 estiver presente. (Dep.: T028, T044, T045.)

**Checkpoint**: localização funciona de forma independente; mapa permanece utilizável em todos os casos (quickstart, passos 13–16).

---

## Phase 6: User Story 4 - Ver lojas perto de você (Priority: P2)

**Goal**: Painel **Perto de você** ordenado por distância de caminhada simulada a partir do ponto de partida escolhido (FR-015–016).

**Independent Test**: Critério de aceite: escolher um ponto de partida e conferir que o painel lista lojas por menor distância, com distância e **Traçar rota**, e que a ordem muda ao trocar o ponto.

- [X] T047 [US4] Acrescentar a frontend/src/features/mall-map/models/pathfinding.js a função `distancesFrom(fromNode)` (Dijkstra de fonte única) e o cálculo das lojas mais próximas pela distância até o nó `door` de cada unidade, ignorando lojas sem posição ou sem caminho. (Dep.: T031.)
- [X] T048 [US4] Expor em frontend/src/features/mall-map/viewmodels/useRouteViewModel.js o ponto de partida atual também fora de uma rota (escolha só para "Perto de você") e a lista de até 5 lojas próximas recalculada quando o ponto mudar. (Dep.: T035, T047.)
- [X] T049 [P] [US4] Criar frontend/src/features/mall-map/views/NearbyPanel.jsx com cartões de iniciais, nome completo, piso, distância ("30 m") e **Traçar rota**; sem ponto escolhido, **Escolha onde você está para ver as lojas próximas** e ação para escolher, sem distâncias inventadas; sem ofertas ou produtos enquanto o catálogo não existir.
- [X] T050 [US4] Integrar `NearbyPanel` em frontend/src/features/mall-map/views/MallMapView.jsx no estado de consulta (oculto durante rota ativa) e acrescentar seus estilos em frontend/src/styles/mall-map.css. (Dep.: T041, T048, T049.)

**Checkpoint**: painel reflete o ponto escolhido (quickstart, passo 17).

---

## Phase 7: User Story 5 - Abrir a rota a partir de outras telas (Priority: P3)

**Goal**: Entrada `/mapa?loja={storeId}` para **Me leve lá** e **Me leve até a loja**, e consulta do estado de rota ativa por outras partes do aplicativo (FR-017, FR-011).

**Independent Test**: Critério de aceite: abrir o mapa por endereço que identifique uma loja de demonstração e conferir que ela aparece selecionada como destino, pronta para escolher o ponto de partida.

- [X] T051 [US5] Ajustar frontend/src/app/navigation.js para que `navigate` compare `pathname + search` antes de ignorar a navegação e oferecer leitura do parâmetro de busca atual, sem alterar o comportamento das rotas existentes (hoje `navigate("/mapa?loja=x")` estando em `/mapa` seria ignorado).
- [X] T052 [US5] Ler `?loja=` em frontend/src/features/mall-map/viewmodels/useMallMapViewModel.js após o carregamento: loja existente com posição → selecionada no piso correto e fluxo segue para **Onde você está?** (via T035); loja inexistente ou sem posição → **Loja não encontrada no mapa** e mapa em consulta; com rota ativa, pedir confirmação de substituição (T040). (Dep.: T019, T035, T041, T051.)
- [X] T053 [US5] Documentar no topo de frontend/src/features/mall-map/viewmodels/ActiveRouteProvider.jsx o uso de `useActiveRoute().isActive` para suspender ofertas de proximidade (tela 11 futura) e o formato `/mapa?loja={storeId}` para **Me leve lá**/**Me leve até a loja**, sem implementar ofertas nesta feature. (Dep.: T033.)

**Checkpoint**: entrada externa e estado global disponíveis (quickstart, passos 18–19).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Acessibilidade, responsividade, rastreabilidade documental e compilação.

- [X] T054 Revisar operação por teclado e nomes acessíveis em frontend/src/features/mall-map/views/ (busca, pisos, zoom, marcadores, mapa com setas, partida, rota, lista, diálogo) e corrigir lacunas de FR-021 e SC-005.
- [X] T055 [P] Revisar frontend/src/styles/mall-map.css entre 360 e 1440 px para remover rolagem horizontal da página e manter mapa, controles e painéis acessíveis.
- [X] T056 [P] Registrar em docs/frontend.md, nas telas 09 e 10, as divergências tratadas pela spec (seta × texto, **Reservar item** fora do escopo, produto/preço/estoque só com catálogo, ponto azul = partida escolhida, nome do shopping vindo dos dados) para correção do protótipo, sem alterar as imagens.
- [X] T057 Executar `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run build` (ou `npm run build` com Node 24 no PATH) e corrigir erros de compilação de backend e frontend.
- [X] T058 Atualizar o campo **Estado** deste specs/005-mapa-rota-lojas/tasks.md e preparar o relato do pull request com requisitos atendidos, pendências (planta, coordenadas e autorização da coordenação; aplicação das migrações), limitações conhecidas e a ausência de testes, sem afirmar execução do roteiro de specs/005-mapa-rota-lojas/quickstart.md que não tenha ocorrido. (Dep.: T057.)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende de T001 (migrações) e T003 (página); bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da fundação. Base de todas as demais histórias na interface.
- **US2 (Phase 4)**: depende de US1 (detalhes, marcadores, `FloorPlan`, `MallMapView`).
- **US3 (Phase 5)**: depende de US1; independe de US2 (o convite de `inside` só abre o `StartPointPicker` se US2 existir). Paralelizável com US2.
- **US4 (Phase 6)**: depende de US2 (ponto de partida, `pathfinding.js`, `useRouteViewModel`).
- **US5 (Phase 7)**: depende de US1 e US2.
- **Polish (Phase 8)**: depende das histórias desejadas.

### Story Completion Order

```text
Setup → Foundational → US1 ─┬─▶ US2 ─┬─▶ US4
                            │        └─▶ US5
                            └─▶ US3 (paralela a US2)
                                         → Polish
```

### Within Each User Story

- Models (funções puras) → ViewModels → Views → composição em `MallMapView.jsx` → estilos.
- `MallMapView.jsx`, `FloorPlan.jsx`, `useRouteViewModel.js`, `useMallMapViewModel.js`, `App.jsx` e `mall-map.css` são compartilhados entre fases: editar em sequência, nunca em paralelo.

### Parallel Opportunities

- Setup: T002 e T003 em paralelo com T001.
- Fundação: T006 em paralelo com T004/T005; T012, T013 e T017 em paralelo depois de T010/T006.
- US1: T018, T020–T027 em paralelo (arquivos distintos); T019 depois de T018.
- US2: T031, T033, T036, T038 e T040 em paralelo; T032 depois de T031; T037 depois de T032.
- US3: T043 e T045 em paralelo; pode correr inteira em paralelo com US2.
- US4: T049 em paralelo com T047.
- Polish: T055 e T056 em paralelo.

---

## Parallel Example: User Story 1

```text
Task: "T018 Criar frontend/src/features/mall-map/models/store-search.js"
Task: "T020 Criar frontend/src/features/mall-map/views/FloorPlan.jsx"
Task: "T021 Criar frontend/src/features/mall-map/views/StoreMarker.jsx"
Task: "T022 Criar frontend/src/features/mall-map/views/FloorSelector.jsx"
Task: "T023 Criar frontend/src/features/mall-map/views/ZoomControls.jsx"
Task: "T025 Criar frontend/src/features/mall-map/views/StoreDetailsSheet.jsx"
Task: "T027 Criar frontend/src/shared/components/BottomNav.jsx"
```

## Parallel Example: User Story 2

```text
Task: "T031 Criar frontend/src/features/mall-map/models/pathfinding.js"
Task: "T033 Criar frontend/src/features/mall-map/viewmodels/ActiveRouteProvider.jsx"
Task: "T036 Criar frontend/src/features/mall-map/views/StartPointPicker.jsx"
Task: "T038 Criar frontend/src/features/mall-map/views/RouteSheet.jsx"
Task: "T040 Criar frontend/src/features/mall-map/views/ReplaceRouteDialog.jsx"
```

## Parallel Example: User Story 3 (junto com US2)

```text
Task: "T043 Criar frontend/src/features/mall-map/models/geolocation.js"
Task: "T045 Criar frontend/src/features/mall-map/views/LocationNotice.jsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 e Phase 2 (fundação; requer migrações 0015–0016 aplicadas para dados reais).
2. Phase 3 (US1): mapa consultável, busca e lista textual.
3. **Parar e validar** pelos critérios de aceite da US1.

### Caminho mínimo demonstrável (US1 + US2)

Acrescentar a Phase 4: rota simulada entre pisos com instruções coerentes e estado de rota ativa. É o recorte das telas 09 e 10 indicado no plano.

### Incremental Delivery

1. Fundação → US1 → US2 (demonstração principal).
2. US3 em paralelo com US2, ou logo depois.
3. US4 → US5 → Polish.
4. Cada incremento mantém as histórias anteriores funcionando.

---

## Notes

- [P] = arquivos distintos e sem dependência incompleta.
- [USn] mapeia a tarefa à história da spec para rastreabilidade (constituição II).
- Nenhuma tarefa cria testes, suítes ou TDD; critérios de aceite não são declarados verificados sem execução.
- A planta da coordenação não bloqueia nenhuma tarefa: a troca é uma nova versão em `mall_maps` (T001, quickstart).
- Fazer commit por tarefa ou grupo lógico, na branch própria da feature.
