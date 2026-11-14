# Hackarum-Yvisalro — entrega inicial e próximos passos

Este documento organiza o trabalho da equipe. As pendências gerais abaixo continuam separadas das tarefas da feature 004; o relatório desta implementação aparece ao final.

## Materiais disponíveis

- [Base frontend e WebAPI](desenvolvimento.md): instalação, execução e limites da estrutura inicial; arquitetura na [feature 003](../specs/003-base-webapi-frontend/plan.md).
- [README](../README.md): proposta, tecnologias, ideias e situação geral.
- [Frontend e protótipos](frontend.md): descrição das 11 imagens disponíveis e dos fluxos do consumidor.
- [Especificação inicial](../specs/001-vitrine-perto/spec.md): histórias, regras de negócio, cenários e critérios de sucesso.
- [Checklist de qualidade](../specs/001-vitrine-perto/checklists/requirements.md): pontos da especificação que ainda necessitam de revisão.
- [Detalhamento geral do projeto](detalhamento-projeto.md): situação atual, módulos previstos, arquitetura e pendências.
- [Guia de Git e GitHub](guia-git.md): atualização local, envio de commits e integração de branches.
- [Revisão dos seis itens](revisao-conformidade.md): versões consultadas, decisões e cobertura da entrega.
- [Rascunho de landing pages em slides do Canva](landing-pages-canva.md): roteiros propostos para consumidor e lojista; formato e ferramenta a confirmar.
- [Feature 002](../specs/002-planejamento-hackarum-yvisalro/spec.md): revisão atual do planejamento e esclarecimento sobre o banco principal.

## Pendente para a entrega acadêmica

1. Definir formato, ferramenta, quantidade e finalidade das landing pages. Revisar os roteiros propostos para consumidor e lojista e produzir os materiais e as evidências do formato aprovado.
2. A tecnologia sorteada é landing page, conforme registro da equipe em `8bcbfeb`. Confirmar se a etapa aceita a apresentação em slides ou também exige site publicado.
3. Completar os esboços necessários para o painel da empresa e os pontos de entrada do login com Google e Apple; conferir os 11 protótipos existentes.
4. Fechar a especificação: política de representantes de empresas, equivalência de produtos, regras de relevância, frequência de emails promocionais e coordenadas fictícias de demonstração.
5. Elaborar o plano técnico, modelo de dados e contratos da API; conferir autenticação, separação dos dados entre empresas, notificações e integração do mapa.
6. Gerar a lista de tarefas por história e executar a análise de consistência. Os comandos dependem do plano técnico; a análise não foi executada.
7. Conferir o material com a equipe, responsável e professor, e definir cronograma e hospedagem do backend.

## Decisões já registradas

- Em 13/11/2026, após a análise dos debates da branch do Victor, foram confirmados React para o frontend web e painel empresarial, PostgreSQL no Supabase como banco do MVP e TypeScript para o backend Node.js. TypeScript também é proposto para React. A integração e a implementação permanecem pendentes.
- Manter as 11 telas no canvas de design atual e suas imagens exportadas como referência de UX, conforme esclarecimento do usuário.
- Aplicativo em Flutter/Dart, com MVVM nas interfaces; HTTPS/JSON na API e Supabase Auth previstos.
- Opção A confirmada pelo usuário: MySQL permanece somente alternativa documentada, sem segundo banco operacional no MVP.
- O formato das landing pages continua pendente; os slides no Canva são uma proposta de apresentação, separada do canvas de design das telas.
- Autenticação real, login com Google e Apple, recuperação por email e sincronização de desejos e preferências por conta.
- Uma empresa pode criar a conta e publicar imediatamente; não deve administrar dados de outra empresa.
- A busca prioriza relevância e, entre resultados semelhantes, o menor preço; itens sem estoque aparecem por último. Variantes relacionadas não são automaticamente idênticas.
- Geolocalização do dispositivo para descoberta, alternativa de seleção manual e mapa interno e rotas simulados. Uma rota ativa impede pop-ups promocionais próximos.
- Alertas solicitados por email quando houver reposição ou o preço desejado for atingido, respeitando as preferências; comunicações promocionais dependem da escolha do usuário.
- O objetivo é ajudar a encontrar produtos cadastrados; o usuário pode sair sem comprar e o sistema deve informar quando não houver resultado.

