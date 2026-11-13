# Feature Specification: Hackarum-Yvisalro — planejamento inicial

**Feature Branch**: `docs/detalhamento-frontend`
**Created**: 2026-11-13
**Status**: especificação da entrega inicial esclarecida; pronta para planejamento técnico
**Input**: revisar o repositório, padronizar Hackarum-Yvisalro, organizar os seis itens da entrega, registrar as tecnologias solicitadas e fazer commit.

## Clarifications

### Session 2026-11-13

- Q: Como MySQL e PostgreSQL devem participar do primeiro MVP? → A: Opção A, PostgreSQL como banco principal do MVP e MySQL somente como alternativa documentada; não haverá dois bancos operacionais no primeiro recorte.
  - *Anotação no branch `VictorXavierSL-patch-1-dev`:* este branch trata o uso de MySQL como alternativa, e também o React na web, como propostas a confirmar com a equipe. A resposta acima continua registrada como foi dada. O formato da landing page também passou a ser decisão pendente, e o roteiro do Canva é rascunho.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Avaliar os seis itens da entrega (Priority: P1)

Como avaliador, quero encontrar proposta e telas, documentação, linguagem, arquitetura, plataformas e incorporação da prática sorteada para compreender o planejamento e seu estado real.

**Why this priority**: corresponde aos seis itens exigidos pela equipe.

**Independent Test**: localizar os seis itens e suas evidências sem executar uma aplicação.

**Acceptance Scenarios**:

1. **Given** o planejamento, **When** consulto o índice, **Then** encontro os seis títulos exigidos e referências para cada item.
2. **Given** uma tecnologia solicitada, **When** consulto a documentação técnica, **Then** encontro seu papel, a plataforma e a situação: planejada, implementada ou pendente.
3. **Given** uma pendência, **When** reviso o material, **Then** ela está identificada sem alegação de conclusão.

### User Story 2 - Apresentar a solução aos dois públicos (Priority: P2)

Como integrante da equipe, quero apresentar a proposta para consumidores e lojistas com identidade consistente e explicar como as páginas de apresentação incorporam a prática sorteada.

**Why this priority**: conecta a entrega à descoberta de produtos, lojas e promoções.

**Independent Test**: relacionar cada roteiro ao público, ao benefício e à próxima ação.

**Acceptance Scenarios**:

1. **Given** o roteiro inicial, **When** a equipe o revisa, **Then** encontra propostas para consumidor e lojista com público, conteúdo e chamada para ação distintos.
2. **Given** as imagens existentes, **When** são usadas na apresentação, **Then** os dados fictícios e as funções futuras são identificados.
3. **Given** um botão ilustrativo, **When** a demonstração é apresentada, **Then** ele não promete acesso a um serviço inexistente.

### User Story 3 - Conferir e versionar os materiais (Priority: P2)

Como integrante da equipe, quero conhecer as versões verificadas e as alterações registradas para continuar o trabalho com referências confiáveis.

**Why this priority**: há nomes e documentos diferentes nas versões locais e remotas.

**Independent Test**: consultar o relatório de conformidade e o commit local da revisão.

**Acceptance Scenarios**:

1. **Given** o relatório, **When** consultado, **Then** apresenta repositório, branches, commits e diferenças relevantes.
2. **Given** os documentos atuais, **When** comparados, **Then** usam Hackarum-Yvisalro como nome; nomes antigos aparecem somente como referências históricas.
3. **Given** as alterações verificadas, **When** registradas, **Then** o commit inclui os documentos relacionados e o relato distingue registro local de publicação remota.

### Edge Cases

