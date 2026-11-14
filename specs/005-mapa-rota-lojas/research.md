# Research: Mapa do shopping, lojas próximas e trajeto simulado

**Feature**: [spec.md](spec.md) | **Date**: 2026-11-14

Cada decisão registra o que foi escolhido, por quê e as alternativas descartadas. Nenhuma decisão altera as tecnologias ratificadas na constituição.

## D1 — Fonte dos dados do mapa e das lojas

- **Decision**: Guardar shopping, versões do mapa e lojas no PostgreSQL do Supabase, em três tabelas novas (`malls`, `mall_maps`, `stores`). O desenho do mapa de cada versão fica num documento JSON (`jsonb`) com formato próprio e versionado. A WebAPI lê e valida esse documento e o entrega ao frontend.
- **Rationale**: A constituição exige uma única fonte principal de dados. Lojas serão reaproveitadas pelo futuro painel empresarial e pelo catálogo, então precisam ser registros relacionais. O desenho do mapa é lido sempre por inteiro, por versão; um documento único é mais simples que modelar polígonos e arestas em tabelas. A troca do mapa provisório pela planta da coordenação vira a inserção de uma nova versão (FR-019).
- **Alternatives considered**: (a) Arquivo JSON estático no frontend: cria uma segunda fonte de dados e obriga a recompilar o frontend para trocar o mapa. (b) Tabelas para pisos, polígonos, nós e arestas: muitas consultas e migrações para dados que nunca são lidos em partes. (c) PostGIS: não há consulta espacial no servidor que justifique a extensão.

## D2 — Formato do documento do mapa

