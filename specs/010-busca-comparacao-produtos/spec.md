# Feature Specification: Busca e comparação de produtos

**Feature Branch**: nenhuma branch criada nesta etapa; não há hook configurado.

**Created**: 2026-11-14

**Status**: Especificação concluída — pronta para planejamento

**Input**: Busca por texto, categorias e sinônimos, filtros de tipo e preço, produtos semelhantes e comparação de ofertas do mesmo produto em lojas diferentes. Exibir a loja identificada abaixo do produto.

**Referências**: [especificação geral](../001-vitrine-perto/spec.md), [mapa e rota](../005-mapa-rota-lojas/spec.md), [promoções próximas](../008-promocoes-proximas/spec.md), [desejos e recomendações](../009-desejos-recomendacoes/spec.md), [telas do produto](../../docs/frontend.md), [README](../../README.md) e [constituição](../../.specify/memory/constitution.md).

Este documento não afirma que o catálogo e a busca estejam implementados. Os cenários são critérios de aceite, não evidência de testes executados; aplica-se o fluxo sem testes previsto na constituição.

## Clarifications

### Sessão 2026-11-14

- A funcionalidade inclui um catálogo de demonstração com produtos e ofertas fictícios identificados. O cadastro e a atualização pelas lojas ficam para outra entrega.
- A busca consulta nomes, categorias e sinônimos cadastrados; texto, tipo e faixa de preço escolhidos são combinados, e os resultados devem atender aos filtros aplicados.
- Ofertas só são comparadas como o mesmo produto quando estiverem vinculadas ao mesmo produto e à mesma variante cadastrada. Cor, tamanho ou outra variante diferente pode aparecer como alternativa, sem ser considerada idêntica.
- O tipo é uma subdivisão da categoria, como corrida ou casual dentro de Tênis.
- Produtos semelhantes são produtos da mesma categoria, incluindo outras variantes do produto consultado; semelhança não implica equivalência para comparação.
- Na relevância, correspondências pelo nome do produto vêm primeiro, seguidas por sinônimos e, depois, por categoria.
- Quando houver sugestão adequada, a busca sugere correção de digitação; aceita partes de palavras e ignora diferenças de acentos e maiúsculas.
- Ofertas com preço ou disponibilidade desconhecidos são mostradas com indicação do dado ausente. Com filtro de preço ativo, ofertas sem preço conhecido não são incluídas. Ofertas com disponibilidade desconhecida vêm depois das disponíveis e das esgotadas; essa decisão específica ajusta a regra geral anterior de colocar esgotados por último.
- O filtro aceita preço mínimo, máximo ou ambos, incluindo os valores dos limites.
- A comparação mostra primeiro ofertas disponíveis, do menor para o maior preço; depois as esgotadas e, por fim, as de disponibilidade desconhecida.
- O catálogo de demonstração deve incorporar ou substituir os dados promocionais da feature 008, permitindo que busca e promoções usem os mesmos produtos e ofertas identificados.
- Quando um valor de preço for inválido ou o mínimo superar o máximo, informar o problema e pedir correção antes de aplicar o filtro.
- Na comparação, o preço ordena apenas as ofertas disponíveis.
- Qualquer visitante pode consultar a busca e a comparação sem entrar em uma conta.
- O usuário autorizou resolver detalhes de menor impacto a partir da documentação existente. Para completar a ordem, ofertas disponíveis sem preço conhecido ficam após as demais disponíveis; esgotadas e ofertas de disponibilidade desconhecida são ordenadas pelo nome da loja dentro do respectivo grupo. As três histórias são P1, acompanhando a prioridade da história geral de encontrar e comparar produtos da feature 001.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar produtos (Priority: P1)

Como consumidor, quero buscar por texto, categoria e sinônimos e filtrar por tipo e preço para encontrar opções.

**Why this priority**: A busca é o acesso principal aos produtos e integra a história P1 da especificação geral.

**Independent Test**: Critério independente: pesquisar termos e categorias presentes no catálogo e identificar os resultados e respectivas lojas.

