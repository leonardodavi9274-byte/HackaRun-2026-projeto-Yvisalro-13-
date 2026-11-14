# Modelo de dados: cadastro e preferências

**Estado:** design para implementação; nenhuma tabela ou função foi criada. Referências: [spec](spec.md), [decisões](research.md) e [API](contracts/api.md).

## Convenções e acesso

- PostgreSQL do projeto Supabase é a única persistência. Identidade permanece em auth.users; referenciar somente sua chave primária id, sem alterar o esquema gerenciado.
- Tabelas de negócio ficam em public, com RLS habilitada e DML revogado de anon/authenticated. Operações do produto passam pela API; service_role acessa somente adaptadores do servidor.
- Estado operacional sensível fica em app_private, não exposto pela Data API. RPCs públicas com SECURITY INVOKER são executáveis somente por service_role, com privilégios explícitos no esquema privado. Revogar EXECUTE de PUBLIC/anon/authenticated.
- Trigger de vínculo usa SECURITY DEFINER, search_path vazio, nomes qualificados e proprietário controlado. Nenhuma função privada é invocável pelo cliente.
- A chave privilegiada ignora RLS. A API deriva o sujeito da sessão; RPCs conferem vínculo entre sujeito, intenção e operação. Nenhum userId recebido no corpo define o proprietário.
- UUIDs, timestamptz em UTC, booleanos não nulos e limites por caracteres Unicode, exceto senha medida também em bytes. Banco gera datas; respostas serializam ISO 8601.
- Sem senha, hash de senha, TokenHash de e-mail ou token de registro bruto nas tabelas da aplicação. Tokens Supabase só existem criptografados no armazenamento operacional da sessão.

## Entidades de negócio

### consumer_profiles

| Campo | Tipo/regra |
| --- | --- |
| user_id | uuid PK/FK auth.users.id ON DELETE CASCADE |
| display_name | text aparado, 2–100 caracteres, não exige sobrenome |
| photo_object_path | text nullable, caminho interno gerado pelo servidor; nunca URL fornecida pelo cliente |
| onboarding_completed_at | timestamptz nullable; escrito somente após dados e foto resolvidos, identidade confirmada e sessão válida |
| created_at / updated_at | timestamptz do banco |

O e-mail é obtido do Auth na consulta, não uma segunda fonte editável de identidade. Perfil é criado uma vez; este recorte não oferece edição geral do perfil concluído.

### interest_categories

| Campo | Tipo/regra |
| --- | --- |
| id | text PK estável |
| label | text não vazio |
| sort_order | smallint único positivo |
| active | boolean default true |

Sementes: moda/Moda, tenis/Tênis, eletronicos/Eletrônicos, beleza/Beleza, casa/Casa, cafe-doces/Café e doces, games/Games, livros/Livros, esporte/Esporte. Mudança do nome não muda o identificador.

### consumer_category_interests

user_id uuid FK consumer_profiles, category_id text FK interest_categories; PK composta. Inserção/atualização somente pela transação de inicialização, que recusa categoria inativa. Não há seleção obrigatória.

### consumer_product_interests

| Campo | Tipo/regra |
| --- | --- |
| user_id | uuid FK consumer_profiles ON DELETE CASCADE |
| position | smallint entre 1 e 10 |
| term | text aparado de 1–100 caracteres |
| normalized_term | text gerado por lower(app_trim(term)), usando a mesma regra de espaços externos da interface |

PK(user_id, position) limita a dez posições; UNIQUE(user_id, normalized_term) elimina duplicatas. app_trim deve reproduzir o conjunto de espaços externos de String.trim do JavaScript, incluindo espaços Unicode; a contagem de caracteres ocorre depois dessa normalização. A comparação definitiva de caixa é a do banco; o frontend apenas antecipa possíveis duplicatas. Não remover acentos nem transformar produtos semelhantes em iguais. Interesses não têm FK de catálogo nem criam Desejos/alertas.

### marketing_preferences

