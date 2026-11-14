# Implementation Plan: Autenticação real e recuperação

**Branch de implementação**: `007-autenticacao-supabase`. **Data**: 2026-11-14. **Spec**: [spec.md](spec.md).

## Summary

Estender a base web e API para recuperação por código, entrada social Google/Apple e preenchimento automático. Reutilizar Supabase Auth e a sessão opaca existente, adicionando autorização isolada para recuperação e onboarding social idempotente. O desenho é preliminar nos pontos dependentes dos bloqueios abaixo; não presume funcionamento dos serviços.

## Technical Context

**Linguagem**: JavaScript/React no cliente; TypeScript 7.0.2 e Node.js 24 no serviço. **Dependências**: React 19.3.1, Express 5.3.0, `@supabase/supabase-js` 2.119.0, Supabase Auth e SMTP transacional. **Dados**: PostgreSQL Supabase; sem segundo banco. **Testes**: fluxo da equipe sem etapa de testes; cenários em quickstart são referência operacional opcional. **Plataforma**: web responsiva 360–1440 px, Chrome/gerenciador Google e Safari/Senhas iCloud em ambientes compatíveis. **Desempenho**: meta SC-001 da spec; nenhuma capacidade adicional presumida. **Limites**: credenciais privilegiadas no servidor, consentimento separado, campanhas e aplicativo móvel fora do recorte.

## Constitution Check

| Princípio | Avaliação antes e após desenho |
| --- | --- |
| I e II — escopo e rastreabilidade | Atende: histórias e FRs mapeados abaixo; impedimentos registrados. |
| III — identidade, isolamento e comunicação | **Pendente**: revogação imediata, limite de OTP e proteção de conta social precisam de garantias não demonstradas. Não liberar fluxos afetados até resolver B1–B3. |
| IV — acessibilidade | Atende no desenho: estados, teclado, rótulos e mensagens para US1–US4. |
| V — simplicidade e transparência | Atende condicionalmente: banco e base existentes; mecanismos adicionais têm finalidade explícita. |
| Fluxo e testes | Planejamento originado em `main`; implementação em branch própria e PR. Sem testes obrigatórios ou alegação de execução. |

## Bloqueios antes da implementação dependente

- **B1 — recuperação e conta social (FR-007 e conta social)**: em 2026-11-14 o usuário aceitou os limites de tentativas do Supabase e decidiu que contas exclusivamente sociais não devem criar senha pela recuperação. Demonstrar como impedir essa criação inclusive pelos endpoints públicos e como invalidar o código anterior ao reenviar; um controle somente no proxy é contornável por chamadas diretas.
- **B2 — revogação imediata (FR-009, US1.5)**: sign-out global revoga sessões/refresh tokens, mas JWT já emitido pode permanecer válido. Validar `session_id` ativo na origem confiável em todas as operações privadas e revogar transacionalmente sessões web por usuário, inclusive refresh concorrente. Demonstrar acesso suportado e fail-closed à fonte de sessões no ambiente, incluindo bearer e acessos diretos ao banco/RLS; se não for possível, alinhar o requisito antes de liberar. Não confirmar sucesso enquanto sessão anterior puder autorizar acesso.
- **B3 — associação social (FR-012)**: Supabase associa identidades automaticamente pelo mesmo e-mail verificado antes do callback. Em 2026-11-14 o usuário exigiu confirmação adicional antes de associar. Obter controle preventivo suportado, inclusive para conta não confirmada e possível remoção de identidade, antes de habilitar OAuth. Recusa após callback não desfaz efeitos anteriores.

Esses pontos são dependências técnicas em aberto, não mudanças silenciosas da spec. Configuração e acesso aos fornecedores também permanecem pendentes. Ver [pesquisa](research.md).

## Fases e dependências

1. **US1 (FR-001–004, 015–017)**: adaptar `requireAuth`, checagem de sessão e logout; conciliar erro genérico com confirmação de e-mail; limpar dados privados ao sair. B2 precede a garantia de revogação imediata.
2. **US2 (FR-005–009, 016–018)**: após B1/B2, configurar OTP, transações e envio; restringir a sessão de recuperação no servidor; apresentar solicitação, código e nova senha com respostas uniformes.
3. **US3 (FR-010–013, 018)**: após B3, OAuth PKCE por provedor, retorno correlacionado, sessão web e onboarding social autenticado idempotente; publicidade inicia desligada.
4. **US4 (FR-014, 017)**: campos e formulários semânticos, atributos de preenchimento e estados acessíveis; suporte manual. Independente dos bloqueios.
5. Configurar SMTP e provedores sem registrar segredos; só disponibilizar cada fluxo após resolver suas dependências. Campanhas seguem pendentes.

## Project Structure

### Documentation

```text
specs/007-autenticacao-supabase/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/auth.md
└── quickstart.md
```

### Source Code

```text
frontend/src/features/session/       # login, recuperação e retorno social
frontend/src/features/registration/  # onboarding e campos
frontend/src/app/                    # rotas e sessão
backend/src/application/             # casos de uso e portas
backend/src/infrastructure/          # Supabase e sessões
backend/src/presentation/http/       # rotas, autenticação e cookies
backend/supabase/migrations/         # dados privados e operações atômicas
```

**Structure Decision**: ampliar camadas e convenções existentes. Interfaces em [contracts/auth.md](contracts/auth.md), estados em [data-model.md](data-model.md); tarefas pertencem à etapa posterior.
