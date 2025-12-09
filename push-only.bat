@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════════
echo   📤 Загрузка на GitHub (если remote уже настроен)
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 📋 Загрузка изменений...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ Успешно загружено!
    echo.
    echo Проверьте: https://github.com/x1syne/Saittt
) else (
    echo.
    echo ❌ Ошибка! Попробуйте запустить: setup-and-push.bat
)

echo.
pause
