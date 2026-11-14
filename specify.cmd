@echo off
setlocal
set "SPECIFY_EXE=%~dp0.tools\spec-kit\Scripts\specify.exe"
if not exist "%SPECIFY_EXE%" (
  echo Spec Kit nao instalado. Consulte docs/spec-kit-windows.md.
  exit /b 1
)
pushd "%~dp0"
"%SPECIFY_EXE%" %*
set "SPECIFY_RESULT=%ERRORLEVEL%"
popd
exit /b %SPECIFY_RESULT%
