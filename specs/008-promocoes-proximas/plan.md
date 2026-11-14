# Implementation Plan: Pop-ups de promoções próximas

**Branch Git atual**: `005-mapa-rota-lojas` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Identificador da feature**: `008-promocoes-proximas`. Nenhuma branch foi criada ou trocada; o valor BRANCH devolvido pelo setup identifica a feature, não a branch Git. Implementar em branch própria, conforme a constituição.

## Summary

Planejar a oferta da tela 11 sobre o Início: promoção válida de loja do mesmo piso e a até 100 m de caminhada simulada a partir do ponto manual. O estado de rota da feature 005 prevalece inclusive durante consultas assíncronas e chegada. Reutilizar mapa, caminhos e interesses reais; limitar repetições em memória. A funcionalidade é não essencial, mas, se presente, não pode interromper rota.

O repositório ainda não tem catálogo de produtos e promoções. Para permitir a entrega demonstrável sem construir gestão de catálogo, o plano propõe uma fonte mínima de **ofertas publicadas somente para leitura**, no mesmo Supabase, com dados de demonstração identificados. Ela satisfaz a dependência de fonte de ofertas desta feature; não é catálogo completo, painel ou compra. Quando o catálogo definitivo existir, este deverá substituí-la ou absorvê-la com migração, sem duplicação e sem duas fontes principais. Ausência ou falha da fonte impede o pop-up e não bloqueia o Início.

## Technical Context

**Language/Version**: Node.js `>=24.22.3 <25`, TypeScript `7.0.2` no backend; JavaScript/JSX no frontend, conforme os manifests.

**Primary Dependencies**: React `19.3.1`, Vite `8.3.8`, Express `5.3.0` e Supabase JS `2.119.0` existentes. Nenhuma biblioteca ou serviço novo.

**Storage**: PostgreSQL no Supabase como única fonte; nova tabela mínima de ofertas publicadas, com vínculos a `stores` e `interest_categories`. Sessão de exibição e ponto permanecem na memória da aplicação; nada de persistir localização ou criar réplica.

**Testing**: a constituição estabelece fluxo sem testes; não criar suítes ou tornar execução de testes manuais condição de conclusão. [quickstart.md](quickstart.md) registra comandos e cenários opcionais para uso futuro, não resultados. Compilação é verificação de construção, não teste funcional.

**Target Platform**: web responsiva, 360–1440 px, navegadores atuais. Flutter está fora deste recorte.

**Project Type**: aplicação web em workspaces frontend/backend; API comum existente.

**Performance Goals**: SC-005 da spec: abrir mapa com loja selecionada em até três ações. Sem meta numérica inventada de carga; a fonte retorna apenas ofertas vigentes do shopping ativo e o grafo do mapa é reutilizado.

**Constraints**: nenhum GPS adicional; um pop-up simultâneo e por visita; revalidação antes da apresentação; estado de rota desconhecido ou ativo impede abertura; acesso privado a interesses só da conta autenticada; ofertas e distâncias fictícias identificadas.

**Scale/Scope**: um shopping ativo e o mapa da feature 005; Início e mapa; leitura de ofertas publicadas e alguns registros opcionais de demonstração. Sem gestão de catálogo, compra, reserva, e-mail, push, histórico de compras ou rastreamento físico.

## Constitution Check

**Gate inicial**: aprovado. O plano não altera tecnologia confirmada, obrigações constitucionais ou política sem testes.

| Regra | Aplicação | Gate após design |
| --- | --- | --- |
| I — descoberta confiável | Dados obrigatórios e vigência confirmados; ofertas demo e distância simulada identificadas; não afirmar estoque ausente. | Aprovado |
| II — rastreabilidade | FR-001–013 e US1–US3 mapeados abaixo; tela 11 é referência, não prova de implementação. | Aprovado |
| III — identidade, isolamento e comunicação | Preferências obtidas pelo fluxo autenticado existente; dados públicos de oferta sem perfil; segredo apenas no servidor; e-mail permanece separado. | Aprovado |
| IV — acessibilidade e rota | Diálogo com foco, teclado e nomes; distância de ponto manual, não GPS interno; rota ativa ou desconhecida bloqueia apresentação e fecha diálogo. | Aprovado |
| V — simplicidade e fonte única | Dados no mesmo Supabase; fonte mínima somente leitura para demonstrar esta feature, sem painel ou novo serviço. Substituição pelo catálogo futuro exige migração, não escrita dupla. | Aprovado |
| Processo | Plano e contratos são propostas; nenhum teste funcional ou serviço externo foi executado. Branch de implementação e PR ficam para fase posterior. | Aprovado |

