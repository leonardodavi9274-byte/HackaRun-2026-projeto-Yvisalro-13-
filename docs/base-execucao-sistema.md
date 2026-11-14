# Base de execução e publicação do sistema

**Estado: planejamento para a entrega final, ainda não publicado.** Esta base registra a decisão de disponibilizar a aplicação em um endereço web acessível de diferentes computadores e de conectar a API ao projeto Supabase hospedado. O fornecedor de hospedagem, o domínio, os ambientes e os responsáveis pela operação ainda serão definidos. Nenhuma configuração ou publicação é comprovada por este documento.

## Como o sistema deverá funcionar

```text
Computador, celular ou outro dispositivo
             │ HTTPS
             ▼
  Endereço público único da aplicação
     ├── Frontend React
     └── /api → backend Node.js
                    │ HTTPS
                    ▼
        Supabase hospedado: Auth e PostgreSQL
```

O usuário acessa o mesmo endereço público pelo navegador; não precisa instalar o repositório nem configurar o Supabase no dispositivo. A API executa no servidor, consulta o Supabase e aplica as regras de identidade e autorização. A disponibilidade depende de conexão com a internet, dos serviços de hospedagem e do Supabase; esta arquitetura não promete funcionamento offline ou disponibilidade contínua.

### Uma origem para navegador e API

Na publicação, servir o frontend e encaminhar `/api` ao backend sob a mesma origem HTTPS, por meio do recurso de proxy da hospedagem ou de um proxy reverso. A origem é a combinação de protocolo, domínio e porta. Por exemplo, `https://sistema.exemplo` e `https://sistema.exemplo/api` são da mesma origem; o endereço é ilustrativo, não um domínio contratado.

O cliente atual usa `VITE_API_BASE_URL=/api/v1` e `credentials: "same-origin"`. A sessão web usa cookie `HttpOnly`, `SameSite=Lax` e caminho `/api/v1`; em produção, o cookie é `Secure`. O backend exige que `Origin` corresponda a `FRONTEND_ORIGIN` e que operações de escrita apresentem o cabeçalho da aplicação. Portanto, só informar uma URL absoluta de outra origem ou configurar CORS não faz o navegador enviar os cookies da sessão com a implementação atual. Uma arquitetura com origens distintas depende de projeto e adaptação explícitos de cookies, credenciais, CORS e proteção contra requisições indevidas.

O proxy do Vite existe no desenvolvimento, não é uma configuração de publicação. `localhost` e `127.0.0.1` designam a própria máquina e não são endereços públicos para outros dispositivos. Definir `HOST` e `PORT` de acordo com a rede interna da hospedagem; quando frontend e API estiverem em contêineres separados, `127.0.0.1` dentro de um deles não identifica automaticamente o outro. O proxy deve encaminhar o prefixo `/api` e preservar os cabeçalhos necessários à origem e ao cookie. O backend não deve expor credenciais ao navegador.

## Configuração do ambiente publicado

Registrar as variáveis no armazenamento seguro da hospedagem, sem adicionar valores ao repositório, a imagens públicas ou a documentação compartilhada:

| Variável ou configuração | Finalidade |
| --- | --- |
| `NODE_ENV=production`, `HOST` e `PORT` | Ativar o comportamento de produção e permitir que a hospedagem alcance a API na interface e porta previstas. |
| `APP_ORIGIN` e `FRONTEND_ORIGIN` | Informar a origem HTTPS pública real; o backend usa essas informações para links, cookies e verificação de origem. |
| `SUPABASE_URL` | URL HTTPS do projeto Supabase correspondente ao ambiente. |
| `SUPABASE_SECRET_KEY` | Chave secreta atual do projeto, disponível somente ao backend. Ela é privilegiada e permite acesso amplo aos dados. |
| `SUPABASE_PUBLISHABLE_KEY` | Chave publicável do mesmo projeto, necessária ao adaptador de identidade existente. Mesmo sendo publicável, ela não autoriza acesso irrestrito aos dados. |
| `APP_SECURITY_KEY` | Chave aleatória de 32 bytes codificados em base64 para proteger dados de sessão no backend. Deve ser estável e compartilhada com segurança entre instâncias do mesmo ambiente; uma troca sem estratégia de rotação pode invalidar sessões existentes. Não reutilizar a chave de outro ambiente. |
| `TERMS_URL` e `PRIVACY_URL` | Destinos reais dos documentos exigidos pelo cadastro. |
| `VITE_API_BASE_URL=/api/v1` | Caminho da API no frontend para a origem pública única. Valores `VITE_` são incluídos no frontend durante o build e nunca devem conter segredos. |

