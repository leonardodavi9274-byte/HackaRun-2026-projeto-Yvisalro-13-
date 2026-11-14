---
description: "Tarefas para lista de desejos, histórico e recomendações por buscas"
---

# Tasks: Lista de desejos e recomendações

**Input**: [spec](spec.md), [plan](plan.md), [pesquisa](research.md), [modelo](data-model.md), [contrato da API](contracts/api.md), [contrato de interface](contracts/ui.md) e [guia de uso](quickstart.md).

**Estado**: T001–T004, T007–T008, T013 e T022–T023 e T029 concluídas como preparação; T005–T006 e as integrações dependem de C1. As alterações existentes da [feature 008](../008-promocoes-proximas/tasks.md) devem ser preservadas e não comprovam implementação desta feature.

**Política**: não há tarefas de testes automatizados ou manuais, conforme a constituição. Os critérios independentes descrevem resultados esperados e não evidência de execução.

**Dependência externa C1**: catálogo e busca de produtos ainda não estão disponíveis. Antes das tarefas marcadas **C1**, a feature responsável deve fornecer identificadores estáveis de produto e oferta, loja, preço, disponibilidade, estado de referência removida e busca por produto. A tabela de promoções da 008 identifica ofertas promocionais com `product_name`, mas não fornece identidade de produto nem busca de catálogo: não tratá-la como catálogo completo nem criar correspondências fictícias.

**Formato**: `[P]` indica tarefas em arquivos diferentes que podem ser preparadas em paralelo depois das dependências indicadas. Os caminhos propostos são relativos à raiz e identificam arquivos existentes ou a criar; integrações com busca, story e detalhe dependem dos caminhos que a feature de catálogo fornecer.

## Phase 1: Setup

**Purpose**: Identificar a base existente e delimitar os pré-requisitos sem criar novos produtos ou serviços.

- [X] T001 Registrar em `specs/009-desejos-recomendacoes/quickstart.md` a dependência C1, a presença da fonte limitada de promoções da 008, o reaproveitamento da conta da 004 e as condições que impedem demonstração ponta a ponta enquanto o catálogo não existir.
- [X] T002 Examinar `backend/supabase/migrations/` e registrar em `backend/supabase/README.md` a necessidade de reservar a próxima numeração livre para as migrações de desejos e histórico; não renumerar nem alterar as migrações existentes da 008.

## Phase 2: Foundational

**Purpose**: Preparar fronteiras comuns de catálogo, autorização e comportamento em falhas. As histórias que acessam produtos e ofertas dependem de C1; não criar uma fonte paralela de catálogo para desbloqueá-las.

- [X] T003 [P] Criar `backend/src/application/ports/catalog-reader.ts` com interface para identificar produto, oferta, loja, preço e disponibilidade, distinguir referência indisponível e buscar produtos; não implementar dados fictícios nem equiparar ofertas promocionais a produtos de catálogo.
- [X] T004 [P] Criar `frontend/src/features/catalog-integration/repositories/catalog.repository.js` como fronteira de consumo dos futuros contratos de catálogo e busca, comunicando indisponibilidade quando o provedor não estiver configurado; não produzir resultados simulados.
- [ ] T005 Documentar em `specs/009-desejos-recomendacoes/contracts/api.md` os contratos efetivamente fornecidos pela feature de catálogo, incluindo identificadores, pesquisa, referência removida e relevância, somente após C1 estar disponível; até então, manter C1 como bloqueio explícito.
- [ ] T006 Integrar a fronteira de `backend/src/application/ports/catalog-reader.ts` ao provedor real em `backend/src/infrastructure/catalog/catalog-reader.ts` somente após T005 e C1; sem provedor, retornar indisponibilidade e não confirmar dados de catálogo.

**Checkpoint**: T003–T004 podem ser preparadas sem C1. T005–T006 e todas as tarefas de integração dependentes permanecem bloqueadas até os contratos externos existirem.

## Phase 3: User Story 1 — Guardar e consultar desejos (P1)

**Goal**: Salvar produto ou oferta como desejos independentes, sincronizados e privados.

**Independent Test**: Critério independente: salvar um produto e uma oferta dele, entrar em outra sessão da mesma conta e removê-los individualmente; outra conta não acessa os desejos. Requer identidade e C1; não representa execução de teste.

