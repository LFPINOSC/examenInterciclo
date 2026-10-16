@echo off
cd /d "%~dp0frontend"
if not exist node_modules (echo Ejecuta COMPILAR_Y_PROBAR.cmd primero. & pause & exit /b 1)
call npm.cmd start
pause
