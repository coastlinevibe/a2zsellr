# A2Z PLATFORM BACKUP SYSTEM
# This script creates timestamped backups of all critical files
# Run this regularly to protect against file corruption and deletion

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupRoot = "BACKUPS\$timestamp"

Write-Host "🚀 A2Z BACKUP SYSTEM STARTING..." -ForegroundColor Green
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Yellow

# Create timestamped backup directory
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

# Function to copy files with progress
function Copy-WithProgress {
    param($Source, $Destination, $Description)
    
    if (Test-Path $Source) {
        Write-Host "📂 Backing up $Description..." -ForegroundColor Cyan
        Copy-Item -Path $Source -Destination $Destination -Recurse -Force
        Write-Host "✅ $Description backed up successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $Description not found at $Source" -ForegroundColor Yellow
    }
}

# CRITICAL FILES TO BACKUP
Write-Host "`n🎯 BACKING UP CRITICAL FILES..." -ForegroundColor Magenta

# 1. APP DIRECTORY (All pages and layouts)
Copy-WithProgress "app" "$backupRoot\app" "App Directory (Pages & Layouts)"

# 2. COMPONENTS DIRECTORY
Copy-WithProgress "components" "$backupRoot\components" "Components Directory"

# 3. LIB DIRECTORY (Utilities and configs)
Copy-WithProgress "lib" "$backupRoot\lib" "Lib Directory (Utils & Configs)"

# 4. PAGES DIRECTORY (if exists)
Copy-WithProgress "pages" "$backupRoot\pages" "Pages Directory"

# 5. STYLES DIRECTORY
Copy-WithProgress "styles" "$backupRoot\styles" "Styles Directory"

# 6. PUBLIC DIRECTORY
Copy-WithProgress "public" "$backupRoot\public" "Public Directory"

# 7. CONFIGURATION FILES
Write-Host "`n⚙️  BACKING UP CONFIG FILES..." -ForegroundColor Magenta

$configFiles = @(
    "package.json",
    "package-lock.json",
    "next.config.js",
    "tailwind.config.js",
    "tsconfig.json",
    ".env.local",
    ".env",
    "README.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$backupRoot\$file" -Force
        Write-Host "✅ $file backed up" -ForegroundColor Green
    }
}

# 8. SUPABASE DIRECTORY
Copy-WithProgress "supabase" "$backupRoot\supabase" "Supabase Directory"

# Create backup summary
$summary = @"
A2Z PLATFORM BACKUP SUMMARY
============================
Backup Date: $(Get-Date)
Backup Location: $backupRoot

BACKED UP DIRECTORIES:
- app/ (All pages and layouts)
- components/ (All React components)
- lib/ (Utilities and configurations)
- styles/ (CSS and styling)
- public/ (Static assets)
- supabase/ (Database configurations)

BACKED UP CONFIG FILES:
- package.json
- next.config.js
- tailwind.config.js
- tsconfig.json
- Environment files

IMPORTANT NOTES:
- This backup contains ALL your critical files
- To restore, copy files from this backup to your project
- Keep multiple backups for safety
- Run this script regularly (daily/weekly)

RESTORE INSTRUCTIONS:
1. Navigate to backup folder: $backupRoot
2. Copy needed files back to project root
3. Run: npm install (to restore dependencies)
4. Run: npm run dev (to test restoration)
"@

$summary | Out-File -FilePath "$backupRoot\BACKUP_SUMMARY.txt" -Encoding UTF8

Write-Host "`n🎉 BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "📁 Backup saved to: $backupRoot" -ForegroundColor Yellow
Write-Host "📄 Summary saved to: $backupRoot\BACKUP_SUMMARY.txt" -ForegroundColor Yellow

# Show backup size
$backupSize = (Get-ChildItem -Path $backupRoot -Recurse | Measure-Object -Property Length -Sum).Sum
$backupSizeMB = [math]::Round($backupSize / 1MB, 2)
Write-Host "💾 Backup size: $backupSizeMB MB" -ForegroundColor Cyan

Write-Host "`n🛡️  YOUR FILES ARE NOW PROTECTED!" -ForegroundColor Green
Write-Host "💡 TIP: Run this script weekly to maintain multiple backups" -ForegroundColor Yellow