- **Decision**: Documento `schemaVersion: 1` com coordenadas planas em **metros**, por piso: contorno do piso, unidades (lojas) como polígonos, corredores, pontos de referência e nós de caminho. As arestas ficam no nível do documento e podem ligar pisos (escada rolante, escada ou elevador). Cada unidade tem um nó de porta. O formato completo está em [data-model.md](data-model.md#documento-do-mapa).
- **Rationale**: Com coordenadas em metros, a distância de caminhada é o comprimento real do traçado e não precisa ser cadastrada à mão. O mesmo documento serve para desenho, busca de caminho e cálculo de proximidade. A planta da coordenação pode ser convertida contornando-a numa ferramenta vetorial e exportando os pontos na escala da planta.
- **Alternatives considered**: (a) Importar SVG ou DWG diretamente: o formato da coordenação ainda não é conhecido e não traz grafo de caminhos. (b) Coordenadas em pixels: dependem da tela e exigem uma escala separada para distâncias.

## D3 — Onde calcular a rota

- **Decision**: Calcular no frontend, com o algoritmo de Dijkstra sobre o grafo do documento. As arestas de caminhada usam a distância euclidiana; as arestas entre pisos usam a distância equivalente informada no documento.
- **Rationale**: O grafo de um shopping tem poucas centenas de nós, então o cálculo é imediato no navegador. Com o mapa já carregado, rotas continuam disponíveis sem conexão, como pede o caso de exceção da spec. Também evita enviar o ponto de partida ao servidor.
- **Alternatives considered**: Endpoint de rota no backend: acrescenta ida e volta à rede e falha sem conexão, sem ganho de regra de negócio, já que a rota não é persistida nem autorizada.

## D4 — Instruções coerentes com seta e traçado (FR-008)

- **Decision**: Gerar texto e seta a partir do mesmo valor calculado. Para cada vértice do caminho, calcular o ângulo entre o trecho anterior e o seguinte. O ângulo é classificado em `straight` (até 30°), `slight-left`/`slight-right` (30° a 60°), `left`/`right` (60° a 150°) ou `u-turn`. Texto e ícone vêm de uma única tabela indexada por essa classificação. Trechos em linha reta consecutivos são agrupados numa só instrução com a distância somada. Conexões entre pisos geram instrução própria ("Pegue a escada rolante até o Piso 2").
- **Rationale**: A divergência da tela 10 (texto "esquerda", seta "direita") acontece quando texto e ícone são definidos separadamente. Com uma só origem, a divergência deixa de ser possível. O SVG tem o eixo y para baixo, o que inverte o sinal do produto vetorial em relação ao plano cartesiano. A regra fica registrada aqui e no data-model para não reintroduzir o erro.
- **Alternatives considered**: Instruções cadastradas à mão por rota: não escala para pares arbitrários de ponto de partida e loja.

## D5 — Desenho do mapa e "aparência 3D"

- **Decision**: Desenhar em **SVG** no próprio React, visto de cima. A sensação de profundidade vem de uma camada de sombra deslocada sob cada unidade e de bordas coloridas, como na tela 09. Os marcadores são botões HTML posicionados sobre o SVG. A aproximação muda o `viewBox`; com zoom igual ou maior que 2×, lojas com logo mostram o logo no lugar da sacola.
- **Rationale**: O 3D não é obrigatório (FR-002). SVG desenha polígonos com nitidez em qualquer escala, recebe foco e rótulos acessíveis e não exige dependência nova (constituição V). Botões HTML dão operação por teclado e nomes acessíveis (FR-021).
- **Alternatives considered**: (a) Three.js ou WebGL: dependência grande, acessibilidade difícil e 3D não essencial. (b) Leaflet ou MapLibre: feitos para mapas geográficos com tiles; a planta interna é um plano local. (c) Canvas 2D: exigiria refazer foco, rótulos e eventos de clique.

## D6 — Geolocalização

- **Decision**: Usar a Geolocation API do navegador somente após **Usar minha localização**, com `enableHighAccuracy: false`, `timeout: 10000` e `maximumAge: 60000`. Calcular no navegador a distância (fórmula de haversine) até o ponto de referência do shopping e comparar com o raio cadastrado (padrão de 500 m). A posição não é enviada à API nem guardada em armazenamento do navegador.
- **Rationale**: Atende FR-012 a FR-014: a posição nunca sai do dispositivo, então não há dado pessoal a proteger no servidor. A API exige contexto seguro; `http://127.0.0.1` e `http://localhost` contam como seguros no desenvolvimento, e em publicação o site usa HTTPS. Os códigos de erro da API (permissão negada, indisponível e tempo esgotado) se convertem nas mensagens da spec.
- **Alternatives considered**: (a) Pedir a permissão ao abrir o mapa: contraria FR-012 e costuma levar a recusas. (b) `watchPosition` contínuo: não há rastreamento interno (constituição IV) e gasta bateria sem necessidade. (c) Localização por IP no servidor: imprecisa e envia dado pessoal.

## D7 — Estado de rota ativa compartilhado (FR-011)

- **Decision**: Criar um provedor React (`ActiveRouteProvider`) na raiz do `App`, com o estado da rota apenas em memória. O hook `useActiveRoute()` expõe `isActive`, destino e ações de iniciar, substituir e encerrar.
- **Rationale**: A tela 11 e outras ofertas de proximidade, quando existirem, consultam o mesmo estado, independentemente de onde a rota começou. Manter só em memória cumpre a regra da spec de encerrar a rota ao recarregar o aplicativo. Segue o padrão do `RegistrationProvider` existente.
- **Alternatives considered**: `sessionStorage`: faria a rota sobreviver à recarga, contra a premissa da spec. Estado no servidor: a rota não é dado de negócio.

## D8 — Acesso público ao mapa

- **Decision**: `GET /api/v1/mall` é público, sem sessão. No frontend, a rota `/mapa` é resolvida antes da espera pela consulta de sessão no `App.jsx`, assim como a página `/`.
- **Rationale**: A spec diz que o mapa não exige conta, e a resposta não contém dados pessoais. Hoje o `App.jsx` só renderiza as rotas depois da consulta de sessão; se ela falhar, o mapa não pode ficar bloqueado.
- **Alternatives considered**: Exigir login para o mapa: contraria a premissa da spec e as telas de descoberta.

## D9 — Categorias das lojas

- **Decision**: Reutilizar `interest_categories` (feature 004) como categoria das lojas.
- **Rationale**: As nove categorias (Moda, Tênis, Eletrônicos, Café e doces etc.) cobrem as lojas da tela 09. Uma só lista mantém o filtro do mapa coerente com os interesses do cadastro e prepara recomendações futuras.
- **Alternatives considered**: Tabela de categorias de loja separada: duplica nomes e cria divergência com os interesses.

## D10 — Logos das lojas

- **Decision**: Campo opcional `logo_url` em `stores`, com imagens num bucket **público** `store-logos` do Supabase Storage. As lojas de demonstração começam sem logo, o que exercita a regra do marcador de sacola. Quando houver logo, o marcador mostra uma imagem de até 64×64, com o nome da loja como texto alternativo.
- **Rationale**: Logo de loja é conteúdo público, sem dado pessoal; um bucket público evita assinar URLs. Storage de arquivos já é usado na feature 004 e não é um segundo banco de negócio.
- **Alternatives considered**: Iniciais como logo: a tela 09 usa iniciais nos cartões "Perto de você", e isso pode continuar como recurso visual do cartão, mas não substitui o logo do marcador (FR-003).

## D11 — Mapa provisório e coordenadas de referência

- **Decision**: A migração de seed cria o **Shopping Aurora** (nome da tela 09), marcado como demonstração, com três pisos, cerca de 18 lojas fictícias, entradas, escadas rolantes e elevador. O ponto de referência fica em coordenadas provisórias de Palmas (TO), também marcadas como demonstração, com raio de 500 m. O mapa entra como versão `source = 'provisional'`.
- **Rationale**: Permite implementar e demonstrar todas as histórias antes da planta da coordenação, como decidido nas Clarifications. O nome da tela 09 mantém a correspondência com o protótipo.
- **Alternatives considered**: Esperar a planta: bloquearia a implementação inteira por uma dependência externa sem prazo.

## D12 — Navegação inferior

- **Decision**: Criar um componente compartilhado `BottomNav` com os destinos que existem: **Início** (leva a `/entrar` se não houver sessão) e **Mapa**. Buscar, Desejos e Perfil entram quando as features correspondentes existirem.
- **Rationale**: A tela 09 mostra a barra com Mapa ativo. Mostrar destinos sem tela criaria links quebrados, contra a regra de não apresentar funcionalidade inexistente (constituição I e V).
- **Alternatives considered**: Os cinco itens desabilitados: ocupa espaço com funções que não existem.
