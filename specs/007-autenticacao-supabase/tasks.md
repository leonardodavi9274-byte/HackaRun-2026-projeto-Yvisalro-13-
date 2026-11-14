# Tasks: Autenticação real, recuperação de senha e login social

**Entrada**: [spec](spec.md), [plano](plan.md), [pesquisa](research.md), [modelo](data-model.md) e [contratos](contracts/auth.md). A constituição define fluxo sem testes obrigatórios. Critérios independentes abaixo são comportamentos esperados, não execução afirmada. Caminhos de arquivos novos e números de migração são propostas a confirmar antes de criar, evitando colisão com outras branches. Os itens concluídos registram trabalho antecipado à etapa de tarefas, sem afirmar validação funcional.

## Fase 1 — Preparação

- [X] T001 Criar branch de implementação própria e registrar a branch real em `specs/007-autenticacao-supabase/plan.md`.
- [ ] T002 Verificar configuração e segredos fora do repositório segundo `docs/desenvolvimento.md` e `backend/.env.example`; não alterar configuração externa automaticamente.

## Fase 2 — Dependências técnicas

- [ ] T003 Registrar solução suportada para invalidação do código anterior e política de recuperação de conta exclusivamente social em `specs/007-autenticacao-supabase/research.md` e `specs/007-autenticacao-supabase/plan.md` (B1). O usuário aceitou os limites de tentativas do Supabase em 2026-11-14.
- [ ] T004 Registrar solução de revogação imediata de sessão também para bearer e acesso direto, com falha fechada e coordenação do refresh em `specs/007-autenticacao-supabase/research.md` e `specs/007-autenticacao-supabase/plan.md` (B2).
- [ ] T005 Definir controle preventivo para a associação automática do Supabase, já que o usuário exigiu confirmação adicional antes de vincular; registrar solução em `specs/007-autenticacao-supabase/research.md` e `specs/007-autenticacao-supabase/plan.md` (B3).

Os bloqueios são independentes: T003–T005 condicionam apenas os fluxos indicados no plano. US4 pode ser implementada sem esses bloqueios, depois de T001.

## Fase 3 — US1: Entrar e manter acesso à própria conta (P1)

**Objetivo e critério independente**: login confirmado, recarga da sessão, acesso à própria conta e saída sem dados privados remanescentes. A garantia de revogação imediata depende de T004.

- [X] T006 [US1] Reconciliar erros genéricos de login e confirmação pendente sem enumerar contas em `backend/src/infrastructure/supabase/auth-gateway.ts` e `frontend/src/features/session/views/LoginView.jsx`.
- [ ] T007 [US1] Após T004, implementar validação da sessão de origem e revogação por usuário com proteção contra refresh em `backend/src/application/services/web-session.service.ts`, `backend/src/application/ports/session-store.ts`, `backend/src/infrastructure/supabase/session-store.ts` e nova migração proposta `backend/supabase/migrations/0019_auth_session_security.sql`.
- [ ] T008 [US1] Após T004 e T007, aplicar a mesma garantia a bearer e acessos diretos em `backend/src/presentation/http/middlewares/require-auth.ts` e políticas na migração proposta `backend/supabase/migrations/0019_auth_session_security.sql`.
- [X] T009 [US1] Atualizar navegação após sessão expirada e saída para não exibir dados privados no histórico em `frontend/src/shared/services/http-client.js` e `frontend/src/features/session/viewmodels/useSessionViewModel.js`, usando a proteção de rotas existente em `frontend/src/app/App.jsx`.

## Fase 4 — US2: Recuperar senha por e-mail (P1)

**Objetivo e critério independente**: solicitar código real, definir senha e retornar ao login, com revogação de sessões anteriores. T003 e T004 são pré-requisitos.

- [ ] T010 [US2] Após T003, projetar transação compartilhada de recuperação na migração proposta `backend/supabase/migrations/0020_password_recovery.sql`: código de seis dígitos, validade de 10 minutos, reenvio mínimo de 60 segundos, limites do Supabase e invalidação do código anterior em todas as vias.
- [ ] T011 [US2] Após T003, integrar envio e verificação real pelo Supabase em `backend/src/infrastructure/supabase/auth-gateway.ts`, mantendo resposta uniforme e sessão de recuperação somente no servidor.
- [ ] T012 [US2] Após T004 e T010–T011, implementar autorização limitada, redefinição e revogação antes da confirmação no serviço proposto `backend/src/application/services/password-recovery.service.ts` e em `backend/src/presentation/http/routes/auth.routes.ts`, incluindo resultado desconhecido e proteção CSRF.
- [ ] T013 [US2] Após T012, implementar formulários acessíveis de solicitação, código e nova senha na tela proposta `frontend/src/features/session/views/PasswordRecoveryView.jsx` e navegação em `frontend/src/app/App.jsx`; exigir mínimo de 8 caracteres Unicode e máximo de 72 bytes UTF-8 sem truncamento.
- [X] T014 [US2] Documentar configuração de e-mail transacional e OTP em `docs/desenvolvimento.md` e `backend/.env.example`, sem segredos e sem confundir campanhas com recuperação.

