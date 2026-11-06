@echo off
cd /d "%~dp0"
echo AERO X1 laeuft auf http://localhost:8000  (Fenster offen lassen, zum Beenden schliessen)
start "" http://localhost:8000
where python >nul 2>&1 && (python -m http.server 8000 & goto :eof)
where py >nul 2>&1 && (py -m http.server 8000 & goto :eof)
echo Python wurde nicht gefunden. Bitte Python installieren: https://www.python.org/downloads/
pause
