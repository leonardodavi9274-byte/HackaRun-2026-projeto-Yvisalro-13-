# UI Contract: Mapa do shopping

Referências: [09 — Mapa](../../../docs/imagens/achei/09-mapa.png), [10 — Rota ativa](../../../docs/imagens/achei/10-rota-ativa.png), [11 — Oferta próxima](../../../docs/imagens/achei/11-oferta-proxima.png). Linguagem visual e componentes compartilhados da feature 004 (`FormFeedback`, `Icon`, tokens de `global.css`).

## Rotas

| Caminho | Acesso | Conteúdo |
| --- | --- | --- |
| `/mapa` | Público. Resolvido em `App.jsx` **antes** da espera pela sessão (research D8). | Mapa em consulta. |
| `/mapa?loja={storeId}` | Público. | Mapa com a loja pré-selecionada como destino (US5, FR-017). Loja inexistente ou sem posição → **Loja não encontrada no mapa**. |

A rota ativa não fica na URL: recarregar encerra a rota (premissa da spec).

## Estrutura de código (MVVM, padrão da feature 004)

```text
frontend/src/features/mall-map/
  models/
    map-document.js        leitura do documento, pisos, unidades, pontos
    pathfinding.js         grafo + Dijkstra; distâncias a partir de um nó
    instructions.js        direção (research D4) → { kind, distanceM, ... }
    geolocation.js         haversine e classificação dentro/fora
    store-search.js        normalização sem acento/caixa e filtro
  repositories/
    mall.repository.js     GET /api/v1/mall via http-client
  viewmodels/
    ActiveRouteProvider.jsx  contexto global da rota ativa (useActiveRoute)
    useMallMapViewModel.js   carregamento, piso, zoom, seleção, busca, lista
    useRouteViewModel.js     partida, cálculo, passos, substituição
    useLocationViewModel.js  permissão e estados de localização
  views/
    MallMapView.jsx          página /mapa
    FloorPlan.jsx            SVG do piso, sombras, corredores, traçado
    StoreMarker.jsx          botão com sacola/logo
    FloorSelector.jsx, ZoomControls.jsx, MapSearch.jsx
    StoreDetailsSheet.jsx    nome, piso, categoria, Traçar rota
    StartPointPicker.jsx     "Onde você está?" em lista e no mapa
    NearbyPanel.jsx          "Perto de você"
    StoreListView.jsx        lista textual por piso + filtro de categoria
    RouteBanner.jsx          seta + instrução + "Anúncios pausados durante a rota"
    RouteSheet.jsx           tempo, distância, chegada, Anterior/Próxima, Encerrar rota
    LocationNotice.jsx       Usar minha localização / mensagens / seleção manual
frontend/src/shared/components/BottomNav.jsx   Início + Mapa (research D12)
```

## Estados da tela `/mapa`

| Estado | O que aparece |
| --- | --- |
| Carregando | `role="status"` "Carregando o mapa…"; nenhum shopping vazio. |
| Erro ou indisponível | `FormFeedback` com a mensagem do contrato de API e **Tentar novamente**. |
| Sem conexão (antes de carregar) | "Sem conexão. Verifique sua internet e tente novamente." com **Tentar novamente**. |
| Consulta | Busca, selo do shopping, **Mapa de demonstração** (se `isDemo`), seletor de pisos, zoom, marcadores, **Ver lista de lojas**, **Usar minha localização** e painel **Perto de você**. |
| Loja selecionada | `StoreDetailsSheet`; marcador destacado com contorno e texto "Selecionada". |
| Escolhendo partida | `StartPointPicker` com lista agrupada por piso e pontos clicáveis no mapa; **Cancelar**. |
| Rota ativa | `RouteBanner` no topo, traçado, `RouteSheet` no rodapé; **Anúncios pausados durante a rota** visível o tempo todo. Não há **Reservar item**. |
| Chegou | `RouteBanner` com "Você chegou à {loja}"; **Encerrar rota** e **Voltar ao mapa**. |

## Elementos e textos

