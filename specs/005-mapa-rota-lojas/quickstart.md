# Quickstart: Mapa do shopping, lojas próximas e trajeto simulado

Guia para executar e conferir a feature **depois de implementada**. Os resultados abaixo são esperados; nenhum deles foi executado durante o planejamento. Conforme a constituição, isto não é etapa obrigatória de testes.

## Pré-requisitos

- Base da feature 004 funcionando: projeto Supabase com as migrações 0001–0014 aplicadas e `backend/.env` preenchido (ver [quickstart da 004](../004-cadastro-preferencias/quickstart.md)).
- Migrações desta feature aplicadas em ordem no SQL Editor: `0015_mall_map_stores.sql` e `0016_demo_mall_seed.sql`.
- Para logos (opcional): bucket público `store-logos` no Supabase Storage. As lojas de demonstração não usam logo.
- Navegador atual com suporte a geolocalização. Usar `http://127.0.0.1:5173`, que conta como contexto seguro.

## Executar

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run build
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run dev
```

Com Node 24 no PATH: `npm run build` e `npm run dev`.

## Roteiro de conferência

| # | Ação | Resultado esperado | Referência |
| --- | --- | --- | --- |
| 1 | `GET http://127.0.0.1:3000/api/v1/mall` | 200 com `mall.name = "Shopping Aurora"`, `map.source = "provisional"` e lojas com `isDemo: true`. | contracts/api.md |
| 2 | Abrir `/mapa` sem estar logado | Mapa carrega com **Mapa de demonstração**, P1 ativo e marcadores de sacola. | US1.1, D8 |
| 3 | Trocar para P2 | Marcadores e lista mostram só lojas do P2; piso ativo indicado por texto. | US1.2 |
| 4 | Buscar "cafe" | Encontra "Grão Fino" (Café e doces); escolher leva ao piso e destaca o marcador. | US1.3 |
| 5 | Buscar "xyz" | **Nenhuma loja encontrada** e **Limpar busca**. | US1.4 |
| 6 | **Ver lista de lojas** | Todas as lojas por piso, filtro de categoria; a loja sem posição mostra **Localização no mapa indisponível**. | US1.5, edge case |
| 7 | Loja do P2 → **Traçar rota** → Entrada Norte (P1) | Traçado, primeira instrução com seta e texto iguais, tempo e distância, **Anúncios pausados durante a rota**. | US2.1–2 |
| 8 | Avançar até a conexão | Instrução "Pegue a escada rolante até o Piso 2"; o mapa passa ao P2. | US2.3 |
| 9 | Avançar até o fim | **Você chegou à {loja}**. | US2.5 |
| 10 | **Encerrar rota** | Mapa volta à consulta; aviso de anúncios some. | US2.6 |
| 11 | Com rota ativa, escolher outra loja | Diálogo **Substituir a rota atual…**; **Manter rota** não muda nada. | US2.7 |
| 12 | Com rota ativa, recarregar | Mapa volta à consulta, sem rota. | edge case |
| 13 | **Usar minha localização** e negar | **Não foi possível encontrar a localização do dispositivo** + **Escolher shopping manualmente**; mapa continua utilizável. | US3.4 |
| 14 | Permitir localização fora de Palmas | "Você está a aproximadamente … do Shopping Aurora". | US3.3 |
| 15 | Ferramentas do navegador → Sensores → posição perto da referência | **Você está no Shopping Aurora**; nenhum ponto azul aparece por causa do GPS. | US3.2 |
| 16 | Na aba Rede, durante os passos 13–15 | Nenhuma requisição leva latitude ou longitude. | FR-014, SC-007 |
| 17 | Escolher ponto de partida e abrir **Perto de você** | Até 5 lojas ordenadas por distância; trocar a partida reordena. | US4.1–3 |
| 18 | Abrir `/mapa?loja=grao-fino` | Grão Fino selecionada; segue para **Onde você está?**. | US5.1 |
| 19 | Abrir `/mapa?loja=nao-existe` | **Loja não encontrada no mapa**. | US5.2 |
| 20 | Parar o backend e abrir `/mapa` | Mensagem de indisponibilidade com **Tentar novamente**, sem mapa vazio. | FR-020 |
| 21 | Navegar só com Tab, Enter e setas | Busca, pisos, zoom, marcadores, rota e lista operáveis. | FR-021, SC-005 |
| 22 | Larguras 360 e 1440 px | Sem rolagem horizontal da página. | SC-005 |

## Trocar pelo mapa da coordenação

1. Converter a planta para o [documento do mapa](data-model.md#documento-do-mapa): contornar pisos, unidades e corredores numa ferramenta vetorial na escala da planta (metros), marcar portas, pontos de referência, nós e conexões entre pisos.
2. Inserir a nova linha em `mall_maps` com `source = 'coordination'` e `active = false`.
3. Atualizar `stores.unit_id` para as unidades da nova planta. Lojas sem unidade ficam "sem posição".
4. Numa transação, desativar a versão provisória e ativar a nova.
5. Repetir os passos 1–12 e 17–19 do roteiro. Se o documento for inválido, a API responde `MAP_INVALID` e o log informa a regra violada.
6. Ajustar `malls.reference_lat`, `reference_lng`, `area_radius_m` e `is_demo` conforme a coordenação.
