# Hackarum-Yvisalro — entrega inicial e próximos passos

Este documento organiza o trabalho da equipe. Os itens abaixo são pendências de planejamento, não uma lista de tarefas de implementação gerada pelo Spec Kit.

## Materiais disponíveis

- [README](../README.md): proposta, tecnologias, ideias e situação geral.
- [Frontend e protótipos](frontend.md): descrição das 11 imagens disponíveis e dos fluxos do consumidor.
- [Especificação inicial](../specs/001-vitrine-perto/spec.md): histórias, regras de negócio, cenários e critérios de sucesso.
- [Checklist de qualidade](../specs/001-vitrine-perto/checklists/requirements.md): pontos da especificação que ainda necessitam de revisão.
- [Detalhamento geral do projeto](detalhamento-projeto.md): situação atual, módulos previstos, arquitetura e pendências.
- [Guia de Git e GitHub](guia-git.md): atualização local, envio de commits e integração de branches.
- [Revisão dos seis itens](revisao-conformidade.md): versões consultadas, decisões e cobertura da entrega.
- [Landing pages em slides do Canva](landing-pages-canva.md): roteiros propostos para consumidor e lojista; materiais finais ainda a produzir.
- [Feature 002](../specs/002-planejamento-hackarum-yvisalro/spec.md): revisão atual do planejamento e esclarecimento sobre o banco principal.

## Pendente para a entrega acadêmica

1. Revisar os dois roteiros iniciais das landing pages no Canva, para consumidor e lojista; confirmar quantidade final e produzir slides, link de visualização e PDF.
2. A tecnologia sorteada é landing page, conforme registro da equipe em `8bcbfeb`. Confirmar se a etapa aceita a apresentação em slides ou também exige site publicado.
3. Completar os esboços necessários para o painel da empresa e os pontos de entrada do login com Google e Apple; conferir os 11 protótipos existentes.
4. Fechar a especificação: política de representantes de empresas, equivalência de produtos, regras de relevância, frequência de emails promocionais e coordenadas fictícias de demonstração.
5. Elaborar o plano técnico, modelo de dados e contratos da API; conferir autenticação, separação dos dados entre empresas, notificações e integração do mapa.
6. Gerar a lista de tarefas por história e executar a análise de consistência. Os comandos dependem do plano técnico; a análise não foi executada.
7. Conferir o material com a equipe, responsável e professor, e definir cronograma e hospedagem do backend.

## Decisões já registradas

- Web em React e aplicativo em Flutter/Dart, com MVVM nas interfaces. Backend Node.js/TypeScript com HTTPS/JSON; PostgreSQL principal no Supabase e Supabase Auth previstos. TypeScript também é proposto para React.
- Opção A confirmada pelo usuário: MySQL permanece somente alternativa documentada, sem segundo banco operacional no MVP.
- Slides no Canva para representar as landing pages; isso não comprova publicação web nem integração de serviços.
- Autenticação real, login com Google e Apple, recuperação por email e sincronização de desejos e preferências por conta.
- Uma empresa pode criar a conta e publicar imediatamente; não deve administrar dados de outra empresa.
- A busca prioriza relevância e, entre resultados semelhantes, o menor preço; itens sem estoque aparecem por último. Variantes relacionadas não são automaticamente idênticas.
- Geolocalização do dispositivo para descoberta, alternativa de seleção manual e mapa interno e rotas simulados. Uma rota ativa impede pop-ups promocionais próximos.
- Alertas solicitados por email quando houver reposição ou o preço desejado for atingido, respeitando as preferências; comunicações promocionais dependem da escolha do usuário.
- O objetivo é ajudar a encontrar produtos cadastrados; o usuário pode sair sem comprar e o sistema deve informar quando não houver resultado.

## GitHub

Na verificação de 13/11/2026, o [repositório GitHub](https://github.com/leonardodavi9274-byte/HackaRun-2026-projeto-Yvisalro-13-) estava publicado. A `main` do GitHub e `docs/detalhamento-frontend` estavam no commit `bbbda4a`, antes desta revisão. A branch do Victor estava em `8bcbfeb`, incluindo a reorganização `e3d5af5`, o tema do desafio, a prática sorteada e TypeScript. O [relatório](revisao-conformidade.md) distingue as versões consultadas; não houve merge dessa branch nesta revisão.

O repositório reúne planejamento e protótipos. A publicação do aplicativo e a configuração dos serviços ainda não foram realizadas no material analisado. Consulte o guia de Git para atualizar a base local e enviar novos documentos por branch e pull request.
