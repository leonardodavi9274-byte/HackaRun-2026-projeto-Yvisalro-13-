# Feature Specification: Cadastro e preferências do consumidor

**Feature Branch**: main na elaboração; nenhum hook de criação de branch configurado.

**Created**: 2026-11-13

**Status**: Draft — revisão documental concluída; pronta para planejamento.

**Input**: User description: "Cadastro com nome, e-mail, senha e imagem opcional; definição de interesses e permissão para receber publicidade por email. (Semi-Essencial). É necessário especificar a integração do frontend com o backend seguindo o padrão do design das telas."

**Classificação**: Semi-Essencial. As prioridades das histórias ordenam apenas este recorte.

**Referências**: [especificação geral, FR-001, FR-002 e FR-010](../001-vitrine-perto/spec.md), [base existente](../003-base-webapi-frontend/spec.md), [telas 02 e 03](../../docs/frontend.md) e [constituição 1.0.0](../../.specify/memory/constitution.md).

## User Scenarios & Testing *(mandatory)*

Os cenários descrevem o aceite esperado. Não representam testes executados nem acrescentam uma etapa de testes ao fluxo sem testes da constituição.

### User Story 1 - Criar conta com os dados obrigatórios (Priority: P1)

Como consumidor, quero informar nome, e-mail e senha para criar uma conta, podendo continuar sem foto ou personalização.

**Why this priority**: Entrega acesso sem obrigar informações opcionais ou publicidade.

**Independent Test**: Critério independente: preencher a tela 02, continuar, pular a tela 03 e obter uma única conta confirmada, com nome e e-mail corretos e publicidade desativada.

**Acceptance Scenarios**:

1. **Given** uma pessoa sem cadastro, **When** informa dados válidos e escolhe **Continuar**, **Then** chega ao passo 2; a conta ainda não foi criada e nenhum sucesso de cadastro é anunciado.
2. **Given** o passo 2 vazio, **When** escolhe **Concluir cadastro** ou **Pular**, **Then** o serviço cria uma única conta e salva perfil, preferências vazias e publicidade desativada, informando o estado real antes da navegação.
3. **Given** nome vazio, e-mail inválido ou senha fora das regras, **When** tenta continuar ou concluir, **Then** recebe orientação junto aos campos, permanece no cadastro e pode corrigir sem perder os demais campos.
4. **Given** o passo 2 preenchido, **When** volta ao passo 1 e avança novamente, **Then** os dados, foto e seleções permanecem no fluxo aberto; cancelar explicitamente descarta o rascunho e a senha.
5. **Given** um e-mail já cadastrado, **When** o serviço processa a conclusão, **Then** não cria outra conta nem modifica a existente; orienta entrar ou recuperar acesso sem expor dados da conta.
6. **Given** dados salvos com confirmação de e-mail pendente, **When** recebe esse resultado, **Then** vê **Confirme seu e-mail para continuar**; só acessa o Início após confirmação e sessão válida. Confirmação vencida permite solicitar outra, respeitando o prazo e o retorno real de envio.

---

### User Story 2 - Definir interesses ou pular a personalização (Priority: P2)

Como consumidor, quero selecionar categorias e informar produtos de interesse para personalizar minha experiência, podendo pular essa etapa.

**Why this priority**: Acrescenta personalização sem impedir a criação da conta.

**Independent Test**: Critério independente: em um cadastro válido, selecionar e remover interesses, concluir e consultar os mesmos valores em outra sessão autenticada.

**Acceptance Scenarios**:

