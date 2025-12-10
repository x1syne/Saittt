// Интеграция с музыкальными AI API
// Поддержка Hugging Face, Mubert и других сервисов

class MusicAIIntegration {
    constructor() {
        // Конфигурация API
        this.config = {
            // Hugging Face - БЕСПЛАТНО и просто!
            huggingface: {
                // Используем официальную модель Suno Bark!
                apiUrl: 'https://api-inference.huggingface.co/models/suno/bark',
                // Получите токен на https://huggingface.co/settings/tokens
                apiKey: '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', // Ваш токен Hugging Face
                model: 'suno/bark', // Официальная модель Suno!
                fallbackModel: 'facebook/musicgen-small' // Запасная модель
            },
            // Mubert - платный, но качественный
            mubert: {
                apiUrl: 'https://api-b2b.mubert.com/v2/RecordTrack',
                apiKey: 'YOUR_MUBERT_API_KEY',
                email: 'YOUR_EMAIL'
            }
        };
        
        this.isConfigured = false;
        this.activeProvider = null;
        this.checkConfiguration();
    }

    checkConfiguration() {
        // Проверяем Hugging Face (приоритет)
        if (this.config.huggingface.apiKey !== 'YOUR_HUGGINGFACE_TOKEN') {
            this.isConfigured = true;
            this.activeProvider = 'huggingface';
            console.log('✅ Hugging Face API настроен (бесплатно!)');
            return;
        }
        
        // Проверяем Mubert как запасной вариант
        if (this.config.mubert.apiKey !== 'YOUR_MUBERT_API_KEY') {
            this.isConfigured = true;
            this.activeProvider = 'mubert';
            console.log('✅ Mubert API настроен');
            return;
        }
        
        console.warn('⚠️ Нужно настроить API ключи (рекомендуется Hugging Face - бесплатно)');
    }

    // Главный метод генерации - автоматически выбирает лучший API
    async generateMusic(params) {
        if (!this.isConfigured) {
            throw new Error('API ключи не настроены');
        }

        switch (this.activeProvider) {
            case 'huggingface':
                return await this.generateWithHuggingFace(params);
            case 'mubert':
                return await this.generateWithMubert(params);
            default:
                throw new Error('Нет доступных провайдеров');
        }
    }

