# Corte do catálogo e das promoções

**Estado:** procedimento preparado; nenhuma migração ou corte remoto foi realizado.

Responsável pela execução: pessoa autorizada pela equipe com acesso ao ambiente e à implantação. Não iniciar sem autorização e sem coordenação dos consumidores da API.

1. Inventariar as migrações aplicadas e os IDs, revisões e vínculos das ofertas de `published_promotional_offers`; nunca registrar credenciais ou dados privados no relatório. Confirmar números livres e obter backup recuperável da base.
2. Preparar um mapeamento explícito e revisável de cada ID antigo para um produto e variante do catálogo. O seed conhecido contém `cafe-demo-grao-fino`, mas não se deve presumir que seja a única linha. IDs ausentes, órfãos, conflitantes ou sem mapeamento bloqueiam a transição; não deduzir equivalência por nome.
3. Em janela coordenada, colocar os consumidores de catálogo e promoções em indisponibilidade controlada. Executar a transição transacional e conferir cobertura, contagens, IDs, revisão, vínculos, valores, vigências e estados antes de implantar o adaptador que lê a fonte canônica.
4. Reabrir somente quando API e base estiverem na mesma versão. O contrato de promoções, confirmação por revisão e supressão durante rota ativa devem permanecer. Não presumir que uma view mantenha as relações PostgREST da tabela antiga; não manter escrita dupla nem duas fontes principais.
5. Se houver falha, manter indisponibilidade controlada enquanto a equipe restaura a versão anterior e o backup. Não descartar alterações posteriores sem inventariá-las e reconciliá-las. Registrar estado, responsável, horário e eventual bloqueio sem afirmar que o corte foi feito.
