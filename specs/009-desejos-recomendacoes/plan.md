# Implementation Plan: Lista de desejos e recomendações

**Branch Git atual na última verificação**: `008-promocoes-proximas` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Identificador do fluxo**: `009-desejos-recomendacoes`. O setup usa esse identificador como `BRANCH`; durante a preparação anterior, a branch real era `005-mapa-rota-lojas` e a verificação mais recente retornou a branch acima. O comando de planejamento não criou nem trocou branch.

**Estado**: planejamento documental concluído; implementação depende de catálogo e busca de produtos ainda não disponíveis. Nenhum código da aplicação foi alterado por este planejamento.

## Summary

Permitir a uma pessoa autenticada salvar produto ou oferta de loja em desejos separados e removíveis independentemente. Manter histórico de buscas e visualizações até exclusão individual; usar somente buscas de produtos ainda existentes para recomendar produtos no Início. Não integrar compras. Dados da conta e confirmações dependem de identidade válida e persistência confirmada.

Reaproveitar a base web e API existentes, com dados privados vinculados à identidade validada no servidor. [research.md](research.md), [data-model.md](data-model.md) e [contracts](contracts/) detalham as opções propostas. Catálogo e busca são dependências: não criar produtos, correspondências ou preços simulados para preencher sua ausência.

## Technical Context

**Language/Version**: Backend TypeScript em Node.js e frontend web JavaScript/JSX com React. Versões em `backend/package.json` e `frontend/package.json`.

**Primary Dependencies**: Express, Supabase JS, React e Vite existentes; sem nova biblioteca escolhida. Identidade e preferências dependem da feature 004; produtos, ofertas e busca dependem de funcionalidade de catálogo ainda ausente.

**Storage**: PostgreSQL no Supabase como fonte principal e Supabase Auth para identidade, conforme constituição. Modelo conceitual de desejos e histórico em [data-model.md](data-model.md); migração concreta depende da identidade do catálogo.

**Testing**: Constituição estabelece fluxo sem testes automatizados, manuais ou TDD como etapa padrão. Critérios de aceite e guia de uso descrevem resultados futuros, não sua execução.

**Target Platform**: A estrutura existente inspecionada é web. O produto prevê aplicativo móvel, mas este plano não presume cliente Flutter existente ou define uma entrega móvel.

**Project Type**: Frontend web e backend separados no mesmo repositório, usando API de negócio comum prevista.

**Performance Goals**: Usar os critérios da spec; não há meta aprovada de tempo, volume ou concorrência. Exibir andamento e falha sem afirmar resultado não confirmado.

**Constraints**: Uma única fonte principal; acesso privado validado na API; segredos no servidor; dados fictícios identificados; preço, loja e disponibilidade apenas quando conhecidos; sem equivalência inventada. Histórico de buscas e visualizações até exclusão individual, sem opção de desativar uso das buscas para recomendação. Sem integração de compras ou uso de interesses, desejos ou visualizações como sinais de recomendação.

**Scale/Scope**: Desejos de produto/oferta, histórico individual e recomendações por buscas de produto. O catálogo, a busca de produtos, cadastro de loja e oferta, comparação entre ofertas, alertas, compra e pagamento têm escopo próprio e não são criados por este plano. Interfaces e dados de catálogo são pré-requisitos para o fluxo completo.

## Constitution Check

**Avaliação inicial**: nenhum desvio proposto; disponibilidade dos contratos e dados do catálogo e da busca é necessária antes da implementação dependente.

| Princípio | Atendimento previsto | Situação após design |
| --- | --- | --- |
| I — Descoberta confiável | Identificar oferta e dados conhecidos, não inferir equivalência ou compras, identificar dados fictícios. | Atendido pelo desenho; depende de catálogo confiável. |
| II — Rastreabilidade | Especificação, pesquisa, modelo e contratos distinguem comportamentos escolhidos e dependências. | Atendido documentalmente. |
| III — Identidade e comunicação | Operações privadas filtradas pela conta validada na API; publicidade e alertas permanecem independentes; sem sucesso antecipado. | Atendido pelo desenho; implementação futura deve preservar isolamento. |
| IV — Experiência acessível | Controles identificados e estados de andamento, vazio, erro e conexão. | Atendido no contrato de interface; protótipo precisa refletir escolha entre produto e oferta. |
| V — Simplicidade e transparência | Reutilização da base existente e fonte principal única; não alegar catálogo, implantação ou execução. | Atendido no desenho; sem novos serviços definidos. |
| Fluxo sem testes | Não criar etapa obrigatória de testes; guia futuro descreve comportamento sem alegar execução. | Atendido. |

