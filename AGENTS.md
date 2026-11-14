# Instruções para o Codex

Este projeto usa GitHub Spec Kit com a integração `codex` e scripts PowerShell.

- Leia `.specify/memory/constitution.md` antes de planejar ou implementar mudanças.
- Para etapas do Spec Kit, leia e siga a skill correspondente em `.agents/skills/speckit-<etapa>/SKILL.md`.
- Preserve as especificações existentes em `specs/`. Confirme qual funcionalidade é o alvo antes de alterar seus artefatos; não presuma que a de maior número é a ativa.
- Execute o CLI local com `.\specify.cmd`. A instalação fica em `.tools/spec-kit`, ignorada pelo Git.
- Neste computador, use `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <script.ps1>` para os scripts PowerShell quando `pwsh` não estiver disponível. A política é aplicada apenas ao processo invocado.
- Os comandos `$speckit-specify`, `$speckit-plan`, `$speckit-tasks` e `$speckit-implement` são instruções no chat, não comandos do terminal.

Consulte `docs/spec-kit-windows.md` para execução local.
