-- Produtos e ofertas inteiramente fictícios, vinculados às lojas fictícias da 005.
begin;
insert into public.catalog_types(id,category_id,name) values
 ('tenis-corrida','tenis','Corrida'),('tenis-casual','tenis','Casual');
insert into public.catalog_products(id,name,category_id,type_id,is_demo,published) values
 ('tenis-estrela','Tênis Estrela','tenis','tenis-corrida',true,true),
 ('tenis-brisa','Tênis Brisa','tenis','tenis-casual',true,true);
insert into public.catalog_variants(id,product_id,label,attributes) values
 ('estrela-preto','tenis-estrela','Preto','{"cor":"preto"}'),
 ('estrela-branco','tenis-estrela','Branco','{"cor":"branco"}'),
 ('brisa-padrao','tenis-brisa','Padrão','{}');
insert into public.catalog_synonyms(id,term,product_id,category_id) values
 ('estrela-calcado','calçado esportivo','tenis-estrela',null),
 ('categoria-tenis-calcado','calçado',null,'tenis');
insert into public.catalog_offers(id,variant_id,store_id,price_cents,availability,published,is_demo,updated_at) values
 ('estrela-preto-passo','estrela-preto','passo-firme',15000,'available',true,true,now()),
 ('estrela-preto-corre','estrela-preto','corre-tenis',16500,'available',true,true,now()),
 ('estrela-branco-passo','estrela-branco','passo-firme',null,'unavailable',true,true,now()),
 ('brisa-corre','brisa-padrao','corre-tenis',null,'unknown',true,true,now());
commit;
