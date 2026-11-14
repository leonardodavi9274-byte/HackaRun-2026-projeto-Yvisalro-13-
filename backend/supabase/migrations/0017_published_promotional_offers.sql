-- Feature 008: fonte mínima de ofertas públicas, com leitura apenas pela WebAPI.
begin;
create table public.published_promotional_offers (
 id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 store_id text not null references public.stores(id),
 category_id text not null references public.interest_categories(id),
 product_name text not null check (char_length(btrim(product_name)) between 1 and 120),
 price_cents integer not null check (price_cents >= 0),
 previous_price_cents integer check (previous_price_cents is null or previous_price_cents > price_cents),
 availability text not null check (availability in ('available', 'unavailable')),
 starts_at timestamptz,
 ends_at timestamptz,
 is_demo boolean not null,
 published boolean not null default false,
 updated_at timestamptz not null default now(),
 revision integer not null default 1 check (revision > 0),
 check (starts_at is null or ends_at is null or starts_at < ends_at)
);
create index published_promotional_offers_store on public.published_promotional_offers(store_id) where published;
create function public.bump_promotional_offer_revision() returns trigger
language plpgsql set search_path = '' as $$
begin
 new.revision := old.revision + 1;
 new.updated_at := now();
 return new;
end;
$$;
create trigger published_promotional_offers_revision before update on public.published_promotional_offers
for each row execute function public.bump_promotional_offer_revision();
alter table public.published_promotional_offers enable row level security;
revoke all on public.published_promotional_offers from anon, authenticated;
revoke all on function public.bump_promotional_offer_revision() from public, anon, authenticated;
grant all on public.published_promotional_offers to service_role;
commit;
