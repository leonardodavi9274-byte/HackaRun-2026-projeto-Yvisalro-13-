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

**Investigação adicional em 2026-11-14**: o [código-fonte do Supabase Auth](https://github.com/supabase/auth/blob/master/internal/conf/configuration.go) inclui `GOTRUE_EXPERIMENTAL_PROVIDER_LINKING_DOMAINS`, que pode colocar provedores em domínios separados para impedir associação automática entre domínios. Esta é uma possibilidade para investigar, não uma solução confirmada: é experimental, sua disponibilidade no Supabase hospedado não foi comprovada, e isolar provedores pode criar contas distintas com o mesmo e-mail em vez de vincular à conta existente após confirmação. O comportamento do vínculo manual, da recuperação e das contas existentes nesse arranjo precisa ser estabelecido antes de adotá-lo. Dar o mesmo domínio a Google e Apple permitiria associação entre eles, portanto não atende automaticamente à confirmação adicional escolhida. Não ativar essa opção nem desabilitar controles por suposição.

O [código de envio de recuperação](https://github.com/supabase/auth/blob/master/internal/api/mail.go) gera novo token de recuperação e substitui o anterior após envio aceito, enquanto o [código de verificação](https://github.com/supabase/auth/blob/master/internal/api/verify.go) compara o token apresentado com o estado armazenado. Isso é evidência útil para FR-007, mas não comprova a versão e as configurações de um projeto ainda não identificado, nem resolve recuperação de contas sociais ou acesso direto. B1 e B3 permanecem abertos.

**Correção do ambiente em 2026-11-14**: o usuário esclareceu que o projeto está hospedado pelo Supabase. A hipótese anterior de instalação própria não se aplica. As [restrições de rede para banco do Supabase](https://supabase.com/docs/guides/platform/network-restrictions) não se aplicam à API HTTPS de Auth; portanto não foi demonstrado que um gateway da aplicação impediria o acesso direto ao Auth hospedado. O candidato abaixo é somente análise histórica para uma eventual instalação própria, não a solução adotada para este projeto.

### Candidato histórico, não aplicável ao ambiente informado: gateway em instalação própria

Esta alternativa precisa ser detalhada e demonstrada na instalação antes de liberar B1–B3. Ela mantém Supabase Auth como autoridade de identidade e o PostgreSQL existente; não define uma nova autoridade de autenticação. Sua finalidade é impedir chamadas externas aos caminhos que contornariam as regras da aplicação.

1. Manter Auth, banco, serviços administrativos e o acesso privilegiado do Data API em rede interna; configurar na borda apenas os caminhos públicos estritamente necessários. Todas as rotas de criação de sessão, recuperação, alteração de senha, administração e autenticação por token devem ser auditadas, inclusive rotas equivalentes e os acessos diretos que possam existir em outro domínio. A chave publicável não é segredo nem substitui esse isolamento. O callback OAuth público precisa continuar recebendo retornos legítimos e rejeitar estados não iniciados pelo gateway.
2. Para recuperação, o backend consulta a identidade elegível por uma operação privilegiada protegida, envia resposta pública uniforme e mantém a sessão de recuperação exclusivamente no servidor. Bloquear na borda os endpoints Auth que poderiam criar senha diretamente para conta social. Garantir que a condição de conta com senha seja consultada de uma fonte confiável e continue válida ao salvar; não confiar em `user_metadata` alterável pelo cliente. Considerar reenvio, uso único e chamadas concorrentes. O código-fonte citado acima sugere substituição do token, condicionada à versão instalada.
3. Para login social, obter e validar primeiro a identidade do provedor fora da associação automática do Supabase, com estado, PKCE/nonce, emissor, público, assinatura e validade apropriados. Se o endereço corresponder a conta existente, pedir autenticação comprovada pelo método anterior antes de qualquer vínculo. Somente então usar um método de vínculo suportado pelo Supabase. Para conta nova, criar ou autenticar pelo provedor; serializar decisões de criação e vinculação concorrentes para que duas solicitações com o mesmo endereço não escapem da verificação. A disponibilidade e a semântica da API de vínculo e de ID token para os dois provedores devem ser confirmadas para a versão usada; o controle na borda deve impedir que o próprio usuário inicie o fluxo automático diretamente. Isolamento experimental de domínios, sozinho, não entrega o vínculo à conta existente.
4. Para sessões, consultar a existência do `session_id` associado ao usuário depois de validar o JWT, conforme [documentação de sessões](https://supabase.com/docs/guides/auth/sessions), e proteger os recursos expostos por RLS/grants ou impedir a sua exposição direta. Revogar sessões web por usuário sem permitir refresh concorrente e falhar de modo fechado quando a fonte de verdade não puder ser consultada. Conciliar o ciclo de confirmação da alteração de senha com falhas parciais de revogação, sem anunciar sucesso antes da garantia efetiva.

**Limites do candidato**: ainda faltam a versão exata e topologia real do Auth, a comprovação de que nenhum caminho alternativo está exposto, uma solução concreta de vínculo confirmado para Google e Apple sem corrida e a verificação das permissões para checar `auth.sessions`. Enquanto isso, não são concluídas T003–T005 e os fluxos correspondentes permanecem indisponíveis. A estratégia não justifica criar senha para contas apenas sociais nem associar identidades por e-mail sem confirmação.

## R4 — Preenchimento e erro de login

Para a investigação posterior de gatilhos no Supabase hospedado, consultar [controle-identidade-hospedado.md](controle-identidade-hospedado.md). A proposta ainda não demonstra os três bloqueios nem foi aplicada ao projeto.

**Decisão**: formulários HTML com nomes estáveis, `autocomplete="username"` no identificador de login, `current-password` na entrada, `new-password` no cadastro/redefinição e `one-time-code` no código. Aceitar colagem e entrada manual. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete) documenta esses valores; a oferta depende do gerenciador. A API atual revela `EMAIL_CONFIRMATION_REQUIRED` antes de prova suficiente: adotar resposta pública genérica e reenvio genérico.

**Alternativas**: simular senha salva ou manter gerenciador próprio de credenciais não atende à intenção do produto.