1. **Given** categorias disponíveis, **When** seleciona várias e desmarca uma, **Then** somente as escolhas finais são salvas; nenhuma categoria começa selecionada.
2. **Given** o campo **Produtos que você deseja**, **When** adiciona ou remove termos, **Then** vê etiquetas removíveis, sem entradas vazias ou duplicadas e dentro dos limites; esses termos não criam Desejos nem pedidos de alerta.
3. **Given** interesses salvos, **When** acessa a mesma conta em outra sessão, **Then** encontra os valores confirmados pelo serviço, independentemente do rascunho do primeiro dispositivo.
4. **Given** seleções não salvas, **When** escolhe **Pular**, **Then** conclui com categorias e termos vazios e publicidade desativada; o texto junto à ação explica esse efeito antes do acionamento.
5. **Given** falha ou ausência de categorias, **When** abre o passo 2, **Then** recebe estado de erro com nova tentativa ou lista vazia, conforme o caso, e ainda pode informar termos, concluir sem categorias ou pular.

---

### User Story 3 - Escolher e alterar publicidade por e-mail (Priority: P2)

Como consumidor, quero decidir separadamente se aceito publicidade por e-mail e alterar minha escolha depois.

**Why this priority**: Garante controle sobre comunicações, separado do acesso ao produto.

**Independent Test**: Critério independente: concluir sem autorização e, na conta autenticada, ativar e revogar a preferência, consultando a última escolha salva em outra sessão.

**Acceptance Scenarios**:

1. **Given** o primeiro acesso ao passo 2, **When** a tela aparece, **Then** publicidade começa desligada, com finalidade explícita e indicação de escolha opcional e alterável.
2. **Given** publicidade desligada, **When** conclui, **Then** obtém a conta normalmente e o serviço registra a opção negativa; interesses e aceitação dos documentos não concedem autorização promocional.
3. **Given** ativação explícita do controle, **When** conclui, **Then** o serviço registra opção positiva, momento, origem e versão do texto apresentado; a interface só confirma após salvamento.
4. **Given** publicidade ativada, **When** desativa e salva em **Perfil → Preferências da conta**, **Then** a revogação é registrada e aparece na próxima consulta, sem exigir o preenchimento de outros dados.
5. **Given** falha ao salvar alteração, **When** não há confirmação do serviço, **Then** a tela distingue a escolha em edição do último valor salvo, informa a falha e permite tentar novamente sem anunciar alteração concluída.

---

### User Story 4 - Adicionar uma foto opcional (Priority: P3)

Como consumidor, quero escolher e visualizar uma foto, substituí-la ou removê-la antes de concluir, sem depender dela para criar a conta.

**Why this priority**: Complementa o perfil; sua ausência ou falha não deve bloquear permanentemente o cadastro.

**Independent Test**: Critério independente: concluir com foto válida e, em outro cadastro, removê-la ou continuar explicitamente sem foto após uma falha.

**Acceptance Scenarios**:

1. **Given** o passo 1 sem foto, **When** seleciona imagem válida, **Then** vê prévia circular e pode substituir ou remover antes da conclusão.
2. **Given** arquivo incompatível, corrompido ou acima do limite, **When** seleciona ou envia, **Then** recebe orientação; os demais dados e a foto anterior válida, se houver, permanecem.
3. **Given** falha de foto após criação da identidade, **When** recebe o erro, **Then** pode tentar somente a foto ou escolher **Continuar sem foto**, mantendo a mesma conta e preferências.

---

### User Story 5 - Concluir com confirmação real e retomar falhas (Priority: P1)

Como consumidor, quero saber o que foi salvo e continuar após uma falha sem duplicar contas ou perder escolhas confirmadas.

**Why this priority**: Faz a integração entre telas e serviço entregar um fluxo completo.

**Independent Test**: Critério independente: percorrer conclusão com espera, erro e resposta perdida, distinguindo conta não criada, confirmação de e-mail pendente e cadastro parcialmente salvo.

**Acceptance Scenarios**:

