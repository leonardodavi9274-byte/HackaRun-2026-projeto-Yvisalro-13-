# API Contract: Tela inicial e descoberta

Base /api/v1, envelope da WebAPI existente. Recurso público somente de leitura.

## GET /api/v1/home

Sem autenticação. Não aceita shoppingId no MVP; usa o shopping ativo marcado como padrão. Não grava visita, busca ou preferência.

### Sucesso 200

~~~json
{
  "data": {
    "generatedAt": "2026-11-14T12:00:00.000Z",
    "shopping": { "id": "uuid", "name": "Shopping demonstrativo", "isDemo": true },
    "sections": {
      "categories": { "status": "ready", "items": [{ "id": "moda", "label": "Moda", "isDemo": true }] },
      "stories": { "status": "empty", "items": [] },
      "featuredOffers": {
        "status": "ready",
        "items": [{
          "offerId": "uuid",
          "product": { "id": "uuid", "name": "Produto demonstrativo", "imageUrl": null, "imageAlt": null },
          "store": { "id": "uuid", "name": "Loja demonstrativa", "floorLabel": "Piso 1" },
          "priceCents": 12500, "currency": "BRL", "previousPriceCents": 15000,
          "stockStatus": "in_stock", "validUntil": "2026-11-30T23:59:59.000Z",
          "lastUpdatedAt": "2026-11-14T11:00:00.000Z", "isDemo": true
        }]
      },
      "carousels": { "status": "ready", "items": [{ "id": "uuid", "title": "Descubra", "isDemo": true, "products": [] }] }
    }
  }
}
~~~

### Estados

| Estado | Significado | Interface |
| --- | --- | --- |
| ready | Consulta concluída com itens | Renderizar conteúdo. |
| empty | Consulta concluída sem itens vigentes | Mostrar estado vazio, sem substitutos inventados. |
| unavailable | Consulta da seção falhou | Preservar demais seções, informar e oferecer retry. |

Todas as seções têm items como array. unavailable usa array vazio. Se ao menos uma consulta completar, a API responde 200. Se todas falharem, retorna 503:

~~~json
{
  "error": {
    "code": "HOME_UNAVAILABLE",
    "message": "Não foi possível carregar a tela inicial.",
    "requestId": "identificador"
  }
}
~~~

Erros internos do banco não são devolvidos. Resposta usa no-store até regra de cache explícita.

### Regras

- Limites: 12 categorias, 10 stories, 8 ofertas e 6 carrosséis com até 10 produtos cada.
- Ordem determinística por sort_order/home_rank/position, desempate por id.
- Categoria só aparece quando há produto publicado com oferta visível no shopping padrão.
- Oferta/story precisa estar publicado e vigente, com loja ativa; produto relacionado também publicado.
- Valores em centavos inteiros BRL; datas ISO 8601 UTC. Sem imagem, não presumir URL. Imagem existente deve trazer alt.
- isDemo=true se qualquer entidade visível do conteúdo for demonstrativa.
- Desconto/preço anterior só quando previousPriceCents existir e exceder o preço atual.
- GET não altera dados. Métodos de escrita não fazem parte do contrato.

## Segurança

Browser chama apenas a WebAPI. O cliente de leitura Supabase usa publishable key e sessão desativada. RLS restringe SELECT; sem grants públicos de escrita. Chaves secret/service_role ignoram RLS e não podem ser usadas por esse caminho.
