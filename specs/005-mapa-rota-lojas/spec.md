# Feature Specification: Mapa do shopping, lojas próximas e trajeto simulado

**Feature Branch**: nenhuma branch criada nesta etapa; elaborada a partir de `004-cadastro`, sem hook de criação de branch configurado.

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Geolocalização para apoiar a descoberta de lojas próximas; mapa fictício com aparência 3D (não essencial como 3D), ícones de sacola que se tornam logos ao aproximar (não essencial para aproximação) e indicação de trajeto simulado até a loja (pegar o mapa com o pessoal da coordenação). Use as documentações e implementações já existentes. Use as telas de protótipo que já existem na specs do projeto geral."

**Referências**: [especificação geral, História 3, FR-007 e FR-008](../001-vitrine-perto/spec.md), [telas 09, 10 e 11](../../docs/frontend.md), [detalhamento do projeto, Localização e rota](../../docs/detalhamento-projeto.md), [base existente](../003-base-webapi-frontend/spec.md), [cadastro, feature 004](../004-cadastro-preferencias/spec.md) e [constituição 1.0.0](../../.specify/memory/constitution.md).

## Clarifications

### Session 2026-11-14

- Q: O mapa da coordenação é a planta de um shopping real ou um mapa fictício pronto? O que usar até ele chegar? → A: Planta real fornecida pela coordenação, com lojas e nomes fictícios sobre ela. Até a entrega, usar um mapa de demonstração provisório, identificado como tal; a troca de mapa não muda o comportamento.
- Q: Quantos shoppings a demonstração terá? → A: Um único shopping. A geolocalização só indica se a pessoa está perto do shopping; sem localização, ela confirma o shopping manualmente.
- Q: De onde o mapa tira as lojas, já que catálogo e painel empresarial não existem? → A: Esta feature traz o cadastro de lojas de demonstração (nome, piso, categoria, posição e logo opcional). Produtos e ofertas só aparecem no mapa e na rota quando o catálogo existir.

## User Scenarios & Testing *(mandatory)*

Os cenários descrevem o aceite esperado. Não representam testes executados nem acrescentam uma etapa de testes ao fluxo sem testes da constituição.

### User Story 1 - Consultar o mapa e encontrar uma loja (Priority: P1)

Como consumidor, quero abrir o mapa do shopping, trocar de piso e encontrar uma loja pelo nome ou pela categoria para saber onde ela fica.

**Why this priority**: É a base das demais histórias e já entrega valor sem localização nem rota: a pessoa descobre onde está cada loja.

**Independent Test**: Critério independente: abrir a aba **Mapa**, alternar entre os pisos, buscar uma loja de demonstração e identificá-la no mapa e na lista textual, com nome, piso e categoria.

**Acceptance Scenarios**:

1. **Given** o mapa carregado, **When** a pessoa abre a aba **Mapa**, **Then** vê o nome do shopping, a indicação de mapa de demonstração, o piso atual, o seletor de pisos, os controles de aproximação e os marcadores de lojas desse piso com ícone de sacola.
2. **Given** um piso selecionado, **When** escolhe outro piso, **Then** o mapa, os marcadores e a lista passam a mostrar somente as lojas do piso escolhido, e o piso ativo fica identificado por texto, não só por cor.
3. **Given** o campo **Buscar loja no mapa**, **When** digita parte do nome ou da categoria de uma loja, **Then** vê as lojas correspondentes com piso e categoria; ao escolher uma, o mapa muda para o piso dela, destaca seu marcador e abre seus detalhes.
4. **Given** uma busca sem correspondência, **When** a pessoa termina de digitar, **Then** vê **Nenhuma loja encontrada** e pode alterar o termo ou limpar a busca.
5. **Given** o mapa, **When** a pessoa escolhe **Ver lista de lojas**, **Then** acessa uma lista textual de todas as lojas agrupadas por piso e filtrável por categoria, com as mesmas ações disponíveis no marcador.
6. **Given** um marcador de loja, **When** a pessoa o seleciona, **Then** vê nome, piso, categoria e as ações **Traçar rota** e fechar; quando a loja tiver logo e o mapa estiver suficientemente aproximado, o marcador pode exibir o logo no lugar da sacola.

