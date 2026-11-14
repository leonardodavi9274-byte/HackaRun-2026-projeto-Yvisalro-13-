---
description: "Tarefas para busca pública, catálogo demonstrativo e comparação de ofertas"
---

# Tasks: Busca e comparação de produtos

**Input**: [spec](spec.md), [plan](plan.md), [research](research.md), [data-model](data-model.md), [API](contracts/api.md), [interface](contracts/ui.md) e [quickstart](quickstart.md).

**Organização**: histórias P1 agrupadas por fluxo; os caminhos são relativos à raiz. `[P]` identifica tarefas que podem ocorrer ao mesmo tempo somente após seus predecessores e sem edição simultânea de arquivos compartilhados. Dependências explícitas complementam as barreiras de fase.

**Política de testes**: a constituição estabelece fluxo sem testes manuais ou automatizados como etapa padrão. Os critérios independentes abaixo descrevem resultados esperados, não tarefas de teste nem comprovação de execução. Compilar não comprova que migração, Supabase ou cenários funcionem.

**Barreira de dados e implantação**: a 008 já consulta `published_promotional_offers` em código. Criar estrutura e adaptador localmente não autoriza iniciar migração remota. A aplicação de migração/corte no ambiente da equipe é operação separada e depende do procedimento, acesso autorizado, backup, mapeamento de cada oferta, consumidores em indisponibilidade controlada e implantação coordenada. Sem isso, registrar limitação e não marcar o corte como concluído. Nunca trocar para duas fontes autoritativas, fazer escrita dupla ou migrar automaticamente por nome.

**Numeração das migrações**: o checkout contém 0001–0018; a 009 planeja 0019. T001 confirma o estado antes de criar `backend/supabase/migrations/0019_catalog_foundation.sql` e `backend/supabase/migrations/0020_catalog_demo.sql`. Se esses números não estiverem livres no momento da implementação, usar os próximos números disponíveis, atualizar todas as referências deste roteiro e não sobrescrever migrações existentes ou aplicadas.

## Phase 1: Setup

**Purpose**: confirmar dependências e preparar o corte sem modificar serviços remotos.

- [X] T001 Registrar em `specs/010-busca-comparacao-produtos/quickstart.md` a revisão dos arquivos de migração locais e do trabalho da 009, os próximos dois números livres e o estado conhecido da configuração; não presumir migrações remotas aplicadas nem divulgar credenciais.
- [X] T002 Criar `docs/migracao-catalogo-promocoes.md` com inventário pré-corte, janela de indisponibilidade, backup, mapeamento explícito por ID, contagens/integridade, implantação coordenada do adaptador 008 e reversão sem perda de alterações novas; bloquear IDs desconhecidos e indicar responsável pela execução autorizada. (Dep.: T001.)
- [X] T003 [P] Atualizar `specs/010-busca-comparacao-produtos/contracts/api.md` com contratos públicos `GET /catalog/products/{id}` e `GET /catalog/offers/{id}` necessários ao provedor da 009: referência distinta `found/missing/unavailable`, falha de fonte 503, sem expor dados privados e sem confundir produto com oferta.

## Phase 2: Foundational — catálogo e compatibilidade compartilhados

**Purpose**: preparar identidade, persistência, transição segura e fronteiras comuns antes das histórias.

