# Research: Busca e comparação de produtos

**Estado**: decisões técnicas propostas para executar a spec; não há implementação, aplicação de migração ou serviço remoto comprovado por este documento.

## R1 — Fonte única e migração da 008

- **Decisão**: usar catálogo de produto, variante e oferta no PostgreSQL existente; migrar cada promoção publicada com correspondência explícita para produto/variante e fazer o repositório da 008 ler a oferta canônica. Preservar `id` de oferta, loja, categoria do produto, preço, vigência, publicação, demonstração e revisão. Validar cobertura antes do corte e abortar atomicamente se alguma linha não tiver mapeamento confiável. Não deduzir identidade pelo nome.
- **Motivo**: a tabela `published_promotional_offers` das migrações 0017/0018 contém nome livre, não identidade do produto. A spec exige incorporar/substituir os dados e a constituição exige fonte única.
- **Alternativas**: manter tabelas concorrentes ou criar correspondência por nome foram rejeitadas; projeção compatível pode ser uma consulta/view de leitura, não uma segunda fonte gravável.
- **Revisão**: propagar transacionalmente incremento de `revision` para ofertas afetadas sempre que nome, categoria ou outro campo projetado na confirmação promocional mudar. A transição mantém revisão e ID; alterações posteriores invalidam respostas antigas. Preservar `GET /promotions`, confirmação por ID+revisão, erros 404/409/503, vigência e suspensão de pop-ups em rota.
- **Corte operacional**: como o adaptador atual consulta diretamente a tabela antiga e usa relação PostgREST com `stores`, não presumir que uma view substituta preserve automaticamente esse join. Em uma janela coordenada, colocar os consumidores da fonte em indisponibilidade controlada, fazer backup, migrar e conferir em transação, implantar o adaptador canônico e só então reabrir. Em falha, manter indisponível até restaurar a versão anterior sem descartar alterações novas; não servir dados contraditórios no intervalo.

## R2 — Identidade e relações

- **Decisão**: produto genérico, variante obrigatória com ID estável e oferta de loja vinculada à variante. A comparação consulta o mesmo ID de variante; semelhança é mesma categoria, incluindo outras variantes, sem equivalência. Produto e oferta possuem identificadores estáveis distintos para a porta da 009; variante permanece explícita.
- **Motivo**: cores e tamanhos podem ser alternativas, mas não ofertas idênticas; desejos de produto e de oferta são independentes.
- **Alternativas**: identidade por texto ou por categoria foi rejeitada porque relaciona indevidamente variantes e lojas.

## R3 — Busca e ordenação

- **Decisão**: normalizar termo e campos com Unicode NFD, remover marcas de acento, usar minúsculas pt-BR e aparar espaços, como em `frontend/src/features/mall-map/models/store-search.js`. Corresponder por substring do termo normalizado no nome, sinônimos cadastrados ou nome da categoria; usar o melhor nível: nome, sinônimo, categoria. Categoria e tipo selecionados e limites de preço são aplicados em conjunto; preço nulo não satisfaz filtro ativo. Sem texto, relevância é neutra.
- **Ordem**: disponibilidade `available → unavailable → unknown`; dentro dos disponíveis, relevância e depois grupos de categoria em ordem alfabética, para que semelhantes sejam contíguos e, em cada grupo, preço conhecido ascendente e preço nulo por último; desempatar por nome de produto, loja e ID. Os dois grupos restantes seguem por nome de loja e ID. A comparação usa regra própria: disponíveis por preço e depois sem preço; esgotadas e desconhecidas, cada grupo por loja e ID. Não aplicar o preço aos dois últimos grupos.
- **Motivo**: há ordem definida apenas entre semelhantes; agrupar por categoria torna-a determinística sem estabelecer preço entre categorias diferentes. ID garante desempate estável.
- **Alternativas**: busca exata ou ordenar todas as categorias globalmente por preço contrariam a busca parcial ou a prioridade da relevância.

## R4 — Correção de digitação

- **Decisão**: oferecer sugestão somente quando a busca textual não tiver correspondência no catálogo acessível antes de aplicar filtros. Normalizar termos cadastrados; considerar candidatos de uma palavra com pelo menos quatro letras e distância de edição de uma operação, incluindo inserção, exclusão ou substituição. Ordenar por distância e termo; limitar a uma sugestão e exigir escolha explícita para nova busca. Exemplo: `têns` sugere `tênis`. Se a consulta encontrar produtos, mas filtros eliminarem todos, não sugerir grafia como causa.
- **Motivo**: resolve exemplo solicitado sem criar serviço adicional nem alterar a consulta sem autorização. O limite é proposta técnica para demonstração, não promessa de correção universal.
- **Alternativas**: correção automática rejeitada por modificar intenção; modelo externo ou busca sem limite rejeitados por complexidade.

## R5 — Público, sessão e dependências

- **Decisão**: GETs de catálogo são públicos. Em `App.jsx`, resolver `/buscar` e `/produto/...` antes de bloqueios de sessão, como já ocorre com `/mapa`; fornecer acesso em `ProjectHomeView` e Início. Falha de perfil ou sessão não impede busca.
- **Motivo**: `/inicio` é protegido, mas a spec permite visitante. Dados privados continuam atrás de autenticação.
- **Alternativas**: acessar busca apenas pelo Início foi rejeitado. A 009 poderá registrar uma busca real em sua operação privada e idempotente quando implementada; não coletar histórico anônimo nem bloquear consulta pública por falha desse registro.

## R6 — Estado e contratos

- **Decisão**: GETs públicos expõem apenas dados publicados, usam `{data}` e erros existentes, `no-store`, `400` para entrada inválida, `404` para referência ausente e `503` para fonte indisponível. Um resultado vazio é `200` somente após consulta bem-sucedida. O cliente descarta resposta obsoleta ao mudar consulta; nenhuma referência ausente é convertida em outra oferta.
- **Motivo**: a porta `backend/src/application/ports/catalog-reader.ts` distingue `found`, `missing` e `unavailable`; preserva desejos e evita dados fictícios apresentados como atuais.
- **Alternativas**: tratar falha como vazio, substituir referência ou armazenar buscas privadas em logs foram rejeitados.
- **Leitura completa**: considerar o limite de linhas do Supabase. Usar paginação interna determinística por ID até esgotar o conjunto antes de calcular filtros e ordem; se uma página falhar, rejeitar a consulta inteira. Para não combinar versões de dados em alteração, fazer a leitura sobre snapshot consistente no banco ou reconsultar quando detectar revisão de catálogo alterada. Não confundir paginação interna com truncamento da resposta pública.

## R7 — Migrações e escopo

- **Decisão**: última migração observada neste checkout é 0018; confirmar números livres no momento de implementar, pois a 009 prevê 0019 e pode ser integrada antes. Não alterar migrações já aplicadas; migração e rollback/corte têm plano documentado.
- **Motivo**: evitar colisão e alterações de histórico já implantado.
- **Alternativas**: reservar número agora ou reescrever 0017/0018 foram rejeitadas. O planejamento não prova configuração nem aplicação remota.
