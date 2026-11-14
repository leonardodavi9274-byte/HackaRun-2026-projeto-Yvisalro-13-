-- Catálogo público somente leitura da tela inicial (feature 006).
-- Reutiliza public.malls e public.stores da feature 005 (0015): o shopping da tela inicial é o
-- shopping ativo. Escrita fica para o painel empresarial futuro; anon/authenticated recebem
-- apenas SELECT filtrado por RLS. Aplicar após 0015 e 0016.
begin;

create type public.catalog_status as enum ('draft','published','archived');
create type public.catalog_stock_status as enum ('in_stock','out_of_stock','unknown');

create table public.catalog_categories(
 id text primary key check(id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id)<=50),
 label text not null check(char_length(label) between 1 and 60),
 sort_order smallint not null unique check(sort_order>0),
 active boolean not null default true,
 is_demo boolean not null default false
);

create table public.catalog_products(
 id uuid primary key default gen_random_uuid(),
 category_id text not null references public.catalog_categories,
 name text not null check(char_length(name) between 1 and 160),
 description text check(description is null or char_length(description) between 1 and 1000),
 image_path text check(image_path is null or char_length(image_path) between 1 and 500),
 image_alt text check(image_alt is null or char_length(image_alt) between 1 and 250),
 status public.catalog_status not null default 'draft',
 is_demo boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check((image_path is null)=(image_alt is null))
);

create table public.catalog_offers(
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.catalog_products on delete cascade,
 store_id text not null references public.stores on delete cascade,
 price_cents integer not null check(price_cents>0),
 currency text not null default 'BRL' check(currency='BRL'),
 previous_price_cents integer check(previous_price_cents is null or previous_price_cents>price_cents),
 stock_status public.catalog_stock_status not null default 'unknown',
 starts_at timestamptz,
 ends_at timestamptz,
 status public.catalog_status not null default 'draft',
 home_rank smallint check(home_rank is null or home_rank>0),
 last_updated_at timestamptz not null default now(),
 is_demo boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(starts_at is null or ends_at is null or ends_at>starts_at),
 -- Alvos das FKs compostas de stories e carrosséis.
 unique(id,store_id),
 unique(id,product_id)
);

create table public.promo_stories(
 id uuid primary key default gen_random_uuid(),
 store_id text not null references public.stores on delete cascade,
 offer_id uuid,
 title text not null check(char_length(title) between 1 and 100),
 image_path text not null check(char_length(image_path) between 1 and 500),
 image_alt text not null check(char_length(image_alt) between 1 and 250),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status public.catalog_status not null default 'draft',
 sort_order smallint not null default 0 check(sort_order>=0),
 is_demo boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(ends_at>starts_at),
 -- A oferta vinculada precisa ser da mesma loja do story.
 foreign key(offer_id,store_id) references public.catalog_offers(id,store_id) on delete set null(offer_id)
);

create table public.home_carousels(
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 1 and 80),
 active boolean not null default true,
 sort_order smallint not null unique check(sort_order>0),
 is_demo boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.home_carousel_items(
 carousel_id uuid not null references public.home_carousels on delete cascade,
 product_id uuid not null references public.catalog_products on delete cascade,
 position smallint not null check(position between 1 and 10),
 offer_id uuid,
 primary key(carousel_id,position),
 -- Nunca repetir produto para preencher espaço.
 unique(carousel_id,product_id),
 -- A oferta destacada no item precisa ser do mesmo produto.
 foreign key(offer_id,product_id) references public.catalog_offers(id,product_id) on delete set null(offer_id)
);

-- Conteúdo de loja ou produto demonstrativo precisa ser marcado como demonstrativo.
create function app_private.catalog_demo_coherence() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_table_name='catalog_offers' and not new.is_demo and (
  exists(select 1 from public.stores s where s.id=new.store_id and s.is_demo)
  or exists(select 1 from public.catalog_products p where p.id=new.product_id and p.is_demo)
 ) then
  raise exception 'Oferta de loja ou produto demonstrativo precisa ser demonstrativa.' using errcode='23514';
 end if;
 if tg_table_name='promo_stories' and not new.is_demo and exists(select 1 from public.stores s where s.id=new.store_id and s.is_demo) then
  raise exception 'Story de loja demonstrativa precisa ser demonstrativo.' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function app_private.catalog_demo_coherence() from public;
create trigger catalog_offers_demo_coherence before insert or update on public.catalog_offers for each row execute function app_private.catalog_demo_coherence();
create trigger promo_stories_demo_coherence before insert or update on public.promo_stories for each row execute function app_private.catalog_demo_coherence();

