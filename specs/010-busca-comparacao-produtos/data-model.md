# Data Model: Catálogo, busca e comparação

**Estado**: modelo proposto; nenhuma tabela, migração ou dado foi criada por este planejamento. Usar a fonte PostgreSQL principal e preservar os identificadores já publicados pela 008.

## Categoria e tipo

- **Categoria**: reutilizar identificação e nome de `interest_categories`, já usados por interesses e promoções. Categoria do produto não é inferida da categoria da loja.
- **Tipo**: identificação estável, nome e referência obrigatória à categoria; tipos pertencem a uma categoria. Uma seleção de tipo deve pertencer à categoria selecionada quando ambas existirem; combinação incompatível é entrada inválida, não mudança silenciosa.

## Produto e variantes

- **Produto**: ID estável, nome não vazio, categoria, tipo, indicação de demonstração e estado de publicação. Oferecer identidade distinta da oferta para a integração com desejos.
- **Variante**: ID estável, produto de origem, características cadastradas como cor e tamanho e rótulo suficiente para distinguir variantes; ao menos uma variante por produto ofertado, mesmo que não haja cor/tamanho especificados. Usar uma variante padrão explicitamente cadastrada quando o produto não tiver opções, não inferir equivalência entre registros.
- **Sinônimo**: termo cadastrado e vínculo explícito com produto ou categoria. Os termos são dados da demonstração, não histórico pessoal. A forma normalizada auxilia correspondência, sem alterar o rótulo exibido.
- Produto e variante removidos ou despublicados não são substituídos por outro identificador. A interface 009 distingue `missing` (não encontrado) e `unavailable` (referência conhecida, mas indisponível); falha de consulta rejeita a operação e não é convertida em qualquer dos estados nem em lista vazia.

## Oferta

| Campo | Regra |
| --- | --- |
| ID | Estável, distinto de produto e variante; preservar IDs promocionais da 008. |
| `variantId`, `storeId` | Obrigatórios; loja ativa vinculada ao shopping ativo. A categoria pertence ao produto. |
| `priceCents` | Inteiro não negativo ou nulo se desconhecido; filtro de preço requer valor não nulo e limites inclusivos. |
| `availability` | `available`, `unavailable` ou `unknown`; ausência é desconhecida, nunca presumir disponível. |
| Promoção | Preço anterior, início/fim e atualização opcionais; preço anterior só é exibido como desconto quando maior que preço atual conhecido, vigência coerente e oferta vigente. Condição ausente não é inventada. |
| `published`, `isDemo` | Publicação controla exposição; toda amostra fictícia é marcada e identificada na interface. |
| `revision` | Inteiro positivo; incremento atômico a cada mudança em oferta ou em campo de produto/variante projetado para confirmação promocional. |

Ofertas de mesma variante em lojas diferentes são comparáveis; outras variantes da mesma categoria são alternativas. Não limitar artificialmente uma loja a uma oferta sem necessidade de negócio; identificadores distinguem ofertas e a seleção de uma oferta aponta à sua loja.

## Migração e ciclo de vida promocional

1. Antes da migração, inventariar registros reais da fonte antiga; associar cada ID de oferta antiga a produto e variante por mapeamento explícito e revisável. Dados divergentes, órfãos ou sem mapeamento abortam a transição com relatório de IDs, sem agrupar por nome. O seed documentado possui `cafe-demo-grao-fino`; não presumir que seja a única linha em todos os ambientes.
2. Com consumidores em indisponibilidade controlada durante o corte coordenado, criar os vínculos e copiar ou absorver os registros em transação com os mesmos IDs e valores; conferir cobertura, contagens e integridade, implantar o adaptador canônico e reabrir consultas. Não presumir que a view de compatibilidade preserve a relação PostgREST com `stores`. Não manter escrita dupla ou duas fontes autoritativas. Reter backup e plano de reversão anterior ao corte; não reverter descartando alterações novas sem reconciliação.
3. Preservar resposta e semântica da 008: promoção publicada, disponível, preço conhecido, loja/shopping ativos, vigência válida; confirmação imediatamente anterior à exibição por ID e revisão. A oferta pode ser visível na busca sem satisfazer a elegibilidade de pop-up. Mudanças em dependências projetadas incrementam a revisão transacionalmente; mudança de loja é revalidada separadamente.
4. Após confirmar o corte e integridade, aposentar leitura da tabela antiga; não apagar dados de maneira irreversível nesta etapa de planejamento. Confirmar a sequência de migrações no momento da implementação.

## Proteção e fronteiras

- Tabelas de catálogo seguem o padrão da 005/008: RLS e sem acesso direto de `anon`/`authenticated`; só o backend lê com credencial apropriada e expõe dados públicos publicados. Não expor chaves nem aceitar escrita empresarial nesta entrega.
- Não registrar termos privados em logs. Buscas anônimas não são associadas a conta. Um registro autenticado futuro de histórico segue a feature 009, sua autorização, idempotência e exclusão individual.
- O destino é sempre `storeId` da oferta. Piso/posição só aparecem quando conhecidos no mapa; ausência da posição não bloqueia busca ou comparação, mas indisponibiliza o encaminhamento ao local com explicação.
