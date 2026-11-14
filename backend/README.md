# Hackarum-Yvisalro — WebAPI

Base HTTP/JSON em Node.js, TypeScript e Express 5. Rotas disponíveis:

| Método | Caminho | Finalidade |
| --- | --- | --- |
| GET | `/api/v1` | Identificação da API. |
| GET | `/api/v1/health` | Estado do processo e presença de configuração do banco. |
| GET | `/health` | Alias de saúde. |

O envelope de sucesso é `{ "data": ... }`; erros usam
`{ "error": { "code", "message", "requestId" } }`. A saúde não consulta o banco e não
comprova autenticação ou conectividade com Supabase.

## Arquitetura

`presentation/http` recebe as requisições, define rotas e controllers e traduz erros.
`application/services` contém casos de uso; `domain` contém modelos independentes de
Express. `infrastructure/supabase` concentra a integração externa. `config` lê e valida
o ambiente. `app.ts` compõe os objetos e `server.ts` inicia o processo.

O middleware `requireAuth` valida uma sessão com Supabase quando aplicado a uma rota.
As rotas iniciais são públicas. Ainda não existem operações de negócio ou autorização
por empresa; futuros endpoints restritos precisam de ambas as proteções.

## Execução

Na raiz do repositório, com Node.js 24 LTS:

```sh
npm install
npm run dev:backend
npm run build --workspace backend
npm run start:backend
```

O modo desenvolvimento recarrega o servidor quando o código muda. O comando `start`
depende do build e não deve disputar a porta com o modo desenvolvimento.
O Node.js 24 executa os arquivos TypeScript diretamente em desenvolvimento, usando
apenas sintaxe removível. O build com `tsc` confere os tipos e reescreve os imports
relativos de `.ts` para `.js` em `dist/`.
Veja também o [guia de desenvolvimento](../docs/desenvolvimento.md).

## Ambiente

O arquivo `.env` é opcional: sem ele a API inicia em `127.0.0.1:3000`. Para configurar,
copie `.env.example` para `.env` dentro desta pasta e preencha as variáveis necessárias.
As variáveis `SUPABASE_URL` e `SUPABASE_SECRET_KEY` devem ser fornecidas juntas.
A chave permanece no backend; nunca use prefixo `VITE_` para uma chave privilegiada.

Testes não fazem parte do fluxo deste recorte, conforme a constituição.
