---
description: "Tarefas de implementação do cadastro e preferências do consumidor"
---

# Tasks: Cadastro e preferências do consumidor

**Input**: documentos de specs/004-cadastro-preferencias/.
**Created**: 2026-11-13.
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [API](contracts/api.md), [telas](contracts/ui.md) e [quickstart.md](quickstart.md).
**Governança**: [constituição 1.0.0](../../.specify/memory/constitution.md).
**Estado**: 70/71 tarefas concluídas na implementação de código e documentação em 2026-11-14; T070 permanece pendente de configuração externa. A classificação do produto permanece Semi-Essencial.
**Tests**: não gerar testes automatizados/manuais obrigatórios, TDD ou scripts de testes. “Independent Test” abaixo significa critério de aceite esperado; não atividade executada. Compilação não comprova cenários funcionais.

**Organization**: histórias em prioridade US1 (P1), US5 (P1), US2 (P2), US3 (P2), US4 (P3), preservando os números da spec. A base compartilhada contém tabelas de interesses/publicidade porque o cadastro mínimo precisa salvar conjuntos vazios e escolha false atomicamente.

## Format: ID, paralelismo e história

Cada tarefa usa checkbox não marcado, ID sequencial, marcador [P] quando há independência de arquivos, etiqueta [USn] somente nas fases de histórias e caminhos exatos relativos à raiz. Dependências diretas aparecem ao final de cada linha; as barreiras de fases descritas abaixo também se aplicam. [P] não autoriza ignorar dependências incompletas nem editar arquivos compartilhados simultaneamente.

Os trechos entre aspas nas tarefas de dados reproduzem literalmente as restrições do modelo; devem orientar SQL, DTOs e regras, sem delegar esses limites à implementação. Não alterar as tecnologias ratificadas.

## Path Conventions

- Backend existente: backend/src/, backend/.env.example e backend/supabase/migrations/.
- Frontend existente: frontend/src/, mantendo JavaScript/JSX e MVVM.
- Migrações são incrementais; criar nova migração para evoluir funções já aplicadas. Autoria pode ser paralela em arquivos distintos, mas aplicação é sempre em ordem numérica.
- Própria feature: specs/004-cadastro-preferencias/. Caminhos de código ainda não existentes são destinos de implementação.
- Trabalhar em branch própria na implementação, preservando alterações já presentes no workspace. Esta geração não cria branch, aplica SQL, configura serviços ou publica conteúdo.

## Phase 1: Setup — preparação da base

**Goal**: Reutilizar os workspaces existentes e preparar configuração/documentação sem trocar tecnologias.

- [X] T001 Preparar a ordem de migrações e o procedimento de aplicação no projeto Supabase de desenvolvimento em backend/supabase/README.md; registrar esquema privado, scripts incrementais e dependências de Auth/SMTP/documentos sem criar serviços externos nesta tarefa.
- [X] T002 [P] Ampliar backend/.env.example e backend/src/config/env.ts com SUPABASE_PUBLISHABLE_KEY, APP_SECURITY_KEY de 32 bytes em base64, APP_ORIGIN, TERMS_URL, PRIVACY_URL, AUTH_CONFIRMATION_TTL_SECONDS=3600 e AUTH_RESEND_MIN_INTERVAL_SECONDS=60; validar pares/URLs/origens, manter segredos no servidor e readiness 503 do cadastro sem impedir a saúde da base.
- [X] T003 [P] Alinhar frontend/.env.example e frontend/vite.config.js ao proxy /api da origem http://127.0.0.1:5173 para http://127.0.0.1:3000, preservar JavaScript/JSX e o contrato atual de saúde e não adicionar chaves Supabase ao frontend.

**Checkpoint**: configuração e procedimento definidos, preservando a base existente.

---

## Phase 2: Foundational — pré-requisitos compartilhados

**Goal**: Preparar persistência, contratos internos, sessão e transporte antes das histórias. Todas as tarefas desta fase bloqueiam as histórias.

**Barreira**: concluir T001–T019 antes de iniciar qualquer história. Nenhuma opção de negócio pode ser apresentada como salva pela conclusão desta fase.