- [X] T007 [P] [US1] Criar `backend/src/domain/wishes/wish.ts` com as regras do [modelo](data-model.md): tipo “Produto ou oferta”; referência “Identificador do produto ou da oferta escolhida, compatível com o tipo”; proprietário “Conta autenticada”; data “Momento confirmado do registro”.
- [X] T008 [P] [US1] Criar `frontend/src/features/wishes/repositories/wish.repository.js` para consultar, salvar e remover desejos privados usando `frontend/src/shared/services/http-client.js`, mantendo estados de erro e resultado desconhecido sem afirmar sucesso.
- [ ] T009 [US1] Criar `backend/supabase/migrations/0019_consumer_wishes.sql`, após T002, T005 e C1, confirmando antes que `0019` continua livre: registrar identificador, proprietário autenticado, tipo e referência compatível e data; unicidade por proprietário/tipo/referência; produto e oferta coexistem; restringir acesso direto e preservar referência removida conforme o contrato de catálogo, sem apagá-la silenciosamente.
- [ ] T010 [US1] Criar `backend/src/application/ports/wish-repository.ts` e `backend/src/infrastructure/supabase/wish.repository.ts` após T007 e T009, isolando toda leitura e mutação pelo proprietário validado; não confiar em `userId` enviado pelo cliente e não depender de RLS para cliente privilegiado.
- [ ] T011 [US1] Criar `backend/src/application/services/wish.service.ts` após T006 e T010: validar tipo e referência no catálogo, preservar independência entre produto e oferta, evitar duplicatas e reexecução atrasada de intenção anterior, e retornar indisponibilidade quando o catálogo não confirmar o item.
- [ ] T012 [US1] Criar `backend/src/presentation/http/controllers/wish.controller.ts` e integrar operações privadas de consulta, gravação e remoção em `backend/src/presentation/http/routes/me.routes.ts`, `backend/src/presentation/http/controllers/context.ts` e `backend/src/app.ts` após T011; derivar conta de `requireAuth`, preservar proteção de origem e ausência de cache e não revelar dados de outra conta.
- [X] T013 [P] [US1] Criar `frontend/src/features/wishes/views/WishToggle.jsx` com escolha acessível entre produto e oferta, estado confirmado independente por tipo e mensagens de operação pendente, falha e sessão ausente, conforme `contracts/ui.md`.
- [ ] T014 [US1] Criar `frontend/src/features/wishes/viewmodels/useWishesViewModel.js` após T008 e T012, reconciliando a lista após resposta perdida e mantendo separados os estados de produto e oferta sem confirmação antecipada.
- [ ] T015 [US1] Criar `frontend/src/features/wishes/views/WishesView.jsx` após T013–T014 com lista privada, remoção individual, identificação de tipo, estado vazio e tentativa após falha; usar os dados confirmados sem inventar preço ou loja.
- [ ] T016 [US1] Integrar `frontend/src/features/wishes/views/WishesView.jsx` à navegação autenticada em `frontend/src/app/App.jsx` e `frontend/src/shared/components/BottomNav.jsx` após T015, preservando Início, Mapa e as alterações existentes de promoções da 008.
- [ ] T017 [US1] Integrar `frontend/src/features/wishes/views/WishToggle.jsx` às telas reais de story e detalhe fornecidas por C1 após T013–T016; registrar os caminhos concretos em `specs/009-desejos-recomendacoes/contracts/ui.md`, sem criar telas de catálogo fictícias.

**Checkpoint**: US1 depende de C1 e da conta autenticada. As partes de interface e fronteira sem catálogo podem ser preparadas separadamente, mas não representam um fluxo concluído.

## Phase 4: User Story 2 — Consultar informações conhecidas do desejo (P1)

**Goal**: Apresentar dados confirmados da oferta e comunicar referências ausentes sem inferir equivalência, menor preço ou variação.

**Independent Test**: Critério independente: consultar desejo com oferta conhecida e outro com referência removida ou informação ausente, distinguindo os estados sem dados inventados. Depende de desejos da US1 e C1; não representa execução de teste.

- [ ] T018 [P] [US2] Criar `frontend/src/features/wishes/views/WishOfferDetails.jsx` para apresentar loja, preço e disponibilidade conhecidos, identificar demonstração e explicar dados ausentes com texto acessível; não calcular melhor oferta ou queda sem regras válidas.
- [ ] T019 [US2] Atualizar `backend/src/application/services/wish.service.ts` após T011 e T006 para enriquecer desejos com dados atuais do catálogo e distinguir oferta indisponível, removida e falha de consulta; preservar o vínculo sem inventar equivalência.
- [ ] T020 [US2] Atualizar `backend/src/presentation/http/controllers/wish.controller.ts` após T012 e T019 para devolver o estado conhecido e erros de fonte sem converter falha em lista vazia nem expor dados de outra conta.
- [ ] T021 [US2] Integrar `frontend/src/features/wishes/views/WishOfferDetails.jsx` em `frontend/src/features/wishes/views/WishesView.jsx` após T015, T018 e T020, distinguindo dado ausente de carregamento/falha e sem alterar o comportamento de remoção independente.