**Acceptance Scenarios**:

1. **Given** produtos correspondentes cadastrados, **When** a pessoa busca por texto, categoria ou sinônimo, **Then** encontra os resultados correspondentes e a loja identificada abaixo do produto.
2. **Given** uma busca, **When** a pessoa aplica texto e filtros de tipo e faixa de preço, **Then** os resultados atendem em conjunto aos critérios escolhidos; os tipos são subdivisões das categorias.
3. **Given** uma busca sem correspondência, **When** a consulta termina, **Then** a interface informa a ausência de resultados e permite alterar a pesquisa ou os filtros.
4. **Given** resultados disponíveis, esgotados e com disponibilidade desconhecida, **When** são apresentados, **Then** aparecem nessa ordem; os disponíveis são ordenados por relevância e, entre semelhantes, pelo menor preço.
5. **Given** um nome cadastrado como “Tênis”, **When** a pessoa busca “ten”, **Then** a busca encontra o produto sem exigir a palavra inteira, acentos ou maiúsculas.
6. **Given** um possível erro de digitação e uma sugestão adequada, **When** a pessoa busca, **Then** vê a sugestão de correção.
7. **Given** uma oferta sem preço conhecido, **When** há filtro de preço ativo, **Then** ela não integra os resultados filtrados; sem esse filtro, o preço ausente é indicado.
8. **Given** preços de R$ 100 e R$ 200, **When** a pessoa filtra de R$ 100 até R$ 200, **Then** ambos estão dentro da faixa; mínimo e máximo também podem ser informados separadamente.
9. **Given** valores inválidos ou mínimo superior ao máximo, **When** a pessoa tenta aplicar o filtro, **Then** recebe informação sobre o problema e deve corrigi-lo antes da aplicação.
10. **Given** uma pessoa sem conta ou sessão, **When** consulta a busca, **Then** pode pesquisar, filtrar e acessar a comparação sem entrar em uma conta.
11. **Given** um termo que corresponde a nome, sinônimo e categoria de produtos diferentes, **When** os resultados disponíveis são apresentados, **Then** correspondências por nome precedem as por sinônimo, que precedem as por categoria; uma oferta correspondente em mais de um campo usa o melhor nível.

### User Story 2 - Consultar produtos semelhantes (Priority: P1)

Como consumidor, quero conhecer produtos semelhantes para considerar alternativas sem confundi-las com o mesmo produto.

**Why this priority**: As alternativas fazem parte da descoberta de produtos solicitada e da história P1 da especificação geral.

**Independent Test**: Critério independente: consultar produtos relacionados com variantes diferentes e reconhecê-los como alternativas.

**Acceptance Scenarios**:

1. **Given** outros produtos ou variantes da mesma categoria, **When** são apresentados como semelhantes, **Then** são reconhecíveis como alternativas e não são afirmados como idênticos sem equivalência estabelecida.
2. **Given** ausência de semelhantes conhecidos, **When** a pessoa consulta alternativas, **Then** relações não são inventadas.

### User Story 3 - Comparar ofertas de lojas (Priority: P1)

Como consumidor, quero comparar ofertas do mesmo produto em lojas diferentes para saber onde encontrá-lo e conhecer preços e disponibilidade.

**Why this priority**: Comparar ofertas é objetivo central e integra a história P1 da especificação geral.

**Independent Test**: Critério independente: consultar um produto com ofertas equivalentes de duas lojas e identificar as informações conhecidas de cada uma.

**Acceptance Scenarios**:

