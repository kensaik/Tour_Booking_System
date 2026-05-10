# Boot the perf rig: waitress (8 threads) + PERF_PROFILING timing middleware.
# Usage:  .\perf\run-server.ps1
# Stop:   Ctrl+C in this window, or Stop-Process -Id <pid>

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RepoRoot "backend"
$LogDir = Join-Path $PSScriptRoot "logs"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$env:PERF_PROFILING = "1"
$env:PERF_LOG_DIR = $LogDir
$env:FLASK_APP = "src:create_app"

Push-Location $BackendDir
try {
    Write-Host "Starting waitress on http://127.0.0.1:8000 (threads=8, PERF_PROFILING=1)" -ForegroundColor Cyan
    Write-Host "Request log: $LogDir\requests.jsonl" -ForegroundColor DarkGray
    # python -m waitress avoids needing waitress-serve on PATH (Windows Store Python quirk)
    python -m waitress --listen=127.0.0.1:8000 --threads=8 --call src:create_app
} finally {
    Pop-Location
}
