# Contrato HTTP: cadastro, sessão e preferências

**Versão:** v1. **Estado:** proposto para implementação; os endpoints abaixo ainda não existem.
Base da aplicação: /api/v1. Contratos relacionados: [telas](ui.md), [modelo](../data-model.md), [plano](../plan.md).

## Regras comuns

- JSON UTF-8, nomes camelCase, datas ISO 8601 UTC; sucesso { data: ... }; erro { error: { code, message, requestId, fields? } }. fields é lista de { field, code, message }, nunca ecoa senha ou token.
- Apenas foto usa corpo/resposta binários. JSON permanece limitado a 1 MiB; bytes de foto não entram no JSON.
- Todas as respostas de conta/sessão/cadastro, inclusive erros, usam Cache-Control: private, no-store e Vary: Cookie. Nenhum cache/CDN deve guardar resposta com Set-Cookie.
- Mutação web exige Origin exatamente permitido e X-App-Request: web. Falta/origem inválida retorna 403 ORIGIN_NOT_ALLOWED/REQUEST_HEADER_REQUIRED antes de processar dados. CORS não usa curinga com credenciais; OPTIONS só aceita origens/cabeçalhos permitidos.
- Navegador usa fetch com credentials: same-origin no proxy /api. Produção exige origem HTTPS única para web e API; separar origens é mudança de implantação a projetar, não default deste recorte.
- Sessão: cookie opaco hy_session, HttpOnly, Secure, SameSite=Lax, Path=/api/v1, sem Domain, Max-Age=604800. Secure pode ser false apenas em loopback HTTP de desenvolvimento. Tokens Supabase não aparecem no JSON ou no JavaScript do frontend.
- Rotas marcadas **sessão** exigem sessão validada no servidor e identidade confirmada. Não recebem userId como proprietário no corpo.
- Rotas existentes /health, /api/v1 e /api/v1/health permanecem compatíveis. O caminho Bearer preparado na base continua separado para clientes futuros; navegador deste recorte usa somente cookie. Requisições com identidades cookie/Bearer conflitantes são recusadas.

## Operações e idempotência

**Criação de cadastro** exige dois cabeçalhos gerados ao clicar pela primeira vez em Concluir/Pular:

- Idempotency-Key: UUID v4, identificador da intenção.
- Registration-Token: 32 bytes aleatórios em base64url, prova para recuperar somente status mínimo da intenção. Nunca na URL, storage persistente ou logs.

Ambos ficam apenas na memória do fluxo aberto. O corpo não secreto fica congelado durante processamento/resultado desconhecido. Mesmo id/token/snapshot não duplica conta. Mesmo id com snapshot diferente retorna 409 IDEMPOTENCY_CONFLICT. Token incorreto não revela a intenção.

Senha não participa de fingerprint nem receipt: é credencial transitória usada somente se o dispatch de signUp ainda for necessário. A interface não edita senha enquanto a conclusão é incerta. Após perda do rascunho sem vínculo, uma nova tentativa pede senha novamente; depois do vínculo, autenticar e retomar, sem novo signUp.

Após rejeição definitiva sem dispatch/criação, a ação de corrigir pode descartar a intenção e gerar novo par para o novo payload. Isso não é permitido em processing/unknown nem com identidade vinculada: esses casos preservam a intenção e usam reconciliação/retomada autorizada. Não prender um formulário definitivamente rejeitado à chave do payload anterior.

**Demais mutações de negócio** exigem Idempotency-Key UUID, escopado ao usuário e à operação. Foto usa digest dos bytes. Alteração promocional usa valor/versão do aviso. Retry deve repetir a mesma chave/payload; nova escolha explícita gera chave nova. Chave não equivale a autenticação.

Replay de operação antiga devolve receipt com replayed=true e o estado corrente. Nunca reaplica consentimento antigo ou associa foto de uma operação superada. Identificadores/chaves não devem ser incluídos em telemetria junto a dados pessoais.

## Objetos compartilhados

### OnboardingState

