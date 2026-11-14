# UI Contract: Tela inicial e descoberta

**Rota:** /inicio, pública. **Referência:** [tela 05 — Início](../../../docs/frontend.md#05--início) e [imagem](../../../docs/imagens/achei/05-inicio.png). A rota / continua landing de apresentação.

## Composição e interação

1. Cabeçalho mostra shopping retornado, saudação neutra e acesso à conta opcional. Não presume piso ausente.
2. Pesquisa tem label “Buscar produtos, lojas ou categorias”; Enter/botão preservam termo e emitem intent search(query).
3. Categorias mostram somente categorias ativas retornadas; seleção emite browseCategory(categoryId).
4. Stories mostram loja e selo Demonstração quando isDemo. Seleção abre StoryViewer com imagem/alt, loja, validade e oferta vinculada.
5. Oferta destacada mostra produto, preço atual, loja, disponibilidade e validade quando conhecidos. Preço anterior/desconto requer valores coerentes. Demonstração tem selo textual.
6. Carrosséis mantêm ordem recebida, sem duplicar itens. Usam controles anterior/próximo por teclado e touch; omitir “Ver tudo” enquanto destino não estiver definido.
7. Story e oferta abrem diálogo acessível; Escape fecha, foco retorna ao acionador. Sem compra ou reserva. Produto abre oferta associada; sem oferta, emite busca por nome.
8. Navegação inferior preserva Início, Buscar, Desejos e Mapa. Conteúdo completo das outras áreas fica fora desta feature.

## Intents de navegação

| Ação | Intent | Integração |
| --- | --- | --- |
| Pesquisa | search(query) | Resultados da feature 005; alinhar rota concreta quando a spec chegar ao repositório. |
| Categoria | browseCategory(categoryId) | Resultados da feature 005 com categoria preservada. |
| Story | openStory(storyId) | Modal acessível na tela inicial. |
| Oferta | openOffer(offerId) | Detalhe modal local sem ação de compra. |
| Produto | openProduct(productId) | Oferta associada ou busca por nome. |
| Conta | createAccount/signIn | Rotas existentes /cadastro e /entrar. |

A integração com a feature 005 é uma dependência de implementação, não uma decisão de produto pendente.

## Estados

- Cada seção tem estado próprio loading/ready/empty/error.
- Carregamento usa skeleton simples e status acessível.
- empty explica ausência; outras seções continuam disponíveis.
- unavailable informa problema e retry; retry refaz o agregado e atualiza seções retornadas.
- Falha total mostra mensagem geral e nova tentativa, sem fallback de dados em memória.
- Falha de sessão/perfil não bloqueia conteúdo público.
- Se story/oferta expirar após carga, usar generatedAt como referência do relógio e identificá-la como expirada.
- O carregamento de página não anuncia validade contínua nem disponibilidade futura.

## Acessibilidade e responsividade

Skip link; hierarquia de headings; labels; cards como botão/link; foco visível; teclado; estado de estoque, demo, erro e expiração como texto. Dialog tem título acessível, fecha por Escape e restaura foco. Imagens têm alt persistido. Trilhos têm overflow próprio, controles nomeados e posição textual; não dependem só de gesto. prefers-reduced-motion desativa animação; nada avança automaticamente. Sem rolagem horizontal da página entre 360–1440 px.

## Rastreabilidade

FR-001/009: visitante e personalização opcional. FR-002/003: intents de busca/categoria. FR-004–008/011: cards, detalhe, validade e estado. FR-010: falha parcial e retry. FR-012: acesso por teclado/labels/estados. FR-013: navegação e supressão de pop-ups na rota.
