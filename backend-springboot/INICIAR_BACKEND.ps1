# Ejecutar desde PowerShell: powershell -ExecutionPolicy Bypass -File .\INICIAR_BACKEND.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
function Solicitar-Secreto($mensaje) {
    $secure = Read-Host $mensaje -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
$env:DB_PASSWORD = Solicitar-Secreto 'Contrasena de PostgreSQL (postgres)'
$env:ADMIN_EMAIL = 'admin@tecnosoporte.local'
$env:ADMIN_PASSWORD = Solicitar-Secreto 'Crea una contrasena ADMIN de 8 o mas caracteres'
$env:DEMO_CLIENT_PASSWORD = Solicitar-Secreto 'Contrasena para clientes de prueba (8 o mas caracteres)'
if ($env:ADMIN_PASSWORD.Length -lt 8 -or $env:DEMO_CLIENT_PASSWORD.Length -lt 8) { throw 'Las contrasenas ADMIN y CLIENTE de prueba necesitan minimo 8 caracteres' }
$env:APP_DEMO_SEED = 'true'
$randomBytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($randomBytes) } finally { $rng.Dispose() }
$env:JWT_SECRET = [BitConverter]::ToString($randomBytes).Replace('-', '')
Write-Host 'Iniciando TecnoSoporte en http://localhost:8080 ...' -ForegroundColor Cyan
mvn spring-boot:run
