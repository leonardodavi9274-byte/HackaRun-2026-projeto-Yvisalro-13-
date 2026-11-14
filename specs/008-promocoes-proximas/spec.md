# Feature Specification: Pop-ups de promoções próximas

**Feature Branch**: nenhuma branch criada nesta etapa; não há hook de criação de branch configurado.

**Created**: 2026-11-14

**Status**: Draft

**Input**: “Pop-ups de promoções próximas; não exibi-los enquanto um trajeto estiver ativo (não essencial)”.

**Referências**: [especificação geral](../001-vitrine-perto/spec.md), [cadastro e preferências](../004-cadastro-preferencias/spec.md), [mapa e rota](../005-mapa-rota-lojas/spec.md), [telas 05, 09, 10 e 11](../../docs/frontend.md) e [constituição](../../.specify/memory/constitution.md).

Esta é uma funcionalidade **não essencial**, condicionada à disponibilidade de ofertas e ao recorte aprovado para a entrega. A proteção do trajeto ativo continua obrigatória sempre que ofertas de proximidade forem apresentadas. Este documento descreve comportamento desejado, não comprova sua implementação.

## User Scenarios & Testing *(mandatory)*

Os cenários são critérios de aceite, não registro de testes executados nem exigência de uma etapa de testes no fluxo sem testes da constituição.

### User Story 1 - Descobrir uma promoção próxima (Priority: P1)

Como consumidor, quero conhecer uma promoção de loja próxima ao ponto que escolhi no mapa para decidir se desejo visitar a loja.

**Why this priority**: entrega o objetivo principal da funcionalidade, sem depender de publicidade por e-mail.

**Independent Test**: Critério independente: com ponto escolhido e oferta elegível no shopping de demonstração, consultar o Início e identificar produto, loja, preço, disponibilidade e proximidade.

**Acceptance Scenarios**:

1. **Given** uma pessoa no Início, sem trajeto ativo, com ponto de referência escolhido e oferta elegível, **When** a oferta é selecionada, **Then** um único pop-up apresenta produto, loja, piso, distância simulada, preço atual e disponibilidade; mostra prazo e preço anterior somente quando conhecidos e válidos.
2. **Given** a oferta e o mapa são fictícios, **When** o pop-up aparece, **Then** indica que os dados são de demonstração e que a distância é simulada a partir do ponto escolhido, sem afirmar que a pessoa foi localizada dentro do shopping.
3. **Given** uma oferta ligada a uma categoria de interesse salva, **When** ela é exibida, **Then** a justificativa pode mencionar essa categoria; sem correspondência conhecida, não inventa uma justificativa de interesse nem histórico de compras.
4. **Given** nenhum ponto interno escolhido, **When** a pessoa abre o Início, **Then** nenhum pop-up é apresentado como próximo; o mapa permanece disponível para escolher um ponto.
5. **Given** nenhuma oferta elegível, **When** a pessoa usa o Início, **Then** ele continua disponível sem pop-up nem mensagem de erro intrusiva.

### User Story 2 - Preservar a atenção durante o trajeto (Priority: P1)

Como consumidor seguindo um trajeto, quero que promoções de proximidade não interrompam minhas instruções, independentemente de onde a rota foi iniciada.

**Why this priority**: é uma regra obrigatória da especificação geral e da constituição, mesmo sendo a funcionalidade promocional opcional.

**Independent Test**: Critério independente: ativar uma rota, acessar o Início e verificar a ausência de pop-ups de proximidade até o encerramento da rota.

**Acceptance Scenarios**:

1. **Given** uma rota ativa, inclusive após navegar para outra tela, **When** surge ou é avaliada uma oferta próxima, **Then** nenhum pop-up de proximidade é aberto.
2. **Given** um pop-up aberto, **When** uma rota passa a ficar ativa, **Then** o pop-up é fechado imediatamente, sem interromper ou modificar o trajeto.
3. **Given** rota ativa na instrução de chegada, **When** a chegada é apresentada, **Then** a supressão continua até a rota ser encerrada; substituir uma rota mantém a supressão enquanto houver rota ativa.
4. **Given** uma rota encerrada, **When** a pessoa volta ao Início ou uma nova avaliação ocorre, **Then** a oferta só pode aparecer após nova verificação de elegibilidade e dos limites de frequência; ofertas suprimidas não são despejadas em sequência.
5. **Given** o estado da rota ainda não é conhecido, **When** se considera abrir um pop-up, **Then** a apresentação aguarda confirmação de que não há rota ativa.

### User Story 3 - Dispensar ou seguir para a loja (Priority: P2)

Como consumidor, quero fechar a oferta ou escolher o caminho para a loja para controlar a interrupção e decidir se ela me interessa.

**Why this priority**: completa a interação da tela 11 e preserva o controle da pessoa.

