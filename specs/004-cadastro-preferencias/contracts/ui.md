# Contrato de telas e navegação

**Referência:** [spec](../spec.md), [API](api.md), imagens [02](../../../docs/imagens/achei/02-cadastro.png) e [03](../../../docs/imagens/achei/03-preferencias.png). As imagens são referência histórica, não telas já implementadas.

## Rotas do frontend

| Rota | Responsabilidade |
| --- | --- |
| /entrar | Entrada mínima por e-mail/senha e link Criar conta; permite retomar a conta correta. |
| /cadastro | Passo 1: dados, foto opcional, senha e documentos. |
| /cadastro/preferencias | Passo 2: categorias, termos, publicidade e conclusão. |
| /cadastro/confirmar | Estado de confirmação dentro do cadastro, sem criar um terceiro passo de dados. |
| /inicio | Destino após conclusão; preservar página da base e disponibilizar acesso ao Perfil/exploração prevista, sem inventar catálogo funcional. |
| /perfil/preferencias | Consulta e alteração da publicidade da própria conta. |

Usar navegação de History API em módulo pequeno da aplicação, sem nova dependência de roteador. App mantém o provedor do rascunho montado entre os dois passos; popstate respeita os mesmos guardas. Deep links dependem do fallback de SPA no servidor de estáticos. Se essa abordagem crescer além dessas rotas, avaliar roteador em outra decisão.

Acesso direto ao passo 2 sem rascunho nem sessão de retomada retorna ao passo 1. Conta autenticada incompleta consulta /me/onboarding; conta concluída vai ao Início. Não usar apenas uma flag local para liberar conta.

## Componentes e dados

| Componente | Origem do estado | Ação e contrato |
| --- | --- | --- |
| Indicador Passo 1/2 e voltar | Estado do fluxo em memória | Voltar do passo 2 preserva dados. Sair do passo 1 com preenchimento pede manter/descartar. |
| Nome/e-mail/senha | Rascunho | Validar FR-002/003; sem requisição de criação no Continuar. |
| Visibilidade/indicador de senha | Rascunho, não persistido | Estado inicial oculto; mínimo em pontos Unicode e máximo com TextEncoder UTF-8. Não usar maxlength=72 como substituto da contagem de bytes. |
| Foto circular | File/ObjectURL em memória | Verificar formato/5 MiB/25 MP para antecipar erros; servidor revalida. Revogar ObjectURL ao substituir/remover/desmontar. |
| Documentos/aviso/regras | GET /registration-config | Abrir documentos sem perder rascunho; não substituir destinos ausentes por links fictícios. |
| Grade de categorias | GET /interest-categories | Cards com botão alternável e aria-pressed, sem seleção inicial. Erro independente não esconde Pular. |
| Etiquetas de termos | Rascunho | Enter ou ação Adicionar inclui texto válido; remover tem nome acessível. Digitação só vira termo depois de adicionar. |
| Publicidade | Rascunho false / valor atual autenticado | Controle com rótulo e texto da spec; não se altera por seleção de interesses. |
| Concluir/Pular | Comando único do ViewModel | Criar intenção/chave/segredo no primeiro envio e manter durante incerteza/retomada; POST /auth/registrations. Após rejeição definitiva sem criação, corrigir pode descartar o par e gerar outro. Pular força interesses vazios/false e mantém intenção de foto. |
| Confirmar e-mail | TokenHash em memória após limpar fragmento | Somente clique explícito chama POST /auth/email/verify; GET/scanner não consome token. |
| Entrar para retomar | E-mail/senha digitados novamente | POST /auth/sessions → GET /me/onboarding → POST /me/onboarding/complete. |
| Foto pendente | Sessão válida e onboarding | PUT binário ou DELETE explícito em /me/onboarding/avatar. |
| Publicidade posterior | GET /me + edição separada | PATCH /me/marketing-preference com nova chave por escolha explícita; exibir valor confirmado e rascunho distintamente. |

Rascunho de senha/File/termos não usa localStorage, sessionStorage, IndexedDB, URL ou telemetria. Cookie de sessão não guarda o rascunho. Após identidade vinculada, apagar senha da memória; para autenticar novamente, solicitar entrada explícita.