- [X] T004 Criar `backend/supabase/migrations/0019_catalog_foundation.sql`, após confirmar T001: reutilizar `interest_categories`; tipo com “identificação estável, nome e referência obrigatória à categoria”; produto com “ID estável, nome não vazio, categoria, tipo, indicação de demonstração e estado de publicação”; variante com “ID estável, produto de origem, características cadastradas como cor e tamanho e rótulo suficiente para distinguir variantes”; exigir “ao menos uma variante por produto ofertado” e variante padrão explícita quando sem opções; termo sinônimo cadastrado ligado explicitamente a produto ou categoria. (Dep.: T001.)
- [X] T005 Complementar `backend/supabase/migrations/0019_catalog_foundation.sql` com oferta canônica: “ID estável, distinto de produto e variante”; “`variantId`, `storeId` obrigatórios”; “`priceCents` inteiro não negativo ou nulo se desconhecido”; disponibilidade `available`, `unavailable` ou `unknown`; `published`, `isDemo` obrigatórios e `revision` inteiro positivo; preço anterior, início/fim e atualização opcionais, desconto somente com anterior maior que preço atual conhecido e vigência coerente. Impor integridade entre tipo e categoria, lojas, variantes e produtos; RLS e revogar leitura/escrita direta `anon`/`authenticated`, mantendo acesso do servidor. (Dep.: T004.)
- [X] T006 Complementar `backend/supabase/migrations/0019_catalog_foundation.sql` com migração transacional de todas as linhas da 008 por mapa explícito de ID para produto e variante; prever `cafe-demo-grao-fino` do seed 0018, preservar ID, loja, categoria do produto, preço, disponibilidade, vigência, publicação, demonstração, atualização e revisão; abortar listando IDs órfãos ou não mapeados, validar cobertura/contagens e não inferir equivalência pelo nome. Incluir incremento atômico da revisão da oferta quando oferta ou campos projetados de produto/variante/categoria mudarem. (Dep.: T002, T005.)
- [X] T007 Criar `backend/supabase/migrations/0020_catalog_demo.sql` após confirmar T001: inserir dados explicitamente fictícios e identificadores estáveis, nome/categoria/tipo/sinônimos; mesma variante com ofertas em `passo-firme` e `corre-tenis`, outra variante ou produto na mesma categoria e exemplos de preço e disponibilidade desconhecidos; não sobrescrever registros da migração nem inventar preço de uma oferta migrada. (Dep.: T006.)
- [X] T008 [P] Criar `backend/src/domain/catalog/catalog.ts` com tipos e validação compartilhados de produto, variante, categoria, tipo, sinônimo, oferta, demonstração, publicação e revisão; preservar os estados e as restrições de T004–T005, distinguindo ausente de inválido. (Dep.: T005.)
- [X] T009 [P] Criar `backend/src/application/ports/catalog-repository.ts` com leitura de snapshot completo de categorias, produtos, variantes, ofertas e lojas do shopping ativo; identificar referência removida, indisponível e falha de fonte sem converter erro em vazio; evitar expor chaves privadas. (Dep.: T005.)
- [X] T010 Criar `backend/src/infrastructure/supabase/catalog.repository.ts`: implementar T009 usando snapshot consistente em uma consulta, sem truncar pelo limite de linhas e com rejeição integral de falha; limitar a exposição pública a entidades publicadas e lojas/shopping ativos, preservando registros não publicados internamente para distinguir referência indisponível, sem depender de mapa válido para buscar. (Dep.: T006, T008, T009.)
- [X] T011 Adaptar `backend/src/infrastructure/supabase/promotion.repository.ts` para ler somente a oferta canônica de T010 e projetar exatamente os campos exigidos por `backend/src/domain/promotions/promotion.ts`; preservar `id`, `revision`, categoria do produto, elegibilidade da 008 e 404/409/503, rejeitando preço/estoque desconhecidos como candidatas promocionais. (Dep.: T006, T010.)
- [X] T012 Adaptar `backend/src/application/ports/catalog-reader.ts` e criar `backend/src/infrastructure/supabase/catalog-reader.ts`: implementar `findProduct` e `findOffer` e preparar `searchProducts` para receber o serviço real da US1 em T024; até a conexão, rejeitar indisponibilidade em vez de criar resultados. Preservar `found/missing/unavailable`, falhas de fonte, IDs distintos e dados conhecidos; não afirmar que desejos ou histórico foram implementados. (Dep.: T008–T010.)
- [X] T013 Criar `backend/src/application/services/catalog-reference.service.ts` para consultar categorias, produto, oferta e identidade básica de variante; distinguir referência conhecida indisponível, ausente e falha; validar publicação sem exigir sessão. (Dep.: T008–T010.)
- [X] T014 Criar `backend/src/presentation/http/controllers/catalog.controller.ts` e `backend/src/presentation/http/routes/catalog.routes.ts` com GETs públicos de categorias, produto, oferta e base da variante, `{data}`, `400`, `404`, `503` e `no-store`; não ativar histórico nem exigir autenticação; a base da variante é estendida na US3 para incluir ofertas comparáveis. (Dep.: T003, T013.)
- [X] T015 Integrar `backend/src/app.ts` e `backend/src/presentation/http/routes/index.ts`: compor repositório de catálogo, `CatalogReader`, serviço e rotas de T014; usar T011 para promoções, preservar tratamento de erro e chaves somente no servidor. A implantação conjunta com T006 é bloqueada pelo procedimento de T002. (Dep.: T010–T014.)
- [X] T016 [P] Criar `frontend/src/features/catalog/repositories/catalog.repository.js` com chamadas públicas usando `frontend/src/shared/services/http-client.js`, `AbortSignal` e `no-store` para categorias, busca, variante, similares, produto e oferta; distinguir falha de rede, 404, 503 e lista vazia. (Dep.: T003.)
- [X] T017 Criar provedor real em `frontend/src/features/catalog-integration/repositories/catalog.repository.js` sobre T016, preservando `findProduct/findOffer/searchProducts`, estado da referência e falha; não criar desejos, registros de histórico ou integração falsa da 009. (Dep.: T012, T016.)
- [X] T018 Criar `frontend/src/features/catalog/views/VariantDetailView.jsx` como estrutura compartilhada com identificação de produto/variante, estado de carregamento/404/503 e regiões explícitas para semelhantes e comparação; atender acesso direto por ID sem depender de busca anterior. (Dep.: T014, T016.)
- [X] T019 Integrar `frontend/src/app/App.jsx` para resolver `/produto/{variantId}` antes de espera/erro de sessão e renderizar T018 com ID decodificado; preservar guards de conta, mapa, rota e providers. (Dep.: T018.)

