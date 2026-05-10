# Run all k6 scenarios sequentially under the chosen profile.
# Usage:
#   .\perf\scripts\run-all.ps1                            # smoke profile, default base URL
#   .\perf\scripts\run-all.ps1 -Profile load
#   .\perf\scripts\run-all.ps1 -Profile stress -BaseUrl http://127.0.0.1:8000
#
# Outputs JSON summary per scenario to perf/results/<scenario>-<profile>-<timestamp>.json

param(
  [ValidateSet('smoke', 'load', 'stress')]
  [string]$Profile = 'smoke',
  [string]$BaseUrl = 'http://127.0.0.1:8000',
  [switch]$IncludeAdmin
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$perfRoot   = Join-Path $repoRoot 'perf'
$resultsDir = Join-Path $perfRoot 'results'
if (-not (Test-Path $resultsDir)) { New-Item -ItemType Directory -Path $resultsDir | Out-Null }

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$scenarios = @(
  '01-browse-search.js',
  '02-tour-detail.js',
  '03-guest-booking.js',
  '04-company-dashboard.js'
)
if ($IncludeAdmin) { $scenarios += '05-admin-oversight.js' }

Write-Host "Profile=$Profile  BaseUrl=$BaseUrl  Scenarios=$($scenarios.Count)" -ForegroundColor Cyan

foreach ($s in $scenarios) {
  $scriptPath = Join-Path $perfRoot ('scripts/' + $s)
  $base       = [System.IO.Path]::GetFileNameWithoutExtension($s)
  $summary    = Join-Path $resultsDir ("$base-$Profile-$timestamp-summary.json")

  Write-Host "`n=== $s ===" -ForegroundColor Yellow
  & k6 run `
    --env "BASE_URL=$BaseUrl" `
    --env "PROFILE=$Profile" `
    --summary-export $summary `
    $scriptPath

  if ($LASTEXITCODE -ne 0) {
    Write-Warning "$s exited with code $LASTEXITCODE (threshold violation or error). Continuing."
  }
}

Write-Host "`nResults written to $resultsDir" -ForegroundColor Green