---

### User Story 2 - Traçar e seguir um trajeto simulado até a loja (Priority: P1)

Como consumidor, quero escolher onde estou dentro do shopping e uma loja de destino para ver o caminho até ela, passo a passo, inclusive quando ela fica em outro piso.

**Why this priority**: Atende diretamente à História 3 da especificação geral e é o objetivo das telas 09 e 10.

**Independent Test**: Critério independente: escolher um ponto de partida conhecido e uma loja de outro piso, iniciar a rota, avançar pelas instruções até a chegada e encerrar, conferindo traçado, texto, seta, troca de piso e retorno ao mapa.

**Acceptance Scenarios**:

1. **Given** uma loja selecionada, **When** a pessoa escolhe **Traçar rota** sem ponto de partida definido, **Then** é solicitada a escolher **Onde você está?** entre os pontos conhecidos do shopping (entradas, escadas, elevadores e áreas de referência), no mapa ou em lista.
2. **Given** ponto de partida e destino definidos, **When** a pessoa inicia a rota, **Then** vê o traçado no mapa, a primeira instrução com texto e seta na mesma direção, a distância e o tempo estimados de caminhada, o piso de chegada e a indicação **Anúncios pausados durante a rota**.
3. **Given** uma rota com troca de piso, **When** a instrução chega à conexão, **Then** o texto indica o meio (escada rolante, escada ou elevador) e o piso de destino, e o mapa passa a mostrar o piso seguinte com a continuação do traçado.
4. **Given** uma rota ativa, **When** a pessoa avança ou volta uma instrução, **Then** o traçado, a próxima instrução, a distância e o tempo restantes são atualizados de forma coerente com a simulação.
5. **Given** a última instrução, **When** a pessoa avança, **Then** vê **Você chegou à {loja}** e pode encerrar a rota ou voltar ao mapa.
6. **Given** uma rota ativa, **When** a pessoa escolhe **Encerrar rota**, **Then** o trajeto é removido, o mapa volta ao estado de consulta e os anúncios deixam de estar pausados.
7. **Given** uma rota ativa, **When** a pessoa escolhe outro destino ou outro ponto de partida, **Then** é informada de que a rota atual será substituída e, ao confirmar, a nova rota é calculada.
8. **Given** um destino sem caminho conhecido a partir do ponto escolhido, **When** a pessoa tenta iniciar a rota, **Then** vê **Não foi possível traçar um caminho até esta loja** e pode escolher outro ponto de partida; nenhuma rota é anunciada como ativa.

---

### User Story 3 - Usar a localização do dispositivo para a descoberta (Priority: P2)

Como consumidor, quero que o aplicativo use a localização do meu dispositivo para indicar se estou no shopping e me mostrar as lojas próximas, podendo continuar normalmente se a localização não estiver disponível.

**Why this priority**: Agrega conveniência à descoberta, mas o mapa e a rota funcionam sem ela.

**Independent Test**: Critério independente: abrir o mapa autorizando a localização perto e longe do shopping e, depois, negando a permissão, conferindo a mensagem, a seleção manual e a continuidade do mapa em todos os casos.

**Acceptance Scenarios**:

