# Feature Specification: Tela inicial e descoberta

**Feature Branch**: [006-tela-inicial-descoberta]
**Created**: 2026-11-14
**Status**: Draft
**Input**: Tela inicial com pesquisa, categorias, ofertas em destaque, stories promocionais e carrosséis de produtos. Criar como spec 6 porque a 5 está em desenvolvimento fora do repositório atual.

## User Scenarios & Testing

### User Story 1 - Explorar a tela inicial como visitante (Priority: P1)

Como consumidor, quero abrir a tela inicial sem criar conta para descobrir produtos e ofertas.

**Why this priority**: A tela inicial é o ponto de entrada da vitrine e a exploração sem conta reduz barreiras.

**Independent Test**: Abrir a tela sem sessão e conferir os caminhos de busca, categorias, destaques e stories.

**Acceptance Scenarios**:

1. **Given** que a pessoa não está autenticada, **When** abre a tela inicial, **Then** consulta conteúdo público e inicia uma busca sem ser direcionada ao cadastro.
2. **Given** que há itens e ofertas disponíveis, **When** a tela termina de carregar, **Then** exibe categorias, ofertas, stories e carrosséis com itens identificáveis.
3. **Given** que não há preferências ou histórico disponíveis, **When** recomendações são exibidas, **Then** a tela apresenta conteúdo geral sem afirmar que é personalizado.

### User Story 2 - Pesquisar e navegar por categoria (Priority: P1)

Como consumidor, quero pesquisar um termo ou escolher uma categoria para encontrar produtos relevantes.

**Why this priority**: Pesquisa e categorias são os caminhos mais diretos para encontrar itens.

**Independent Test**: Pesquisar um termo cadastrado e selecionar uma categoria com produtos.

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** a pessoa inicia uma busca, **Then** a tela de resultados recebe o termo informado.
2. **Given** uma categoria com produtos, **When** a pessoa a seleciona, **Then** vê resultados daquela categoria.
3. **Given** uma categoria sem correspondências, **When** os resultados são apresentados, **Then** a ausência é comunicada e é possível voltar ou ajustar a consulta.

### User Story 3 - Descobrir oferta por story ou carrossel (Priority: P2)

Como consumidor, quero percorrer stories, ofertas em destaque e carrosséis para descobrir opções sem formular uma pesquisa.

**Why this priority**: Conteúdos promocionais apoiam a descoberta espontânea e conectam produtos e lojas.

**Independent Test**: Abrir um story, uma oferta e um produto de carrossel e conferir os respectivos destinos.

**Acceptance Scenarios**:

1. **Given** stories publicados, **When** a pessoa seleciona um story, **Then** vê o conteúdo correspondente da loja ou oferta.
2. **Given** uma oferta em destaque, **When** abre seus detalhes, **Then** encontra produto, preço, loja, disponibilidade e validade quando cadastrados.
3. **Given** mais produtos que o espaço inicial do carrossel, **When** percorre o carrossel, **Then** alcança e abre os demais itens.
4. **Given** uma oferta expirada ou indisponível, **When** a pessoa a abre, **Then** seu estado é informado e ela não aparece como ativa.

### Casos de exceção

- Catálogo vazio: informar que ainda não há conteúdo disponível e manter os caminhos gerais utilizáveis.
- Falha em uma seção: comunicar a falha localmente e manter outras seções carregadas utilizáveis.
- Falha de conexão: explicar que o conteúdo não foi atualizado e oferecer nova tentativa.
- Categoria sem produtos: informar a ausência, sem substituir por produtos de outra categoria.
- Oferta que expira ou fica sem estoque enquanto a tela está aberta: atualizar ou identificar seu estado antes de tratá-la como ativa.
- Dados ausentes de loja, preço, disponibilidade ou validade: não inventar a informação nem sugerir desconto sem base.
- Carrossel com poucos itens: não repetir produtos para preencher o espaço.
- Sem preferências ou interações: não presumir recomendação personalizada.

## Requirements

### Functional Requirements

