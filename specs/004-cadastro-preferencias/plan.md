# Implementation Plan: Cadastro e preferências do consumidor

**Branch Git atual**: main | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Identificador do workflow**: 004-cadastro-preferencias. O setup-plan retornou esse identificador em BRANCH por usar o diretório da feature como fallback; git branch --show-current confirmou main. Nenhuma branch foi criada ou trocada neste planejamento. A implementação deve ocorrer em branch própria.

**Input**: specs/004-cadastro-preferencias/spec.md, classificação Semi-Essencial.

## Summary

Entregar cadastro do consumidor em dois passos conforme as telas 02/03: nome/e-mail/senha, foto opcional, interesses e publicidade por e-mail desligada inicialmente. Concluir/Pular cria a identidade uma única vez e aguarda confirmações reais; preferências acompanham a conta e a publicidade pode ser revogada depois.

Reutilizar React/JavaScript com MVVM e a WebAPI Express/TypeScript. Auth e persistência Supabase ficam no backend. A criação usa intenção idempotente sem senha e vínculo mínimo em trigger de identidade; perfil/interesses/publicidade são salvos juntos numa transação, enquanto confirmação e foto possuem estados retomáveis. Sessão web usa cookie opaco; dados privados passam pela API. A foto é enviada como binário autenticado, validada e armazenada em bucket privado.

Este comando termina no design da Fase 1: não implementa código, migrações, configurações externas ou tarefas.

## Technical Context

**Language/Version**: Node.js 24.22.3, TypeScript 7.0.2/ESM no backend; JavaScript/JSX no frontend, conforme versões fixadas nos manifests e lockfile.

**Primary Dependencies**: Express 5.3.0, Supabase JS 2.119.0, React/React DOM 19.3.1 e Vite 8.3.8 existentes; Sharp 0.35.5 planejado apenas no backend para decodificação de fotos. Reutilizar CORS/Helmet existentes. Sem novo framework, roteador, banco ou serviço de fila.

**Storage**: PostgreSQL no Supabase para dados/estado operacional, Supabase Auth para identidade e Supabase Storage privado para avatares. Storage de arquivos não constitui segundo banco de negócio. Sem MySQL ou escrita dupla.

**Testing**: fluxo sem testes da constituição 1.0.0; não criar suítes, scripts de teste, TDD ou etapa de testes manuais. Revisão documental agora; compilação na implementação; quickstart documenta execução/uso futuro sem afirmar cenários executados.

**Target Platform**: web responsiva em navegadores atuais, larguras de 360–1440 pixels; execução local na base Windows/Node. Em publicação futura, HTTPS com frontend e /api na mesma origem. Aplicativo Flutter e hospedagem estão fora deste recorte.

**Project Type**: aplicação web com frontend e backend separados em npm workspaces, mantendo uma única API de negócio.

**Performance Goals**: metas da spec SC-001–SC-006, incluindo preencher os dois passos em até 3 minutos por 90% dos participantes de eventual avaliação, sem esperar entrega de e-mail. Não inventar meta de usuários simultâneos sem demanda. Operações ficam assíncronas, com feedback imediato de andamento; rede/Auth podem falhar e não têm sucesso presumido.

**Constraints**: senha mínimo 8 caracteres Unicode/máximo 72 bytes UTF-8; foto JPEG/PNG/WebP ≤5 MiB/25 MP; até 10 termos de 100 caracteres; JSON ≤1 MiB; nove categorias iniciais. Sem senha persistida, tokens de identidade no frontend ou credenciais privilegiadas no cliente. Publicidade opcional e separada de alertas.

**Scale/Scope**: MVP em um processo de API, duas telas de cadastro, estados de confirmação/retomada, entrada mínima por e-mail/senha, Início conectado à conta e controle posterior de publicidade. Fora: login social, recuperação completa, catálogo/busca/recomendações, Desejos/alertas, empresas, campanhas, app móvel, publicação.

