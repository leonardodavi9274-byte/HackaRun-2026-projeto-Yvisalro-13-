# API Contract: Promoções publicadas para proximidade

Contrato **proposto**, ainda não implementado. Base `/api/v1`; respostas seguem `{ "data": ... }` e erros `{ "error": { "code", "message" } }`, com `Cache-Control: no-store`. Os dois endpoints são públicos e retornam apenas oferta pública; não recebem ponto, coordenadas, histórico ou interesses. `GET /api/v1/mall` e `GET /api/v1/me` continuam sendo as fontes existentes de mapa e perfil autenticado.

## `GET /api/v1/promotions?mallId={mallId}`

Retorna candidatas do shopping ativo informado. A API não calcula proximidade nem personalização. Verifica publicação, loja ativa, categoria válida, disponibilidade `available`, preço válido e vigência no horário do servidor. Se não houver candidatas, devolve `200` com `offers: []` somente quando a fonte estiver acessível e o shopping existir.

```json
{
  "data": {
    "mallId": "aurora",
    "offers": [
      {
        "id": "oferta-demo-cafe",
        "revision": 1,
        "storeId": "grao-fino",
        "categoryId": "cafe-doces",
        "productName": "Café demonstrativo",
        "priceCents": 1200,
        "previousPriceCents": null,
        "availability": "available",
        "startsAt": null,
        "endsAt": null,
        "updatedAt": "2026-11-14T12:00:00Z",
        "isDemo": true
      }
    ]
  }
}
```

O exemplo é fictício e não representa registros existentes. A implementação devolve todas as candidatas válidas do shopping, sem truncar antes da ordenação por proximidade e interesse; se houver necessidade de paginação futura, completar todas as páginas antes de selecionar. `mallId` obrigatório; `400 INVALID_MALL` para valor ausente/inválido; `404 MALL_NOT_ACTIVE` para shopping não ativo; `503 PROMOTIONS_UNAVAILABLE` quando não puder confirmar a fonte. Nenhum erro é convertido em lista vazia.

## `GET /api/v1/promotions/{id}?mallId={mallId}&revision={revision}`

Confirma imediatamente antes da apresentação a oferta candidata, sua revisão, loja ativa, shopping, disponibilidade e vigência. `200` retorna `{ "data": { "offer": { ... } } }` com os mesmos campos e a mesma revisão. `404 OFFER_NOT_ELIGIBLE` significa oferta ausente, não publicada, fora de vigência, indisponível ou loja inativa; `409 OFFER_CHANGED` indica revisão divergente; `400 INVALID_PROMOTION_REQUEST` indica parâmetros inválidos; `503 PROMOTIONS_UNAVAILABLE` indica impossibilidade de confirmar. O cliente descarta a candidata ao receber erro, interrupção ou mudança de contexto. Respostas antigas não autorizam abertura posterior.

O cliente seleciona novamente a partir de uma listagem atual quando apropriado; não entra em repetição automática ilimitada. No instante de abertura, usa a resposta individual confirmada e verifica novamente mapa, ponto, usuário, visita e rota. Enquanto o diálogo estiver visível, ao recuperar foco e a cada 30 segundos revalida oferta e mapa; ao expirar o prazo conhecido também revalida imediatamente. Em falha ou oferta inelegível, fecha sem afirmar que ainda está válida; se apenas a posição da loja deixar de existir e a oferta continuar confirmada, desabilita **Me leve lá** e explica. A validação é uma fotografia, não promessa de estoque futuro.

## Implementação e integração propostas

- Backend: domínio/porta/serviço/repositório Supabase/controller/rotas conforme arquitetura atual; consultas servem somente loja ativa e shopping ativo, conferem invariantes de [data-model.md](../data-model.md) e não incluem dados privados.
- Frontend: repositório usa `http-client` existente e cancelamento; combina oferta, dados recentes de `GET /mall` e interesse confirmado da própria conta. A categoria da oferta não é presumida pela categoria da loja.
- Consumo autenticado de `GET /me` mantém o controle existente; falha ou identidade trocada descarta interesses e continua sem personalização. Nenhuma requisição promocional envia o ponto interno ou usa consentimento de e-mail.
