# Contrato proposto: API pública de catálogo

**Estado**: planejamento, rotas ainda não implementadas. Prefixo `/api/v1`; GETs públicos inclusive para visitante sem sessão. Respostas `{ "data": ... }` e `{ "error": { "code", "message", "requestId" } }`; usar política existente `private, no-store`. Sem SDK ou chave privilegiada no navegador.

## Consultas

| Operação | Entrada | Resultado |
| --- | --- | --- |
| `GET /catalog/categories` | Sem sessão. | Categorias publicadas do catálogo e tipos pertencentes a cada uma, identificados por ID. |
| `GET /catalog/products/{id}` | ID estável de produto. | `{status: "found", item: ...}`, `{status: "missing"}` ou `{status: "unavailable"}`; não inclui dados privados. |
| `GET /catalog/offers/{id}` | ID estável de oferta. | Mesmo envelope de referência, com a oferta e o produto associados; não confundir IDs de oferta e produto. |
| `GET /catalog/offers` | `q`, `categoryId`, `typeId`, `minPriceCents`, `maxPriceCents` opcionais. | Ofertas publicadas do shopping ativo, cada uma com produto, variante, loja, preço, disponibilidade, demonstração, promoção válida quando conhecida e relevância; filtros combinados. |
| `GET /catalog/variants/{variantId}` | ID de variante. | Produto, variante e todas as ofertas comparáveis da mesma variante, ordenadas pela regra da comparação. |
| `GET /catalog/variants/{variantId}/similar` | ID de variante. | Outras variantes de produtos da mesma categoria, com ofertas conhecidas, identificadas como alternativas. Não incluir a variante de origem como alternativa. |

Identificadores são dados opacos, estáveis e distintos para produto, variante, oferta e loja. Nenhum GET altera histórico ou requer a 009. Catálogo de demonstração é pequeno: nesta entrega devolver o conjunto elegível completo após filtrar e ordenar; não truncar antes de avaliar relevância, preço ou alternativas. A leitura interna deve ultrapassar limites de linhas do provedor, preservar consistência e falhar integralmente se uma página falhar, conforme [R6](../research.md#r6--estado-e-contratos). Se volume crescer, projetar paginação pública estável em evolução posterior.

### Resultado de busca ilustrativo

```json
{
  "data": {
    "offers": [
      {
        "id": "oferta-demo-a",
        "product": { "id": "produto-demo", "name": "Tênis Exemplo", "categoryId": "tenis", "typeId": "corrida" },
        "variant": { "id": "variante-demo-preta", "label": "Preto" },
        "store": { "id": "loja-demo-a", "name": "Loja Exemplo", "floorId": null },
        "priceCents": 10000,
        "availability": "available",
        "isDemo": true,
        "promotion": null
      }
    ],
    "suggestion": null
  }
}
```

Exemplo fictício, não registro confirmado. `priceCents: null` e `availability: "unknown"` são estados distintos, exibidos como desconhecidos. Localização só consta quando fornecida pelo mapa correspondente; referência da loja continua disponível quando posição não for conhecida. Não calcular desconto nem exibir promoção vigente com dados insuficientes ou vencidos. Resposta não deve transformar valor previamente conhecido em valor atual sem consulta confirmada.

O campo `offerState` indica `active`, `upcoming` ou `expired`. Para oferta fora da vigência, a API não apresenta o preço ou estoque antigos como atuais: devolve preço nulo e disponibilidade desconhecida, e identifica o estado temporal.

## Regras de busca

- Normalização, ordenação e sugestão seguem [research R3–R4](../research.md). Se texto corresponder simultaneamente a nome/sinônimo/categoria, usar o melhor nível. Sem texto, nível neutro. Seleção de sugestão é ação explícita e mantém os filtros, sem execução automática.
- Preço é inteiro em centavos; mínimo e máximo, se fornecidos, são não negativos e inclusivos. Validar entrada numérica integral, combinação de tipo/categoria e `min <= max` no servidor e informar campos inválidos. Preço desconhecido não passa por faixa ativa.
- Sugestão é calculada contra candidatos do catálogo antes dos filtros quando não houver correspondência textual; apenas um termo cadastrado a uma edição de distância com pelo menos quatro letras. Não sugerir correção se o texto corresponder, mas os filtros eliminarem as ofertas.
- `200` com lista vazia indica consulta concluída sem resultados; `400 INVALID_CATALOG_FILTER` indica parâmetros inválidos; `404 CATALOG_ITEM_NOT_FOUND` indica variante ausente/não publicada; `503 CATALOG_UNAVAILABLE` indica fonte não confirmada. Falhas nunca viram lista vazia.

## Promoções e consumo por outras features

- Preservar os contratos atuais `GET /promotions?mallId=...` e `GET /promotions/{id}?mallId=...&revision=...`, formato e critérios da [008](../../008-promocoes-proximas/contracts/api.md); seu repositório projeta a mesma oferta canônica do catálogo. Preservar erro por revisão alterada e revalidar elegibilidade; o catálogo não passa a exigir disponibilidade ou vigência promocional para toda consulta.
- Implementar adaptador real de `CatalogReader` existente para `findProduct`, `findOffer` e `searchProducts`, preservando resultados `found`, `missing` e `unavailable`, a rejeição de falha de acesso e a distinção entre produto e oferta. A 009 ainda precisa conectar suas rotas privadas; este plano não declara desejos, histórico ou recomendações em funcionamento.
- O destino de mapa é a loja da oferta via `/mapa?loja={storeId}`; sem posição confirmada, informar indisponibilidade de localização sem fabricar piso nem distância.