**Operational Inputs**: projeto/chaves Supabase, APP_SECURITY_KEY, SMTP e documentos legais reais. São pré-requisitos de execução, não decisões técnicas pendentes. Sem esses valores, base inicia mas cadastro comunica indisponibilidade.

## Constitution Check

**Gate inicial, antes da pesquisa:** aprovado para planejamento. Nenhuma necessidade de alterar tecnologias ratificadas ou a política sem testes. As lacunas de integração são decisões de design resolvidas em research.md.

| Princípio/regra | Decisão aplicável | Gate após design |
| --- | --- | --- |
| I — Escopo explícito e descoberta confiável | Recorte de conta; nenhum produto, recomendação ou e-mail simulado é apresentado como real. | Aprovado |
| II — Rastreabilidade | Cinco histórias e FR-001–FR-022 mapeados abaixo; spec registra ajustes de defaults e divergências das imagens. | Aprovado |
| III — Identidade e comunicação | Supabase Auth, validação na API, vínculo de proprietário, publicidade false/alterável e estados só após confirmação. | Aprovado |
| IV — Experiência acessível | Dois passos preservados; foco/labels/estado textual, carregamento/vazio/erro/offline e retomada. | Aprovado |
| V — Simplicidade e transparência | Base reaproveitada, banco único, biblioteca de imagens com finalidade concreta, sem implantação alegada. | Aprovado |
| Tecnologias e segredos | React JS/JSX mantido; backend TS/Express existente; privilégios só no servidor, sem migração de tecnologia. | Aprovado |
| Processo sem testes | Não gerar testes nem tratá-los como requisito; quickstart é guia de execução/uso futuro, sem resultados alegados. | Aprovado |
| Branch/entrega | Planejamento local em main; branch própria e PR antes de integrar futura implementação. Sem commit, push ou merge neste comando. | Aprovado para a fase atual |

**Reavaliação após Fase 1:** aprovada. Acesso privilegiado ignora RLS e, por isso, autorização explícita está definida em API/RPC, sem atribuir garantias falsas às políticas. Auth/SMTP/Storage não são descritos como transação única. Renovação externa perdida pode exigir login novamente. Nenhuma exceção constitucional foi necessária.

Revisão cruzada final alinhou a conclusão persistida, o fencing de uploads, o receipt de dispensa de foto e o hash completo das correções. Foram conferidos os artefatos e seus links; isso não representa execução da aplicação ou dos cenários funcionais.

## Project Structure

### Documentation (this feature)

~~~text
specs/004-cadastro-preferencias/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── api.md
    └── ui.md
~~~

tasks.md pertence ao comando posterior $speckit-tasks e não é gerado agora.

### Source Code (repository root)

Estrutura prevista; diretórios/arquivos abaixo ainda serão criados ou ampliados na implementação.

~~~text
frontend/src/
  app/
    App.jsx                         composição, provedores e guardas
    navigation.js                   rotas/History API do recorte
  features/
    registration/
      models/                       políticas, rascunho, estados retornados
      views/                        AccountStep, PreferencesStep, Confirmation
      viewmodels/                   estado e comandos do cadastro/retomada
      repositories/                 configuração, categorias, cadastro, foto
    session/
      views/                        entrada mínima e sair
      viewmodels/                   sessão e autenticação
      repositories/                 acesso à API de sessão
    account-preferences/
      views/                        edição de publicidade
      viewmodels/                   edição distinta do valor salvo
      repositories/                 consulta/alteração da própria conta
    home/                           base existente; conta e lista de categorias
  shared/components/                campos, mensagens e botões acessíveis
  shared/services/http-client.js    JSON/mutações/binário e erros estruturados
  styles/                          tokens existentes e estilos de formulários

