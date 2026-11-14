# Execução futura: cadastro e preferências

**Estado:** guia para depois da implementação. Esta entrega contém somente design; executar agora os endpoints novos resulta em recurso ausente. Nenhum serviço, tabela, bucket ou SMTP foi configurado por este planejamento.

Referências: [API](contracts/api.md), [telas](contracts/ui.md), [modelo](data-model.md), [desenvolvimento da base](../../docs/desenvolvimento.md).

## Pré-requisitos

- Node.js 24.22.3 conforme .node-version, npm e dependências do lockfile.
- Projeto Supabase de desenvolvimento controlado pela equipe, com PostgreSQL, Auth por e-mail/senha e Storage.
- Acesso administrativo para aplicar as migrações planejadas, criar bucket privado e ajustar Auth/SMTP. Credenciais ficam fora do Git.
- Textos e URLs reais dos Termos e Política de Privacidade disponíveis. Seu conteúdo não é produzido nem aprovado por este plano.

O fluxo da equipe permanece sem testes: não haverá scripts/suítes de teste nem obrigação de executar testes manuais. Build é compilação. Os roteiros de uso abaixo documentam comportamento esperado para eventual demonstração; não são evidência de execução.

## Preparar banco, identidade e imagens

Após os arquivos serem produzidos na implementação:

1. Aplicar no projeto de desenvolvimento as migrações em backend/supabase/migrations, na ordem numérica: tabelas/categorias; RPCs e privilégios; trigger mínimo de vínculo. Usar o SQL Editor do Supabase com acesso administrativo; não aplicar em banco de terceiros ou produção inadvertidamente.
2. Confirmar que o esquema app_private não está exposto pela Data API e que EXECUTE/DML privados não são concedidos a anon/authenticated. A lista de regras está no modelo, sem duplicação de SQL neste guia.
3. Criar bucket **consumer-avatars**, privado, permitindo saída image/webp até 5 MiB. Sem listagem pública ou upload direto de cliente.
4. Em Auth, habilitar e-mail/senha, confirmação de e-mail e mínimo 8 caracteres, sem requisito adicional de classes que contradiga FR-003. Expiração planejada da confirmação: 3600 segundos; reenvio com piso de 60 segundos e limites do provedor.
5. Fixar Site URL em **http://127.0.0.1:5173** no desenvolvimento; cadastrar esse destino explicitamente, sem curinga amplo.
6. No template de confirmação, apontar para:
   ~~~text
   {{ .SiteURL }}/cadastro/confirmar#token_hash={{ .TokenHash }}&type=email
   ~~~
   A aplicação lê o fragmento, remove-o da URL e só verifica após ação explícita. Não usar link que consome o token por GET.