**Reavaliação pós-design**: sem violação identificada no desenho documental; o resultado não comprova funcionamento nem garante que a dependência de catálogo esteja disponível. Antes da implementação, alinhar contratos, identidade, remoção de produtos/ofertas e relevância de busca com a feature responsável.

## Project Structure

### Documentation (this feature)

```text
specs/009-desejos-recomendacoes/
  spec.md
  checklists/requirements.md
  plan.md
  research.md
  data-model.md
  contracts/api.md
  contracts/ui.md
  quickstart.md
```

As tarefas posteriores foram registradas em [tasks.md](tasks.md), incluindo os bloqueios da dependência de catálogo e busca.

### Source Code (repository root)

```text
backend/src/                 identidade, serviços e rotas existentes
backend/supabase/migrations/  persistência existente; desenho novo depende do catálogo
frontend/src/app/            navegação existente
frontend/src/features/       Início e fluxos existentes
frontend/src/shared/         navegação e cliente HTTP existentes
```

**Structure Decision**: estender a organização existente por funcionalidades; manter interface, estado e acesso à API separados, e regras/autorizações no backend. Os nomes de arquivos novos e migrações dependerão dos contratos de catálogo e da geração de tarefas. Não tratar a busca de lojas do mapa como busca de produtos.

## Phase 0 — Pesquisa

[research.md](research.md) registra escolhas informadas pelo usuário e inspeção da base: não existem no código consultado catálogo de produtos/ofertas, busca de produtos, desejos ou recomendações. A escolha final usa apenas buscas como sinal e mantém visualizações no histórico sem usá-las para recomendar. A fonte de histórico de compras foi retirada deste recorte. Os detalhes da relevância textual pertencem à futura busca de catálogo, sem afirmar uma solução já existente.

## Phase 1 — Design

### Desejos

Associar à conta validada um vínculo tipado para produto ou oferta do catálogo. O desenho proposto impede duplicar o mesmo vínculo por conta e preserva separadamente um produto e uma oferta dele. Ao remover, atingir somente o vínculo solicitado. Consultar o estado confirmado após interrupção; não substituir referência ausente por outra presumidamente equivalente. O ciclo de vida de referências e a identificação mínima para itens indisponíveis exigem integração com o catálogo.

### Histórico e recomendações

Registrar buscas de produtos e visualizações em entradas individualmente identificáveis da conta, até exclusão individual. Recomendações usam apenas buscas que permanecem registradas e correspondências efetivas do catálogo; visualizações, interesses, desejos e compras não são sinais. Uma exclusão confirmada deve retirar a busca de novas recomendações, inclusive de eventuais agregados ou respostas atrasadas. Uma nova interação real pode originar nova entrada. Não oferecer ao usuário desativação do uso das buscas.

As recomendações aparecem em uma seção discreta no Início, sem interromper a navegação. A dependência de busca precisa fornecer sua regra de relevância e resultados confiáveis; este plano não inventa pesos, equivalência, limites ou produtos.

### Interfaces e estados

[contracts/api.md](contracts/api.md) propõe operações privadas, dependências e semântica de confirmação; [contracts/ui.md](contracts/ui.md) descreve fluxos, escolha entre tipos, histórico e estados. A interface deve comunicar carregamento, vazio, falha, falta de conexão ou resultado desconhecido e oferecer ações acessíveis. A tela 07 atual do protótipo só menciona salvar produto; o novo seletor produto/oferta precisa ser refletido no material visual.

### Rastreabilidade

| Escopo | Requisitos | Dependência principal |
| --- | --- | --- |
| Salvar, sincronizar e remover desejos | FR-001–005, FR-011–012 | Identidade 004; produto/oferta e dados do catálogo. |
| Descoberta por buscas e histórico individual | FR-006–009, FR-011–012 | Identidade; busca de produtos e catálogo. |
| Separação de consentimento, alerta e compra | FR-008, FR-010 | Preferências existentes; nenhuma integração de compras. |

## Complexity Tracking

Nenhuma exceção constitucional proposta. O desenho não adiciona serviço, segundo banco ou sincronização dupla; decisões de integração de catálogo e persistência concreta devem ser tomadas quando suas especificações estiverem disponíveis.

## Limitações e próximos passos

O guia [quickstart.md](quickstart.md) registra pré-requisitos e comportamento futuro, sem afirmar execução. Ainda faltam catálogo, busca de produtos e seus contratos no código consultado. A geração de tarefas pode separar o trabalho independente e marcar como bloqueadas as tarefas que precisem dessas dependências. Nenhum teste funcional foi executado nesta etapa.
