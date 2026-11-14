# UI Contract: Oferta próxima no Início

Contrato proposto para a [tela 11](../../../docs/frontend.md) e [spec](../spec.md); não representa implementação concluída.

## Avaliação e seleção

1. A montagem do Início autenticado inicia uma visita. Verificar provedor de rota conhecido e inativo, ponto associado ao shopping/versão válidos e nenhuma abertura já consumida nesta visita; caso contrário, não buscar para exibir nem abrir.
2. Consultar mapa/lojas e candidatas. Construir índice/grafo com funções da feature 005, resolver nó do ponto e porta da loja, filtrar mesmo piso e distância de caminhada até 100 m. Descarta dados sem caminho ou ponto confirmado.
3. Remover IDs dispensados na sessão. Ordenar correspondência com categoria confirmada da conta primeiro, distância crescente, nome da loja e produto por `pt-BR`, e ID como desempate final determinístico. Se não houver interesses confiáveis, nenhum item recebe prioridade de interesse.
4. Confirmar candidata via API individual; antes de abrir, validar que a resposta, revisão, usuário, visita, ponto, shopping, versão, mapa e `isActive === false` continuam atuais. Se a candidata mudar, descartar e reavaliar somente em evento de contexto ou próxima visita; não criar loop.
5. A saída de `/inicio`, troca de identidade, ponto, mapa ou shopping invalida consultas pendentes. A transição para rota ativa invalida consultas e remove o diálogo na mesma renderização; na chegada ou substituição de rota a supressão continua. Após encerrar, reavaliar apenas se a visita ainda não consumiu exibição. Não guardar fila.

O ponto promocional deve carregar identificação de shopping e versão desde sua escolha, não apenas `startPointId`. Adaptação do provider deve manter os fluxos de rota existentes; se não houver contexto associado, exigir nova escolha para ofertas e não interromper rota ativa.

## Diálogo

| Elemento | Comportamento e texto |
| --- | --- |
| Identificação | Título acessível **Promoção próxima**; produto, loja, piso, preço atual, disponibilidade textual e distância em metros simulados. |
| Transparência | **Distância simulada a partir do ponto escolhido**; **Oferta de demonstração** quando a oferta for fictícia; identificar também mapa demonstrativo quando aplicável. |
| Informações opcionais | Preço anterior, desconto, validade e atualização apenas se conhecidos e coerentes. Categoria de interesse só é citada quando há correspondência confirmada. |
| Dispensa | **Agora não**, **Fechar** ou Escape fecham e registram ID para a sessão. O controle X tem nome acessível **Fechar promoção**. |
| Rota | **Me leve lá** navega para `/mapa?loja={storeId}` codificado; o mapa seleciona loja e oferece partida, sem ativar rota automaticamente. Se posição deixar de existir, botão indisponível e **Localização no mapa indisponível**. |
| Foco | Diálogo nomeado e modal, foco inicial em título ou controle apropriado, Tab/Shift+Tab contidos, foco visível; ao dispensar restaurar foco anterior se ainda existir, senão mover a foco seguro do Início. Se rota ativar, não capturar foco da rota; deixar foco com o fluxo que a iniciou. |
| Responsividade | 360–1440 px sem rolagem horizontal, ações legíveis e acessíveis; permitir rolagem do conteúdo do diálogo se necessário. Estoque e demo não dependem de cor. |

## Estados e falhas

Sem ponto, oferta ou interesse, sem conexão, falha de leitura/confirmação ou estado de rota desconhecido: Início permanece utilizável sem pop-up e sem falso sucesso. Se a oferta visível deixar de ser confirmável, fechar; se só a posição da loja deixar de estar disponível, manter oferta confirmada e desabilitar rota como acima. O comportamento de revalidação está em [api.md](api.md). Não modificar preferências ou autorizações promocionais ao abrir, fechar ou seguir para mapa.