- Link local quebrado ou arquivo ausente deve ser apontado como pendência.
- Nomes antigos em imagens e caminhos históricos devem ser explicados; não afirmar alteração visual inexistente.
- Consultar uma branch não significa integrar seu histórico.
- O primeiro MVP tem uma fonte principal de dados; a alternativa avaliada não recebe cópias nem escritas simultâneas.
- Imagens de funções não executam autenticação, busca, alertas ou rotas.
- Não incluir credenciais ou dados pessoais reais como evidência pública.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O planejamento MUST apresentar “Proposta e estrutura inicial das telas”; “Documentação inicial do projeto”; “Linguagem de programação escolhida”; “Arquitetura proposta”; “Plataforma e tecnologias adotadas”; “Descrição de como a tecnologia ou prática sorteada será incorporada à solução”. Aceite: História 1, cenário 1.
- **FR-002**: Os documentos atuais MUST usar Hackarum-Yvisalro como identidade, explicando nomes históricos quando necessários. Aceite: História 3, cenário 2.
- **FR-003**: A proposta MUST manter consumidores e representantes como públicos, descoberta e comparação como objetivos, compras e pagamentos fora do escopo. Aceite: conferir públicos e limites no planejamento e na especificação funcional.
- **FR-004**: A estrutura MUST referenciar as 11 telas existentes e listar separadamente telas e estados ausentes. Aceite: 11 referências válidas e lista explícita de lacunas.
- **FR-005**: A documentação técnica MUST registrar linguagem, plataforma, papel e situação das escolhas solicitadas, distinguindo execução, interface, persistência e apresentação; indicar uma fonte principal de dados no MVP e o segundo banco somente como alternativa documentada. Aceite: História 1, cenário 2, e matriz técnica sem dois bancos operacionais.
- **FR-006**: A arquitetura MUST explicar apresentação, estado de tela, regras de negócio, dados, fluxos de acesso e proteção entre empresas. Aceite: cada responsabilidade e fluxo tem descrição no documento de arquitetura.
- **FR-007**: A incorporação da prática sorteada MUST relacionar apresentação e problema do desafio, propor conteúdos para públicos distintos e indicar evidências exigidas. Aceite: História 2, cenários 1 e 2.
- **FR-008**: O roteiro MUST distinguir ações ilustrativas de funções disponíveis. Aceite: História 2, cenário 3.
- **FR-009**: A revisão MUST registrar versões, diferenças, pendências e evidências; consulta de branch não pode ser descrita como merge. Aceite: História 3, cenário 1.
- **FR-010**: As alterações MUST ter referências e consistência verificadas e ser registradas em commit, com situação explícita do envio ao servidor. Aceite: História 3, cenário 3.

### Key Entities

- **Projeto**: identidade, objetivo, públicos e limites; mantém a [especificação funcional](../001-vitrine-perto/spec.md).
- **Item da entrega**: um dos seis títulos, evidência e situação da revisão.
- **Tela**: número único entre as 11 referências, nome, imagem, fluxo e lacunas.
- **Apresentação**: público, benefício, chamada e situação; passa de roteiro para produzido e revisado.
- **Decisão técnica**: tecnologia, função, situação e dependências; pendente não significa implementada.
- **Evidência**: identificada por repositório, branch, commit e arquivo consultado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cobertura de 6/6 itens exigidos, cada um com seção própria e uma evidência.
- **SC-002**: As 11 imagens são localizáveis na documentação sem link local quebrado.
- **SC-003**: 100% das escolhas solicitadas têm papel ou pendência explícita na matriz técnica.
- **SC-004**: Zero divergências no nome atual e zero alegações de implementação sem evidência nos documentos revisados.
- **SC-005**: Pelo menos dois roteiros propostos para públicos distintos, cada um com problema, benefício e próxima ação.
- **SC-006**: Todas as diferenças relevantes das versões consultadas constam no relatório; as alterações relacionadas são identificáveis em um commit.

## Assumptions

- O escopo é revisão e planejamento inicial; o produto continua na especificação funcional e exigirá plano e tarefas próprios.
- A lista do usuário contém títulos da entrega, não seis nomes de repositórios.
- O nome canônico é Hackarum-Yvisalro; endereços, caminhos históricos e nomes dentro das imagens podem conservar referências antigas explicadas.
- Landing page é a prática sorteada conforme a branch da equipe. As ferramentas concretas e seus papéis ficam na documentação técnica.
- Duas apresentações, para consumidor e lojista, são proposta inicial; quantidade final e páginas adicionais dependem de revisão da equipe.
- Esta revisão produz documentação e roteiros; slides na conta externa e publicação da aplicação são etapas posteriores.
- A constituição existente é um template, sem princípios aprovados.
- A equipe confirmou uma fonte principal de dados no MVP; a segunda tecnologia de persistência será somente alternativa documentada. A escolha concreta está registrada nesta sessão e na matriz técnica do README.
- Dependências: produzir slides e revisar as exigências da disciplina; versões, contratos e hospedagem ficam para o planejamento técnico.
