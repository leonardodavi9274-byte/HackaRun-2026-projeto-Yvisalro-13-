<!--
Sync Impact Report
- Version change: modelo sem versão ratificada -> 1.0.0 (primeira adoção).
- Modified principles:
  - Princípio 1 do modelo -> I. Descoberta confiável e escopo explícito.
  - Princípio 2 do modelo -> II. Requisitos e decisões rastreáveis.
  - Princípio 3 do modelo -> III. Identidade, isolamento e controle de comunicação.
  - Princípio 4 do modelo -> IV. Experiência compreensível e acessível.
  - Princípio 5 do modelo -> V. Simplicidade e transparência da entrega.
- Added sections: Restrições técnicas e de produto; Fluxo de desenvolvimento e conclusão;
  regras concretas de Governance.
- Removed sections: nenhuma seção de governança existente; exemplos do modelo substituídos.
- Confirmed governance: consenso da equipe para emendas e mudanças de tecnologias;
  pull request com validação pelo próprio autor; fluxo sem testes; adoção em 2026-11-13.
- Follow-up TODOs: nenhum placeholder adiado. Pendências de produto e operação permanecem
  nas especificações e no planejamento; não foram convertidas em decisões nesta constituição.
- Scope: somente .specify/memory/constitution.md; templates e comandos não foram alterados.
- Remover este relatório temporário antes do commit da constituição.
-->

# Hackarum-Yvisalro Constitution

## Core Principles

### I. Descoberta confiável e escopo explícito

O Hackarum-Yvisalro DEVE ajudar consumidores a descobrir produtos, lojas e promoções,
comparar ofertas e consultar trajetos internos simulados. O primeiro MVP DEVE funcionar
como vitrine, com compras e pagamentos fora do aplicativo. O painel empresarial DEVE
permitir que cada empresa mantenha seu próprio catálogo.

Toda oferta DEVE identificar a loja, o preço e a disponibilidade conhecidos. Valores,
descontos e vigência exibidos DEVEM ser coerentes; dados ausentes NÃO DEVEM ser inventados.
Produtos relacionados NÃO DEVEM ser apresentados como idênticos sem equivalência definida.
Uma busca sem correspondência DEVE comunicar a ausência de resultado. Dados fictícios,
mapa e rotas de demonstração DEVEM ser identificados como tais.

Essa regra preserva o objetivo do tema 03 e a confiança nas informações apresentadas.

### II. Requisitos e decisões rastreáveis

Toda funcionalidade implementada DEVE corresponder a requisitos e critérios de aceite
registrados em sua especificação. O plano e as tarefas DEVEM indicar as histórias atendidas,
as dependências e o recorte da entrega. Uma ideia listada no README NÃO DEVE ser tratada
automaticamente como compromisso do primeiro MVP.

Decisões e mudanças de comportamento DEVEM ser registradas no artefato correspondente,
com contexto suficiente para distinguir confirmado, proposto e pendente. Quando houver
divergência entre protótipo e especificação funcional, a especificação DEVE orientar o
comportamento e a divergência DEVE ser registrada para correção do material afetado.

Protótipo, roteiro, implementação e serviço configurado DEVEM ter estados distintos na
documentação. Consultar uma branch NÃO DEVE ser descrito como integrar seu histórico.
Isso permite continuar o trabalho sem presumir decisões ou funcionalidades inexistentes.

### III. Identidade, isolamento e controle de comunicação

A aplicação DEVE usar Supabase Auth para a identidade prevista. A API DEVE validar a
identidade e a autorização antes de ler ou modificar dados restritos. Uma pessoa NÃO
DEVE administrar o catálogo de outra empresa sem vínculo autorizado. A publicação
imediata por uma empresa cadastrada DEVE respeitar esse isolamento.

Credenciais do banco e chaves com acesso privilegiado DEVEM permanecer no servidor e
fora do repositório, dos clientes e dos materiais de demonstração. Desejos e preferências
DEVEM permanecer vinculados à conta autenticada nas operações de sincronização.