~~~json
{
  "status": "awaiting_email_confirmation",
  "pendingActions": ["confirm_email", "upload_photo"],
  "preferredNextAction": "confirm_email",
  "retryAfterSeconds": null
}
~~~

status: processing, unknown, not_created, incomplete, photo_pending, awaiting_email_confirmation, awaiting_authentication, ready_to_complete, completed.

pendingActions: correct_data, check_status, confirm_email, authenticate, complete_profile, upload_photo, skip_photo, finalize_onboarding. A lista pode conter várias ações; upload_photo e skip_photo são alternativas para resolver a mesma pendência. Quando tudo estiver resolvido mas faltar o commit de conclusão, retornar ready_to_complete/finalize_onboarding; completed exige conclusão persistida e lista vazia.

O status público não contém nome, e-mail, userId, foto, interesses nem preferência promocional. A mesma forma pode ser incluída em resposta autenticada junto aos dados permitidos.

### MarketingPreference

~~~json
{
  "allowed": false,
  "revision": 2,
  "changedAt": "2026-11-13T15:00:00Z",
  "noticeVersion": "marketing-email-v1"
}
~~~

### Receipt

{ mutationId: UUID, replayed: boolean, superseded: boolean }. Retorna junto ao valor corrente da operação, não um valor antigo apresentado como atual. superseded indica operação de foto ultrapassada por uma escolha mais recente; seu resultado não deve substituir o estado corrente.

## Endpoints públicos

### GET /registration-config

200: { data: { passwordPolicy, photoPolicy, marketingNotice, legal } }.

- passwordPolicy: { minCharacters: 8, maxUtf8Bytes: 72, strongMinCharacters: 12 }.
- photoPolicy: { mimeTypes: ["image/jpeg","image/png","image/webp"], maxBytes: 5242880, maxPixels: 25000000, staticAvatar: true }.
- marketingNotice: { version: "marketing-email-v1", text: texto da spec, defaultAllowed: false }.
- legal: { termsUrl, privacyUrl }, URLs reais HTTPS; HTTP permitido só para documentos locais no desenvolvimento.

503 REGISTRATION_NOT_CONFIGURED se faltar configuração de identidade/documentos necessária para liberar cadastro. Configuração parcial não pode apresentar cadastro funcional. Falha de categorias não deve impedir consultar o aviso/documentos.

### GET /interest-categories

200: { data: { categories: [{ id, label, order }] } }. Somente ativas, na ordem do modelo. Lista vazia é sucesso com categories=[]; falha é 503 CATEGORIES_UNAVAILABLE, sem categorias fictícias como se viessem do serviço.

### POST /auth/registrations

Público, com Idempotency-Key e Registration-Token. Corpo:

~~~json
{
  "name": "Marina Souza",
  "email": "marina@example.com",
  "password": "<preenchida pela pessoa, nunca persistida no aplicativo>",
  "mode": "complete",
  "photoRequested": true,
  "categoryIds": ["moda", "tenis"],
  "productInterests": ["Tênis de corrida"],
  "marketing": {
    "allowed": false,
    "noticeVersion": "marketing-email-v1"
  }
}
~~~

- name/e-mail/senha seguem FR-002/003; canonicalizar e-mail com trim/lowercase. Não alterar a senha.
- mode é complete ou skip. skip exige/salva categorias e termos vazios e allowed=false; payload contraditório é 422 SKIP_PAYLOAD_INVALID. photoRequested não é descartado.
- categoryIds sem duplicatas e somente ativas. productInterests segue FR-009. Campo marketing é sempre obrigatório, mesmo false; versão precisa ser reconhecida. Versão desatualizada retorna 409 NOTICE_VERSION_CHANGED antes de criação.
- photoRequested registra a intenção; bytes são enviados somente no PUT autenticado depois. A interface informa que a foto aguarda autenticação/confirmar e-mail.
- Não aceitar datas, origem do consentimento, userId, caminho de imagem ou URL da foto do cliente.

201: identidade realmente vinculada e dados salvos; { data: { registrationId, onboarding, emailDispatch: "accepted" | "failed" | "unknown" } }. Pode haver confirmação/foto pendente; 201 não significa acesso ao Início.

