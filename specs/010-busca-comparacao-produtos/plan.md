# Implementation Plan: Busca e comparação de produtos

**Branch Git atual**: `0010` | **Data**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Resolução do setup**: o script identificou a feature como `010-busca-comparacao-produtos`; esse valor não altera a branch Git atual. O diretório foi resolvido por `.specify/feature.json`.

## Summary

Entregar busca pública de ofertas de demonstração por texto, categoria, sinônimos, tipo e preço; alternativas por categoria; comparação entre ofertas da mesma variante; e identificação da loja sob cada produto. O backend será a fonte das regras e fornecerá catálogo público a partir do PostgreSQL existente. O frontend web terá busca e detalhe acessíveis sem sessão. A fonte promocional da 008 será incorporada ao catálogo com preservação da identidade e do contrato, sem escrita dupla. São decisões de planejamento, não funcionalidades já executadas.

## Technical Context

**Language/Version**: Node.js 24.22.3, backend TypeScript 7.0.2; frontend JavaScript/JSX.

**Primary Dependencies**: Express 5.3.0, React 19.3.1, Vite 8.3.8, cliente Supabase 2.119.0; versões conforme os `package.json` existentes. Sem novo serviço de busca.

**Storage**: PostgreSQL/Supabase principal, migrações versionadas; tabelas protegidas e acesso mediado pelo servidor. Fonte promocional antiga substituída mediante migração coordenada.

**Testing**: política da constituição é fluxo sem testes manuais ou automatizados como etapa padrão. Critérios de aceite e o guia descrevem comportamento esperado, não execuções; build é verificação de compilação, não teste funcional.

**Target Platform**: aplicação web existente e API comum; aplicativo Flutter futuro usa os mesmos contratos, mas não é implementado aqui.

**Project Type**: frontend web React com API Express e dados Supabase.

**Performance Goals**: conjunto de demonstração pequeno; ordenar e filtrar o conjunto completo antes de limitar ou paginar; sem meta de latência ou volume aprovada.

**Constraints**: loja sob produto; busca aberta mesmo sem sessão; preços inteiros em centavos, limites inclusivos; sem preço não satisfaz filtro de preço; disponibilidade disponível, esgotado, desconhecido nessa ordem; sugestão não corrige automaticamente; sem inferir equivalência ou dados ausentes; sem criar duas fontes principais. Cadastro empresarial, compras, alertas e implementação da 009 fora do recorte.

**Scale/Scope**: catálogo fictício de demonstração no shopping ativo, no mínimo uma variante ofertada em duas lojas e uma alternativa da mesma categoria. Preservar identificadores do catálogo e oferta para integração futura de desejos. Sem estimativa de usuários ou tamanho de produção.

## Constitution Check

| Princípio | Avaliação antes e depois do desenho |
| --- | --- |
| I — descoberta confiável | **Atendido no desenho**: mesma variante para comparação, preço e estoque nulos explícitos, dados fictícios identificados e distinção de falha/vazio. |
| II — decisões rastreáveis | **Atendido**: [research](research.md), [modelo](data-model.md) e [contratos](contracts/) ligam regras aos requisitos; a ordem de disponibilidade desconhecida registra a decisão posterior da 010. |
| III — identidade e isolamento | **Atendido**: leitura pública apenas de catálogo publicado; dados privados da 009 seguem autenticados, nenhuma credencial privilegiada no cliente. Sem administração empresarial neste recorte. |
| IV — experiência acessível | **Atendido no desenho**: busca pública independente de sessão; estados, rótulos, teclado e alternativa de mapa; rota inicia somente pelo fluxo existente com ponto escolhido. |
| V — simplicidade e transparência | **Atendido**: stack existente, um catálogo canônico, migração explícita da 008; sem afirmar testes, dados remotos ou execução. |

**Gate inicial e pós-design**: aprovado para planejamento; implantação depende de migrações, dados de demonstração e configuração reais. Não há exceção à constituição. Não alterar a política sem testes.

## Project Structure

### Documentation

```text
specs/010-busca-comparacao-produtos/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/api.md
├── contracts/ui.md
└── quickstart.md
```

`tasks.md` é gerado posteriormente por `$speckit-tasks`, não por este plano.

### Source Code

```text
backend/
  src/domain/                         # regras de catálogo e busca
  src/application/ports/              # catalog-reader existente e porta de consulta
  src/application/services/           # busca, comparação e projeção de promoções
  src/infrastructure/supabase/        # persistência e transição do promotion.repository
  src/presentation/http/              # controllers e rotas públicas
  src/app.ts                          # composição existente
  supabase/migrations/                # nova migração após verificar numeração livre
frontend/src/
  app/App.jsx, app/navigation.js      # navegação pública antes da guarda de sessão
  features/catalog-integration/       # adaptador existente para feature 009
  features/catalog/                   # modelos, repositório, viewmodels e telas a criar
  features/home/views/ProjectHomeView.jsx
  features/mall-map/                  # destino /mapa?loja= já existente
  features/nearby-promotions/         # contrato e supressão de rota preservados
```

**Structure Decision**: estender MVVM e as camadas já existentes; o cliente nunca acessa Supabase diretamente. Os nomes novos de arquivos são detalhados nas futuras tarefas, sem gerar camada ou serviço externo adicional.

## Sequência de implementação proposta

1. Confirmar estado das migrações e a aplicação da 008 no ambiente; projetar catálogo, vínculos explícitos e migração transacional, bloqueando correspondências não mapeadas. Preservar ID e revisão promocional; repositório de promoções passa a ler a fonte canônica no mesmo corte.
2. Criar leitura de categorias/tipos, busca, detalhe por variante, ofertas e semelhantes, com regras, erros e identidades de [contracts/api.md](contracts/api.md); adaptar `catalog-reader.ts` sem confundir ausência de referência com indisponibilidade.
3. Criar entrada pública, busca, filtros, cards, detalhe e comparação segundo [contracts/ui.md](contracts/ui.md); integrar rota da loja existente e preservar a navegação sem autenticação.
4. Conectar a projeção da 008 ao catálogo sem alterar supressão da rota, elegibilidade, confirmação ou isolamento; preparar contratos para 009 sem afirmar que suas telas/rotas privadas estão operacionais.
5. Documentar configuração, transição, limitações e divergências de interface. A compilação aplicável não prova que migração ou serviço remoto funcionam.

## Complexity Tracking

Nenhuma violação constitucional ou serviço novo proposto.
