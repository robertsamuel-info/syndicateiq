# Start development server
Set-Location $PSScriptRoot
Write-Host "Starting Vite dev server..." -ForegroundColor Green
Write-Host "Project directory: $(Get-Location)" -ForegroundColor Yellow
npm run dev
