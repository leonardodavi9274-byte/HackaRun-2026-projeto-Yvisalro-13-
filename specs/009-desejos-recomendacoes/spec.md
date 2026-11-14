# Feature Specification: Lista de desejos e recomendações

**Feature Branch**: nenhuma branch criada nesta etapa; não há hook de criação configurado.

**Created**: 2026-11-14

**Status**: Rascunho — escolhas de produto esclarecidas

**Input**: Lista de desejos e recomendações baseadas em interesses e interações; a origem do histórico de compras ainda precisa ser definida.

**Referências**: [produto](../001-vitrine-perto/spec.md), [cadastro e preferências](../004-cadastro-preferencias/spec.md), [promoções próximas](../008-promocoes-proximas/spec.md), [telas 03, 05, 07 e 08](../../docs/frontend.md), [README](../../README.md) e [constituição](../../.specify/memory/constitution.md).

Este documento descreve comportamento previsto, sem afirmar que catálogo, desejos ou recomendações estejam implementados. O recorte da entrega permanece sujeito à priorização da equipe. Os cenários são critérios de aceite e não evidência de testes executados; aplica-se a política de fluxo sem testes da constituição.

## Clarifications

### Sessão 2026-11-14

- A pessoa poderá escolher salvar um **produto** ou uma **oferta específica de loja**. Se salvar ambos, aparecem separadamente, e remover um mantém o outro.
- O histórico de buscas e visualizações permanece até o usuário apagar cada entrada; a exclusão é individual e o uso das buscas nas recomendações não pode ser desativado pelo usuário.
- As recomendações usam **somente buscas de produtos**, conforme esclarecimento posterior que substitui a prioridade inicialmente indicada para interesses, desejos e visualizações. Elas aparecem em seção discreta no Início, sem interromper a navegação; interesses, desejos e visualizações não são sinais das recomendações nesta entrega.
- Não haverá integração de compras nesta entrega. As lojas cadastradas cadastram seus produtos, mas isso não comprova uma compra; buscas, desejos e visualizações também não são compras.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guardar e consultar desejos (Priority: P1)

Como consumidor autenticado, quero salvar e remover itens de interesse para reencontrá-los na minha conta, inclusive em outro dispositivo.

**Why this priority**: preserva a lista pessoal e atende ao fluxo do coração e da aba Desejos.

**Independent Test**: Critério independente: salvar um item, consultar a lista em outra sessão da mesma conta e removê-lo.

**Acceptance Scenarios**:

1. **Given** uma pessoa autenticada diante de um item elegível no story ou detalhe, **When** escolhe salvá-lo, **Then** o coração indica o estado salvo somente após confirmação e o item aparece em Desejos.
2. **Given** um desejo confirmado, **When** a pessoa entra na mesma conta em outro dispositivo, **Then** encontra o desejo confirmado; outra conta não pode consultá-lo ou alterá-lo.
3. **Given** um desejo salvo, **When** a pessoa o remove e a alteração é confirmada, **Then** ele deixa de aparecer na lista e o coração deixa de indicá-lo como salvo.
4. **Given** uma lista vazia, **When** a pessoa abre Desejos, **Then** vê uma mensagem compreensível e um caminho para explorar o catálogo.
5. **Given** falha ou ausência de conexão ao salvar ou remover, **When** não há confirmação da operação, **Then** a interface informa a situação, não afirma sucesso e permite nova tentativa.
6. **Given** um item elegível com produto e oferta identificados, **When** a pessoa escolhe qual deseja salvar, **Then** pode escolher o produto ou a oferta específica da loja e a lista identifica a escolha feita.
7. **Given** um produto e uma oferta dele salvos, **When** a pessoa consulta Desejos, **Then** ambos aparecem separadamente; ao remover um e obter confirmação, o outro permanece.

### User Story 2 - Consultar informações conhecidas do desejo (Priority: P1)

Como consumidor, quero identificar o item salvo e as informações de oferta disponíveis para decidir onde encontrá-lo.

**Why this priority**: uma lista útil precisa preservar a identificação do item e a confiabilidade das informações de loja, preço e disponibilidade.

**Independent Test**: Critério independente: consultar um desejo com oferta conhecida e outro sem informação suficiente e distinguir ambos.

**Acceptance Scenarios**:

1. **Given** um desejo com oferta confirmada, **When** a lista é apresentada, **Then** identifica produto, loja, preço e disponibilidade conhecidos; informações opcionais só aparecem quando conhecidas e coerentes.
2. **Given** uma oferta removida, indisponível ou não confirmada, **When** a pessoa consulta o desejo, **Then** a interface informa o estado conhecido sem inventar preço, disponibilidade ou outra oferta.
3. **Given** ausência de equivalência estabelecida entre produtos ou de preço anterior confiável, **When** a lista é exibida, **Then** ela não afirma que variantes são o mesmo produto, que existe uma loja mais barata ou que houve queda de preço sem fundamento.

