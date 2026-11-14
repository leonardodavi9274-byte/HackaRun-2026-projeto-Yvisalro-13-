# Modelo de dados: desejos, histórico e recomendações

**Estado**: desenho proposto para a feature 009; não cria tabelas nem comprova integração. A identificação e o ciclo de vida de produtos e ofertas dependem do catálogo ainda não implementado.

## Dados existentes e dependências

- **Conta**: identidade validada na API; o proprietário de cada registro privado vem da sessão, nunca de um identificador informado pelo cliente.
- **Produto**: item do catálogo com identificador estável e informações suficientes para nomeá-lo. Não confundir um termo livre da feature 004 com produto catalogado.
- **Oferta**: referência estável ao produto e à loja, com preço e disponibilidade conhecidos e, quando fornecidos, vigência e demais detalhes coerentes. A identidade e equivalência são responsabilidade do catálogo.
- **Busca de produtos**: entrada de texto e resultados providos pela funcionalidade de busca de catálogo. Não reutilizar a busca de lojas no mapa como busca de produtos.

## Desejo

| Atributo conceitual | Regra |
| --- | --- |
| Identificador | Identifica o desejo para leitura e remoção. |
| Proprietário | Conta autenticada. |
| Tipo | Produto ou oferta. |
| Referência | Identificador do produto ou da oferta escolhida, compatível com o tipo. |
| Data de criação | Momento confirmado do registro. |

Produto e oferta são vínculos distintos e podem coexistir para a mesma conta; remover um não remove o outro. A proposta técnica usa unicidade por proprietário, tipo e referência, tornando repetição de salvar o mesmo vínculo uma operação segura. A interface só indica confirmação após o serviço confirmar. Se a referência não estiver disponível, preservar a identificação do desejo e sinalizar indisponibilidade sem substituir por outro item ou afirmar dados antigos como atuais; a forma de preservar uma identificação mínima será definida junto ao catálogo. Em nenhuma situação apresentar variantes como equivalentes sem regra de catálogo.

## Entrada de histórico

| Atributo conceitual | Regra |
| --- | --- |
| Identificador | Identifica uma entrada individual para exclusão. |
| Proprietário | Conta autenticada. |
| Tipo | Busca de produto ou visualização de produto/oferta. |
| Conteúdo | Termo pesquisado ou referência visualizada, conforme o tipo, originado de interação efetiva. |
| Data da interação | Momento da interação registrada. |

Cada entrada permanece até ser apagada individualmente pelo usuário. Não criar exclusão automática por idade nem oferecer desativação do uso das buscas para recomendação. Visualizações são mantidas como histórico mas não são sinal para recomendação. Após confirmação da exclusão, ela não aparece mais no histórico e, para buscas, não influencia novas recomendações. Implementação deve impedir que uma resposta antiga ou repetição da mesma operação restaure a entrada excluída; uma nova interação real posterior é um evento distinto. Dados privados não devem aparecer em logs de conteúdo.

## Recomendação

Resultado derivado das buscas de produtos que ainda permanecem no histórico da própria conta e de correspondências reais do catálogo. Não representa compra, desejo, interesse ou visualização. Produto, loja, preço e disponibilidade devem vir dos dados confirmados do catálogo; sem correspondência, mostrar o estado vazio e acesso a categorias. Não persistir um histórico de compras nem inferir compras de interações. Se houver materialização, invalidar ou recalcular efeitos derivados antes de confirmar a remoção de uma busca.

## Limites e estados

- A API deve validar identidade e autorização em todas as leituras e alterações, inclusive por identificador; o acesso privilegiado ao banco não garante isolamento por si só.
- Rascunho, operação pendente, confirmada, falha e resultado desconhecido devem ser distinguíveis; falha de rede não autoriza afirmar salvamento ou exclusão. Reconciliar com estado confirmado quando possível.
- A migração concreta, a política para remoção de produto/oferta e a integração de busca só podem ser fechadas após contratos e identidade do catálogo estarem disponíveis. Não presumir configuração de serviços.