backend/
  supabase/migrations/             tabelas, categorias, RPCs e trigger mínimo
  src/
    config/                        ambiente e readiness do cadastro
    domain/registration/           validação e estados independentes de HTTP
    domain/preferences/            interesses e escolha promocional
    application/
      ports/                       interfaces de Auth/persistência/imagem/sessão
      services/                    cadastro, retomada, sessão, foto e publicidade
    infrastructure/
      supabase/                    Auth por requisição, RPCs e Storage
      sessions/                    cookie opaco e tokens criptografados
      images/                      validação/transformação Sharp
    presentation/http/
      controllers/                 tradução de DTOs/resultados
      routes/                      rotas /api/v1 existentes e novas
      middlewares/                 identidade, origem, limites e erros
    app.ts                         composição das dependências
    server.ts                      inicialização existente
~~~

**Structure Decision**: manter View → ViewModel → Repository → HTTP no frontend e controller → serviço → porta/adaptador no backend. Views não chamam Supabase e controllers não implementam regras de consentimento. Acrescentar somente portas usadas pelos serviços deste recorte, sem repositório CRUD genérico.

## Phase 0 — Research concluída

[research.md](research.md) resolve autenticação, prova de criação real, sessão, transações, foto, versões e limites. Fontes oficiais e alternativas descartadas estão junto a cada decisão. A skill solicitou agentes de pesquisa; dois agentes fizeram pesquisa de Auth e de dados/imagens, com consolidação e revisão pelo agente principal.

Defaults corrigidos na spec: senha 128 caracteres → 72 bytes UTF-8 máximos, compatível com Auth; foto passa a explicitar 25 MP e avatar estático. Não são mudanças nas tecnologias aprovadas. Não há marcador de esclarecimento técnico pendente.

## Phase 1 — Design e contratos

### Fronteira de identidade e sessão

- Criar cliente Auth isolado com chave publicável e persistSession/autoRefreshToken/detectSessionInUrl desativados. O singleton privilegiado da base não recebe sessão de usuário.
- Expor cadastro, verificação, reenvio e entrada mínima por API. Verificação por TokenHash exige POST explícito; GET da página não consome o link.
- Cookie opaco e tokens criptografados ficam sob responsabilidade do backend. Validar getUser em operações privadas; não autorizar apenas por decodificar JWT ou ler cookie.
- Renovação usa lease commitado antes da rede e compare-and-swap com revisão/owner; timeout de 10s menor que lease de 30s. Falha entre Auth e persistência pode pedir novo login.
- Origem exata + cabeçalho não simples em mutações, cookies Lax e ausência de mutações GET compõem a defesa CSRF. Configurar respostas privadas sem cache e redigir logs.

### Cadastro, confirmação e dados parciais

- Continuar do passo 1 só valida memória. Ao concluir/pular, criar intenção e snapshot não secreto congelado; segredo de retomada não lê dados da conta.
- Trigger mínimo liga somente nova inserção Auth à intenção válida. O vínculo no banco comprova criação; retorno ofuscado não vira sucesso.
- Claim de intenção é transação curta, encerrada antes de signUp; o trigger pode bloquear essa linha sem deadlock da chamada externa.
- Depois do vínculo, inicializar perfil/interesses/consentimento numa única RPC. Falha mantém identidade e estado incompleto. Retomada exige usuário autenticado igual ao vínculo e nunca aplica snapshot por e-mail.
- Repetição consulta estado e reaproveita intenção; não gera nova chave automaticamente. Ausência de vínculo após timeout continua incerta, não ausência comprovada de conta.
- Confirmação, dados e foto têm pendências simultâneas. Início só após todas as condições e sessão válida.
- Se tudo estiver resolvido mas faltar gravar a conclusão, ready_to_complete exige POST de finalização; completed só existe após esse commit. Rejeição definitiva sem criação permite novo par de intenção após correção; incerteza/vínculo não permitem reset por retry.

### Telas e foto

