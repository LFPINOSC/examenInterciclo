$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$destino = Join-Path (Get-Location) 'configuracion-local/application-local.properties'
if (Test-Path $destino) {
 Write-Host 'Ya existe configuracion-local/application-local.properties. Se conserva sin cambios.'
 Write-Host 'Si necesitas corregir la conexion, abre ese archivo local. No lo subas a GitHub.'
 exit 0
}
function Leer-Clave($mensaje) {
 $segura = Read-Host $mensaje -AsSecureString
 $puntero = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura)
 try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($puntero) }
 finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($puntero) }
}
function Escapar($texto) {
 $salida = New-Object Text.StringBuilder
 foreach ($c in $texto.ToCharArray()) {
  if ([int]$c -lt 33 -or [int]$c -gt 126 -or '\:=#!'.Contains([string]$c)) { [void]$salida.Append(('\u{0:x4}' -f [int]$c)) }
  else { [void]$salida.Append($c) }
 }
 return $salida.ToString()
}
$claveDb = Leer-Clave 'Clave MariaDB de reservas_app'
if ([string]::IsNullOrWhiteSpace($claveDb)) { throw 'La clave de MariaDB no puede quedar vacia.' }
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$jwt = ([BitConverter]::ToString($bytes)).Replace('-','')
$rng.GetBytes($bytes)
$admin = 'Hotel-' + ([BitConverter]::ToString($bytes[0..9])).Replace('-','') + 'a1!'
$rng.Dispose()
New-Item -ItemType Directory -Force 'configuracion-local' | Out-Null
$contenido = @"
spring.datasource.url=jdbc:mariadb://localhost:3306/reservas_hoteleras_db
spring.datasource.username=reservas_app
spring.datasource.password=$(Escapar $claveDb)
app.jwt-secret=$jwt
app.admin-email=admin@reservas.local
app.admin-password=$admin
"@
[IO.File]::WriteAllText($destino,$contenido,(New-Object Text.UTF8Encoding($false)))
Write-Host 'Configuracion guardada. Usuario ADMIN: admin@reservas.local'
Write-Host 'La clave ADMIN esta en configuracion-local/application-local.properties (app.admin-password).'
Write-Host 'No compartas este archivo. La cuenta se crea al iniciar por primera vez.'
