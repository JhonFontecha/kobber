$ErrorActionPreference = "Stop"
& python "$PSScriptRoot/../kobber.py" estado
exit $LASTEXITCODE