1. **Given** ofertas vinculadas ao mesmo produto e à mesma variante cadastrada, **When** a pessoa consulta a comparação, **Then** identifica o produto, a loja, preço e disponibilidade conhecidos em cada oferta, além de promoção e localização quando disponíveis.
2. **Given** produtos relacionados sem equivalência estabelecida, **When** a comparação é apresentada, **Then** não são apresentados como ofertas do mesmo produto.
3. **Given** uma oferta escolhida e localização conhecida, **When** a pessoa acessa o fluxo de mapa ou trajeto, **Then** o destino corresponde à loja da oferta escolhida, respeitando o fluxo da feature 005.
4. **Given** ofertas equivalentes disponíveis, esgotadas e de disponibilidade desconhecida, **When** a comparação é apresentada, **Then** as disponíveis aparecem primeiro do menor para o maior preço, depois as esgotadas e por fim as de disponibilidade desconhecida.
5. **Given** uma promoção incorporada ao catálogo, **When** ela aparece na busca e nas promoções, **Then** corresponde ao mesmo produto e à mesma oferta identificados.
6. **Given** ofertas disponíveis sem preço e outras com preço conhecido, **When** são comparadas, **Then** as sem preço aparecem após as demais disponíveis, com indicação do preço desconhecido.
7. **Given** ofertas esgotadas ou de disponibilidade desconhecida, **When** são comparadas, **Then** cada um desses grupos é ordenado por nome da loja, sem usar preço para ordená-lo.

### Edge Cases

- Sem conexão ou com falha na consulta: informar a condição e oferecer nova tentativa quando aplicável, sem apresentar dados não confirmados como atuais.
- Sem preço, disponibilidade, localização ou dado opcional: indicar a ausência sem inventar valores ou condições.
- Produto ou oferta removido ou alterado: não substituir silenciosamente por outro nem afirmar dados antigos como atuais.
- Identificar dados fictícios de demonstração; apresentar preço anterior, desconto e vigência apenas quando conhecidos e coerentes.
- Uma variante de cor diferente pode ser relacionada, mas não é automaticamente o mesmo item para comparação.
- Controles possuem identificação textual acessível; estoque e falhas não dependem somente de cor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Permitir busca por nomes, categorias e sinônimos cadastrados, aceitando partes de palavras sem distinguir acentos e maiúsculas. Aceite: US1.1 e US1.5.
- **FR-002**: Permitir filtros de tipo e faixa de preço; tipo é subdivisão da categoria, e os resultados devem atender ao texto e aos filtros escolhidos em conjunto. Permitir mínimo, máximo ou ambos, incluindo os limites. Aceite: US1.2 e US1.8.
- **FR-003**: Identificar a loja abaixo do produto e exibir preço e disponibilidade conhecidos de cada oferta. Aceite: US1.1 e US3.1.
- **FR-004**: Apresentar disponíveis antes dos esgotados e, em seguida, ofertas de disponibilidade desconhecida. Ordenar disponíveis por relevância, priorizando correspondências pelo nome, depois por sinônimo e, por último, por categoria; se mais de um campo corresponder, usar o melhor nível. Entre semelhantes de mesma relevância, apresentar primeiro os de menor preço conhecido e depois os sem preço conhecido. Aceite: US1.4 e US1.11.
- **FR-005**: Permitir consultar produtos da mesma categoria, incluindo outras variantes, como semelhantes, sem apresentá-los como idênticos por mera semelhança. Aceite: US2.1–2.
- **FR-006**: Comparar ofertas de lojas diferentes como mesmo produto somente quando vinculadas ao mesmo produto e à mesma variante cadastrada, mostrando dados conhecidos. Variantes diferentes não são consideradas idênticas. Apresentar disponíveis primeiro, do menor para o maior preço conhecido, seguidas das disponíveis sem preço; depois esgotadas e, por fim, disponibilidade desconhecida. Ordenar cada um dos dois últimos grupos pelo nome da loja, sem usar preço. Aceite: US3.1–2 e US3.4, US3.6–7.
- **FR-007**: Identificar a loja da oferta selecionada e permitir acesso ao fluxo de mapa e trajeto quando disponível, respeitando a escolha do ponto inicial. Aceite: US3.3.
- **FR-008**: Informar busca vazia, carregamento, falha e ausência de conexão quando aplicáveis; permitir ajuste ou nova tentativa quando possível. Aceite: US1.3 e casos de exceção.
- **FR-009**: Identificar dados fictícios e não inventar preço, disponibilidade, promoção, localização ou equivalência. Aceite: casos de exceção e US3.2.
- **FR-010**: Disponibilizar catálogo de demonstração com identificações estáveis de produtos e ofertas fictícios para busca e comparação. Incluir um produto com a mesma variante em pelo menos duas lojas e uma alternativa da mesma categoria. O cadastro e a atualização pelas lojas pertencem a outra entrega. Aceite: US1.1 e US3.1–2.
- **FR-011**: Sugerir correção para possível erro de digitação quando houver sugestão adequada. Aceite: US1.6.
- **FR-012**: Mostrar ofertas com preço ou disponibilidade desconhecidos identificando a informação ausente; excluir ofertas sem preço conhecido quando houver filtro de preço ativo. Aceite: US1.7 e casos de exceção.
- **FR-013**: Incorporar ou substituir os dados promocionais da feature 008 no catálogo de demonstração para que a busca e as promoções usem os mesmos produtos e ofertas identificados, sem criar fontes principais concorrentes. Aceite: US3.5.
- **FR-014**: Informar valores de preço inválidos ou mínimo superior ao máximo e solicitar correção antes de aplicar o filtro. Aceite: US1.9.
- **FR-015**: Permitir que qualquer visitante pesquise, filtre e consulte a comparação sem entrar em conta. Aceite: US1.10.
- **FR-016**: Disponibilizar controles identificáveis por texto para navegação e filtros; não comunicar estoque ou falhas apenas por cor. Aceite: caso de acessibilidade.

