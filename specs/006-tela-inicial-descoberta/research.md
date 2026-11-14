# Research: Tela inicial e descoberta

**Data:** 2026-11-14. Decisões resolvidas para [spec](spec.md).

| Lacuna | Decisão |
| --- | --- |
| Origem do conteúdo | Catálogo persistido no Supabase; seed fictício explícito até haver painel de catálogo. Confirmado pelo usuário em 2026-11-14. |
| Acesso | Leitura pública de conteúdo publicado e vigente por RLS; sem sessão obrigatória. |
| Chave Supabase | Backend usa publishable key em cliente anônimo sem sessão. Nunca usar chave secret/service_role neste leitor. |
| Taxonomia | catalog_categories separada de interest_categories e preferências privadas. |
| Falha parcial | Um GET agregado reúne consultas independentes e devolve estado por seção; se todas falharem, 503 retryable. |
| Navegação | /inicio público. Busca/categoria emitem intents a alinhar com a feature 005 quando ela chegar ao repositório. Story e oferta podem abrir detalhe local. |
| Dependências | Reutilizar React/JSX, Express/TS, Supabase JS, HTTP client e History API já fixados. Sem dependência nova. |

## D1 — Reutilizar a base e versões fixadas

**Decision:** manter React 19.3.1/JSX, Node 24.22.3, TypeScript 7.0.2, Express 5.3.0 e Supabase JS 2.119.0.

**Rationale:** são as versões nos manifests atuais e nas features 003/004. Nenhuma necessidade justifica framework, roteador ou biblioteca de carrossel.

**Alternatives considered:** dependência de roteador/carrossel. Rejeitada; a navegação de History API e controles nativos atendem o contrato com menor superfície.

## D2 — Leitura pública com RLS

**Decision:** navegador chama somente GET /api/v1/home. Backend usa cliente Supabase separado com publishable key, sem sessão, e papel anon. RLS permite SELECT apenas de conteúdo público. Chave secret/service_role não é usada neste caso.

**Rationale:** mantém operações de negócio atrás da API e faz o banco aplicar a restrição. Supabase documenta que chaves secret/service_role ignoram RLS e devem ficar no servidor; publishable key pode ser usada com RLS e privilégios mínimos. [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Securing your data](https://supabase.com/docs/guides/database/secure-data).

**Alternatives considered:** cliente privilegiado com filtragem apenas no controller, rejeitado porque contorna RLS; Data API direto no navegador, rejeitado porque contraria a arquitetura de cliente comum via WebAPI.

## D3 — Esquema do catálogo separado

**Decision:** criar shopping_centers, stores, catalog_categories, catalog_products, catalog_offers, promo_stories, home_carousels e home_carousel_items. Não reutilizar tabelas de interesses.

**Rationale:** preferências são privadas e não representam publicação comercial. Separar produto de oferta permite preço/disponibilidade por loja, como prevê a especificação funcional geral.

## D4 — Dados fictícios persistidos

**Decision:** seed isolado com shopping/lojas/produtos/ofertas/stories/carrosséis fictícios e is_demo=true. Selo demonstrativo acompanha cada conteúdo. Sem dados embutidos no React e sem escrita pública.

**Rationale:** o catálogo e o painel ainda não existem. O seed permite apresentar o fluxo solicitado preservando a decisão de persistência e a transparência sobre demonstrações.

## D5 — Agregado com falhas por seção

**Decision:** consultas independentes para categorias, stories, ofertas e carrosséis. Cada seção retorna ready, empty ou unavailable. HTTP 200 se alguma consulta completar; 503 se todas falharem. Retry refaz o agregado.

**Rationale:** atende aos estados da spec com uma chamada do cliente e uma rota pequena. Supabase JS suporta select e filtros no servidor. [Select](https://supabase.com/docs/reference/javascript/select), [Filters](https://supabase.com/docs/reference/javascript/using-filters).

## D6 — Acesso sem autenticação e destinos

**Decision:** preservar / para a landing informativa e tornar /inicio público. Falha ao consultar sessão não bloqueia a tela. Preferências da sessão são opcionais. Busca/categoria usam intents; seu mapeamento final alinha-se à feature 005 ainda ausente.

**Rationale:** a decisão do usuário permite explorar sem conta, enquanto a feature 005 está sendo desenvolvida fora da cópia atual.

## D7 — Integridade dos dados visíveis

**Decision:** filtrar somente conteúdo publicado e vigente, serializar datas em ISO 8601 UTC e preços em centavos inteiros BRL. Mostrar preço anterior/desconto apenas se houver valor anterior maior que o atual. Erros SQL não são expostos.

**Rationale:** dá comparações determinísticas e evita afirmar validade/estoque sem registro correspondente.

## D8 — Reconciliação com a feature 005 (2026-11-14)

**Decision:** a feature 005 (mapa e rotas, PR #6) chegou à main com public.malls e public.stores. O catálogo da 006 passa a referenciar essas tabelas em vez de criar shopping_centers/stores próprias; a migração foi renumerada para 0017 e, após a chegada da feature 008 (que usa 0017/0018), para 0019. O shopping da tela inicial é o shopping ativo de malls. A 0019 libera ao papel anon somente colunas de identificação de malls/stores sob RLS; mall_maps segue restrito.

**Rationale:** as duas migrações criavam public.stores com esquemas incompatíveis e não podiam ser aplicadas juntas. Uma única tabela de lojas mantém a oferta ligada à loja do mapa, permitindo "ver no mapa" (/mapa?loja=…).

**Consequências:** floorLabel fica nulo, pois o piso está no documento do mapa, não exposto ao leitor público; a interface o omite. As entidades ShoppingCenter/Store do data-model.md passam a ser as de specs/005-mapa-rota-lojas/data-model.md. A feature 005 é o mapa; os resultados de busca continuam sem feature definida, e /buscar segue como ponto de passagem.
