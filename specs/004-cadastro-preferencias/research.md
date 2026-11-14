# Pesquisa: cadastro e preferências

**Data:** 2026-11-13. **Estado:** decisões técnicas resolvidas para o recorte da [spec](spec.md).
As fontes abaixo são oficiais e foram consultadas nesta data. Decisões arquiteturais são escolhas do projeto, não garantias atribuídas aos fornecedores.

## Lacunas resolvidas

| Lacuna | Decisão |
| --- | --- |
| Onde autenticar e manter sessão | Backend Express como intermediário; navegador usa cookie opaco e não recebe tokens Supabase. |
| Como reconhecer criação real e resposta perdida | Intenção sem senha, idempotência e vínculo mínimo em trigger de inserção de identidade. |
| Onde salvar preferências conjuntamente | Uma transação PostgreSQL via RPC, separada de Auth/Storage. |
| Como confirmar e reenviar e-mail | TokenHash no link, confirmação explícita por POST e reenvio nativo. |
| Como transportar/verificar foto | Corpo binário autenticado, separado do JSON; decodificação/reencodificação com Sharp. |
| Como persistir/revogar publicidade | Histórico e projeção atual na mesma transação, com repetição que não reaplica escolhas antigas. |
| Versões, limites e operação | Reutilizar versões fixadas; Sharp 0.35.5; confirmação e SMTP configurados no projeto. |

## D1 — Preservar a base e a separação de responsabilidades

**Decision:** manter React/JavaScript/JSX com MVVM e Vite no frontend; Node.js 24.22.3, TypeScript 7.0.2, Express 5.3.0 e Supabase JS 2.119.0 no backend, conforme manifests/lockfile existentes. Acrescentar Sharp 0.35.5 apenas no backend para imagens. Não migrar frontend para TypeScript nem introduzir outro banco, framework ou serviço de filas.

**Rationale:** respeita as decisões ratificadas e evita substituição da base para entregar dois formulários. Versões são as do repositório, não uma alegação de serem as mais recentes.

**Alternatives considered:** migração do frontend, Next.js, serviço separado de autenticação e upload multipart; sem necessidade neste recorte.

## D2 — Sessão web intermediada pelo backend

**Decision:** o frontend chama apenas a WebAPI na mesma origem. O backend usa cliente Auth por requisição com chave publicável, sem persistência/refresh automático compartilhado; o cliente privilegiado existente fica restrito à infraestrutura de dados. Sessão web usa cookie opaco HttpOnly/Secure/SameSite=Lax e tokens criptografados no PostgreSQL; renovação é serializada por sessão. Nenhum SDK Auth, JWT ou refresh token fica no navegador. O middleware mantém validação de identidade com getUser; CORS não substitui autorização.

