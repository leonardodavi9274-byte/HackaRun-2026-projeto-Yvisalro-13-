# Data Model: Mapa do shopping, lojas próximas e trajeto simulado

**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

Dados persistidos no PostgreSQL do Supabase: shopping, versões do mapa e lojas. Rota, ponto de partida e posição do dispositivo existem só no navegador, durante o uso, e nunca são gravados.

## Tabelas

As migrações seguem a numeração existente: `0015_mall_map_stores.sql` (estrutura) e `0016_demo_mall_seed.sql` (dados de demonstração). Como nas demais tabelas, RLS fica habilitado, nada é concedido a `anon` e `authenticated`, e só `service_role` acessa. A WebAPI é a única leitora.

### `malls`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `text` PK | Identificador estável, ex.: `aurora`. |
| `name` | `text` | Não vazio. Nome exibido no selo do mapa. |
| `reference_lat` | `double precision` | Entre -90 e 90. Ponto de referência para a geolocalização. |
| `reference_lng` | `double precision` | Entre -180 e 180. |
| `area_radius_m` | `integer` | Entre 50 e 5000; padrão 500. |
| `is_demo` | `boolean` | `true` para nome e coordenadas fictícios ou provisórios. |
| `active` | `boolean` | No máximo um shopping ativo (índice único parcial `where active`). Esta feature assume um único shopping. |

