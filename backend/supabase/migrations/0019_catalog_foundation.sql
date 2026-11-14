-- Fonte canônica do catálogo. Aplicar apenas em corte coordenado; ver docs/migracao-catalogo-promocoes.md.
begin;

create table public.catalog_types (
 id text primary key,
 category_id text not null references public.interest_categories(id),
 name text not null check (length(btrim(name)) > 0),
 unique(id, category_id)
);
create table public.catalog_products (
 id text primary key,
 name text not null check (length(btrim(name)) > 0),
 category_id text not null references public.interest_categories(id),
 type_id text not null,
 is_demo boolean not null,
 published boolean not null,
 foreign key (type_id, category_id) references public.catalog_types(id, category_id)
);
create table public.catalog_variants (
 id text primary key,
 product_id text not null references public.catalog_products(id),
 label text not null check (length(btrim(label)) > 0),
 attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object')
);
create table public.catalog_synonyms (
 id text primary key,
 term text not null check (length(btrim(term)) > 0),
 product_id text references public.catalog_products(id),
 category_id text references public.interest_categories(id),
 check ((product_id is null) <> (category_id is null))
);
create table public.catalog_offers (
 id text primary key,
 variant_id text not null references public.catalog_variants(id),
 store_id text not null references public.stores(id),
 price_cents integer check (price_cents >= 0),
 previous_price_cents integer,
 availability text not null check (availability in ('available','unavailable','unknown')),
 starts_at timestamptz,
 ends_at timestamptz,
 updated_at timestamptz,
 published boolean not null,
 is_demo boolean not null,
 revision integer not null default 1 check (revision > 0),
 check (previous_price_cents is null or (price_cents is not null and previous_price_cents > price_cents)),
 check (starts_at is null or ends_at is null or starts_at < ends_at)
);

-- A associação é explícita por ID: linhas novas não mapeadas bloqueiam a migração.
do $$
declare missing_ids text;
begin
 select string_agg(id, ', ' order by id) into missing_ids
 from public.published_promotional_offers
 where id <> 'cafe-demo-grao-fino';
 if missing_ids is not null then
  raise exception 'Ofertas sem mapeamento explícito: %', missing_ids;
 end if;
 if exists (select 1 from public.published_promotional_offers
            where id = 'cafe-demo-grao-fino' and category_id <> 'cafe-doces') then
  raise exception 'Categoria divergente para cafe-demo-grao-fino';
 end if;
end $$;

insert into public.catalog_types(id, category_id, name) values
 ('cafe-demo-tipo', 'cafe-doces', 'Café');
insert into public.catalog_products(id,name,category_id,type_id,is_demo,published)
 select 'cafe-demo-produto',product_name,category_id,'cafe-demo-tipo',is_demo,true
 from public.published_promotional_offers where id='cafe-demo-grao-fino';
insert into public.catalog_variants(id,product_id,label)
 select 'cafe-demo-variante',id,'Padrão' from public.catalog_products where id='cafe-demo-produto';
insert into public.catalog_offers(id,variant_id,store_id,price_cents,previous_price_cents,availability,starts_at,ends_at,updated_at,published,is_demo,revision)
 select id,'cafe-demo-variante',store_id,price_cents,previous_price_cents,availability,starts_at,ends_at,updated_at,published,is_demo,revision
 from public.published_promotional_offers where id='cafe-demo-grao-fino';
do $$
begin
 if (select count(*) from public.published_promotional_offers) <> (select count(*) from public.catalog_offers) then
  raise exception 'Quantidade de ofertas migradas divergente';
 end if;
end $$;
-- Após o corte, o adaptador antigo falha fechado em vez de servir cópia desatualizada.
revoke all on public.published_promotional_offers from service_role;

create function public.catalog_offer_revision() returns trigger language plpgsql as $$
begin
 new.revision := old.revision + 1;
 new.updated_at := now();
 return new;
end $$;
create trigger catalog_offer_revision before update on public.catalog_offers
 for each row execute function public.catalog_offer_revision();
create function public.catalog_touch_product_offers() returns trigger language plpgsql as $$
begin
 if tg_table_name = 'catalog_products' then
  update public.catalog_offers set revision=revision where variant_id in
   (select id from public.catalog_variants where product_id=new.id);
 elsif tg_table_name = 'catalog_variants' then
  update public.catalog_offers set revision=revision where variant_id=new.id;
 elsif tg_table_name = 'interest_categories' then
  update public.catalog_offers set revision=revision where variant_id in
   (select v.id from public.catalog_variants v join public.catalog_products p on p.id=v.product_id where p.category_id=new.id);
 end if;
 return new;
end $$;
create trigger catalog_product_revision after update on public.catalog_products for each row execute function public.catalog_touch_product_offers();
create trigger catalog_variant_revision after update on public.catalog_variants for each row execute function public.catalog_touch_product_offers();
create trigger catalog_category_revision after update on public.interest_categories for each row execute function public.catalog_touch_product_offers();

alter table public.catalog_types enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_variants enable row level security;
alter table public.catalog_synonyms enable row level security;
alter table public.catalog_offers enable row level security;
revoke all on public.catalog_types,public.catalog_products,public.catalog_variants,public.catalog_synonyms,public.catalog_offers from public,anon,authenticated;
grant all on public.catalog_types,public.catalog_products,public.catalog_variants,public.catalog_synonyms,public.catalog_offers to service_role;
revoke all on function public.catalog_offer_revision(),public.catalog_touch_product_offers() from public,anon,authenticated;

-- Um único SELECT produz snapshot consistente e evita o limite de linhas por página.
create function public.catalog_snapshot() returns jsonb language sql stable security invoker as $$
 select jsonb_build_object(
  'mall', (select to_jsonb(m) from (select id,name,is_demo from public.malls where active limit 1) m),
  'categories', coalesce((select jsonb_agg(to_jsonb(c) order by c.id) from (select id,label from public.interest_categories where active) c),'[]'::jsonb),
  'types', coalesce((select jsonb_agg(to_jsonb(t) order by t.id) from public.catalog_types t),'[]'::jsonb),
  'products', coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from public.catalog_products p),'[]'::jsonb),
  'variants', coalesce((select jsonb_agg(to_jsonb(v) order by v.id) from public.catalog_variants v),'[]'::jsonb),
  'synonyms', coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from public.catalog_synonyms s),'[]'::jsonb),
  'offers', coalesce((select jsonb_agg(to_jsonb(o) order by o.id) from public.catalog_offers o),'[]'::jsonb),
  'stores', coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from public.stores s join public.malls m on m.id=s.mall_id where m.active and s.active),'[]'::jsonb)
 );
$$;
revoke all on function public.catalog_snapshot() from public,anon,authenticated;
grant execute on function public.catalog_snapshot() to service_role;
commit;
