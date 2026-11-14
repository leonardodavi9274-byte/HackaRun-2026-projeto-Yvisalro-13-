# Modelo de dados e estados — 007

Modelo proposto; nomes físicos e migrações serão definidos após resolução dos bloqueios em [plan.md](plan.md). Dados sensíveis não constam em logs.

| Entidade | Campos e invariantes | Ciclo |
| --- | --- | --- |
| Identidade Supabase | `user_id`, confirmação e identidades de provedor; e-mail pode ser privado Apple. Associação depende de B3. | Existente ou criada após autorização social. |
| Perfil e preferências | `user_id` único; nome obrigatório, foto opcional, interesses e publicidade; reaproveitam feature 004. Inicialização social idempotente não sobrescreve dados nem cria consentimento positivo. | Incompleto → completo após dados e preferências confirmados. |
| Sessão web | Hash de cookie opaco, `user_id`, tokens cifrados, vencimento, revisão e revogação. Distinta da recuperação. | Criada → ativa/renovada → revogada ou expirada; revogação por usuário concorre com refresh. |
| Solicitação de recuperação | ID opaco, hash com chave do e-mail normalizado, geração, validade e estado; sem senha ou código em claro. Resposta pública uniforme; tentativas seguem limites do Supabase. | Solicitada → confirmada, expirada ou invalidada por reenvio; depende de B1. |
| Autorização de redefinição | Hash de handle aleatório, `user_id` confiável e sessão de recuperação cifrada no servidor; finalidade exclusiva e expiração curta. | Emitida após prova → consumida após alteração/revogação ou expirada; não concede leitura de perfil. |
| Transação social | ID opaco, provedor, correlator/verificador PKCE protegidos, expiração e estado; destino interno fixo. | Iniciada → retorno validado e consumido, cancelada ou expirada. Fluxos concorrentes não compartilham verificador. |

Transições concorrentes devem ser atômicas no armazenamento compartilhado. Ao mudar senha, barreira por usuário impede acesso e criação/renovação de sessão anterior até revogar local e remotamente; falhas parciais não são reportadas como sucesso. Aplicação da barreira ao acesso direto depende de B2. Limpeza de registros expirados preserva evidência necessária a operações incompletas.