Publicidade por email DEVE depender de escolha explícita e separada do acesso ao produto.
O usuário DEVE poder alterar essa preferência. Alertas solicitados de reposição e preço
DEVEM seguir a condição registrada e as preferências da conta. A interface NÃO DEVE
confirmar envio, autenticação ou salvamento antes da confirmação do serviço responsável.

### IV. Experiência compreensível e acessível

Os fluxos implementados DEVEM apresentar estados de carregamento, resultado vazio,
erro e ausência de conexão quando aplicáveis, com mensagem que explique a condição e
a ação disponível. Ícones acionáveis DEVEM ter identificação textual acessível; estoque,
promoção e falha NÃO DEVEM ser comunicados apenas por cor.

A descoberta de shopping DEVE oferecer seleção manual quando a localização estiver
negada ou indisponível. O mapa DEVE ter alternativa textual de lojas por andar e categoria.
O ponto inicial do trajeto interno DEVE ser escolhido pelo usuário; a demonstração NÃO
DEVE apresentar o GPS como comprovação de posição exata dentro do shopping.

Durante uma rota ativa, pop-ups promocionais de proximidade NÃO DEVEM interromper o
trajeto. Texto, seta e caminho exibidos DEVEM comunicar a mesma direção.

### V. Simplicidade e transparência da entrega

A implementação DEVE priorizar o recorte aprovado e as dependências necessárias para
entregar fluxos completos. Novos serviços, camadas ou tecnologias DEVEM ter finalidade
registrada no plano; componentes sem necessidade identificada NÃO DEVEM ser acrescentados
apenas por antecipação de demandas futuras.

O MVP DEVE manter uma única fonte principal de dados. MySQL permanece apenas como
alternativa documentada, sem réplica, sincronização ou escrita dupla no primeiro recorte.
O canvas de design atual e suas 11 telas DEVEM ser mantidos como referência de UX;
novas telas e correções DEVEM preservar a rastreabilidade com o comportamento especificado.

Toda entrega DEVE informar o que foi alterado, o que permanece pendente e as limitações
conhecidas. A documentação NÃO DEVE afirmar funcionamento ou verificação que não ocorreu.

## Restrições técnicas e de produto

- **Frontend web e painel empresarial:** React, conforme decisão confirmada da equipe.
  TypeScript para essa interface permanece proposta até decisão específica.
- **Backend:** TypeScript, com Node.js como ambiente de execução previsto; regras de
  negócio e autorização ficam na API, organizada em entrada, serviços e persistência.
- **Dados e identidade:** PostgreSQL no Supabase como banco do MVP e Supabase Auth para
  autenticação. A integração ainda depende de implementação e configuração.
- **Aplicativo móvel:** Flutter/Dart conforme o planejamento existente. MVVM organiza
  apresentação, estado e acesso a dados nas interfaces; os clientes usam a API comum
  por HTTPS/JSON para as operações de negócio.
- **Protótipo:** manter as telas no canvas de design atual e as imagens exportadas como
  referência documental. O canvas representa o desenho da aplicação.
- **Demonstração:** shopping, lojas, ofertas, mapa e rotas são fictícios. A localização
  do dispositivo é uma integração real prevista para apoiar a descoberta do shopping.
- **Landing pages:** são a prática sorteada. Formato, ferramenta, quantidade, finalidades
  e exigência de publicação web permanecem pendentes. O roteiro em slides do Canva é
  proposta e NÃO DEVE ser apresentado como decisão confirmada ou material já produzido.
- **Reserva de itens:** permanece decisão de escopo pendente; a presença do botão no
  protótipo NÃO autoriza sua implementação como requisito do MVP.

Versões de ferramentas, framework do backend, hospedagem, limites dos serviços,
coordenadas de demonstração, equivalência de produtos, relevância da busca, associação
de representantes e frequência promocional DEVEM ser detalhados na especificação ou
no plano antes da implementação que dependa dessas escolhas. Uma pendência DEVE limitar
somente o trabalho que dela dependa.

