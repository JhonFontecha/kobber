param(
    [switch]$CheckOnly,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackendPython = Join-Path $ProjectRoot "backend\venv\Scripts\python.exe"
$EnvFile = Join-Path $ProjectRoot "backend\.env"
$EnvExample = Join-Path $ProjectRoot "backend\.env.example"
$RequirementsFile = Join-Path $ProjectRoot "backend\requirements.txt"

Set-Location $ProjectRoot

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Stop-WithError([string]$Message) {
    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Test-EnvValue([string]$Name) {
    if (-not (Test-Path -LiteralPath $EnvFile)) {
        return $false
    }

    $line = Get-Content -LiteralPath $EnvFile | Where-Object {
        $_ -match ("^\s*" + [regex]::Escape($Name) + "\s*=")
    } | Select-Object -Last 1

    if (-not $line) {
        return $false
    }

    $value = ($line -split "=", 2)[1].Trim().Trim('"').Trim("'")
    return -not [string]::IsNullOrWhiteSpace($value)
}

function Test-Port([int]$Port) {
    return $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
}

function Wait-ForUrl([string]$Url, [int]$Seconds) {
    for ($attempt = 0; $attempt -lt $Seconds; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        }
        catch {
            # El servicio puede tardar unos segundos en quedar disponible.
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

Write-Host "===================================================" -ForegroundColor DarkCyan
Write-Host "  Kobber - instalacion e inicio para Windows" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor DarkCyan

Write-Step "Comprobando herramientas"
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
    Stop-WithError "Node.js no esta instalado o no aparece en PATH."
}
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Stop-WithError "npm no esta instalado o no aparece en PATH."
}

Write-Host ("Node: " + (& node.exe --version)) -ForegroundColor Green
Write-Host ("npm : " + (& npm.cmd --version)) -ForegroundColor Green

if (-not (Test-Path -LiteralPath $BackendPython)) {
    Write-Step "Creando el entorno virtual de Python"
    if (Get-Command py.exe -ErrorAction SilentlyContinue) {
        & py.exe -3.14 -m venv (Join-Path $ProjectRoot "backend\venv")
    }
    elseif (Get-Command python.exe -ErrorAction SilentlyContinue) {
        & python.exe -m venv (Join-Path $ProjectRoot "backend\venv")
    }
    else {
        Stop-WithError "Python no esta instalado o no aparece en PATH."
    }

    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $BackendPython)) {
        Stop-WithError "No fue posible crear backend\venv. Comprueba que Python incluya venv."
    }
}

Write-Host ("Python: " + (& $BackendPython --version)) -ForegroundColor Green

$ViteCommand = Join-Path $ProjectRoot "node_modules\.bin\vite.cmd"
if (-not (Test-Path -LiteralPath $ViteCommand)) {
    Write-Step "Instalando dependencias del frontend"
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError "npm no pudo instalar las dependencias del frontend."
    }
}
else {
    Write-Host "Dependencias del frontend: OK" -ForegroundColor Green
}

& $BackendPython -c "import fastapi, uvicorn, supabase, playwright, PIL" 2>$null
$BackendReady = $LASTEXITCODE -eq 0
if (-not $BackendReady) {
    Write-Step "Instalando dependencias del backend"
    & $BackendPython -m pip install --upgrade pip
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError "No fue posible actualizar pip."
    }

    # Pillow 11.1.0 no ofrece binario para Python 3.14 en Windows.
    & $BackendPython -m pip install Pillow
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError "No fue posible instalar Pillow."
    }

    $dependencies = @(
        Get-Content -LiteralPath $RequirementsFile |
            ForEach-Object { $_.Trim() } |
            Where-Object { $_ -and -not $_.StartsWith("#") -and $_ -notmatch "^Pillow==" }
    )
    & $BackendPython -m pip install $dependencies
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError "No fue posible instalar las dependencias del backend."
    }
}
else {
    Write-Host "Dependencias del backend: OK" -ForegroundColor Green
}

