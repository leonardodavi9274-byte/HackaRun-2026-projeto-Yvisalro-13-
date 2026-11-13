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

1. A tecnologia sorteada é landing page. A equipe ainda vai decidir o formato, a quantidade de páginas e a finalidade de cada uma. O [roteiro em slides do Canva](landing-pages-canva.md) é um rascunho de proposta.
2. Confirmar com a disciplina se a etapa aceita uma apresentação ou exige landing page web publicada.
3. Completar os esboços necessários para o painel da empresa e os pontos de entrada do login com Google e Apple; conferir os 11 protótipos existentes.
4. Fechar a especificação: política de representantes de empresas, equivalência de produtos, regras de relevância, frequência de emails promocionais e coordenadas fictícias de demonstração.
5. Elaborar o plano técnico, modelo de dados e contratos da API; conferir autenticação, separação dos dados entre empresas, notificações e integração do mapa.
6. Gerar a lista de tarefas por história e executar a análise de consistência. Os comandos dependem do plano técnico; a análise não foi executada.
7. Conferir o material com a equipe, responsável e professor, e definir cronograma e hospedagem do backend.

## Decisões já registradas

- Tema do desafio: **03. Descoberta de produtos, lojas e promoções**. Tecnologia sorteada: **landing page**; o formato ainda será decidido pela equipe.
- Web e aplicativo móvel. Aplicativo em Flutter/Dart com MVVM. Backend Node.js/TypeScript com HTTPS/JSON; PostgreSQL principal no Supabase e Supabase Auth previstos.
- **Propostas a confirmar com a equipe:** React (com TypeScript) para a interface web e o painel empresarial; MySQL somente como alternativa documentada, sem segundo banco operacional no MVP.
- Autenticação real, login com Google e Apple, recuperação por email e sincronização de desejos e preferências por conta.
- Uma empresa pode criar a conta e publicar imediatamente; não deve administrar dados de outra empresa.
- A busca prioriza relevância e, entre resultados semelhantes, o menor preço; itens sem estoque aparecem por último. Variantes relacionadas não são automaticamente idênticas.
- Geolocalização do dispositivo para descoberta, alternativa de seleção manual e mapa interno e rotas simulados. Uma rota ativa impede pop-ups promocionais próximos.
- Alertas solicitados por email quando houver reposição ou o preço desejado for atingido, respeitando as preferências; comunicações promocionais dependem da escolha do usuário.
- O objetivo é ajudar a encontrar produtos cadastrados; o usuário pode sair sem comprar e o sistema deve informar quando não houver resultado.

## GitHub

O projeto está publicado em [HackaRun-2026-projeto-Yvisalro-13-](https://github.com/leonardodavi9274-byte/HackaRun-2026-projeto-Yvisalro-13-). O `main` é o branch principal. O trabalho de cada pessoa acontece em branches próprios, como `VictorXavierSL-patch-1-dev` e `docs/detalhamento-frontend`, e só aparece no `main` depois de integrado por pull request.

Em 13/11/2026, o `main` estava em `ec4f160`. O branch `VictorXavierSL-patch-1-dev` trouxe esse conteúdo por merge e acrescentou o índice do protótipo, o tema do desafio e a renomeação da pasta de imagens. O [relatório de conformidade](revisao-conformidade.md) registra as versões consultadas antes desse merge.

O repositório reúne planejamento e protótipos. A publicação do aplicativo e a configuração dos serviços ainda não foram realizadas. Consulte o [guia de Git](guia-git.md) para atualizar a base local e enviar novos documentos por branch e pull request.
