---
description: "Implementação dos pop-ups de promoções próximas"
---

# Tasks: Pop-ups de promoções próximas

**Input**: [spec](spec.md), [plan](plan.md), [modelo](data-model.md), [pesquisa](research.md) e contratos.

**Política**: sem tarefas de testes; critérios independentes descrevem comportamento esperado, não execução.

**Estado**: esta lista e suas marcações de conclusão já existiam ao iniciar a revisão solicitada pelo usuário. As marcações foram preservadas; esta revisão documental não determina a ordem em que as tarefas e a implementação foram feitas nem comprova testes funcionais ou aplicação das migrações no Supabase.

## Phase 1: Setup

- [X] T001 Verificar estrutura existente, `.gitignore`, migrações e registrar a ordem da nova fonte em `backend/supabase/README.md`.

## Phase 2: Foundational

- [X] T002 Criar `backend/supabase/migrations/0017_published_promotional_offers.sql` com tabela de ofertas, `id` estável, `store_id` e `category_id` obrigatórios, `product_name` de 1–120 caracteres, preço inteiro não negativo em centavos, preço anterior opcional maior que atual, `availability` available/unavailable, vigências opcionais com início anterior ao fim, `published` e `is_demo` obrigatórios, `updated_at` UTC e `revision` positiva incrementada a cada atualização; restringir acesso direto e vincular lojas/categorias.
- [X] T003 Criar `backend/supabase/migrations/0018_demo_promotional_offers.sql` com oferta fictícia identificada, vinculada a loja e categoria existentes, sem valores apresentados como reais.
- [X] T004 Criar domínio e porta em `backend/src/domain/promotions/promotion.ts` e `backend/src/application/ports/promotion-repository.ts` com validação de campos, disponibilidade, vigência e revisão.
- [X] T005 Criar repositório e serviço em `backend/src/infrastructure/supabase/promotion.repository.ts` e `backend/src/application/services/promotion.service.ts`, filtrando shopping/loja ativos e falhando fechado, conforme `contracts/api.md`.
- [X] T006 Integrar endpoints de listagem e confirmação em `backend/src/presentation/http/controllers/promotion.controller.ts`, `backend/src/presentation/http/routes/promotion.routes.ts`, `backend/src/presentation/http/routes/index.ts`, `backend/src/app.ts` e `backend/src/presentation/http/controllers/context.ts`, incluindo erros e ausência de cache.

## Phase 3: User Story 1 — Descobrir uma promoção próxima (P1)

**Goal**: Mostrar oferta confirmada de loja no mesmo piso e até 100 m do ponto manual, identificando demonstração.

**Independent Test**: Com ponto manual e oferta elegível, Início mostra dados conhecidos e distância simulada; sem ponto/oferta, segue utilizável.

- [X] T007 [P] [US1] Criar cliente e seleção em `frontend/src/features/nearby-promotions/repositories/promotion.repository.js` e `frontend/src/features/nearby-promotions/models/select-promotion.js`, usando distâncias do grafo, interesse confirmado, desempate estável e validação de dados.
- [X] T008 [P] [US1] Associar ponto escolhido ao shopping e versão do mapa em `frontend/src/features/mall-map/viewmodels/ActiveRouteProvider.jsx`, `frontend/src/features/mall-map/viewmodels/useRouteViewModel.js` e `frontend/src/features/mall-map/views/MallMapView.jsx`, preservando rotas existentes.
- [X] T009 [US1] Criar estado de sessão e avaliação em `frontend/src/features/nearby-promotions/viewmodels/PromotionSessionProvider.jsx` e `frontend/src/features/nearby-promotions/viewmodels/useNearbyPromotions.js`; integrar em `frontend/src/app/App.jsx` e `frontend/src/features/home/views/HomeView.jsx` com carregamento e confirmação atuais.
- [X] T010 [P] [US1] Criar diálogo em `frontend/src/features/nearby-promotions/views/NearbyPromotionDialog.jsx` e estilos em `frontend/src/styles/nearby-promotions.css` com dados conhecidos, demonstração e distância simulada.

## Phase 4: User Story 2 — Preservar atenção durante o trajeto (P1)

**Goal**: Impedir apresentação com rota ativa ou desconhecida, inclusive durante respostas assíncronas e chegada.

**Independent Test**: Estado de rota ativa bloqueia ofertas em qualquer tela, e ativação fecha oferta apresentada sem alterar o percurso.

- [X] T011 [US2] Aplicar invalidação de consultas e verificação de rota/ponto/usuário/visita no momento de apresentação e na renderização em `frontend/src/features/nearby-promotions/viewmodels/useNearbyPromotions.js` e `frontend/src/features/home/views/HomeView.jsx`.
- [X] T012 [US2] Revalidar oferta e mapa no foco, a cada 30 segundos e ao expirar, fechando ofertas não confirmáveis em `frontend/src/features/nearby-promotions/viewmodels/useNearbyPromotions.js` conforme `contracts/api.md`.

## Phase 5: User Story 3 — Dispensar ou seguir para a loja (P2)

**Goal**: Permitir dispensa e navegação acessíveis com limites por visita e sessão.

**Independent Test**: Dispensar impede repetição na sessão; **Me leve lá** abre o mapa sem ativar rota automaticamente.

- [X] T013 [US3] Implementar dispensa por sessão, máximo de uma abertura por visita e isolamento por usuário em `frontend/src/features/nearby-promotions/viewmodels/PromotionSessionProvider.jsx` e `frontend/src/features/nearby-promotions/viewmodels/useNearbyPromotions.js`.
- [X] T014 [US3] Integrar **Agora não**, **Fechar**, Escape e **Me leve lá** com foco acessível, navegação codificada e indisponibilidade de localização em `frontend/src/features/nearby-promotions/views/NearbyPromotionDialog.jsx` e `frontend/src/features/home/views/HomeView.jsx`.

## Phase 6: Polish & Cross-Cutting

- [X] T015 Atualizar `backend/supabase/README.md` e `specs/008-promocoes-proximas/quickstart.md` com migrações, dados fictícios e limites da fonte.
- [X] T016 Compilar workspaces e revisar diffs e rastreabilidade de `specs/008-promocoes-proximas/spec.md` sem executar testes funcionais, registrando limitações reais.

## Dependencies & Execution Order

Setup → Foundation → US1 → US2 → US3 → Polish. US1 e US2 são inseparáveis como entrega segura: nenhum diálogo pode ser liberado antes da proteção contra rota. Dentro da fundação, arquivos independentes de schema, cliente e documentação podem ser preparados em paralelo após suas dependências, preservando ordem quando compartilham arquivos.

## Parallel Example: US1

T007, T008 e T010 tratam de arquivos distintos e podem ser preparados em paralelo após a fundação; T009 integra os resultados e os controles de rota antes da entrega.

## Parallel Example: US2

T011 e T012 alteram `useNearbyPromotions.js` e devem ser executadas em sequência. A revisão dos contratos de rota e de revalidação pode ocorrer em paralelo, sem editar esse arquivo.

## Parallel Example: US3

Com os contratos das ações definidos, a apresentação de T014 em `NearbyPromotionDialog.jsx` pode ser preparada enquanto se trabalha no estado de sessão de T013; a integração final nos arquivos compartilhados é sequencial.

## Implementation Strategy

Entregar fonte mínima e US1 com proteção obrigatória da US2 como primeiro incremento; US3 completa acessibilidade, dispensa e navegação. A funcionalidade é não essencial e a ausência de dados ou serviço não pode bloquear o Início. Não publicar nem aplicar migrações em serviço externo durante este comando.
