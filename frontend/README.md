# Hackarum-Yvisalro — frontend

Base React com Vite e JavaScript/JSX. A página inicial apresenta a proposta do produto
e consulta o estado da WebAPI. Catálogo, login, desejos, painel empresarial e mapa
ainda não foram implementados. Esta página não entrega as landing pages pendentes.

## Arquitetura MVVM

- **View:** `features/home/views/HomeView.jsx` apresenta a interface.
- **ViewModel:** `features/home/viewmodels/useHomeViewModel.js` controla carregamento,
  sucesso, falha, cancelamento e nova tentativa.
- **Model:** `features/home/models/system-status.js` representa a resposta consumida.
- **Repository:** `features/home/repositories/system.repository.js` obtém e converte dados.
- **Serviço:** `shared/services/http-client.js` concentra a comunicação HTTP.
- **Composição:** `app/App.jsx`; elementos compartilhados em `shared/components`.

As próximas funcionalidades podem seguir a mesma organização em `features/`. A View
não deve consultar Supabase nem conter regras de acesso aos dados de empresas.

## Execução

Na raiz do repositório, com Node.js 24 LTS:

```sh
npm install
npm run dev:frontend
npm run build --workspace frontend
npm run preview:frontend
```

Desenvolvimento em `http://localhost:5173`; prévia do build em `http://localhost:4173`.
Inicie também a WebAPI para a consulta de estado. O [guia de desenvolvimento](../docs/desenvolvimento.md)
explica execução conjunta e Node.js portátil no Windows.

## Ambiente

`.env` é opcional. O padrão `/api/v1` é encaminhado pelo proxy do Vite à porta 3000.
Para mudar o destino local, copie `.env.example` para `.env` e ajuste `API_PROXY_TARGET`.
Em um build publicado ou no modo preview, o proxy de desenvolvimento não existe:
configure `VITE_API_BASE_URL` com a URL da WebAPI antes de gerar o build, ou providencie
um proxy `/api` na hospedagem. Libere a origem correspondente no backend.

Variáveis `VITE_` são públicas no navegador e não devem conter segredos.
Testes não fazem parte do fluxo deste recorte, conforme a constituição.