& $BackendPython -m pip check
if ($LASTEXITCODE -ne 0) {
    Stop-WithError "Python encontro dependencias incompatibles."
}

Write-Step "Comprobando configuracion"
if (-not (Test-Path -LiteralPath $EnvFile)) {
    if (-not (Test-Path -LiteralPath $EnvExample)) {
        Stop-WithError "No existe backend\.env.example."
    }
    Copy-Item -LiteralPath $EnvExample -Destination $EnvFile
    Write-Host "Se creo backend\.env. Completa las credenciales en el Bloc de notas." -ForegroundColor Yellow
    Start-Process -FilePath "notepad.exe" -ArgumentList ('"' + $EnvFile + '"') -Wait
}

$requiredVariables = @(
    "ANTHROPIC_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "SUPABASE_SERVICE_KEY"
)
$missingVariables = @($requiredVariables | Where-Object { -not (Test-EnvValue $_) })

if ($missingVariables.Count -gt 0) {
    Write-Host ("Faltan variables en backend\.env: " + ($missingVariables -join ", ")) -ForegroundColor Yellow
    Write-Host "Se abrira el archivo para que puedas completarlas." -ForegroundColor Yellow
    Start-Process -FilePath "notepad.exe" -ArgumentList ('"' + $EnvFile + '"') -Wait
    $missingVariables = @($requiredVariables | Where-Object { -not (Test-EnvValue $_) })
}

if ($missingVariables.Count -gt 0) {
    Stop-WithError ("La configuracion sigue incompleta: " + ($missingVariables -join ", "))
}

Write-Host "Credenciales requeridas: OK" -ForegroundColor Green

if ($CheckOnly) {
    Write-Host ""
    Write-Host "Verificacion completada. Kobber esta listo para iniciarse." -ForegroundColor Green
    exit 0
}

Write-Step "Iniciando servicios"
if (Wait-ForUrl "http://127.0.0.1:8000/health" 2) {
    Write-Host "Backend ya estaba ejecutandose en el puerto 8000." -ForegroundColor Yellow
}
elseif (Test-Port 8000) {
    Stop-WithError "El puerto 8000 esta ocupado por otra aplicacion."
}
else {
    $backendCommand = '"' + $BackendPython + '" -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend'
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", $backendCommand) -WorkingDirectory $ProjectRoot
}

if (Wait-ForUrl "http://127.0.0.1:5173/" 2) {
    Write-Host "Frontend ya estaba ejecutandose en el puerto 5173." -ForegroundColor Yellow
}
elseif (Test-Port 5173) {
    Stop-WithError "El puerto 5173 esta ocupado por otra aplicacion."
}
else {
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", "npm.cmd run dev -- --host 127.0.0.1") -WorkingDirectory $ProjectRoot
}

if (-not (Wait-ForUrl "http://127.0.0.1:8000/health" 30)) {
    Stop-WithError "El backend no respondio en http://127.0.0.1:8000."
}
if (-not (Wait-ForUrl "http://127.0.0.1:5173/" 30)) {
    Stop-WithError "El frontend no respondio en http://127.0.0.1:5173."
}

try {
    $databaseResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/store/productos?margen=30" -UseBasicParsing -TimeoutSec 30
    if ($databaseResponse.StatusCode -ne 200) {
        throw "HTTP $($databaseResponse.StatusCode)"
    }
    Write-Host "Conexion con Supabase: OK" -ForegroundColor Green
}
catch {
    Write-Host "ADVERTENCIA: Kobber inicio, pero la consulta a Supabase fallo." -ForegroundColor Yellow
    Write-Host "Revisa las credenciales de backend\.env y la ventana del backend." -ForegroundColor Yellow
}

$AdminUrl = "http://127.0.0.1:5173/admin"
Write-Host ""
Write-Host "Kobber esta listo: $AdminUrl" -ForegroundColor Green

if (-not $NoBrowser) {
    Start-Process $AdminUrl
}

exit 0