1. **Given** a primeira abertura do mapa, **When** a pessoa escolhe **Usar minha localização**, **Then** o dispositivo solicita a permissão; o pedido não aparece antes dessa ação e a finalidade é explicada junto ao botão.
2. **Given** localização autorizada e dentro da área do shopping, **When** a posição é obtida, **Then** vê **Você está no {shopping}** e o convite para escolher onde está dentro dele; a posição do dispositivo não é apresentada como ponto exato no mapa interno.
3. **Given** localização autorizada e fora da área do shopping, **When** a posição é obtida, **Then** vê que está a aproximadamente {distância} do shopping e pode continuar consultando o mapa normalmente.
4. **Given** permissão negada, tempo esgotado ou localização indisponível, **When** a tentativa falha, **Then** vê **Não foi possível encontrar a localização do dispositivo**, a ação **Escolher shopping manualmente** e, quando aplicável, **Tentar novamente**; o mapa continua acessível.
5. **Given** a seleção manual, **When** a pessoa confirma o shopping, **Then** o mapa e as lojas desse shopping ficam disponíveis com o mesmo comportamento da localização autorizada.

---

### User Story 4 - Ver lojas perto de você (Priority: P2)

Como consumidor, quero ver as lojas mais próximas do ponto onde estou dentro do shopping para decidir aonde ir.

**Why this priority**: Corresponde ao painel **Perto de você** da tela 09; depende do ponto de partida da História 2.

**Independent Test**: Critério independente: escolher um ponto de partida e conferir que o painel lista as lojas por menor distância de caminhada, com distância e ação de rota, e que a lista muda ao trocar o ponto.

**Acceptance Scenarios**:

1. **Given** um ponto de partida escolhido, **When** a pessoa abre o painel **Perto de você**, **Then** vê as lojas ordenadas pela menor distância de caminhada simulada, com nome, piso, distância e acesso a **Traçar rota**.
2. **Given** nenhum ponto de partida escolhido, **When** a pessoa abre o painel, **Then** vê o convite **Escolha onde você está para ver as lojas próximas**, sem distâncias inventadas.
3. **Given** o ponto de partida alterado, **When** o painel é atualizado, **Then** a ordem e as distâncias refletem o novo ponto.
4. **Given** lojas com ofertas no catálogo, quando ele existir, **When** o painel lista essas lojas, **Then** pode mostrar um resumo da oferta; enquanto o catálogo não existir, o painel mostra somente as informações da loja, sem ofertas fictícias apresentadas como reais.

---

### User Story 5 - Abrir a rota a partir de outras telas (Priority: P3)

Como consumidor, quero que os botões **Me leve lá** e **Me leve até a loja** de outras telas abram o mapa com a loja já escolhida como destino.

**Why this priority**: Conecta o mapa às telas 05, 06, 07 e 11, que ainda serão implementadas; esta feature apenas disponibiliza a entrada.

**Independent Test**: Critério independente: abrir o mapa por um endereço ou ação que identifique uma loja de demonstração e conferir que ela aparece selecionada como destino, pronta para escolher o ponto de partida.

**Acceptance Scenarios**:

1. **Given** uma ação externa que identifica uma loja existente, **When** o mapa é aberto por ela, **Then** a loja aparece selecionada no piso correto e o fluxo segue para a escolha do ponto de partida.
2. **Given** uma ação externa que identifica uma loja inexistente ou sem posição no mapa, **When** o mapa é aberto, **Then** vê **Loja não encontrada no mapa** e o mapa permanece em consulta.
3. **Given** uma rota ativa, **When** outra parte do aplicativo consulta se há rota ativa, **Then** recebe essa informação para suspender ofertas de proximidade, independentemente de como a rota foi iniciada.

### Edge Cases