Se o provedor já retornar sessão válida com e-mail confirmado na criação, o backend pode estabelecer o mesmo cookie opaco de login; não devolve tokens. Ainda aplica ready_to_complete/POST de finalização quando faltar o commit final. Sem sessão comprovada, manter as pendências de confirmação/autenticação.

202: { data: { registrationId, onboarding, issues?: [{ stage, code, message, fields? }] } } quando há processamento, incerteza ou falha após criação. stage: identity, profile, photo ou email. Resposta parcial deve preservar todas as pendências.

Replay resolvido retorna 200 com o mesmo registrationId e estado corrente; replay ainda pendente retorna 202. Se identidade já está vinculada, esta rota não modifica perfil/foto/publicidade: orienta confirmação/autenticação e usa as rotas da própria conta.

422 VALIDATION_ERROR em rejeição confirmada antes da criação, com campos. 409 REGISTRATION_NOT_COMPLETED para retorno normal do provedor sem vínculo real: mensagem neutra **Não foi possível concluir com este e-mail. Entre na sua conta ou consulte as opções de recuperação de acesso.** Não apresentar confirmação falsa ou modificar conta existente. Recuperação completa não é implementada nesta feature.

503 antes de dispatch não cria identidade; se a requisição já foi despachada e o resultado é incerto, usar 202/unknown, não erro que implique ausência de conta.

### GET /auth/registrations/{registrationId}

Exige Registration-Token; não usa o token na URL. Retorna 200: { data: { registrationId, onboarding } }, somente status mínimo. GET não dispara signUp, reenvio, inicialização ou upload.

401 REGISTRATION_PROOF_INVALID para referência inexistente/token errado, com resposta indistinguível. 410 REGISTRATION_PROOF_EXPIRED após 24h, orientando entrar/confirmar e-mail para retomada autenticada. 503 se não for possível consultar; não concluir ausência de identidade.

Retry de criação é POST explícito com os mesmos identificador/segredo/snapshot, após consultar status. Chamada anterior em voo retorna processing; após lease vencido continua desconhecida até reconciliação. Não manter lock de banco aberto durante Auth.

### POST /auth/email/verify

Corpo { tokenHash: string }; tipo é fixado no servidor como email, sem next/redirect arbitrário.

200: { data: { authenticated: true, user: { id, email, emailConfirmed: true }, onboarding } } e Set-Cookie de sessão. Exige retorno válido de verifyOtp e vínculo da sessão à própria identidade. Se houver intenção pendente, usar apenas a que tem user_id igual ao usuário autenticado.

Token inválido, usado ou expirado: 422 CONFIRMATION_INVALID com opção de entrar/reenviar. Perda da resposta após consumo pode exigir login, sem repetir cadastro. TokenHash removido da URL pela tela e redigido em todos os logs; nunca cacheado/persistido.

Confirmar e-mail não aplica automaticamente snapshot por e-mail nem altera conta de outra sessão. A ação explícita informa que continuará com a conta confirmada.

### POST /auth/email/resend

Corpo { email: string }. Não aceita destinatário arbitrário diferente de um e-mail informado para acesso/cadastro; não recupera dados da conta. Usa resend de signup, não cria identidade e não aceita senha.

202: { data: { status: "request_accepted", retryAfterSeconds: 60 } }, com texto neutro **Se houver cadastro pendente para este e-mail, a solicitação de reenvio foi aceita.** A resposta confirma aceite pelo serviço, não entrega na caixa de entrada.

429 AUTH_RATE_LIMITED, Retry-After e retryAfterSeconds quando informado; piso local de 60s por e-mail normalizado/IP e respeito a prazo maior do fornecedor. 503 EMAIL_SERVICE_UNAVAILABLE quando o serviço falha; não anunciar envio.

## Sessão mínima para acesso/retomada

### POST /auth/sessions

Corpo { email, password }. Cliente Auth isolado usa signInWithPassword. 200: { data: { authenticated: true, user: { id, email, emailConfirmed }, onboarding } } e Set-Cookie opaco.

