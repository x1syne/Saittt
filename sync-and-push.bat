@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════════
echo   🔄 Синхронизация с GitHub и загрузка изменений
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 📋 Шаг 1: Получение изменений с GitHub...
git pull origin main --allow-unrelated-histories --no-edit

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Возможны конфликты. Используем стратегию "ours"...
    git pull origin main --allow-unrelated-histories -X ours --no-edit
)

echo.
echo 📋 Шаг 2: Загрузка ваших изменений на GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo   ✅ УСПЕШНО! ВСЕ ФАЙЛЫ НА GITHUB!
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 🎉 Проверьте: https://github.com/x1syne/Saittt
    echo.
    echo 🌐 Следующие шаги:
    echo.
    echo    1. Откройте: Saittt-main/НАЧАЛО.txt
    echo    2. Настройте Spotify App (2 минуты)
    echo    3. Настройте Vercel (2 минуты)
    echo    4. Проверьте работу (test-auth.html)
    echo.
    echo 📍 Ваш сайт будет доступен:
    echo    https://x1syne.github.io/Saittt/Saittt-main/index.html
    echo.
) else (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo   ❌ ОШИБКА
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo Попробуйте принудительную загрузку:
    echo    force-push.bat
    echo.
)

echo.
pause