[contracts/ui.md](contracts/ui.md) define rotas, componentes e estados. Preservar a composição das imagens, corrigindo publicidade inicialmente ligada, texto que mistura ofertas/alertas e ausência de retorno/Passo 2.

Rascunho/senha/File ficam em memória; retornar entre passos preserva-os, sair explicitamente/fechar/recarregar descarta-os. Nova sessão recupera dados salvos, nunca senha. Foto selecionada só é enviada após autenticação; outro dispositivo pede nova seleção ou dispensa, sem apagar escolhas confirmadas.

Avatar binário usa endpoint específico, express.raw e Sharp; saída privada e estática. Upload e associação ao perfil têm recibo retomável. Não aumentar limite JSON nem enviar base64. A primeira gravação confirmada ou dispensa explícita resolve a pendência.

Operações de foto usam revisão/última intenção sob lock e revalidam no commit depois da rede: uma foto atrasada não desfaz dispensa ou finalização. Dispensa tem receipt próprio sem bytes, e correções de onboarding têm fingerprint do payload completo. Replays retornam estado vigente, sem reaplicar efeitos antigos.

Início deste recorte exibe dados da conta, lista das categorias disponíveis e acesso às preferências; não finge catálogo, pesquisa ou recomendações que ainda não existem.

### Publicidade e consistência

Evento e preferência atual são gravados na mesma transação, inclusive a escolha inicial false. Alterar publicidade é uma operação própria, autenticada, com versão do aviso e idempotência. Repetir ativação anterior após revogação retorna o valor atual sem reativar.

Não criar Desejos ou alertas a partir dos termos livres. Envio futuro de campanha deve consultar autorização vigente; nenhum serviço de campanhas é adicionado.

### Artefatos gerados

- [data-model.md](data-model.md): campos, restrições, autorização, transações e estados.
- [contracts/api.md](contracts/api.md): endpoints, cabeçalhos, payloads, erros, idempotência e confirmações.
- [contracts/ui.md](contracts/ui.md): correspondência entre telas, rotas e chamadas.
- [quickstart.md](quickstart.md): dependências operacionais, preparação, comandos e resultados esperados de uso futuro.

## Rastreabilidade para geração de tarefas

| Histórias | Requisitos | Entrega prevista / dependência |
| --- | --- | --- |
| US1 + US5 | FR-001–005, FR-015–019, FR-021–022 | Base de dados/intenção/trigger → Auth/sessão → cadastro e confirmação/retomada → navegação real. |
| US2 | FR-008–010, FR-014 | Categorias e snapshot/transação do perfil → grade/termos/Pular → consulta entre sessões. |
| US3 | FR-011–014, FR-017–019 | Histórico/projeção/RPC → consulta/PATCH autenticado → controle promocional no cadastro e Perfil. |
| US4 | FR-006–007, FR-014–019 | Sessão e perfil → decoder/bucket/recibo → upload/dispensa/consulta privada. |
| Todas | FR-018–020 | Estados HTTP/UI, acessibilidade, responsividade e integração com componentes da base. |
| Produto | SC-001–SC-006 | Critérios de aceite, sem alegação de medição ou execução neste planejamento. |

Na próxima fase, ordenar fundação de dados/configuração e sessão antes das histórias dependentes, entregar o caminho mínimo sem foto/interesses antes dos incrementos e preservar as dependências de retomada. Gerar tarefas separadas por história sem suites de teste.

## Limitações e prontidão

Gate aprovado para $speckit-tasks. Implementação/liberação dependem de projeto Supabase, migrações, SMTP, chaves e documentos reais; a ausência desses valores não impede gerar tarefas e não autoriza simular sucesso.

Hospedagem, múltiplas instâncias, login social, recuperação completa e demais funcionalidades do produto continuam fora do recorte. Rate limit local pressupõe processo único; publicação escalada exige decisão de limite compartilhado. Nenhum código de aplicação foi alterado, nenhuma migração aplicada e nenhum fluxo funcional foi executado neste comando.
