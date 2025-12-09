@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════════
echo   📦 Создание архива для загрузки на GitHub
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 📋 Создание архива SoundMate-Fixed.zip...
echo.

powershell -Command "Compress-Archive -Path 'Saittt-main\*' -DestinationPath 'SoundMate-Fixed.zip' -Force"

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo   ✅ АРХИВ СОЗДАН!
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 📦 Файл: SoundMate-Fixed.zip
    echo 📍 Расположение: %CD%
    echo.
    echo 🌐 Как загрузить на GitHub:
    echo.
    echo    1. Откройте: https://github.com/x1syne/Saittt
    echo    2. Нажмите "Add file" → "Upload files"
    echo    3. Перетащите файлы из архива (распакуйте архив)
    echo    4. Или загрузите через Git Desktop
    echo.
    echo 💡 ВАЖНО: Загружайте СОДЕРЖИМОЕ архива, а не сам архив!
    echo.
    
    echo Открыть папку с архивом? (Y/N)
    set /p open="Ваш выбор: "
    
    if /i "%open%"=="Y" (
        explorer .
    )
) else (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo   ❌ ОШИБКА ПРИ СОЗДАНИИ АРХИВА
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo Попробуйте создать архив вручную:
    echo    1. Откройте папку Saittt-main
    echo    2. Выделите все файлы (Ctrl+A)
    echo    3. Правый клик → "Отправить" → "Сжатая ZIP-папка"
    echo.
)

echo.
pause
