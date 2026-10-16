@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\configurar.ps1"
if errorlevel 1 (echo Error de configuracion. & pause & exit /b 1)
pause
