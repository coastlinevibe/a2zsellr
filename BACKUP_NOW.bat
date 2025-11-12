@echo off
echo 🚀 A2Z BACKUP SYSTEM
echo.
powershell -ExecutionPolicy Bypass -File "backup-system.ps1"
echo.
echo ✅ Backup complete! Press any key to close...
pause > nul
