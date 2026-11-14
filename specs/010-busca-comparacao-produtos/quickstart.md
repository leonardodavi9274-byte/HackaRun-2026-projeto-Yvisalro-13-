# Quickstart: Busca e comparação de produtos

Este guia descreve pré-requisitos e cenários futuros; não registra execução funcional ou serviço configurado. A constituição prevê fluxo sem testes como etapa padrão. Não execute migrações remotas, seeds ou alterações no ambiente da equipe sem o procedimento e credenciais autorizados.

**Inventário local em 2026-11-14:** antes da implementação havia migrações 0001–0018; foram criadas localmente 0019 e 0020 para o catálogo. A 009 previa esses números e deverá usar outros após integração. Confirmar o conjunto efetivo antes do corte. Existe um arquivo de ambiente do backend, sem que sua presença confirme conexão ou migrações remotas; o estado remoto não foi consultado. O Node global é 26.13.1 e há Node portátil 24.22.3 em `.tools`.

**Compilação:** `npm run build` passou com Node 24.22.3 em 2026-11-14. Nenhum teste funcional, migração SQL ou corte remoto foi executado; a compilação não demonstra funcionamento ponta a ponta.

## Pré-requisitos

1. O código local das rotas e telas de catálogo foi criado; a aplicação depende da configuração, migrações e corte coordenado descritos abaixo.
2. Usar Node.js 24.22.3 e npm com as dependências do workspace. A API precisa do Supabase principal configurado somente no servidor; não registrar credenciais em arquivos versionados.
3. Confirmar migrações aplicadas e número livre, inclusive trabalho da 009. Aplicar a migração de catálogo somente conforme procedimento de implantação e transição da [008](data-model.md#migração-e-ciclo-de-vida-promocional), com mapeamento explícito e backup. O planejamento não aplicou migrações.
4. Disponibilizar dados fictícios identificados: uma variante ofertada em duas lojas, outra variante ou produto da mesma categoria, nomes/sinônimos, tipos e ofertas com diferentes estados, incluindo valores desconhecidos. Não inventar preço ou posição para completar resultado.

## Comandos de desenvolvimento

Na raiz do projeto, depois da implementação e configuração:

```powershell
npm ci
npm run build
npm run dev
```

Se o Node global não for a versão prevista, coloque `.tools/node-v24.22.3-win-x64` no início do `PATH` antes dos comandos. Não execute `npm ci` sem necessidade se as dependências já estiverem instaladas.

O frontend de desenvolvimento é `http://127.0.0.1:5173` e o proxy `/api` aponta ao backend local. No Windows sem Node global, consultar [desenvolvimento](../../docs/desenvolvimento.md). Build bem-sucedido só demonstra compilação; sem Supabase/dados confirmados, a busca deve informar indisponibilidade. Não executar esses comandos como se já provassem os fluxos.

## Cenários de aceite para referência futura

| Cenário | Resultado esperado |
| --- | --- |
| Visitante abre `/buscar` com sessão ausente ou falha | Pesquisa acessível; resultado indica produto, variante, loja abaixo, preço e disponibilidade conhecidos e selo de demonstração. |
| Buscar parte do nome com acento omitido ou sinônimo cadastrado | Encontra correspondências; nome precede sinônimo e categoria, com desempates descritos no contrato. |
| `têns` quando existir `tênis` como termo cadastrado | Sugere `tênis`; só altera a busca após ação da pessoa. Se apenas os filtros eliminarem os resultados, não atribuir o vazio a erro de grafia. |
| Filtrar mínimo 100 e máximo 200 reais | Inclui limites; valor desconhecido não aparece com filtro de preço. Mínimo maior que máximo é rejeitado com orientação. |
| Comparar a mesma variante em duas lojas | Disponíveis primeiro por preço conhecido, depois disponíveis sem preço, esgotadas e disponibilidade desconhecida; os últimos grupos por loja. Variante diferente aparece como alternativa. |
| Selecionar loja com posição conhecida | Mapa recebe a loja e permite escolher ponto inicial; rota não inicia automaticamente. Sem posição, explicar indisponibilidade. |
| Promoção migrada e sua confirmação | O mesmo ID identifica a oferta no catálogo e na 008; confirmação por revisão preserva critérios de elegibilidade e suprime pop-up durante rota ativa. |
| Fonte falha, item removido ou consulta vazia | Distinguir erro, referência ausente e resultado vazio; não mostrar preço, estoque ou equivalência inventados. |

Histórico, desejos e recomendações da 009 permanecem dependentes de sua própria integração. Não afirmar que foram implementados por disponibilizar o catálogo.