**Checkpoint**: o código de base e adaptador 008 podem ser preparados localmente; uso real depende de corte coordenado, dados e configuração. A referência básica da variante permite às histórias acrescentarem valor sem exigir execução da busca.

## Phase 3: User Story 1 — Encontrar produtos (P1)

**Goal**: visitante encontra ofertas por nome, categoria e sinônimos e aplica filtros; loja é identificada sob produto.

**Independent Test**: critério de aceite — com catálogo de demonstração acessível, pesquisar parte do nome ou sinônimo e filtrar tipo/preço, identificando a loja e o estado de cada resultado sem fazer login.

- [X] T020 [P] [US1] Criar `backend/src/domain/catalog/search.ts` com normalização NFD, remoção de acentos, minúsculas pt-BR e trim; correspondência por substring em nome, sinônimo cadastrado e categoria, melhor relevância nome → sinônimo → categoria e nível neutro sem texto. (Dep.: T008.)
- [X] T021 [P] [US1] Criar `backend/src/domain/catalog/suggestions.ts`: candidatos de uma palavra cadastrada, normalizada, com pelo menos quatro letras e distância de edição 1; ordenar por distância e termo, retornar no máximo uma sugestão sem execução automática; `têns` encontra `tênis`. (Dep.: T008.)
- [X] T022 [US1] Criar `backend/src/application/services/catalog-search.service.ts`: combinar texto, categoria, tipo pertencente à categoria e mínimo/máximo inteiros não negativos em centavos inclusivos; rejeitar mínimo maior que máximo e excluir preço nulo com filtro ativo; buscar sugestão no catálogo antes dos filtros apenas quando texto não corresponder. (Dep.: T010, T020, T021.)
- [X] T023 [US1] Complementar `backend/src/application/services/catalog-search.service.ts` com ordem disponível → esgotado → desconhecido; disponíveis por relevância, nome de categoria, preço conhecido crescente e nulo por último dentro da categoria, desempate produto/loja/ID; demais grupos por loja e ID. Aplicar filtros e ordem ao conjunto completo sem truncar. (Dep.: T022.)
- [X] T024 [US1] Ampliar `backend/src/presentation/http/controllers/catalog.controller.ts` e `backend/src/presentation/http/routes/catalog.routes.ts` com `GET /catalog/offers`: traduzir parâmetros e `400 INVALID_CATALOG_FILTER`, `200` vazio e `503 CATALOG_UNAVAILABLE`; conectar o serviço T023 ao `searchProducts` em `backend/src/infrastructure/supabase/catalog-reader.ts` e à composição em `backend/src/app.ts`, mantendo falhas distintas; não registrar texto de pesquisa em logs. (Dep.: T012, T014, T015, T023.)
- [X] T025 [P] [US1] Criar `frontend/src/features/catalog/models/search-filters.js` para conversão de reais para centavos sem imprecisão, mínimo/máximo opcionais e inclusivos, valores não negativos, relação categoria/tipo e mínimo ≤ máximo; preservar rascunho inválido com mensagem. (Dep.: T016.)
- [X] T026 [P] [US1] Criar `frontend/src/features/catalog/views/OfferCard.jsx`: produto/variante, loja abaixo do produto, preço e disponibilidade conhecidos ou desconhecidos, promoção somente coerente/vigente, selo fictício, link para detalhe e rótulos acessíveis sem depender apenas de cor. (Dep.: T016.)
- [X] T027 [US1] Criar `frontend/src/features/catalog/viewmodels/useCatalogSearchViewModel.js` para carregar categorias e ofertas por T016, combinar filtros T025, cancelar ou ignorar respostas obsoletas, distinguir carregamento/vazio/sem rede/erro e repetir consulta ao escolher sugestão explicitamente. (Dep.: T016, T024, T025.)
- [X] T028 [US1] Criar `frontend/src/features/catalog/views/CatalogSearchView.jsx` com busca, categorias, tipo, preços mínimo/máximo, filtros ativos/limpar, correção acessível, lista T026, estados e nova tentativa; apresentar erro de faixa sem aplicar valor inválido. (Dep.: T026, T027.)
- [X] T029 [US1] Atualizar `frontend/src/app/App.jsx` para resolver `/buscar` antes dos estados de sessão e `frontend/src/features/home/views/ProjectHomeView.jsx` para oferecer acesso público e remover alegação obsoleta de busca planejada; adicionar entrada em `frontend/src/features/home/views/HomeView.jsx` sem declarar desejos/alertas implementados. (Dep.: T019, T028.)
- [X] T030 [US1] Criar `frontend/src/styles/catalog.css` e importá-lo em `frontend/src/app/App.jsx` para busca e cards responsivos, teclado/foco visível, estados acessíveis e loja logo abaixo do produto. (Dep.: T026, T028, T029.)

