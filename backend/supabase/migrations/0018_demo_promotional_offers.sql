-- Oferta de demonstração inteiramente fictícia; requer o mapa e lojas da feature 005.
begin;
insert into public.published_promotional_offers
 (id, store_id, category_id, product_name, price_cents, previous_price_cents, availability, is_demo, published)
values ('cafe-demo-grao-fino', 'grao-fino', 'cafe-doces', 'Café demonstrativo', 1200, 1500, 'available', true, true);
commit;
