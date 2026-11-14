# Contrato proposto — autenticação web

Base `/api/v1/auth`; JSON e HTTPS em produção, respostas sem segredos. Rotas abaixo orientam tarefas e não estão implementadas. Mutações por cookie exigem proteção CSRF e verificação de origem; cookies `HttpOnly`, `Secure` em HTTPS, `SameSite` apropriado e escopo restrito. Erros seguem convenção da API; 429 inclui `Retry-After`. Conteúdo e tempo de resposta não devem denunciar existência ou método da conta. A aplicação e os endpoints diretos dependem dos bloqueios de [plan.md](../plan.md).

| Operação | Entrada / sucesso | Falhas e garantias |
| --- | --- | --- |
| `POST /sessions` (existente) | `email`, `password`; cookie opaco após confirmação; retorna onboarding. | Credenciais inválidas e estado não comprovado usam resposta genérica; reenvio também é genérico. |
| `GET /session`, `DELETE /session` (existentes) | Estado e pendências; saída revoga sessão corrente e limpa cookie. | Acesso revogado falha fechado, inclusive bearer. |
| `POST /password-recovery` | `email`; `202` e mensagem genérica após aceite; ID opaco e espera uniformes. | 400 formato inválido; 429 limite; 503 aceite não comprovado. Não afirma entrega. |
| `POST /password-recovery/{id}/resend` | Sem dados sensíveis; `202`, nova geração e espera. | Mesma resposta pública; invalidação anterior efetiva depende de B1. |
| `POST /password-recovery/{id}/verify` | `code` de seis dígitos; cookie com handle limitado à redefinição, sem sessão comum. | Código inválido/expirado/consumido: erro genérico; limites de tentativas do Supabase se aplicam. |
| `POST /password-recovery/reset` | Handle limitado e `newPassword`, confirmação validada no cliente e servidor; 200 após mudança e barreira de revogação. | 422 senha inválida; 401/410 autorização inválida; resultado desconhecido orienta login ou recuperação sem repetir automaticamente. |
| `POST /social/{google|apple}/start` | Cria transação PKCE e retorna endereço autorizado e correlação protegida. | 503 se indisponível; impedir redirecionamento aberto; sujeito a B3. |
| `GET /social/callback` | Código e correlação; troca única, sessão após validação e destino início ou pendências. | Erro/replay/cancelamento não estabelece sessão; não registrar código/tokens nem repassar no destino final. |
| Onboarding social autenticado | Dados faltantes e preferências explícitas/dispensadas; identidade vem da sessão. | Criação idempotente por `user_id`, sem senha ou `registration_intent` prévio; não sobrescreve perfil ou consentimento. |

O navegador não recebe tokens de recuperação. Se já houver sessão de outra conta, a recuperação não aproveita essa identidade; após êxito, o destino é login e o tratamento da sessão prévia preserva isolamento. A API não confirma entrega de e-mail nem retorna credenciais de terceiros.
