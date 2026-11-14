# Feature Specification: Autenticação real, recuperação de senha e login social

**Feature Branch**: nenhuma branch criada nesta etapa; especificação elaborada na `main`, sem hook de criação de branch configurado.

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Autenticação real com Suplabase, recuperação de senha por email, login com Google e Apple e suporte ao preenchimento automático de senhas. O envio efetivo de campanhas publicitárias ainda precisa ser definido. faça a spec 007. caso tenha duvida pergunte."

**Referências**: [cadastro e preferências 004](../004-cadastro-preferencias/spec.md), [especificação geral](../001-vitrine-perto/spec.md), [telas 01 a 04](../../docs/frontend.md) e [constituição](../../.specify/memory/constitution.md). “Suplabase” é interpretado como Supabase, provedor já adotado pelo projeto. A numeração 007 foi solicitada explicitamente; esta etapa não cria a feature 006.

## Clarifications

### Session 2026-11-14

- Q: Quando não for possível garantir bloqueio após cinco tentativas em todas as chamadas ao Supabase, qual regra usar? → A: Aceitar os limites de segurança do Supabase para tentativas de recuperação.
- Q: Uma pessoa já tem conta com o mesmo endereço verificado pelo Google ou Apple. O login social pode vinculá-la automaticamente? → A: Não; exigir confirmação adicional antes de vincular à conta existente.
- Q: Conta criada somente com Google ou Apple pode criar senha pelo e-mail de recuperação? → A: Não; manter entrada somente pelo provedor.

## User Scenarios & Testing *(mandatory)*

Os cenários são critérios de aceite esperados, sem afirmar execução ou exigir uma etapa de testes, conforme a constituição.

### User Story 1 - Entrar e manter acesso à própria conta (Priority: P1)

Como consumidor, quero entrar com meu e-mail e senha reais, continuar na mesma conta ao reabrir a aplicação e sair com segurança.

**Why this priority**: É a base do acesso aos dados pessoais e dos demais métodos de entrada.

**Independent Test**: Critério independente: autenticar uma conta confirmada, recarregar a aplicação, consultar suas preferências e sair, acompanhando os estados de sessão.

**Acceptance Scenarios**:

1. **Given** uma conta confirmada e completa, **When** a pessoa informa credenciais válidas e escolhe **Entrar**, **Then** a autenticação é confirmada pelo serviço e o Início é aberto com a identidade correta.
2. **Given** credenciais inválidas, **When** tenta entrar, **Then** recebe mensagem genérica sem revelar se o e-mail existe, pode corrigir os dados e permanece sem acesso privado.
3. **Given** uma identidade autenticada com cadastro incompleto ou e-mail ainda não confirmado, **When** tenta continuar, **Then** é encaminhada às pendências da feature 004; o login não as marca como concluídas.
4. **Given** sessão válida, **When** recarrega ou reabre a aplicação, **Then** a sessão é revalidada e preservada enquanto autorizada; sessão expirada ou revogada solicita nova entrada sem expor dados privados.
5. **Given** uma sessão ativa, **When** escolhe **Sair**, **Then** o acesso daquela sessão é encerrado e os dados privados deixam de aparecer, inclusive ao voltar no histórico; outra conta pode entrar sem herdar dados da anterior.

---

### User Story 2 - Recuperar a senha por e-mail (Priority: P1)

Como consumidor que esqueceu a senha, quero receber um código no meu e-mail, comprovar acesso a ele e definir uma nova senha.

**Why this priority**: Permite recuperar acesso sem intervenção da equipe e completa a tela 04.

**Independent Test**: Critério independente: solicitar recuperação, receber o e-mail real, confirmar o código, salvar nova senha e entrar novamente.

**Acceptance Scenarios**:

