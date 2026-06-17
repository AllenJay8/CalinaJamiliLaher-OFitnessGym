@echo off
set "PHP_DIR=%~dp0..\tools\php84"
set "PATH=%PHP_DIR%;%PATH%"
cd /d "%~dp0"
php artisan serve --port=8002
