// Интеграция с музыкальными AI API
// Поддержка Hugging Face, Mubert и других сервисов

class MusicAIIntegration {
    constructor() {
        // Конфигурация API
        this.config = {
            // Hugging Face - БЕСПЛАТНО и просто!
            huggingface: {
                // Используем MusicGen для генерации музыки
                apiUrl: 'https://api-inference.huggingface.co/models/facebook/musicgen-large',
                // Получите токен на https://huggingface.co/settings/tokens
                apiKey: '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', // Ваш токен Hugging Face
                model: 'facebook/musicgen-large', // Лучшая модель для музыки
                fallbackModel: 'facebook/musicgen-medium' // Запасная модель
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
            console.log('🎵 Генерируем музыку с промптом:', prompt);
            console.log('📊 Параметры:', params);
            console.log('🔗 Используем модель:', this.config.huggingface.apiUrl);
            console.log('🎯 Это Suno Bark:', this.config.huggingface.apiUrl.includes('suno/bark'));
            
            // Список моделей для попытки (от лучшей к простой)
            const modelsToTry = [
                'facebook/musicgen-large',
                'facebook/musicgen-medium', 
                'facebook/musicgen-small'
            ];
            
            let response = null;
            let usedModel = null;
            
            // Пробуем модели по очереди
            for (const model of modelsToTry) {
                const modelUrl = `https://api-inference.huggingface.co/models/${model}`;
                console.log(`🎵 Пробуем модель: ${model}`);
                
                try {
                    response = await this.tryHuggingFaceModel(modelUrl, prompt, params);
                    
                    if (response.ok) {
                        usedModel = model;
                        console.log(`✅ Модель ${model} работает!`);
                        break;
                    } else {
                        console.warn(`⚠️ Модель ${model} недоступна:`, response.status);
                    }
                } catch (error) {
                    console.warn(`⚠️ Ошибка модели ${model}:`, error.message);
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Полная ошибка:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            // Проверяем размер ответа
            const audioBlob = await response.blob();
            console.log('📁 Размер аудио файла:', audioBlob.size, 'байт');
            
            if (audioBlob.size < 50000) { // Менее 50KB = слишком короткий трек
                console.error('❌ Файл слишком маленький:', audioBlob.size, 'байт');
                throw new Error(`Сгенерированный файл слишком короткий (${audioBlob.size} байт). Попробуйте другой промпт или модель.`);
            }
            
            // Проверяем что это действительно аудио
            if (!audioBlob.type.startsWith('audio/')) {
                console.error('❌ Получен не аудио файл:', audioBlob.type);
                const text = await audioBlob.text();
                console.error('📄 Содержимое ответа:', text);
                throw new Error(`Получен не аудио файл: ${audioBlob.type}`);
            }

            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('✅ Аудио URL создан:', audioUrl);

            return {
                success: true,
                audioUrl: audioUrl,
                duration: params.duration || 30,
                provider: `${usedModel} (бесплатно)`,
                quality: usedModel.includes('large') ? 'Высокое качество' : 'Стандартное качество',
                fileSize: audioBlob.size,
                model: usedModel
            };

        } catch (error) {
            console.error('❌ Hugging Face API Error:', error);
            throw new Error(`Ошибка генерации: ${error.message}`);
        }
    }

    // Вспомогательный метод для запроса к Hugging Face
    async tryHuggingFaceModel(apiUrl, prompt, params) {
        console.log('🔗 Отправляем запрос на:', apiUrl);
        console.log('📝 Промпт:', prompt);
        
        const requestBody = {
            inputs: prompt,
            parameters: {
                // Параметры специально для MusicGen
                duration: Math.min(params.duration || 30, 30),
                temperature: 1.0,
                top_k: 250,
                top_p: 0.0,
                guidance_scale: 3.0,
                max_new_tokens: 1024,
                do_sample: true
            },
            options: {
                wait_for_model: true,
                use_cache: false
            }
        };
        
        console.log('📊 Параметры запроса:', requestBody);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.huggingface.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📡 Статус ответа:', response.status, response.statusText);
        return response;
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

    // Создание промпта для Hugging Face MusicGen
    createMusicPrompt(params) {
        const styleDescriptions = {
            'orchestral': 'orchestral classical music, full symphony orchestra, strings, brass, woodwinds, 120 bpm',
            'lofi': 'lofi hip hop, chill beats, soft piano, vinyl crackle, relaxing atmosphere, 80 bpm',
            'pop': 'upbeat pop music, catchy melody, modern production, synthesizers, 128 bpm',
            'rock': 'rock music, electric guitar, bass guitar, drums, energetic, 140 bpm',
            'electronic': 'electronic dance music, synthesizers, electronic beats, bass drops, 130 bpm',
            'jazz': 'smooth jazz, piano, saxophone, double bass, swing rhythm, 100 bpm',
            'classical': 'classical piano composition, solo piano, elegant melodies, 90 bpm',
            'hip-hop': 'hip hop instrumental, strong bass, trap beats, 85 bpm'
        };

        const moodDescriptions = {
            'inspiring': 'uplifting, motivational, positive energy',
            'happy': 'joyful, cheerful, bright, major key',
            'calm': 'peaceful, serene, relaxing, ambient',
            'epic': 'dramatic, cinematic, powerful, grand',
            'energetic': 'dynamic, high energy, driving rhythm',
            'melancholic': 'sad, emotional, minor key, contemplative'
        };

        let prompt = styleDescriptions[params.style] || 'instrumental music, medium tempo';
        
        if (params.mood && moodDescriptions[params.mood]) {
            prompt += `, ${moodDescriptions[params.mood]}`;
        }

        // Добавляем длительность в промпт
        prompt += `, 30 seconds duration, full composition`;

        // Специальный промпт для школьного гимна
        if (params.template === 'school_hymn') {
            prompt = 'orchestral anthem, solemn and inspiring, brass section, string section, ceremonial march, patriotic, major key, full orchestral arrangement';
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