1. **Given** a tela de login, **When** escolhe **Esqueci a senha** e informa e-mail válido, **Then** vê andamento e, após aceite da solicitação pelo serviço, **Se houver uma conta elegível para este e-mail, você receberá instruções de recuperação**, sem confirmação da existência da conta ou da entrega na caixa postal.
2. **Given** conta elegível e solicitação aceita, **When** o e-mail é recebido, **Then** contém código de seis dígitos e prazo de validade; a tela permite preencher ou colar o código, apresenta destino parcialmente oculto e informa quando reenviar.
3. **Given** código válido associado à solicitação, **When** confirma o código, **Then** abre **Criar nova senha**, com nova senha e confirmação, sem liberar acesso comum ao perfil somente pela recuperação.
4. **Given** autorização de recuperação válida, **When** informa senhas coincidentes que atendem à política da feature 004 e salva, **Then** a alteração só é anunciada após confirmação do serviço, a autorização é consumida, as sessões anteriores da conta são revogadas e a pessoa retorna ao login para entrar com a nova senha.
5. **Given** código incorreto, vencido, já consumido ou de outra solicitação, **When** tenta confirmar, **Then** não altera a senha e recebe orientação para corrigir ou solicitar novo código.
6. **Given** intervalo de reenvio ainda ativo ou tentativas limitadas, **When** tenta reenviar ou confirmar, **Then** a restrição é aplicada pelo serviço e a tela informa a espera; reenviar após o prazo invalida o código anterior.
7. **Given** falha de conexão ou do serviço de e-mail, **When** solicita recuperação ou salva a senha, **Then** recebe erro e ação apropriada de nova tentativa, sem afirmar envio ou alteração não confirmados.

---

### User Story 3 - Entrar com Google ou Apple (Priority: P2)

Como consumidor, quero usar minha conta Google ou Apple para entrar, preservando meu perfil e preferências nos acessos seguintes.

**Why this priority**: Reduz o esforço de entrada e oferece os dois provedores pedidos.

**Independent Test**: Critério independente por provedor: autorizar a entrada, concluir as pendências de uma conta nova e entrar novamente, mantendo a mesma identidade e preferências.

**Acceptance Scenarios**:

1. **Given** o login, **When** escolhe **Continuar com Google** ou **Continuar com Apple**, **Then** inicia a autorização real com o provedor escolhido e só estabelece sessão após retorno validado pelo serviço de identidade.
2. **Given** primeiro acesso social, **When** a identidade é validada, **Then** cria ou retoma um único perfil ligado à identidade autorizada e solicita somente dados obrigatórios ausentes e preferências da feature 004, sem exigir senha local.
3. **Given** conta social com cadastro completo, **When** entra novamente pelo mesmo provedor, **Then** acessa a mesma conta e os dados já salvos, sem sobrescrever nome, foto ou preferências pela informação retornada no login.
4. **Given** autorização cancelada, negada, inválida ou interrompida, **When** retorna ao aplicativo, **Then** permanece sem nova sessão e pode tentar novamente ou usar outro método.
5. **Given** e-mail coincidente com outra conta, **When** o vínculo entre identidades não puder ser comprovado pelo serviço, **Then** não mescla contas nem transfere dados apenas por coincidência do endereço e orienta a usar o método original.
6. **Given** Apple com endereço privado de retransmissão ou nome não fornecido em acessos seguintes, **When** a pessoa entra, **Then** a identidade estável do provedor mantém a conta; nome ausente é solicitado somente se o perfil ainda não o tiver.

---

### User Story 4 - Usar o gerenciador de senhas (Priority: P2)

Como consumidor, quero preencher credenciais salvas e usar sugestões de senha do navegador ou dispositivo, sem copiar tudo manualmente.

**Why this priority**: Melhora o acesso e concretiza a intenção visual da tela 01 sem simular recursos do dispositivo.

**Independent Test**: Critério independente: preencher login com credenciais salvas e concluir cadastro ou redefinição com senha sugerida, em ambiente compatível; repetir com preenchimento manual.

**Acceptance Scenarios**:

1. **Given** credenciais salvas e gerenciador compatível, **When** a pessoa interage com e-mail ou senha no login, **Then** pode usar o preenchimento oferecido pelo ambiente e enviar os valores preenchidos normalmente.
2. **Given** cadastro ou redefinição, **When** o ambiente oferece gerar ou salvar senha, **Then** os campos aceitam sugestão, colagem e salvamento sem confundir senha atual com nova senha; as regras de senha continuam visíveis e aplicadas.
3. **Given** ambiente sem gerenciador disponível, **When** abre os formulários, **Then** pode preenchê-los manualmente e nenhum cartão afirma haver uma senha salva no Google ou iCloud.
4. **Given** senha preenchida, **When** alterna mostrar/ocultar ou recebe erro, **Then** mantém o valor no formulário aberto sem divulgá-lo em mensagens, histórico ou diagnósticos.

