param(
    [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
$demoRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $listener) {
    Write-Host "No demo server is listening on port $Port." -ForegroundColor Yellow
    return
}

$processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
$commandLine = [string]$processInfo.CommandLine

if ($processInfo.Name -notmatch '^python(?:\.exe)?$|^py(?:\.exe)?$' -or
    $commandLine -notmatch 'http\.server' -or
    $commandLine -notlike "*$demoRoot*") {
    throw "The process on port $Port is not this demo server. Refusing to stop process $($processInfo.Name), PID $($listener.OwningProcess)."
}

Stop-Process -Id $listener.OwningProcess -Force
Write-Host "Demo server stopped. PID: $($listener.OwningProcess)" -ForegroundColor Green
