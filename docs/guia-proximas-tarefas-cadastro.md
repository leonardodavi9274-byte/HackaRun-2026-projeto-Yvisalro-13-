# Próximas tarefas: cadastro e preferências

Este guia serve para distribuir o trabalho da equipe e explicar o que entregar em cada etapa. A prioridade é fechar o cadastro mínimo com confirmação e retomada; depois entram interesses, publicidade e foto.

Referência consultada em **13/11/2026**: branch `004-cadastro`, último commit local `b76d7ce`. Existem alterações posteriores ainda sem commit. Antes de distribuir trabalho, confirmar a versão que todos receberão.

O detalhamento oficial continua em [tasks.md](../specs/004-cadastro-preferencias/tasks.md). Usar também os contratos de [API](../specs/004-cadastro-preferencias/contracts/api.md) e [telas](../specs/004-cadastro-preferencias/contracts/ui.md), o [modelo de dados](../specs/004-cadastro-preferencias/data-model.md) e as imagens [02 — cadastro](imagens/achei/02-cadastro.png) e [03 — preferências](imagens/achei/03-preferencias.png).

## 1. Colocar todos na mesma versão

**Responsável sugerido:** pessoa que coordena a integração.

1. Conferir `git status` e o `tasks.md` antes de distribuir tarefas.
2. Revisar e registrar as alterações locais que formarão a base compartilhada. O commit `b76d7ce` contém a fundação; os novos serviços, controllers, rotas e migrações posteriores ainda estão na pasta de trabalho.
3. Compilar essa versão e publicar a branch atualizada para a equipe. Combinar qual commit será usado como ponto de partida.
4. Cada pessoa começa uma branch própria a partir dessa base e entrega um pull request com destino a `004-cadastro`.
5. Definir uma pessoa para integrar arquivos compartilhados: `App.jsx`, `navigation.js`, `RegistrationProvider.jsx`, `registration.repository.js`, `HomeView.jsx`, `app.ts` e `me.routes.ts`.

Na consulta deste guia, T001–T027, T032, T034–T036 e T040 estavam marcadas no arquivo local. Isso indica trabalho registrado pelo implementador; a integração do cadastro ainda depende das tarefas de frontend. Em especial, T033 continua pendente e é predecessora de T034 no plano. Revisar essa sequência antes de considerar a história de retomada concluída.

**Entrega:** uma versão comum disponível para todos, com responsáveis e arquivos combinados.

## 2. Criar o estado e o acesso à API do cadastro — T028

**Responsável sugerido:** pessoa do frontend responsável pelo fluxo.

1. Criar `frontend/src/features/registration/repositories/registration.repository.js` para acessar a API pelo cliente HTTP existente.
2. Criar `useRegistrationViewModel.js` e `RegistrationProvider.jsx` em `frontend/src/features/registration/viewmodels/`.
3. Carregar configuração, documentos e aviso de publicidade da API.
4. Manter o rascunho em memória e preservar os campos ao voltar entre os dois passos.
5. Fazer **Continuar** apenas validar e avançar. A criação da conta acontece em **Concluir** ou **Pular**, por um único comando do ViewModel.
6. Usar o contrato mínimo: sem foto, listas de interesses vazias e publicidade `false`. A estrutura completa de intenção e recuperação será consolidada em T037–T041.

Senha, arquivos e rascunho não vão para storage do navegador. As Views recebem estado e comandos do ViewModel; o acesso HTTP fica no Repository.

**Entrega:** a base usada pelas telas, com estado compartilhado e chamadas reais à API. Integrar essa tarefa antes de iniciar as telas dependentes.

## 3. Dividir as telas do cadastro — T029 e T030

**Pré-requisito:** T028 integrada. Estas duas tarefas podem ser feitas por pessoas diferentes, em arquivos separados.

| Frente | Passo a passo | Entrega |
| --- | --- | --- |
| T029 — `AccountStepView.jsx` | Montar Passo 1 de 2; incluir nome, e-mail, senha, mostrar/ocultar senha, indicação textual de validade e links reais dos documentos; apresentar erros junto aos campos e ação de voltar/sair. | Tela de dados conectada ao ViewModel e fiel à imagem 02. |
| T030 — `PreferencesStepView.jsx` | Montar Passo 2 de 2; incluir voltar, Concluir e Pular; explicar que Pular continua sem interesses e sem publicidade. | Tela mínima de conclusão conectada ao mesmo rascunho. |

Aplicar nome aparado de 2–100 caracteres; e-mail até 254; senha com mínimo de 8 caracteres Unicode e máximo de 72 bytes UTF-8. Não transformar a senha. Categorias interativas, publicidade e foto entram nas etapas próprias; o desenho inicial deve respeitar esse recorte.

## 4. Fazer confirmação e entrada — T031