- [X] T004 Criar backend/supabase/migrations/0001_consumer_profiles.sql com app_private não exposto e consumer_profiles; preservar literalmente user_id: “uuid PK/FK auth.users.id ON DELETE CASCADE”; display_name: “text aparado, 2–100 caracteres, não exige sobrenome”; photo_object_path: “text nullable, caminho interno gerado pelo servidor; nunca URL fornecida pelo cliente”; onboarding_completed_at: “timestamptz nullable; escrito somente após dados e foto resolvidos, identidade confirmada e sessão válida”; created_at / updated_at: “timestamptz do banco”. Aplicar a convenção “UUIDs, timestamptz em UTC, booleanos não nulos e limites por caracteres Unicode, exceto senha medida também em bytes. Banco gera datas; respostas serializam ISO 8601.”; habilitar RLS e revogar DML privado de anon/authenticated. (Dep.: T001.)
- [X] T005 [P] Criar backend/supabase/migrations/0002_consumer_interests.sql com interest_categories (id: “text PK estável”; label: “text não vazio”; sort_order: “smallint único positivo”; active: “boolean default true”), consumer_category_interests (“user_id uuid FK consumer_profiles, category_id text FK interest_categories; PK composta. Inserção/atualização somente pela transação de inicialização, que recusa categoria inativa. Não há seleção obrigatória.”) e consumer_product_interests (user_id: “uuid FK consumer_profiles ON DELETE CASCADE”; position: “smallint entre 1 e 10”; term: “text aparado de 1–100 caracteres”; normalized_term: “text gerado por lower(app_trim(term)), usando a mesma regra de espaços externos da interface”); preservar “PK(user_id, position) limita a dez posições; UNIQUE(user_id, normalized_term) elimina duplicatas.” e app_trim equivalente a String.trim Unicode. Semear as nove categorias/IDs de data-model.md, sem remover acentos ou criar Desejos/alertas; RLS e privilégios somente do servidor. (Dep.: T004.)
- [X] T006 [P] Criar backend/supabase/migrations/0003_marketing_preferences.sql com marketing_preferences (“user_id uuid PK/FK consumer_profiles, allowed boolean NOT NULL DEFAULT false, revision bigint positivo, changed_at timestamptz, last_event_id uuid. A primeira gravação tem revisão 1, inclusive quando allowed=false. A linha é a projeção da última escolha confirmada, nunca o estado em edição.”) e marketing_consent_events (id: “uuid PK”; user_id: “uuid FK consumer_profiles”; allowed: “boolean não nulo”; recorded_at: “timestamptz do banco”; source: “registration / onboarding_resume / account_preferences”; notice_version: “text validado na configuração do servidor”; mutation_id: “uuid da operação”; payload_hash: “sha256 do payload canônico não secreto”); preservar “UNIQUE(user_id, mutation_id). Histórico append-only.” e aviso marketing-email-v1, sem datas/origem arbitrárias do cliente; RLS e DML só para o servidor. (Dep.: T004.)
- [X] T007 [P] Criar backend/supabase/migrations/0004_registration_intents.sql com app_private.registration_intents; campos/restrições literais: id: “uuid PK, também Idempotency-Key da criação”; request_token_hash: “SHA-256 do Registration-Token de 32 bytes gerado no navegador”; binding_proof_hash: “SHA-256 da prova HMAC gerada pelo servidor para o trigger”; normalized_email: “text aparado e convertido para minúsculas, até 254 caracteres”; request_hash: “SHA-256 do snapshot canônico; exclui completamente senha e foto binária”; snapshot: “dados validados de nome, categorias, termos, marketing/versão e photoRequested; imutável enquanto processa”; user_id: “uuid nullable FK auth.users.id, UNIQUE quando preenchido”; identity_state: “not_started / in_flight / unknown / bound / not_created”; data_state: “pending / saved”; photo_state: “not_requested / awaiting_upload / saved / waived”; photo_revision / latest_photo_mutation_id: “bigint iniciado em 0 / uuid nullable; identifica a última intenção explícita de salvar ou dispensar foto”; email_dispatch_state: “not_requested / accepted / failed / unknown”; lease_owner / lease_expires_at: “UUID da execução e prazo da chamada de criação”; created_at / updated_at: “timestamptz”; capability_expires_at: “created_at + 24 horas”. Não guardar senha, hash/fingerprint de senha ou token bruto; snapshot congelado, prova HMAC de contexto próprio e capacidade expirada não encerram a retomada autenticada da conta vinculada. (Dep.: T004.)
- [X] T008 [P] Criar backend/supabase/migrations/0005_web_sessions.sql com app_private.web_sessions; campos/restrições literais: session_hash: “SHA-256 do identificador opaco do cookie; PK”; user_id: “uuid FK auth.users.id”; encrypted_tokens: “bytea: access/refresh tokens com AES-256-GCM, nonce aleatório e tag”; key_version: “text para identificação da chave”; access_expires_at: “timestamptz do provedor”; expires_at: “limite local de 7 dias após login, sem prorrogação silenciosa”; revision: “bigint para compare-and-swap”; refresh_lease_owner / refresh_lease_expires_at: “controle de uma renovação por sessão”; created_at / updated_at / revoked_at: “timestamptz, revogação nullable”. Nenhuma exposição pela Data API ou concessão direta a anon/authenticated. (Dep.: T004.)
- [X] T009 [P] Criar backend/supabase/migrations/0006_onboarding_operations.sql com app_private.onboarding_operations, preservando “user_id uuid, mutation_id uuid, operation initialize/correct/finalize, request_hash do payload canônico completo, applied_at timestamptz. PK(user_id, mutation_id). Inclui nome, categorias, termos e marketing nas correções, não apenas o hash do evento promocional. Corpo vazio de finalização também tem fingerprint definido. O bootstrap usa o id da intenção como chave inicial; retomadas usam a chave da nova ação autenticada.” e “Receipt é gravado na mesma transação dos efeitos. Mesma chave/payload retorna estado corrente sem reaplicar; mesmo id com payload diferente retorna 409, inclusive se somente nome/interesses mudaram. Consulta de receipt precede a rejeição de etapa já concluída.”. (Dep.: T004.)
- [X] T010 Definir backend/src/domain/registration/registration.ts, backend/src/domain/registration/validation.ts e backend/src/domain/registration/onboarding-state.ts com DTOs e validação: nome aparado 2–100 caracteres; e-mail canônico até 254; senha mínimo 8 pontos Unicode/máximo 72 bytes UTF-8, sem transformação; snapshot sem credenciais, mode complete/skip, arrays opcionais e marketing boolean obrigatório. Representar status processing/unknown/not_created/incomplete/photo_pending/awaiting_email_confirmation/awaiting_authentication/ready_to_complete/completed e todas as pendingActions do contrato, sem concluir por GET. (Dep.: T005, T006, T007, T008, T009.)
- [X] T011 [P] Definir portas efetivamente usadas em backend/src/application/ports/auth-gateway.ts, backend/src/application/ports/registration-repository.ts, backend/src/application/ports/consumer-repository.ts e backend/src/application/ports/session-store.ts, usando os DTOs de T010 e distinguindo prova de intenção, sujeito autenticado, bootstrap inicial e credencial transitória; não criar CRUD genérico. (Dep.: T010.)
- [X] T012 [P] Ampliar frontend/src/shared/services/http-client.js para GET/POST/PATCH/DELETE JSON com credentials same-origin, X-App-Request: web em mutações, cabeçalhos idempotentes, AbortSignal e erros estruturados com fields/requestId/retryAfter; preservar getJson da saúde e não ecoar senha/token ou interpretar ausência de resposta como ausência de conta. (Dep.: T010.)
- [X] T013 [P] Criar frontend/src/features/registration/models/registration.js, frontend/src/features/session/models/session.js, frontend/src/shared/components/FormField.jsx, frontend/src/shared/components/FormFeedback.jsx e frontend/src/styles/registration.css com os estados/políticas dos contratos, labels/erros/foco acessíveis e base visual das telas 02/03 entre 360–1440 pixels, sem persistir rascunho. (Dep.: T010.)
- [X] T014 [P] Implementar backend/src/infrastructure/supabase/auth-gateway.ts com cliente Auth publicável por requisição, persistSession/autoRefreshToken/detectSessionInUrl desativados e operações signUp/verifyOtp/resend/signInWithPassword/getUser/refreshSession/signOut local; preservar backend/src/infrastructure/supabase/client.ts como cliente privilegiado sem sessão de usuário. (Dep.: T011, T002.)
- [X] T015 [P] Implementar backend/src/infrastructure/sessions/session-codec.ts e backend/src/infrastructure/sessions/session-cookie.ts usando Node crypto, AES-256-GCM com nonce/tag e chaves derivadas por contexto de APP_SECURITY_KEY; cookie hy_session com 32 bytes aleatórios base64url, só hash no banco, HttpOnly/Secure/SameSite=Lax, Path=/api/v1, sem Domain, Max-Age=604800 e exceção Secure=false apenas em loopback HTTP. (Dep.: T011, T002.)
- [X] T016 Implementar backend/supabase/migrations/0007_web_session_rpcs.sql e backend/src/infrastructure/supabase/session-store.ts para criar/consultar/revogar sessão e renovar via claim commitado de 30s, timeout Auth de 10s e CAS por revision/lease_owner; RPCs SECURITY INVOKER executáveis só por service_role, sem lock aberto durante rede e sem gravação por líder com lease perdido. (Dep.: T008, T011, T015.)
- [X] T017 Implementar backend/src/application/services/web-session.service.ts e ampliar backend/src/presentation/http/middlewares/require-auth.ts para sessão opaca, renovação serializada e validação getUser/identidade confirmada; distinguir indisponibilidade de sessão inválida, exigir novo login após rotação incerta sem retry infinito e recusar identidades cookie/Bearer conflitantes, preservando o caminho Bearer existente. (Dep.: T014, T015, T016.)
- [X] T018 Implementar backend/src/presentation/http/middlewares/web-request-guard.ts, backend/src/presentation/http/middlewares/auth-rate-limit.ts e ampliar backend/src/presentation/http/errors/api-error.ts, backend/src/presentation/http/middlewares/error-handler.ts e backend/src/app.ts: origem exata+cabeçalho não simples, CORS sem curinga credenciado, JSON 1 MiB, erros de campo, respostas privadas no-store/Vary Cookie e logs só requestId/código/etapa/duração; limitar criação/login a 10 por IP/15min e reenvio a 1 por e-mail/IP/60s, sem confiar em proxy não configurado. (Dep.: T002, T017.)
- [X] T019 Criar frontend/src/features/session/repositories/session.repository.js e frontend/src/features/session/viewmodels/useSessionViewModel.js para autenticar/consultar/sair pela API e manter sessão somente como estado retornado do backend; não ler cookie HttpOnly ou guardar tokens/senha e preservar 503 como indisponibilidade, usando o cliente de T012. (Dep.: T012, T013.)

