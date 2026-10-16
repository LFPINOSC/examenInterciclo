@echo off
cd /d "%~dp0backend"
if not exist "..\configuracion-local\application-local.properties" (echo Ejecuta CONFIGURAR.cmd primero. & pause & exit /b 1)
if not exist "target\reservas-1.0.0.jar" (echo Ejecuta COMPILAR_Y_PROBAR.cmd primero. & pause & exit /b 1)
java -jar target\reservas-1.0.0.jar
pause
