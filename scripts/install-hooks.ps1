# install-hooks.ps1
# Run this once after cloning the repo to install the Git hooks.
# Usage: .\scripts\install-hooks.ps1

$hooksDir = ".git\hooks"
$sourceDir = "scripts\hooks"

if (-not (Test-Path $hooksDir)) {
    Write-Error "Not in the repo root or .git folder not found."
    exit 1
}

$hooks = Get-ChildItem -Path $sourceDir -File

foreach ($hook in $hooks) {
    $dest = Join-Path $hooksDir $hook.Name
    Copy-Item -Path $hook.FullName -Destination $dest -Force
    Write-Host "Installed: $($hook.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Git hooks installed successfully." -ForegroundColor Cyan
Write-Host "Every push will now pull from master and run a build first." -ForegroundColor Cyan