**Checkpoint**: fundação disponível para implementar as histórias, sem alegação de cadastro funcional.

---

## Phase 3: US1 — Criar conta com dados obrigatórios (P1)

**Goal**: Entregar o caminho válido de cadastro sem foto/interesses e com publicidade desativada, incluindo confirmação e entrada mínima.

**Independent Test — critério de aceite, sem execução obrigatória**: Nome/e-mail/senha → Continuar → Pular ou Concluir vazio → confirmar e-mail → finalização persistida: uma conta, valores corretos, publicidade false e Início somente com sessão válida. Campos inválidos e conta existente não provocam sucesso falso.

### Implementation

- [X] T020 [US1] Criar backend/supabase/migrations/0008_auth_registration_binding.sql com trigger mínimo AFTER INSERT auth.users: validar intenção/prazo/prova HMAC por digest/e-mail canônico, bloquear linha e vincular NEW.id uma vez; SECURITY DEFINER, search_path vazio, nomes qualificados, sem perfil, Storage ou rede no trigger e sem usar metadata mutável como autorização posterior. (Dep.: T004, T007, T014.)
- [X] T021 [US1] Criar backend/supabase/migrations/0009_initialize_consumer_onboarding.sql com initialize_consumer_onboarding: transação única de perfil/interesses/preferência/evento inicial inclusive false, validação de categorias/limites do modelo, vínculo de bootstrap recém-criado ou sujeito autenticado igual ao dono, receipt completo e data_state=saved no mesmo commit; rollback integral dos dados de negócio em falha e não sobrescrever perfil já salvo. No caminho válido de POST autenticado sem foto pendente, persistir onboarding_completed_at antes de retornar completed; GET e bootstrap sem sessão não finalizam. (Dep.: T005, T006, T007, T009, T020.)
- [X] T022 [US1] Criar backend/supabase/migrations/0010_registration_intent_rpcs.sql e backend/src/infrastructure/supabase/registration.repository.ts para criar/obter intenção, conferir hash/segredo/snapshot, claim curto antes de Auth e consultar vínculo por intenção/sujeito; restringir RPCs ao servidor, retornar conflito em payload alterado e não expor dados privados por capability. (Dep.: T007, T009, T011, T020.)
- [X] T023 [US1] Implementar backend/src/application/services/registration.service.ts com validação final, mode skip forçando interesses vazios/allowed=false, prova de binding, signUp transitório, consulta do vínculo real e bootstrap T021; retorno 201/200/202 conforme contrato, 409 neutro sem vínculo real, estado unknown após timeout e proibição de novo signUp após bound; nenhuma confirmação pelo data.user ofuscado. (Dep.: T010, T014, T021, T022.)
- [X] T024 [P] [US1] Implementar backend/src/infrastructure/supabase/registration-options.repository.ts, backend/src/application/services/registration-config.service.ts e backend/src/presentation/http/controllers/registration-options.controller.ts para GET /registration-config e GET /interest-categories, com aviso false/documentos reais, limites da spec, categorias ativas ordenadas, [] real e falhas 503 distintas sem dados fictícios. (Dep.: T002, T005, T010, T011.)
- [X] T025 [US1] Implementar backend/src/application/services/identity.service.ts e backend/src/presentation/http/controllers/identity.controller.ts para POST /auth/email/verify e /auth/email/resend: verifyOtp type=email, sessão só após identidade válida, vínculo por user.id, token não persistido e reenvio neutro aceito apenas após retorno do serviço, com piso de 60s/Retry-After e erros de confirmação/envio. (Dep.: T014, T017, T022.)
- [X] T026 [US1] Implementar backend/src/application/services/session.service.ts e backend/src/presentation/http/controllers/session.controller.ts para POST /auth/sessions, GET /auth/session e DELETE /auth/session: mensagens neutras, confirmação necessária sem conceder acesso, cookie opaco e revogação local sem encerrar outros dispositivos ou alterar preferências. (Dep.: T017, T022, T025.)
- [X] T027 [US1] Implementar backend/src/infrastructure/supabase/consumer.repository.ts, backend/src/application/services/consumer.service.ts e backend/src/presentation/http/controllers/consumer.controller.ts para GET /me, GET /me/onboarding e POST /me/onboarding/complete no caminho sem correções: retornar valores realmente persistidos da própria conta, foto URL privada, snapshot pendente sem senha e concluir somente após commit de onboarding_completed_at com sessão válida. (Dep.: T011, T017, T021, T022.)
- [X] T028 [US1] Criar frontend/src/features/registration/repositories/registration.repository.js, frontend/src/features/registration/viewmodels/useRegistrationViewModel.js e frontend/src/features/registration/viewmodels/RegistrationProvider.jsx para configuração, rascunho em memória, navegação dos dois passos e comando único Concluir/Pular; nenhuma criação em Continuar, nenhuma persistência de senha/File/termos e descarte da senha após vínculo. (Dep.: T012, T013, T019, T023, T024.)
- [X] T029 [P] [US1] Implementar frontend/src/features/registration/views/AccountStepView.jsx com Passo 1 de 2, nome/e-mail/senha, olho/indicador textual conforme limites Unicode/bytes, links reais em contexto que preserve formulário, voltar com manter/descartar e mensagens por campo; preservar composição da imagem 02, deixando a interação de foto para US4. (Dep.: T028.)
- [X] T030 [P] [US1] Implementar frontend/src/features/registration/views/PreferencesStepView.jsx com estrutura Passo 2 de 2, título, voltar, Concluir e Pular, caminho mínimo sem interesses/sem publicidade e explicação do efeito de Pular; manter espaço/linguagem do design para os controles funcionais de US2/US3, sem botões simulando opções ainda não implementadas. (Dep.: T028.)
- [X] T031 [US1] Implementar frontend/src/features/registration/views/ConfirmationView.jsx, frontend/src/features/registration/viewmodels/useIdentityViewModel.js e frontend/src/features/session/views/LoginView.jsx: ler/remover fragmento TokenHash e verificar somente por clique explícito, respeitar reenvio/expiração, oferecer entrada mínima com senha digitada novamente e navegar após retorno real, sem consumir token por GET. (Dep.: T019, T025, T026, T028.)
- [X] T032 [US1] Montar controllers/serviços existentes em backend/src/presentation/http/controllers/registration.controller.ts, backend/src/presentation/http/routes/registration.routes.ts, backend/src/presentation/http/routes/auth.routes.ts, backend/src/presentation/http/routes/me.routes.ts, backend/src/presentation/http/routes/index.ts e backend/src/app.ts, preservando saúde e aplicando origem/limites/sessão nas rotas corretas; compor dependências sem regras de negócio em controller. (Dep.: T023, T024, T025, T026, T027.)
- [X] T033 [US1] Integrar frontend/src/app/navigation.js, frontend/src/app/App.jsx, frontend/src/features/home/viewmodels/useHomeViewModel.js e frontend/src/features/home/views/HomeView.jsx com /entrar, /cadastro, /cadastro/preferencias, /cadastro/confirmar e /inicio; manter provedor entre passos, guardas por sessão/estado real, POST final antes do Início e lista real de categorias/dados da conta, sem alegar catálogo/recomendação funcional. (Dep.: T019, T027, T029, T030, T031, T032.)

