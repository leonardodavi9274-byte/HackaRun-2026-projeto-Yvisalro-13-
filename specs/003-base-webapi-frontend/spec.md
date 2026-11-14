# Especificação: base do frontend e da WebAPI

**Branch:** `003-base-webapi-frontend`  
**Data:** 2026-11-13  
**Escopo:** inicialização técnica autorizada pelo usuário, conforme a constituição 1.0.0.

## Objetivo

Criar projetos executáveis de frontend e backend em pastas separadas, com estrutura
arquitetural para evoluir o Hackarum-Yvisalro. Este recorte entrega a base técnica;
as funcionalidades de produto da feature 001 continuam pendentes.

## Histórias

### H1 — Executar os dois projetos

Como integrante da equipe, quero instalar as dependências e iniciar os dois serviços
na máquina local a partir de comandos documentados.

**Aceite:** frontend servido na porta 5173, WebAPI na porta 3000 e scripts de build
independentes. A instalação deve produzir um lockfile compartilhado.

### H2 — Evoluir com responsabilidades separadas

Como desenvolvedor, quero localizar apresentação, estado, serviços e infraestrutura
sem colocar regras de negócio nos componentes React ou nas rotas HTTP.

**Aceite:** a consulta de estado do serviço percorre View → ViewModel → Repository →
cliente HTTP no frontend e rota → controller → serviço no backend, com modelo próprio.

### H3 — Preparar a integração com dados

Como integrante da equipe, quero preparar a configuração do Supabase sem publicar
credenciais e sem depender de um banco configurado para iniciar a base.

**Aceite:** exemplos de ambiente sem segredos; ausência de configuração identificada;
estado da aplicação não afirma conexão com o banco. Nenhuma escrita é realizada.

## Requisitos

- **FR-001:** manter os projetos em `frontend/` e `backend/`, com manifests próprios.
- **FR-002:** usar React no frontend e TypeScript/Node.js na WebAPI.
- **FR-003:** fornecer endpoint público de saúde, rotas versionadas e erros JSON.
- **FR-004:** mostrar carregamento, sucesso ou falha da conexão na página inicial,
  com opção de nova tentativa. Identificar as funções de produto como planejadas.
- **FR-005:** preparar o cliente Supabase exclusivamente no backend e middleware de
  autenticação para futuras rotas restritas, sem expor credenciais no frontend.
- **FR-006:** documentar arquitetura, instalação, configuração, build e execução.
- **FR-007:** seguir a política sem testes da constituição; não criar suítes ou scripts
  de testes neste recorte. Conferir compilação e inicialização dos processos.

## Limites

Não inclui catálogo, cadastro/login de usuários, autorização por empresa, CRUD,
migrações, desejos, notificações, mapa, reservas, app Flutter ou publicação externa.
As 11 telas permanecem no canvas de design atual como referência para etapas futuras.
A página inicial da base não decide nem entrega as landing pages da prática sorteada.