**Gate após Fase 1**: aprovado, sem exceções. Ofertas de demonstração só são exibidas quando registradas explicitamente e marcadas fictícias; falhas não viram catálogo vazio. A fonte mínima não declara o catálogo definitivo concluído. A implementação deve coordenar a numeração da migração com outras features antes de criá-la.

## Project Structure

### Documentation (this feature)

```text
specs/008-promocoes-proximas/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/api.md
└── contracts/ui.md
```

`tasks.md` pertence à próxima fase e não é criado por este comando.

### Source Code (repository root)

```text
backend/
  supabase/migrations/               # migração de ofertas publicadas e dados demo opcionais
  supabase/README.md                 # ordem, fonte e substituição futura
  src/domain/                        # validação da oferta e vigência
  src/application/ports/             # porta de leitura de ofertas
  src/application/services/          # elegibilidade de publicação e confirmação
  src/infrastructure/supabase/       # adaptador de leitura
  src/presentation/http/             # controller, rota pública e registro
  src/app.ts                         # composição do serviço
frontend/src/
  app/App.jsx                        # estado da sessão promocional acima da troca de telas
  features/home/                     # integração com perfil e Início
  features/mall-map/                 # provider de rota/ponto, índice, grafo e repositório existentes
  features/nearby-promotions/        # modelo, repositório, viewmodel e diálogo previstos
  styles/                            # apresentação responsiva do diálogo
```

**Structure Decision**: preservar camadas e MVVM existentes. API valida dados de oferta; frontend combina resultados com mapa e estado atual, sem enviar ponto ou localização. Preferências vêm do perfil autenticado. Adicionar somente os componentes necessários à leitura e apresentação.

## Phase 0 — Research

[research.md](research.md) registra decisões sobre fonte mínima, posição simulada, integração do mapa, proteção contra corrida, confirmação de dados, frequência, acessibilidade e migração futura. Não há marcadores de esclarecimento pendentes para este desenho; raio e frequência continuam premissas revisáveis da spec.

## Phase 1 — Design e contratos

- [data-model.md](data-model.md): dados de oferta, regras de validação, referência ao mapa e estados em memória.
- [contracts/api.md](contracts/api.md): leitura pública de ofertas, confirmação individual e erros; preserva API e dados privados existentes.
- [contracts/ui.md](contracts/ui.md): seleção, concorrência, ciclos de vida, controle de rota e diálogo acessível.
- [quickstart.md](quickstart.md): pré-requisitos, comandos e roteiro opcional para depois da implementação.

## Rastreabilidade e sequência para tarefas

| Etapa / história | Requisitos | Dependência e resultado |
| --- | --- | --- |
| Fundação | FR-003–004, FR-012 | Fonte mínima de ofertas, dados demo identificados, leitura/confirmação via API e integração com mapa existente. Sem seed, lista vazia é válida. |
| US1 | FR-001–005, FR-010, FR-012 | Fonte + ponto, mapa e interesses confirmados; filtro por piso/caminho e ordenação; ausência de fonte ou dados válidos não bloqueia Início. |
| US2 | FR-001, FR-006–007 | Provider de rota global e cancelamento/invalidação; bloquear antes de consultar e também no momento de renderizar. |
| US3 | FR-008–009, FR-011, FR-013 | Estado por sessão e visita; diálogo acessível, dispensa e navegação para mapa; sem alterar consentimento por e-mail. |

## Limitações e prontidão

Pronto para `$speckit-tasks`, condicionado a que a equipe mantenha as premissas de raio e frequência e utilize uma fonte mínima de leitura até o catálogo definitivo. A feature não cria gestão de catálogo nem registra promoções reais automaticamente. Sem Supabase configurado ou sem ofertas confirmadas, o Início funciona sem pop-up. O projeto Supabase e migrações existentes são dependências operacionais. Nenhum código, migração, serviço ou fluxo funcional foi executado neste planejamento.
