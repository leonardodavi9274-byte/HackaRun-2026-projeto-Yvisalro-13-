begin;
create table public.interest_categories(id text primary key,label text not null check(length(label)>0),sort_order smallint not null unique check(sort_order>0),active boolean not null default true);
create table public.consumer_category_interests(user_id uuid not null references public.consumer_profiles on delete cascade,category_id text not null references public.interest_categories,primary key(user_id,category_id));
create table public.consumer_product_interests(
 user_id uuid not null references public.consumer_profiles on delete cascade,
 position smallint not null check(position between 1 and 10),
 term text not null check(term=app_private.app_trim(term) and char_length(term) between 1 and 100),
 normalized_term text generated always as (lower(app_private.app_trim(term))) stored,
 primary key(user_id,position),unique(user_id,normalized_term)
);
insert into public.interest_categories values
('moda','Moda',1,true),('tenis','Tênis',2,true),('eletronicos','Eletrônicos',3,true),('beleza','Beleza',4,true),('casa','Casa',5,true),('cafe-doces','Café e doces',6,true),('games','Games',7,true),('livros','Livros',8,true),('esporte','Esporte',9,true);
alter table public.interest_categories enable row level security;
alter table public.consumer_category_interests enable row level security;
alter table public.consumer_product_interests enable row level security;
revoke all on public.interest_categories,public.consumer_category_interests,public.consumer_product_interests from anon,authenticated;
grant all on public.interest_categories,public.consumer_category_interests,public.consumer_product_interests to service_role;
commit;