**Responsável sugerido:** outra pessoa do frontend, após T028. Pode trabalhar junto com as telas da etapa 3, respeitando os arquivos combinados.

1. Criar `ConfirmationView.jsx` e `useIdentityViewModel.js` no módulo de cadastro.
2. Criar `frontend/src/features/session/views/LoginView.jsx` usando o módulo de sessão existente.
3. Na confirmação, ler o `token_hash` do fragmento, removê-lo da URL e verificar somente após clique explícito.
4. Implementar reenvio com o prazo informado pelo serviço, mensagens de erro e opção de entrar com e-mail/senha digitados novamente.
5. Consultar o estado de onboarding após confirmação ou login para indicar a próxima ação real.

**Entrega:** confirmação e entrada conectadas ao backend. A mensagem de sucesso depende da resposta do serviço; reenvio aceito não comprova entrega do e-mail.

## 5. Integrar a navegação e o Início — T033

**Responsável sugerido:** pessoa que integra o frontend, após T029–T031 e T032.

1. Criar `frontend/src/app/navigation.js` com a History API prevista no contrato, mantendo as dependências atuais.
2. Integrar `/entrar`, `/cadastro`, `/cadastro/preferencias`, `/cadastro/confirmar` e `/inicio` em `App.jsx`.
3. Manter o `RegistrationProvider` montado ao navegar entre os passos.
4. Tratar acesso direto ao passo 2: sem rascunho nem sessão de retomada, voltar ao passo 1.
5. Integrar `useHomeViewModel.js` e `HomeView.jsx` aos dados confirmados da conta e à lista real de categorias.
6. Liberar o Início somente com sessão válida e conclusão persistida. Quando a API retornar `ready_to_complete`, concluir por POST antes de navegar.

**Entrega:** o caminho mínimo das telas está integrado. A próxima etapa completa as falhas e a retomada necessárias ao marco MVP.

## 6. Fechar a retomada sem duplicar conta — T037–T042

**Responsáveis sugeridos:** pessoa do fluxo de frontend e pessoa do backend.

O backend de T034–T036 e T040 já aparece na pasta local. Revisar e integrar esse código existente junto ao fluxo, seguindo as dependências de `tasks.md`.

1. **T037:** criar `registration-attempt.js` com UUID, segredo de retomada e snapshot em memória. Preservar a mesma intenção quando o resultado for incerto ou houver vínculo com a conta.
2. **T038:** criar `useOnboardingViewModel.js` e ampliar o Repository para consultar a situação da intenção e o onboarding autenticado, além de enviar conclusão/correções autorizadas.
3. **T039:** criar `ResumeRegistrationView.jsx` e completar os estados de confirmação, erro, indisponibilidade e ausência de conexão. A nova tentativa depende de ação da pessoa.
4. **T041:** integrar todas as `pendingActions`, impedir comandos simultâneos e tratar `ready_to_complete` com POST idempotente. Uma nova tentativa da mesma operação mantém chave e payload.
5. **T042:** preparar `backend/supabase/maintenance/cleanup-registration-state.sql` e documentar o procedimento. Preservar contas Auth, dados pendentes vinculados e recibos necessários; a manutenção não roda automaticamente durante o cadastro.

Resultado desconhecido não significa que a conta deixou de ser criada. Após vínculo, o fluxo autentica e retoma a mesma conta. Reconectar à internet não dispara novo envio automaticamente.

**Entrega do marco MVP:** cadastro mínimo, confirmação, entrada, conclusão persistida e retomada implementados. A execução com serviços reais ainda depende da configuração do ambiente.

## 7. Acrescentar interesses, publicidade e foto

**Pré-requisito:** marco T001–T042 concluído. A ordem recomendada é interesses → publicidade → foto. Núcleos em arquivos distintos podem avançar em paralelo; as integrações aguardam as dependências abaixo.

### Interesses — T043–T048

1. **T043 e T044:** dividir o modelo `interests.js` e a grade `CategoryGrid.jsx` entre duas pessoas, se houver disponibilidade.
2. **T045, após T043:** implementar `ProductInterestInput.jsx`, com inclusão explícita e remoção de termos.
3. **T046:** integrar o estado em `useInterestsViewModel.js` e no Repository.
4. **T047:** conectar os controles às telas de preferências e retomada.
5. **T048:** mostrar no Início os interesses realmente salvos em `GET /me`.

**Entrega:** seleção opcional de categorias e até 10 termos distintos, com 1–100 caracteres após aparar espaços. Pular continua salvando listas vazias e publicidade `false`.

### Publicidade — T049–T055

1. **Backend, T049 → T050 → T051 → T052:** implementar regra, migração `0013`, Repository, serviço e `PATCH /me/marketing-preference` autenticado.
2. **Frontend, T053:** criar `MarketingConsentField.jsx` em paralelo ao backend, em arquivo próprio.
3. **T054, após T052 e T053:** montar a tela de preferências com valor salvo separado da edição e confirmação real ao salvar.
4. **T055, após T047, T048, T053 e T054:** integrar o controle ao cadastro, ao Início e à rota `/perfil/preferencias`.

