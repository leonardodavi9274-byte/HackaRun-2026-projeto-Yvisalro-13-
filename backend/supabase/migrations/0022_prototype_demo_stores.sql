-- Lojas e ofertas FICTÍCIAS das telas do protótipo (05, 06, 07 e 11) no Shopping Aurora.
-- Espelha o modo demonstração da API (backend/src/infrastructure/demo) para que o banco e a
-- demonstração mostrem os mesmos dados. Requer 0016 (lojas e mapa) e 0017 (ofertas).
-- As vigências são relativas ao momento da aplicação; reaplique ou atualize ends_at para renovar.
begin;

insert into public.stores(id,mall_id,name,category_id,unit_id,logo_url,is_demo,active) values
('megatech','aurora','Megatech','eletronicos','p1-u07',null,true,true),
('sport-vibe','aurora','Sport Vibe','tenis','p2-u06',null,true,true),
('som-e-cia','aurora','Som&Cia','eletronicos','p3-u01',null,true,true)
on conflict (id) do nothing;

insert into public.published_promotional_offers
 (id, store_id, category_id, product_name, price_cents, previous_price_cents, availability, starts_at, ends_at, is_demo, published)
values
 ('cafe-pao-de-queijo-grao-fino','grao-fino','cafe-doces','Café + pão de queijo',1290,1520,'available',null,now()+interval '6 hours',true,true),
 ('jaqueta-corta-vento-moda-leve','moda-leve','moda','Jaqueta corta-vento',13900,19900,'available',null,now()+interval '48 hours',true,true),
 ('fone-orbit-x-pixel-house','pixel-house','eletronicos','Fone Orbit X',22900,29900,'available',null,now()+interval '3 hours',true,true)
on conflict (id) do nothing;

commit;