**Rationale:** reúne as operações de negócio na API existente e permite recuperar a sessão sem guardar a senha. É uma decisão BFF do projeto: o modelo SSR híbrido documentado pela Supabase pressupõe que o navegador também manipule tokens, o que não se aplica aqui. [Guia avançado](https://supabase.com/docs/guides/auth/server-side/advanced-guide), [refreshSession](https://supabase.com/docs/reference/javascript/auth-refreshsession).

**Alternatives considered:** tokens em localStorage e cliente Supabase no frontend; cookies de tokens compartilhados com JavaScript; cliente Auth singleton, que pode misturar sessões.

**Detalhes definidos:** origem única em produção por proxy HTTPS; Vite /api no desenvolvimento. Toda mutação web exige Origin autorizado e X-App-Request: web, além de Content-Type adequado; não há mutações por GET. Cookies Lax são defesa adicional, não a única proteção contra CSRF. [MDN sobre requisições não simples e CORS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF).

## D3 — Criação real, idempotência e retomada

**Decision:** salvar intenção somente na conclusão do passo 2, contendo snapshot validado de dados não secretos. O navegador gera UUID de operação e segredo de 32 bytes; o banco guarda apenas hash do segredo. Passar referência/prova de vínculo na chamada nativa signUp. Um trigger AFTER INSERT de auth.users valida intenção, prova e e-mail normalizado, bloqueia a linha e vincula NEW.id uma única vez. Trigger executa somente esse vínculo, sem chamadas externas nem gravação do perfil completo.

O backend confirma criação pelo vínculo persistido, nunca apenas por data.user retornado. Repetição com a mesma intenção não altera identidade existente. Timeout exige consultar o vínculo; eventual repetição explícita de signUp usa a mesma intenção congelada e as garantias de unicidade do e-mail, sem mudar senha/metadados de conta existente. Depois de vínculo confirmado, não chamar signUp de novo: retomada usa sessão com user.id igual ao vínculo.

**Rationale:** signUp pode devolver usuário ofuscado para conta existente. O trigger oferece evidência de INSERT real, inclusive quando a resposta se perde. O padrão e o risco de bloquear cadastros em caso de erro do trigger são documentados. [signUp](https://supabase.com/docs/reference/javascript/auth-signup), [dados de usuários e triggers](https://supabase.com/docs/guides/auth/managing-user-data). O comportamento de conta já existente foi conferido no [código oficial de signup](https://github.com/supabase/auth/blob/master/internal/api/signup.go).

**Alternatives considered:** confiar em user.id de signUp; localizar conta apenas por e-mail e aplicar o snapshot; criar conta novamente após timeout; admin.createUser com UUID conhecido, que exigiria envio de confirmação separado.

**Limites:** não há transação distribuída entre Auth, SMTP, dados e Storage. Prova da intenção não autoriza ler perfil, salvar foto ou alterar preferências depois da criação. O primeiro bootstrap do perfil é uma operação interna limitada ao vínculo recém-criado; retomadas posteriores exigem autenticação. Não persistir senha, hash de senha nem fingerprint que a inclua.

**Revisão do design:** confirmar claim/lease antes da chamada Auth; não manter a linha bloqueada durante signUp, pois o trigger precisa acessá-la. Resposta normal sem vínculo orienta acesso de forma neutra, sem consumir snapshot. Timeout sem vínculo continua desconhecido. Na sessão, gravar refresh exige lease_owner e revisão esperados; perda entre rotação e gravação pode exigir login. A tolerância do provedor não substitui esse controle. [Sessões](https://supabase.com/docs/guides/auth/sessions).

## D4 — Confirmação de e-mail e acesso mínimo

**Decision:** confirmação ativada por padrão. Template direciona ao estado de confirmação da aplicação com TokenHash no fragmento do link. A página remove o fragmento do histórico, mantém o token somente em memória e aguarda **Confirmar e-mail**. POST da API chama verifyOtp com token_hash e type=email; cria sessão web somente após identidade válida. Um GET de scanner não consome token. Perda da resposta pode exigir entrar com e-mail/senha, sem repetir cadastro.

**Rationale:** o fornecedor oferece TokenHash e verificação por API. A escolha de fragmento e ação explícita reduz exposição em logs e consumo por pré-carregamento. [Templates](https://supabase.com/docs/guides/auth/auth-email-templates), [verifyOtp](https://supabase.com/docs/reference/javascript/auth-verifyotp).

**Alternatives considered:** consumir automaticamente em GET, transportar tokens de sessão na URL, desligar confirmação para contornar e-mail indisponível.

**Operação:** reenvio usa resend nativo, respostas neutras e espera do serviço, com piso local de 60 segundos. A configuração deve alinhar expiração do token a 3600 segundos. SMTP embutido é restrito a endereços da equipe e atualmente 2 mensagens/hora; consumidores externos dependem de SMTP próprio configurado no Supabase. [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [limites](https://supabase.com/docs/guides/auth/rate-limits).

## D5 — Corrigir o default de senha

**Decision:** ajustar FR-003: mínimo 8 pontos de código Unicode e máximo 72 bytes UTF-8; indicador forte a partir de 12 caracteres com letra, número e símbolo, dentro do limite. Não aparar, truncar nem pré-hashear a senha. Interface explica que caracteres acentuados e emoji podem ocupar vários bytes.

**Rationale:** o default anterior de 128 caracteres era incompatível com a implementação atual do provedor: MaxPasswordLength=72 e comparação por len(password) em Go; mínimo usa contagem Unicode. [Validação oficial do Supabase Auth](https://github.com/supabase/auth/blob/master/internal/api/password.go). É correção de premissa da feature, sem mudança de tecnologia.

**Alternatives considered:** manter 128 e falhar só no serviço; truncar silenciosamente; criar esquema de credencial paralelo.

## D6 — Dados, publicidade e autorização

**Decision:** uma RPC salva perfil, categorias, termos e evento inicial de publicidade em transação; outra altera publicidade com bloqueio de linha, chave idempotente e projeção atual. Termos usam posições 1–10 e unicidade por termo normalizado. RLS habilitada; sem DML ou EXECUTE concedidos a anon/authenticated para os dados privados; funções de negócio invocadas apenas pelo servidor.

**Rationale:** falha em preferências não pode deixar publicidade divergente. Chave privilegiada ignora RLS, portanto sujeito/posse precisam ser verificados na API e nas funções. [Funções](https://supabase.com/docs/guides/database/functions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [transações PostgreSQL](https://www.postgresql.org/docs/current/tutorial-transactions.html), [restrições](https://www.postgresql.org/docs/current/ddl-constraints.html).

Replay de ativação A após revogação B reconhece A sem reaplicar; devolve estado atual, não um snapshot antigo como se fosse vigente.

**Alternatives considered:** inserts independentes; consentimento dentro de um objeto editável de interesses; confiar somente em políticas RLS usando chave de serviço; interpretar seleção de categoria como opt-in.

## D7 — Foto separada e privada

**Decision:** PUT autenticado com corpo JPEG/PNG/WebP de até 5 MiB, usando express.raw no endpoint específico, sem base64/multipart. Manter JSON global em 1 MiB. Sharp 0.35.5 verifica formato e decodifica/reencodifica para WebP estático de até 512×512, sem ampliar; orientação aplicada e metadados removidos. Fixar limite de entrada em 25 milhões de pixels e registrar esse default na spec. WebP animado usa primeiro quadro.

**Rationale:** transporte separado cabe na base e não exige parser multipart. Ler somente metadata não comprova imagem válida; falhas precisam ser detectadas ao gerar a saída. [Express raw](https://expressjs.com/en/5x/api/express/#express.raw), [Sharp constructor](https://sharp.pixelplumbing.com/api-constructor/), [saída](https://sharp.pixelplumbing.com/api-output/).

Bucket privado consumer-avatars; caminho gerado userId/operationId.webp; download somente pela API autenticada. Upload e vínculo têm recibo próprio: falha após upload permite retomar associação, sem substituição silenciosa da foto anterior. Arquivo do formulário permanece em memória até sessão válida; em outro dispositivo ou após recarga, solicitar seleção novamente ou dispensa explícita.

**Alternatives considered:** bucket público, URL permanente, upload direto sem decodificação, armazenar imagem no JSON, tomar existência de objeto como confirmação sem conferir operação/digest. [Buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals), [controle de acesso](https://supabase.com/docs/guides/storage/security/access-control).

## Encerramento da pesquisa

Não há decisão técnica sem resolução que impeça o design. Credenciais, projeto Supabase, SMTP e documentos legais são entradas operacionais explicitadas no quickstart; não foram inventados ou configurados. Hospedagem pública e envio de campanhas permanecem fora do recorte.