401 INVALID_CREDENTIALS com mensagem neutra; 403 EMAIL_CONFIRMATION_REQUIRED com ação de reenvio, sem conceder sessão; 429/503 para limite/indisponibilidade. Não retorna tokens Supabase. A tela mínima cobre e-mail/senha e retomada; login social/recuperação completa ficam fora do recorte.

### GET /auth/session

200 sem sessão: { data: { authenticated: false } }. Com sessão válida: mesma forma autenticada acima. Não retorna senha, tokens ou escolhas privadas sem autenticação. 503 se a identidade não puder ser validada por indisponibilidade, distinguindo isso de sair da conta.

Renovação serializada é interna. Não altera interesses, consentimento ou conclusão do onboarding por GET.

### DELETE /auth/session

200: { data: { authenticated: false } }, apaga cookie e revoga sessão local, mesmo se já expirada. Logout não altera preferências nem encerra outras sessões da conta.

## Endpoints da própria conta

Todos exigem **sessão**. Falha de autenticação: 401 UNAUTHENTICATED/INVALID_SESSION; identidade não confirmada não concede acesso. Indisponibilidade de verificação: 503.

### GET /me

200: { data: { id, name, email, photo: { present, url }, interests: { categoryIds, productInterests }, marketing, onboarding } }. url é /api/v1/me/avatar quando presente, não caminho do bucket ou URL permanente. Se perfil ainda não existe, 409 ONBOARDING_INCOMPLETE orienta consultar /me/onboarding.

### GET /me/onboarding

200: { data: { onboarding, savedData, pendingDraft } }.

savedData é null quando a transação do perfil não foi confirmada; caso contrário, contém nome/interesses/marketing atuais. pendingDraft é o snapshot não secreto vinculado à conta quando ainda precisa ser salvo, sem senha, capability ou e-mail editável. Após dados salvos, pendingDraft=null.

A consulta busca por identidade da sessão, nunca por e-mail digitado ou registrationId de terceiro. Em outro dispositivo, foto local não existe: pedir selecionar novamente ou dispensar, sem apagar interesses confirmados.

### POST /me/onboarding/complete

**Sessão**, Idempotency-Key. Corpo {} para aplicar snapshot pendente congelado/finalizar; se for necessário corrigir dados ainda não salvos, corpo { corrections: { name, categoryIds, productInterests, marketing: { allowed, noticeVersion } } }, sempre com todos os campos e nova chave.

Inicializa perfil/interesses/marketing numa transação. Correções só são permitidas enquanto data_state=pending; dados já salvos não são sobrescritos pela retomada. 409 ONBOARDING_ALREADY_SAVED para correção tardia; 422 com campos/categorias inválidas mantém identidade e dados anteriores.

Persistir receipt/hash do payload completo, inclusive nome/interesses e corpo vazio de finalização, junto aos efeitos. Repetição da chave com correções diferentes gera conflito; receipt confirmado é consultado antes de rejeitar etapa já salva.

200: { data: { onboarding, receipt } }. Pode retornar photo_pending. Grava conclusão somente com perfil/preferências confirmados, foto resolvida e sessão/identidade válidas. Repetição não gera evento promocional adicional.

### PUT /me/onboarding/avatar

**Sessão**, Idempotency-Key, Content-Type image/jpeg, image/png ou image/webp, corpo binário File. Máximo 5242880 bytes e 25000000 pixels, sem Content-Encoding comprimido. Autenticar/verificar origem antes de ler bytes.

Exige perfil inicializado e onboarding ainda aberto. Verifica formato real e decodifica/reencodifica, gera caminho no servidor, salva em bucket privado e associa somente após confirmação. 200: { data: { photo: { present: true, url: "/api/v1/me/avatar" }, onboarding, receipt } }.

Claim da foto incrementa revisão e registra a última operação sob lock. Após o upload, o commit deve revalidar revisão, operação vigente e onboarding aberto. Se outra operação/dispensa venceu, não associar a foto atrasada: 200 com foto/estado correntes e receipt.superseded=true. O campo present pode ser false nesse retorno; a interface não assume sucesso da foto pelo HTTP 200 isolado.