- **FR-001**: A tela inicial MUST permitir a visitantes sem autenticação consultar conteúdo público, pesquisar e explorar categorias, sem exigir cadastro para esses fluxos.
- **FR-002**: A tela MUST apresentar pesquisa para produtos, lojas e categorias e encaminhar o termo informado sem alterá-lo.
- **FR-003**: A tela MUST apresentar categorias disponíveis e abrir resultados associados à categoria selecionada.
- **FR-004**: A tela MUST apresentar ofertas em destaque quando disponíveis, mostrando produto, preço e loja; disponibilidade, preço anterior e validade aparecem quando conhecidos.
- **FR-005**: A tela MUST apresentar stories promocionais publicados e abrir o conteúdo da loja ou oferta correspondente.
- **FR-006**: Stories e ofertas MUST identificar informações fictícias ou demonstrativas e não tratar dados ausentes como fatos.
- **FR-007**: A tela MUST apresentar carrosséis navegáveis por todos os itens disponíveis, sem repetições artificiais.
- **FR-008**: Selecionar categoria, oferta, story ou produto MUST abrir o conteúdo correspondente e identificar a loja e o estado quando conhecidos.
- **FR-009**: Recomendações podem considerar preferências e interações disponíveis na conta; sem dados suficientes, a tela MUST exibir conteúdo geral sem afirmar personalização ou histórico de compras.
- **FR-010**: A tela MUST oferecer estados de carregamento, conteúdo vazio, falha por seção e falha geral, com mensagens compreensíveis e nova tentativa quando aplicável.
- **FR-011**: Oferta expirada ou indisponível MUST ser identificada como tal; preço atual e anterior devem ser coerentes quando ambos forem exibidos.
- **FR-012**: Pesquisa, categorias, stories, carrosséis e navegação MUST ter identificação acessível, foco visível, operação por teclado e estado que não dependa apenas de cor.
- **FR-013**: A navegação MUST manter acesso às áreas principais do consumidor e não interromper rota interna ativa com pop-ups promocionais.

### Apresentação e integração funcional

A referência é a tela **05 — Início** descrita em [docs/frontend.md](../../docs/frontend.md#05--início) e [05-inicio.png](../../docs/imagens/achei/05-inicio.png). O protótipo mostra shopping e piso, saudação, sino, pesquisa, atalhos circulares de lojas/stories, categorias, oferta destacada, carrossel “Você também pode gostar” e navegação inferior.

Esta feature detalha os componentes pedidos. Destinos do sino e de “Ver tudo”, personalização algorítmica, seleção de shopping/piso nesta tela e pop-ups de proximidade ficam fora do recorte até serem definidos. A barra inferior permanece referência, sem definir as demais áreas.

Entre 360 e 1440 pixels, controles e hierarquia devem permanecer utilizáveis sem rolagem horizontal. Rolagem vertical é permitida. Carrosséis devem ter alternativa acessível ao gesto de arrastar.

| Ação | Resultado esperado |
| --- | --- |
| Abrir sem sessão | Exibe conteúdo público e permite explorar sem autenticação. |
| Pesquisar | Abre resultados com o termo preservado. |
| Selecionar categoria | Abre resultados correspondentes ou estado vazio daquela categoria. |
| Abrir story | Abre story e dados conhecidos da loja/oferta, sem inventar informações. |
| Abrir oferta | Abre detalhes e comunica expiração ou indisponibilidade quando aplicável. |
| Percorrer carrossel | Permite alcançar e abrir os itens apresentados. |
| Tentar novamente | Atualiza a seção ou tela com falha, preservando as demais quando possível. |

### Key Entities

- **Categoria**: agrupamento identificável de produtos.
- **Produto**: item de catálogo associado às ofertas de lojas.
- **Oferta**: preço e disponibilidade de um produto em uma loja, com validade e preço anterior quando cadastrados.
- **Story promocional**: conteúdo de loja ou oferta com validade quando definida.
- **Carrossel**: seção ordenada de produtos e sua origem editorial ou de recomendação.
- **Preferência e interação**: dados para recomendação, não equivalentes automaticamente a histórico de compras.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Pelo menos 90% das pessoas em avaliação conseguem iniciar busca ou abrir categoria em até 30 segundos, sem ajuda.
- **SC-002**: Em todos os cenários de visitante, selecionar busca, categoria, story ou oferta chega ao conteúdo correspondente sem exigir autenticação para explorar.
- **SC-003**: Em todos os cenários com dados de oferta ausentes, a interface não inventa preço, loja, estoque ou validade.
- **SC-004**: Catálogo vazio e falhas parciais ou de conexão são comunicados; nova tentativa está disponível quando aplicável.
- **SC-005**: Todos os itens de carrossel são alcançáveis por controle acessível, sem depender apenas de arrastar.
- **SC-006**: A tela é utilizável entre 360 e 1440 pixels sem rolagem horizontal.

## Assumptions

- Esta é a feature 006. As features 001 a 004 existem; a 005 está em desenvolvimento fora do repositório atual. A numeração 006 foi solicitada explicitamente.
- Visitantes podem explorar conteúdo público sem conta. Preferências autenticadas podem melhorar a relevância, mas não são pré-requisito.
- A tela é a referência 05 — Início; o protótipo não comprova implementação.
- Pesquisa, categorias, catálogo, ofertas, lojas e stories dependem de dados das áreas correspondentes. Não se inventa conteúdo ausente.
- Dados demonstrativos de shopping, lojas, produtos e ofertas devem ser identificados como fictícios.
- Compras e pagamentos não fazem parte da vitrine; esta tela não promete reserva ou compra.
- Algoritmo de recomendação, destinos do sino e de “Ver tudo”, seleção de shopping/piso e pop-ups de proximidade ficam fora desta feature.
- Esta especificação registra comportamento esperado; não afirma implementação ou validação funcional concluída. O projeto mantém a política atual sem testes como etapa de conclusão.
