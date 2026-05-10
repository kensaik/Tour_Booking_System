# Phase 3 orchestrator: smoke -> load -> stress per scenario, archived per run-id.
#
# Assumes:
#   - MySQL is running and seeded (see perf/README.md prereqs).
#   - Waitress is already booted via .\perf\run-server.ps1 in another window.
#   - k6 on PATH.
#
# Usage:
#   .\perf\run-all-profiles.ps1                              # full pass
#   .\perf\run-all-profiles.ps1 -RunId 20260510-1305         # custom run-id
#   .\perf\run-all-profiles.ps1 -Profiles smoke              # subset
#   .\perf\run-all-profiles.ps1 -SkipReseed                  # don't reseed before stress
#
# Output: perf/results/<run-id>/<scenario>-<profile>.json
#         perf/results/<run-id>/requests-<scenario>-<profile>.jsonl  (rotated)
#         perf/results/<run-id>/environment.md  (manual fill / autogen header)

param(
  [string]$RunId,
  [string]$BaseUrl = 'http://127.0.0.1:8000',
  [ValidateSet('smoke','load','stress')]
  [string[]]$Profiles = @('smoke','load','stress'),
  [switch]$SkipReseed,
  [switch]$IncludeAdmin
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Resolve-Path (Join-Path $PSScriptRoot '..')
$perfRoot   = Join-Path $repoRoot 'perf'
$logDir     = Join-Path $perfRoot 'logs'
$resultsRoot= Join-Path $perfRoot 'results'

if (-not $RunId) { $RunId = Get-Date -Format 'yyyyMMdd-HHmmss' }
$runDir = Join-Path $resultsRoot $RunId
if (-not (Test-Path $runDir)) { New-Item -ItemType Directory -Path $runDir | Out-Null }

Write-Host "RunId=$RunId  BaseUrl=$BaseUrl  Profiles=$($Profiles -join ',')" -ForegroundColor Cyan
Write-Host "Output dir: $runDir" -ForegroundColor DarkGray

# Sanity: server reachable?
try {
  $ping = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/api/public/tours" -TimeoutSec 5
  Write-Host "Server OK ($($ping.StatusCode))" -ForegroundColor Green
} catch {
  Write-Error "Server not reachable at $BaseUrl. Start it with .\perf\run-server.ps1 first."
}

# Scenario list per profile.
$readScenarios = @(
  '01-browse-search.js',
  '02-tour-detail.js',
  '03-guest-booking.js',
  '04-company-dashboard.js'
)
if ($IncludeAdmin) { $readScenarios += '05-admin-oversight.js' }

# Stress only on the two representative ones (per phase plan).
$stressScenarios = @('01-browse-search.js', '03-guest-booking.js')

function Reseed {
  if ($SkipReseed) { Write-Host "Skipping reseed." -ForegroundColor Yellow; return }
  Write-Host "Reseeding DB..." -ForegroundColor Yellow
  Push-Location (Join-Path $repoRoot 'backend')
  try {
    $env:PYTHONPATH = '.'
    python -c "from src import create_app; from src.extensions import db; app=create_app(); ctx=app.app_context(); ctx.push(); db.drop_all(); db.create_all(); print('schema rebuilt')"
    python database\seed.py
  } finally {
    Pop-Location
  }
}

function Rotate-RequestsLog {
  param([string]$Tag)
  $src = Join-Path $logDir 'requests.jsonl'
  if (Test-Path $src) {
    $dst = Join-Path $runDir ("requests-$Tag.jsonl")
    Move-Item -Force $src $dst
    Write-Host "  rotated requests.jsonl -> $dst" -ForegroundColor DarkGray
  }
}

function Run-Scenario {
  param([string]$Script, [string]$Profile)
  $base    = [System.IO.Path]::GetFileNameWithoutExtension($Script)
  $tag     = "$base-$Profile"
  $summary = Join-Path $runDir "$tag.json"
  $script  = Join-Path $perfRoot ('scripts/' + $Script)

  Write-Host "`n--- $tag ---" -ForegroundColor Yellow
  & k6 run `
    --env "BASE_URL=$BaseUrl" `
    --env "PROFILE=$Profile" `
    --summary-export $summary `
    $script

  if ($LASTEXITCODE -ne 0) {
    Write-Warning "$tag exited with $LASTEXITCODE (threshold violation or error). Continuing."
  }
  Rotate-RequestsLog -Tag $tag
}

foreach ($profile in $Profiles) {
  Write-Host "`n========== PROFILE: $profile ==========" -ForegroundColor Cyan
  $scenarios = if ($profile -eq 'stress') { $stressScenarios } else { $readScenarios }

  foreach ($s in $scenarios) {
    if ($profile -eq 'stress') { Reseed }
    Run-Scenario -Script $s -Profile $profile
  }
}

# Autogen environment.md header (user fills in manual bits).
$envFile = Join-Path $runDir 'environment.md'
if (-not (Test-Path $envFile)) {
  $os = (Get-CimInstance Win32_OperatingSystem)
  $cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1)
  $ram = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
  $py  = (& python --version 2>&1) -join ''
  $k6v = (& k6 version 2>&1 | Select-Object -First 1)
  $portRange = (& netsh int ipv4 show dynamicport tcp 2>&1) -join "`n"

  $body = @"
# Run environment — $RunId

## Hardware
- CPU: $($cpu.Name) ($($cpu.NumberOfCores) cores / $($cpu.NumberOfLogicalProcessors) threads)
- RAM: $ram GB
- OS: $($os.Caption) $($os.Version)

## Stack
- Python: $py
- k6: $k6v
- App server: waitress, threads=8 (see perf/run-server.ps1)
- DB: MySQL 8.0.44 @ 127.0.0.1:3306 (local)
- Profiling middleware: PERF_PROFILING=1 (backend/src/__init__.py)

## OS limits
``````
$portRange
``````

## Manual disclosures (fill in)
- Power profile: <Balanced / High performance / Battery>
- Ambient temp / thermal state: <e.g. cool, no throttling observed>
- Other load on machine: <e.g. browser closed, IDE running>
"@
  Set-Content -Path $envFile -Value $body -Encoding UTF8
  Write-Host "`nWrote $envFile" -ForegroundColor Green
}

Write-Host "`nDone. Results: $runDir" -ForegroundColor Green
