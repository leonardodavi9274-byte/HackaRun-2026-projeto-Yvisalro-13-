# Configuração do Supabase

Aplicar as migrações SQL em ordem numérica, no SQL Editor de um projeto de desenvolvimento pertencente à equipe. Cada arquivo é executado em transação; registrar os nomes aplicados e não reescrever migrações já executadas. A criação dos arquivos não significa aplicação no serviço.

O esquema app_private não deve constar nos esquemas expostos pela Data API. As funções hy_* são restritas a service_role; todas as tabelas de negócio têm RLS e não concedem DML aos clientes. A API autoriza cada sujeito mesmo usando chave privilegiada.

Configurar e-mail/senha, confirmação habilitada, mínimo 8 caracteres, validade 3600 segundos e reenvio mínimo 60 segundos. Site URL local: http://127.0.0.1:5173. Template de confirmação:

{{ .SiteURL }}/cadastro/confirmar#token_hash={{ .TokenHash }}&type=email

Configurar SMTP próprio para consumidores externos; não desligar confirmação para contornar falta de SMTP. Criar bucket consumer-avatars privado, com image/webp e limite de 5242880 bytes. Não permitir listagem, leitura pública ou upload direto do cliente.

Preencher backend/.env a partir do exemplo, mantendo segredos fora do Git. Termos e Política precisam de conteúdo e destinos reais. Sem configuração completa o cadastro retorna 503, preservando a saúde da base.

Consulte ../../specs/004-cadastro-preferencias/quickstart.md para pré-requisitos. Nenhuma configuração externa foi feita ao criar este documento.


## Ordem das migrações e manutenção

0001–0006 definem tabelas e restrições; 0007 define sessões; 0008 vincula a identidade Auth;
0009–0010 inicializam perfil/intenção; 0011–0012 suportam retomada; 0013 altera publicidade;
0014 registra e associa avatar com revisão. Aplicar todos antes de liberar a feature.

O script maintenance/cleanup-registration-state.sql é manual: limpa snapshots confirmados,
intenções não vinculadas expiradas e sessões vencidas/revogadas. Não apaga identidades nem
rascunhos pendentes vinculados à conta.

Para objetos órfãos, identificar operações superseded ou não vigentes, conferir que nenhum
consumer_profiles.photo_object_path ou operação ainda retomável referencia o objeto e então
remover pela API Storage administrativa. Nunca apagar linhas de storage.objects diretamente
ou remover foto vigente. Não executar limpeza automática junto ao cadastro/upload.

## Mapa do shopping (feature 005)

Aplicar depois de 0001–0014, em ordem: 0015_mall_map_stores.sql (malls, mall_maps, stores,
RLS e grants só para service_role) e 0016_demo_mall_seed.sql (Shopping Aurora, mapa
provisório de três pisos e 18 lojas fictícias, uma delas sem posição). O 0015 depende de
interest_categories (0002). A WebAPI é a única leitora, por GET /api/v1/mall.

Logos são opcionais: criar bucket público store-logos e preencher stores.logo_url com a URL
pública HTTPS. As lojas de demonstração não usam logo.

Troca do mapa provisório pela planta da coordenação, sem mudar código:

1. Converter a planta para o documento schemaVersion 1 (metros, eixo y para baixo), conforme
   ../../specs/005-mapa-rota-lojas/data-model.md.
2. Inserir a nova linha em mall_maps com source = 'coordination' e active = false.
3. Atualizar stores.unit_id para as unidades da nova planta; lojas sem unidade ficam sem posição.
4. Numa transação: update mall_maps set active = false onde está ativo; depois
   update mall_maps set active = true na nova versão (o índice único parcial exige essa ordem).
5. Ajustar malls.reference_lat, reference_lng, area_radius_m e is_demo conforme a coordenação.

Se o documento ativo for inválido, a API responde 503 MAP_INVALID e o log registra a regra
violada, sem o conteúdo do mapa.

Planta da coordenação (Capim Dourado Shopping): 0020_capim_dourado_map.sql aplica os passos
acima de uma vez. Cria as categorias inativas alimentacao, servicos e lazer (só para lojas), o
shopping capim-dourado, a versão planta-mix-2026-11 (source = 'coordination', Térreo e Praça de
Alimentação) e 152 lojas, e torna o capim-dourado o shopping ativo. Aplicar depois de 0001–0018;
o número 0019 está reservado para a migração da feature 006 na branch dev. Coordenadas de
referência e raio continuam provisórios (passo 5 pendente). Ver research D13 da feature 005.

## Promoções próximas (feature 008)

Após 0015–0016, preparar 0017_published_promotional_offers.sql e, para demonstração,
0018_demo_promotional_offers.sql. A fonte contém somente ofertas publicadas para leitura;
os dados do segundo arquivo são fictícios. A API é a única leitora. O catálogo definitivo
deverá substituir ou absorver esses dados, sem escrita dupla ou fontes concorrentes.
Antes da integração, conferir conflitos de numeração com migrações de outras branches.
O arquivo 0018 é opcional e insere café fictício na loja de demonstração Grão Fino;
com 0017 apenas, a lista de ofertas pode estar vazia. A aplicação usa somente a API e
não armazena coordenadas ou ponto no servidor. Nenhum SQL foi aplicado remotamente aqui.

Em 2026-11-14, o código e os arquivos SQL foram preparados; nenhum projeto remoto recebeu
essas migrações nesta execução. Os scripts SQL não foram executados contra PostgreSQL/Supab
