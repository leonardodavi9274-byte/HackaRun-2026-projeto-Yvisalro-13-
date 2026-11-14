# Proposta para os controles de identidade no Supabase hospedado

**Estado**: proposta de implementação, não aplicada nem validada em Supabase. A [spec](spec.md) mantém a exigência de confirmação adicional e de contas exclusivamente sociais sem senha. Esta proposta não autoriza implantar gatilhos no projeto remoto nem considera B1–B3 resolvidos.

## Evidência

O Supabase informa que é possível criar gatilhos em `auth.users`, `auth.identities` e `auth.sessions` mesmo no serviço hospedado ([comunicado oficial](https://supabase.com/changelog/34270-restricting-access-on-auth-storage-and-realtime-schemas-on-april-21-2025)). O [código do Auth](https://github.com/supabase/auth/blob/master/internal/api/external.go) consultado faz a inserção da identidade nova dentro da transação de OAuth; uma falha nessa inserção pode interromper aquela transação. Isso é um caminho concreto a investigar, mas a versão em produção, permissões, ordem das operações de todos os provedores e efeitos sobre contas existentes ainda precisam ser comprovados.

## B3 — Impedir vínculo social antes da confirmação

Proposta: um gatilho `BEFORE INSERT` em `auth.identities` consulta uma autorização protegida da aplicação antes de permitir adicionar um método a uma conta existente. A autorização deve ser criada somente após a pessoa autenticar a conta original **e** comprovar o identificador estável da identidade Google ou Apple a vincular. Ela deve estar vinculada a `user_id`, provedor e identificador do provedor, expirar rapidamente e ser consumida atomicamente na mesma transação; endereço de e-mail ou informação de perfil editável não é prova. A interface precisa explicar como voltar ao método original e confirmar o vínculo sem revelar detalhes de contas a terceiros.

O primeiro método de uma conta nova deve continuar permitido. Apenas verificar que uma conta ainda não possui linhas em `auth.identities` não é suficiente: uma conta antiga ou parcialmente criada também pode estar nesse estado. Uma possibilidade é registrar, por gatilho em `auth.users`, um marcador de criação limitado à própria transação e consumi-lo na primeira identidade; demais situações falham de forma fechada. O suporte a essa ordem transacional em cadastro por senha, OAuth, criação administrativa e confirmação ainda precisa ser confirmado. Dados antigos, contas sem identidade, transações concorrentes, provedores já vinculados, Apple com e-mail privado e exclusão de identidades não confirmadas exigem tratamento explícito.

O aplicativo precisa obter a identidade estável do provedor antes de emitir a autorização, validar emissor, assinatura, público, nonce, estado e prazo, e vincular o retorno ao navegador que iniciou a operação. Um simples sinalizador por usuário e provedor permitiria que uma identidade diferente consumisse a autorização; autenticação anterior sem comprovação da identidade a vincular também não atende ao requisito. Não criar o sinalizador a partir de `user_metadata` nem permitir que clientes escrevam nele. Até concluir esse fluxo, não habilitar os provedores.

## B1 — Impedir senha em conta exclusivamente social

Proposta: restringir no banco a transição de uma conta sem senha para uma conta com senha por meio de gatilho em `auth.users`, conservando a criação inicial de contas por senha e a troca de senha de contas já elegíveis. A verificação precisa distinguir credenciais existentes de valores vazios, transações de criação e migração de contas; a política deve impedir também chamadas diretas ao Auth. O [guia do Supabase](https://supabase.com/docs/guides/auth/managing-user-data) adverte que objetos do esquema Auth são gerenciados pelo serviço e podem mudar; não é seguro aplicar um gatilho que dependa de campos internos sem validar a versão e a compatibilidade com cada operação usada.

O reenvio e a invalidação de códigos devem continuar sob controle do Auth, com a resposta pública genérica e os limites escolhidos na spec. O controle de senha não deve anunciar envio nem impedir a recuperação legítima de uma conta que já tem senha. O comportamento de novos usuários, contas históricas, administradores e recuperação precisa ser resolvido antes de escrever uma migração executável.

## B2 — Recusar sessão revogada

Proposta: após validação do token pelo Auth, comparar o `session_id` com a sessão pertencente ao mesmo usuário em `auth.sessions`, conforme a [documentação de sessões](https://supabase.com/docs/guides/auth/sessions). A operação deve usar função com privilégios mínimos e falhar de forma fechada quando não puder confirmar a sessão; a API não deve confiar em conteúdo JWT apenas decodificado. O acesso direto a dados privados precisa continuar bloqueado por permissões e políticas, e qualquer futura rota direta precisa aplicar a mesma regra.

Ao trocar senha, coordenar revogação remota, revogação de todas as sessões web e concorrência com renovação e novas sessões por uma barreira por usuário. Não confirmar sucesso enquanto a barreira não estiver estabelecida. Uma simples consulta no começo da requisição deixa uma janela para revogação durante uma operação em andamento; o desenho definitivo deve definir como essas operações se comportam, sem afirmar atomicidade entre HTTP e banco.

## Próximas dependências

- Substituir e desativar a chave administrativa legada exposta anteriormente, seguindo a [orientação oficial](https://supabase.com/docs/guides/security/rotate-leaked-api-keys); nunca usar essa chave para conectar o projeto.
- Preparar ambiente isolado com a versão de Auth do projeto e um banco sem dados reais; o Docker desta máquina foi consultado, mas o serviço não estava acessível. Nenhuma alteração foi aplicada no Supabase hospedado.
- Concluir o protocolo de confirmação e as barreiras para criação, vinculação e redefinição concorrentes; registrar no plano e nas tarefas somente garantias efetivamente estabelecidas. As migrações só devem ser adicionadas quando o comportamento estiver definido para os fluxos existentes da feature 004.
