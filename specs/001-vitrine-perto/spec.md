# Especificação funcional: Hackarum-Yvisalro

**Branch da revisão**: `docs/detalhamento-frontend`; repositório Git existente
**Criada**: 2026-11-13
**Estado**: rascunho em esclarecimento
**Origem**: proposta da equipe, README e decisões fornecidas na conversa.

## Contexto e objetivo

O nome canônico é **Hackarum-Yvisalro**. O caminho `001-vitrine-perto` é histórico. Esta especificação mantém as regras do produto; a [feature 002](../002-planejamento-hackarum-yvisalro/spec.md) registra a revisão da entrega inicial e a decisão esclarecida sobre persistência. As escolhas técnicas estão no [README](../../README.md).

O cadastro do consumidor e suas preferências são detalhados na [feature 004](../004-cadastro-preferencias/spec.md), incluindo a correspondência com as telas 02/03 e a integração funcional entre frontend e backend. Esse detalhamento não indica implementação concluída.

Uma vitrine para web e dispositivos móveis ajudará consumidores a encontrar produtos e ofertas em lojas de um shopping fictício inspirado em Palmas, Tocantins. O objetivo é apresentar os produtos que correspondam à busca e indicar onde encontrá-los; comprar não é obrigatório e o sistema não pode garantir a existência de um produto que não esteja cadastrado.

O protótipo usará nomes fictícios, por exemplo **Shopping Veredas Douradas**, **Passo do Cerrado** e **Vitrine das Veredas**. Esses nomes são apenas exemplos e não identificam estabelecimentos reais. O mapa interno e os trajetos serão simulados; a geolocalização do dispositivo será real.

## Clarifications

### Session 2026-11-13

