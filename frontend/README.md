# Hackarum-Yvisalro — frontend

React/Vite em JavaScript/JSX com MVVM. O código implementa cadastro em dois passos conforme as telas 02/03, interesses, autorização promocional, confirmação, entrada mínima, retomada e foto opcional. As operações usam retornos reais da WebAPI; falta configurar o Supabase para operar o fluxo completo.

## Rotas

| Caminho | Interface |
| --- | --- |
| / | Página de apresentação da base e estado do serviço |
| /entrar | E-mail/senha e acesso ao cadastro |
| /cadastro | Nome, e-mail, senha e prévia da foto opcional |
| /cadastro/preferencias | Categorias, termos, publicidade e Concluir/Pular |
| /cadastro/confirmar | Confirmação, estado e retomada de pendências |
| /inicio | Conta, categorias e interesses salvos |
| /perfil/preferencias | Ativação/revogação da publicidade |

Catálogo, recomendações, Desejos, alertas, empresas, mapa, login social e recuperação completa não foram implementados neste recorte.

## Organização

features/registration, features/session, features/account-preferences e features/home mantêm Views, ViewModels, Models e Repositories. shared/services/http-client.js trata HTTP e erros. App.jsx e navigation.js compõem navegação e guardas.

A View não chama Supabase. Rascunho, senha, File e TokenHash ficam somente em memória, sem localStorage/sessionStorage/URL persistente. O cookie de sessão é HttpOnly; não há SDK Auth, JWT ou chaves de serviço no navegador.

Continuar do passo 1 não cria identidade. Pular registra interesses vazios/publicidade false e mantém a foto quando solicitada. A imagem só é enviada após autenticação; recarga/outro dispositivo pede selecionar novamente ou dispensar. Respostas incertas não são tratadas como sucesso.

## Executar

Na raiz:

~~~sh
npm ci
npm run dev
npm run build
~~~

Abrir http://127.0.0.1:5173/cadastro. O proxy /api segue para 127.0.0.1:3000; usar o mesmo hostname do link de confirmação. O modo preview atual não inclui esse proxy: para usar o build autenticado, fornecer proxy HTTPS de mesma origem, sem simplesmente apontar a API para outra origem.

Variáveis: VITE_API_BASE_URL=/api/v1 e API_PROXY_TARGET=http://127.0.0.1:3000. Nenhum segredo fica no frontend.

Veja [execução e configuração](../specs/004-cadastro-preferencias/quickstart.md) e [contrato de telas](../specs/004-cadastro-preferencias/contracts/ui.md). Build de frontend concluído em 2026-11-14; cenários funcionais não foram executados, conforme a política sem testes.