user_id uuid PK/FK consumer_profiles, allowed boolean NOT NULL DEFAULT false, revision bigint positivo, changed_at timestamptz, last_event_id uuid. A primeira gravação tem revisão 1, inclusive quando allowed=false. A linha é a projeção da última escolha confirmada, nunca o estado em edição.

### marketing_consent_events

| Campo | Tipo/regra |
| --- | --- |
| id | uuid PK |
| user_id | uuid FK consumer_profiles |
| allowed | boolean não nulo |
| recorded_at | timestamptz do banco |
| source | registration / onboarding_resume / account_preferences |
| notice_version | text validado na configuração do servidor |
| mutation_id | uuid da operação |
| payload_hash | sha256 do payload canônico não secreto |

UNIQUE(user_id, mutation_id). Histórico append-only. Operações iguais repetidas não geram eventos adicionais. Uma nova escolha explícita pode gerar evento mesmo com valor igual, mas nunca por retry automático.

Versão inicial do aviso: marketing-email-v1, com o texto da spec. Datas/origem/versão reconhecida são controladas pelo servidor; clientes não escolhem source ou datas arbitrárias.

## Entidades operacionais privadas

### app_private.registration_intents

| Campo | Tipo/regra |
| --- | --- |
| id | uuid PK, também Idempotency-Key da criação |
| request_token_hash | SHA-256 do Registration-Token de 32 bytes gerado no navegador |
| binding_proof_hash | SHA-256 da prova HMAC gerada pelo servidor para o trigger |
| normalized_email | text aparado e convertido para minúsculas, até 254 caracteres |
| request_hash | SHA-256 do snapshot canônico; exclui completamente senha e foto binária |
| snapshot | dados validados de nome, categorias, termos, marketing/versão e photoRequested; imutável enquanto processa |
| user_id | uuid nullable FK auth.users.id, UNIQUE quando preenchido |
| identity_state | not_started / in_flight / unknown / bound / not_created |
| data_state | pending / saved |
| photo_state | not_requested / awaiting_upload / saved / waived |
| photo_revision / latest_photo_mutation_id | bigint iniciado em 0 / uuid nullable; identifica a última intenção explícita de salvar ou dispensar foto |
| email_dispatch_state | not_requested / accepted / failed / unknown |
| lease_owner / lease_expires_at | UUID da execução e prazo da chamada de criação |
| created_at / updated_at | timestamptz |
| capability_expires_at | created_at + 24 horas |

A prova de binding é HMAC derivado de APP_SECURITY_KEY com contexto específico, id e e-mail canônico. É reconstruível após reinício sem guardar a senha; o trigger compara seu digest ao valor armazenado. Não autoriza operações posteriores. Metadata de Auth não é fonte de autorização após a inserção.

O snapshot só é salvo ao concluir/pular. **Pular** força categorias/termos vazios e allowed=false, preservando photoRequested. request_hash congela esses dados; mesma chave com conteúdo não secreto diferente retorna conflito. Credenciais são usadas apenas no dispatch Auth, nunca entram no hash ou receipt.

Somente rejeição definitiva sem criação/em voo permite descartar a intenção e gerar novo par de id/prova para dados corrigidos. processing/unknown/bound preservam a intenção; corrigir perfil depois de vínculo exige a rota autenticada, sem novo cadastro.

O segredo da intenção só permite status mínimo e controle da mesma criação. Não retorna nome, e-mail, interesses, preferência, foto ou user_id. Após 24h, o status por capability expira; uma identidade já vinculada continua retomável pela sessão da própria conta. Snapshot de uma intenção vinculada não é descartado silenciosamente antes de inicializar os dados.

Após salvar o perfil, limpar snapshot e manter apenas receipt/vínculo/estados necessários à retomada. Intenções expiradas sem vínculo podem ser eliminadas por manutenção documentada. Não apagar contas Auth ao limpar intenções.

### app_private.web_sessions