- Loja cadastrada sem posição no mapa: aparece na lista textual com a indicação **Localização no mapa indisponível**; **Traçar rota** fica indisponível com essa explicação.
- Loja sem logo: o marcador mantém a sacola em qualquer nível de aproximação.
- Destino no mesmo ponto de partida (por exemplo, entrada em frente à loja): a rota mostra apenas a instrução de chegada.
- Falha ao carregar o mapa ou as lojas: mensagem explicando a condição e **Tentar novamente**; nenhum mapa vazio é apresentado como shopping sem lojas.
- Sem conexão depois do carregamento: o mapa já carregado e a rota ativa continuam consultáveis; ações que dependem do serviço informam a falta de conexão.
- A posição do dispositivo muda durante a rota: a rota não é alterada nem anunciada como recalculada pelo GPS.
- Recarregar ou fechar o aplicativo durante a rota encerra a rota; ao reabrir, o mapa volta ao estado de consulta.
- Troca do mapa provisório pela planta da coordenação: lojas cujo posicionamento ainda não foi definido na nova planta seguem a regra de loja sem posição.
- Busca com acentos ou maiúsculas diferentes (“cafe” e “Café”) encontra as mesmas lojas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Apresentar a aba **Mapa** com o nome do shopping, a identificação **Mapa de demonstração**, o seletor de pisos, os controles de aproximação e afastamento e os marcadores das lojas do piso ativo. Aceite: US1.1–2.
- **FR-002**: Representar o mapa interno como plano do piso com lojas, corredores e pontos de referência. A aparência 3D da tela 09 é desejável, não obrigatória; uma representação plana atende ao requisito se mantiver lojas, corredores e traçado legíveis. Aceite: US1.1 e US2.2.
- **FR-003**: Exibir cada loja com marcador de sacola e nome acessível. Quando a loja tiver logo e a aproximação permitir, o marcador pode passar a exibir o logo; essa troca é desejável, não obrigatória. Aceite: US1.6 e casos de loja sem logo.
- **FR-004**: Permitir buscar lojas por nome e categoria, sem distinção de acentos e maiúsculas, levando o mapa ao piso e ao marcador da loja escolhida e informando ausência de resultado. A busca por produto entra quando o catálogo existir. Aceite: US1.3–4.
- **FR-005**: Oferecer lista textual de todas as lojas, agrupada por piso e filtrável por categoria, com as mesmas ações do marcador, como alternativa completa ao mapa. Aceite: US1.5 e regra da constituição IV.
- **FR-006**: Permitir escolher o ponto de partida entre pontos conhecidos do shopping, no mapa ou em lista. O ponto de partida é sempre escolhido pela pessoa; a localização do dispositivo não define a posição dentro do shopping. Aceite: US2.1 e US3.2.
- **FR-007**: Calcular o trajeto simulado entre o ponto de partida e a loja pelos caminhos conhecidos do mapa, incluindo troca de piso pelas conexões existentes, e apresentar traçado, instruções em sequência, distância e tempo estimados e piso de chegada. Aceite: US2.2–3.
- **FR-008**: Manter texto, seta e traçado de cada instrução indicando a mesma direção, corrigindo a divergência registrada na tela 10. Aceite: US2.2–4 e SC-002.
- **FR-009**: Permitir avançar e voltar instruções, informar a chegada, encerrar a rota e substituir destino ou ponto de partida com confirmação. Aceite: US2.4–7.
- **FR-010**: Informar quando não houver caminho conhecido até a loja, sem ativar rota. Aceite: US2.8 e casos de loja sem posição.
- **FR-011**: Manter o estado de **rota ativa** disponível para as demais partes do aplicativo e exibir **Anúncios pausados durante a rota** enquanto ela durar; ofertas de proximidade não devem ser exibidas nesse período. Aceite: US2.2, US2.6 e US5.3.
- **FR-012**: Solicitar a localização do dispositivo somente após a ação **Usar minha localização**, explicando sua finalidade, e informar se a pessoa está dentro da área do shopping ou a que distância aproximada dele está. Aceite: US3.1–3.
- **FR-013**: Quando a localização for negada, indisponível ou expirar, exibir **Não foi possível encontrar a localização do dispositivo**, oferecer **Escolher shopping manualmente** e, quando possível, **Tentar novamente**, sem bloquear o mapa. Aceite: US3.4–5 e FR-007 da especificação geral.
- **FR-014**: Usar a localização do dispositivo apenas durante o uso do mapa, sem armazená-la, enviá-la para histórico nem associá-la à conta. Aceite: US3 e SC-007.
- **FR-015**: Apresentar o painel **Perto de você** ordenado pela distância de caminhada simulada a partir do ponto de partida escolhido; sem ponto escolhido, convidar a escolhê-lo, sem distâncias inventadas. Aceite: US4.1–3.
- **FR-016**: Mostrar produtos e ofertas no painel e na rota somente quando houver dados do catálogo; até lá, mostrar apenas dados da loja. Não exibir o botão **Reservar item**, que permanece fora do escopo. Aceite: US4.4.
- **FR-017**: Aceitar a abertura do mapa com uma loja pré-selecionada como destino, para uso pelas ações **Me leve lá** e **Me leve até a loja**; tratar loja inexistente ou sem posição. Aceite: US5.1–2.
- **FR-018**: Fornecer o cadastro de lojas de demonstração do shopping, com nome fictício, piso, categoria, posição no mapa e logo opcional, identificadas como dados de demonstração. Aceite: US1 e US4.
- **FR-019**: Permitir substituir o mapa provisório pela planta fornecida pela coordenação sem mudar os fluxos desta especificação; pisos, corredores, pontos de partida e conexões vêm dos dados do mapa. Aceite: SC-006.
- **FR-020**: Apresentar estados de carregamento, falha com nova tentativa e ausência de conexão para mapa, lojas e localização, sem anunciar dados ou rotas não obtidos. Aceite: casos de falha.
- **FR-021**: Garantir operação por teclado e nomes acessíveis para marcadores, pisos, zoom, busca, painel e ações de rota; estado do piso, seleção e rota ativa indicados por texto além da cor. Aceite: SC-005.

