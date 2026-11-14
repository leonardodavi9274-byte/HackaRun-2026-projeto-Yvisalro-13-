# Sem binding de parâmetros: preserva argumentos npm como --workspace e --yes.
[string[]]$NpmArguments = $args

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodeExecutable = if ($nodeCommand) { $nodeCommand.Source } else {
    Get-ChildItem -Path (Join-Path $projectRoot '.tools/node-v24.*-win-*/node.exe') -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $nodeExecutable) {
    throw 'Node.js não encontrado. Execute scripts/bootstrap.ps1 ou instale Node.js 24 LTS.'
}
$nodeBin = Split-Path -Parent $nodeExecutable
$npmCli = Join-Path $nodeBin 'node_modules/npm/bin/npm-cli.js'
if (-not (Test-Path -LiteralPath $npmCli)) { throw 'npm não encontrado junto ao Node.js.' }
$env:Path = "$nodeBin;$env:Path"
Push-Location $projectRoot
try {
    & $nodeExecutable $npmCli @NpmArguments
    $npmExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $npmExitCode