**Checkpoint**: caminho mínimo válido implementável; US5 completa a recuperação necessária ao marco MVP.

---

## Phase 4: US5 — Retomar falhas com confirmação real (P1)

**Goal**: Completar reconciliação, correções autorizadas e estados de falha sem duplicar conta ou escolhas.

**Independent Test — critério de aceite, sem execução obrigatória**: Uma intenção em processing/unknown/incomplete é consultada/retomada sem reset indevido; somente conta autorizada lê dados; resultado desconhecido não vira ausência de conta e Início exige finalização persistida. Não há envio automático ao reconectar.

### Implementation

- [X] T034 [P] [US5] Criar backend/supabase/migrations/0011_resume_consumer_onboarding.sql ampliando a transação de T021 para corrections completas somente em data_state=pending e finalização por POST: fingerprint de nome/categorias/termos/marketing, receipt consultado antes de rejeitar etapa salva e nenhuma reaplicação de publicidade; ready_to_complete/finalize_onboarding até onboarding_completed_at não nulo, sem mutações de negócio por GET. (Dep.: T021, T027, T033.)
- [X] T035 [US5] Ampliar backend/src/infrastructure/supabase/registration.repository.ts e backend/supabase/migrations/0012_registration_resume_queries.sql (nova migração, sem reescrever a já aplicada T022) para consulta mínima por Registration-Token com 401 indistinguível/410 após 24h, vínculo canônico, lease e status com todas as pendências; ausência de vínculo após timeout permanece unknown e capability não devolve dados da conta. (Dep.: T022, T034.)
- [X] T036 [US5] Implementar backend/src/application/services/onboarding.service.ts e backend/src/presentation/http/controllers/onboarding.controller.ts para consultar status, reconciliar repetição explícita da mesma intenção, corrigir/concluir snapshot autenticado e respeitar sujeito do vínculo; reset de intenção só após rejeição definitiva sem criação/em voo, nunca após processing/unknown/bound. (Dep.: T023, T034, T035.)
- [X] T037 [P] [US5] Criar frontend/src/features/registration/models/registration-attempt.js com UUID/Registration-Token de 32 bytes somente em memória, snapshot congelado, chave preservada em processing/unknown/bound e reset permitido apenas ao corrigir rejeição definitiva; chave não autentica perfil e nenhuma senha entra em fingerprint. (Dep.: T028, T033.)
- [X] T038 [US5] Criar frontend/src/features/registration/viewmodels/useOnboardingViewModel.js e ampliar frontend/src/features/registration/repositories/registration.repository.js com GET status, GET /me/onboarding e POST complete/corrections, mantendo chave/payload por intenção e valores confirmados separados do rascunho; tratar 401/409/410/422/429/503 sem confirmação fictícia. (Dep.: T035, T036, T037.)
- [X] T039 [US5] Implementar frontend/src/features/registration/views/ResumeRegistrationView.jsx e estados de erro em frontend/src/features/registration/views/ConfirmationView.jsx para incomplete/unknown/offline, consulta/nova tentativa explícita e correção de campos; preservar dados válidos, exigir autenticação antes de dados privados e não reenviar ao reconectar ou recriar conta vinculada. (Dep.: T038.)
- [X] T040 [US5] Integrar GET /auth/registrations/{registrationId}, GET /me/onboarding e POST /me/onboarding/complete com corrections em backend/src/presentation/http/routes/auth.routes.ts, backend/src/presentation/http/routes/me.routes.ts e backend/src/app.ts, delegando aos serviços de US5 e aplicando DTOs/erros/status mínimos do contrato sem transferir regras para rotas. (Dep.: T036.)
- [X] T041 [US5] Ampliar frontend/src/features/registration/viewmodels/useRegistrationViewModel.js, frontend/src/app/navigation.js e frontend/src/app/App.jsx para todos os pendingActions, ready_to_complete → POST idempotente, bloqueio de comandos em voo e retomada após login/confirmação/outro dispositivo; liberar Início somente com completed persistido e sessão válida. (Dep.: T037, T038, T039, T040.)
- [X] T042 [US5] Documentar e preparar manutenção de estado em backend/supabase/maintenance/cleanup-registration-state.sql e backend/supabase/README.md: limpar snapshots somente após dados salvos e intenções expiradas sem vínculo, manter snapshot pendente de identidade vinculada, preservar receipts necessários e não apagar contas Auth; não executar manutenção automaticamente durante cadastro. (Dep.: T034, T035, T041.)

