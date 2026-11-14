$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$portableNode = Get-ChildItem -Path (Join-Path $projectRoot '.tools/node-v24.*-win-*/node.exe') -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $nodeCommand -and -not $portableNode) {
    $nodeVersion = (Get-Content -LiteralPath (Join-Path $projectRoot '.node-version') -Raw).Trim()
    $nodeArchitecture = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
    $archiveName = "node-v$nodeVersion-win-$nodeArchitecture.zip"
    $toolsPath = Join-Path $projectRoot '.tools'
    $archivePath = Join-Path $toolsPath $archiveName
    New-Item -ItemType Directory -Path $toolsPath -Force | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v$nodeVersion/$archiveName" -OutFile $archivePath -UseBasicParsing
    $checksums = (Invoke-WebRequest -Uri "https://nodejs.org/dist/v$nodeVersion/SHASUMS256.txt" -UseBasicParsing).Content
    $checksumLine = ($checksums -split '\r?\n') | Where-Object { $_.EndsWith("  $archiveName") } | Select-Object -First 1
    if (-not $checksumLine) { throw 'Checksum oficial não encontrado.' }
    $expectedHash = ($checksumLine -split '\s+')[0]
    if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $expectedHash) {
        throw 'O SHA256 do Node.js não corresponde ao arquivo oficial.'
    }
    Expand-Archive -LiteralPath $archivePath -DestinationPath $toolsPath -Force
}

& (Join-Path $PSScriptRoot 'npm.ps1') install
exit $LASTEXITCODE
