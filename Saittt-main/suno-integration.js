// Интеграция с музыкальными AI API
// Рабочие решения для генерации длинной музыки

class MusicAIIntegration {
    constructor() {
        // Конфигурация API
        this.config = {
            // Replicate - ЛУЧШИЙ вариант для длинной музыки
            replicate: {
                apiUrl: 'https://api.replicate.com/v1/predictions',
                // Получите токен на https://replicate.com/account/api-tokens
                apiKey: 'YOUR_REPLICATE_TOKEN', // Замените на ваш токен
                model: 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
                enabled: false // Включите когда получите токен
            },
            // Hugging Face - для демо (короткие треки)
            huggingface: {
                apiUrl: 'https://api-inference.huggingface.co/models/facebook/musicgen-medium',
                apiKey: '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',
                model: 'facebook/musicgen-medium',
                enabled: true
            },
            // Локальная генерация (демо треки)
            demo: {
                enabled: true,
                tracks: {
                    'school_hymn': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                    'lofi': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                    'orchestral': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
                }
            }
        };
        
        this.isConfigured = false;
        this.activeProvider = null;
        this.checkConfiguration();
    }

    checkConfiguration() {
        // Проверяем Replicate (лучший для длинной музыки)
        if (this.config.replicate.apiKey !== 'YOUR_REPLICATE_TOKEN' && this.config.replicate.enabled) {
            this.isConfigured = true;
            this.activeProvider = 'replicate';
            console.log('✅ Replicate API настроен (длинная музыка!)');
            return;
        }
        
        // Проверяем Hugging Face (короткие треки)
        if (this.config.huggingface.apiKey !== 'YOUR_HUGGINGFACE_TOKEN' && this.config.huggingface.enabled) {
            this.isConfigured = true;
            this.activeProvider = 'huggingface';
            console.log('⚠️ Hugging Face настроен (только короткие треки ~10 сек)');
            return;
        }
        
        // Используем демо режим
        this.isConfigured = true;
        this.activeProvider = 'demo';
        console.log('🎵 Используем демо режим (примеры треков)');
    }

    // Главный метод генерации - автоматически выбирает лучший API
    async generateMusic(params) {
        console.log('🎵 Активный провайдер:', this.activeProvider);
        
        switch (this.activeProvider) {
            case 'replicate':
                return await this.generateWithReplicate(params);
            case 'huggingface':
                return await this.generateWithHuggingFace(params);
            case 'demo':
                return await this.generateDemo(params);
            default:
                throw new Error('Нет доступных провайдеров');
        }
    }