1. **Given** conclusão em andamento, **When** aciona o botão repetidamente, **Then** vê **Criando conta…**, os comandos de conclusão ficam indisponíveis e a mesma intenção não produz contas nem registros da mesma escolha duplicados.
2. **Given** ausência de conexão antes do envio, **When** tenta concluir, **Then** recebe orientação e pode tentar novamente; nada é anunciado como salvo nem enviado automaticamente ao reconectar.
3. **Given** identidade criada e perfil ou preferências não salvos, **When** ocorre falha, **Then** vê **Cadastro incompleto** e retoma, com autorização da mesma conta, somente o que falta; o Início aguarda a conclusão.
4. **Given** perda de resposta após envio, **When** tenta novamente, **Then** o sistema resolve a mesma intenção antes de criar outra conta e informa **Não foi possível confirmar a conclusão** enquanto o resultado for desconhecido.
5. **Given** retomada ou consulta de preferências, **When** falta sessão válida ou se tenta acessar outra conta, **Then** o serviço exige autenticação ou nega acesso, sem devolver ou alterar dados de terceiros.
6. **Given** perfil e preferências salvos, foto salva ou dispensada e sessão válida, **When** o serviço confirma a conclusão, **Then** chega ao Início; sem interesses, pode explorar categorias sem alegação de personalização já disponível.

### Edge Cases