| Elemento | Comportamento | Acessibilidade |
| --- | --- | --- |
| Busca | Placeholder **Buscar loja no mapa**. Filtra por nome e categoria sem acento ou caixa; mostra até 8 sugestões com piso. Sem resultado: **Nenhuma loja encontrada** e **Limpar busca**. | `role="combobox"`, lista `listbox`, setas para navegar, Enter seleciona. |
| Seletor de pisos | Botões P1, P2, P3… vindos do documento, em ordem decrescente como na tela 09. | `aria-pressed`; piso ativo com fundo escuro **e** texto "Piso 1 selecionado" acessível. |
| Zoom | **+** e **−**; também roda do mouse e pinça. Limites de 1× a 4×. Arraste para mover; setas do teclado movem o mapa quando ele tem foco. | Nomes "Aproximar mapa" e "Afastar mapa". |
| Marcador | Sacola; com logo e zoom ≥ 2×, logo. Clique ou Enter abre detalhes. | `button` com nome "{loja}, {categoria}, Piso {n}". |
| Detalhes da loja | Nome, categoria, piso; **Traçar rota** (indisponível com texto **Localização no mapa indisponível** para loja sem posição). | Diálogo não modal; foco vai para o título. |
| Onde você está? | Pontos de referência por piso (Entrada Norte, Escada rolante A…). | Lista de botões; também focáveis no mapa. |
| Perto de você | Até 5 lojas por distância de caminhada simulada, cartão com iniciais, nome, piso e distância ("30 m"). Sem partida: **Escolha onde você está para ver as lojas próximas**. | Lista com nome completo em cada cartão. |
| Lista de lojas | Agrupada por piso, filtro por categoria, mesma ação **Traçar rota**. | Cabeçalhos por piso; filtro com `aria-pressed`. |
| Usar minha localização | Texto de finalidade: "Usamos sua localização só para saber se você está no shopping. Ela não é salva." | Resultado anunciado em `role="status"`. |
| Banner da rota | Ícone e texto do mesmo `kind` (research D4), ex.: seta à esquerda + "Em 40 m, vire à esquerda". Linha secundária com referência ("Depois da Casa Ninho"). | `aria-live="polite"` ao mudar de passo. |
| Painel da rota | "2 min · 140 m", "Chegada na {loja} · Piso 2 via escada rolante", **Anterior**, **Próxima**, **Encerrar rota**. | Botões com texto; foco permanece no painel ao avançar. |
| Substituir rota | Ao escolher outro destino ou partida com rota ativa: "Substituir a rota atual até {loja}?" **Substituir** / **Manter rota**. | Diálogo com foco preso e Esc = Manter rota. |

## Mensagens de localização

| Estado | Mensagem | Ações |
| --- | --- | --- |
| `inside` | **Você está no {shopping}**. Escolha onde você está para ver as lojas próximas. | Escolher ponto de partida. |
| `outside` | Você está a aproximadamente {distância} do {shopping}. | Continuar no mapa. |
| `denied` | **Não foi possível encontrar a localização do dispositivo**. A permissão foi negada. | **Escolher shopping manualmente**. |
| `unavailable` / `timeout` | **Não foi possível encontrar a localização do dispositivo**. | **Tentar novamente**, **Escolher shopping manualmente**. |
| Seleção manual | Lista com o único shopping ativo; ao confirmar: "{shopping} selecionado". | — |

Distância de saída formatada: abaixo de 1 km em metros arredondados a 10 m; acima, em km com uma casa decimal.

## Integração com outras telas

- `useActiveRoute()` exportado do provedor é o ponto de consulta da tela 11 e de outras ofertas de proximidade. Nenhuma oferta de proximidade é implementada nesta feature.
- **Me leve lá** e **Me leve até a loja** (telas 05, 06, 07 e 11, futuras) navegam para `/mapa?loja={storeId}`.
- A `BottomNav` aparece em `/mapa` e `/inicio`, com o item da página atual marcado por `aria-current="page"` e texto, não só cor.

## Responsividade

De 360 a 1440 px sem rolagem horizontal da página. Até 720 px: painéis como folhas inferiores, como nas telas 09 e 10. Acima de 720 px: painel lateral fixo à esquerda (detalhes, partida, rota, lista) e mapa ocupando o restante.
