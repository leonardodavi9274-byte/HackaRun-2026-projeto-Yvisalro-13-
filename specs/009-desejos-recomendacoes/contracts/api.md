# Contrato proposto: API de desejos e histórico

**Estado**: os endpoints privados abaixo continuam propostos e não indicam integração concluída. A feature 010 adicionou código para catálogo público, sujeito a configuração e migrações.

## Regras comuns

- Todas as operações são privadas, exigem sessão válida e usam a identidade validada no servidor. Não aceitar proprietário indicado pelo cliente nem revelar registros de outra conta por identificador.
- Respostas privadas não devem ser armazenadas em cache compartilhado. Mutações web seguem as proteções de origem e cabeçalho adotadas na base. Retornar erro compreensível para sessão inválida, indisponibilidade, entrada inválida e falha de persistência.
- A confirmação de alteração depende de persistência efetiva. Uma repetição da mesma intenção não pode criar duplicatas nem desfazer alteração mais recente; após resposta perdida, consultar estado antes de afirmar resultado.

## Operações previstas

| Operação | Entrada | Resultado confirmado |
| --- | --- | --- |
| Consultar desejos | Sessão da conta. | Lista de desejos da conta, tipo e referência, com dados de oferta conhecidos ou estado de indisponibilidade. |
| Salvar desejo | Tipo `produto` ou `oferta` e identificador válido do catálogo. | Vínculo escolhido salvo; repetição do mesmo vínculo não cria outro. Um produto e sua oferta são vínculos independentes. |
| Remover desejo | Identificador do desejo da própria conta. | Apenas o vínculo solicitado é removido; outro tipo ou outra oferta não é alterado. |
| Consultar histórico | Sessão da conta. | Entradas próprias de buscas e visualizações identificáveis individualmente. |
| Registrar interação | Tipo e termo de busca de produto ou referência visualizada, oriundos da interação efetiva. | Uma entrada confirmada, vinculada à conta. A identidade de cada operação deve permitir repetição segura. |
| Apagar entrada | Identificador da entrada própria. | Entrada ausente das leituras posteriores e, quando busca, sem influência em novas recomendações. |
| Consultar recomendações | Sessão da conta. | Itens do catálogo relacionados a buscas de produtos ainda existentes; sem busca/correspondência, estado vazio ou indisponível. |

## Dependência de catálogo e busca

A dependência exige identificar produtos, ofertas e lojas; informar preço e disponibilidade conhecidos; distinguir referência indisponível; e oferecer correspondência de produtos para um termo de busca. A comparação usa a mesma variante cadastrada. Sem dados confirmados, apresentar indisponibilidade ou vazio, não produtos ou preços fictícios sem identificação.

A 010 fornece no código `GET /catalog/products/{id}`, `GET /catalog/offers/{id}` e `GET /catalog/offers?q=...`, além de `CatalogReader.findProduct/findOffer/searchProducts`. Referências usam `found`, `missing` ou `unavailable`; falha da fonte é rejeitada e exposta como 503. Produto e oferta têm IDs distintos. O provedor web deduplica produtos por ID a partir das ofertas; busca pública não grava histórico. Os fluxos privados da 009 ainda precisam ser conectados e não funcionam por consequência automática desses contratos.

Visualizações podem compor o histórico, mas não são entrada de recomendação. Interesses, desejos e dados de compra também não são sinais. Nenhuma operação de integração de compras é prevista.
