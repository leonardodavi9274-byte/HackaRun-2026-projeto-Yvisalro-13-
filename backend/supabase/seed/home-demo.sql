-- Conteúdo FICTÍCIO da tela inicial (feature 006). Somente para o projeto de desenvolvimento.
-- Todos os registros têm is_demo=true. Reexecutar substitui o conteúdo demonstrativo anterior;
-- dados não demonstrativos não são tocados. Imagens: enviar seed/media/demo ao bucket catalog-media.
begin;

-- Remoção do conteúdo demonstrativo anterior (cascata: lojas, ofertas, stories e itens de carrossel).
delete from public.home_carousels where is_demo;
delete from public.shopping_centers where is_demo;
delete from public.catalog_products where is_demo;
delete from public.catalog_categories where is_demo and not exists(select 1 from public.catalog_products p where p.category_id=catalog_categories.id);

insert into public.shopping_centers(id,name,active,is_demo,is_home_default) values
('00000000-0000-4000-8000-000000000001','Shopping Veredas Douradas',true,true,true);

insert into public.stores(id,shopping_center_id,name,floor_label,active,is_demo) values
('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','Passo do Cerrado','Piso 1',true,true),
('00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000001','Vitrine das Veredas','Piso 2',true,true),
('00000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000001','Casa Ipê',null,true,true),
('00000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000001','Grão do Planalto','Piso 1',true,true);

insert into public.catalog_categories(id,label,sort_order,active,is_demo) values
('demo-moda','Moda',101,true,true),
('demo-tenis','Tênis',102,true,true),
('demo-eletronicos','Eletrônicos',103,true,true),
('demo-casa','Casa',104,true,true),
('demo-cafe-doces','Café e doces',105,true,true),
('demo-livros','Livros',106,true,true); -- sem produtos: não aparece na tela

insert into public.catalog_products(id,category_id,name,description,status,is_demo) values
('00000000-0000-4000-8000-000000000021','demo-tenis','Tênis Cerrado Run','Produto fictício para demonstração.','published',true),
('00000000-0000-4000-8000-000000000022','demo-eletronicos','Fone Horizonte sem fio','Produto fictício para demonstração.','published',true),
('00000000-0000-4000-8000-000000000023','demo-casa','Luminária Vereda','Produto fictício para demonstração.','published',true),
('00000000-0000-4000-8000-000000000024','demo-moda','Jaqueta Seriema','Produto fictício para demonstração.','published',true),
('00000000-0000-4000-8000-000000000025','demo-cafe-doces','Café especial Planalto 250 g','Produto fictício para demonstração.','published',true),
('00000000-0000-4000-8000-000000000026','demo-eletronicos','Caixa de som Buriti','Produto fictício para demonstração.','published',true),
('00000000-0000-4000-8000-000000000027','demo-moda','Bolsa Pequi','Produto fictício para demonstração.','published',true),
('00000000-0000-4000-8000-000000000028','demo-casa','Conjunto de canecas Ipê','Produto fictício sem oferta publicada.','published',true);

insert into public.catalog_offers(id,product_id,store_id,price_cents,previous_price_cents,stock_status,starts_at,ends_at,status,home_rank,last_updated_at,is_demo) values
('00000000-0000-4000-8000-000000000031','00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000011',22900,29900,'in_stock',now()-interval '1 day',now()+interval '20 days','published',1,now(),true),
('00000000-0000-4000-8000-000000000032','00000000-0000-4000-8000-000000000022','00000000-0000-4000-8000-000000000012',18900,null,'in_stock',null,null,'published',2,now(),true),
('00000000-0000-4000-8000-000000000033','00000000-0000-4000-8000-000000000023','00000000-0000-4000-8000-000000000013',8990,11990,'unknown',null,now()+interval '7 days','published',3,now(),true),
('00000000-0000-4000-8000-000000000034','00000000-0000-4000-8000-000000000024','00000000-0000-4000-8000-000000000011',31900,null,'out_of_stock',null,null,'published',4,now(),true),
('00000000-0000-4000-8000-000000000035','00000000-0000-4000-8000-000000000025','00000000-0000-4000-8000-000000000014',4590,null,'in_stock',null,null,'published',null,now(),true),
('00000000-0000-4000-8000-000000000036','00000000-0000-4000-8000-000000000026','00000000-0000-4000-8000-000000000012',24900,27900,'in_stock',null,now()+interval '15 days','published',null,now(),true),
('00000000-0000-4000-8000-000000000037','00000000-0000-4000-8000-000000000027','00000000-0000-4000-8000-000000000011',15900,null,'in_stock',null,null,'draft',null,now(),true);

insert into public.promo_stories(id,store_id,offer_id,title,image_path,image_alt,starts_at,ends_at,status,sort_order,is_demo) values
('00000000-0000-4000-8000-000000000041','00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000031','Semana do tênis','demo/stories/passo-do-cerrado.svg','Ilustração fictícia de um tênis laranja sobre fundo claro',now()-interval '1 day',now()+interval '10 days','published',1,true),
('00000000-0000-4000-8000-000000000042','00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000032','Som sem fio','demo/stories/vitrine-das-veredas.svg','Ilustração fictícia de um fone de ouvido azul sobre fundo claro',now()-interval '1 day',now()+interval '5 days','published',2,true),
('00000000-0000-4000-8000-000000000043','00000000-0000-4000-8000-000000000014',null,'Novos grãos','demo/stories/grao-do-planalto.svg','Ilustração fictícia de uma xícara de café sobre fundo claro',now()-interval '2 hours',now()+interval '3 days','published',3,true);

insert into public.home_carousels(id,title,active,sort_order,is_demo) values
('00000000-0000-4000-8000-000000000051','Você também pode gostar',true,101,true),
('00000000-0000-4000-8000-000000000052','Para a casa',true,102,true);

insert into public.home_carousel_items(carousel_id,product_id,position,offer_id) values
('00000000-0000-4000-8000-000000000051','00000000-0000-4000-8000-000000000026',1,'00000000-0000-4000-8000-000000000036'),
('00000000-0000-4000-8000-000000000051','00000000-0000-4000-8000-000000000025',2,'00000000-0000-4000-8000-000000000035'),
('00000000-0000-4000-8000-000000000051','00000000-0000-4000-8000-000000000022',3,'00000000-0000-4000-8000-000000000032'),
('00000000-0000-4000-8000-000000000051','00000000-0000-4000-8000-000000000027',4,null),
('00000000-0000-4000-8000-000000000052','00000000-0000-4000-8000-000000000023',1,'00000000-0000-4000-8000-000000000033'),
('00000000-0000-4000-8000-000000000052','00000000-0000-4000-8000-000000000028',2,null);

commit;
