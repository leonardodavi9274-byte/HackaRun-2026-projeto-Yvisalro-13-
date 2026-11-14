# Spec Kit com Codex no Windows

Abra a pasta raiz deste repositório no VS Code/Codex. A integração padrão é `codex`; as skills estão em `.agents/skills`.

## Terminal PowerShell

Na raiz do repositório:

```powershell
.\specify.cmd version
.\specify.cmd check
.\specify.cmd integration status
```

O atalho usa o ambiente Python isolado em `.tools/spec-kit`. Não exige ativar o ambiente ou alterar o PATH do Windows.

Para reinstalar em outra cópia do projeto, com Python 3.11 ou superior:

```powershell
python -m venv .tools\spec-kit
.\.tools\spec-kit\Scripts\python.exe -m pip install specify-cli==1.4.0
```

## Chat do Codex

Envie `$speckit-specify` seguido da descrição da funcionalidade. Depois use `$speckit-clarify`, `$speckit-plan`, `$speckit-tasks`, `$speckit-analyze` e `$speckit-implement`, conforme a etapa desejada.

Se as skills não aparecerem no seletor, abra uma nova sessão na pasta deste repositório. Também é possível pedir ao agente para ler a skill correspondente diretamente.

Na branch `main`, uma verificação de pré-requisitos pode informar que nenhuma funcionalidade está selecionada. Para trabalhar em uma especificação existente, selecione explicitamente o diretório apenas na sessão atual, por exemplo:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY = (Resolve-Path .\specs\004-cadastro-preferencias).Path
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .specify\scripts\powershell\check-prerequisites.ps1 -Json -RequireSpec -RequireTasks
Remove-Item Env:SPECIFY_FEATURE_DIRECTORY
```

Escolha a especificação que deseja trabalhar; o exemplo não define uma funcionalidade padrão.

Na instalação verificada neste computador, os avisos de arquivos gerenciados modificados resultam apenas das quebras de linha CRLF do checkout Windows. Não é necessário forçar uma atualização para corrigi-los.