- Nome com acentos, apóstrofo ou hífen é aceito dentro dos limites; espaços externos não tornam um nome vazio válido.
- E-mail com espaços externos ou diferenças de maiúsculas/minúsculas não gera contas adicionais. A senha não é aparada nem alterada silenciosamente.
- Recarregar ou fechar antes da conclusão descarta o rascunho não salvo; reabrir não recupera senha. Navegar entre os dois passos preserva campos no fluxo aberto.
- Categoria retirada do conjunto permitido antes da conclusão exige revisão da seleção, preservando os demais dados e sem salvar categoria inexistente.
- “Fone bluetooth” e “ fone bluetooth ” são um único termo. Ao atingir o limite, a pessoa pode remover termos antes de adicionar outro.
- Interesses, documentos e confirmação de e-mail nunca ativam publicidade. Pular descarta também ativação feita apenas no rascunho.
- Sessão expirada exige nova autenticação para alteração, sem modificar silenciosamente a preferência salva.
- Falha de confirmação não pode ser exibida como **E-mail enviado**; reenvios respeitam a espera informada pelo serviço.
- Foto enviada não pode ser associada a outra conta ao abandonar ou retomar o fluxo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Oferecer **Login → Cadastro, passo 1 → Preferências, passo 2 → Início**, preservando os dois passos das referências e apresentando confirmação/erro dentro do fluxo. Aceite: US1.1–2, US1.6 e US5.6.
- **FR-002**: Exigir nome, e-mail e senha; dispensar foto e nome de usuário separado. Nome: 2 a 100 caracteres após retirar espaços externos, sem exigir sobrenome. E-mail: formato válido e até 254 caracteres. Aceite: US1.2–3 e casos de nome/e-mail.
- **FR-003**: Aceitar senha com no mínimo 8 caracteres Unicode e no máximo 72 bytes UTF-8, oculta inicialmente, com controle identificado de visibilidade. Informar que acentos e emoji podem ocupar vários bytes. Indicador textual: **Abaixo do mínimo**, **Acima do limite**, **Válida** ou **Forte**; forte exige ao menos 12 caracteres, letra, número e símbolo, dentro do limite. Senha válida não classificada como forte continua aceita; não truncar ou transformar a senha. Aceite: US1.3 e regra visual da tela 02.
- **FR-004**: Validar em **Continuar** sem criar identidade. Preservar rascunho entre passos no fluxo aberto; cancelar, recarregar ou encerrar descarta senha e dados não salvos, sem guardar senha em histórico ou rascunho persistente. Aceite: US1.1, US1.4 e caso de recarga.
- **FR-005**: Revalidar no serviço ao concluir, reconhecer e-mails equivalentes sem distinção de caixa e impedir duplicação ou alteração de conta existente. Aceite: US1.3, US1.5 e US5.4.
- **FR-006**: Permitir prévia, substituição e remoção de foto; aceitar JPEG, PNG e WebP de até 5 MiB e até 25 milhões de pixels, com os limites informados antes da seleção. Rejeitar arquivos que não possam ser lidos como imagem na seleção e no salvamento. O avatar salvo é estático; para WebP animado, usar o primeiro quadro e informar esse comportamento. Aceite: US4.1–2.
- **FR-007**: Oferecer nova tentativa ou **Continuar sem foto** após falha da foto, sem recriar conta ou confirmar foto não salva. Aceite: US4.3.
- **FR-008**: Fornecer categorias permitidas, inicialmente **Moda, Tênis, Eletrônicos, Beleza, Casa, Café e doces, Games, Livros e Esporte**; permitir múltipla seleção sem escolhas iniciais e recusar categorias inválidas. Aceite: US2.1, US2.5 e caso de categoria removida.
- **FR-009**: Permitir até 10 termos livres, cada um com 1 a 100 caracteres após retirar espaços externos, sem duplicatas por caixa ou espaços externos e com remoção individual. Aceite: US2.2 e caso de termo duplicado.
- **FR-010**: Tornar categorias e termos opcionais. **Pular** salva ambos vazios e publicidade desativada, com efeito explicado junto à ação. Termos não criam Desejos, correspondências garantidas de catálogo ou alertas. Aceite: US2.2 e US2.4.
- **FR-011**: Iniciar **Receber ofertas por e-mail?** desligado, explicar finalidade e alteração posterior e ativar somente por ação explícita; autorização não condiciona cadastro ou acesso. Aceite: US3.1–3.
- **FR-012**: Registrar escolha positiva ou negativa, momento, origem e versão do texto apresentado. Somente escolha positiva confirmada representa autorização promocional. Aceite: US3.2–3 e US5.1.
- **FR-013**: Permitir consulta, ativação e revogação em **Perfil → Preferências da conta**, na conta autenticada, com confirmação real. Alertas solicitados de reposição/preço não equivalem a autorização promocional. Aceite: US3.4–5 e casos de separação das escolhas.
- **FR-014**: Vincular perfil, foto, interesses e publicidade à mesma conta; consultas autenticadas retornam dados confirmados independentemente do dispositivo. Impedir leitura e alteração de outra conta. Aceite: US2.3 e US5.5.
- **FR-015**: Distinguir os resultados da tabela de integração. Liberar Início somente com perfil e preferências salvos, foto salva ou dispensada e sessão válida. Aceite: US1.6 e US5.3–6.
- **FR-016**: Retomar identidade parcialmente criada somente com vínculo autorizado à conta, preservando escolhas salvas e concluindo pendências sem nova criação de identidade. Aceite: US4.3 e US5.3–5.
- **FR-017**: Indicar andamento, impedir conclusões concorrentes e reconhecer repetição da mesma intenção sem duplicar conta, foto ou registro da mesma escolha. Aceite: US5.1 e US5.4.
- **FR-018**: Apresentar mensagens acionáveis de validação, indisponibilidade, ausência de conexão e falhas parciais; preservar dados editáveis no fluxo aberto e permitir retomada apropriada. Não confirmar criação, envio ou salvamento antes do serviço responsável. Aceite: US1.3, US2.5, US3.5, US4.3 e US5.2–4.
- **FR-019**: Validar e autorizar operações no serviço independentemente da interface; não expor senha, credenciais ou dados privados de terceiros em respostas, mensagens ou diagnósticos. Aceite: US1.5 e US5.5.
- **FR-020**: Manter organização, componentes e rótulos definidos abaixo, com operação por teclado, nomes acessíveis e indicação de erro/seleção além da cor. Aceite: regras das telas 02/03 e US1.3, US2.1–2, US3.1 e US4.1.
- **FR-021**: Disponibilizar Termos e Política de Privacidade antes da conclusão, sem apagar o formulário ao consultá-los; sua apresentação permanece separada da autorização promocional. Aceite: regra da tela 02 e US3.2.
- **FR-022**: Quando exigida, representar confirmação de e-mail pendente, reconhecer confirmação válida e permitir reenvio conforme o prazo informado. Anunciar envio somente após confirmação do serviço; verificação de e-mail não é publicidade. Aceite: US1.6 e casos de confirmação/reenvio.

