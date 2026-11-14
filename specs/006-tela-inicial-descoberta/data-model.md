# Data Model: Tela inicial e descoberta

Escopo: leitura pública agregada para a tela inicial. O catálogo é separado das preferências dos consumidores. Todas as tabelas expostas ao Data API têm RLS.

## Entidades persistidas

### ShoppingCenter
- id: UUID PK.
- name: obrigatório, 1–120 caracteres.
- active e is_demo: booleanos não nulos.
- is_home_default: booleano; no máximo um shopping padrão ativo.
- created_at, updated_at: timestamps UTC do banco.

### Store
- id UUID PK; shopping_center_id FK obrigatória.
- name obrigatório 1–120; floor_label opcional até 40 caracteres.
- active e is_demo; datas de criação/atualização UTC.
- Loja demonstrativa deve pertencer a shopping demonstrativo.

### CatalogCategory
- id: slug estável PK até 50 caracteres.
- label: obrigatório até 60; sort_order inteiro positivo único.
- active e is_demo booleanos.
- Não é a tabela interest_categories. A API inclui somente categoria com produto publicável e oferta visível.

### CatalogProduct
- id UUID PK; category_id FK obrigatória.
- name obrigatório 1–160; description opcional até 1000.
- image_path opcional; image_alt obrigatório até 250 quando imagem existir.
- status: draft, published ou archived; is_demo booleano; datas UTC.

### CatalogOffer
- id UUID PK; product_id e store_id FKs obrigatórias.
- price_cents inteiro positivo; currency BRL.
- previous_price_cents opcional e maior que price_cents.
- stock_status: in_stock, out_of_stock ou unknown.
- starts_at/ends_at opcionais; se ambos existem, fim posterior ao início.
- status draft/published/archived; home_rank opcional positivo; last_updated_at obrigatório; is_demo booleano.
- Oferta ativa requer publicação, janela vigente, produto publicado, loja e shopping ativos. Datas opcionais não viram prazos inventados.

### PromoStory
- id UUID PK; store_id FK obrigatória; offer_id FK opcional da mesma loja.
- title obrigatório 1–100; image_path e image_alt obrigatórios (alt até 250).
- starts_at/ends_at obrigatórios, janela finita e fim posterior ao início.
- status draft/published/archived; sort_order não negativo; is_demo booleano coerente com relações.
- Story ativo requer janela vigente e loja ativa; oferta associada precisa estar ativa.

### HomeCarousel e HomeCarouselItem
- HomeCarousel: id UUID, title 1–80, active, sort_order positivo, is_demo e timestamps.
- Item: carousel_id, product_id, position positiva única por carrossel; offer_id opcional do produto/loja.
- Limitar a seis seções e dez itens por seção. Nunca repetir produto para preencher espaço.

## HomeResponse transitório

- generatedAt ISO 8601 UTC e shopping (id, name, isDemo).
- sections.categories, stories, featuredOffers e carousels; cada uma inclui status ready/empty/unavailable e items como array.
- Oferta inclui ids, produto, loja, preço em centavos, currency, previousPriceCents opcional, stockStatus, validUntil opcional, lastUpdatedAt e isDemo.
- Story inclui id, título, imagem/alt, loja, oferta opcional, validUntil e isDemo.
- Carrossel inclui id, título, produtos e origem editorial; imagens/alt são opcionais como par.
- Não há dados pessoais, e-mail, preferências ou sessão no agregado público.

## Integridade e segurança

- Ativar RLS em cada tabela; SELECT anon/authenticated somente para conteúdo público ativo/publicado e vigente. Sem DML para os papéis públicos.
- Repositório backend usa publishable key sem sessão. Não usa cliente privilegiado nem service_role para a leitura.
- Índices por status, categoria, loja/produto, validade, posição e ordem de exibição.
- Seed separado da migração estrutural, transacional, marcado is_demo=true e removível sem descartar schema.
- Painel e operações de escrita estão fora deste modelo.

## Rastreabilidade

FR-001/009: resposta não exige sessão. FR-002/003: categorias e busca são alimentadas pelo catálogo. FR-004–008/011: oferta, produto, loja, story, estado e validade. FR-006: is_demo. FR-010: estado por seção. FR-012: alt e interação acessível. FR-013: navegação existente.
