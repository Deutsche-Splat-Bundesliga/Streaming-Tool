@echo off
setlocal
:: Start the Angular frontend and the backend web app from the repository root.

echo Starting Streaming Tool...
echo Checking dependencies...

call :checkExecutable node "Node.js" OpenJS.NodeJS "https://nodejs.org"
if errorlevel 1 exit /b 0

call :checkDotNet10
if errorlevel 1 exit /b 0

echo Starting frontend...
if exist ".\Frontend\control-panel\package.json" (
    start "Streaming Tool Frontend" /min cmd /k "cd /d ".\Frontend\control-panel" && npm i && npm start"
) else (
    echo Frontend project not found! Press any key to exit...
    pause > nul
    exit /b 0
)

echo Starting backend...
if exist ".\Backend\DSB.StreamBackend\DSB.StreamBackend.csproj" (
    start "Streaming Tool Backend" /min cmd /k "cd /d ".\Backend\DSB.StreamBackend" && dotnet run"
) else (
    echo Backend project not found! Stopping frontend...
    taskkill /im "cmd.exe" /f /fi "WindowTitle eq Streaming Tool Frontend*" > nul
    echo Press any key to exit...
    pause > nul
    exit /b 0
)

start http://localhost:4200
echo Website opened in the browser.
echo Streaming Tool started. Press any key to close this window...
pause > nul
exit /b 0

:checkExecutable
setlocal
set "exe=%~1"
set "name=%~2"
set "wingetId=%~3"
set "installUrl=%~4"
where %exe% >nul 2>nul
if %errorlevel% equ 0 (
    echo %name% found!
    endlocal
    exit /b 0
)

echo %name% is not installed. Install it now? (y/N)
set /p "installChoice="
if /i "%installChoice%"=="y" (
    echo Installing %name% using WinGet...
    winget install -e --id %wingetId%
    where %exe% >nul 2>nul
    if %errorlevel% neq 0 (
        echo %name% installation failed. Please install %name% manually from %installUrl%.
        echo Press any key to close this window...
        pause > nul
        endlocal
        exit /b 1
    )
    echo %name% installed successfully!
    endlocal
    exit /b 0
)

echo %name% is required. Press any key to close this window...
pause > nul
endlocal
exit /b 1

:checkDotNet10
setlocal
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    set "dotnetOk=0"
) else (
    set "dotnetOk=0"
    for /f "delims=" %%A in ('dotnet --list-sdks 2^>nul ^| findstr /r "^10\."') do set "dotnetOk=1"
)

if %dotnetOk% equ 1 (
    endlocal
    echo .NET 10 SDK found!
    exit /b 0
)

echo .NET 10 SDK is not installed. Install it now? (y/N)
set /p "installDotNet="
if /i "%installDotNet%"=="y" (
    echo Installing .NET 10 SDK using WinGet...
    winget install -e --id Microsoft.DotNet.SDK.10
    set "dotnetOk=0"
    for /f "delims=" %%A in ('dotnet --list-sdks 2^>nul ^| findstr /r "^10\."') do set "dotnetOk=1"
    if %dotnetOk% equ 1 (
        echo .NET 10 SDK installed successfully!
        endlocal
        exit /b 0
    )
    echo .NET installation failed. Please install .NET 10 manually from https://dotnet.microsoft.com/en-us/download/dotnet/10.0
    echo Press any key to close this window...
    pause > nul
    endlocal
    exit /b 1
)

echo .NET 10 is required. Press any key to close this window...
pause > nul
endlocal
exit /b 1