| Campo | Tipo/regra |
| --- | --- |
| session_hash | SHA-256 do identificador opaco do cookie; PK |
| user_id | uuid FK auth.users.id |
| encrypted_tokens | bytea: access/refresh tokens com AES-256-GCM, nonce aleatório e tag |
| key_version | text para identificação da chave |
| access_expires_at | timestamptz do provedor |
| expires_at | limite local de 7 dias após login, sem prorrogação silenciosa |
| revision | bigint para compare-and-swap |
| refresh_lease_owner / refresh_lease_expires_at | controle de uma renovação por sessão |
| created_at / updated_at / revoked_at | timestamptz, revogação nullable |

Cookie contém apenas 32 bytes aleatórios em base64url. Chaves de criptografia/binding são derivadas com contextos separados de APP_SECURITY_KEY; o segredo mestre não é salvo no banco nem no frontend.

Renovar somente perto da expiração do access token. Claim de lease de 30s é commitado antes de chamada Auth com timeout de 10s; persistir tokens exige lease_owner e revision esperados. Quem perde lease não grava. Não manter transação aberta durante rede. Falha entre rotação externa e persistência pode exigir login novamente; não há promessa de atomicidade entre Auth e banco.

Sessão existente não substitui getUser na autorização. Revogação local invalida cookie/registro e solicita signOut local ao Auth, sem encerrar outros dispositivos.

### app_private.onboarding_operations

user_id uuid, mutation_id uuid, operation initialize/correct/finalize, request_hash do payload canônico completo, applied_at timestamptz. PK(user_id, mutation_id). Inclui nome, categorias, termos e marketing nas correções, não apenas o hash do evento promocional. Corpo vazio de finalização também tem fingerprint definido. O bootstrap usa o id da intenção como chave inicial; retomadas usam a chave da nova ação autenticada.

Receipt é gravado na mesma transação dos efeitos. Mesma chave/payload retorna estado corrente sem reaplicar; mesmo id com payload diferente retorna 409, inclusive se somente nome/interesses mudaram. Consulta de receipt precede a rejeição de etapa já concluída.

### app_private.avatar_operations

user_id uuid, mutation_id uuid, operation_kind upload/waive, request_hash sha256, claimed_photo_revision bigint, raw_digest/output_digest sha256 nullable, object_path text nullable, state pending/uploaded/associated/waived/superseded, created_at, updated_at. PK(user_id, mutation_id), compartilhada por upload e dispensa: usar a mesma chave em PUT e DELETE retorna conflito. O fingerprint inclui operation_kind e digest dos bytes para upload; waive usa payload canônico sem bytes. Campos binários/caminho são nulos em waive; upload exige raw_digest e caminho gerado.

Arquivo original não é armazenado nessa tabela. A associação ao perfil só ocorre depois de upload confirmado. Se Storage persistiu e a associação falhou, retomar consulta/reutiliza o objeto da mesma operação, conferindo digest. Não considerar qualquer objeto preexistente uma confirmação.

Claim de nova operação bloqueia intenção/perfil, verifica onboarding aberto e incrementa photo_revision/latest_photo_mutation_id. A rede ocorre sem lock aberto. O commit de associação relê sob lock e exige a revisão/id reivindicados e onboarding ainda aberto. Se DELETE ou outra operação mais recente venceu, o upload antigo fica superseded: não associa, não reabre conclusão e retorna estado corrente. Dispensa atualiza foto/estado/revisão na mesma transação. Blob órfão pode ser limpo depois, sem remover objeto vigente.

## Transações e invariantes

### Vínculo na criação de identidade

1. API valida e cria/obtém intenção; claim curto confirma lease antes de chamar Auth.
2. signUp recebe somente id/prova de registro em metadata, além da credencial transitória.
3. Trigger de INSERT valida intenção existente, prazo, prova, e-mail canônico e ausência de vínculo conflitante; bloqueia a linha e vincula NEW.id.
4. Falha do trigger reverte a inserção Auth. Não executar inicialização completa, Storage ou rede no trigger.
5. Retorno Auth sem erro e sem vínculo não comprova criação: orientar acesso/recuperação de forma neutra, sem aplicar snapshot.
6. Timeout conserva unknown. Consultar vínculo antes de retry explícito; mesma intenção e snapshot, nunca nova intenção por retry. Identidade bound nunca chama signUp novamente.