    // Генерация через Hugging Face с Suno Bark (БЕСПЛАТНО!)
    async generateWithHuggingFace(params) {
        const prompt = this.createSunoBarkPrompt(params);
        
        try {
            // Пробуем сначала Suno Bark
            let response = await this.tryHuggingFaceModel(this.config.huggingface.apiUrl, prompt, params);
            
            if (!response.ok && this.config.huggingface.fallbackModel) {
                console.log('Пробуем запасную модель...');
                // Если Suno Bark недоступен, используем MusicGen
                const fallbackUrl = `https://api-inference.huggingface.co/models/${this.config.huggingface.fallbackModel}`;
                response = await this.tryHuggingFaceModel(fallbackUrl, this.createMusicPrompt(params), params);
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Hugging Face возвращает аудио как blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const modelUsed = response.url.includes('suno/bark') ? 'Suno Bark' : 'MusicGen';

            return {
                success: true,
                audioUrl: audioUrl,
                duration: params.duration || 30,
                provider: `${modelUsed} (бесплатно)`,
                quality: modelUsed === 'Suno Bark' ? 'Высокое (Suno)' : 'Стандартное'
            };

        } catch (error) {
            console.error('Hugging Face API Error:', error);
            throw new Error(`Ошибка Hugging Face: ${error.message}`);
        }
    }

    // Вспомогательный метод для запроса к Hugging Face
    async tryHuggingFaceModel(apiUrl, prompt, params) {
        return await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.huggingface.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_length: Math.min(params.duration || 30, 30), // Макс 30 сек
                    temperature: 0.8,
                    do_sample: true
                }
            })
        });
    }

    // Создание промпта специально для Suno Bark
    createSunoBarkPrompt(params) {
        // Suno Bark понимает более сложные промпты с эмоциями и стилями
        const barkPrompts = {
            'orchestral': '♪ [classical orchestral music with strings and brass, majestic and powerful] ♪',
            'lofi': '♪ [chill lofi hip hop beats, soft piano, vinyl crackle, relaxing] ♪',
            'pop': '♪ [upbeat pop music, catchy melody, modern production] ♪',
            'rock': '♪ [energetic rock music, electric guitars, driving drums] ♪',
            'electronic': '♪ [electronic dance music, synthesizers, pulsing bass] ♪',
            'jazz': '♪ [smooth jazz, piano and saxophone, sophisticated] ♪',
            'classical': '♪ [classical piano composition, elegant and refined] ♪',
            'hip-hop': '♪ [hip hop beats, bass and drums, urban style] ♪'
        };

        const moodModifiers = {
            'inspiring': 'uplifting and motivational',
            'happy': 'joyful and cheerful',
            'calm': 'peaceful and serene',
            'epic': 'dramatic and cinematic',
            'energetic': 'dynamic and powerful',
            'melancholic': 'emotional and contemplative'
        };

        let prompt = barkPrompts[params.style] || '♪ [instrumental music] ♪';
        
        // Добавляем настроение
        if (params.mood && moodModifiers[params.mood]) {
            prompt = prompt.replace('] ♪', `, ${moodModifiers[params.mood]}] ♪`);
        }

        // Специальный промпт для школьного гимна
        if (params.template === 'school_hymn') {
            prompt = '♪ [solemn school anthem with choir and orchestra, ceremonial and inspiring, patriotic] ♪';
        }

        return prompt;
    }

    // Генерация музыки через Mubert API
    async generateWithMubert(params) {
        const requestData = {
            method: "RecordTrack",
            params: {
                pat: this.config.mubert.apiKey,
                email: this.config.mubert.email,
                bitrate: 320,
                format: "mp3",
                duration: params.duration || 120,
                tags: this.convertToMubertTags(params),
                mode: "track"
            }
        };

        try {
            const response = await fetch(this.config.mubert.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            
            if (result.status === 1) {
                return await this.pollForResult(result.data.tasks[0].id);
            } else {
                throw new Error(result.error || 'Ошибка генерации');
            }
        } catch (error) {
            console.error('Mubert API Error:', error);
            throw error;
        }
    }

    // Создание промпта для Hugging Face
    createMusicPrompt(params) {
        const styleDescriptions = {
            'orchestral': 'classical orchestral music with strings and brass',
            'lofi': 'lofi hip hop beats with soft piano and vinyl crackle',
            'pop': 'upbeat pop music with catchy melody',
            'rock': 'energetic rock music with electric guitars and drums',
            'electronic': 'electronic dance music with synthesizers',
            'jazz': 'smooth jazz with piano and saxophone',
            'classical': 'classical piano composition',
            'hip-hop': 'hip hop beats with bass and drums'
        };

        const moodDescriptions = {
            'inspiring': 'uplifting and motivational',
            'happy': 'joyful and cheerful',
            'calm': 'peaceful and relaxing',
            'epic': 'dramatic and powerful',
            'energetic': 'dynamic and energetic',
            'melancholic': 'sad and emotional'
        };

        let prompt = styleDescriptions[params.style] || 'instrumental music';
        
        if (params.mood && moodDescriptions[params.mood]) {
            prompt += `, ${moodDescriptions[params.mood]}`;
        }

        // Добавляем специфику для школьного гимна
        if (params.template === 'school_hymn') {
            prompt = 'solemn school anthem with choir and orchestra, ceremonial and inspiring';
        }

        return prompt;
    }

    // Конвертация параметров в теги Mubert
    convertToMubertTags(params) {
        const styleMap = {
            'orchestral': 'classical,orchestral,epic',
            'lofi': 'lofi,chill,ambient',
            'pop': 'pop,upbeat,modern',
            'rock': 'rock,guitar,energetic',
            'electronic': 'electronic,synth,digital',
            'jazz': 'jazz,smooth,sophisticated',
            'classical': 'classical,piano,elegant',
            'hip-hop': 'hiphop,urban,beats'
        };

        const moodMap = {
            'inspiring': 'uplifting,motivational',
            'happy': 'happy,joyful,positive',
            'calm': 'calm,peaceful,relaxing',
            'epic': 'epic,dramatic,powerful',
            'energetic': 'energetic,dynamic,active',
            'melancholic': 'melancholic,sad,emotional'
        };

        let tags = [];
        
        if (params.style && styleMap[params.style]) {
            tags.push(styleMap[params.style]);
        }
        
        if (params.mood && moodMap[params.mood]) {
            tags.push(moodMap[params.mood]);
        }

        return tags.join(',');
    }

    // Ожидание результата генерации
    async pollForResult(taskId, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            await this.delay(5000); // Ждем 5 секунд

            const statusResponse = await fetch(this.config.mubert.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: "GetTaskStatus",
                    params: {
                        pat: this.config.mubert.apiKey,
                        email: this.config.mubert.email,
                        task_id: taskId
                    }
                })
            });

            const statusResult = await statusResponse.json();
            
            if (statusResult.data && statusResult.data.status === "Done") {
                return {
                    success: true,
                    audioUrl: statusResult.data.result.audio_url,
                    taskId: taskId,
                    duration: statusResult.data.result.duration
                };
            }
            
            if (statusResult.data && statusResult.data.status === "Error") {
                throw new Error('Ошибка генерации трека');
            }
        }
        
        throw new Error('Превышено время ожидания генерации');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Экспорт для использования в studio.js
window.MusicAIIntegration = MusicAIIntegration;