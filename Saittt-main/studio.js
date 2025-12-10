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
        console.log('🎵 SoundMate AI Studio initialized');
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
                    // Attempt real API generation
                    result = await musicAI.generateMusic(generationData);
                    generationData.audioUrl = result.audioUrl;
                    generationData.isReal = true;
                    generationData.provider = result.provider;
                    generationData.quality = result.quality;
                    
                    this.showNotification(`🎵 Трек создан с помощью ${result.provider}!`, 'success');
                } catch (apiError) {
                    console.warn('API недоступен, используем демо:', apiError.message);
                    // Fallback to simulation
                    await this.simulateSunoAPI(generationData);
                    generationData.isReal = false;
                    
                    this.showNotification('🎵 Демо-трек создан (настройте API для реальной генерации)', 'info');
                }
            } else {
                // No API integration available
                await this.simulateSunoAPI(generationData);
                generationData.isReal = false;
                
                this.showNotification('🎵 Демо-трек создан', 'info');
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
        // In production, this would return the actual Suno AI generated audio URL
        const demoUrls = {
            orchestral: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            lofi: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            pop: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            rock: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            electronic: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        };
        return demoUrls[style] || demoUrls.orchestral;
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
        if (this.remainingCredits <= 0) {
            this.showUpgrade();
            return;
        }
        this.showNotification('В бесплатной версии скачивание недоступно. Перейдите на Premium для скачивания без водяных знаков.', 'warning');
    }

    shareTrack() {
        const trackTitle = document.getElementById('resultTitle').textContent;
        const shareData = {
            title: trackTitle,
            text: `Послушайте мой ${trackTitle}, созданный с помощью SoundMate AI Studio!`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            this.showNotification('Ссылка скопирована в буфер обмена!', 'success');
        }
    }

    regenerateTrack() {
        if (this.remainingCredits > 0) {
            this.generateMusic();
        } else {
            this.showUpgrade();
        }
    }

    upgradeToPremium() {
        // In production, integrate with payment system
        this.showNotification('Переход на Premium (интеграция с платежной системой в разработке)', 'info');
        
        // Close modal if exists
        const modal = document.querySelector('.upgrade-modal');
        if (modal) modal.remove();
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