### User Story 3 - Descobrir recomendações (Priority: P2)

Como consumidor, quero descobrir no Início produtos relacionados às minhas buscas de produtos para encontrar opções relevantes.

**Why this priority**: amplia a descoberta a partir dos dados disponíveis, sem impedir o uso da vitrine por contas novas.

**Independent Test**: Critério independente: consultar o Início com buscas de produtos confirmadas e, separadamente, sem buscas disponíveis.

**Acceptance Scenarios**:

1. **Given** buscas de produtos confirmadas e itens de catálogo correspondentes, **When** as recomendações forem apresentadas, **Then** a relação com essas buscas deve ser verdadeira e cada oferta deve identificar produto, loja, preço e disponibilidade conhecidos.
2. **Given** uma conta sem buscas de produtos utilizáveis, **When** a pessoa acessa o Início, **Then** pode explorar categorias sem alegação de personalização ou de compras anteriores.
3. **Given** dados fictícios de demonstração, **When** um item é apresentado, **Then** essa condição é identificada; não se inventam compras, preços, disponibilidade ou justificativas.
4. **Given** falha de consulta ou ausência de itens correspondentes, **When** a área de recomendações é aberta, **Then** a interface informa o estado aplicável e oferece nova tentativa em caso de falha, mantendo a exploração disponível quando possível.
5. **Given** uma busca ou visualização no histórico, **When** a pessoa escolhe apagá-la e a operação é confirmada, **Then** essa entrada é apagada individualmente; o usuário não dispõe de opção para desativar o uso das buscas nas recomendações.
6. **Given** interesses, desejos ou visualizações sem buscas de produto, **When** a pessoa consulta o Início, **Then** esses dados não são usados como sinais para recomendações; pode explorar categorias.
7. **Given** uma busca salva, **When** a pessoa a apaga e a operação é confirmada, **Then** a busca apagada deixa de influenciar novas recomendações.
8. **Given** recomendações disponíveis, **When** a pessoa acessa o Início, **Then** elas aparecem em uma seção discreta da própria tela, sem interromper a navegação.

### Edge Cases

- Sem sessão válida, não ler nem alterar desejos de uma conta; orientar a pessoa a entrar, sem confirmar salvamento antes da autenticação e da confirmação do serviço.
- Se o estado da operação for desconhecido após interrupção, informar a incerteza e consultar o estado confirmado antes de afirmar que o desejo foi salvo ou removido.
- Um item ou oferta pode mudar, ficar indisponível ou ser removido: não substituir silenciosamente o item salvo por outro presumidamente equivalente nem exibir dados antigos como atuais.
- Categorias e termos livres informados no cadastro não criam desejos ou alertas automaticamente; ausência de buscas não impede a exploração do Início.
- Escolher um desejo ou consultar uma recomendação não ativa publicidade por e-mail nem cria pedido de alerta. Preferências de comunicação continuam separadas.
- Ícones acionáveis possuem nome acessível; disponibilidade e erros não são comunicados apenas por cor. Apresentar estados de carregamento, vazio, erro e ausência de conexão quando aplicáveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Permitir à pessoa autenticada adicionar e remover desejos e consultar o estado confirmado no coração e na lista. Aceite: US1.1, US1.3 e US1.5.
- **FR-002**: Vincular desejos à conta autenticada, sincronizá-los entre sessões e dispositivos e impedir leitura ou alteração por outra conta. Aceite: US1.2 e caso de sessão inválida.
- **FR-003**: Disponibilizar acesso a Desejos e ao salvamento pelo story e pelo detalhe do item, respeitando a escolha prevista em FR-004. Aceite: US1.1, US1.4 e US1.6.
- **FR-004**: Permitir que a pessoa escolha salvar um produto ou uma oferta específica de loja e identificar essa escolha na lista. Quando ambos forem salvos, apresentá-los separadamente e remover cada um independentemente. Não presumir equivalência de produtos. Aceite: US1.6–7.
- **FR-005**: Exibir dados confirmados de produto e oferta, incluindo loja, preço e disponibilidade conhecidos; sinalizar ausência, indisponibilidade ou remoção sem inventar dados. Comparação de preços, melhor loja e queda exigem equivalência e referência válidas. Aceite: US2.1–3.
- **FR-006**: Apresentar em uma seção discreta do Início, sem interromper a navegação, recomendações relacionadas somente às buscas de produtos da própria conta; não usar interesses, desejos, visualizações ou compras como sinais nem afirmar uma relação que não possa ser sustentada. Aceite: US3.1–3 e US3.6–8.
- **FR-007**: Manter cada entrada do histórico de buscas e visualizações até o usuário apagá-la; permitir exclusão individual e não oferecer desativação do uso das buscas para recomendar. Após confirmação de exclusão, a busca apagada deixa de influenciar novas recomendações. Aceite: US3.5 e US3.7.
- **FR-008**: Não integrar ou presumir histórico de compras nesta entrega. Lojas cadastradas cadastram seus produtos, mas esse cadastro, buscas, desejos e visualizações não comprovam compras. Aceite: US3.3 e caso de ausência de histórico confiável.
- **FR-009**: Sem buscas de produtos utilizáveis para personalizar, permitir explorar categorias sem apresentar o conteúdo como personalizado ou baseado em compras. Aceite: US3.2 e US3.6.
- **FR-010**: Manter interesses de cadastro, desejos, alertas e publicidade distintos: termos livres não criam desejos ou alertas; salvar e recomendar não alteram consentimento nem solicitam avisos. Aceite: casos de separação e US3.2.
- **FR-011**: Apresentar estados compreensíveis de carregamento, vazio, erro e ausência de conexão; não confirmar salvamento sem confirmação e permitir nova tentativa quando cabível. Aceite: US1.4–5 e US3.4.
- **FR-012**: Identificar dados fictícios de demonstração, oferecer nomes acessíveis aos controles e não depender somente de cor para disponibilidade ou falha. Aceite: US3.3 e caso de acessibilidade.

