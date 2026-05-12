@echo off
cd /d "%~dp0"
echo Starting Elit Kirpich local website...
echo.
echo Elit Kirpich website:
echo http://127.0.0.1:5173/
echo.
echo Keep this window open while the site is open in your browser.
echo Press Ctrl+C to stop.
echo.
node server.js
pause