**Entrega:** publicidade começa desligada, pode ser ativada/revogada e uma repetição antiga não desfaz a escolha mais recente. Essa entrega trata a preferência; envio de campanhas permanece fora do recorte.

### Foto opcional — T056–T066

1. **T056:** adicionar Sharp no backend conforme a versão fixada no plano e atualizar o lockfile.
2. **T057 e T058:** dividir migração `0014`/operações de avatar e processamento de imagens em arquivos distintos.
3. **T059 → T060:** implementar armazenamento privado e serviço de upload/dispensa com revisão e recibos.
4. **T061:** integrar as rotas de avatar; aguardar também T052, pois há arquivos compartilhados na montagem da API.
5. **T062:** uma pessoa do frontend pode preparar `photo.js` e `PhotoPicker.jsx` em paralelo ao núcleo do backend.
6. **T063 → T064:** conectar upload e dispensa às telas; T063 aguarda T061/T062 e T064 aguarda também T055.
7. **T065 → T066:** exibir a foto confirmada no Início e documentar bucket/manutenção.

**Entrega:** JPEG/PNG/WebP de até 5 MiB e 25 MP, convertido no servidor em avatar estático WebP de até 512×512. Upload exige autenticação, usa bytes e mantém o arquivo privado. Uma resposta atrasada não pode desfazer uma dispensa mais recente.

## 8. Preparar a entrega e configurar o ambiente — T067–T071

1. **T067 e T068, após T066:** dividir atualização documental e acabamento de acessibilidade/responsividade, entre 360–1440 pixels.
2. **T069:** compilar backend e frontend, corrigir erros dos arquivos afetados e registrar o resultado real em `docs/desenvolvimento.md`.
3. **T070:** a pessoa responsável pelo ambiente aplica as migrações na ordem numérica no projeto Supabase de desenvolvimento indicado pela equipe, configura Auth/SMTP, bucket privado e variáveis locais conforme o [quickstart](../specs/004-cadastro-preferencias/quickstart.md).
4. **T071:** revisar cobertura dos requisitos, atualizar tarefas e registrar o que foi implementado, configurado e o que segue pendente.

Desde o começo, a pessoa do ambiente pode levantar acesso ao projeto, credenciais, SMTP e URLs reais de Termos/Política. A aplicação das migrações permanece na etapa T070, após a compilação prevista no plano. Falta de acesso mantém a configuração pendente e permite continuar preparando o código.

Este roteiro mantém o fluxo de revisão e compilação definido no projeto. Compilar não comprova recebimento de e-mail, persistência real ou funcionamento completo do cadastro.

## Rotina de cada pessoa

1. Confirmar tarefa, predecessor integrado e arquivos sob sua responsabilidade.
2. Ler o trecho correspondente em `tasks.md` e nos contratos.
3. Implementar o recorte sem editar os arquivos de outra frente simultaneamente.
4. Revisar o diff e compilar usando os scripts existentes.
5. Entregar commit/PR com tarefas atendidas, arquivos alterados, resultado da compilação e dependências pendentes.
6. Marcar uma tarefa somente quando seu escopo estiver concluído. Criação do arquivo, sozinha, não comprova integração.

Na raiz, com Node.js 24.22.3 e npm disponíveis:

```powershell
npm ci
npm run build
npm run dev
```

Executar um comando por vez; iniciar o desenvolvimento depois da instalação/compilação. No Windows com Node portátil, usar os comandos equivalentes de [desenvolvimento](desenvolvimento.md). Para cadastro com cookies, usar `http://127.0.0.1:5173` e o proxy `/api` na mesma origem, conforme o quickstart.

## Mensagem pronta para orientar a equipe

> Pessoal, vamos fechar primeiro o cadastro mínimo. Precisamos compartilhar a base atualizada da branch `004-cadastro` antes de dividir o trabalho. A primeira tarefa é T028, com o estado e o acesso à API. Depois podemos dividir a tela de dados (T029), a tela de conclusão (T030) e confirmação/entrada (T031). Uma pessoa integra navegação e Início em T033. Em seguida fechamos a retomada em T037–T042. Com esse marco pronto, seguimos para interesses, publicidade e foto. Cada pessoa trabalha nos arquivos combinados e entrega um PR para `004-cadastro`, informando tarefas atendidas, compilação e pendências. O `tasks.md` continua sendo a referência de dependências.

Para distribuir cada tarefa, preencher:

```text
Responsável:
Tarefa(s):
Commit da base:
Dependências já integradas:
Arquivos sob responsabilidade:
Entrega esperada:
Pessoa que fará a integração:
Pendências de ambiente:
```