7. Configurar SMTP no painel do Supabase para receber consumidores externos. O serviço embutido restringe destinatários à equipe e tem limite baixo; veja [documentação oficial de SMTP](https://supabase.com/docs/guides/auth/auth-smtp). Não desativar confirmação para esconder falta de SMTP.

Nesta fase não se envia campanha nem se configura serviço promocional.

## Ambiente

Copiar os exemplos somente se os arquivos locais ainda não existirem:

~~~powershell
if (-not (Test-Path -LiteralPath backend/.env)) {
    Copy-Item -LiteralPath backend/.env.example -Destination backend/.env
}
if (-not (Test-Path -LiteralPath frontend/.env)) {
    Copy-Item -LiteralPath frontend/.env.example -Destination frontend/.env
}
~~~

A implementação deverá acrescentar estas entradas ao exemplo do backend, sem valores reais:

| Variável | Uso |
| --- | --- |
| SUPABASE_URL | URL do projeto de desenvolvimento |
| SUPABASE_SECRET_KEY | Operações privilegiadas do servidor; nunca VITE_* |
| SUPABASE_PUBLISHABLE_KEY | Cliente Auth isolado do backend, separado do cliente privilegiado |
| APP_SECURITY_KEY | 32 bytes aleatórios codificados em base64; derivação de criptografia e prova de vínculo |
| APP_ORIGIN | http://127.0.0.1:5173 no desenvolvimento; origem HTTPS única em produção |
| FRONTEND_ORIGIN | A mesma origem permitida, sem curinga |
| TERMS_URL / PRIVACY_URL | Destinos reais dos documentos, HTTPS fora do desenvolvimento local |
| AUTH_CONFIRMATION_TTL_SECONDS | 3600, alinhado ao painel Auth |
| AUTH_RESEND_MIN_INTERVAL_SECONDS | 60, sem contornar um prazo maior do fornecedor |

Manter HOST=127.0.0.1 e PORT=3000. Bucket, noticeVersion, limites de validação e cookie são constantes do recorte, não parâmetros arbitrários do cliente.

APP_SECURITY_KEY é gerada pelo operador e mantida somente no ambiente local/servidor. Não copiar chaves ou tokens para comandos de exemplo, logs, capturas ou documentação. Alterar a chave invalida sessões e provas pendentes: planejar rotação fora de uma execução de cadastro.

Frontend: VITE_API_BASE_URL=/api/v1 e API_PROXY_TARGET=http://127.0.0.1:3000. Nenhuma chave Supabase ou chave mestre é necessária no frontend.

Sem configuração completa, a base de saúde deve continuar iniciando, mas o cadastro retorna 503 com mensagem de configuração indisponível. Não usar dados simulados para representar identidade real.

## Instalar, compilar e iniciar

Na raiz do repositório:

~~~powershell
npm ci
npm run build
npm run dev
~~~

No Windows sem Node global, usar a cópia portátil descrita no guia da base:

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 ci
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run build
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 run dev
~~~

Escolher uma das alternativas, sem instalar duas vezes. Se a cópia portátil ainda não existir, seguir scripts/bootstrap.ps1 conforme o guia da base.

Abrir **http://127.0.0.1:5173/cadastro**, mantendo o mesmo hostname do link de e-mail/cookie. API escuta em 3000; navegador chama /api pelo proxy Vite em 5173. Ctrl+C encerra os processos.

O preview atual da base não fornece proxy /api. Para este fluxo com cookies, não trocar simplesmente a API por URL de outra origem; usar desenvolvimento com proxy ou configurar proxy HTTPS de mesma origem no ambiente que servirá o build. Hospedagem pública não é entregue por este plano.

Consultas locais opcionais de operação, após implementação:

~~~powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:5173/api/v1/registration-config'
Invoke-RestMethod -Uri 'http://127.0.0.1:5173/api/v1/interest-categories'
~~~

Retornos esperados: configuração com publicidade desligada e limites da spec; nove categorias em ordem, sem credenciais. Saúde configurada não comprova conexão funcional, recebimento de e-mail ou cadastro.

## Roteiros de uso para eventual demonstração

| Fluxo | Ações na interface | Resultado esperado |
| --- | --- | --- |
| Conta mínima | Nome/e-mail/senha → Continuar → Pular → confirmar e-mail explicitamente → continuar | Uma conta, interesses vazios, publicidade false, Início somente após confirmação e sessão. |
| Interesses e foto | Selecionar arquivo válido → escolher categorias/termos → Concluir → confirmar → salvar foto autenticada | Interesses consultáveis na mesma conta e foto privada confirmada; não criar Desejos/alertas. |
| Retomada em outro dispositivo | Entrar com a mesma conta → consultar onboarding → concluir pendências | Dados confirmados preservados; solicitar arquivo novamente ou dispensa se foto local não está disponível. |
| Publicidade posterior | Perfil → Preferências → ativar/salvar → desativar/salvar | Última escolha confirmada aparece em outra sessão. Retry antigo não desfaz revogação. |
| Falha parcial | Retomar uma intenção cujo serviço informou incomplete/unknown/photo_pending | Orientação específica, nenhuma confirmação fictícia e nenhuma conta nova por repetição da mesma intenção. |

Estes são cenários executáveis pelo operador quando a feature existir, sem imposição de uma etapa de testes. Não criar falhas em serviço externo, disparar e-mails ou preencher dados de terceiros apenas para validar documentação.

## Limitações e diagnóstico

- Falha 503 de cadastro: verificar configuração/migrações/serviços no ambiente, sem imprimir segredos. requestId e código de etapa bastam para diagnóstico.
- Confirmação inválida/usada: entrar com e-mail/senha ou solicitar reenvio, respeitando a espera. Um link já consumido não pode ser reutilizado para simular nova sessão.
- Foto pendente: manter o cadastro da mesma conta; tentar a foto ou escolher continuar sem ela. Não refazer signUp.
- Renovação de sessão perdida pode exigir nova autenticação; escolhas já confirmadas continuam no banco.
- As metas SC-001–SC-006 continuam sendo critérios de produto. Não afirmar que foram atingidas pela leitura deste guia, por compilação ou pela geração do plano.