## Phase 5: User Story 3 — Descobrir recomendações (P2)

**Goal**: Manter buscas e visualizações até exclusão individual e mostrar, sem interromper navegação, recomendações baseadas somente em buscas de produtos existentes.

**Independent Test**: Critério independente: registrar busca e visualização, consultar sugestões relacionadas à busca, apagar uma entrada por vez e confirmar que a busca apagada deixa de influenciar novas sugestões; sem busca, explorar categorias. Requer C1; não representa execução de teste.

- [X] T022 [P] [US3] Criar `backend/src/domain/history/history-entry.ts` com as regras do [modelo](data-model.md): tipo “Busca de produto ou visualização de produto/oferta”; conteúdo “Termo pesquisado ou referência visualizada, conforme o tipo, originado de interação efetiva”; proprietário “Conta autenticada”; data “Momento da interação registrada”.
- [X] T023 [P] [US3] Criar `frontend/src/features/history/repositories/history.repository.js` para consultar e excluir entradas individualmente e registrar interações pela API autenticada, com tratamento de confirmação, falha e resposta desconhecida.
- [ ] T024 [US3] Criar `backend/supabase/migrations/0020_consumer_history.sql` após T002 e C1, confirmando numeração livre depois de T009: persistir identificador individual, conta, tipo, conteúdo e data; manter entradas até exclusão individual; não criar expiração automática, compra ou opção de desativar o uso das buscas.
- [ ] T025 [US3] Criar `backend/src/application/ports/history-repository.ts` e `backend/src/infrastructure/supabase/history.repository.ts` após T022 e T024, filtrando por conta validada e identificador; impedir que repetição de operação anterior recrie uma entrada já excluída, sem bloquear uma nova interação real.
- [ ] T026 [US3] Criar `backend/src/application/services/history.service.ts` após T025 para registrar buscas e visualizações reais, excluir uma entrada própria por vez e assegurar que uma busca excluída não permaneça como sinal de recomendação, inclusive em dados derivados.
- [ ] T027 [US3] Criar `backend/src/presentation/http/controllers/history.controller.ts` e integrar consulta, registro e exclusão em `backend/src/presentation/http/routes/me.routes.ts`, `backend/src/presentation/http/controllers/context.ts` e `backend/src/app.ts` após T026; preservar as rotas 004/008, autorização por sessão e confirmação apenas após persistência.
- [ ] T028 [US3] Integrar o registro de busca e visualização às telas e eventos reais de catálogo fornecidos por C1 usando `frontend/src/features/history/repositories/history.repository.js` após T023 e T027; atualizar os caminhos concretos em `specs/009-desejos-recomendacoes/contracts/ui.md` e não registrar busca de lojas como busca de produtos.
- [X] T029 [P] [US3] Criar `frontend/src/features/history/views/HistoryView.jsx` com buscas e visualizações distintas, exclusão por entrada e estados acessíveis de carregamento, vazio, falha e conexão; não apresentar opção para desativar o uso das buscas.
- [ ] T030 [US3] Criar `frontend/src/features/history/viewmodels/useHistoryViewModel.js` após T023 e T027, conciliando exclusão confirmada e respostas antigas, mantendo as demais entradas e permitindo nova tentativa após falha.
- [ ] T031 [US3] Integrar `frontend/src/features/history/views/HistoryView.jsx` com T030 e à navegação autenticada em `frontend/src/app/App.jsx` após T016, T029 e T030, preservando provedores e rotas existentes da 008.
- [ ] T032 [US3] Criar `backend/src/application/services/recommendation.service.ts` após T006 e T026 para selecionar somente produtos relacionados a buscas ainda existentes da própria conta usando a relevância da busca disponibilizada por C1; não usar desejos, interesses, visualizações ou compras como sinais, nem inventar correspondências.
- [ ] T033 [US3] Criar `backend/src/presentation/http/controllers/recommendation.controller.ts` e integrar leitura privada em `backend/src/presentation/http/routes/me.routes.ts`, `backend/src/presentation/http/controllers/context.ts` e `backend/src/app.ts` após T027 e T032; sem buscas, retornar estado vazio distinto de indisponibilidade do catálogo.
- [ ] T034 [US3] Criar `frontend/src/features/recommendations/repositories/recommendation.repository.js` após T033 para consultar recomendações da conta e ignorar respostas obsoletas após exclusão de busca ou troca de sessão.
- [ ] T035 [US3] Criar `frontend/src/features/recommendations/views/RecommendationsSection.jsx` e `frontend/src/features/recommendations/viewmodels/useRecommendationsViewModel.js` após T034 para apresentar uma seção discreta do Início, sem interromper navegação, com estados de vazio e falha e apenas dados confirmados.
- [ ] T036 [US3] Integrar `frontend/src/features/recommendations/views/RecommendationsSection.jsx` em `frontend/src/features/home/views/HomeView.jsx` após T035, preservando o diálogo de promoções da 008 e permitindo explorar categorias quando não houver busca ou correspondência.