### Apresentação e correspondência com o design

Referências visuais: [02 — Cadastro](../../docs/imagens/achei/02-cadastro.png) e [03 — Preferências](../../docs/imagens/achei/03-preferencias.png). Preservar fundo claro, texto escuro, cantos arredondados, cor quente nas ações principais e verde-azulado no controle promocional. Entre 360 e 1440 pixels, manter hierarquia e campos acessíveis sem rolagem horizontal; rolagem vertical é permitida.

| Referência | Elementos e comportamento |
| --- | --- |
| Tela 02 | Voltar, **Passo 1 de 2**, progresso, **Crie sua conta**, foto circular opcional, **Nome**, **E-mail de login**, **Senha**, visibilidade e indicador de senha, **Continuar**, Termos e Política. Voltar retorna à entrada e cancela o rascunho; havendo preenchimento, oferece manter ou descartar antes de sair. |
| Tela 03 | Voltar ao passo 1 sem perda de rascunho, **Passo 2 de 2**, progresso completo, **Do que você gosta?**, grade adaptável de categorias com ícones/nomes, produtos de interesse, etiquetas removíveis, controle promocional, **Concluir cadastro** e **Pular**. |
| Estados comuns | Andamento, mensagens junto aos campos, vazio, ausência de conexão, erro e nova tentativa; foco visível e anúncio da primeira mensagem de erro. Olho, voltar, foto e remover etiquetas têm nomes acessíveis. |
| Acesso posterior | **Perfil → Preferências da conta** consulta e altera publicidade com a linguagem visual da tela 03; o desenho completo de Perfil fica fora do recorte. |

**Divergências a adequar na implementação/protótipo**:

- A imagem 03 mostra interesses selecionados e publicidade ligada como exemplo. Uma conta nova inicia sem seleção e com publicidade desligada.
- O texto da imagem mistura ofertas com alertas de Desejos. Usar: **Quero receber publicidade e ofertas por e-mail. Opcional; você pode alterar essa escolha nas preferências da conta.**
- Acrescentar retorno ao passo 1 e **Passo 2 de 2** na tela 03, preservando a composição. Junto a **Pular**: **Continuar sem interesses e sem publicidade por e-mail**.
- Não afirmar senha forte ou sugestão automática disponível sem correspondência com a senha e o dispositivo reais.
- Textos da entrega usam Hackarum-Yvisalro, o nome canônico; as imagens antigas não são redesenhadas nesta especificação.

### Integração funcional entre frontend e backend

A tabela define dados, confirmações e transições observáveis de ambos os lados. Rotas, formatos de transporte, estrutura de código e armazenamento pertencem ao planejamento técnico.