### Key Entities

- **Produto**: item identificado, com nome, categoria, tipo e características conhecidas que o distinguem de variantes.
- **Oferta**: relação entre produto e loja, com preço, disponibilidade e dados de promoção conhecidos.
- **Loja e shopping**: origem da oferta e localização conhecida, com mapa e trajeto definidos pela feature 005.
- **Termo, categoria e sinônimo**: informações cadastradas usadas para encontrar produtos; tipo subdivide a categoria.
- **Relação entre produtos**: produtos da mesma categoria, incluindo variantes diferentes, são semelhantes. Uma oferta só é equivalente a outra quando ambas estão vinculadas ao mesmo produto e à mesma variante.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de referência com resultado cadastrado, o resultado identifica a loja abaixo do produto e apresenta os dados conhecidos da oferta.
- **SC-002**: Em 100% dos cenários de comparação, somente ofertas vinculadas ao mesmo produto e à mesma variante cadastrada aparecem como sendo do mesmo produto.
- **SC-003**: Em 100% dos cenários com disponibilidade conhecida e desconhecida, os disponíveis aparecem antes dos esgotados, e os de disponibilidade desconhecida aparecem depois de ambos.
- **SC-004**: Em 100% dos cenários sem resultado, a pessoa recebe essa informação e pode ajustar a consulta ou os filtros.
- **SC-005**: Em eventual avaliação futura de compreensão, pelo menos 90% das pessoas participantes conseguem buscar um produto, identificar a loja e entender a comparação. A meta é proposta para avaliação, não um resultado medido nem exigência de testes nesta etapa.

## Assumptions

- As regras anteriores da especificação geral e da constituição continuam aplicáveis. A vitrine não implica compra ou pagamento no aplicativo.
- A documentação da feature 009 identifica catálogo, identidade de produtos e ofertas e busca de produtos como dependências ainda não disponíveis. A fonte limitada de promoções da feature 008 não constitui por si só um catálogo completo.
- A feature 009 prevê recomendações derivadas exclusivamente de buscas de produtos e histórico por conta; esta especificação não altera as decisões sobre desejos, recomendações ou privacidade.
- O catálogo desta entrega é de demonstração; cadastro e atualização pelas lojas ficam para outra entrega. Sua integração com a fonte limitada da feature 008 deve respeitar a fonte principal única prevista na constituição.
- A ordem alfabética dentro dos dois grupos e a posição de disponíveis sem preço são detalhes definidos para completar a regra escolhida. A meta de compreensão é proposta, não um resultado já medido. Recursos adicionais em outras telas ou no README não são automaticamente incluídos neste recorte.