**Independent Test**: Critério independente: dispensar uma oferta e, em outra oportunidade elegível, escolher **Me leve lá** e identificar a loja no mapa.

**Acceptance Scenarios**:

1. **Given** o pop-up aberto, **When** a pessoa escolhe **Agora não** ou **Fechar**, **Then** ele fecha e a pessoa retorna ao Início; a mesma oferta não volta a aparecer durante a sessão atual.
2. **Given** o pop-up aberto e uma loja com posição no mapa, **When** a pessoa escolhe **Me leve lá**, **Then** o pop-up fecha e o mapa abre com a loja selecionada para o fluxo de escolha do ponto de partida; a rota só fica ativa ao ser iniciada nesse fluxo.
3. **Given** uma loja cuja posição deixou de estar disponível depois da seleção da oferta, **When** a oferta permanece apresentada, **Then** a ação de rota fica indisponível e explica **Localização no mapa indisponível**, sem impedir o fechamento.
4. **Given** a oferta aberta, **When** é utilizada com teclado ou tecnologia assistiva, **Then** as ações têm nomes compreensíveis, foco visível e a pessoa consegue fechar a oferta e voltar ao conteúdo anterior.

### Edge Cases

- A oferta expira, fica indisponível, é removida ou muda de preço entre seleção e apresentação: reavaliar os dados e não mostrar informação antiga como atual; se não houver confirmação, não abrir o pop-up.
- Várias ofertas são elegíveis: exibir no máximo uma por vez; priorizar categoria de interesse confirmada e depois a menor distância simulada; em empate, usar ordem estável por nome de loja e produto.
- O ponto escolhido muda ou o shopping muda: descartar a avaliação anterior e recalcular antes de exibir outra oferta.
- Não há caminho conhecido até a loja, piso ou posição confiável no mapa: não classificá-la como próxima nem inventar distância; a ação indisponível da US3.3 aplica-se caso a posição deixe de estar disponível depois da apresentação.
- Sem conexão, falha ao consultar ofertas ou dados insuficientes: não exibir oferta baseada em dados não confirmados; manter Início e mapa utilizáveis conforme seus estados existentes.
- Se a rota for encerrada por recarga ou fechamento, conforme a feature 005, uma nova sessão só poderá exibir uma oferta depois de obter estado de rota, ponto e dados válidos novamente.
- Fechar o pop-up não altera interesses, escolhas de comunicação ou dados de catálogo; o consentimento para ofertas por e-mail não é alterado nem presumido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No Início, apresentar no máximo um pop-up de promoção próxima por vez, somente quando houver ponto interno escolhido, rota comprovadamente inativa e oferta elegível. Aceite: US1.1, US1.4–5 e US2.1–5.
- **FR-002**: Considerar próxima uma loja do shopping selecionado, no mesmo piso do ponto escolhido e a até 100 metros de caminhada simulada pelos caminhos conhecidos; sem ponto, posição, piso ou caminho conhecido, não inferir proximidade. Aceite: US1.2, US1.4 e casos de ponto ou caminho ausente.
- **FR-003**: Considerar elegível apenas promoção de loja ativa, com produto identificado, preço atual conhecido, disponibilidade confirmada, vigente quando houver prazo definido e que satisfaça FR-002. Não exibir promoção com prazo conhecido expirado ou dados obrigatórios ausentes. Aceite: US1.1, US1.5 e caso de alteração da oferta.
- **FR-004**: Exibir produto, loja, piso, preço atual, disponibilidade e distância simulada; apresentar preço anterior, desconto, validade e atualização somente quando conhecidos e coerentes, sem inventar valores. Identificar dados fictícios de demonstração. Aceite: US1.1–2 e caso de alteração da oferta.
- **FR-005**: Priorizar ofertas de categorias de interesse confirmadas; entre ofertas de mesmo nível de interesse, ordenar pela menor distância simulada e desempatar por nome de loja e produto em ordem estável. Sem interesse registrado, aplicar distância e desempate. Justificar interesse somente quando houver correspondência conhecida. Aceite: US1.3 e caso de várias ofertas.
- **FR-006**: Consultar o estado de rota antes de apresentar o pop-up independentemente da origem da rota; enquanto ativo ou desconhecido, não apresentá-lo. Fechar pop-up aberto assim que uma rota ficar ativa, inclusive durante substituição, e manter supressão na chegada até o encerramento. Aceite: US2.1–3 e US2.5.
- **FR-007**: Após o encerramento da rota, reavaliar oferta, ponto, estado e frequência antes de qualquer apresentação; não enfileirar para apresentação automática as ofertas suprimidas. Aceite: US2.4 e casos de alteração de oferta ou ponto.
- **FR-008**: Oferecer **Agora não** e **Fechar**, devolvendo ao Início e impedindo nova exibição da mesma oferta na sessão atual após dispensa. Limitar a uma apresentação de pop-up por visita ao Início; retornar ao Início constitui nova visita, sujeita aos demais limites. Aceite: US3.1 e US2.4.
- **FR-009**: Oferecer **Me leve lá** para loja com posição válida e encaminhar ao mapa com a loja selecionada e escolha de partida; não iniciar automaticamente uma rota. Se a posição deixar de estar disponível após a apresentação, desabilitar a ação e explicar o motivo. Aceite: US3.2–3 e caso de posição ausente.
- **FR-010**: Não solicitar ou registrar localização adicional para esta funcionalidade; a proximidade é relativa ao ponto manual do mapa e não afirma posição real interna. A ausência de localização do dispositivo não impede usar o ponto escolhido. Aceite: US1.2–4 e limitações da feature 005.
- **FR-011**: Operar com teclado e tecnologias assistivas, identificando as ações por texto acessível, com foco visível e retorno do foco ao conteúdo de origem ao fechar; informações de disponibilidade não dependem somente de cor. Aceite: US3.4.
- **FR-012**: Em falha, falta de conexão ou impossibilidade de confirmar a elegibilidade, não apresentar dados não confirmados; preservar acesso aos fluxos de Início e mapa e suas mensagens existentes. Aceite: US1.5 e casos de erro e oferta alterada.
- **FR-013**: Tratar o pop-up como apresentação dentro do aplicativo, separada da autorização para e-mails promocionais e de alertas solicitados; abrir ou dispensar não altera essas escolhas. Aceite: caso de separação de preferências.

