// Глобальные переменные
let currentTemplate = null;
let remainingCredits = 3;
let isGenerating = false;

// Выбор шаблона
function selectTemplate(template) {
    currentTemplate = template;

    // Показываем соответствующий конструктор
    if (template === 'school_hymn') {
        document.getElementById('hymnBuilder').style.display = 'block';
        document.getElementById('musicPrompt').value = 'Торжественный школьный гимн с оркестром и хором';
        updatePromptFromHymnBuilder();
    } else if (template === 'lofi') {
        document.getElementById('hymnBuilder').style.display = 'none';
        document.getElementById('musicPrompt').value = 'Расслабляющие lofi биты для учебы и работы';
    }

    // Обновляем стиль в основном селекторе
    document.getElementById('musicStyle').value = template === 'lofi' ? 'lofi' : 'orchestral';
}

// Обновление промпта из конструктора гимнов
function updatePromptFromHymnBuilder() {
    const type = document.getElementById('hymnType').value;
    const vocal = document.getElementById('hymnVocal').value;
    const style = document.getElementById('hymnStyle').value;
    const mood = document.getElementById('hymnMood').value;
    const schoolName = document.getElementById('schoolName').value || 'нашей школы';

    const prompts = {
        official: 'официальный торжественный',
        modern: 'современный молодежный'
    };

    const vocals = {
        mixed: 'смешанный хор',
        male: 'мужской хор',
        female: 'женский хор'
    };

    const styles = {
        orchestral: 'оркестровая аранжировка',
        rock: 'рок-аранжировка'
    };

    const moods = {
        inspiring: 'вдохновляющее',
        proud: 'гордое'
    };

    const prompt = `${prompts[type]} гимн для ${schoolName} с ${vocals[vocal]}, ${styles[style]}, ${moods[mood]} настроение`;
    document.getElementById('musicPrompt').value = prompt;
}

// Генерация музыки
async function generateMusic() {
    if (isGenerating) return;

    if (remainingCredits <= 0) {
        alert('У вас закончились бесплатные генерации! Перейдите на Premium для неограниченного доступа.');
        return;
    }

    const prompt = document.getElementById('musicPrompt').value;
    if (!prompt.trim()) {
        alert('Пожалуйста, опишите музыку, которую хотите создать!');
        return;
    }

    isGenerating = true;
    remainingCredits--;
    updateCreditsDisplay();

    // Показываем панель прогресса
    document.getElementById('progressPanel').style.display = 'block';
    document.getElementById('resultPanel').style.display = 'none';

    // Блокируем кнопку
    const generateBtn = document.querySelector('.generate-btn');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Генерация...';

    try {
        // Симуляция процесса генерации через Suno AI
        await simulateSunoGeneration();

        // Показываем результат
        showResult();

    } catch (error) {
        alert('Ошибка при генерации: ' + error.message);
        remainingCredits++; // Возвращаем кредит при ошибке
        updateCreditsDisplay();
    } finally {
        isGenerating = false;
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Создать музыку (1 кредит)';
    }
}

// Симуляция работы Suno AI
async function simulateSunoGeneration() {
    const progressFill = document.getElementById('progressFill');
    const steps = [document.getElementById('step2'), document.getElementById('step3'), document.getElementById('step4')];

    // Этап 1: Подготовка (уже завершен)
    progressFill.style.width = '10%';

    // Этап 2: Генерация (25%)
    await delay(1000);
    progressFill.style.width = '35%';
    steps[0].innerHTML = '<div>✅</div><div>Генерация</div>';
    steps[1].innerHTML = '<div>🔄</div><div>Аранжировка</div>';

    // Этап 3: Аранжировка (60%)
    await delay(1500);
    progressFill.style.width = '70%';
    steps[1].innerHTML = '<div>✅</div><div>Аранжировка</div>';
    steps[2].innerHTML = '<div>🔄</div><div>Мастеринг</div>';

    // Этап 4: Мастеринг (100%)
    await delay(1000);
    progressFill.style.width = '100%';
    steps[2].innerHTML = '<div>✅</div><div>Мастеринг</div>';

    await delay(500);
}

// Показать результат
function showResult() {
    document.getElementById('progressPanel').style.display = 'none';
    document.getElementById('resultPanel').style.display = 'block';

    // Устанавливаем демо-аудио (в реальном приложении - URL от Suno)
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'; // Замените на реальный URL

    // Обновляем информацию о треке
    document.getElementById('trackDuration').textContent = '2:15';
    document.getElementById('trackStyle').textContent = document.getElementById('musicStyle').options[document.getElementById('musicStyle').selectedIndex].text;
    document.getElementById('trackQuality').textContent = 'Стандартное';
    document.getElementById('resultTitle').textContent = 'Ваш ' + (currentTemplate === 'school_hymn' ? 'гимн' : 'трек') + ' готов!';
}

// Вспомогательные функции
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateCreditsDisplay() {
    document.getElementById('remainingCredits').textContent = remainingCredits;
    document.querySelector('.credits-badge').textContent = `🎵 ${remainingCredits}/5 генераций`;
}

function showUpgrade() {
    alert('Эта функция доступна в Premium версии! Перейдите на Premium для доступа ко всем возможностям.');
}

function downloadTrack() {
    alert('В бесплатной версии скачивание недоступно. Перейдите на Premium для скачивания без водяных знаков.');
}

function shareTrack() {
    alert('Поделиться треком (в разработке)');
}

function regenerateTrack() {
    if (remainingCredits > 0) {
        generateMusic();
    } else {
        showUpgrade();
    }
}

function upgradeToPremium() {
    alert('Переход на Premium (интеграция с платежной системой)');
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    updateCreditsDisplay();

    // Слушатели изменений в конструкторе гимнов
    const hymnInputs = ['hymnType', 'hymnVocal', 'hymnStyle', 'hymnMood', 'schoolName'];
    hymnInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', updatePromptFromHymnBuilder);
        document.getElementById(id).addEventListener('input', updatePromptFromHymnBuilder);
    });
});

