# Entrega inicial e próximos passos

Este documento organiza o trabalho da equipe. Os itens abaixo são pendências de planejamento, não uma lista de tarefas de implementação gerada pelo Spec Kit.

## Materiais disponíveis

- [README](../README.md): proposta, tecnologias, ideias e situação geral.
- [Frontend e protótipos](frontend.md): descrição das 11 imagens disponíveis e dos fluxos do consumidor.
- [Especificação inicial](../specs/001-vitrine-perto/spec.md): histórias, regras de negócio, cenários e critérios de sucesso.
- [Checklist de qualidade](../specs/001-vitrine-perto/checklists/requirements.md): pontos da especificação que ainda necessitam de revisão.

## Pendente para a entrega acadêmica

1. Confirmar a quantidade de landing pages e a finalidade de cada uma. Elas podem ser mais de duas e devem ter conteúdos diferentes.
2. Confirmar com o professor qual é a tecnologia ou prática sorteada e como demonstrar sua incorporação. As landing pages foram mencionadas, mas a confirmação do requisito continua pendente.
3. Completar os esboços necessários para o painel da empresa e os pontos de entrada do login com Google e Apple; conferir os 11 protótipos existentes.
4. Fechar a especificação: política de representantes de empresas, equivalência de produtos, regras de relevância, frequência de emails promocionais e coordenadas fictícias de demonstração.
5. Elaborar o plano técnico, modelo de dados e contratos da API; conferir autenticação, separação dos dados entre empresas, notificações e integração do mapa.
6. Gerar a lista de tarefas por história e executar a análise de consistência. Os comandos dependem do plano técnico; a análise não foi executada.
7. Conferir o material com a equipe, responsável e professor, e definir cronograma e hospedagem do backend.

## Decisões já registradas

- Web e aplicativo móvel; Flutter/Dart, arquitetura MVVM, backend Node.js com JSON, Supabase e PostgreSQL previstos.
- Autenticação real, login com Google e Apple, recuperação por email e sincronização de desejos e preferências por conta.
- Uma empresa pode criar a conta e publicar imediatamente; não deve administrar dados de outra empresa.
- A busca prioriza relevância e, entre resultados semelhantes, o menor preço; itens sem estoque aparecem por último. Variantes relacionadas não são automaticamente idênticas.
- Geolocalização do dispositivo para descoberta, alternativa de seleção manual e mapa interno e rotas simulados. Uma rota ativa impede pop-ups promocionais próximos.
- Alertas solicitados por email quando houver reposição ou o preço desejado for atingido, respeitando as preferências; comunicações promocionais dependem da escolha do usuário.
- O objetivo é ajudar a encontrar produtos cadastrados; o usuário pode sair sem comprar e o sistema deve informar quando não houver resultado.

## GitHub

Na última verificação desta sessão, a pasta não estava inicializada como repositório Git e não havia repositório GitHub acessível pela conexão. A publicação não foi concluída. Antes de publicar, conferir a conta de destino, a visibilidade e quais arquivos devem ser incluídos, especialmente em razão da dúvida sobre projetos distintos compartilhando a pasta.
