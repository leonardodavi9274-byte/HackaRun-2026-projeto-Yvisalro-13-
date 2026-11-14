-- Feature 005: shopping, versões do mapa interno e lojas de demonstração.
-- Leitura exclusiva pela WebAPI (service_role); nada concedido a anon/authenticated.
begin;

create table public.malls(
 id text primary key check(length(id)>0),
 name text not null check(length(btrim(name))>0),
 reference_lat double precision not null check(reference_lat between -90 and 90),
 reference_lng double precision not null check(reference_lng between -180 and 180),
 area_radius_m integer not null default 500 check(area_radius_m between 50 and 5000),
 is_demo boolean not null default true,
 active boolean not null default false
);
-- No máximo um shopping ativo.
create unique index malls_single_active on public.malls((true)) where active;

create table public.mall_maps(
 id uuid primary key default gen_random_uuid(),
 mall_id text not null references public.malls on delete cascade,
 version_label text not null check(length(btrim(version_label))>0),
 source text not null check(source in ('provisional','coordination')),
 document jsonb not null check(jsonb_typeof(document)='object'),
 active boolean not null default false,
 created_at timestamptz not null default now(),
 unique(mall_id,version_label)
);
-- Exatamente uma versão ativa por shopping (a troca desativa a anterior e ativa a nova na mesma transação).
create unique index mall_maps_single_active on public.mall_maps(mall_id) where active;
create index mall_maps_mall_id on public.mall_maps(mall_id);

create table public.stores(
 id text primary key check(id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 mall_id text not null references public.malls on delete cascade,
 name text not null check(char_length(name) between 1 and 80),
 category_id text not null references public.interest_categories,
 -- Unidade no documento do mapa ativo; nulo ou ausente no mapa ativo = loja sem posição.
 unit_id text,
 -- URL pública no bucket store-logos; nulo = marcador de sacola.
 logo_url text check(logo_url is null or logo_url ~ '^https://'),
 is_demo boolean not null default true,
 active boolean not null default true
);
create index stores_mall_active on public.stores(mall_id) where active;

alter table public.malls enable row level security;
alter table public.mall_maps enable row level security;
alter table public.stores enable row level security;
revoke all on public.malls,public.mall_maps,public.stores from anon,authenticated;
grant all on public.malls,public.mall_maps,public.stores to service_role;

commit;