### Edge Cases

- Conta exclusivamente social que solicita recuperação: recebe a mesma resposta pública genérica; a recuperação não cria senha local nem altera vínculos sociais neste recorte. A orientação de usar o provedor está disponível a todos na tela.
- Pessoa já autenticada que inicia recuperação de outra conta: a autorização de recuperação permanece separada da sessão comum; nenhum dado de uma conta é aplicado à outra.
- Retorno social repetido, adulterado ou não iniciado naquele fluxo: não cria sessão nem duplica perfil; destinos de retorno externos não autorizados são recusados.
- Duplo clique ou retorno repetido: não duplica conta nem conclusão de cadastro; operações em andamento ficam identificadas.
- Falha após criação da identidade social: retoma pendências na mesma conta, seguindo as garantias da feature 004.
- Nova senha e confirmação diferentes: informa o erro antes de salvar; não modifica a senha existente.
- Recarga durante recuperação: não recupera senha digitada nem considera o código validado sem autorização válida do serviço; permite reiniciar o fluxo.
- Alteração de senha com resposta perdida: informa resultado não confirmado e orienta tentar entrar com a nova senha ou reiniciar a recuperação, sem repetir cegamente a alteração.
- Provedor indisponível ou sem configuração: informa indisponibilidade do método e mantém os demais acessíveis; não usa autenticação fictícia como alternativa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Usar Supabase Auth como autoridade real de identidade, reaproveitando cadastro, login e sessão existentes; liberar dados privados somente após validação de identidade e autorização. Aceite: US1.1–4.
- **FR-002**: Oferecer login por **E-mail** e **Senha**, com senha oculta inicialmente, controle acessível de visibilidade e mensagens genéricas para credenciais inválidas. Não exigir nome de usuário separado. Aceite: US1.1–2 e US4.4.
- **FR-003**: Revalidar e manter sessões autorizadas entre reaberturas, renovar quando permitido e solicitar nova entrada quando expiradas ou revogadas, sem manter dados privados visíveis após encerramento. Aceite: US1.4–5.
- **FR-004**: Encaminhar cadastro incompleto e confirmação de e-mail pendente aos fluxos da feature 004; acesso social não dispensa perfil nem decisão promocional. Aceite: US1.3 e US3.2.
- **FR-005**: Disponibilizar **Esqueci a senha** e recuperação real por e-mail com código de seis dígitos, autorização limitada à redefinição e resposta pública uniforme para endereços existentes ou inexistentes. Aceite: US2.1–3.
- **FR-006**: Adotar código com validade de 10 minutos, intervalo mínimo de 60 segundos entre envios e os limites de tentativas aplicados pelo Supabase; prazos e restrições são aplicados pelo serviço, sem depender do relógio do cliente. Aceite: US2.2, US2.5–6.
- **FR-007**: Permitir colar o código inteiro, corrigir o endereço reiniciando a solicitação e reenviar após o prazo, invalidando o código anterior. Código consumido ou vencido não autoriza alteração. Aceite: US2.2, US2.5–6.
- **FR-008**: Exigir nova senha e confirmação coincidentes, mantendo a política da feature 004: mínimo de 8 caracteres Unicode e máximo de 72 bytes UTF-8, sem truncamento ou transformação. Aceite: US2.4 e caso de senhas diferentes.
- **FR-009**: Confirmar alteração somente após aceite do serviço, consumir a autorização, revogar as sessões anteriores da conta e retornar ao login com mensagem de sucesso; senha antiga deixa de autenticar. Aceite: US2.4 e SC-002.
- **FR-010**: Disponibilizar **Continuar com Google** e **Continuar com Apple**, com autorização real e validação de retorno, método escolhido e vínculo de identidade antes de criar sessão. Aceite: US3.1 e casos de retorno inválido.
- **FR-011**: No primeiro acesso social, criar ou retomar perfil único, pedir nome ausente e encaminhar às preferências opcionais, sem solicitar senha local; publicidade inicia desativada e **Pular** mantém essa escolha. Aceite: US3.2 e SC-005.
- **FR-012**: Preservar identidade e dados confirmados em acessos sociais seguintes, inclusive com e-mail privado da Apple; não sobrescrever perfil nem unir contas somente por e-mail coincidente. Uma nova identidade social para conta existente exige confirmação adicional anterior ao vínculo; o e-mail verificado pelo provedor, sozinho, não satisfaz essa condição. Aceite: US3.3, US3.5–6 e esclarecimento de 2026-11-14.
- **FR-013**: Tratar cancelamento, recusa, falha e método não configurado com mensagem e possibilidade de nova tentativa ou outro método, sem anunciar autenticação bem-sucedida. Aceite: US3.4 e casos de indisponibilidade.
- **FR-014**: Permitir preenchimento nativo de credenciais existentes no login, geração/salvamento de novas senhas no cadastro e redefinição, além de colagem e preenchimento manual; não prometer disponibilidade de gerenciador nem apresentar credenciais fictícias. Aceite: US4.1–3.
- **FR-015**: Não registrar senhas, códigos, autorizações de recuperação, credenciais privilegiadas ou dados privados de terceiros em mensagens, diagnósticos ou materiais de demonstração; validar autorização no serviço em toda operação privada. Aceite: US1.2–5, US2.3 e US4.4.
- **FR-016**: Mostrar andamento, ausência de conexão, erro e nova tentativa; impedir submissões concorrentes e respeitar limites de tentativas/envios do serviço, sem confirmar envio, login ou alteração antes do retorno responsável. Aceite: US2.6–7, US3.4 e casos de repetição.
- **FR-017**: Manter operação por teclado, foco visível, rótulos acessíveis e mensagens além da cor em login, recuperação, nova senha e ações sociais, entre 360 e 1440 pixels sem rolagem horizontal. Aceite: SC-006.
- **FR-018**: Preservar a separação entre mensagens transacionais de autenticação, publicidade e alertas solicitados. Autenticar, recuperar senha ou entrar por provedor não concede consentimento promocional nem dispara campanhas. Aceite: SC-005 e limites do escopo.

