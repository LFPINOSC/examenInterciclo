# RutaControl - Instalacion / inicio guiado para Windows 10 y 11.
# No elimina la base de datos ni modifica .env si ya existe.
$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
function Line($message) { Write-Host "`n$message" -ForegroundColor Cyan }
function SecureText($question) {
  $secure=Read-Host $question -AsSecureString
  $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)}
  finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)}
}
function FinishWithError($message) {
  Write-Host "`nERROR: $message" -ForegroundColor Red
  Read-Host 'Presiona ENTER para cerrar'
  exit 1
}
try {
  Line 'RUTACONTROL  |  PREPARACION AUTOMATICA'
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {FinishWithError 'Node.js no está instalado. Instala Node.js 20+ desde nodejs.org'}
  if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {FinishWithError 'npm no se encontró. Abre una nueva terminal después de instalar Node.js'}
  # Node.js es un ejecutable externo: -ErrorAction es un parametro de PowerShell, no de Node.
  $nodeVersion = & node -p 'process.versions.node'
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($nodeVersion)) {
    FinishWithError 'No se pudo obtener la version de Node.js. Comprueba la instalacion.'
  }
  $versionText = ([string]$nodeVersion).Trim()
  if ($versionText -notmatch '^([0-9]+)\.') {FinishWithError 'La version de Node.js no tiene un formato valido.'}
  $version = [int]($versionText.Split('.')[0])
  if ($version -lt 20) {FinishWithError 'Se requiere Node.js 20 o superior.'}
  $envPath=Join-Path $PSScriptRoot 'backend\.env'
  if (Test-Path $envPath) {
    Write-Host '✓ Se reutilizará backend/.env (tu usuario, correo y contraseñas actuales no se modifican).' -ForegroundColor Green
    $content=Get-Content $envPath -Raw
    $jwtPlaceholder='(?m)^JWT_SECRET=(?:REEMPLAZAR_POR_CLAVE_GENERADA|REEMPLAZA_ESTO_POR[^\r\n]*)$'
    if ([regex]::IsMatch($content,$jwtPlaceholder)) {
      $generatedSecret=node -e 'console.log(require("crypto").randomBytes(48).toString("hex"))'
      $content=[regex]::Replace($content,$jwtPlaceholder,"JWT_SECRET=$generatedSecret")
      [System.IO.File]::WriteAllText($envPath,$content,[System.Text.UTF8Encoding]::new($false))
      Write-Host '✓ JWT_SECRET generado automáticamente. Se conservan los demás datos.' -ForegroundColor Green
    }
    if ($content -match 'CAMBIA_ESTO_POR|TU_CONTRASENA|ADMIN_PASSWORD=REEMPLAZA') {
      FinishWithError 'Tu archivo .env todavía contiene contraseñas de ejemplo. Corrígelas antes de ejecutar.'
    }
  } else {
    Line 'PRIMERA INSTALACION: credenciales de PostgreSQL y administrador'
    $dbPort=Read-Host 'Puerto PostgreSQL [5432]'
    if ([string]::IsNullOrWhiteSpace($dbPort)) {$dbPort='5432'}
    if ($dbPort -notmatch '^\d+$') {FinishWithError 'Puerto no válido.'}
    $dbPass=SecureText 'Contraseña de PostgreSQL (no se muestra)'
    $adminName=Read-Host 'Nombre del administrador [Administrador Transporte]'
    if ([string]::IsNullOrWhiteSpace($adminName)) {$adminName='Administrador Transporte'}
    $adminMail=Read-Host 'Correo del administrador'
    $adminPass=SecureText 'Nueva contraseña de administrador, mínimo 8 caracteres (no se muestra)'
    if ($adminPass.Length -lt 8 -or $adminPass.Length -gt 72) {FinishWithError 'Contraseña de administrador: entre 8 y 72 caracteres.'}
    if ($adminMail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {FinishWithError 'Correo del administrador no válido.'}
    # Los valores de una sola línea no pueden alterar otras variables del .env.
    foreach ($v in @($dbPass,$adminName,$adminMail,$adminPass)) { if ($v -match '[\r\n]') {FinishWithError 'No se admiten saltos de línea en las credenciales.'} }
    $secret=node -e 'console.log(require("crypto").randomBytes(48).toString("hex"))'
    $lines=@(
      'PORT=3000', 'DB_HOST=localhost', "DB_PORT=$dbPort", 'DB_NAME=gestion_transporte',
      'DB_USER=postgres', "DB_PASSWORD=$dbPass", "JWT_SECRET=$secret",
      "ADMIN_NOMBRE=$adminName", "ADMIN_EMAIL=$adminMail", "ADMIN_PASSWORD=$adminPass"
    )
    [System.IO.File]::WriteAllLines($envPath,$lines,[System.Text.UTF8Encoding]::new($false))
    Write-Host '✓ Configuración local creada. backend/.env no se incluye en el ZIP ni debe publicarse en Git.' -ForegroundColor Green
  }
  Set-Location (Join-Path $PSScriptRoot 'backend')
  Line 'PASO 1/3: verificar dependencias'
  if (-not (Test-Path 'node_modules\express')) {
    & npm.cmd install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {FinishWithError 'npm install no terminó correctamente.'}
  } else { Write-Host '✓ Dependencias instaladas.' -ForegroundColor Green }
  Line 'PASO 2/3: crear/verificar base, tablas y usuario'
  & node scripts/inicializar.js
  if ($LASTEXITCODE -ne 0) {FinishWithError 'No se pudo preparar PostgreSQL. Revisa DB_PASSWORD, DB_PORT y que el servicio esté activo.'}
  Line 'PASO 3/3: iniciar servidor y abrir el navegador'
  Write-Host 'Dirección: http://localhost:3000' -ForegroundColor Green
  Write-Host 'Para apagarlo presiona Ctrl+C en esta ventana.'
  $env:RUTACONTROL_OPEN_BROWSER='1'
  & node src/server.js
  if ($LASTEXITCODE -ne 0) {FinishWithError 'No se pudo iniciar la web. Revisa si el puerto 3000 está ocupado.'}
} catch {FinishWithError $_.Exception.Message}
