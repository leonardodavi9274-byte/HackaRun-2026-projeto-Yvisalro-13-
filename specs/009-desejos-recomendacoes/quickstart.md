# Guia de execução futura: desejos e recomendações

Este guia descreve condições e resultados esperados; nenhum cenário foi executado nesta etapa. A constituição estabelece fluxo sem testes manuais ou automatizados como etapa padrão. As fronteiras de catálogo foram preparadas, mas ainda não há fluxo integrado desta feature para executar.

## Pré-requisitos

1. Feature 004 configurada com identidade e acesso à conta, conforme [guia da 004](../004-cadastro-preferencias/quickstart.md).
2. Catálogo e busca de produtos conforme [contrato](contracts/api.md). A feature 010 contém o código local; sua disponibilidade operacional depende das migrações e da configuração do ambiente.
3. Backend, frontend e migrações desta feature implementados e configurados; seus comandos de preparação serão detalhados quando houver implementação. Credenciais reais não devem ser adicionadas ao repositório.

**Dependência C1:** a conta autenticada é reaproveitada da feature 004. A 010 adiciona identificadores de produto, variante e oferta e busca no código, substituindo a fonte limitada da 008 após corte coordenado; isso não comprova a configuração remota nem integra as operações privadas da 009. Sem ambas as condições, não é possível demonstrar desejos e recomendações ponta a ponta.

Em 2026-11-14, a compilação dos workspaces passou com Node 24.22.3. Os clientes de catálogo possuem adaptador local, mas desejos e histórico ainda não estão conectados à navegação e persistência. Compilação não demonstra que esses fluxos funcionem.

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