### initialize_consumer_onboarding

RPC restrita ao servidor. Inicialmente aceita somente vínculo recém-criado pela execução de cadastro; em retomada exige sujeito autenticado igual a user_id. Bloqueia intenção/perfil, valida categorias/limites e salva perfil, interesses, preferência e evento inicial numa transação. Marca data_state=saved no mesmo commit.

Se qualquer validação falhar, nenhuma parte dos dados de negócio é confirmada. Identidade Auth pode continuar existente, com data_state=pending. Correções autenticadas são aplicadas apenas antes da primeira gravação bem-sucedida; não sobrescrevem dados já salvos. O snapshot original fica congelado para reconhecer o replay; correções explícitas são payload de uma nova operação autorizada, sem reutilizar chave com conteúdo diferente.

### set_marketing_preference

API deriva usuário da sessão. RPC bloqueia a preferência, valida aviso e mutation_id, inclui evento e atualiza projeção/revisão no mesmo commit. Replay da mesma chave/payload não reaplica a escolha e retorna a projeção atual. Mesma chave/outro payload retorna 409.

Exemplo: A autorizou, B revogou e A foi repetida. Resultado continua false; receipt de A indica replay e o valor corrente corresponde a B.

### Foto e conclusão

PUT autenticado → validar bytes/decodificar → registrar operação → upload privado → transação associa caminho e photo_state=saved. DELETE autenticado de foto pendente ou escolhida no onboarding marca waived, sem recriar conta. Operações de foto só são aceitas enquanto o onboarding não está concluído.

Concluir exige identidade confirmada, sessão válida, data_state=saved e photo_state em not_requested/saved/waived. POST de conclusão ou operação final de foto grava onboarding_completed_at. **completed** exige esse campo não nulo. Se os demais requisitos estiverem atendidos mas ainda não houve o commit final, usar ready_to_complete com ação finalize_onboarding. GETs retornam estados e não finalizam negócio.

## Estados observáveis

| Condição interna | status | pendingActions possíveis |
| --- | --- | --- |
| Rejeição certa antes da identidade | not_created | correct_data |
| Auth em voo ou resposta sem certeza | processing / unknown | check_status |
| Vínculo e dados pendentes | incomplete | authenticate, confirm_email, complete_profile |
| Dados salvos e foto pendente | photo_pending | confirm_email, authenticate, upload_photo, skip_photo |
| Dados/foto resolvidos, e-mail pendente | awaiting_email_confirmation | confirm_email |
| Dados/foto resolvidos, sem sessão | awaiting_authentication | authenticate |
| Dados/foto resolvidos e sessão confirmada, sem commit final | ready_to_complete | finalize_onboarding |
| Tudo resolvido, sessão confirmada e onboarding_completed_at preenchido | completed | nenhum |

pendingActions representa todas as pendências simultâneas. status é um resumo; a interface não deve descartar as demais. preferredNextAction deve priorizar confirmar/autenticar antes de ler ou gravar dados privados.

## Limites da foto

Entrada JPEG/PNG/WebP, até 5.242.880 bytes e 25.000.000 pixels. Sharp com failOn=warning e proteções habilitadas verifica formato real e decodifica ao gerar saída. Primeiro quadro de WebP animado, orientação EXIF aplicada, saída estática WebP de até 512×512 sem ampliar e sem metadados.

Bucket privado consumer-avatars, sem leitura/listagem pública ou upload direto pelo cliente. Foto é baixada pela API após autorização do proprietário. Objetos antigos/orfãos só podem ser removidos após confirmar que nenhum perfil/operação retomável os referencia; manutenção não remove foto vigente.