### Key Entities

- **Conta e interesses**: identidade autenticada, categorias escolhidas e termos livres de interesse confirmados; preferências promocionais são independentes.
- **Desejo**: vínculo entre a conta e o produto ou a oferta específica escolhida pela pessoa; produto e oferta salvos coexistem e são removidos independentemente.
- **Produto e oferta**: produto e, separadamente, informação de loja, preço e disponibilidade; equivalência entre cadastros ainda exige definição.
- **Interação e recomendação**: buscas e visualizações permanecem até exclusão individual pelo usuário; somente buscas de produtos influenciam as recomendações, e o usuário não pode desativar esse uso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de salvamento e remoção confirmados, o estado da lista e do coração corresponde à última confirmação; o desejo salvo é encontrado em outra sessão da mesma conta.
- **SC-002**: Em 100% dos cenários de acesso por outra conta ou sessão inválida, os desejos privados não são revelados nem alterados.
- **SC-003**: Em 100% dos cenários sem preço, disponibilidade, equivalência ou histórico confiável, a interface não apresenta o dado ausente nem uma comparação ou compra presumida como fato.
- **SC-004**: Em 100% dos cenários sem buscas de produtos utilizáveis, a pessoa encontra um caminho para explorar categorias sem afirmação de personalização.
- **SC-005**: Em avaliação futura de compreensão, ao menos 90% das pessoas participantes conseguem identificar como salvar e remover um desejo e reconhecer uma lista vazia. Esta é uma meta proposta, não uma medição realizada ou exigência de executar testes nesta etapa.
- **SC-006**: Em 100% dos cenários com recomendações apresentadas, elas aparecem em uma seção do Início sem interromper a navegação.

## Assumptions

- O projeto é uma vitrine; compras e pagamentos ocorrem fora do aplicativo. Integração de histórico de compras não faz parte desta entrega (FR-008).
- A conta e os interesses confirmados dependem da feature 004; itens e ofertas dependem de catálogo e dados confiáveis, cuja existência operacional não é presumida. As telas do canvas são referência visual, não comprovação de implementação.
- A equivalência de produtos depende de definição. Buscas e visualizações permanecem até exclusão individual; somente buscas de produtos são sinais para recomendações. A medida técnica de relevância da busca ainda depende do planejamento da busca e não autoriza inventar equivalência.
- A tela 08 também mostra melhor oferta, variação de preço, filtros e aba Avise-me. Comparação depende de equivalência e dados válidos; preço de referência, filtros e configuração/cancelamento de alertas continuam pendentes. Este documento não cria novas regras para eles.
- A lista de compras por shopping, roteiro com várias lojas, alertas de reposição e preço, campanhas, compra e pagamento possuem escopo e decisões próprias; sua presença em outras ideias ou telas não confirma sua inclusão nesta entrega.
- Os critérios de sucesso quantitativos são metas de avaliação propostas para o comportamento especificado, não resultados medidos nem compromisso já aprovado de prazo ou volume.