### Apresentação e correspondência com o design

Referências visuais: [09 — Mapa](../../docs/imagens/achei/09-mapa.png), [10 — Rota ativa](../../docs/imagens/achei/10-rota-ativa.png) e [11 — Oferta próxima](../../docs/imagens/achei/11-oferta-proxima.png). Preservar a linguagem visual das telas e da feature 004. Entre 360 e 1440 pixels, manter mapa, controles e painéis acessíveis sem rolagem horizontal da página.

| Referência | Elementos e comportamento |
| --- | --- |
| Tela 09 | Busca no topo, selo com o nome do shopping, seletor de pisos, zoom, marcadores de sacola, painel inferior **Perto de você** e barra inferior com **Mapa** ativo. Acrescentar **Mapa de demonstração**, **Usar minha localização**, **Onde você está?** e **Ver lista de lojas**. |
| Tela 10 | Faixa superior com seta e instrução, aviso **Anúncios pausados durante a rota**, traçado no mapa, painel com tempo, distância, loja e piso de chegada, **Encerrar rota** e controles para avançar e voltar instruções. |
| Tela 11 | Não é implementada nesta feature; ela consulta o estado de rota ativa definido aqui. |
| Estados comuns | Carregamento, erro com nova tentativa, sem conexão, busca sem resultado, localização indisponível e loja sem posição. |

**Divergências a adequar na implementação/protótipo**:

- A tela 10 mostra **Em 40 m, vire à esquerda** com seta para a direita. Texto, seta e traçado devem coincidir.
- A tela 10 mostra **Reservar item**. A reserva continua fora do escopo e o botão não deve aparecer.
- O painel da tela 10 mostra produto, preço e estoque. Esses dados só aparecem quando o catálogo existir.
- A tela 09 mostra um ponto azul como posição. Ele representa o ponto de partida escolhido, não a posição do GPS.
- As imagens usam **Shopping Aurora** e **Achei**. O nome do shopping vem dos dados do mapa; textos novos usam Hackarum-Yvisalro.

### Key Entities *(include if feature involves data)*