**Checkpoint**: US1 tem busca pública e filtros; comparação completa e semelhantes são entregues nas fases seguintes. T019 oferece estrutura de detalhe diretamente acessível.

## Phase 4: User Story 2 — Consultar produtos semelhantes (P1)

**Goal**: mostrar alternativas da mesma categoria sem afirmar que sejam o mesmo item.

**Independent Test**: critério de aceite — abrir diretamente uma variante cadastrada e reconhecer outra variante ou produto da mesma categoria como alternativa; sem alternativas, apresentar estado correspondente.

- [X] T031 [P] [US2] Criar `backend/src/application/services/catalog-similar.service.ts` para usar snapshot T010, obter outras variantes da mesma categoria, excluir somente a variante consultada, manter outra variante do mesmo produto e retornar ofertas conhecidas sem inferir equivalência. (Dep.: T010.)
- [X] T032 [US2] Ampliar `backend/src/presentation/http/controllers/catalog.controller.ts` e `backend/src/presentation/http/routes/catalog.routes.ts` com `GET /catalog/variants/{variantId}/similar`, erro 404 para referência ausente e 503 para falha, lista vazia somente em consulta bem-sucedida. (Dep.: T024, T031.)
- [X] T033 [P] [US2] Criar `frontend/src/features/catalog/views/SimilarProducts.jsx` com alternativas da mesma categoria, identificações de produto/variante/loja conhecidas, link de detalhe, estado vazio e texto que as distingue de ofertas idênticas. (Dep.: T016, T026.)
- [X] T034 [US2] Ampliar `frontend/src/features/catalog/views/VariantDetailView.jsx` para carregar T032 com T016 e apresentar T033, cancelando respostas obsoletas e distinguindo erro/sem rede de vazio; garantir abertura direta e uso sem sessão. (Dep.: T018, T032, T033.)
- [X] T035 [US2] Ampliar `frontend/src/styles/catalog.css` para a seção de semelhantes e estados acessíveis sem alterar a apresentação da loja abaixo do produto. (Dep.: T030, T034.)

