@echo off
python3 "%~dp0dashboard.py" %*
if errorlevel 1 python "%~dp0dashboard.py" %*
pause
