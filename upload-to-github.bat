@echo off
echo ========================================
echo   Загрузка изменений на GitHub
echo ========================================
echo.

cd /d "%~dp0"
г
echo Проверка статуса Git...
git status
echo.

echo Проверка удаленного репозитория...
git remote -v
echo.

echo Если удаленный репозиторий не настроен, выполните:
echo git remote add origin https://github.com/x1syne/Saittt.git
echo.

pause

echo Загрузка на GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo   Успешно загружено на GitHub!
    echo ========================================
) else (
    echo ========================================
    echo   Ошибка при загрузке!
    echo ========================================
    echo.
    echo Возможные причины:
    echo 1. Удаленный репозиторий не настроен
    echo 2. Нет прав доступа
    echo 3. Нет интернет-соединения
    echo.
    echo Попробуйте:
    echo git remote add origin https://github.com/x1syne/Saittt.git
    echo git push -u origin main
)

echo.
pause
