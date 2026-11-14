# Plano técnico: base do frontend e da WebAPI

**Data:** 2026-11-13  
**Constituição:** 1.0.0  
**Especificação:** [spec.md](spec.md)

## Decisões de implementação

- **Node.js 24 LTS e npm workspaces:** uma instalação e um lockfile; cada aplicação
  mantém seu manifest, seus comandos e seu build. A versão local está em `.node-version`.
- **React com Vite e JavaScript/JSX:** o Vite fornece desenvolvimento e build da interface.
  TypeScript no frontend permanece proposta na constituição, portanto não foi adotado.
- **Express 5 com TypeScript:** fornece a WebAPI por HTTP/JSON, mantendo os controllers
  separados dos serviços. TypeScript compila o backend para JavaScript ESM em `dist/`.
  O desenvolvimento usa execução TypeScript nativa do Node.js 24 e seu modo watch;
  `erasableSyntaxOnly` limita a sintaxe àquela suportada por esse modo. Imports `.ts`
  são reescritos para `.js` pelo compilador no build.
- **Supabase JS:** adaptador de infraestrutura, criado sob demanda e somente no servidor.
  Sem credenciais, a base inicia normalmente. A saúde indica configuração, não conectividade.
- **CORS e Helmet:** limitam as origens de navegador e configuram cabeçalhos HTTP.
  São middleware de transporte; não substituem autenticação e autorização.
- **concurrently:** inicia os dois scripts de desenvolvimento em um terminal e encerra
  o outro processo se um deles terminar. Evita manter um supervisor próprio.
- **Execução local:** host `127.0.0.1`; frontend 5173, backend 3000. Sem hospedagem definida.
  Dependências têm versões exatas nos manifests e resolução completa no lockfile.

## Estrutura

```text
frontend/src/
  app/                      composição da aplicação
  features/home/
    models/                 representação dos dados da tela
    views/                  componentes de apresentação
    viewmodels/             estado e ações em hooks React
    repositories/           obtenção e conversão dos dados
  shared/components/        elementos visuais compartilhados
  shared/services/          cliente HTTP
  styles/                   estilos e tokens visuais

backend/src/
  config/                   configuração de ambiente validada
  domain/                   modelos independentes do transporte
  application/services/     casos de uso e regras da aplicação
  infrastructure/supabase/  integração externa de dados e identidade
  presentation/http/
    controllers/            tradução entre HTTP e serviços
    routes/                 definição das rotas
    middlewares/            autenticação, falhas e recursos ausentes
    errors/                 erros de transporte
  app.ts                    composição das dependências
  server.ts                 inicialização e encerramento do servidor
```

Não há repositório genérico ou CRUD vazio no backend: interfaces de persistência devem
ser acrescentadas junto ao primeiro caso de uso que realmente acesse dados.

## Contrato inicial

- `GET /api/v1`: identificação da API e endereço de saúde.
- `GET /api/v1/health` e `GET /health`: `{ data: SystemStatus }`.
- Sucesso: `{ data: ... }`; falha: `{ error: { code, message, requestId } }`.
- `database.configured` informa se URL e chave foram fornecidas.
  `database.connection` permanece `not_checked`: não existe consulta ao banco neste recorte.
- Rotas disponíveis são públicas e não manipulam dados de usuários. O middleware
  `requireAuth` fica preparado para futuras rotas; autorização por empresa segue pendente.

## Conformidade e conclusão

Preservar as tecnologias confirmadas, os protótipos existentes e os limites da vitrine.
Manter credenciais no backend e fora do Git. Não introduzir testes como etapa do fluxo.
Conferir os builds e os registros de inicialização, distinguindo execução local de
integração real com Supabase e de implementação das funcionalidades futuras.