### Key Entities

- **Oferta promocional**: produto, loja, preço atual, disponibilidade, vigência e demais informações conhecidas; pode ser identificada como fictícia.
- **Ponto interno e loja**: ponto escolhido pela pessoa, piso, posição da loja e caminho simulado, usados para estimar a distância; não representam localização interna comprovada.
- **Trajeto**: percurso simulado e seu estado ativo ou inativo, compartilhado para impedir interrupções.
- **Interesses e apresentação**: categorias confirmadas e registro da dispensa na sessão atual, usados respectivamente para ordenar e limitar a repetição de ofertas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de rota ativa ou estado desconhecido, nenhum pop-up de proximidade é aberto; um pop-up já aberto fecha quando a rota se torna ativa.
- **SC-002**: Em 100% dos cenários de oferta exibida, estão presentes produto, loja, piso, preço atual, disponibilidade e distância simulada, com identificação dos dados fictícios quando aplicável.
- **SC-003**: Em 100% dos cenários sem ponto escolhido, caminho conhecido ou oferta elegível, o Início permanece utilizável sem anúncio de proximidade inventada.
- **SC-004**: Em 100% dos cenários de dispensa, a pessoa retorna ao Início e a mesma oferta não reaparece na sessão atual; nunca há mais de um pop-up simultâneo.
- **SC-005**: Nos cenários com loja posicionada, a ação **Me leve lá** abre o mapa com a loja correspondente selecionada em até 3 ações da pessoa a partir do pop-up.
- **SC-006**: Em uma avaliação de compreensão com participantes, ao menos 90% identificam corretamente que a distância é simulada e que podem dispensar a oferta; é uma meta futura de produto, não um teste já realizado ou requisito de execução nesta entrega.

## Assumptions

- Os limites de mesmo piso, até 100 m de caminhada simulada, uma apresentação por visita e dispensa até o fim da sessão são propostas para esta especificação; a equipe pode revisá-los no planejamento. Não representam decisões anteriores sobre raio ou frequência, que estavam pendentes em [frontend.md](../../docs/frontend.md).
- A sessão é o período contínuo de uso do aplicativo até seu fechamento ou recarga; a visita ao Início começa quando a pessoa entra nessa tela e termina ao sair dela. Uma dispensa não precisa persistir entre sessões.
- O ponto manual é uma referência escolhida, não uma posição rastreada; o dispositivo não demonstra a localização exata dentro do shopping. A geolocalização existente serve à descoberta do shopping, conforme a feature 005.
- A apresentação depende de catálogo com promoções e dados de loja utilizáveis, do mapa com caminhos conhecidos e do estado de rota da feature 005. Enquanto não estiverem disponíveis, nenhuma oferta é inventada e a funcionalidade fica indisponível sem bloquear o restante.
- Ofertas de demonstração devem ser expressamente identificadas como fictícias. Compras, pagamentos, reserva, push, e-mail promocional, gestão de catálogo e rastreamento de movimento estão fora deste recorte.
- O exemplo visual da tela 11 é referência; não prova que a oferta, os interesses ou a implementação já existam. Histórico de compras não é fonte presumida. Preferências de categoria existentes são opcionais.
