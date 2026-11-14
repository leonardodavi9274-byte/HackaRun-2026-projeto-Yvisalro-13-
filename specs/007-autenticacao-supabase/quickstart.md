# Guia operacional proposto — 007

Este guia descreve preparação e cenários após implementação. A constituição adota fluxo sem testes; executar cenários não é nova condição de conclusão. Nada aqui foi executado nesta etapa. Não usar dados de terceiros nem registrar códigos ou senhas.

## Pré-requisitos

- Resolver B1–B3 do [plano](plan.md) antes de habilitar os fluxos afetados; documentar controle dos endpoints públicos de Auth, associação automática e invalidação imediata em todas as vias.
- Node.js 24 e projeto Supabase separado para desenvolvimento, migrações aplicadas e segredos somente no ambiente do servidor; configurar URL e chaves conforme [guia de desenvolvimento](../../docs/desenvolvimento.md).
- SMTP transacional real e modelo de recuperação com código; OTP de 6 dígitos/600 s e reenvio mínimo 60 s, reconhecendo impacto em outros e-mails de Auth. Configurar URLs de retorno permitidas, Google e Apple, e rotação do segredo Apple.
- Contas próprias para e-mail/senha, Google e Apple, incluindo conta social nova e endereço privado Apple. Não habilitar publicidade para demonstrar recuperação.

## Execução local depois da implementação

Na raiz, com dependências e ambientes locais configurados:

```powershell
npm install
npm run dev
```

Frontend: `http://localhost:5173`; API: `http://127.0.0.1:3000/api/v1`. Para compilar: `npm run build`. Origens e cookies devem refletir a configuração real; OAuth Apple pode exigir domínio HTTPS próprio.

## Cenários de referência

1. Login válido e inválido, recarga, saída e entrada de outra conta. Esperado: dados isolados, mensagens genéricas e sessão encerrada sem acesso privado.
2. Solicitar recuperação de conta elegível e inexistente: mesma resposta pública; destinatário elegível recebe código real. Considerar código válido, vencido, usado, reenvio e limites aplicados pelo Supabase, inclusive nos caminhos diretos do provedor.
3. Redefinir com duas sessões abertas, inclusive bearer e acessos diretos: senha antiga e sessões anteriores não autorizam acesso; nova senha permite novo login. Tratar resultado não confirmado sem anunciar sucesso.
4. Para cada provedor, criar conta nova e retornar à existente, cancelar, repetir callback e considerar e-mail coincidente, nome ausente e Apple privado. Esperado: somente vínculo autorizado, perfil preservado, publicidade desligada por padrão.
5. Em Chrome com gerenciador Google e Safari com Senhas/iCloud, quando disponíveis, usar credenciais salvas e senha sugerida; também digitação e colagem. Considerar teclado e estados entre 360 e 1440 px.

Rotas e formatos são propostas em [contracts/auth.md](contracts/auth.md). Dependências de credenciais, domínio, SMTP e contas de desenvolvedor devem ser resolvidas fora do repositório; nenhum envio, configuração ou autenticação ocorreu nesta etapa.

## Andamento em 2026-11-14

Na branch `007-autenticacao-supabase`, os campos de login receberam nomes estáveis e indicações para gerenciadores de senha; o acesso ao reenvio de confirmação foi mantido visível para todos e o erro de login para e-mail não confirmado tornou-se genérico. O cadastro já utiliza `new-password`. `npm run build` compilou frontend e backend com Node 26.13.0; o projeto requer Node 24, portanto a compilação na versão exigida ainda não foi verificada. Não foram executados testes funcionais, nem configurados os serviços externos. As demais tarefas e bloqueios seguem em [tasks.md](tasks.md).

Na retomada da implementação, o cadastro passou a capturar valores presentes no formulário ao avançar, e respostas 401 de recursos privados ou restauração da página pelo histórico acionam nova consulta da sessão. A configuração proposta de SMTP e provedores foi documentada em [desenvolvimento.md](../../docs/desenvolvimento.md). Após essas alterações, `npm run build` voltou a compilar os dois projetos com Node 26.13.0; isso não valida os fluxos funcionais nem a revogação imediata no serviço. Os arquivos `backend/.env`, `frontend/.env` e `.env` não estavam presentes quando verificados, sem inspeção de segredos fora do repositório.