| Ação da interface | Informações fornecidas | Responsabilidade e retorno do serviço | Reação da interface |
| --- | --- | --- | --- |
| **Continuar**, tela 02 | Nome, e-mail, senha e foto compõem o rascunho no fluxo aberto. | Não cria identidade nem confirma disponibilidade do e-mail nesta ação. | Valida e abre passo 2, sem anunciar cadastro concluído. |
| Abrir tela 03 | Solicitação das categorias permitidas, sem envio de senha. | Retorna identificação estável e nome das categorias, conjunto vazio ou falha. | Mostra grade, vazio ou erro/nova tentativa; mantém **Pular** disponível. |
| **Concluir cadastro** | Nome, e-mail, senha, foto opcional, categorias, termos e escolha promocional explícita, com indicação do texto apresentado. | Revalida, cria identidade e perfil vinculados, registra preferências e informa conclusão, espera ou falha por etapa. Momento e versão reconhecida do consentimento são determinados pelo serviço. | Exibe andamento, correções e apenas confirmações reais; segue o resultado correspondente. |
| **Pular** | Dados obrigatórios e foto opcional do passo 1; categorias/termos vazios e publicidade desativada. | Mesmas garantias de criação e confirmação da conclusão normal. | Aguarda retorno antes de navegar; não é simples desvio de tela. |
| Confirmar e-mail | Comprovação do fluxo de identidade; solicitação de reenvio, se necessária. | Informa confirmação válida/vencida, sessão e prazo de reenvio; confirma envio ou falha. | Mantém espera ou retoma a mesma conta; Início exige cadastro completo. |
| Retomar conclusão | Referência protegida à mesma intenção e, para acessar dados criados, comprovação autorizada da conta. | Resolve criação e etapas já confirmadas, conclui pendências e não retorna senha. | Não interpreta timeout como falha certa nem repete cegamente a criação. |
| Salvar/dispensar foto pendente | Imagem válida ou escolha explícita de dispensar, vinculada à própria conta. | Confirma associação ou dispensa; rejeita arquivo ou vínculo inválido. | Atualiza foto confirmada ou identificação sem foto, sem recriar conta. |
| Consultar preferências | Identidade da sessão autenticada. | Retorna perfil, foto, interesses e publicidade atuais da própria conta, ou sessão inválida/falha. | Exibe valores salvos, sem usar rascunho como prova de sincronização. |
| Alterar publicidade | Escolha explícita e texto apresentado, na sessão autenticada. | Salva na própria conta e retorna valor/momento confirmados ou falha. | Confirma novo estado após retorno; em falha distingue edição do último valor salvo. |

| Resultado da conclusão | Significado | Próximo estado visível |
| --- | --- | --- |
| Conta não criada | Rejeição confirmada antes de criar identidade. | Corrigir ou tentar novamente no cadastro. |
| Resultado desconhecido | Envio sem confirmação suficiente. | **Não foi possível confirmar a conclusão**; resolver a mesma intenção antes de repetir a criação. |
| Cadastro incompleto | Identidade existe, faltando perfil ou preferências confirmados. | Autenticar quando necessário e retomar pendências; sem Início. |
| Foto pendente | Perfil e preferências salvos; foto escolhida falhou. | Tentar novamente ou **Continuar sem foto**. |
| Confirmação de e-mail pendente | Dados salvos; falta confirmação e sessão válida. | **Confirme seu e-mail para continuar** e reenvio quando permitido. |
| Cadastro concluído | Identidade, perfil e preferências confirmados, foto salva ou dispensada e sessão válida. | Abrir Início; interesses vazios não impedem exploração. |

Pendências simultâneas devem ser preservadas: resolver uma não confirma as demais. Acesso a dados criados exige autorização. Dados opcionais preenchidos não podem ser descartados silenciosamente para produzir sucesso: a pessoa deve corrigir, pular ou dispensar a foto explicitamente.

### Key Entities *(include if feature involves data)*

