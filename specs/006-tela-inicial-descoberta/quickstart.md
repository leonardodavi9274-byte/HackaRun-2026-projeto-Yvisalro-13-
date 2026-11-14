# Quickstart: Tela inicial e descoberta

Guia de preparação para futura conferência manual. Não é suíte de testes nem registro de execução; o projeto não exige testes como etapa.

## Pré-requisitos

- Node.js 24.22.3 e npm.
- Projeto Supabase de desenvolvimento adequado para aplicar migração/seed.
- URL e publishable key configuradas no backend; segredo privilegiado nunca vai ao frontend.
- Conteúdo do seed é fictício; não importar dados reais para demonstração.

## Supabase de desenvolvimento

1. Confirmar que o ambiente é o projeto de desenvolvimento pretendido.
2. Aplicar backend/supabase/migrations/0015_home_catalog.sql após as migrações existentes.
3. Aplicar backend/supabase/seed/home-demo.sql uma vez para criar shopping e conteúdo demo.
4. Conferir RLS em todas as tabelas e ausência de DML público.
5. Configurar variáveis locais sem registrar segredos no Git. O leitor usa publishable key.
6. Sem schema/chave/conexão, a UI comunica indisponibilidade, sem fallback embutido.

Não aplicar migração ou seed em produção ou banco compartilhado sem confirmar o ambiente pelo processo de operação do projeto.

## Iniciar localmente

~~~powershell
npm ci
npm run build
npm run dev
~~~

Abrir http://127.0.0.1:5173/inicio. A landing continua em /. API local usa porta 3000; frontend usa proxy existente. Seguir docs/desenvolvimento.md se usar a cópia portátil de Node.

## Conferência manual futura (não executada)

- Visitante abre /inicio sem redirecionar a /entrar.
- Busca e categoria preservam intents até o destino combinado com a feature 005.
- Stories/ofertas demo mostram selo; diálogos fecham e devolvem foco.
- Estado vazio, erro parcial, falha total e retry não substituem conteúdo real por fixture de memória.
- Sem preço anterior/validade/imagem, UI omite informação sem inventá-la.
- Teclado e leitor de tela alcançam controles; layout funciona de 360 a 1440 px.
- Inspecionar frontend/build para confirmar que nenhuma chave privilegiada foi incluída.

Retornos acima são expectativas para uma futura conferência; nenhum foi observado neste planejamento.
