# Contrato proposto: interface de desejos e recomendações

**Estado**: planejamento, não telas implementadas. As telas 05, 07 e 08 do [frontend](../../../docs/frontend.md) são referência visual; a escolha entre produto e oferta precisa ser incorporada ao protótipo, que originalmente mostra um coração para produto.

| Fluxo | Comportamento |
| --- | --- |
| Salvar | Na origem que identificar produto e oferta, oferecer escolha compreensível do tipo. Exibir cada estado somente após confirmação. Sem sessão, orientar a entrar. |
| Consultar e remover | Na área Desejos, distinguir produto de oferta e identificar a loja quando for uma oferta. Quando ambos estão salvos, exibir vínculos separados e remover apenas o escolhido. |
| Dados de oferta | Exibir loja, preço e disponibilidade conhecidos; explicar indisponibilidade ou ausência de dados, sem inventar melhor preço, queda ou equivalência. |
| Histórico | Apresentar buscas e visualizações próprias e oferecer exclusão individual de cada entrada, com confirmação do serviço. Não oferecer controle de desativação do uso das buscas nas recomendações. |
| Início | Apresentar em seção discreta, sem interromper a navegação, produtos recomendados exclusivamente a partir das buscas da própria conta; visualizações, desejos e interesses não são sinais. Sem buscas ou correspondências, permitir explorar categorias sem alegar personalização. |

Controles de coração, escolha de tipo e exclusão devem ter nomes acessíveis e estados que não dependam só de cor. Mostrar carregamento, vazio, falha, ausência de conexão e resultado desconhecido quando aplicáveis; permitir nova tentativa sem confirmar operação não concluída. Em dados de demonstração, indicar o caráter fictício. Rotas e detalhes de apresentação serão definidos com a implementação e com o catálogo.
