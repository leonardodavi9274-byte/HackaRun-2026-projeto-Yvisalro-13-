# Guia de execução futura: desejos e recomendações

Este guia descreve condições e resultados esperados; nenhum cenário foi executado nesta etapa. A constituição estabelece fluxo sem testes manuais ou automatizados como etapa padrão. As fronteiras de catálogo foram preparadas, mas ainda não há fluxo integrado desta feature para executar.

## Pré-requisitos

1. Feature 004 configurada com identidade e acesso à conta, conforme [guia da 004](../004-cadastro-preferencias/quickstart.md).
2. Catálogo e busca de produtos com produto, loja e oferta identificáveis, preço e disponibilidade conhecidos e contratos acordados conforme [contrato proposto](contracts/api.md). Essa dependência ainda não está disponível na base inspecionada.
3. Backend, frontend e migrações desta feature implementados e configurados; seus comandos de preparação serão detalhados quando houver implementação. Credenciais reais não devem ser adicionadas ao repositório.

**Dependência C1:** a conta autenticada é reaproveitada da feature 004, mas os fluxos completos de desejos, histórico e recomendações dependem de um catálogo e de uma busca de produtos com os contratos descritos acima. A fonte mínima de promoções da feature 008 fornece ofertas promocionais para leitura e nome do produto; ela não fornece identidade de produto ou busca de catálogo e não satisfaz C1. Até a disponibilização dessas capacidades, não é possível demonstrar os fluxos ponta a ponta nem preencher resultados com dados inventados.

Em 2026-11-14, a compilação dos workspaces de backend e frontend passou com Node 24.22.3. Foram preparados os modelos de desejos e histórico, clientes configuráveis e componentes de escolha e histórico; eles ainda não estão conectados à navegação, à persistência ou a um provedor de catálogo. A compilação não demonstra que desejos, histórico ou recomendações funcionem.

## Inicialização futura

Com as dependências preparadas, seguir os comandos do [README do projeto](../../README.md) e as instruções dos respectivos [backend](../../backend/README.md) e [frontend](../../frontend/README.md). A configuração externa e a aplicação de migrações devem ser verificadas no ambiente de destino; este plano não afirma que já ocorreram.

## Roteiro de uso esperado

| Cenário | Resultado esperado |
| --- | --- |
| Salvar produto e oferta dele | Dois desejos separados; apagar um mantém o outro, inclusive após nova sessão da mesma conta. |
| Abrir desejos em outra conta | Não revelar ou permitir alterar desejos da primeira conta. |
| Pesquisar produto com correspondência | O histórico registra a busca e o Início pode apresentar itens relacionados em seção discreta, sem interromper a navegação, com dados disponíveis. |
| Apagar uma busca | A entrada deixa de aparecer e não influencia novas recomendações; outras entradas permanecem. |
| Visualizar e apagar um item do histórico | Visualização permanece até exclusão individual e não é usada como sinal de recomendação. |
| Sem buscas utilizáveis | Permitir explorar categorias sem afirmar personalização ou compra anterior. |
| Falha ou ausência de catálogo | Explicar o estado; não confirmar operação não concluída nem inventar produto, preço ou disponibilidade. |

O roteiro é referência de comportamento e não constitui teste executado ou etapa obrigatória do projeto.