## GitHub

Na verificação de 13/11/2026, o [repositório GitHub](https://github.com/leonardodavi9274-byte/HackaRun-2026-projeto-Yvisalro-13-) estava publicado. A `main` do GitHub e `docs/detalhamento-frontend` estavam no commit `bbbda4a`, antes desta revisão. A branch do Victor estava em `8bcbfeb`, incluindo a reorganização `e3d5af5`, o tema do desafio, a prática sorteada e TypeScript. O [relatório](revisao-conformidade.md) distingue as versões consultadas; não houve merge dessa branch nesta revisão.

O repositório reúne planejamento e protótipos. A publicação do aplicativo e a configuração dos serviços ainda não foram realizadas no material analisado. Consulte o guia de Git para atualizar a base local e enviar novos documentos por branch e pull request.


## Cadastro e preferências — implementação de 2026-11-14

O código da feature 004 implementa os dois passos de cadastro do consumidor, entrada
mínima por e-mail/senha, confirmação, interesses, publicidade optativa/revogável e avatar
privado. Também inclui consulta e correção de cadastro incompleto e resolução de
respostas perdidas usando a mesma intenção, sem aplicar escolhas a contas encontradas
apenas por e-mail.

São 70 de 71 tarefas concluídas no código/documentação. T070 permanece pendente:
projeto/chaves Supabase, aplicação das migrações, configuração Auth/SMTP/bucket e
documentos legais reais. Foi identificada uma integração Supabase disponível, ainda
sem instalação/conexão confirmada. Nenhuma migração remota, criação de conta, envio
de e-mail, upload real ou publicação foi executada nesta entrega.

### Cobertura por requisito

| Requisitos | Implementação |
| --- | --- |
| FR-001–FR-005 | Views/ViewModels de registration; validation.ts; registration.service.ts; intenção e trigger de vínculo |
| FR-006–FR-007 | PhotoPicker/PhotoCompletion; SharpImageProcessor; AvatarService; recibos e Storage privado |
| FR-008–FR-010 | CategoryGrid/ProductInterestInput; transação de inicialização e restrições de interesses |
| FR-011–FR-013 | MarketingConsentField/MarketingPreferencesView; MarketingService e transação de evento/projeção |
| FR-014 | requireAuth, WebSessionService, ConsumerService e vínculo de sujeito nas RPCs |
| FR-015–FR-017 | Estados/receipts; snapshot congelado; correções autorizadas; finalização persistida; revisão de foto |
| FR-018–FR-019 | Guardas HTTP, rate limit, erros estruturados, logs sem credenciais e estados de falha/retomada |
| FR-020 | Componentes de formulário, foco/labels, seleção textual e estilos responsivos das telas 02/03 |
| FR-021 | Links do cadastro provenientes da configuração; destinos/conteúdo reais ainda dependem de T070 |
| FR-022 | IdentityService/ConfirmationView e verificação explícita de TokenHash/reenvio |
| SC-001–SC-006 | Mantidos como critérios de produto, sem medição ou execução de cenários nesta entrega |

O [tasks.md](../specs/004-cadastro-preferencias/tasks.md) contém caminhos específicos e
dependências. O [contrato HTTP](../specs/004-cadastro-preferencias/contracts/api.md) e o
[modelo](../specs/004-cadastro-preferencias/data-model.md) descrevem limites e transações.

### Evidência e limites

- npm run build concluiu compilação TypeScript e build Vite, sem erros ou avisos ao final.
- Não foram criados/executados testes; a política da constituição foi preservada.
- A revisão de código não comprova execução do SQL, entrega de e-mail, sincronização
  entre dispositivos, aparência renderizada ou metas de uso.
- Não foram adicionados catálogo, recomendações, Desejos, alertas, empresas, login
  social, recuperação completa, app móvel ou hospedagem.
- Os protótipos/imagens foram preservados. A implementação usa o padrão visual deles
  com os ajustes de publicidade inicialmente desligada e separação de alertas.
