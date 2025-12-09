@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════════
echo   🚀 Настройка и загрузка на GitHub
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 📋 Шаг 1: Проверка текущего статуса...
git status
echo.

echo 📋 Шаг 2: Добавление удаленного репозитория...
git remote add origin https://github.com/x1syne/Saittt.git
echo ✅ Удаленный репозиторий добавлен!
echo.

echo 📋 Шаг 3: Проверка удаленного репозитория...
git remote -v
echo.

echo 📋 Шаг 4: Загрузка на GitHub...
echo Это может занять несколько секунд...
echo.

git push -u origin main

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
    echo 🌐 Следующий шаг:
    echo    1. Откройте: https://github.com/x1syne/Saittt/settings/pages
    echo    2. Включите GitHub Pages (Source: main branch)
    echo    3. Ваш сайт будет доступен через 1-2 минуты
    echo.
) else (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo   ❌ ОШИБКА ПРИ ЗАГРУЗКЕ
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo Возможные причины:
    echo.
    echo 1. Удаленный репозиторий уже существует
    echo    Решение: git remote remove origin
    echo             затем запустите этот скрипт снова
    echo.
    echo 2. Нет прав доступа к репозиторию
    echo    Решение: Настройте GitHub аутентификацию
    echo             https://github.com/settings/tokens
    echo.
    echo 3. Репозиторий не существует
    echo    Решение: Создайте репозиторий на GitHub
    echo             https://github.com/new
    echo.
    echo 4. Есть конфликты с удаленной версией
    echo    Решение: git pull origin main --rebase
    echo             git push origin main
    echo.
)

echo.
pause
