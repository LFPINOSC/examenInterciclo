@echo off
cd /d "%~dp0backend"
call mvnw.cmd clean verify
if errorlevel 1 (echo Fallo el backend. Revisa el error. & pause & exit /b 1)
cd /d "%~dp0frontend"
call npm.cmd ci
if errorlevel 1 (echo Fallo la instalacion frontend. & pause & exit /b 1)
call npm.cmd run build
if errorlevel 1 (echo Fallo la compilacion Angular. & pause & exit /b 1)
echo Backend y frontend compilados. Pruebas backend terminadas.
pause