## Fluxo de desenvolvimento e conclusão

1. **Especificar:** registrar objetivo, histórias, requisitos, critérios de aceite e
   pendências da funcionalidade. Usar o fluxo do Spec Kit para organizar esses artefatos.
2. **Planejar:** definir arquitetura, modelo de dados, contratos e dependências; verificar
   a conformidade com esta constituição e registrar as decisões necessárias ao recorte.
3. **Organizar e implementar:** produzir tarefas por história e dependência, trabalhar em
   branch própria e manter alterações relacionadas ao escopo declarado.
4. **Revisar e integrar:** usar pull request para integrar alterações à `main`. O próprio
   autor DEVE validar escopo, coerência documental e conformidade com a constituição.
   O autor pode integrar seu pull request após essa validação; revisão por outro
   integrante NÃO é condição obrigatória. Consenso para emendas continua exigido.
5. **Relatar a conclusão:** informar no pull request os requisitos atendidos, as mudanças,
   as pendências e as limitações conhecidas. Documentos e imagens referenciados DEVEM
   corresponder ao estado efetivo da entrega.

**Política de testes escolhida pela equipe:** o fluxo atual é **sem testes**. Testes
automatizados, testes manuais e TDD NÃO são etapa padrão nem requisito de conclusão.
Critérios de aceite continuam descrevendo o comportamento esperado, sem implicar sua
execução como testes. O relato da entrega DEVE registrar a ausência de testes e NÃO
DEVE afirmar que cenários funcionais foram verificados quando isso não ocorreu.
Uma futura exigência de testes depende de emenda aprovada por consenso.

O trabalho de documentação DEVE distinguir planejamento, implementação, integração de
branches e publicação. A revisão documental desta constituição NÃO comprova execução
da aplicação. Protótipos e slides NÃO substituem funcionalidades implementadas.

## Governance

Esta constituição estabelece as regras de projeto para especificações, planos, tarefas
e pull requests. Esses artefatos DEVEM registrar divergências e ser alinhados às regras
vigentes. Referências de contexto: [README](../../README.md),
[especificação funcional](../../specs/001-vitrine-perto/spec.md),
[detalhamento das telas](../../docs/frontend.md) e
[especificação da entrega inicial](../../specs/002-planejamento-hackarum-yvisalro/spec.md).

**Adoção:** a versão 1.0.0 é adotada em 2026-11-13, conforme decisão do usuário nesta
sessão. A versão anterior era somente um modelo sem princípios ratificados.

**Emendas e tecnologias:** alterações desta constituição ou das tecnologias confirmadas
DEVEM ser aprovadas por consenso da equipe do projeto. A proposta DEVE registrar o
motivo, a regra anterior, a mudança, os impactos e a adaptação necessária aos artefatos
dependentes. O consenso DEVE ficar registrado no pull request ou em decisão vinculada;
uma objeção pendente impede considerar o consenso obtido. A validação pelo próprio
autor NÃO substitui esse consenso.

**Versionamento:** a constituição DEVE usar MAJOR.MINOR.PATCH. Incrementar MAJOR quando
uma regra ou princípio for removido ou redefinido de forma incompatível; MINOR quando
forem acrescentadas regras ou ampliadas obrigações de forma compatível; PATCH para
esclarecimentos e correções sem mudança de obrigação. Cada emenda DEVE atualizar a
versão e a data de alteração, preservando a data original de adoção.

**Conformidade:** o autor DEVE revisar a constituição ao preparar o plano e ao validar
o pull request. Uma exceção a regra obrigatória DEVE passar pelo procedimento de
emenda; NÃO DEVE ser presumida por urgência, protótipo ou preferência de implementação.
O relatório temporário de impacto no topo do arquivo DEVE ser removido antes do commit
da constituição, mantendo o histórico da decisão na descrição da alteração.

**Version**: 1.0.0 | **Ratified**: 2026-11-13 | **Last Amended**: 2026-11-13