### Apresentação e correspondência com o design

| Referência | Comportamento especificado |
| --- | --- |
| [01 — Login](../../docs/imagens/achei/01-login.png) | E-mail, senha, visibilidade, **Entrar**, **Esqueci a senha**, **Criar conta**, **Continuar com Google** e **Continuar com Apple**. Remover conta de exemplo e cartão de senha salva simulado; o ambiente oferece o preenchimento real. |
| [04 — Recuperação](../../docs/imagens/achei/04-recuperacao-de-senha.png) | E-mail, resposta genérica após solicitação aceita, destino oculto, seis dígitos, prazo de reenvio e **Confirmar e criar nova senha**. Substituir a afirmação irrestrita **Código enviado** pela resposta que não revela a existência da conta. |
| Nova senha | Extensão da tela 04 com **Nova senha**, **Confirmar nova senha**, regras, visibilidade e **Salvar nova senha**. Após sucesso, voltar ao login. |
| Telas 02/03 | Preservar cadastro e preferências da feature 004; identidade social pula credenciais locais e preenche somente dados ausentes. Nome e foto do provedor são sugestões iniciais, sem sobrescrever dados confirmados. |

As novas etapas preservam a linguagem visual existente. Textos novos usam Hackarum-Yvisalro. A spec resolve os pontos de entrada sociais, a conclusão da recuperação e a ausência de conta lembrada fictícia; não redesenha as imagens nesta etapa.

### Key Entities *(include if feature involves data)*