## Fase 5 — US3: Entrar com Google ou Apple (P2)

**Objetivo e critério independente**: autorização real por cada provedor, primeiro cadastro e acesso seguinte com a mesma identidade e preferências. T005 é pré-requisito.

- [ ] T015 [US3] Após T005, implementar transação social protegida e troca PKCE no serviço proposto `backend/src/application/services/social-auth.service.ts`, em `backend/src/infrastructure/supabase/auth-gateway.ts` e `backend/src/presentation/http/routes/auth.routes.ts`; retornos repetidos ou adulterados não criam sessão.
- [ ] T016 [US3] Após T015, implementar inicialização social idempotente por `user_id` sem senha ou `registration_intent` anterior, preservando perfil e publicidade desativada, na migração proposta `backend/supabase/migrations/0021_social_onboarding.sql` e em `backend/src/application/services/onboarding.service.ts`.
- [ ] T017 [US3] Após T015–T016, integrar botões sociais, retorno e pendências em `frontend/src/features/session/views/LoginView.jsx`, `frontend/src/features/registration/views/ResumeRegistrationView.jsx` e `frontend/src/app/App.jsx`; permitir nome ausente e endereço privado Apple.
- [X] T018 [US3] Documentar configuração e rotação de credenciais dos provedores em `docs/desenvolvimento.md` e `backend/.env.example` sem registrar segredos.

## Fase 6 — US4: Usar gerenciador de senhas (P2)

**Objetivo e critério independente**: usar credenciais salvas no login e sugestões no cadastro, mantendo digitação e colagem disponíveis em ambientes compatíveis.

- [X] T019 [US4] Ajustar nomes estáveis e `autocomplete="username"`/`current-password` no login em `frontend/src/features/session/views/LoginView.jsx`, mantendo controle de visibilidade e preenchimento manual.
- [ ] T020 [US4] Garantir `autocomplete="new-password"`, nomes estáveis e colagem no cadastro em `frontend/src/features/registration/views/AccountStepView.jsx`; aplicar os mesmos atributos à redefinição quando T013 existir.

  Cadastro atualizado para captar os valores preenchidos diretamente no formulário; a parte de redefinição permanece pendente de T013. A disponibilidade do gerenciador ainda não foi verificada funcionalmente.

## Fase 7 — Finalização

- [ ] T021 Atualizar estado real e limitações da entrega em `docs/frontend.md` e `specs/007-autenticacao-supabase/quickstart.md`; distinguir configuração pendente, código implementado e ausência de testes.
- [ ] T022 Compilar frontend e backend com `npm run build` na raiz, após as alterações, e registrar eventual falha ou limitação em `specs/007-autenticacao-supabase/quickstart.md`.
- [ ] T023 Na preparação da publicação, definir hospedagem, domínio HTTPS e encaminhamento `/api` da mesma origem para o backend; registrar decisões e URL real de entrega em `docs/base-execucao-sistema.md`.
- [ ] T024 Na preparação da publicação, configurar nos ambientes apropriados as origens, migrações, SMTP, provedores e segredos substituídos sem versioná-los; registrar o estado efetivo e as limitações em `docs/base-execucao-sistema.md` e `specs/007-autenticacao-supabase/quickstart.md`, após resolver as dependências dos fluxos habilitados.

## Dependências e estratégia

T001 precede alterações de código conforme constituição. T003 bloqueia US2; T004 bloqueia revogação imediata e US2; T005 bloqueia US3. T019–T020 são independentes dos três bloqueios. T006 e T009 podem avançar após T001 com cuidado para preservar a confirmação de e-mail. T021–T022 acompanham o recorte efetivamente concluído; T023–T024 são pendências para publicação, sem presumir que seja executada nesta etapa. Não marcar a feature inteira como concluída enquanto tarefas bloqueadas permanecerem abertas. Trabalho em arquivos distintos pode ocorrer em paralelo quando suas dependências estiverem satisfeitas; tarefas no mesmo arquivo são sequenciais. MVP: US1, após T004; US4 pode ser entregue separadamente.

```text
T001 ─┬─ T004 → T007 → T008       (US1 e revogação)
      ├─ T003 ─┬─ T010 ─┐
      │        └─ T011 ─┼─ T012 → T013  (US2; T012 também depende de T004)
      ├─ T005 → T015 → T016 → T017      (US3)
      └─ T019 → T020                     (US4; parte da redefinição depende de T013)
```

Exemplos de trabalho em arquivos distintos, depois de resolver as dependências: US1 — T009 junto à definição da migração de T007; US2 — documentação T014 junto à implementação de T010; US3 — documentação T018 junto à implementação de T015; US4 — análise do cadastro em T020 junto a T009. T014 e T018 compartilham arquivos e devem ser sequenciais entre si; T006, T017 e T019 compartilham a tela de login e também são sequenciais. Os itens de B1–B3 estão registrados como pendências, não como soluções já definidas.
