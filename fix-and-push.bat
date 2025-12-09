@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════════
echo   🔧 Исправление конфликта и загрузка на GitHub
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 📋 Шаг 1: Получение изменений с GitHub...
git pull origin main --rebase --allow-unrelated-histories
echo.

if %errorlevel% neq 0 (
    echo ⚠️  Возможны конфликты. Попробуем другой способ...
    echo.
    
    echo 📋 Шаг 2: Принудительное объединение...
    git pull origin main --allow-unrelated-histories -X theirs
    echo.
)

echo 📋 Шаг 3: Загрузка ваших изменений на GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo   ✅ УСПЕШНО ЗАГРУЖЕНО НА GITHUB!
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 🎉 Все изменения загружены!
    echo.
    echo 📍 Проверьте: https://github.com/x1syne/Saittt
    echo.
    echo 🌐 Следующие шаги:
    echo    1. Откройте: Saittt-main/НАЧАЛО.txt
    echo    2. Настройте Spotify App (2 минуты)
    echo    3. Настройте Vercel (2 минуты)
    echo    4. Проверьте работу (test-auth.html)
    echo.
) else (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo   ❌ ВСЕ ЕЩЕ ЕСТЬ ПРОБЛЕМА
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo Попробуйте принудительную загрузку:
    echo.
    echo git push origin main --force
    echo.
    echo ⚠️  ВНИМАНИЕ: Это перезапишет все на GitHub!
    echo    Используйте только если уверены.
    echo.
)

echo.
pause