## Phase 6: Polish & Cross-Cutting

- [ ] T037 Atualizar `docs/frontend.md` e `specs/009-desejos-recomendacoes/contracts/ui.md` com a divergência do protótipo e a escolha entre produto/oferta, histórico individual e seção discreta; identificar o que foi efetivamente implementado.
- [ ] T038 Atualizar `specs/009-desejos-recomendacoes/quickstart.md` e `backend/supabase/README.md` com comandos, numeração efetiva de migrações, contratos reais de C1 e limitações operacionais, sem afirmar configuração ou aplicação de migrações que não ocorreu.
- [ ] T039 Compilar os workspaces alterados conforme `README.md`, revisar o diff dos arquivos de `backend/src/app.ts` e `frontend/src/app/App.jsx` para preservar as integrações 008 e registrar em `specs/009-desejos-recomendacoes/quickstart.md` os resultados reais da construção, sem executar ou alegar testes funcionais.

## Dependencies & Execution Order

1. **Setup e fundação**: T001–T002 → T003/T004 em paralelo; T005–T006 aguardam C1. A numeração de T009 e T024 deve ser conferida no momento da implementação.
2. **US1**: T007/T008/T013 podem ser preparados em arquivos distintos após fundação aplicável; T009–T012 dependem de C1 e da ordem de dados → serviço → rotas. T014–T017 integram as camadas e as telas reais.
3. **US2**: depende do vínculo e consulta de US1 e dos dados confirmados de C1; T018 pode ser preparado em paralelo à integração de dados T019, mas T021 aguarda ambos.
4. **US3**: T022/T023/T029 podem ser preparados em arquivos distintos; histórico persistido, coleta e recomendações aguardam C1. T024 → T025 → T026 → T027 antecedem registro e interface; T032 → T033 → T034 → T035 → T036 antecedem o Início.
5. **Arquivos compartilhados**: mudanças em `backend/src/app.ts`, `backend/src/presentation/http/controllers/context.ts`, `backend/src/presentation/http/routes/me.routes.ts`, `frontend/src/app/App.jsx` e `frontend/src/features/home/views/HomeView.jsx` devem ser serializadas e preservar trabalho já feito na 008.
6. **Polish**: T037–T039 seguem os incrementos desejados. A ausência de C1 bloqueia apenas tarefas que precisam da fonte, não exige criar um segundo catálogo.

## Parallel Example: US1

Após T003–T004, preparar T007 no domínio, T008 no repositório do frontend e T013 no componente de escolha em paralelo. A migração e o serviço esperam os contratos de C1; a integração T014–T017 é sequencial.

## Parallel Example: US2

Após US1 e C1, preparar T018 no componente de dados em paralelo com T019 no serviço de leitura. T020 segue T019 e T021 integra ambos após T018 e T020.

## Parallel Example: US3

Depois da fundação aplicável, preparar T022, T023 e T029 em arquivos distintos. Não paralelizar integrações que compartilham os arquivos listados acima; T032 depende de histórico e catálogo reais.

## Implementation Strategy

1. **MVP sugerido**: fundação e US1, com os estados mínimos necessários para identificar e remover desejos; sua conclusão ponta a ponta depende de C1.
2. **Incremento de dados**: US2 apresenta informações conhecidas sem inferir equivalência ou melhor preço.
3. **Incremento de descoberta**: US3 adiciona histórico individual e recomendações derivadas somente de buscas, com dependência de C1 e apresentação discreta.
4. **Fechamento**: atualizar documentação e compilar após a implementação, conforme a política sem testes. Nenhuma das ações acima é executada por esta geração de tarefas.