- **Conta do consumidor**: identidade estável associada ao perfil e às preferências existentes, com estado de confirmação e conclusão do cadastro.
- **Identidade de acesso**: vínculo autorizado entre a conta e um método de entrada, por senha, Google ou Apple; endereço de e-mail isolado não comprova vínculo.
- **Sessão**: acesso autenticado com validade e estado de revogação; distinto da autorização de recuperação.
- **Solicitação de recuperação**: endereço de destino, validade, restrições de reenvio/tentativas e estado do código; não concede leitura de perfil.
- **Autorização de redefinição**: comprovação temporária e de uso único que permite somente alterar a senha da conta correspondente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em eventual avaliação, pelo menos 90% das pessoas com conta válida concluem o login em até 1 minuto, excluindo espera e interação externa com Google ou Apple. É meta de produto, sem avaliação executada nesta etapa.
- **SC-002**: Em todos os cenários de recuperação válida, a nova senha passa a autenticar, a antiga deixa de autenticar, o código consumido não é reutilizável e nenhuma sessão anterior continua autorizada após a conclusão.
- **SC-003**: Em todos os cenários de código inválido, vencido, bloqueado ou de outra solicitação, nenhuma senha é alterada e há orientação de recuperação.
- **SC-004**: Para cada um dos dois provedores sociais, primeiro acesso e acessos seguintes preservam uma única identidade autorizada e os dados confirmados; retornos inválidos ou cancelados não criam sessão.
- **SC-005**: Em todos os métodos de entrada e recuperação, publicidade continua no último estado explicitamente confirmado; contas novas sem adesão permanecem sem publicidade e nenhum desses fluxos envia campanhas.
- **SC-006**: Todos os controles dos fluxos funcionam por teclado e permanecem disponíveis entre 360 e 1440 pixels sem rolagem horizontal; em ambientes compatíveis, login aceita credenciais preenchidas e cadastro/redefinição aceitam senha sugerida, mantendo preenchimento manual disponível.
- **SC-007**: Todos os cenários definidos de falha, desconexão e serviço não configurado apresentam estado acionável e nenhuma confirmação falsa de autenticação, envio ou salvamento.

## Assumptions

### Premissas e limites

- O recorte é o consumidor na interface web atual. Autenticação empresarial, aplicativo Flutter, autenticação em dois fatores, passkeys, painel de gerenciamento de dispositivos e vinculação/desvinculação manual de provedores ficam fora desta feature.
- Google e Apple permitem primeiro acesso com criação de conta, além de entrada em contas já vinculadas. Não se exige criar conta por senha previamente.
- O fluxo de recuperação mantém o código de seis dígitos da tela 04, validade de 10 minutos e reenvio após 60 segundos. O limite de tentativas segue o Supabase, conforme esclarecimento de 2026-11-14.
- Contas exclusivamente sociais usam o provedor original para recuperação neste recorte; adicionar senha local não é parte da feature. Vínculos entre métodos só são aceitos quando comprovados pelo serviço de identidade, nunca por comparação local de e-mails.
- Não é mantida uma lista própria de contas lembradas após sair; gerenciadores do dispositivo podem oferecer contas salvas conforme suas permissões.
- O envio efetivo de campanhas publicitárias continua **pendente de definição**. Canal operacional, ferramenta, público, frequência, conteúdo, agendamento, entrega e descadastro precisam de especificação própria; nada disso bloqueia os e-mails transacionais desta feature.
- Consentimento e preferências permanecem sob as regras da feature 004. E-mail de recuperação e confirmação não depende de autorização promocional.

### Dependências e estado atual

- Existem código de login por senha, confirmação/reenvio, sessão web e integração com Supabase em `backend/src` e `frontend/src/features/session`. A tela de login informa que recuperação ainda não está disponível. Código existente não comprova configuração ou funcionamento externo.
- A implementação deve reutilizar a base, preservar isolamento e retomada da feature 004 e detalhar contratos e configurações no plano. Esta etapa produz somente especificação e checklist.
- Liberação depende de projeto Supabase configurado, serviço de e-mail transacional com remetente e modelos reais, endereços de retorno autorizados e ambientes acessíveis para completar os fluxos. Aceite de envio pelo serviço não comprova recebimento na caixa postal.
- Google e Apple dependem de credenciais e habilitação nos respectivos provedores, configuração no serviço de identidade e domínios/endereço de retorno autorizados. Inscrições ou custos de contas de desenvolvedor, se necessários, não são presumidos disponíveis.
- O planejamento deve definir uma matriz de ambientes compatíveis para preenchimento automático, incluindo Chrome com gerenciador Google e Safari com Senhas/iCloud em dispositivos compatíveis; disponibilidade depende do usuário e do ambiente.
- Credenciais privilegiadas ficam no servidor e fora do repositório. Nenhuma configuração externa, envio de e-mail ou autenticação real foi executada nesta etapa. As specs anteriores são preservadas; este recorte amplia as exclusões de login social e recuperação registradas na feature 004.