**Checkpoint**: US2 pode ser consultada por URL direta após a base, sem exigir a tela de busca; os arquivos compartilhados são integrados na sequência indicada.

## Phase 5: User Story 3 — Comparar ofertas de lojas (P1)

**Goal**: reunir ofertas da mesma variante, identificar lojas e permitir seguir ao mapa.

**Independent Test**: critério de aceite — abrir diretamente uma variante oferecida por duas lojas e identificar os valores conhecidos, a ordem por disponibilidade e o destino correto de cada loja.

- [X] T036 [P] [US3] Criar `backend/src/application/services/catalog-comparison.service.ts`: reunir apenas ofertas publicadas da mesma variante e produto, não associar outra variante por nome; disponíveis por preço conhecido crescente e depois preço nulo, esgotadas e desconhecidas por nome de loja/ID sem ordenar por preço; preservar informação desconhecida. (Dep.: T010.)
- [X] T037 [US3] Ampliar `backend/src/presentation/http/controllers/catalog.controller.ts` e `backend/src/presentation/http/routes/catalog.routes.ts` para `GET /catalog/variants/{variantId}` retornar produto, variante e ofertas de T036, com identificação de loja, preço/estoque, demonstração e promoção válida quando conhecida; manter 404/503. (Dep.: T032, T036.)
- [X] T038 [P] [US3] Criar `frontend/src/features/catalog/views/OfferComparison.jsx` para apresentar ofertas na ordem da API, loja sob produto, valores/estoque desconhecidos explicitamente, informação promocional coerente e ação individual para a loja. (Dep.: T016, T026.)
- [X] T039 [US3] Ampliar `frontend/src/features/catalog/views/VariantDetailView.jsx` para carregar e compor T038 com T033, sem misturar ofertas equivalentes e alternativas; manter erros e acesso público ao abrir diretamente. (Dep.: T034, T037, T038.)
- [X] T040 [US3] Ampliar `frontend/src/features/catalog/views/OfferComparison.jsx` para consultar posição confirmada no mapa existente, encaminhar a `/mapa?loja={storeId}` da oferta selecionada quando disponível e explicar `Localização no mapa indisponível` caso contrário; nunca iniciar rota automaticamente nem inventar piso/distância. (Dep.: T038, T039.)
- [X] T041 [US3] Ampliar `frontend/src/styles/catalog.css` para comparação e navegação de loja com foco, rótulos e estados que não dependem só de cor. (Dep.: T035, T040.)
- [X] T042 [US3] Atualizar `backend/src/application/services/promotion.service.ts` e `backend/src/infrastructure/supabase/promotion.repository.ts` somente se necessário para preservar a leitura da mesma oferta canônica, revisão e contrato da 008 após o corte; manter confirmação, vigência e supressão de pop-up em rota ativa, sem ajustar elegibilidade para acomodar preço ou estoque desconhecido. (Dep.: T011, T015, T037.)

**Checkpoint**: US3 funciona por URL direta após a base; a implementação completa depende também da migração coordenada e da configuração efetiva do ambiente.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: manter rastreabilidade, compatibilidade e relato fiel do estado.

