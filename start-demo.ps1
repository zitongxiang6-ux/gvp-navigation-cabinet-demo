param(
    [int]$Port = 4173,
    [switch]$OpenBrowser
)

$ErrorActionPreference = 'Stop'
$demoRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$demoBuild = '20260831-remove-device-functions'
$demoUrl = "http://127.0.0.1:$Port/?v=$demoBuild#cabinet-functions"

function Test-DemoAvailable {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content -like '*REQ-2026-001-004-navigation-cabinet*'
    }
    catch {
        return $false
    }
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    if (-not (Test-DemoAvailable -Url $demoUrl)) {
        throw "Port $Port is occupied by process $($listener.OwningProcess), but it is not serving this demo. Use another port: .\start-demo.ps1 -Port 4174"
    }

    Write-Host "Demo is already running: $demoUrl" -ForegroundColor Green
    if ($OpenBrowser) {
        Start-Process $demoUrl
    }
    return
}

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
    $pythonCommand = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $pythonCommand) {
    throw 'Python was not found. The local demo server cannot start.'
}

$arguments = @(
    '-m',
    'http.server',
    "$Port",
    '--bind',
    '127.0.0.1',
    '--directory',
    ('"{0}"' -f $demoRoot)
)

$serverProcess = Start-Process `
    -FilePath $pythonCommand.Source `
    -ArgumentList $arguments `
    -WorkingDirectory $demoRoot `
    -WindowStyle Hidden `
    -PassThru

$started = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 200
    if ($serverProcess.HasExited) {
        break
    }
    if (Test-DemoAvailable -Url $demoUrl) {
        $started = $true
        break
    }
}

if (-not $started) {
    if (-not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force
    }
    throw 'The demo server failed to start. Check Python and local port usage.'
}

Write-Host "Demo started: $demoUrl" -ForegroundColor Green
Write-Host "Background process PID: $($serverProcess.Id)" -ForegroundColor DarkGray

if ($OpenBrowser) {
    Start-Process $demoUrl
}
