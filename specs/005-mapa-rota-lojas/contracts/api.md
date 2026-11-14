# API Contract: Mapa do shopping

Base: `/api/v1`. Segue as convenções da feature 004: resposta de sucesso em `{ "data": ... }`, erros em `{ "error": { "code", "message" } }`, cabeçalhos `Cache-Control: private, no-store` e `X-Request-Id` aplicados pelos middlewares existentes.

## `GET /api/v1/mall`

Retorna o shopping ativo, a versão ativa do mapa e as lojas ativas, numa só resposta.

- **Autenticação**: nenhuma. Não lê nem exige o cookie de sessão. A resposta não contém dados pessoais.
- **Entrada**: nenhuma. A posição do dispositivo e o ponto de partida **nunca** são enviados (FR-014).

### 200 OK

```json
{
  "data": {
    "mall": {
      "id": "aurora",
      "name": "Shopping Aurora",
      "isDemo": true,
      "reference": { "lat": -10.1844, "lng": -48.3336 },
      "areaRadiusM": 500
    },
    "map": {
      "versionLabel": "provisorio-1",
      "source": "provisional",
      "document": { "schemaVersion": 1, "floors": [], "edges": [] }
    },
    "stores": [
      {
        "id": "grao-fino",
        "name": "Grão Fino",
        "category": { "id": "cafe-doces", "label": "Café e doces" },
        "unitId": "p1-u04",
        "floorId": "p1",
        "logoUrl": null,
        "isDemo": true
      },
      {
        "id": "loja-sem-posicao",
        "name": "Exemplo sem posição",
        "category": { "id": "moda", "label": "Moda" },
        "unitId": null,
        "floorId": null,
        "logoUrl": null,
        "isDemo": true
      }
    ]
  }
}
```

Regras da resposta:

- `document` é o documento validado conforme [data-model.md](../data-model.md#documento-do-mapa).
- `floorId` é derivado pela WebAPI a partir da unidade no mapa ativo. Se `unit_id` for nulo ou não existir no mapa ativo, `unitId` e `floorId` vêm `null`: é a loja sem posição.
- Lojas ordenadas por nome (comparação `pt-BR`); só `active = true`.
- `isDemo` do shopping é `true` quando o shopping ou o mapa forem de demonstração. A interface usa esse valor para exibir **Mapa de demonstração**.

### Erros

| Status | `code` | Quando | Reação da interface |
| --- | --- | --- | --- |
| 503 | `MAP_UNAVAILABLE` | Supabase não configurado, consulta falhou ou não há shopping ou mapa ativo. | Mensagem de indisponibilidade e **Tentar novamente**. |
| 503 | `MAP_INVALID` | O documento ativo não passa na validação. Detalhe só no log. | Mesma reação de `MAP_UNAVAILABLE`, com texto "O mapa está temporariamente indisponível". |
| — | (rede) | Sem conexão ou tempo esgotado no cliente. | **Sem conexão**, com **Tentar novamente**. |

Nenhum erro devolve um mapa vazio como se fosse um shopping sem lojas.

## Organização no backend

| Camada | Arquivo previsto | Responsabilidade |
| --- | --- | --- |
| Domínio | `domain/mall/map-document.ts` | Tipos e validação do documento (regras 1–7). |
| Porta | `application/ports/mall-repository.ts` | `activeMall()` → shopping, mapa ativo e lojas brutas. |
| Serviço | `application/services/mall.service.ts` | Valida o documento, deriva `floorId`, monta a resposta e converte falhas em `MAP_UNAVAILABLE` ou `MAP_INVALID`. |
| Infraestrutura | `infrastructure/supabase/mall.repository.ts` | Três consultas (`malls` ativo, `mall_maps` ativo, `stores` ativas com a categoria). |
| HTTP | `presentation/http/controllers/mall.controller.ts`, `routes/mall.routes.ts` | `GET /mall`, registrado em `routes/index.ts`. |

Sem cache no servidor neste recorte: o documento de um shopping é pequeno e a validação é linear no número de elementos. Se for necessário, um cache por `mall_maps.id` pode ser acrescentado depois, sem mudar o contrato.