**Checkpoint**: marco MVP US1 + US5, sem foto/interesses e sem publicidade, com retomada segura.

---

## Phase 5: US2 — Definir interesses ou pular (P2)

**Goal**: Acrescentar seleção de categorias e termos ao fluxo pronto, preservando a criação sem personalização.

**Independent Test — critério de aceite, sem execução obrigatória**: Selecionar/desmarcar categorias, adicionar/remover termos e concluir resulta nos valores consultáveis em outra sessão; Pular zera interesses/publicidade e falha de categorias não bloqueia a conta. Termos não viram Desejos/alertas.

### Implementation

- [X] T043 [P] [US2] Criar frontend/src/features/registration/models/interests.js com até 10 termos de 1–100 caracteres após trim Unicode, sem duplicatas por caixa/espaços externos, ordem preservada e categorias por IDs estáveis; a comparação definitiva é do banco e não remove acentos. (Dep.: T042.)
- [X] T044 [P] [US2] Implementar frontend/src/features/registration/views/CategoryGrid.jsx com as nove categorias do GET, botões aria-pressed, múltipla seleção sem default, grade adaptável e estados independente de vazio/erro/nova tentativa, sem esconder Pular. (Dep.: T042.)
- [X] T045 [P] [US2] Implementar frontend/src/features/registration/views/ProductInterestInput.jsx com inclusão explícita por Enter/Adicionar, etiquetas removíveis e identificação acessível de remoção/limites, usando validação de T043 e sem transformar digitação parcial em termo salvo. (Dep.: T043.)
- [X] T046 [US2] Criar frontend/src/features/registration/viewmodels/useInterestsViewModel.js e ampliar frontend/src/features/registration/repositories/registration.repository.js para carregar categorias e manter seleções/termos no rascunho, respeitar snapshot congelado de US5 e enviar as escolhas finais no cadastro/correção autorizada. (Dep.: T043, T044, T045.)
- [X] T047 [US2] Integrar frontend/src/features/registration/views/PreferencesStepView.jsx e frontend/src/features/registration/views/ResumeRegistrationView.jsx com grade/etiquetas, erros de categoria inativa e limites do serviço, retorno sem perda do rascunho e Pular com listas vazias/allowed=false preservando foto; não alterar escolhas salvas silenciosamente. (Dep.: T046.)
- [X] T048 [US2] Exibir e atualizar a leitura de interesses confirmados da própria conta em frontend/src/features/home/viewmodels/useHomeViewModel.js e frontend/src/features/home/views/HomeView.jsx a partir de GET /me após autenticação, sem depender de rascunho ou inventar recomendações, desejos e alertas. (Dep.: T027, T047.)

**Checkpoint**: personalização opcional integrada ao mesmo cadastro e consultada da conta.

---

## Phase 6: US3 — Escolher e alterar publicidade (P2)

**Goal**: Permitir opt-in explícito no cadastro e ativação/revogação posterior independente dos interesses.

**Independent Test — critério de aceite, sem execução obrigatória**: Cadastrar sem opt-in mantém false; ativar e revogar em Perfil salva a última escolha consultável em outra sessão. Retry de ativação anterior à revogação não a desfaz; erro mantém distinção entre edição e valor salvo.

### Implementation

- [X] T049 [P] [US3] Implementar backend/src/domain/preferences/marketing-preference.ts com allowed boolean obrigatório e noticeVersion reconhecida, rejeitando datas/source/userId do cliente; a escolha não deriva de categorias, documentos ou alertas e acesso permanece independente da autorização. (Dep.: T006, T042.)
- [X] T050 [US3] Criar backend/supabase/migrations/0013_set_marketing_preference.sql com set_marketing_preference: lock da linha, evento/projeção/revisão atômicos e UNIQUE(user_id, mutation_id), conflito para mesma chave/outro payload e replay que retorna valor corrente sem reaplicar escolha antiga; execução só por service_role. (Dep.: T006, T049.)
- [X] T051 [US3] Implementar backend/src/infrastructure/supabase/marketing.repository.ts e backend/src/application/services/marketing.service.ts com sujeito derivado da sessão, source account_preferences e datas do banco; conservar aviso/versionamento e retornar marketing atual + receipt, inclusive em replay após revogação. (Dep.: T011, T017, T049, T050.)
- [X] T052 [US3] Implementar backend/src/presentation/http/controllers/marketing.controller.ts e montar PATCH /me/marketing-preference em backend/src/presentation/http/routes/me.routes.ts e backend/src/app.ts com Idempotency-Key, sessão, origem e erros de versão/conflito, sem editar interesses, desejos ou alertas. (Dep.: T051.)
- [X] T053 [P] [US3] Criar frontend/src/features/account-preferences/views/MarketingConsentField.jsx como controle acessível compartilhado com rótulo/texto da spec, explicação opcional/alterável e default false no cadastro, sem ações disparadas por mudança de categoria. (Dep.: T013, T042.)
- [X] T054 [US3] Criar frontend/src/features/account-preferences/repositories/account-preferences.repository.js, frontend/src/features/account-preferences/viewmodels/useMarketingPreferencesViewModel.js e frontend/src/features/account-preferences/views/MarketingPreferencesView.jsx para GET /me e PATCH promocional com chave por escolha explícita, valor salvo separado da edição, feedback real e retry sem reativar preferência antiga. (Dep.: T052, T053.)
- [X] T055 [US3] Integrar o controle de publicidade em frontend/src/features/registration/views/PreferencesStepView.jsx e frontend/src/features/registration/viewmodels/RegistrationProvider.jsx, e /perfil/preferencias em frontend/src/app/App.jsx e frontend/src/features/home/views/HomeView.jsx; Pular sempre false, Concluir envia escolha explícita/noticeVersion e versão alterada pede nova ação, sem opt-in silencioso. (Dep.: T047, T048, T053, T054.)

**Checkpoint**: opt-in e revogação funcionais com escolha vigente confirmada.

---

## Phase 7: US4 — Foto opcional e privada (P3)

**Goal**: Adicionar prévia e envio autenticado de foto, com dispensa/retomada na mesma conta.

**Independent Test — critério de aceite, sem execução obrigatória**: Arquivo válido tem prévia e avatar privado confirmado; arquivo inválido mantém dados/foto anterior; falha oferece tentar só a foto ou continuar sem ela. Upload atrasado não desfaz dispensa e recarga/outro dispositivo pede selecionar novamente.