- **Conta do consumidor**: identidade única, e-mail, estado de confirmação e vínculo com perfil; senha é credencial, não atributo retornado de perfil.
- **Perfil**: nome e foto opcional pertencentes a uma conta.
- **Categoria de interesse**: identificação e nome do conjunto permitido; associação de nenhuma, uma ou várias à conta.
- **Interesse por produto**: termo livre associado à conta, distinto de produto catalogado, Desejo e alerta.
- **Escolha de publicidade**: valor autorizado/não autorizado, momento, origem e versão do texto; a última escolha confirmada define autorização atual.
- **Intenção de cadastro**: referência protegida ao mesmo processo e suas etapas confirmadas para retomada; não autoriza acesso ao perfil por si só nem persiste a senha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 90% dos participantes de eventual avaliação de uso conseguem preencher os dois passos em até 3 minutos sem ajuda, excluindo espera de entrega/confirmação de e-mail. É meta de produto, não avaliação executada ou obrigatória neste fluxo.
- **SC-002**: Em 100% dos cenários válidos com/sem foto e interesses, há uma única conta e os dados consultados após nova autenticação correspondem à última confirmação de salvamento.
- **SC-003**: Em 100% dos cadastros sem ativação explícita e dos concluídos por **Pular**, publicidade permanece desativada, sem restringir acesso após confirmação da conta.
- **SC-004**: Em 100% dos cenários definidos de erro/resposta perdida, há ação de correção/retomada e nenhuma criação, envio ou atualização anunciada sem confirmação.
- **SC-005**: Toda alteração promocional confirmada, inclusive revogação, aparece na próxima consulta autenticada em outra sessão; acesso indevido não retorna nem altera dados de outra conta.
- **SC-006**: Todos os elementos obrigatórios das telas 02/03 ficam disponíveis entre 360 e 1440 pixels sem rolagem horizontal, com operação por teclado e identificação textual de controles/erros.

## Assumptions

### Premissas e limites

- O ator é o consumidor. Cadastro empresarial, login social, recuperação completa de senha, algoritmo de recomendação, sincronização de Desejos, campanhas, alertas e aplicativo móvel estão fora do recorte.
- Entrada de autenticação e Início recebem apenas as conexões necessárias ao cadastro/retomada; as telas 01/05 completas não são presumidas implementadas. Consulta das preferências da própria conta e alteração posterior da publicidade fazem parte deste recorte.
- A identidade é criada somente ao concluir ou pular o passo 2; antes disso, há rascunho no fluxo aberto. Retomada após criação parcial exige comprovar a mesma conta.
- Confirmação de e-mail é a premissa padrão. Se o ambiente já fornecer endereço confirmado e sessão válida na criação, vale a regra de conclusão diretamente; a interface não presume confirmação.
- Produtos desejados são termos livres. Categorias e limites acima são defaults explícitos para resolver lacunas do protótipo, sujeitos a revisão na evolução da especificação.
- **Pular** descarta a personalização em edição e não concede publicidade; a foto do passo 1 permanece, salvo remoção ou dispensa explícita.
- Em outra sessão, vale a última alteração confirmada. Rascunhos de outras sessões não alteram dados sem nova ação explícita de salvar.

### Dependências e estado atual

- A base da feature 003 consulta o estado da WebAPI, mas não entrega cadastro, identidade configurada ou persistência de perfil, foto, interesses e publicidade. Esta especificação não afirma integração já funcionando.
- O plano deve seguir as tecnologias/responsabilidades ratificadas, reutilizar a base e definir contratos técnicos e retomada segura. Esta etapa não implementa nem configura serviços.
- A implementação depende de identidade, confirmação/reenvio, sessão, persistência e armazenamento de imagens configurados, sem exposição de credenciais privilegiadas. Retomada autenticada e vínculo correto à conta são obrigatórios.
- Destinos e textos reais dos Termos e Política devem ser fornecidos antes da liberação. Links fictícios não atendem FR-021; essa dependência não impede planejamento.
- Campanhas ficam fora do recorte; seu envio futuro deve consultar a autorização vigente. Esta feature registra a escolha, sem afirmar envio de publicidade ou alertas.

### Ajustes de premissas no planejamento — 2026-11-13

- FR-003 foi alinhado ao limite do provedor de identidade: o default anterior de 128 caracteres foi substituído por mínimo de 8 caracteres Unicode e máximo de 72 bytes UTF-8, sem truncamento. A justificativa e a fonte estão em [research.md, D5](research.md#d5--corrigir-o-default-de-senha).
- FR-006 explicita o limite de 25 milhões de pixels e avatar estático, complementando os formatos e 5 MiB já definidos. São limites de processamento a informar na escolha da foto, conforme [research.md, D7](research.md#d7--foto-separada-e-privada).