Se a confirmação ocorrer em outra aba da mesma origem, a aba original conserva o File enquanto aberta e pode retomar após ação **Continuar após confirmar**. Não há envio automático ao reconectar. Em outra aba sem File, dispositivo diferente ou após recarga, pedir **Selecionar foto novamente** ou **Continuar sem foto**.

## Estados do ViewModel

| Estado | Elementos visíveis e ações permitidas |
| --- | --- |
| editing_account | Campos editáveis, foto/visibilidade/documentos, Continuar e sair. |
| editing_preferences | Categorias/termos/publicidade, voltar, Concluir e Pular. |
| submitting | Criando conta…, aria-busy, Concluir/Pular/voltar desabilitados para não mudar snapshot em voo. |
| processing / unknown | Mensagem sem certeza falsa, Consultar situação; retry explícito com mesma intenção após retorno do serviço. Não criar chave nova automaticamente. |
| incomplete | Explicar pendências; confirmar/autenticar primeiro, depois corrigir/concluir perfil. |
| awaiting_email_confirmation | Confirme seu e-mail, reenvio com contagem do serviço e entrada por e-mail/senha quando necessário. |
| photo_pending | Foto não confirmada; tentar/reselecionar ou dispensar explicitamente. |
| awaiting_authentication | Entrar na mesma conta para continuar; não recriar identidade. |
| ready_to_complete | Concluindo cadastro…; chamar POST /me/onboarding/complete com chave idempotente para persistir a conclusão, sem navegar antes da confirmação. |
| completed | Redirecionar ao Início somente com retorno confirmado e sessão válida. |
| saving_marketing / marketing_error | Edição distinta do valor salvo, Salvar em andamento ou erro/nova tentativa. |

Estado de erro de categorias é independente do estado do formulário. Validação junto aos campos não zera dados válidos; primeira mensagem recebe anúncio/foco apropriado. Falhas não usam somente cor.

Resposta de foto atrasada ou superseded aplica somente o estado corrente retornado; não substitui uma dispensa mais recente por sua prévia antiga. Toda entrada por confirmação/login consulta onboarding e trata ready_to_complete antes de liberar Início.

## Fluxo completo

~~~mermaid
sequenceDiagram
    actor U as Consumidor
    participant F as React/ViewModel
    participant A as WebAPI
    participant I as Supabase Auth
    participant D as PostgreSQL
    U->>F: Preenche passo 1 e Continua
    Note over F: Apenas rascunho; sem criar identidade
    U->>F: Conclui ou Pula passo 2
    F->>A: POST registro + chave/prova
    A->>D: Intenção validada e claim curto
    A->>I: signUp com vínculo de intenção
    I->>D: INSERT identidade + trigger mínimo
    A->>D: Consultar vínculo e inicializar dados em transação
    A-->>F: Estado e todas as pendências
    U->>F: Confirma e-mail explicitamente
    F->>A: POST verify com TokenHash
    A->>I: verifyOtp
    A-->>F: Cookie opaco + estado autenticado
    F->>A: POST concluir onboarding
    opt Foto solicitada
      U->>F: Confirma foto ou dispensa
      F->>A: PUT bytes ou DELETE foto
    end
    A-->>F: completed com sessão válida
    F-->>U: Início
~~~

Diagrama representa o caminho favorável; chamadas Auth, dados e Storage podem falhar separadamente conforme api.md.

## Fidelidade e acessibilidade

Manter fundo claro, tipografia escura, ações principais quentes, verde-azulado no consentimento, cantos arredondados, foto circular e grade da referência. Reutilizar tokens/componentes existentes quando compatíveis; criar estilos locais para formulários sem redesenhar o canvas ou as demais telas.

Entre 360–1440 pixels: sem overflow horizontal, labels sempre visíveis, ordem de leitura igual à visual e mensagens textuais. Olho, voltar, adicionar/remover foto e remover termos têm nome acessível; teclado alcança todas as ações. Controle promocional começa desligado; o exemplo ligado da imagem não define o default.

Não mostrar **E-mail enviado**, **Foto salva**, **Preferências salvas** ou **Cadastro concluído** por temporizador ou simulação. Reenvio usa texto neutro de solicitação aceita, sem prometer entrega de e-mail.