413 PHOTO_TOO_LARGE, 415 PHOTO_FORMAT_UNSUPPORTED/CONTENT_ENCODING_UNSUPPORTED, 422 PHOTO_INVALID/PHOTO_DIMENSIONS_EXCEEDED, 409 PROFILE_PENDING/ONBOARDING_ALREADY_COMPLETED ou conflito de operação. Falha parcial: 503 PHOTO_SAVE_FAILED com possibilidade de retomar a mesma operação ou dispensar; não confirmar foto com upload apenas presumido.

Replay de operação antiga não desfaz dispensa/operação mais recente; retorna foto/estado correntes e receipt da operação reconhecida.

### DELETE /me/onboarding/avatar

**Sessão**, Idempotency-Key, sem corpo. Escolha explícita **Continuar sem foto** ou remoção antes de finalizar. 200: { data: { photo: { present: false, url: null }, onboarding, receipt } }.

Marca foto dispensada e finaliza se os demais requisitos estiverem atendidos. Não cria conta, não altera interesses/publicidade e não oferece edição geral de foto após onboarding concluído. 409 ONBOARDING_ALREADY_COMPLETED para nova alteração tardia; replay previamente confirmado pode retornar estado atual.

Registrar operation_kind=waive, fingerprint sem bytes e revisão atualizada na mesma transação. O espaço de chaves é compartilhado com PUT: mesma chave para upload e dispensa gera 409. Um upload anterior que termine depois não pode desfazer a dispensa ou reabrir onboarding.

### GET /me/avatar

**Sessão**. 200 image/webp com corpo binário e Cache-Control: private, no-store. Download autorizado apenas do caminho confirmado do próprio perfil; 404 PHOTO_NOT_FOUND se ausente, 503 se Storage falhar. Sem parâmetros userId/path e sem redirecionamento público para objeto privado.

### PATCH /me/marketing-preference

**Sessão**, Idempotency-Key. Corpo { allowed: boolean, noticeVersion: "marketing-email-v1" }.

200: { data: { marketing: MarketingPreference, receipt } }. Serviço grava origem account_preferences e momento do banco; interface só confirma após resposta. Versão inválida: 409 NOTICE_VERSION_CHANGED; mesma chave/outro corpo: 409 IDEMPOTENCY_CONFLICT.

Replay de ativação anterior depois de revogação não reativa publicidade. Resposta retorna allowed/revision/changedAt atuais. Não recebe/edita interesses, desejos ou alertas nesta operação.

## Erros e operação

| HTTP | Condição | Conduta da interface |
| --- | --- | --- |
| 400 | JSON inválido, cabeçalhos de formato inválido | Orientar correção; não anunciar salvamento. |
| 401/403 | Sessão/prova inválida ou origem negada | Pedir autenticação quando aplicável, sem expor terceiros. |
| 409 | Conteúdo conflitante, versão de aviso ou etapa incompatível | Reconsultar estado/configuração; nova ação explícita quando necessário. |
| 413/415/422 | Tamanho/formato/validação | Indicar campo/foto e preservar dados válidos. |
| 429 | Limite de envio/acesso | Exibir espera de Retry-After, sem retry automático. |
| 503 | Serviço não configurado/indisponível | Explicar falha e oferecer tentar novamente. |

Antes de Auth: limite local de 10 tentativas de criação e 10 de login por IP/15min, e 1 reenvio por e-mail/IP/60s; respeitar limites mais restritos do Supabase. MVP usa processo único para limites em memória; não confiar em X-Forwarded-For sem proxy explicitamente configurado. Múltiplas instâncias exigem rate limit compartilhado antes de publicação escalada.

Logs contêm somente requestId, código, etapa e duração; redigir corpo, e-mail, cookies, Idempotency-Key, Registration-Token, tokenHash e credenciais. Cada resposta parcial preserva certeza/incerteza em OnboardingState. Tempo de resposta excedido depois do dispatch nunca significa conta não criada.