### `mall_maps`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `mall_id` | `text` FK → `malls` | |
| `version_label` | `text` | Ex.: `provisorio-1`, `coordenacao-2026-12`. Único por shopping. |
| `source` | `text` | `provisional` ou `coordination`. |
| `document` | `jsonb` | [Documento do mapa](#documento-do-mapa), validado pela WebAPI ao ler. |
| `active` | `boolean` | Exatamente uma versão ativa por shopping (índice único parcial). |
| `created_at` | `timestamptz` | Padrão `now()`. |

Trocar de mapa significa inserir a nova versão e, na mesma transação, desativar a anterior e ativar a nova. Versões antigas ficam guardadas para referência.

### `stores`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `text` PK | Identificador estável usado em `/mapa?loja=`, ex.: `grao-fino`. |
| `mall_id` | `text` FK → `malls` | |
| `name` | `text` | 1 a 80 caracteres. |
| `category_id` | `text` FK → `interest_categories` | Reutiliza as categorias da feature 004 (research D9). |
| `unit_id` | `text` nulo | Unidade no documento do mapa ativo. Nulo ou ausente no mapa ativo = loja sem posição. |
| `logo_url` | `text` nulo | URL pública no bucket `store-logos`; nulo = marcador de sacola. |
| `is_demo` | `boolean` | `true` para as lojas fictícias desta feature. |
| `active` | `boolean` | Lojas inativas não são retornadas. |

O piso da loja não é guardado em `stores`, porque vem da unidade no documento. Assim, a troca de planta não deixa piso e posição divergentes.

## Documento do mapa

Formato `schemaVersion: 1`. Coordenadas planas em **metros**, origem no canto superior esquerdo do piso, eixo **x** para a direita e eixo **y** para baixo (mesma orientação do SVG).

```json
{
  "schemaVersion": 1,
  "floors": [
    {
      "id": "p1",
      "label": "P1",
      "name": "Piso 1",
      "order": 1,
      "width": 120,
      "height": 80,
      "outline": [[0,0],[120,0],[120,80],[0,80]],
      "corridors": [ [[10,35],[110,35],[110,45],[10,45]] ],
      "units": [
        { "id": "p1-u01", "polygon": [[12,10],[38,10],[38,32],[12,32]], "door": "p1-n03", "anchor": [25,21] }
      ],
      "points": [
        { "id": "p1-entrada-norte", "kind": "entrance", "label": "Entrada Norte", "node": "p1-n01" },
        { "id": "p1-escada-rolante-a", "kind": "escalator", "label": "Escada rolante A", "node": "p1-n05" }
      ],
      "nodes": [
        { "id": "p1-n01", "x": 60, "y": 2 },
        { "id": "p1-n03", "x": 25, "y": 40 }
      ]
    }
  ],
  "edges": [
    { "from": "p1-n01", "to": "p1-n02", "kind": "walk" },
    { "from": "p1-n05", "to": "p2-n05", "kind": "escalator", "lengthM": 15 }
  ]
}
```

### Regras de validação (WebAPI, ao ler a versão ativa)

1. `schemaVersion` igual a 1 e ao menos um piso; `id` de pisos, unidades, pontos e nós únicos em todo o documento.
2. `order` dos pisos únicos; `label` não vazio.
3. Polígonos com ao menos 3 vértices, dentro de `width` × `height`.
4. Toda `door`, `point.node` e extremidade de aresta referencia um nó existente.
5. Arestas `walk` ligam nós do mesmo piso, e o comprimento é calculado pela distância euclidiana. Arestas `escalator`, `stairs` ou `elevator` ligam pisos diferentes e exigem `lengthM > 0`.
6. Arestas são bidirecionais.
7. `point.kind` ∈ `entrance`, `escalator`, `stairs`, `elevator`, `landmark`.

Documento inválido → `503 MAP_INVALID` (ver [contracts/api.md](contracts/api.md)), com o motivo registrado em log e sem o conteúdo do mapa. Unidade sem caminho até nenhum ponto não invalida o documento: é tratada na interface como "sem caminho" (US2.8).

## Estado no navegador (não persistido)

| Entidade | Conteúdo | Ciclo de vida |
| --- | --- | --- |
| **Ponto de partida** | `pointId` de um ponto de referência. | Escolhido pela pessoa; descartado ao recarregar. |
| **Rota** | `startPointId`, `storeId`, lista de nós, `instructions[]`, `totalM`, `etaMin`, `stepIndex`. | Do início até encerrar, substituir ou recarregar. Exposta por `useActiveRoute()`. |
| **Instrução** | `kind` (`straight`, `slight-left`, `slight-right`, `left`, `right`, `u-turn`, `floor-change`, `arrive`), `distanceM`, `floorId`, `connector`, `landmark`. | Derivada da rota; texto e seta vêm do mesmo `kind` (research D4). |
| **Localização** | Estado `idle`, `requesting`, `inside`, `outside` (com distância em metros), `denied`, `unavailable` ou `timeout`. | Só em memória; coordenadas brutas não são guardadas depois do cálculo. |

### Cálculo da direção

Para os trechos `a → b` e `b → c` (y para baixo):

- `cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)`
- `angle = |atan2(cross, dot)|`, com `dot = (b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y)`
- `cross > 0` → **direita**; `cross < 0` → **esquerda** (eixo y para baixo inverte o sinal cartesiano).
- Faixas de `angle`: até 30° `straight`; 30–60° `slight-*`; 60–150° `left`/`right`; acima de 150° `u-turn`.

### Tempo estimado

`etaMin = ceil(totalM / 70)`, mínimo 1 minuto (premissa da spec: ~70 m/min). Arestas entre pisos somam `lengthM` à distância.

## Transições da rota

```text
consulta ──Traçar rota──▶ escolhendo-partida ──ponto escolhido──▶ ativa(step 0)
ativa ──Próxima/Anterior──▶ ativa(step ±1)
ativa(último step) ──Próxima──▶ chegou
ativa | chegou ──Encerrar rota──▶ consulta
ativa ──novo destino/partida + confirmar──▶ ativa(nova rota, step 0)
escolhendo-partida ──sem caminho──▶ consulta + mensagem "Não foi possível traçar um caminho até esta loja"
qualquer ──recarregar──▶ consulta
```

`isActive` é verdadeiro em `ativa` e `chegou`, até a pessoa encerrar.
