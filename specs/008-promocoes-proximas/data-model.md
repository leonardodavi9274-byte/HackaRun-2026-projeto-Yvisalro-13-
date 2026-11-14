# Data Model: Pop-ups de promoções próximas

Este documento descreve o desenho proposto; tabelas e serviços ainda não foram criados por este planejamento. A fonte é mínima e somente leitura pela aplicação; gestão empresarial permanece fora do recorte.

## Oferta publicada (`published_promotional_offers`, proposta)

| Campo | Regra |
| --- | --- |
| `id` | Identificador estável, único e opaco; chave primária. |
| `store_id` | Referência obrigatória a `stores.id`; a loja precisa estar ativa e pertencer ao shopping ativo na leitura. |
| `category_id` | Referência obrigatória a `interest_categories.id`; representa a categoria do produto ofertado, sem inferi-la da loja. |
| `product_name` | Texto obrigatório não vazio, 1–120 caracteres após remover espaços externos. |
| `price_cents` | Inteiro não negativo em centavos de real; obrigatório. |
| `previous_price_cents` | Inteiro opcional maior que `price_cents`; quando ausente, não calcular nem exibir desconto. |
| `availability` | `available` ou `unavailable`; apenas `available` é elegível. Ausência ou valor inválido não equivale a disponível. |
| `starts_at`, `ends_at` | Instantes UTC opcionais; se ambos existem, início anterior ao fim. Vigente quando `(starts_at é nulo ou starts_at <= agora) e (ends_at é nulo ou agora < ends_at)`. Prazo ausente não é inventado. |
| `is_demo` | Booleano obrigatório; dados de demonstração identificados como fictícios. |
| `published` | Booleano obrigatório; apenas `true` pode ser retornado como candidata. |
| `updated_at` | Instante UTC obrigatório, mantido pelo banco em cada alteração, usado como revisão de confirmação; não alegar data de atualização se desconhecida. |

O preço e a disponibilidade pertencem à própria oferta; não são criadas tabelas de compra, estoque geral, histórico de preços ou produto completo. Restrições no banco e validação no serviço impedem valores incoerentes. Na API, preços em centavos são inteiros e a UI os formata como BRL. Desconto percentual, se apresentado, é derivado exclusivamente dos preços coerentes.

Para garantir a revisão em alterações rápidas, usar também `revision` inteiro positivo, incrementado atomicamente em cada atualização, devolvido pela API; não depender de precisão de relógio. A revisão muda quando qualquer dado da oferta muda. Alteração do estado da loja é verificada separadamente pela API e mapa. Desconto e datas inexistentes permanecem nulos.

## Relacionamentos e proteção

- Shopping ativo → lojas ativas (`stores.mall_id`) → ofertas publicadas; categoria da oferta → `interest_categories`. O banco principal é o Supabase existente.
- A API usa o adaptador servidor e filtra loja ativa/shopping, publicação, disponibilidade e tempo; não expõe chave privilegiada. Aplicar RLS e negar acesso direto de `anon` e `authenticated`, seguindo o padrão da feature 005. A leitura pública expõe somente dados de oferta pública, sem perfil ou coordenadas.
- O seed opcional contém registros explicitamente fictícios ligados às lojas/categorias existentes; nenhuma oferta real é simulada. Uma tabela vazia em fonte acessível é resultado vazio; fonte indisponível é erro.
- Quando o catálogo definitivo existir, migrar ou substituir a tabela e apontar a porta ao catálogo definitivo numa transição coordenada. Não manter duas fontes concorrentes nem escrita dupla.

## Referência de proximidade

`mallId`, `mapVersion`, `pointId`, piso, nó e unidade são derivados de `GET /api/v1/mall` e do ponto escolhido na feature 005. A seleção do ponto deve capturar também shopping e versão do mapa; não confiar em um ID sem contexto. Ponto inválido, versão alterada, shopping diferente, loja sem unidade/porta ou caminho inexistente eliminam a candidata. A distância é a soma das arestas do grafo, em metros simulados; mesmo piso e `distanceM <= 100` antes de arredondar. Arredondar somente a distância exibida ao metro mais próximo.

O ponto não é coordenada de GPS; não é enviado à API de ofertas e não é registrado no servidor. Troca de usuário ou identidade desconhecida invalida o ponto **para ofertas**. O provider de rota não deve ser limpo de modo que interrompa uma rota ativa; exigir nova escolha para proximidade quando o vínculo for inválido.

## Estado transitório e transições

| Estado | Origem e regra |
| --- | --- |
| Rota | `active`, `inactive` ou `unknown` para o consumidor promocional; provider montado e `isActive === false` comprovam `inactive`. Chegada ainda é `active`; sem provider ou inicialização confiável é `unknown`. |
| Sessão promocional | Memória do aplicativo, associada ao usuário autenticado; contém conjunto de IDs dispensados. Recarregar/fechar ou trocar usuário descarta; não usa armazenamento persistente. |
| Visita ao Início | Começa quando `/inicio` entra em exibição e termina ao sair; `shown` passa de falso para verdadeiro ao abrir um pop-up e só reinicia na próxima visita. Abrir e fechar não libera outra oferta na mesma visita. |
| Avaliação | `idle → loading → confirming → visible`; falha, ausência, alteração de contexto ou rota ativa voltam a `idle`/`suppressed`; fechamento por rota não conta como dispensa, mas a abertura já consumiu a visita. |
| Dispensa | `visible → dismissed`: adicionar ID ao conjunto da sessão em **Agora não**, **Fechar** ou Escape e retornar foco. Abrir mapa por **Me leve lá** encerra diálogo sem registrar dispensa. |

Ao iniciar rota durante consulta ou apresentação, invalidar todas as respostas anteriores e remover diálogo no mesmo ciclo de renderização. Encerrar rota permite nova avaliação somente se as regras de visita e sessão permitirem; não reproduzir uma fila de ofertas suprimidas.