create index catalog_products_category_status on public.catalog_products(category_id,status);
create index catalog_offers_product on public.catalog_offers(product_id);
create index catalog_offers_store on public.catalog_offers(store_id);
create index catalog_offers_validity on public.catalog_offers(status,starts_at,ends_at);
create index catalog_offers_home_rank on public.catalog_offers(home_rank,id) where status='published' and home_rank is not null;
create index promo_stories_store on public.promo_stories(store_id);
create index promo_stories_offer on public.promo_stories(offer_id) where offer_id is not null;
create index promo_stories_visible on public.promo_stories(status,starts_at,ends_at,sort_order,id);
create index home_carousel_items_product on public.home_carousel_items(product_id);
create index home_carousel_items_offer on public.home_carousel_items(offer_id) where offer_id is not null;

alter table public.catalog_categories enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_offers enable row level security;
alter table public.promo_stories enable row level security;
alter table public.home_carousels enable row level security;
alter table public.home_carousel_items enable row level security;

-- O Supabase concede privilégios amplos por padrão; revogar antes de liberar somente leitura.
revoke all on public.catalog_categories,public.catalog_products,public.catalog_offers,public.promo_stories,public.home_carousels,public.home_carousel_items from anon,authenticated;
grant select on public.catalog_categories,public.catalog_products,public.catalog_offers,public.promo_stories,public.home_carousels,public.home_carousel_items to anon,authenticated;
grant all on public.catalog_categories,public.catalog_products,public.catalog_offers,public.promo_stories,public.home_carousels,public.home_carousel_items to service_role;

-- Feature 005 mantém malls/stores sem acesso público (leitura pelo mapa via service_role).
-- O leitor público da tela inicial recebe somente as colunas de identificação, sem o mapa.
grant select(id,name,is_demo,active) on public.malls to anon,authenticated;
grant select(id,mall_id,name,is_demo,active) on public.stores to anon,authenticated;
create policy home_mall_public_read on public.malls for select to anon,authenticated
 using(active);
create policy home_store_public_read on public.stores for select to anon,authenticated
 using(active and exists(select 1 from public.malls m where m.id=mall_id));

-- Políticas encadeadas: subconsultas também passam pela RLS da tabela consultada.
create policy catalog_category_public_read on public.catalog_categories for select to anon,authenticated
 using(active);
create policy catalog_product_public_read on public.catalog_products for select to anon,authenticated
 using(status='published' and exists(select 1 from public.catalog_categories c where c.id=category_id));
create policy catalog_offer_public_read on public.catalog_offers for select to anon,authenticated
 using(status='published' and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now())
  and exists(select 1 from public.catalog_products p where p.id=product_id)
  and exists(select 1 from public.stores s where s.id=store_id));
create policy promo_story_public_read on public.promo_stories for select to anon,authenticated
 using(status='published' and starts_at<=now() and ends_at>now()
  and exists(select 1 from public.stores s where s.id=store_id)
  and (offer_id is null or exists(select 1 from public.catalog_offers o where o.id=offer_id)));
create policy home_carousel_public_read on public.home_carousels for select to anon,authenticated
 using(active);
create policy home_carousel_item_public_read on public.home_carousel_items for select to anon,authenticated
 using(exists(select 1 from public.home_carousels c where c.id=carousel_id)
  and exists(select 1 from public.catalog_products p where p.id=product_id));

-- Categorias com ao menos um produto publicado e oferta visível no shopping informado.
-- security invoker: a RLS das tabelas acima continua aplicada a quem chama.
create function public.hy_home_categories(p_mall_id text,p_limit integer default 12)
returns table(id text,label text,is_demo boolean)
language sql stable security invoker set search_path='' as $$
 select c.id,c.label,c.is_demo from public.catalog_categories c
 where exists(
  select 1 from public.catalog_products p
  join public.catalog_offers o on o.product_id=p.id
  join public.stores s on s.id=o.store_id
  where p.category_id=c.id and s.mall_id=p_mall_id)
 order by c.sort_order,c.id
 limit least(greatest(coalesce(p_limit,12),1),12);
$$;
revoke all on function public.hy_home_categories(text,integer) from public;
grant execute on function public.hy_home_categories(text,integer) to anon,authenticated,service_role;

-- Bucket público de imagens do catálogo: leitura pública, sem listagem nem upload pelo cliente.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('catalog-media','catalog-media',true,2097152,array['image/webp','image/png','image/jpeg','image/svg+xml'])
on conflict(id) do nothing;

commit;