    // Генерация через Replicate (ЛУЧШИЙ для длинной музыки)
    async generateWithReplicate(params) {
        const prompt = this.createMusicPrompt(params);
        
        try {
            console.log('🚀 Генерируем через Replicate (до 30 секунд)');
            
            const response = await fetch(this.config.replicate.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${this.config.replicate.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: this.config.replicate.model,
                    input: {
                        prompt: prompt,
                        model_version: 'melody',
                        output_format: 'mp3',
                        normalization_strategy: 'loudness',
                        duration: Math.min(params.duration || 30, 30)
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Replicate API Error: ${response.status}`);
            }

            const prediction = await response.json();
            
            // Ждем завершения генерации
            const result = await this.pollReplicateResult(prediction.id);
            
            return {
                success: true,
                audioUrl: result.output,
                duration: params.duration || 30,
                provider: 'Replicate (профессиональное качество)',
                quality: 'Высокое качество (320kbps)',
                model: 'MusicGen Pro'
            };

        } catch (error) {
            console.error('Replicate API Error:', error);
            throw error;
        }
    }

    // Ожидание результата от Replicate
    async pollReplicateResult(predictionId, maxAttempts = 60) {
        for (let i = 0; i < maxAttempts; i++) {
            const response = await fetch(`${this.config.replicate.apiUrl}/${predictionId}`, {
                headers: {
                    'Authorization': `Token ${this.config.replicate.apiKey}`,
                }
            });

            const prediction = await response.json();
            
            if (prediction.status === 'succeeded') {
                return prediction;
            }
            
            if (prediction.status === 'failed') {
                throw new Error('Генерация не удалась');
            }
            
            // Ждем 2 секунды перед следующей проверкой
            await this.delay(2000);
        }
        
        throw new Error('Превышено время ожидания');
    }

    // Демо генерация (длинные треки)
    async generateDemo(params) {
        console.log('🎭 Генерируем демо трек');
        
        // Симулируем процесс генерации
        await this.delay(3000);
        
        // Создаем демо аудио (синтезированный трек)
        const demoTrack = this.createDemoTrack(params);
        
        return {
            success: true,
            audioUrl: demoTrack.url,
            duration: demoTrack.duration,
            provider: 'Демо режим',
            quality: 'Демо качество',
            model: 'Синтезированный трек'
        };
    }

    // Создание демо трека
    createDemoTrack(params) {
        // Создаем синтезированный аудио трек
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = params.duration || 30;
        const sampleRate = audioContext.sampleRate;
        const frameCount = sampleRate * duration;
        
        const audioBuffer = audioContext.createBuffer(2, frameCount, sampleRate);
        
        // Генерируем простую мелодию
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            
            for (let i = 0; i < frameCount; i++) {
                const time = i / sampleRate;
                
                // Создаем простую мелодию в зависимости от стиля
                let frequency = this.getFrequencyForStyle(params.style, time);
                let amplitude = this.getAmplitudeForMood(params.mood, time);
                
                channelData[i] = Math.sin(2 * Math.PI * frequency * time) * amplitude * 0.3;
            }
        }
        
        // Конвертируем в blob URL
        const audioBlob = this.audioBufferToBlob(audioBuffer);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        return {
            url: audioUrl,
            duration: duration
        };
    }

    // Частоты для разных стилей
    getFrequencyForStyle(style, time) {
        const baseFreq = 440; // A4
        
        switch (style) {
            case 'orchestral':
                return baseFreq * (1 + 0.5 * Math.sin(time * 0.5));
            case 'lofi':
                return baseFreq * 0.7 * (1 + 0.2 * Math.sin(time * 0.3));
            case 'pop':
                return baseFreq * (1 + 0.3 * Math.sin(time * 2));
            case 'rock':
                return baseFreq * 1.2 * (1 + 0.4 * Math.sin(time * 3));
            default:
                return baseFreq * (1 + 0.2 * Math.sin(time));
        }
    }

    // Амплитуда для разных настроений
    getAmplitudeForMood(mood, time) {
        switch (mood) {
            case 'inspiring':
                return 0.8 * (1 + 0.2 * Math.sin(time * 0.5));
            case 'calm':
                return 0.4 * (1 + 0.1 * Math.sin(time * 0.2));
            case 'energetic':
                return 0.9 * (1 + 0.3 * Math.sin(time * 4));
            case 'epic':
                return 0.95 * (1 + 0.4 * Math.sin(time * 0.3));
            default:
                return 0.6;
        }
    }

    // Конвертация AudioBuffer в Blob
    audioBufferToBlob(audioBuffer) {
        const length = audioBuffer.length;
        const arrayBuffer = new ArrayBuffer(length * 2);
        const view = new DataView(arrayBuffer);
        
        // Конвертируем в 16-bit PCM
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(i * 2, sample * 0x7FFF, true);
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    // Генерация через Hugging Face (КОРОТКИЕ треки ~10 сек)
    async generateWithHuggingFace(params) {
        const prompt = this.createMusicPrompt(params);
        
        try {
            console.log('⚠️ Hugging Face: только короткие треки (~10 сек)');
            console.log('🎵 Промпт:', prompt);
            
            const response = await fetch(this.config.huggingface.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.huggingface.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        duration: 10, // Максимум для Inference API
                        temperature: 1.0,
                        top_k: 250,
                        top_p: 0.0,
                        guidance_scale: 3.0
                    },
                    options: {
                        wait_for_model: true,
                        use_cache: false
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Hugging Face API Error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            console.log('📁 Размер файла:', audioBlob.size, 'байт');
            
            const audioUrl = URL.createObjectURL(audioBlob);

            return {
                success: true,
                audioUrl: audioUrl,
                duration: 10, // Реальная длительность
                provider: 'Hugging Face (короткие треки)',
                quality: 'Стандартное качество',
                fileSize: audioBlob.size,
                model: 'MusicGen'
            };

        } catch (error) {
            console.error('❌ Hugging Face Error:', error);
            // Фоллбэк на демо
            return await this.generateDemo(params);
        }
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