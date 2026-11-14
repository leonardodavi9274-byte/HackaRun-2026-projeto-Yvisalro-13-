# Quickstart: Promoções próximas

Guia para uso **após a implementação**; resultados abaixo são esperados, não foram executados neste planejamento. A constituição mantém fluxo sem testes: este roteiro é opcional, não etapa de testes obrigatória.

## Pré-requisitos

- Node `>=24.22.3 <25`, dependências do workspace instaladas e Supabase configurado para backend, conforme [quickstart da feature 004](../004-cadastro-preferencias/quickstart.md).
- Migrações de base e mapa 0001–0016 aplicadas; depois aplicar `0017_published_promotional_offers.sql` e, opcionalmente, `0018_demo_promotional_offers.sql` no projeto de desenvolvimento, conforme `backend/supabase/README.md`. Confirmar que não há conflito de numeração antes de integrar com outras branches.
- Conta com cadastro concluído, shopping/mapa ativos e ponto manual válido. A migração opcional 0018 registra uma oferta explicitamente fictícia na loja Grão Fino; a Praça central do Piso 1 é um ponto dentro do limite simulado. Sem dados de demonstração, lista vazia é esperada; não cadastrar valores reais fictícios.

## Executar depois da implementação

Na raiz do repositório:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run build
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run dev
```

Com Node compatível no PATH, podem ser usados `npm run build` e `npm run dev`. A compilação não confirma os cenários funcionais. Nenhuma migração foi aplicada a Supabase durante a implementação.

## Roteiro opcional de conferência

| Ação | Resultado esperado | Referência |
| --- | --- | --- |
| Abrir Início sem ponto selecionado. | Nenhum pop-up; mapa continua acessível. | FR-001–002 |
| Escolher ponto no mapa; voltar ao Início com oferta demo elegível no mesmo piso e até 100 m. | Um diálogo com produto, loja, piso, preço, disponibilidade e distância simulada; demo identificada. | US1, FR-003–004 |
| Comparar oferta de interesse com outra mais próxima sem interesse. | Categoria confirmada tem prioridade; sem perfil utilizável, ordenar por distância sem justificativa de interesse. | FR-005 |
| Fechar com **Agora não**, voltar ao mapa e retornar ao Início. | A mesma oferta não reaparece na sessão; outra só pode abrir na nova visita. | FR-008 |
| Iniciar rota e voltar ao Início; avançar até chegada antes de encerrar. | Nenhum pop-up enquanto rota estiver ativa, inclusive na chegada. | FR-006 |
| Iniciar rota enquanto confirmação de oferta está pendente ou diálogo está aberto. | Resposta antiga não abre o diálogo e o diálogo aberto desaparece; rota permanece intacta. | US2.1–3 |
| Encerrar rota e voltar ao Início. | Nova avaliação respeita visita, dispensa e vigência, sem despejar ofertas suprimidas. | FR-007–008 |
| Escolher **Me leve lá** numa oferta posicionada. | Mapa abre com loja selecionada e pede ponto, sem ativar automaticamente o trajeto. | FR-009 |
| Deixar oferta expirar, alterar disponibilidade ou interromper fonte antes da confirmação. | Oferta não é aberta como válida; Início continua acessível. | FR-003, FR-012 |
| Usar teclado e leitor de tela; reduzir a janela a 360 px. | Controles nomeados, foco controlado/restaurado, conteúdo legível e sem rolagem horizontal. | FR-011 |
| Recarregar a página ou trocar de conta. | Sessão promocional é reiniciada; ponto e interesses antigos não são reaproveitados indevidamente. | FR-010, D3 e D6 |

Ver detalhes do formato em [contracts/api.md](contracts/api.md), regras de interface em [contracts/ui.md](contracts/ui.md) e estados em [data-model.md](data-model.md).
