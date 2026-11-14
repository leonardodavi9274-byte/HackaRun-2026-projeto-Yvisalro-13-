# Research: Pop-ups de promoções próximas

Pesquisa local em 2026-11-14; decisões de desenho, não comprovação de funcionamento.

## D1 — Fonte de ofertas

**Decision**: Criar leitura mínima de ofertas publicadas no PostgreSQL existente, com lojas e categorias já cadastradas; sem gestão, sincronização externa ou catálogo completo. Dados de demonstração são opcionais, explícitos e identificados. Contratos em [api.md](contracts/api.md).

**Rationale**: O código e as migrações 0001–0016 não fornecem produtos ou promoções, e a spec depende de ofertas confirmadas. Uma tabela mínima no banco principal permite demonstrar sem fabricar resposta no cliente nem ampliar para painel empresarial. Ao surgir o catálogo definitivo, migrar/substituir a fonte e adaptar a porta, sem dupla escrita.

**Alternatives considered**: valores locais fixos (não representam dados confirmados); esperar catálogo completo (impede demonstrar este recorte); implementar catálogo e painel inteiros (escopo excessivo).

## D2 — Proximidade

**Decision**: Reusar `indexMall`, `buildGraph` e `distancesFrom` da feature 005; ponto e loja no mesmo piso e distância por caminho conhecido até 100 m, inclusive. Resolver ponto para nó e loja para porta; não usar GPS nem as cinco lojas truncadas de `nearestStores`.

**Rationale**: O ponto é manual e as distâncias do mapa são simuladas. O limite e mesmo piso são premissas documentadas na spec.

**Alternatives considered**: GPS interno (impreciso e contradiz projeto); distância em linha reta (ignora corredores); lista das cinco lojas (pode omitir ofertas válidas).

## D3 — Mapa e ponto entre telas

**Decision**: `ActiveRouteProvider` já conserva `startPointId` e rota em memória entre Início e Mapa. Carregar mapa pela leitura existente ao avaliar oferta, associando o ponto ao shopping e versão do mapa; limpar ponto inválido ao trocar versão/shopping ou identidade. Não alterar uma rota ativa ao limpar referência promocional.

**Rationale**: O índice e grafo atuais vivem no viewmodel do mapa, desmontado fora da tela; o ponto isolado não comprova sua validade para outro mapa. Recarregar encerra o estado da sessão, como exige a spec.

**Alternatives considered**: persistência no navegador (sobrevive à recarga e pode tornar o ponto antigo); supor que o índice do mapa já existe no Início (não existe).

## D4 — Segurança contra corridas

**Decision**: A visualização do diálogo deriva de rota conhecida/inativa, visita, identidade, ponto, versão do mapa e oferta confirmada. Invalidar solicitações ao mudar qualquer dependência e rechecá-las antes do commit e na renderização; rota ativa remove o diálogo na mesma renderização, sem depender apenas de efeito tardio. Resultado suprimido não entra em fila.

**Rationale**: A rota pode começar enquanto ofertas ou mapa são consultados. `useActiveRoute` lança fora do provider; erro ou ausência de provider nunca deve ser interpretado como rota inativa.

**Alternatives considered**: verificar somente no início da requisição ou fechar apenas em efeito (podem permitir apresentação transitória durante rota).

## D5 — Validade e disponibilidade

**Decision**: Listar candidatas vigentes e confirmar por identificador e revisão imediatamente antes de abrir; backend valida preço, estoque, loja ativa e horário. Mapa atual e confirmação coerente são necessários; alterações ou falhas descartam a candidata.

**Rationale**: Dados previamente carregados não demonstram que a promoção ainda está vigente. Não há garantia de estoque após exibição, portanto nenhum texto promete reserva.

**Alternatives considered**: cache sem confirmação (pode exibir valor vencido); registrar preço anterior obrigatório (inventaria dados ausentes).

## D6 — Interesse e sessão

**Decision**: Priorizar categoria própria da oferta comparada a `profile.interests.categoryIds` do perfil autenticado; se indisponível, ordenar sem interesses e não usar dados de outra conta. Memória em provedor acima do Início: ofertas dispensadas por usuário e uma abertura por visita; limpar ao recarregar, fechar ou trocar usuário. Não usar o consentimento de e-mail.

**Rationale**: Categoria da loja não demonstra categoria do produto; `sessionStorage` sobrevive à recarga, que a spec define como nova sessão.

**Alternatives considered**: inferir interesse de histórico de compras ou da loja; gravar preferências de dispensa em perfil; ambos excedem os dados e o escopo disponíveis.

## D7 — Interface

**Decision**: Diálogo acessível no Início inspirado em `ReplaceRouteDialog.jsx` e tela 11: foco inicial, Tab contido, Escape/Fechar/Agora não, restauração de foco se possível e destino seguro quando a tela desmontar. **Me leve lá** usa `/mapa?loja=` e o fluxo existente.

**Rationale**: A rota seleciona a loja e pede partida, sem iniciar automaticamente; ação e contexto permanecem compreensíveis.

**Alternatives considered**: notificação do sistema operacional ou e-mail (fora do recorte); diálogo sem gerenciamento de foco (exclui pessoas usando teclado).