- **Shopping**: único local da demonstração, com nome fictício, área geográfica de referência para a localização e mapa associado.
- **Mapa e piso**: versão identificável dos dados do mapa (provisório ou planta da coordenação), com pisos ordenados e o desenho de lojas e corredores de cada piso.
- **Loja**: estabelecimento fictício com nome, categoria, piso, posição no mapa e logo opcional; pode existir sem posição.
- **Ponto de referência**: local conhecido do shopping (entrada, escada, escada rolante, elevador, praça) usado como ponto de partida ou conexão entre pisos.
- **Caminho**: ligações percorríveis entre pontos e lojas, com distância, inclusive as conexões entre pisos.
- **Rota**: trajeto calculado entre um ponto de partida e uma loja, com instruções, distância e tempo estimados; existe só durante o uso e define o estado de rota ativa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em eventual avaliação de uso, pelo menos 90% dos participantes encontram uma loja de demonstração e iniciam a rota até ela em até 30 segundos, sem ajuda. É meta de produto, não avaliação executada ou obrigatória neste fluxo.
- **SC-002**: Em 100% das rotas do mapa de demonstração, texto, seta e traçado de cada instrução indicam a mesma direção, e toda troca de piso é indicada com o meio e o piso de destino.
- **SC-003**: Em 100% dos cenários de localização negada, indisponível ou expirada, a mensagem definida e a seleção manual aparecem, e o mapa continua utilizável.
- **SC-004**: Em 100% dos cenários com rota ativa, a indicação de anúncios pausados aparece e o estado de rota ativa fica disponível para suspender ofertas de proximidade.
- **SC-005**: 100% das lojas com posição no mapa também são acessíveis pela lista textual, e todos os controles do mapa e da rota funcionam por teclado entre 360 e 1440 pixels.
- **SC-006**: Ao substituir o mapa provisório pela planta da coordenação, todas as histórias continuam atendidas sem alteração de comportamento.
- **SC-007**: Nenhuma posição do dispositivo fica armazenada ou associada à conta após o uso do mapa.

## Assumptions

### Premissas e limites

- O ator é o consumidor. O mapa pode ser consultado sem conta; nenhum dado desta feature é salvo na conta.
- A demonstração tem um único shopping. A localização só indica se a pessoa está na área do shopping; a área é um raio padrão de 500 metros em torno de um ponto de referência, ajustável com os dados da coordenação.
- O tempo estimado considera caminhada de aproximadamente 70 metros por minuto, sem filas ou aglomeração.
- O avanço pelas instruções é feito pela pessoa; não há acompanhamento automático da posição dentro do shopping.
- A rota dura até ser encerrada, substituída ou até o aplicativo ser recarregado ou fechado.
- Busca por produto, ofertas no painel e na rota, preferência por elevador, roteiro com várias lojas, reserva de itens e a oferta de proximidade da tela 11 ficam fora deste recorte.
- O recorte é a interface web, conforme a base atual; o aplicativo móvel fica para depois.

### Dependências e estado atual

- **Mapa da coordenação**: a planta real do shopping será fornecida pela coordenação. Até a entrega, usa-se um mapa provisório no estilo da tela 09, com três pisos, identificado como demonstração. É preciso confirmar com a coordenação o formato do arquivo, as conexões entre pisos e a autorização para usar a planta. A falta da planta não bloqueia o planejamento.
- **Coordenadas de referência**: o ponto e o raio do shopping dependem da planta ou de definição da coordenação; a especificação geral registra essas coordenadas como pendentes.
- **Lojas**: as lojas de demonstração desta feature são fictícias e serão substituídas ou complementadas quando existir o cadastro de empresas do painel empresarial.
- **Base existente**: a feature 003 fornece a base web e o serviço; a feature 004 fornece navegação e linguagem visual. Não existe ainda dado de shopping, loja ou mapa no sistema; esta especificação não afirma funcionamento implementado.