No Supabase Auth, definir a Site URL e os endereços de retorno permitidos para o domínio real. Configurar SMTP e modelos para mensagens transacionais, e preparar as credenciais e os retornos de Google e Apple somente quando os fluxos e suas dependências de segurança estiverem resolvidos. A API deve confirmar resultados antes de anunciar login, salvamento ou envio. Publicidade e campanhas permanecem sujeitas às decisões próprias do produto.

O projeto usa migrações versionadas em `backend/supabase/migrations/`. Antes da publicação, planejar sua aplicação ao ambiente correto, com permissões e dados adequados, preservando a separação entre desenvolvimento e produção. Definir uma estratégia de backup e recuperação para dados e configurações. Os bloqueios B1–B3 do [plano 007](../specs/007-autenticacao-supabase/plan.md) continuam condicionando os fluxos afetados.

**Chave exposta**: uma chave administrativa legada foi compartilhada anteriormente na conversa e deve ser tratada como comprometida. Antes de conectar o sistema com credenciais reais, substituí-la e desativá-la, incluindo o tratamento do segredo JWT legado conforme o [procedimento oficial](https://supabase.com/docs/guides/security/rotate-leaked-api-keys). Não incluir a chave antiga ou a nova em arquivos versionados nem em conversas.

## Uso pela equipe em computadores de desenvolvimento

Cada integrante pode clonar o repositório, instalar a versão de Node indicada pelo projeto e executar o frontend e a API localmente conforme [desenvolvimento.md](desenvolvimento.md). Copiar os arquivos `.env.example` para arquivos `.env` locais e preencher a configuração do ambiente de desenvolvimento por um canal autorizado; não versionar esses arquivos. Os valores `localhost` funcionam na própria máquina. Um projeto Supabase separado para desenvolvimento é a opção recomendada para não misturar dados de demonstração com produção; a criação desse ambiente ainda depende da equipe.

Cada backend local precisa de sua própria configuração protegida. Se várias instâncias do mesmo backend compartilharem sessões, precisam de uma estratégia comum e segura para `APP_SECURITY_KEY`; máquinas independentes não devem receber segredos de produção sem necessidade. Configurar os endereços de retorno locais no Supabase do ambiente correspondente e utilizar a mesma origem no navegador e nos links de confirmação. O arquivo de exemplo e o guia não contêm credenciais reais.

## Pendências para a entrega final

1. Escolher a hospedagem do frontend e da API, o domínio HTTPS, a configuração de proxy, os responsáveis e os ambientes de desenvolvimento e produção.
2. Substituir a chave administrativa exposta, configurar segredos no servidor, migrações, permissões e armazenamento sem registrá-los no código.
3. Configurar as origens exatas do backend e do Supabase Auth, assim como SMTP e provedores sociais conforme a implementação aprovada.
4. Resolver os bloqueios de autenticação da feature 007 antes de habilitar recuperação e login social. Documentar, na entrega, quais fluxos e serviços foram efetivamente configurados.
5. Preparar backup, recuperação e informações de operação; registrar URL publicada, versão implantada, limitações conhecidas e estado das integrações. A política atual da equipe é de fluxo sem testes obrigatórios; este documento não afirma execução funcional nem cria uma etapa de testes.
