param([Parameter(Mandatory = $true)][string]$ProjectRoot)
$ErrorActionPreference = 'Stop'
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'Iniciar Kobber.lnk'
$launcher = Join-Path $ProjectRoot 'deployment\windows\iniciar_Kobber.bat'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $env:ComSpec
$shortcut.Arguments = "/d /c `"`"$launcher`"`""
$shortcut.WorkingDirectory = $ProjectRoot
$shortcut.Description = 'Iniciar frontend y backend de Kobber'
$shortcut.Save()
Write-Host "Acceso directo creado: $shortcutPath"
