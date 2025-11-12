# A2Z PLATFORM RESTORE SYSTEM
# Use this script to restore files from backups

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFolder
)

Write-Host "🔄 A2Z RESTORE SYSTEM" -ForegroundColor Red
Write-Host "📁 Restoring from: $BackupFolder" -ForegroundColor Yellow

if (-not (Test-Path $BackupFolder)) {
    Write-Host "❌ Backup folder not found: $BackupFolder" -ForegroundColor Red
    Write-Host "Available backups:" -ForegroundColor Yellow
    Get-ChildItem -Directory | Where-Object { $_.Name -match "BACKUP|QUICK_BACKUP" } | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Cyan }
    exit 1
}

# Confirm restore
$confirm = Read-Host "⚠️  This will overwrite current files. Continue? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ Restore cancelled" -ForegroundColor Red
    exit 0
}

# Restore function
function Restore-Directory {
    param($Source, $Destination, $Description)
    
    if (Test-Path "$BackupFolder\$Source") {
        Write-Host "📂 Restoring $Description..." -ForegroundColor Cyan
        if (Test-Path $Destination) {
            Remove-Item -Path $Destination -Recurse -Force
        }
        Copy-Item -Path "$BackupFolder\$Source" -Destination $Destination -Recurse -Force
        Write-Host "✅ $Description restored" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $Description not found in backup" -ForegroundColor Yellow
    }
}

# Restore critical directories
Restore-Directory "app" "app" "App Directory"
Restore-Directory "components" "components" "Components Directory"  
Restore-Directory "lib" "lib" "Lib Directory"
Restore-Directory "styles" "styles" "Styles Directory"
Restore-Directory "public" "public" "Public Directory"

# Restore config files
$configFiles = @("package.json", "next.config.js", "tailwind.config.js", "tsconfig.json")
foreach ($file in $configFiles) {
    if (Test-Path "$BackupFolder\$file") {
        Copy-Item -Path "$BackupFolder\$file" -Destination $file -Force
        Write-Host "✅ $file restored" -ForegroundColor Green
    }
}

Write-Host "`n🎉 RESTORE COMPLETED!" -ForegroundColor Green
Write-Host "💡 Run 'npm install' to restore dependencies" -ForegroundColor Yellow
Write-Host "💡 Run 'npm run dev' to test the restoration" -ForegroundColor Yellow
