@echo off
cd /d %~dp0
echo Iniciando servidor con privilegios de administrador...
powershell -Command "Start-Process cmd.exe -ArgumentList '/c node server.js' -Verb RunAs"
