# Contrato proposto: Interface de busca e comparação

**Estado**: desenho para a aplicação web, sem implementação comprovada. As telas 05 e 06 de [frontend.md](../../../docs/frontend.md) são referência visual; onde o protótipo diverge, prevalece a spec 010.

| Local ou estado | Comportamento |
| --- | --- |
| Entrada pública | `/` oferece acesso a `/buscar`; `/inicio` também oferece acesso. Busca e detalhe são resolvidos antes de espera ou erro de sessão, como o mapa. Atualizar textos antigos da página que dizem que a busca está apenas planejada quando for implementada. |
| Busca e filtros | Campo de texto; categoria, tipo da categoria e preço mínimo/máximo opcionais. Mostrar filtros ativos, permitir limpeza e preservar valores corrigíveis. Valores inválidos explicam o problema antes de aplicar. |
| Resultados | Cada oferta mostra produto, variante e loja **abaixo do produto**, preço e disponibilidade conhecidos ou estado desconhecido, e identificação de demonstração. Ordem conforme [API](api.md); não apresentar oferta expirada como promoção válida. |
| Sugestão | Se houver sugestão adequada, mostrá-la como ação textual; seleção explícita repete a busca, sem mudança automática. Ausência de resultados oferece ajuste de texto e filtros. |
| Detalhe | `/produto/{variantId}` mostra produto e variante, ofertas comparáveis da mesma variante em ordem, loja em cada uma e alternativas da mesma categoria claramente distintas. Preço ausente é identificado. |
| Loja e mapa | Oferecer ação para abrir `/mapa?loja={storeId}` quando a posição estiver confirmada; o fluxo existente escolhe ponto de partida e gerencia rota ativa. Sem posição, explicar indisponibilidade da localização; manter detalhes acessíveis. |
| Falha e carregamento | Diferenciar carregamento, lista vazia, sem conexão, catálogo indisponível e referência removida; oferecer nova tentativa quando cabível. Ao alterar consulta, cancelar ou ignorar respostas antigas. |
| Acessibilidade | Elementos com rótulos textuais, foco visível, operação por teclado; disponibilidade e erros não dependem apenas de cor. Não inventar distância, preço, estoque ou desconto. |

Busca pública não executa autenticação, nem cria desejo, alerta ou histórico privado. A integração futura com histórico da conta deve obedecer à 009 e não interromper o resultado público. O pop-up 008 conserva regras de ponto, frequência e supressão durante rota ativa.
