# QUICK BACKUP - Run this immediately to protect your files
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$quickBackup = "QUICK_BACKUP_$timestamp"

Write-Host "⚡ QUICK BACKUP STARTING..." -ForegroundColor Red
New-Item -ItemType Directory -Path $quickBackup -Force | Out-Null

# Copy most critical files immediately
Copy-Item -Path "app" -Destination "$quickBackup\app" -Recurse -Force
Copy-Item -Path "components" -Destination "$quickBackup\components" -Recurse -Force  
Copy-Item -Path "lib" -Destination "$quickBackup\lib" -Recurse -Force

Write-Host "✅ QUICK BACKUP COMPLETE: $quickBackup" -ForegroundColor Green
