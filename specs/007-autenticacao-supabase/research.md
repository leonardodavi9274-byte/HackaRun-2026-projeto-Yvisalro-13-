# Pesquisa técnica — autenticação 007

Fontes oficiais consultadas em 2026-11-14. São decisões de desenho, sem prova de funcionamento ou configuração.

## R1 — Recuperação e tentativas

**Decisão**: modelo de recuperação Supabase com `{{ .Token }}`, verificação `type: recovery`, seis dígitos e validade de 600 segundos; limites de tentativas do Supabase aceitos pelo usuário em 2026-11-14. Recuperação social e invalidação do código anterior continuam dependentes de B1 no [plano](plan.md). Guardar tokens retornados pela verificação cifrados no servidor e expor apenas handle opaco de finalidade redefinição. Nunca conceder sessão web comum nesse passo.

**Justificativa**: [modelo de e-mail](https://supabase.com/docs/guides/auth/auth-email-templates) oferece código; [configuração Auth](https://supabase.com/docs/guides/local-development/cli/config) indica seis dígitos e expiração padrão de uma hora, alterável. Expiração é compartilhada com outros OTPs: avaliar impacto na confirmação 004. [Limites](https://supabase.com/docs/guides/auth/rate-limits) definem 60 segundos por usuário e verificação por IP, não cinco por solicitação. O `Map` atual é local ao processo. Auth é acessível diretamente: contador apenas na API não garante requisito nem impede recuperação de identidade exclusivamente social.

**Alternativas**: link foi rejeitado pela spec; limite próprio de cinco tentativas foi substituído, a pedido do usuário, pelos limites do Supabase. SMTP próprio é necessário para uso público. Não registrar códigos, senhas ou tokens.

## R2 — Revogação e acesso

**Decisão**: revogar sessões do provedor e todas as linhas web do usuário, com proteção contra refresh concorrente; validar sessão de origem em todas as entradas privadas, inclusive bearer e acesso direto ao banco. Falhar de modo fechado quando a consulta confiável estiver indisponível. Não confirmar conclusão até a barreira ser estabelecida; B2 segue aberto até demonstrar solução em todos os caminhos.

**Justificativa**: [sessões Supabase](https://supabase.com/docs/guides/auth/sessions) descrevem associação e consulta de `session_id`; [sign-out](https://supabase.com/docs/guides/auth/signout) informa que JWTs anteriores podem permanecer válidos até expirar. `getUser` isoladamente não prova invalidação imediata. O serviço atual aceita bearer e revoga somente um hash.

**Alternativas**: esperar expiração do JWT viola SC-002; aceitar apenas cookie sem tratar acesso externo também não comprova o requisito.

## R3 — OAuth e contas existentes

**Decisão**: OAuth server-side com PKCE, transação curta por navegador, verificador protegido, correlação de retorno e destino fixo permitido; troca única com Supabase e sessão web somente após validação. Inicializar social por `user_id` autenticado e idempotente, sem resetar perfil ou preferências. Condicionado a B3.

**Justificativa**: [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow) exige verificador e código de uso único; [Apple web](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple) exige configuração e rotação de segredo e pode não fornecer nome no fluxo web. [Identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking) descreve associação automática por e-mail verificado e remoção de identidades não confirmadas em alguns casos, antes do callback. Em 2026-11-14 o usuário exigiu confirmação adicional antes do vínculo; a associação automática não cumpre essa decisão sem controle preventivo comprovado.

**Alternativas**: mesclar contas localmente por e-mail não comprova vínculo; fluxo implícito com tokens no navegador não aproveita a sessão existente.

## R4 — Preenchimento e erro de login

**Decisão**: formulários HTML com nomes estáveis, `autocomplete="username"` no identificador de login, `current-password` na entrada, `new-password` no cadastro/redefinição e `one-time-code` no código. Aceitar colagem e entrada manual. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete) documenta esses valores; a oferta depende do gerenciador. A API atual revela `EMAIL_CONFIRMATION_REQUIRED` antes de prova suficiente: adotar resposta pública genérica e reenvio genérico.

**Alternativas**: simular senha salva ou manter gerenciador próprio de credenciais não atende à intenção do produto.
