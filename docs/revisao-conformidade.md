# Hackarum-Yvisalro — revisão de conformidade do planejamento inicial

> **Atualização no branch `VictorXavierSL-patch-1-dev`, depois do merge do `main` (`ec4f160`).** Este relatório registra as versões consultadas antes desse merge. Depois dele, o branch do Victor passou a conter todo o conteúdo do `main`, mais o índice do protótipo e a renomeação da pasta de imagens para `hackarum-yvisalro-telasprototipo`. As "Decisões aplicadas" abaixo mudaram assim:
> - **Apresentação:** o formato da landing page é decisão pendente da equipe; o roteiro do Canva é rascunho.
> - **Web e dados:** React com TypeScript e MySQL como alternativa são propostas a confirmar com a equipe.
> - **Nome:** o projeto é Hackarum-Yvisalro; o protótipo e a pasta das imagens se chamam hackarum-yvisalro-telasprototipo.
>
> O [README](../README.md) traz o estado atual.

**Data:** 13/11/2026.
**Escopo:** repositório local e versões remotas acessíveis da mesma equipe; documentação, nomes, tecnologias e seis itens da entrega. Não houve execução da aplicação nem nova inspeção visual das imagens.

## Repositório e versões consultadas

A conexão GitHub retornou um repositório do proprietário relacionado a este trabalho: [HackaRun-2026-projeto-Yvisalro-13-](https://github.com/leonardodavi9274-byte/HackaRun-2026-projeto-Yvisalro-13-). Não foram identificados repositórios separados de backend, web ou mobile na listagem retornada.

| Referência | Commit na consulta | Resultado |
| --- | --- | --- |
| Base local: `docs/detalhamento-frontend` | `bbbda4aff57661f777ad92bdcea5672bf07a6400` | Planejamento e 11 imagens; havia alterações locais de documentação anteriores, preservadas nesta revisão. |
| GitHub: `main` | `bbbda4aff57661f777ad92bdcea5672bf07a6400` | Mesma base da branch local antes desta revisão. |
| GitHub: `docs/detalhamento-frontend` | `bbbda4aff57661f777ad92bdcea5672bf07a6400` | Não continha os documentos desta revisão na consulta. |
| GitHub: `VictorXavierSL-patch-1-dev` | `8bcbfeb5889c9be843ef8917be56fb7ebbca67ae` | Inclui reorganização do protótipo em `e3d5af5`, tema 03, landing page sorteada e TypeScript no backend. |

Na [comparação das branches](https://github.com/leonardodavi9274-byte/HackaRun-2026-projeto-Yvisalro-13-/compare/bbbda4aff57661f777ad92bdcea5672bf07a6400...8bcbfeb5889c9be843ef8917be56fb7ebbca67ae), a branch do Victor tem dois commits exclusivos e falta-lhe um commit da `main`. As informações documentais úteis foram consideradas; o histórico dessa branch e sua renomeação das imagens não foram integrados por merge nesta revisão.

## Conferência dos seis itens

| Item exigido | Ajuste e evidência | Situação |
| --- | --- | --- |
| Proposta e estrutura inicial das telas | [README](../README.md#proposta-e-estrutura-inicial-das-telas), [11 telas e lacunas](frontend.md). | Documentado; imagens antigas mantêm o nome Achei. |
| Documentação inicial do projeto | [Índice documental](../README.md#documentação-inicial-do-projeto), especificação funcional e nova feature de revisão. | Organizado; constituição continua um template. |
| Linguagem de programação escolhida | [TypeScript, Dart e SQL](../README.md#linguagem-de-programação-escolhida); distinção entre linguagem e ferramenta. | Backend TypeScript registrado pela equipe; TypeScript no React é proposta. |
| Arquitetura proposta | [MVVM e fluxo](../README.md#arquitetura-proposta), interfaces separadas da API e persistência. | Proposta documentada; contratos e implementação pendentes. |
| Plataforma e tecnologias adotadas | [Matriz](../README.md#plataforma-e-tecnologias-adotadas): Node.js, React, Flutter/Dart, PostgreSQL/Supabase, MySQL alternativo e Canva. | Papéis alinhados à resposta da equipe; nenhum serviço funcional configurado. |
| Descrição de como a tecnologia ou prática sorteada será incorporada à solução | [Incorporação](../README.md#descrição-de-como-a-tecnologia-ou-prática-sorteada-será-incorporada-à-solução) e [roteiro Canva](landing-pages-canva.md). | Roteiro preparado; slides, PDF e link ainda a produzir. |

Cobertura documental: **6/6 itens**, com pendências explícitas. Isso não comprova conclusão dos slides nem funcionamento do MVP.

## Decisões aplicadas

- **Nome:** Hackarum-Yvisalro nos documentos atuais. Vitrine Perto e Achei são referências históricas; nomes dentro das imagens, caminhos e endereço Git foram preservados e explicados.
- **Web:** React para consumidor e painel empresarial; TypeScript proposto para essa interface. Node.js apoia as ferramentas e executará o backend TypeScript.
- **Mobile:** Flutter/Dart com MVVM. A mesma separação de apresentação e estado é proposta para React.
- **Dados:** opção A aceita pelo usuário nesta sessão — PostgreSQL principal no Supabase; MySQL somente alternativa documentada. Sem dois bancos operacionais no MVP.
- **Apresentação:** slides no Canva para demonstrar as landing pages; consumidor e lojista são os dois roteiros iniciais propostos. Vercel deixou de ser premissa dos slides.
- **Prática sorteada:** landing page, identificada no registro remoto `8bcbfeb`; não depende de nova pergunta ao usuário.

## Especificação e esclarecimento

**Feature ativa:** `specs/002-planejamento-hackarum-yvisalro`.
**Spec:** [spec.md](../specs/002-planejamento-hackarum-yvisalro/spec.md).
**Perguntas:** uma feita e uma respondida.
**Seções alteradas no esclarecimento:** Clarifications, Edge Cases, Functional Requirements e Assumptions; estado da especificação atualizado.
**Checklist da feature 002:** 16/16 → 16/16; nenhum item mudou de estado, nenhuma regressão, nenhum item desmarcado. Tecnologias concretas na resposta de esclarecimento registram uma restrição fornecida pelo usuário; os requisitos e critérios permanecem voltados à entrega documental.
**Checklist funcional da feature 001:** continua separado; suas pendências não são encerradas pela aprovação documental da feature 002.

| Categoria de cobertura | Estado | Observação |
| --- | --- | --- |
| Escopo e comportamento | Clear | Revisão inicial e seis itens; implementação fora desta feature. |
| Domínio e dados | Clear | Artefatos, decisões e evidências identificados. |
| Interação e UX | Clear | Roteiros propostos, dados fictícios e ações ilustrativas. |
| Qualidades não funcionais | Deferred | Metas operacionais da aplicação serão definidas no plano do produto. |
| Integrações e dependências | Clear | Materiais externos a produzir e limites dos slides explicitados. |
| Exceções e falhas | Clear | Links, imagens antigas, branches e serviços ausentes tratados. |
| Restrições e escolhas | Resolved | Banco principal e alternativa confirmados pelo usuário. |
| Terminologia e consistência | Resolved | Nome padronizado nos documentos; nomes históricos explicados. |
| Sinais de conclusão | Clear | Critérios documentais, evidências e versionamento. |
| Pendências diversas | Deferred | Versões, hospedagem, contratos e tarefas pertencem ao plano técnico. |

O avanço para `$speckit-plan` é adequado para detalhar a implementação após a revisão do material pela equipe. Não há outra ambiguidade crítica de escopo desta entrega que exija pergunta nesta sessão. `.specify/extensions.yml` não existe; não há hooks antes ou depois de specify/clarify a executar.

## Limites e trabalho restante

Validação documental executada: 11 arquivos Markdown, 75 referências locais válidas incluindo âncoras, seis seções obrigatórias presentes, 11 imagens disponíveis e uma resposta de esclarecimento registrada sem duplicação. Checklist da feature 002 em 16/16 e `git diff --check` sem erro. Não foram executados testes de aplicação, pois o repositório analisado ainda não contém a aplicação implementada.

Produzir e revisar os slides, escolher a quantidade final, disponibilizar o PDF e o link e confirmar a exigência de site publicado. Ainda faltam telas, contratos, tarefas, código, testes da aplicação e configuração de serviços. Esta revisão permite avaliar o planejamento; não declara a solução implementada.

O commit desta revisão registra o trabalho local. Seu envio ao GitHub e a integração na `main` são ações separadas, verificáveis por `git status` e pela presença do commit remoto.