### Implementation

- [X] T056 [US4] Adicionar Sharp 0.35.5 somente a backend/package.json e atualizar package-lock.json preservando as demais versões/runtimes; não adicionar multipart, base64, outro banco ou SDK Auth no frontend. (Dep.: T042.)
- [X] T057 [P] [US4] Criar backend/supabase/migrations/0014_avatar_operations.sql com app_private.avatar_operations preservando “user_id uuid, mutation_id uuid, operation_kind upload/waive, request_hash sha256, claimed_photo_revision bigint, raw_digest/output_digest sha256 nullable, object_path text nullable, state pending/uploaded/associated/waived/superseded, created_at, updated_at. PK(user_id, mutation_id), compartilhada por upload e dispensa: usar a mesma chave em PUT e DELETE retorna conflito. O fingerprint inclui operation_kind e digest dos bytes para upload; waive usa payload canônico sem bytes. Campos binários/caminho são nulos em waive; upload exige raw_digest e caminho gerado.”; incluir RPCs restritas de claim/associação/dispensa com lock de perfil/intenção, photo_revision/latest_photo_mutation_id, CAS após rede e superseded sem reabrir conclusão ou substituir foto vigente. (Dep.: T007, T009, T034, T056.)
- [X] T058 [P] [US4] Definir backend/src/application/ports/image-processor.ts e implementar backend/src/infrastructure/images/sharp-image-processor.ts: “Entrada JPEG/PNG/WebP, até 5.242.880 bytes e 25.000.000 pixels.”; decodificar/reencodificar com failOn=warning/proteções, primeiro quadro WebP animado, orientação EXIF e saída estática WebP até 512×512 sem ampliar/metadados; erros precisos em vez de aceitar apenas MIME/metadata. (Dep.: T056.)
- [X] T059 [US4] Definir backend/src/application/ports/avatar-repository.ts e implementar backend/src/infrastructure/supabase/avatar.repository.ts para bucket privado consumer-avatars, caminho gerado userId/operationId.webp, upsert=false e conferência de operação/digests em objeto existente; upload confirmado é distinto da associação e download só usa caminho confirmado do proprietário. (Dep.: T057, T058.)
- [X] T060 [US4] Implementar backend/src/application/services/avatar.service.ts com claim de revisão, upload e commit que revalida último id/revisão/onboarding aberto, receipts de upload/waive e payloads distintos para PUT/DELETE; permitir retomar associação/dispensar sem recriar conta, consultar receipt antes de rejeitar etapa concluída e devolver estado atual/replayed/superseded sem desfazer escolha posterior. (Dep.: T017, T057, T058, T059.)
- [X] T061 [US4] Implementar backend/src/presentation/http/controllers/avatar.controller.ts, montar PUT/DELETE /me/onboarding/avatar e GET /me/avatar em backend/src/presentation/http/routes/me.routes.ts e backend/src/app.ts e mapear falhas em backend/src/presentation/http/middlewares/error-handler.ts: autenticar/origem antes de express.raw limitado a 5242880/inflate=false, manter JSON 1 MiB, códigos 413/415/422/409/503 e download privado no-store. (Dep.: T060, T052.)
- [X] T062 [P] [US4] Criar frontend/src/features/registration/models/photo.js e frontend/src/features/registration/views/PhotoPicker.jsx com JPEG/PNG/WebP ≤5 MiB/25 MP informados antes da escolha, prévia circular, substituir/remover, aviso de avatar estático e File/ObjectURL só em memória com revogação ao trocar/remover/desmontar; servidor continua revalidando. (Dep.: T013, T042.)
- [X] T063 [US4] Criar frontend/src/features/registration/repositories/photo.repository.js, frontend/src/features/registration/viewmodels/usePhotoViewModel.js e ampliar frontend/src/shared/services/http-client.js para bytes File e download privado, sem base64; sessão válida antes de upload, mesma chave por retry, nova chave para dispensa e aplicação apenas do estado corrente em replay/superseded. (Dep.: T012, T061, T062.)
- [X] T064 [US4] Integrar frontend/src/features/registration/views/AccountStepView.jsx, frontend/src/features/registration/views/ConfirmationView.jsx, frontend/src/features/registration/views/ResumeRegistrationView.jsx e frontend/src/features/registration/viewmodels/RegistrationProvider.jsx à foto: manter intenção ao Pular, aguardar autenticação, permitir reenviar/dispensar sem recriar conta e solicitar nova seleção após perda do File; não enviar automaticamente ao reconectar. (Dep.: T062, T063, T055.)
- [X] T065 [US4] Exibir somente foto confirmada por /api/v1/me/avatar em frontend/src/features/home/views/HomeView.jsx e frontend/src/features/home/viewmodels/useHomeViewModel.js, com alternativa sem foto, mensagens acessíveis e sem URL pública/caminho arbitrário do cliente ou dado de outra conta. (Dep.: T061, T064.)
- [X] T066 [US4] Documentar a criação/configuração do bucket privado consumer-avatars e a manutenção de objetos órfãos em backend/supabase/README.md, via API Storage após conferir referências de perfis/operações retomáveis; não remover metadados Storage diretamente, foto vigente ou conta Auth, e registrar que a configuração real depende do projeto da equipe. (Dep.: T059, T060, T065.)

**Checkpoint**: avatar opcional/privado com dispensa, retry e proteção contra respostas atrasadas.

---

## Phase 8: Polish — acabamento e entrega transversal

**Goal**: Consolidar documentação, acessibilidade e compilação, sem acrescentar testes ou publicar serviços.

