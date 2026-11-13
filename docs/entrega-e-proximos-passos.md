# Entrega inicial e próximos passos

Este documento organiza o trabalho da equipe. Os itens abaixo são pendências de planejamento, não uma lista de tarefas de implementação gerada pelo Spec Kit.

## Materiais disponíveis

- [README](../README.md): proposta, tecnologias, ideias e situação geral.
- [Frontend e protótipos](frontend.md): descrição das 11 imagens disponíveis e dos fluxos do consumidor.
- [Especificação inicial](../specs/001-vitrine-perto/spec.md): histórias, regras de negócio, cenários e critérios de sucesso.
- [Checklist de qualidade](../specs/001-vitrine-perto/checklists/requirements.md): pontos da especificação que ainda necessitam de revisão.

## Pendente para a entrega acadêmica

1. Confirmar a quantidade de landing pages e a finalidade de cada uma. Elas podem ser mais de duas e devem ter conteúdos diferentes.
2. Escolher a ferramenta de construção das landing pages. A tecnologia sorteada (landing page) e a proposta de incorporação estão no [README](../README.md#tecnologia-sorteada-landing-page).
3. Completar os esboços necessários para o painel da empresa e os pontos de entrada do login com Google e Apple; conferir os 11 protótipos existentes.
4. Fechar a especificação: política de representantes de empresas, equivalência de produtos, regras de relevância, frequência de emails promocionais e coordenadas fictícias de demonstração.
5. Elaborar o plano técnico, modelo de dados e contratos da API; conferir autenticação, separação dos dados entre empresas, notificações e integração do mapa.
6. Gerar a lista de tarefas por história e executar a análise de consistência. Os comandos dependem do plano técnico; a análise não foi executada.
7. Conferir o material com a equipe, responsável e professor, e definir cronograma e hospedagem do backend.

## Decisões já registradas

- Tema do desafio: **03. Descoberta de produtos, lojas e promoções**. Tecnologia sorteada: **landing page**.
- Web e aplicativo móvel; Flutter/Dart, arquitetura MVVM, backend Node.js com TypeScript e JSON, Supabase e PostgreSQL previstos.
- Autenticação real, login com Google e Apple, recuperação por email e sincronização de desejos e preferências por conta.
- Uma empresa pode criar a conta e publicar imediatamente; não deve administrar dados de outra empresa.
- A busca prioriza relevância e, entre resultados semelhantes, o menor preço; itens sem estoque aparecem por último. Variantes relacionadas não são automaticamente idênticas.
- Geolocalização do dispositivo para descoberta, alternativa de seleção manual e mapa interno e rotas simulados. Uma rota ativa impede pop-ups promocionais próximos.
- Alertas solicitados por email quando houver reposição ou o preço desejado for atingido, respeitando as preferências; comunicações promocionais dependem da escolha do usuário.
- O objetivo é ajudar a encontrar produtos cadastrados; o usuário pode sair sem comprar e o sistema deve informar quando não houver resultado.

## GitHub

O projeto está publicado em [HackaRun-2026-projeto-Yvisalro-13-](https://github.com/leonardodavi9274-byte/HackaRun-2026-projeto-Yvisalro-13-). O branch `main` é o principal; o desenvolvimento acontece em branches como `VictorXavierSL-patch-1-dev`, que precisam ser integrados ao `main` para aparecer na versão principal.
