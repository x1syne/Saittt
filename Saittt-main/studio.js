// SoundMate AI Studio - Suno AI Integration
// Modern 2025 Music Generation Interface

class SunoAIStudio {
    constructor() {
        this.currentTemplate = null;
        this.remainingCredits = 3;
        this.maxCredits = 5;
        this.isGenerating = false;
        this.generationQueue = [];
        this.init();
    }

    init() {
        this.updateCreditsDisplay();
        this.setupEventListeners();
        this.loadUserPreferences();
        this.testAPIConnection();
        console.log('🎵 SoundMate AI Studio initialized');
    }

    async testAPIConnection() {
        // Тестируем подключение к SunoAPI в фоне
        if (window.MusicAIIntegration) {
            try {
                const musicAI = new window.MusicAIIntegration();
                
                // Простой тест подключения
                const testEndpoint = 'https://api.sunoapi.org/api/get_limit';
                const response = await fetch(testEndpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${musicAI.config.sunoapi.apiKey}`,
                        'api-key': musicAI.config.sunoapi.apiKey,
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ SunoAPI подключен:', result);
                    
                    // Обновляем UI с информацией о лимитах
                    if (result.credits_left !== undefined) {
                        this.showNotification(`🎵 SunoAPI подключен! Осталось кредитов: ${result.credits_left}`, 'success');
                    } else {
                        this.showNotification('🎵 SunoAPI подключен и готов к работе!', 'success');
                    }
                } else {
                    console.warn('⚠️ SunoAPI недоступен:', response.status);
                    this.showAPIWarning();
                }
            } catch (error) {
                console.warn('⚠️ Ошибка подключения к SunoAPI:', error);
                this.showAPIWarning();
            }
        }
    }

    showAPIWarning() {
        // Показываем предупреждение о проблемах с API
        const warningBanner = document.createElement('div');
        warningBanner.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(245, 158, 11, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            z-index: 1000;
            font-weight: 600;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        warningBanner.innerHTML = `
            ⚠️ SunoAPI недоступен. Будут созданы демо-треки. 
            <a href="#" onclick="this.parentElement.remove(); studioInstance.upgradeToPremium();" style="color: #fff; text-decoration: underline;">
                Настроить API
            </a>
        `;
        
        document.body.appendChild(warningBanner);
        
        // Автоматически скрываем через 10 секунд
        setTimeout(() => {
            if (warningBanner.parentElement) {
                warningBanner.remove();
            }
        }, 10000);
    }

    setupEventListeners() {
        // Hymn builder listeners
        const hymnInputs = ['hymnType', 'hymnVocal', 'hymnStyle', 'hymnMood', 'schoolName'];
        hymnInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updatePromptFromHymnBuilder());
                element.addEventListener('input', () => this.updatePromptFromHymnBuilder());
            }
        });

        // Auto-save prompt
        const promptInput = document.getElementById('musicPrompt');
        if (promptInput) {
            promptInput.addEventListener('input', () => this.savePromptToStorage());
        }
    }

    loadUserPreferences() {
        const savedPrompt = localStorage.getItem('soundmate_last_prompt');
        if (savedPrompt) {
            document.getElementById('musicPrompt').value = savedPrompt;
        }
    }

    savePromptToStorage() {
        const prompt = document.getElementById('musicPrompt').value;
        localStorage.setItem('soundmate_last_prompt', prompt);
    }

    selectTemplate(template) {
        this.currentTemplate = template;
        
        // Update UI
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        event.target.closest('.template-card').classList.add('selected');

        // Configure based on template
        switch(template) {
            case 'school_hymn':
                this.configureHymnTemplate();
                break;
            case 'lofi':
                this.configureLofiTemplate();
                break;
            default:
                this.showUpgrade();
                return;
        }

        this.animateTemplateSelection();
    }
    configureHymnTemplate() {
        document.getElementById('hymnBuilder').style.display = 'block';
        document.getElementById('musicPrompt').value = 'Торжественный школьный гимн с оркестром и хором';
        document.getElementById('musicStyle').value = 'orchestral';
        this.updatePromptFromHymnBuilder();
    }

    configureLofiTemplate() {
        document.getElementById('hymnBuilder').style.display = 'none';
        document.getElementById('musicPrompt').value = 'Расслабляющие lofi биты для учебы и работы с мягкими синтезаторами и спокойным ритмом';
        document.getElementById('musicStyle').value = 'lofi';
        document.getElementById('musicMood').value = 'calm';
        document.getElementById('musicInstruments').value = 'electronic';
    }

    updatePromptFromHymnBuilder() {
        if (this.currentTemplate !== 'school_hymn') return;

        const type = document.getElementById('hymnType')?.value || 'official';
        const vocal = document.getElementById('hymnVocal')?.value || 'mixed';
        const style = document.getElementById('hymnStyle')?.value || 'orchestral';
        const mood = document.getElementById('hymnMood')?.value || 'inspiring';
        const schoolName = document.getElementById('schoolName')?.value || 'нашей школы';

        const templates = {
            type: {
                official: 'официальный торжественный',
                modern: 'современный молодежный'
            },
            vocal: {
                mixed: 'смешанный хор',
                male: 'мужской хор', 
                female: 'женский хор'
            },
            style: {
                orchestral: 'оркестровая аранжировка',
                rock: 'рок-аранжировка'
            },
            mood: {
                inspiring: 'вдохновляющее настроение',
                proud: 'гордое и торжественное настроение'
            }
        };

        const prompt = `${templates.type[type]} гимн для ${schoolName} с ${templates.vocal[vocal]}, ${templates.style[style]}, ${templates.mood[mood]}`;
        document.getElementById('musicPrompt').value = prompt;
        this.savePromptToStorage();
    }

    animateTemplateSelection() {
        // Add selection animation
        const selectedCard = document.querySelector('.template-card.selected');
        if (selectedCard) {
            selectedCard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                selectedCard.style.transform = '';
            }, 200);
        }
    }

    async generateMusic() {
        if (this.isGenerating) {
            this.showNotification('Генерация уже в процессе...', 'warning');
            return;
        }

        if (this.remainingCredits <= 0) {
            this.showUpgrade();
            return;
        }

        const prompt = document.getElementById('musicPrompt').value.trim();
        if (!prompt) {
            this.showNotification('Пожалуйста, опишите музыку, которую хотите создать!', 'error');
            return;
        }

        // Start generation process
        this.isGenerating = true;
        this.remainingCredits--;
        this.updateCreditsDisplay();

        try {
            await this.startSunoGeneration(prompt);
        } catch (error) {
            console.error('Generation error:', error);
            this.remainingCredits++; // Restore credit on error
            this.updateCreditsDisplay();
            this.showNotification('Ошибка при генерации: ' + error.message, 'error');
        } finally {
            this.isGenerating = false;
        }
    }
    async startSunoGeneration(prompt) {
        // Show progress panel
        this.showProgressPanel();
        
        // Update generate button
        const generateBtn = document.querySelector('.generate-btn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Генерация через AI...';

        // Prepare generation data
        const generationData = {
            prompt: prompt,
            style: document.getElementById('musicStyle').value,
            duration: parseInt(document.getElementById('musicDuration').value),
            mood: document.getElementById('musicMood').value,
            instruments: document.getElementById('musicInstruments').value,
            timestamp: Date.now()
        };

        try {
            // Try real API first, fallback to simulation
            let result;
            
            if (window.MusicAIIntegration) {
                const musicAI = new window.MusicAIIntegration();
                
                try {
                    // Показываем статус попытки подключения к API
                    this.updateProgressStep('step2', 'active', 'Подключение к SunoAPI...');
                    
                    // Attempt real API generation
                    result = await musicAI.generateMusic(generationData);
                    generationData.audioUrl = result.audioUrl;
                    generationData.isReal = true;
                    generationData.provider = result.provider;
                    generationData.quality = result.quality;
                    generationData.model = result.model;
                    
                    this.showNotification(`🎵 Трек создан с помощью ${result.provider}!`, 'success');
                } catch (apiError) {
                    console.warn('API недоступен, используем демо:', apiError.message);
                    
                    // Показываем конкретную ошибку пользователю
                    let errorMessage = 'Демо-трек создан';
                    if (apiError.message.includes('API ключ') || apiError.message.includes('токен')) {
                        errorMessage = '⚠️ Проблема с API ключом. Создан демо-трек.';
                    } else if (apiError.message.includes('лимит') || apiError.message.includes('подписка')) {
                        errorMessage = '⚠️ Превышен лимит бесплатного API. Создан демо-трек.';
                    } else if (apiError.message.includes('недоступен')) {
                        errorMessage = '⚠️ SunoAPI временно недоступен. Создан демо-трек.';
                    }
                    
                    // Fallback to simulation
                    this.updateProgressStep('step2', 'active', 'Создание демо-трека...');
                    await this.simulateSunoAPI(generationData);
                    generationData.isReal = false;
                    generationData.provider = 'Демо режим';
                    generationData.quality = 'Демо качество';
                    generationData.apiError = apiError.message;
                    
                    this.showNotification(errorMessage, 'warning');
                }
            } else {
                // No API integration available
                this.updateProgressStep('step2', 'active', 'Создание демо-трека...');
                await this.simulateSunoAPI(generationData);
                generationData.isReal = false;
                generationData.provider = 'Демо режим';
                generationData.quality = 'Демо качество';
                
                this.showNotification('🎵 Демо-трек создан (подключите SunoAPI для реальной генерации)', 'info');
            }
            
            // Show result
            this.showGenerationResult(generationData);
            
            // Save to history
            this.saveToHistory(generationData);
            
        } finally {
            // Reset button
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Создать музыку (1 кредит)';
        }
    }

    async simulateSunoAPI(data) {
        const progressFill = document.getElementById('progressFill');
        const progressTime = document.getElementById('progressTime');
        const steps = ['step2', 'step3', 'step4'];
        
        // Stage 1: Preparation (already complete)
        progressFill.style.width = '15%';
        progressTime.textContent = '~2:30';

        // Stage 2: AI Analysis & Generation
        await this.delay(1200);
        progressFill.style.width = '40%';
        progressTime.textContent = '~1:45';
        this.updateProgressStep(steps[0], 'complete', 'AI Анализ');
        this.updateProgressStep(steps[1], 'active', 'Генерация');

        // Stage 3: Musical Arrangement
        await this.delay(1800);
        progressFill.style.width = '75%';
        progressTime.textContent = '~0:45';
        this.updateProgressStep(steps[1], 'complete', 'Аранжировка');
        this.updateProgressStep(steps[2], 'active', 'Мастеринг');

        // Stage 4: Final Processing & Mastering
        await this.delay(1000);
        progressFill.style.width = '100%';
        progressTime.textContent = 'Готово!';
        this.updateProgressStep(steps[2], 'complete', 'Завершено');

        await this.delay(500);
    }

    updateProgressStep(stepId, status, label) {
        const step = document.getElementById(stepId);
        if (!step) return;

        step.className = `progress-step step-${status}`;
        
        const icon = status === 'complete' ? '✅' : 
                    status === 'active' ? '🔄' : '⏳';
        
        step.innerHTML = `<div>${icon}</div><div>${label}</div>`;
    }

    showProgressPanel() {
        document.getElementById('progressPanel').style.display = 'block';
        document.getElementById('resultPanel').style.display = 'none';
        
        // Reset progress
        document.getElementById('progressFill').style.width = '0%';
        
        // Reset steps
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            if (index === 0) {
                step.className = 'progress-step step-complete';
                step.innerHTML = '<div>✅</div><div>Подготовка</div>';
            } else {
                step.className = 'progress-step';
                step.innerHTML = '<div>⏳</div><div>Ожидание</div>';
            }
        });
    }
    showGenerationResult(data) {
        document.getElementById('progressPanel').style.display = 'none';
        document.getElementById('resultPanel').style.display = 'block';

        // Update result info
        const titleElement = document.getElementById('resultTitle');
        const trackTitle = this.currentTemplate === 'school_hymn' ? 'гимн' : 'трек';
        titleElement.textContent = `Ваш ${trackTitle} готов!`;

        // Set audio source (real API or demo)
        const audioPlayer = document.getElementById('audioPlayer');
        if (data.isReal && data.audioUrl) {
            audioPlayer.src = data.audioUrl;
        } else {
            audioPlayer.src = this.getDemoAudioUrl(data.style);
        }

        // Update track information
        document.getElementById('trackDuration').textContent = this.formatDuration(data.duration);
        document.getElementById('trackStyle').textContent = this.getStyleDisplayName(data.style);
        
        // Update quality based on source
        const qualityText = data.isReal ? (data.quality || 'Высокое (320kbps)') : 'Демо (128kbps)';
        document.getElementById('trackQuality').textContent = qualityText;

        // Add generation timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Show success notification with appropriate message
        const message = data.isReal 
            ? `🎵 ${trackTitle.charAt(0).toUpperCase() + trackTitle.slice(1)} создан с помощью AI в ${timeString}!`
            : `🎵 Демо ${trackTitle} создан в ${timeString}!`;
        
        this.showNotification(message, 'success');
    }

    getDemoAudioUrl(style) {
        // Создаем синтезированный демо-трек для каждого стиля
        return this.generateSynthAudio(style);
    }

    generateSynthAudio(style) {
        try {
            // Создаем AudioContext для генерации демо-аудио
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const duration = 30; // 30 секунд демо
            const sampleRate = audioContext.sampleRate;
            const frameCount = sampleRate * duration;
            
            const audioBuffer = audioContext.createBuffer(2, frameCount, sampleRate);
            
            // Генерируем разные мелодии для разных стилей
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const channelData = audioBuffer.getChannelData(channel);
                
                for (let i = 0; i < frameCount; i++) {
                    const time = i / sampleRate;
                    let sample = 0;
                    
                    // Разные алгоритмы для разных стилей
                    switch (style) {
                        case 'orchestral':
                            // Оркестровый - сложная гармония
                            sample = Math.sin(2 * Math.PI * 440 * time) * 0.3 +
                                    Math.sin(2 * Math.PI * 554.37 * time) * 0.2 +
                                    Math.sin(2 * Math.PI * 659.25 * time) * 0.1;
                            break;
                        case 'lofi':
                            // Lofi - мягкие синусоиды с шумом
                            sample = Math.sin(2 * Math.PI * 220 * time) * 0.4 +
                                    (Math.random() - 0.5) * 0.1;
                            break;
                        case 'rock':
                            // Рок - искаженный звук
                            sample = Math.sign(Math.sin(2 * Math.PI * 330 * time)) * 0.5;
                            break;
                        case 'electronic':
                            // Электронный - пилообразная волна
                            sample = (2 * (time * 440 % 1) - 1) * 0.3;
                            break;
                        default:
                            // По умолчанию - простая синусоида
                            sample = Math.sin(2 * Math.PI * 440 * time) * 0.3;
                    }
                    
                    // Добавляем огибающую (fade in/out)
                    const envelope = Math.min(time * 4, 1) * Math.min((duration - time) * 4, 1);
                    channelData[i] = sample * envelope;
                }
            }
            
            // Конвертируем в WAV blob
            const wavBlob = this.audioBufferToWav(audioBuffer);
            return URL.createObjectURL(wavBlob);
            
        } catch (error) {
            console.error('Ошибка создания демо-аудио:', error);
            // Fallback - возвращаем data URL с тишиной
            return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        }
    }

    audioBufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Convert audio data
        const channelData = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getStyleDisplayName(style) {
        const styleNames = {
            orchestral: 'Оркестровый',
            lofi: 'Lofi',
            pop: 'Поп',
            rock: 'Рок',
            electronic: 'Электронный',
            jazz: 'Джаз',
            classical: 'Классический',
            'hip-hop': 'Хип-хоп'
        };
        return styleNames[style] || style;
    }

    saveToHistory(data) {
        let history = JSON.parse(localStorage.getItem('soundmate_generation_history') || '[]');
        
        const historyItem = {
            id: Date.now(),
            prompt: data.prompt,
            style: data.style,
            duration: data.duration,
            mood: data.mood,
            instruments: data.instruments,
            template: this.currentTemplate,
            timestamp: data.timestamp,
            title: this.generateTrackTitle(data)
        };

        history.unshift(historyItem);
        
        // Keep only last 20 generations
        if (history.length > 20) {
            history = history.slice(0, 20);
        }

        localStorage.setItem('soundmate_generation_history', JSON.stringify(history));
    }

    generateTrackTitle(data) {
        if (this.currentTemplate === 'school_hymn') {
            const schoolName = document.getElementById('schoolName')?.value || 'Школы';
            return `Гимн ${schoolName}`;
        }
        
        const styleNames = this.getStyleDisplayName(data.style);
        return `${styleNames} трек`;
    }
    updateCreditsDisplay() {
        const creditsElement = document.getElementById('remainingCredits');
        const badgeElement = document.querySelector('.credits-badge');
        
        if (creditsElement) {
            creditsElement.textContent = this.remainingCredits;
        }
        
        if (badgeElement) {
            badgeElement.innerHTML = `<i class="fas fa-bolt"></i> ${this.remainingCredits}/${this.maxCredits} генераций`;
        }

        // Update generate button state
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn && this.remainingCredits <= 0) {
            generateBtn.innerHTML = '<i class="fas fa-crown"></i> Нужен Premium для продолжения';
            generateBtn.onclick = () => this.showUpgrade();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Add notification styles if not exists
        this.addNotificationStyles();
    }

    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                padding: 1rem;
                border-radius: 12px;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-success {
                background: rgba(16, 185, 129, 0.9);
                color: white;
            }
            
            .notification-error {
                background: rgba(239, 68, 68, 0.9);
                color: white;
            }
            
            .notification-warning {
                background: rgba(245, 158, 11, 0.9);
                color: white;
            }
            
            .notification-info {
                background: rgba(99, 102, 241, 0.9);
                color: white;
            }
            
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    showUpgrade() {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="upgrade-modal-content">
                <div class="upgrade-modal-header">
                    <h2>💎 Перейти на Premium</h2>
                    <button class="modal-close" onclick="this.closest('.upgrade-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="upgrade-modal-body">
                    <div class="upgrade-features">
                        <div class="feature-item">
                            <i class="fas fa-infinity"></i>
                            <span>Неограниченные генерации</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-star"></i>
                            <span>Высокое качество звука (FLAC)</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-clock"></i>
                            <span>До 10 минут длительности</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-palette"></i>
                            <span>Все стили и шаблоны</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-water"></i>
                            <span>Без водяных знаков</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-bolt"></i>
                            <span>Приоритетная очередь</span>
                        </div>
                    </div>
                    <div class="upgrade-pricing">
                        <div class="price-tag">
                            <span class="price">$9.99</span>
                            <span class="period">/месяц</span>
                        </div>
                        <p class="price-note">Первые 7 дней бесплатно</p>
                    </div>
                </div>
                <div class="upgrade-modal-footer">
                    <button class="upgrade-btn-modal" onclick="this.upgradeToPremium()">
                        <i class="fas fa-crown"></i> Начать Premium
                    </button>
                    <button class="cancel-btn" onclick="this.closest('.upgrade-modal').remove()">
                        Может быть позже
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addUpgradeModalStyles();
    }

    addUpgradeModalStyles() {
        if (document.getElementById('upgrade-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'upgrade-modal-styles';
        styles.textContent = `
            .upgrade-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }
            
            .upgrade-modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .upgrade-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .upgrade-modal-header h2 {
                margin: 0;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: #999;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s;
            }
            
            .modal-close:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .upgrade-modal-body {
                padding: 2rem;
            }
            
            .upgrade-features {
                display: grid;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .feature-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                color: #fff;
            }
            
            .feature-item i {
                color: #6366f1;
                font-size: 1.2rem;
                width: 20px;
            }
            
            .upgrade-pricing {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .price-tag {
                display: flex;
                align-items: baseline;
                justify-content: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }
            
            .price {
                font-size: 3rem;
                font-weight: 700;
                color: #6366f1;
            }
            
            .period {
                font-size: 1.2rem;
                color: #999;
            }
            
            .price-note {
                color: #10b981;
                font-size: 0.9rem;
            }
            
            .upgrade-modal-footer {
                padding: 1rem 2rem 2rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .upgrade-btn-modal {
                width: 100%;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .upgrade-btn-modal:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
            }
            
            .cancel-btn {
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #999;
                padding: 0.75rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .cancel-btn:hover {
                color: #fff;
                border-color: rgba(255, 255, 255, 0.4);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    // Action methods for buttons
    downloadTrack() {
        const audioPlayer = document.getElementById('audioPlayer');
        const audioUrl = audioPlayer.src;
        
        if (!audioUrl || audioUrl === '') {
            this.showNotification('Нет трека для скачивания. Сначала создайте музыку!', 'error');
            return;
        }

        try {
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.href = audioUrl;
            
            // Генерируем имя файла
            const trackTitle = document.getElementById('resultTitle').textContent || 'Generated Track';
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const fileName = `${trackTitle.replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '')}_${timestamp}.mp3`;
            
            link.download = fileName;
            link.style.display = 'none';
            
            // Добавляем в DOM и кликаем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Показываем уведомление
            if (this.remainingCredits <= 0) {
                this.showNotification('🎵 Трек скачан! В бесплатной версии может содержать водяной знак.', 'success');
            } else {
                this.showNotification('🎵 Трек успешно скачан!', 'success');
            }
            
        } catch (error) {
            console.error('Ошибка скачивания:', error);
            
            // Fallback - открываем в новой вкладке
            try {
                window.open(audioUrl, '_blank');
                this.showNotification('Трек открыт в новой вкладке. Сохраните его вручную.', 'info');
            } catch (fallbackError) {
                this.showNotification('Ошибка скачивания. Попробуйте еще раз.', 'error');
            }
        }
    }

    shareTrack() {
        const trackTitle = document.getElementById('resultTitle').textContent;
        const audioPlayer = document.getElementById('audioPlayer');
        
        if (!audioPlayer.src) {
            this.showNotification('Нет трека для публикации. Сначала создайте музыку!', 'error');
            return;
        }
        
        const shareData = {
            title: `🎵 ${trackTitle}`,
            text: `Послушайте мой ${trackTitle}, созданный с помощью SoundMate AI Studio! 🎶`,
            url: window.location.href
        };

        // Пробуем нативный API Share
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).then(() => {
                this.showNotification('Трек успешно опубликован!', 'success');
            }).catch((error) => {
                console.log('Ошибка публикации:', error);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Создаем модальное окно для выбора способа публикации
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: var(--gray-800); padding: 30px; border-radius: 20px; max-width: 400px; text-align: center;">
                <h3 style="margin-bottom: 20px; color: var(--accent);">🎵 Поделиться треком</h3>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button onclick="this.copyToClipboard()" style="padding: 12px 20px; background: var(--accent); border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: 600;">
                        📋 Скопировать ссылку
                    </button>
                    
                    <button onclick="this.shareToTelegram()" style="padding: 12px 20px; background: #0088cc; border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: 600;">
                        📱 Telegram
                    </button>
                    
                    <button onclick="this.shareToVK()" style="padding: 12px 20px; background: #4c75a3; border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: 600;">
                        🌐 ВКонтакте
                    </button>
                    
                    <button onclick="this.shareToWhatsApp()" style="padding: 12px 20px; background: #25d366; border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: 600;">
                        💬 WhatsApp
                    </button>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 8px 16px; background: var(--gray-600); border: none; border-radius: 8px; color: white; cursor: pointer;">
                    Закрыть
                </button>
            </div>
        `;
        
        // Добавляем обработчики
        modal.querySelector('button[onclick="this.copyToClipboard()"]').onclick = () => {
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
                this.showNotification('Ссылка скопирована в буфер обмена!', 'success');
                modal.remove();
            });
        };
        
        modal.querySelector('button[onclick="this.shareToTelegram()"]').onclick = () => {
            const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
            window.open(telegramUrl, '_blank');
            modal.remove();
        };
        
        modal.querySelector('button[onclick="this.shareToVK()"]').onclick = () => {
            const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&description=${encodeURIComponent(shareData.text)}`;
            window.open(vkUrl, '_blank');
            modal.remove();
        };
        
        modal.querySelector('button[onclick="this.shareToWhatsApp()"]').onclick = () => {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
            window.open(whatsappUrl, '_blank');
            modal.remove();
        };
        
        document.body.appendChild(modal);
    }

    regenerateTrack() {
        if (this.remainingCredits > 0) {
            // Добавляем вариативность к промпту для получения нового результата
            const originalPrompt = document.getElementById('musicPrompt').value;
            const variations = [
                'с другой аранжировкой',
                'в альтернативном стиле',
                'с новой интерпретацией',
                'с измененным темпом',
                'с другими инструментами'
            ];
            
            const randomVariation = variations[Math.floor(Math.random() * variations.length)];
            const newPrompt = `${originalPrompt} ${randomVariation}`;
            
            // Временно изменяем промпт
            document.getElementById('musicPrompt').value = newPrompt;
            
            // Генерируем новый трек
            this.generateMusic().then(() => {
                // Возвращаем оригинальный промпт
                document.getElementById('musicPrompt').value = originalPrompt;
            });
            
            this.showNotification('🔄 Создаем новую версию трека...', 'info');
        } else {
            this.showUpgrade();
        }
    }

    upgradeToPremium() {
        // Открываем SunoAPI.org для покупки подписки
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        modal.innerHTML = `
            <div style="background: var(--gray-800); padding: 40px; border-radius: 20px; max-width: 500px; text-align: center; position: relative;">
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #999; font-size: 24px; cursor: pointer;">×</button>
                
                <h2 style="color: var(--accent); margin-bottom: 20px;">🎵 Профессиональная генерация музыки</h2>
                
                <div style="text-align: left; margin-bottom: 30px;">
                    <h3 style="margin-bottom: 15px;">SunoAPI.org предлагает:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 10px; padding: 10px; background: var(--gray-700); border-radius: 10px;">
                            <strong>🎼 До 4 минут</strong> - полноценные композиции
                        </li>
                        <li style="margin-bottom: 10px; padding: 10px; background: var(--gray-700); border-radius: 10px;">
                            <strong>🎤 Вокал + инструменталы</strong> - любой стиль
                        </li>
                        <li style="margin-bottom: 10px; padding: 10px; background: var(--gray-700); border-radius: 10px;">
                            <strong>🖼️ Обложки альбомов</strong> - автоматическая генерация
                        </li>
                        <li style="margin-bottom: 10px; padding: 10px; background: var(--gray-700); border-radius: 10px;">
                            <strong>🎯 Точные промпты</strong> - лучшее понимание
                        </li>
                        <li style="margin-bottom: 10px; padding: 10px; background: var(--gray-700); border-radius: 10px;">
                            <strong>💎 320kbps качество</strong> - профессиональный звук
                        </li>
                    </ul>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="window.open('https://sunoapi.org/ru/billing', '_blank')" style="padding: 12px 24px; background: var(--accent); border: none; border-radius: 20px; cursor: pointer; font-weight: 600; color: white;">
                        🚀 Получить SunoAPI токен
                    </button>
                    <button onclick="window.open('SUNO_API_SETUP.md', '_blank')" style="padding: 12px 24px; background: var(--gray-600); border: none; border-radius: 20px; cursor: pointer; font-weight: 600; color: white;">
                        📖 Инструкция по настройке
                    </button>
                </div>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    Тарифы от $9.90/месяц • Без водяных знаков • Коммерческое использование
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close existing modal if exists
        const existingModal = document.querySelector('.upgrade-modal');
        if (existingModal) existingModal.remove();
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // User avatar click handler
    handleUserAvatarClick() {
        window.location.href = 'dashboard.html';
    }
}

// Global functions for HTML onclick handlers
let studioInstance;

function selectTemplate(template) {
    studioInstance.selectTemplate(template);
}

function generateMusic() {
    studioInstance.generateMusic();
}

function showUpgrade() {
    studioInstance.showUpgrade();
}

function downloadTrack() {
    studioInstance.downloadTrack();
}

function shareTrack() {
    studioInstance.shareTrack();
}

function regenerateTrack() {
    studioInstance.regenerateTrack();
}

function upgradeToPremium() {
    studioInstance.upgradeToPremium();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    studioInstance = new SunoAIStudio();
    
    // Setup user avatar click
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', () => studioInstance.handleUserAvatarClick());
        userAvatar.style.cursor = 'pointer';
    }
    
    console.log('🎵 SoundMate AI Studio ready!');
});