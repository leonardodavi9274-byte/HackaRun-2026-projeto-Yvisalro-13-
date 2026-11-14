# Pesquisa preliminar: desejos e recomendações

**Estado**: escolhas de produto esclarecidas conforme [spec.md](spec.md). O catálogo e a busca de produtos são dependências ainda ausentes; o planejamento dos seus contratos concretos pertence à feature responsável.

## R1 — Identidade e interesses

- **Confirmado**: a constituição prevê identidade pelo Supabase Auth e validação de identidade e autorização na API. [Constituição](../../.specify/memory/constitution.md).
- **Encontrado no código**: as rotas privadas de conta usam `requireAuth` e a identidade validada; o serviço consulta os dados da conta a partir do usuário autenticado. Ver [rotas](../../backend/src/presentation/http/routes/me.routes.ts), [middleware](../../backend/src/presentation/http/middlewares/require-auth.ts) e [serviço de consumidor](../../backend/src/application/services/consumer.service.ts).
- **Encontrado no modelo**: interesses por produto são termos livres, distintos de desejos e de produtos catalogados; categorias e termos estão documentados em [dados da feature 004](../004-cadastro-preferencias/data-model.md) e na [migração de interesses](../../backend/supabase/migrations/0002_consumer_interests.sql).
- **Implicação para o planejamento**: proteger os dados da conta e não converter termos livres automaticamente em desejos. O acesso privilegiado ao banco não substitui a autorização na API; a definição concreta de novos contratos depende do design.

## R2 — Catálogo e interface

- **Encontrado no código**: o backend consultado não contém rotas ou modelo de catálogo de produtos e ofertas, desejos ou recomendações; existem estruturas de shopping, mapa e lojas. Ver [rotas principais](../../backend/src/presentation/http/routes/index.ts) e [migração do mapa](../../backend/supabase/migrations/0015_mall_map_stores.sql).
- **Encontrado no frontend**: o Início apresenta informações de conta e categorias e informa que catálogo e recomendações são futuros; a navegação existente inclui Início e Mapa. Ver [Início](../../frontend/src/features/home/views/HomeView.jsx) e [navegação inferior](../../frontend/src/shared/components/BottomNav.jsx).
- **Implicação para o planejamento**: catálogo e identidade de produto/oferta são dependências a especificar ou integrar antes dos fluxos que as utilizam; loja no mapa não comprova catálogo. O protótipo mostra coração salvando produto; a escolha posterior de produto ou oferta exige adequar esse fluxo, conforme [telas documentadas](../../docs/frontend.md).
- **Limite da análise**: inspeção de arquivos não demonstra migrações aplicadas, serviços configurados ou fluxos executados.

## R3 — Desejo e recomendações

- **Decisão fornecida**: a pessoa escolhe salvar produto ou oferta de uma loja; se salvar ambos, eles aparecem separados e são removidos independentemente. Buscas e visualizações permanecem até exclusão individual pela pessoa, que não pode desativar o uso do histórico nas recomendações.
- **Decisão fornecida**: recomendações usam somente buscas de produtos; interesses, desejos e visualizações não são sinais. Esta resposta substitui a proposta anterior de priorizá-los. As recomendações aparecem em uma seção discreta no Início, sem interromper a navegação.
- **Dependência**: a medida de relevância textual da busca pertence ao catálogo/busca ainda não implementado; não inventar correspondências ou alegar precisão definida.

## R4 — Histórico de compras

- **Decisão fornecida**: não haverá integração de compras nesta entrega; lojas cadastradas registram produtos.
- **Implicação**: a vitrine não registra compra ou pagamento interno. Cadastrar um produto não registra uma compra; não inferir compras de buscas, visualizações ou desejos.

## R5 — Regras já confirmadas

- **Confirmado**: ofertas mostram dados conhecidos sem inventar equivalência, preço ou disponibilidade; dados fictícios são identificados.
- **Confirmado**: publicidade promocional é separada dos interesses e desejos, e o fluxo de desenvolvimento é sem testes como etapa padrão. Ver [constituição](../../.specify/memory/constitution.md) e [especificação](spec.md).
- **Limite**: a avaliação pós-design deve conferir as dependências ainda ausentes e a política sem testes.

## R6 — Opções técnicas identificadas, ainda não aprovadas

- **Desejos**: avaliar uma referência tipada de produto ou oferta por conta, com operações privadas de consulta, salvamento e remoção. A escolha de um tipo não deve alterar o outro; referências estáveis dependem do futuro catálogo.
- **Histórico**: avaliar entradas individualmente identificáveis por conta e por interação. A exclusão confirmada deve retirar a entrada da leitura e evitar que respostas antigas ou dados derivados a reintroduzam como sinal; uma interação posterior é distinta. Detalhes de coleta dependem dos sinais confirmados e dos fluxos de catálogo.
- **Autorização**: as operações privadas existentes obtêm a identidade em `requireAuth`; o cliente privilegiado ignora RLS, portanto o desenho precisa aplicar o isolamento da conta explicitamente. Para requisições web, consultar os padrões de `web-request-guard` e do cliente HTTP existentes.
- **Interface**: as rotas e componentes atuais não implementam busca de produtos, detalhe, story, desejos ou histórico; não confundir busca de lojas no mapa com busca de produtos. O desenho pode reutilizar o cliente HTTP existente após definição de contratos.
- **Limitação**: estas são opções técnicas de pesquisa, não contratos aprovados nem resultado de execução. Nenhum campo, endpoint, limite ou regra de ordenação foi fixado nesta etapa.