- [X] T043 Atualizar `docs/frontend.md` com as telas 05/06, busca pública, loja abaixo do produto, ordem de disponibilidade da 010 e divergência do rótulo antigo do protótipo; preservar as imagens e diferenciar desenho de funcionalidade implementada. (Dep.: T029, T034, T039.)
- [X] T044 Atualizar `backend/README.md`, `backend/supabase/README.md` e `frontend/README.md` com rotas e configuração efetivas, dependência de migração/corte, acesso público, limitação de dados e comandos; não informar aplicação remota ou funcionamento sem confirmação. (Dep.: T015, T029, T039, T042.)
- [X] T045 Atualizar `specs/009-desejos-recomendacoes/contracts/api.md` e `specs/009-desejos-recomendacoes/quickstart.md` com os contratos de produto/oferta e busca realmente fornecidos por T012–T017, preservando a distinção entre catálogo disponível, integração ainda pendente da 009 e referência ausente; não marcar tarefas da 009 como concluídas automaticamente. (Dep.: T012, T017, T024.)
- [X] T046 Atualizar `specs/010-busca-comparacao-produtos/quickstart.md` com caminhos, migrações e comandos finais e em `docs/migracao-catalogo-promocoes.md` registrar prontidão ou bloqueio exato do corte, backup e reversão; não aplicar serviços remotos como parte da redação. (Dep.: T002, T006, T042.)
- [X] T047 Executar `npm run build` na raiz conforme `package.json` após as alterações; registrar resultado em `specs/010-busca-comparacao-produtos/quickstart.md` com falhas e limitações, sem caracterizar compilação como teste funcional. (Dep.: T030, T035, T041, T042.)
- [X] T048 Revisar `specs/010-busca-comparacao-produtos/quickstart.md` e `docs/migracao-catalogo-promocoes.md` contra FR-001–FR-016 e a constituição; registrar explicitamente ausência de testes, configuração/migração remota e funcionalidades ainda não integradas, sem alegar cenários executados. (Dep.: T043–T047.)

## Dependencies & Execution Order

### Phase Dependencies

- Fase 1 → Fase 2 → histórias. A base é compartilhada; trabalho de fonte/promoções e histórias pode ser desenvolvido localmente, mas não implantado com a migração sem o corte de T002.
- Fase 3 entrega busca; Fase 4 pode usar a base e URL direta, mas T032/T034/T035 aguardam edições anteriores nos arquivos compartilhados. Fase 5 pode começar seu serviço independente T036 após a base; integração final aguarda T034 e T032.
- Fase 6 depende das tarefas referenciadas. T048 depende de documentação e compilação, não de aplicação remota ou testes que não foram autorizados como etapa do fluxo.
- A conclusão completa de FR-013 exige que a integração com promoção e o corte efetivo tenham ocorrido no ambiente pretendido. Quando faltar acesso, backup, mapeamento, janela ou configuração, a implementação pode avançar localmente, mas o corte e a demonstração ponta a ponta permanecem explicitamente pendentes.

### User Story Dependencies

| História | Resultado independente | Dependências reais |
| --- | --- | --- |
| US1 | Busca pública, filtros, resultados e loja identificada. | Base T001–T019 e fonte de dados configurada. |
| US2 | Alternativas acessíveis diretamente pela variante. | Base; integração sequencial com T024/T030 nos arquivos compartilhados. |
| US3 | Comparação e mapa acessíveis diretamente pela variante. | Base; integração sequencial com T032/T034/T035. |

### Parallel Opportunities

- Após T001, T002 e T003 têm arquivos distintos; após T005, T008 e T009 também podem ser preparados separadamente.
- Após base estável, T020 e T021 são independentes; T025 e T026 também. Não editar simultaneamente `App.jsx` em T019/T029/T030.
- Para US2 e US3, T031 e T036 são serviços em arquivos distintos e podem avançar juntos; T033 e T038 são componentes diferentes. Integrar controllers, `VariantDetailView.jsx` e CSS sequencialmente nas ordens documentadas.
- As tarefas [P] não autorizam ignorar dependências diretas, barreiras ou alterações simultâneas no mesmo arquivo.

## Implementation Strategy

### MVP First

1. Preparar Fases 1 e 2, incluindo compatibilidade da 008 e procedimento de corte seguro.
2. Entregar US1 como primeiro incremento consultável; respeitar critérios de aceite como especificação, sem impor etapa de testes.
3. Acrescentar US2 e US3 para completar o escopo P1 solicitado; o primeiro incremento não representa toda a funcionalidade aprovada.
4. Realizar a documentação e a compilação previstas na Fase 6. O uso ponta a ponta permanece condicionado à configuração e ao corte autorizado do catálogo; não afirmar operação ou testes sem evidência.

### Incremental Delivery

- Dados e fronteiras compartilhados → busca pública → alternativas → comparação e mapa → documentação e compilação.
- Seguir o roteiro coordenado antes de alterar fonte da 008 em qualquer ambiente; preservar contrato, identidade e revisão em cada corte.
- Não criar testes, TDD, pagamento, administração de catálogo, alertas ou integração completa de desejos/histórico nesta geração.