- [X] T067 [P] Atualizar README.md, backend/README.md, frontend/README.md, docs/frontend.md e specs/004-cadastro-preferencias/quickstart.md com comandos/rotas/env efetivamente entregues, configurações externas realmente disponíveis e limites conhecidos; preservar imagens históricas, separar planejado/implementado/configurado e não alegar campanhas ou cenários executados. (Dep.: T066.)
- [X] T068 [P] Aplicar ajustes finais de responsividade/acessibilidade/texto em frontend/src/styles/registration.css, frontend/src/shared/components/FormField.jsx, frontend/src/shared/components/FormFeedback.jsx e frontend/src/app/navigation.js: 360–1440 pixels sem overflow horizontal, ordem/foco/labels, erros além da cor e nenhum sucesso por temporizador, respeitando os contratos das telas. (Dep.: T066.)
- [X] T069 Compilar frontend/backend pelos scripts existentes de package.json com npm run build ou scripts/npm.ps1 run build, corrigir eventuais erros nos arquivos afetados e registrar somente o resultado real de compilação em docs/desenvolvimento.md; não adicionar ou executar testes/suítes nem tratar demonstração manual como requisito. (Dep.: T067, T068.)
- [ ] T070 Aplicar as migrações de backend/supabase/migrations na ordem numérica somente no projeto Supabase de desenvolvimento indicado pela equipe e configurar Auth/e-mail/SMTP, bucket privado e backend/.env conforme specs/004-cadastro-preferencias/quickstart.md; usar credenciais fornecidas por canal seguro, não versionar/exibir segredos e registrar em docs/desenvolvimento.md o que foi efetivamente configurado. Ausência de projeto/chaves/documentos/SMTP mantém esta tarefa pendente, sem bloquear a preparação do código nem autorizar valores fictícios ou desligar confirmação. (Dep.: T069.)
- [X] T071 Revisar e registrar cobertura de FR-001–FR-022, SC-001–SC-006 e US1–US5 em specs/004-cadastro-preferencias/tasks.md e docs/entrega-e-proximos-passos.md, atualizando marcações apenas com trabalho concluído, ausência de testes e dependências externas pendentes; não marcar integração, configuração ou publicação sem execução real. (Dep.: T069, T070.)

**Checkpoint**: compilação/documentação registradas; liberação depende do resultado real da configuração T070, sem alegação de testes ou publicação.

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup, T001–T003**: pode começar imediatamente; T002/T003 usam arquivos distintos.
2. **Foundational, T004–T019**: depende da preparação; todas essas tarefas precisam estar concluídas antes das histórias. T004 precede as migrações que referenciam o perfil/esquema privado.
3. **US1, T020–T033**: primeiro fluxo de conta, depende da fundação inteira.
4. **US5, T034–T042**: depende do fluxo de US1; fecha reconciliação e correções. O marco MVP é T001–T042, não apenas uma tela de cadastro.
5. **US2, T043–T048; US3, T049–T055; US4, T056–T066**: ordem recomendada por prioridade. Após o MVP, núcleos de US3/US4 podem avançar em arquivos próprios sem esperar a implementação completa de interesses. As integrações em arquivos comuns continuam serializadas.
6. **Polish, T067–T071**: depois das histórias; T067/T068 podem ocorrer juntas, compilação T069 espera ambas e configuração real T070 exige as entradas operacionais abaixo.

### User Story Dependencies

~~~mermaid
flowchart TD
    S[Setup T001-T003] --> F[Fundação T004-T019]
    F --> U1[US1 T020-T033]
    U1 --> U5[US5 T034-T042]
    U5 --> U2[US2 T043-T048]
    U5 --> U3[US3 núcleo T049-T054]
    U5 --> U4[US4 núcleo T056-T060 e T062]
    U2 --> I3[US3 integração T055]
    U3 --> I3
    U3 --> R4[US4 rotas T061]
    U4 --> R4
    I3 --> I4[US4 integração T063-T066]
    R4 --> I4
    I4 --> P[Polish T067-T071]
~~~

US3 depende de US2 apenas na integração dos arquivos comuns, não para implementar sua regra de consentimento. US4 depende de US3 nas rotas/integrações compartilhadas, não para desenvolver o decoder ou os recibos. A sessão/conta do MVP é dependência real de todos esses incrementos.

### Within Each User Story

- Definir dados/regras antes de serviços, serviços antes de controllers e completar integração antes de declarar o checkpoint da história.
- Seguir os predecessores diretos de cada linha e a barreira T001–T019; não marcar tarefa como concluída só porque seu arquivo foi criado.
- Autorizar pelo sujeito da sessão, não por userId/e-mail/capability recebidos. O primeiro bootstrap tem a autorização limitada do vínculo novo, conforme o modelo.
- IDs de migração deste roteiro: 0001–0007 fundação; 0008–0010 US1; 0011–0012 US5; 0013 US3; 0014 US4. US2 usa a transação e as tabelas compartilhadas, sem um segundo salvamento paralelo.
- Não há ordem “escrever testes primeiro”: essa etapa não faz parte do fluxo aprovado.

### Entradas operacionais e tarefas afetadas

| Entrada | Efeito |
| --- | --- |
| Projeto/chaves Supabase e acesso administrativo | Necessários para aplicar migrações e liberar execução real em T070; não impedem escrever código/SQL. |
| APP_SECURITY_KEY válida e configuração de origem | Necessárias para sessão/prova reais; sem elas endpoints retornam indisponibilidade, não simulam sucesso. |
| SMTP e configuração de confirmação/reenvio | Necessários para consumidores externos; manter confirmação e os limites do contrato. |
| Textos/URLs reais de Termos e Política | Necessários para liberar cadastro; não gerar documentos aprovados ou destinos fictícios. |
| Bucket privado consumer-avatars | Necessário para foto real; ausência deve gerar erro retomável, preservando a conta. |

Sem essas entradas, T070 permanece pendente e o relatório deve informar o bloqueio específico. Concluir T001–T069 não equivale a configurar serviços ou atingir SC-001–SC-006. A revisão/relato de T071 pode registrar pendência externa sem marcar T070 como concluída.

### Parallel Opportunities

São **27 tarefas com [P]**, habilitadas somente quando seus predecessores e a barreira aplicável estiverem resolvidos:

- Setup: T002 + T003.
- Depois de T004: T005 + T006 + T007 + T008 + T009, em migrações diferentes.
- Depois de T010: T011 + T012 + T013; depois de T011: T014 + T015.
- Histórias e acabamento: exemplos abaixo e T067 + T068.
- registration.repository.js, RegistrationProvider.jsx, PreferencesStepView.jsx, ResumeRegistrationView.jsx, App.jsx, HomeView.jsx, me.routes.ts e app.ts são pontos de integração compartilhados; não editar simultaneamente suas tarefas.

## Parallel Example: User Story 1

Após T028 e a fundação completa:

~~~text
T029: frontend/src/features/registration/views/AccountStepView.jsx
T030: frontend/src/features/registration/views/PreferencesStepView.jsx
~~~

T024 também pode avançar em paralelo aos arquivos de trigger/serviço quando seus predecessores compartilhados estiverem prontos. Não paralelizar a composição de app.ts com a montagem de rotas que o modifica.

## Parallel Example: User Story 5

Após US1 completa:

~~~text
T034: backend/supabase/migrations/0011_resume_consumer_onboarding.sql
T037: frontend/src/features/registration/models/registration-attempt.js
~~~

A integração T038 depende de ambos os contratos implementados; T040/T041 permanecem ordenadas para expor o mesmo estado nos dois lados.

## Parallel Example: User Story 2

Após T043:

