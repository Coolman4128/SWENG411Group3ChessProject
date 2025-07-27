@echo off
setlocal enabledelayedexpansion

REM === Step 1: Compile client TypeScript ===
echo Compiling client TypeScript...
pushd client
call npm run build
popd

REM === Step 2: Prepare server public directory ===
echo Preparing server public directory...
if not exist server\public (
    mkdir server\public
) else (
    del /Q /F /S server\public\*
)

REM === Step 3: Copy client dist files to server public ===
echo Copying client dist files...
copy client\dist\main.js server\public\client.js

REM === Step 4: Copy client public files to server public ===
echo Copying client public files...
xcopy /E /Y client\public\* server\public\

REM === Step 5: Compile server TypeScript ===
echo Compiling server TypeScript...
pushd server
call npm run build
popd

REM === Step 6: Run server ===
echo Starting server...
node server\dist\main.js