- Q: Como as empresas poderão conseguir acesso ao painel para cadastrar seus produtos? → A: Qualquer empresa cria sua conta e começa a publicar imediatamente, sem aprovação prévia.
- Q: Quando o aplicativo deve enviar emails de reposição e de preço desejado? → A: Quando o produto voltar ao estoque ou atingir o preço desejado.
- Q: Como os resultados disponíveis devem ser ordenados inicialmente na busca? → A: Primeiro os mais relacionados à busca; entre semelhantes, o menor preço. Itens fora de estoque aparecem por último.
- Q: Que conteúdos diferentes as duas landing pages devem apresentar? → A: O projeto pode ter mais de duas páginas; a quantidade e os conteúdos serão confirmados posteriormente.
- Decisões técnicas confirmadas após a análise da branch `VictorXavierSL-patch-1-dev`: manter React no frontend web e painel empresarial, PostgreSQL no Supabase como banco do MVP e TypeScript no backend Node.js. Os papéis estão no [README](../../README.md#decisões-confirmadas-pela-equipe).
- Q: Manter as telas como canvas significa conservar o canvas de design atual ou apresentá-las no Canva? → A: Manter o canvas de design atual, com as 11 telas existentes. O formato das landing pages continua pendente.

## Cenários e validação

### História 1 — Encontrar e comparar produtos (P1)

Como consumidor, quero pesquisar um produto e comparar as opções por loja para saber onde encontrá-lo e quanto custa.

**Teste independente**: pesquisar um termo presente no catálogo e examinar resultados, filtros, preço e identificação das lojas.

1. Dado que lojas diferentes cadastraram “tênis Estrela preto” e “tênis Estrela branco”, ao buscar “Estrela”, ambos aparecem como resultados relacionados; cores diferentes não são tratadas automaticamente como o mesmo item.
2. Dado um produto sem estoque, quando uma busca o encontrar, ele aparece depois dos itens disponíveis e oferece opção de aviso de reposição.
3. Dada uma busca sem correspondência, o usuário recebe uma mensagem clara e pode alterar a pesquisa ou os filtros; a compra não é exigida.

### História 2 — Conta e desejos (P1)

Como consumidor, quero entrar na minha conta e manter meus desejos e preferências sincronizados para acessá-los em outro dispositivo.

**Teste independente**: criar uma conta, salvar um desejo e consultá-lo após entrar em outro dispositivo.

1. Dada uma conta válida, o usuário entra com email e senha ou por Google/Apple; pode solicitar recuperação por email.
2. Dado um desejo salvo, ao entrar na mesma conta em outro dispositivo, o desejo e as preferências aparecem sincronizados.
3. O usuário pode escolher suas preferências de comunicação; autorizar publicidade é uma escolha separada de usar o aplicativo.

### História 3 — Descobrir lojas e traçar rota (P1)

Como consumidor, quero localizar a loja no shopping e visualizar uma rota simulada a partir de um ponto escolhido.

**Teste independente**: selecionar uma loja e uma entrada e consultar o caminho no mapa fictício.

1. Se a localização não puder ser obtida, apresentar tela de erro com a mensagem “Não foi possível encontrar a localização do dispositivo” e oferecer seleção manual do shopping.
2. Ao selecionar um ponto inicial e uma loja, apresentar o trajeto simulado; enquanto ele estiver ativo, não exibir pop-ups de promoções próximas.
3. Oferecer uma lista textual de lojas por andar e categoria, além do mapa; os marcadores exibem sacolas e passam a exibir logos ao aproximar, quando disponíveis.

### História 4 — Gerenciar produtos da empresa (P1)

Como representante de loja, quero cadastrar e atualizar meus produtos em um painel de empresa para que os clientes possam encontrá-los.

**Teste independente**: um representante autorizado cadastra um produto e o encontra na busca da própria loja.

1. O representante autorizado pode informar nome, categoria, preço e disponibilidade e atualizar os dados de seus produtos.
2. A empresa cria sua conta e pode publicar imediatamente, sem aprovação prévia. A pessoa só pode administrar dados das empresas às quais está autorizada.

### História 5 — Promoções, listas e descoberta (P2)

Como consumidor, quero acompanhar produtos de meu interesse e descobrir ofertas adequadas.

**Teste independente**: adicionar item à lista, alterar as preferências de comunicação e consultar uma promoção.

1. A página inicial apresenta categorias, cards de promoções, stories e produtos sugeridos a partir das preferências e interações disponíveis.
2. A oferta mostra preço atual, loja, disponibilidade e, quando informados, preço anterior, validade e última atualização; dados fictícios são identificados.
3. Usuários podem manter desejos, organizar listas por shopping, solicitar avisos de reposição e informar preço desejado. Quando a condição solicitada ocorrer, enviar aviso por email convencional conforme as preferências; emails promocionais dependem de consentimento.

### História 6 — Evoluções e apresentação (P2/P3)

Como visitante, quero conhecer o MVP em landing pages com conteúdos diferentes. Como consumidor, quero poder compartilhar ofertas, comparar preço por unidade, consultar histórico disponível e planejar uma visita com várias lojas.

**Teste independente**: examinar as páginas definidas pela equipe e verificar o conteúdo distinto; testar cada evolução com dados de demonstração quando implementada.

1. Quando houver quantidade e unidade válidas, apresentar preço por unidade; quando não houver, não inventar o valor.
2. Quando houver histórico cadastrado, mostrar valores e datas; identificar histórico fictício.
3. Permitir organizar lista de compras e propor roteiro simulado de várias lojas, com ponto inicial escolhido; a regra de sequência será definida no planejamento.
4. Permitir compartilhar resumo ou link de uma oferta; o destino do link será definido na concepção das páginas.

### Casos de exceção

- Sem resultados ou sem conexão: informar o problema e permitir uma nova tentativa quando possível.
- Localização negada ou indisponível: mostrar a mensagem definida e oferecer seleção manual.
- Oferta desatualizada, esgotada ou sem dados opcionais: comunicar o estado sem inventar informação.
- Falha de login, email ou sincronização: informar que a operação não foi concluída; não afirmar que houve envio ou atualização quando não ocorreu.
- Uma pesquisa genérica pode retornar variantes semelhantes; só comparar como o mesmo produto quando a equivalência estiver estabelecida.

## Requisitos

### Requisitos funcionais

- **FR-001**: Permitir cadastro por nome, email e senha, foto opcional, entrada real, recuperação por email e entrada com Google e Apple, com preenchimento automático de senha nos dispositivos compatíveis.
- **FR-002**: Sincronizar lista de desejos e preferências com a conta do usuário entre dispositivos após autenticação.
- **FR-003**: Permitir busca por texto com nomes, categorias e sinônimos, sugestões para erros de digitação e filtros por tipo e preço.
- **FR-004**: Apresentar preço, disponibilidade e identificação da loja em cada resultado; ordenar disponíveis por relevância à busca e, entre resultados semelhantes, menor preço; itens sem estoque aparecem por último e podem receber pedido de aviso.
- **FR-005**: Distinguir resultados relacionados de ofertas do mesmo produto; permitir comparar ofertas equivalentes por preço e loja.
- **FR-006**: Permitir que qualquer empresa crie uma conta e publique imediatamente, sem aprovação prévia; representantes autorizados podem cadastrar e atualizar produtos, preços, promoções e estoque de suas empresas, sem acesso à gestão de outra empresa.
- **FR-007**: Permitir selecionar shopping por geolocalização ou manualmente; informar o erro de localização conforme a História 3.
- **FR-008**: Apresentar mapa interno fictício com aparência 3D, lista de lojas, pontos iniciais e rotas simuladas; suprimir anúncios em pop-up durante rota ativa.
- **FR-009**: Mostrar ofertas com dados de preço e vigência disponíveis, identificar demonstrações e não apresentar descontos inventados como reais.
- **FR-010**: Permitir que o usuário gerencie desejos, interesses e consentimento para comunicação e solicite alertas por email; enviar o aviso quando houver reposição ou o preço desejado for atingido, conforme as preferências do usuário.
- **FR-011**: Exibir recomendações e stories conforme interesses e interações disponíveis; não presumir histórico de compras existente.
- **FR-012**: Prever listas por shopping, roteiros com várias lojas, preço por unidade, histórico de preços e compartilhamento como evoluções priorizadas conforme prazo.
- **FR-013**: Apresentar landing pages com conteúdos distintos sobre o MVP; propor apresentação ao consumidor e ao lojista, confirmar formato, ferramenta e quantidade final e identificar demonstrações e funções futuras. Há um [rascunho de roteiro em slides do Canva](../../docs/landing-pages-canva.md); eventual publicação web depende da exigência da disciplina.
- **FR-014**: Disponibilizar experiência em web e aplicativo móvel; apresentar mensagens compreensíveis para resultados vazios e falhas.

### Entidades principais

- **Usuário e preferências**: conta, interesses, desejos e escolhas de comunicação.
- **Empresa e representante**: estabelecimento fictício e pessoas autorizadas a administrar seu catálogo.
- **Shopping e mapa**: local fictício, lojas, andares, pontos iniciais e conexões de rota.
- **Produto e oferta**: descrição, categoria, variante, loja, preço, disponibilidade e informações de promoção.
- **Lista e alerta**: produtos associados à conta, shopping e condições de aviso.

## Critérios de sucesso

- **SC-001**: Em um catálogo de demonstração, 100% das buscas de referência com correspondência cadastrada apresentam os resultados correspondentes e a loja de cada um.
- **SC-002**: Nos cenários de aceitação, 100% dos itens esgotados são listados após os disponíveis e recebem indicação de estoque.
- **SC-003**: Nos testes com duas sessões da mesma conta, desejos e preferências salvos aparecem na segunda sessão após sincronização concluída.
- **SC-004**: Em todos os cenários de rota ativa, pop-ups de promoções próximas ficam suprimidos.
- **SC-005**: Nos cenários de catálogo, uma empresa autorizada consegue cadastrar produto e outra empresa não consegue alterá-lo.
- **SC-006**: Quando não houver produto correspondente, 100% dos cenários de busca vazia mostram essa condição e permitem ajustar a busca; não se exige compra.

## Premissas e limites

- O MVP é uma vitrine e não inclui pagamento ou compra dentro do aplicativo.
- As 11 telas permanecem no canvas de design atual como referência de UX; as imagens exportadas estão em [frontend.md](../../docs/frontend.md). A implementação web será em React, com backend TypeScript e PostgreSQL no Supabase, conforme as decisões técnicas confirmadas.
- O shopping, lojas, ofertas e mapa usados na demonstração são fictícios; o uso de coordenadas para demonstração ainda exige definição.
- A medida de relevância e o critério exato de equivalência entre variantes, os detalhes de associação de representantes a empresas e a frequência de emails promocionais ainda precisam de detalhamento.
- A prática sorteada é landing page, conforme o registro da equipe no commit remoto `8bcbfeb`. A apresentação inicial propõe públicos consumidor e lojista; quantidade final e exigência de site publicado dependem de revisão. O roteiro não representa páginas ou slides já produzidos.
- A equipe de TI do shopping é a responsável indicada; cronograma e hospedagem do backend ainda não foram definidos.
- O documento é um rascunho; prioridade e dificuldade das 14 melhorias constam no README e não tornam todas obrigatórias no primeiro recorte de implementação.