~~~text
T044: frontend/src/features/registration/views/CategoryGrid.jsx
T045: frontend/src/features/registration/views/ProductInterestInput.jsx
~~~

Integrar somente em T046/T047 para não disputar PreferencesStepView.jsx.

## Parallel Example: User Story 3

Após o marco MVP e a fundação de marketing:

~~~text
T049: backend/src/domain/preferences/marketing-preference.ts
T053: frontend/src/features/account-preferences/views/MarketingConsentField.jsx
~~~

Serviço/endpoint e tela de preferências convergem em T054/T055; o campo controlado não depende de uma resposta simulada.

## Parallel Example: User Story 4

Após T056:

~~~text
T057: backend/supabase/migrations/0014_avatar_operations.sql
T058: backend/src/infrastructure/images/sharp-image-processor.ts
~~~

T062 também pode desenvolver a prévia em arquivos próprios após o MVP; T063/T064 aguardam contratos reais de upload e a liberação dos arquivos de integração.

## Implementation Strategy

### MVP First — US1 + US5

1. Concluir preparação/fundação.
2. Entregar US1 com nome/e-mail/senha e passo 2 vazio/Pular, publicidade false e confirmação real.
3. Entregar US5 com consulta/reconciliação, retomada autenticada e conclusão persistida.
4. Tratar esse conjunto como marco intermediário T001–T042. Não oferecer foto, seleção de interesses ou opt-in como já implementados antes das histórias correspondentes.
5. Para uma entrega restrita ao MVP escolhida explicitamente, ajustar o acabamento ao recorte e registrar configurações/limites reais; a sugestão de MVP não cancela automaticamente US2–US4.

### Incremental Delivery

Após o MVP, adicionar interesses (US2), controle promocional completo (US3) e foto (US4), preservando a identidade e os dados já confirmados. Cada história tem seu critério independente de aceite acima, que não foi executado como teste.

Concluir com compilação e documentação. Liberação da integração depende de configuração real T070; demonstração não prova personalização, entrega de e-mail ou configuração que não ocorreu. Não há publicação automática neste roteiro.

### Parallel Team Strategy

Desenvolvimento sequencial continua válido. Se a equipe optar por dividir trabalho, usar apenas os pares/batches descritos, com interfaces previamente definidas e um responsável por cada arquivo compartilhado na integração. O documento descreve oportunidades; esta geração não despachou agentes nem iniciou implementação.

## Rastreabilidade e cobertura

| Requisitos | Tarefas que concretizam o comportamento |
| --- | --- |
| FR-001 | T028–T033, T041 |
| FR-002–FR-003 | T004, T007, T010, T023, T024, T029 |
| FR-004 | T028–T030, T037, T041, T064 |
| FR-005 | T020–T023, T034–T036 |
| FR-006–FR-007 | T056–T066 |
| FR-008–FR-010 | T005, T010, T021, T023, T024, T043–T048 |
| FR-011–FR-013 | T006, T021, T024, T049–T055 |
| FR-014 | T004–T009, T017, T021, T027, T036, T048, T051, T059–T065 |
| FR-015–FR-017 | T007–T010, T016–T017, T020–T023, T027, T034–T042, T057–T064 |
| FR-018–FR-019 | T002, T010–T019, T023, T025–T027, T034–T041, T049–T064 |
| FR-020 | T013, T029–T031, T039, T044–T047, T053–T055, T062–T068 |
| FR-021 | T002, T024, T029, T070 |
| FR-022 | T014, T025–T026, T031, T038–T041, T070 |
| SC-001 | T028–T033, T043–T047, T053–T055, T062–T068; meta de uso, não medição executada |
| SC-002–SC-005 | Persistência/transações/autorização/replay de T004–T066; resultados esperados, não alegação de testes |
| SC-006 | T013, T029–T031, T039, T044–T047, T053–T055, T062–T068 |

| Interface HTTP | Tarefas de implementação/montagem |
| --- | --- |
| GET /registration-config; GET /interest-categories | T024, T032; consumo T028, T033, T046 |
| POST /auth/registrations | T020–T023, T032; consumo T028–T030, T037–T041 |
| GET /auth/registrations/{registrationId} | T035–T036, T040; consumo T038–T041 |
| POST /auth/email/verify; POST /auth/email/resend | T025, T032; consumo T031, T039 |
| POST /auth/sessions; GET /auth/session; DELETE /auth/session | T014–T019, T026, T032; consumo T031, T033, T041 |
| GET /me; GET /me/onboarding; POST /me/onboarding/complete | T021, T027, T032, T034–T036, T040; consumo T033, T038, T041, T048 |
| PUT/DELETE /me/onboarding/avatar; GET /me/avatar | T057–T061; consumo T062–T065 |
| PATCH /me/marketing-preference | T049–T052; consumo T053–T055 |

## Notes

- Total: **71 tarefas**; Setup 3, Foundational 16, US1 14, US5 9, US2 6, US3 7, US4 11 e Polish 5.
- [X] indica tarefa efetivamente concluída em código/documentação. T070 permanece desmarcada; compilação não comprova operação real dos serviços.
- Manter o escopo do plano: sem cadastro empresarial, login social, recuperação completa, catálogo/recomendação, Desejos/alertas, campanhas, app móvel ou hospedagem.
- Não fabricar acesso ao projeto, credenciais, documentos legais ou envio real. Dependências externas limitam somente as atividades que delas dependem.
- Não alterar a constituição para introduzir testes ou tecnologias; isso exige o processo de emenda por consenso.


## Registro de implementação — 2026-11-14

- Concluídas T001–T069 e T071: backend/frontend, 14 migrações, integração das telas,
  controles e relatório. npm run build passou para ambos os workspaces, sem avisos.
- T070 pendente: falta acesso confirmado a um projeto Supabase para executar SQL e
  configurar Auth/SMTP/bucket, além dos textos/destinos legais reais. backend/.env
  não foi preenchido com valores fictícios. A integração Supabase está disponível,
  mas sua instalação/conexão não foi confirmada nesta execução.
- Não foram executados testes automatizados/manuais, fluxos funcionais, migrações
  remotas ou envios de e-mail. T071 registra essa pendência sem marcar T070 concluída.
- Os arquivos previstos foram mantidos; Link.jsx, AuthLayout.jsx, PhotoCompletionView.jsx,
  ConfirmedAvatar.jsx e rpc.ts concentram reutilização adicional dentro das camadas
  do plano. O cliente de sessão depende de portas e não mantém estado de usuário no
  singleton Supabase privilegiado.
- Configuração por plugin ou credenciais reais permite continuar T070; esta pendência
  não autoriza simulação de sucesso, criação de contas fictícias ou publicação.
