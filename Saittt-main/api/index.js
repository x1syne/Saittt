// server.js - ПОЛНАЯ ВЕРСИЯ ДЛЯ VERCEL
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Конфигурация Spotify из переменных окружения Vercel
const SPOTIFY_CONFIG = {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI || 'https://saittt.vercel.app/auth/spotify/callback',
    scopes: [
        'user-read-email',
        'user-read-private',
        'user-top-read',
        'playlist-read-private'
    ].join(' ')
};

// ==================== МАРШРУТЫ ====================

// 1. Главная страница (проверка работы)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SoundMate Backend</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
                    color: white;
                    margin: 0;
                    padding: 40px;
                    min-height: 100vh;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                h1 {
                    color: #1DB954;
                    margin-bottom: 30px;
                }
                .btn {
                    display: inline-block;
                    background: #1DB954;
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: bold;
                    font-size: 18px;
                    margin: 10px;
                    transition: transform 0.3s;
                }
                .btn:hover {
                    transform: scale(1.05);
                    background: #1ed760;
                }
                .status {
                    background: #333;
                    padding: 15px;
                    border-radius: 10px;
                    margin: 20px 0;
                    font-family: monospace;
                }
                .success { color: #1DB954; }
                .error { color: #ff4444; }
                .info { color: #44aaff; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎵 SoundMate Backend работает на Vercel! ✅</h1>
                
                <div class="status">
                    <p><strong>🔄 Проверка конфигурации:</strong></p>
                    <p class="${SPOTIFY_CONFIG.clientId ? 'success' : 'error'}">
                        • Spotify Client ID: ${SPOTIFY_CONFIG.clientId ? '✅ Установлен' : '❌ ОТСУТСТВУЕТ'}
                    </p>
                    <p class="${SPOTIFY_CONFIG.clientSecret ? 'success' : 'error'}">
                        • Spotify Client Secret: ${SPOTIFY_CONFIG.clientSecret ? '✅ Установлен' : '❌ ОТСУТСТВУЕТ'}
                    </p>
                    <p class="info">
                        • Redirect URI: ${SPOTIFY_CONFIG.redirectUri}
                    </p>
                    <p class="info">
                        • Окружение: ${process.env.NODE_ENV || 'production'}
                    </p>
                </div>
                
                <h2>🔗 Быстрые ссылки:</h2>
                <p>
                    <a class="btn" href="/auth/spotify">
                        🎵 Войти через Spotify
                    </a>
                    <a class="btn" href="/test-api" style="background: #666;">
                        🔧 Тест API
                    </a>
                </p>
                
                <h2>📚 Документация API:</h2>
                <ul>
                    <li><a href="/auth/spotify" style="color: #1DB954;">/auth/spotify</a> - Авторизация Spotify</li>
                    <li><a href="/test-api" style="color: #1DB954;">/test-api</a> - Тест работы API</li>
                    <li><a href="/api/top-tracks" style="color: #1DB954;">/api/top-tracks</a> - Топ-треки пользователя</li>
                </ul>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #444;">
                    <p style="color: #aaa; font-size: 14px;">
                        Домен бэкенда: ${req.headers.host}<br>
                        Текущее время: ${new Date().toLocaleString('ru-RU')}
                    </p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 2. Начало авторизации Spotify
app.get('/auth/spotify', (req, res) => {
    console.log('🔐 Начало авторизации Spotify');
    
    const authUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CONFIG.clientId,
        scope: SPOTIFY_CONFIG.scopes,
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        show_dialog: true
    });
    
    console.log('Redirect URL:', authUrl);
    res.redirect(authUrl);
});

// 3. Callback от Spotify
app.get('/auth/spotify/callback', async (req, res) => {
    console.log('🎯 Получен callback от Spotify');
    
    try {
        const { code, error } = req.query;
        
        if (error) {
            throw new Error(`Spotify error: ${error}`);
        }
        
        if (!code) {
            throw new Error('No authorization code received');
        }

        console.log('🔄 Обмениваем код на access token...');
        
        // Получаем access token
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: SPOTIFY_CONFIG.redirectUri,
                client_id: SPOTIFY_CONFIG.clientId,
                client_secret: SPOTIFY_CONFIG.clientSecret
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        
        console.log('✅ Access token получен!');
        
        // Получаем данные пользователя
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const userData = {
            spotifyId: userResponse.data.id,
            displayName: userResponse.data.display_name || 'Spotify User',
            email: userResponse.data.email,
            profileImage: userResponse.data.images?.[0]?.url || 'https://i.pravatar.cc/150',
            country: userResponse.data.country || 'US',
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in
        };

        console.log(`👤 Пользователь авторизован: ${userData.displayName}`);
        
        // Перенаправляем на фронтенд с данными
        // ВАЖНО: Используйте правильный URL вашего GitHub Pages
        const frontendUrl = `https://x1syne.github.io/Saittt/Saittt-main/callback.html?` + 
                          `token=${access_token}&` +
                          `name=${encodeURIComponent(userData.displayName)}&` +
                          `email=${encodeURIComponent(userData.email || '')}&` +
                          `image=${encodeURIComponent(userData.profileImage)}`;
        
        console.log('Перенаправляем на:', frontendUrl);
        res.redirect(frontendUrl);
        
    } catch (error) {
        console.error('❌ Ошибка авторизации:', error.response?.data || error.message);
        
        // Отправляем красивую страницу ошибки
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ошибка авторизации</title>
                <style>
                    body {
                        font-family: Arial;
                        padding: 40px;
                        background: #ff4444;
                        color: white;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: rgba(0,0,0,0.8);
                        padding: 30px;
                        border-radius: 10px;
                    }
                    a {
                        color: #1DB954;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>❌ Ошибка авторизации Spotify</h1>
                    <p><strong>Сообщение:</strong> ${error.message}</p>
                    ${error.response?.data ? 
                        `<pre style="background: #333; padding: 15px; border-radius: 5px;">
                            ${JSON.stringify(error.response.data, null, 2)}
                        </pre>` : ''
                    }
                    <p><a href="/">Вернуться на главную</a></p>
                    <p><a href="/auth/spotify">Попробовать снова</a></p>
                </div>
            </body>
            </html>
        `);
    }
});

// 4. Тестовый маршрут для проверки API
app.get('/test-api', (req, res) => {
    const serverUrl = `https://${req.headers.host}`;
    
    res.json({
        status: 'success',
        message: 'SoundMate API работает корректно',
        timestamp: new Date().toISOString(),
        server: {
            host: req.headers.host,
            url: serverUrl,
            environment: process.env.NODE_ENV || 'production'
        },
        spotifyConfig: {
            hasClientId: !!SPOTIFY_CONFIG.clientId,
            hasClientSecret: !!SPOTIFY_CONFIG.clientSecret,
            redirectUri: SPOTIFY_CONFIG.redirectUri,
            scopes: SPOTIFY_CONFIG.scopes.split(' ')
        },
        endpoints: {
            auth: `${serverUrl}/auth/spotify`,
            callback: `${serverUrl}/auth/spotify/callback`,
            topTracks: `${serverUrl}/api/top-tracks`
        }
    });
});

// 5. Получение топ-артистов пользователя
app.get('/api/top-artists', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Требуется токен авторизации',
            hint: 'Добавьте header: Authorization: Bearer YOUR_TOKEN'
        });
    }
    
    try {
        const response = await axios.get(
            'https://api.spotify.com/v1/me/top/artists?limit=20',
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const artists = response.data.items.map(artist => ({
            id: artist.id,
            name: artist.name,
            genres: artist.genres,
            image: artist.images[0]?.url,
            popularity: artist.popularity,
            followers: artist.followers?.total
        }));
        
        res.json({
            success: true,
            count: artists.length,
            artists: artists,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка получения артистов:', error.response?.data || error.message);
        res.status(401).json({ 
            error: 'Не удалось получить данные из Spotify',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 6. Получение топ-треков пользователя
app.get('/api/top-tracks', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Требуется токен авторизации',
            hint: 'Добавьте header: Authorization: Bearer YOUR_TOKEN'
        });
    }
    
    try {
        const response = await axios.get(
            'https://api.spotify.com/v1/me/top/tracks?limit=10',
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const tracks = response.data.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            artists: track.artists.map(a => ({ name: a.name, id: a.id })),
            album: track.album.name,
            image: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            duration: track.duration_ms,
            popularity: track.popularity
        }));
        
        res.json({
            success: true,
            count: tracks.length,
            tracks: tracks,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка получения треков:', error.response?.data || error.message);
        res.status(401).json({ 
            error: 'Не удалось получить данные из Spotify',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 7. Получение информации о пользователе
app.get('/api/user-info', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        res.json({
            success: true,
            user: {
                id: response.data.id,
                displayName: response.data.display_name,
                email: response.data.email,
                country: response.data.country,
                image: response.data.images?.[0]?.url,
                followers: response.data.followers?.total,
                product: response.data.product
            }
        });
        
    } catch (error) {
        res.status(401).json({ error: 'Неверный токен Spotify' });
    }
});

// 8. Маршрут для проверки здоровья сервера
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'soundmate-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ==================== ЗАПУСК СЕРВЕРА ====================

const PORT = process.env.PORT || 3000;

// ЭТА СТРОКА ОБЯЗАТЕЛЬНА для Vercel!
module.exports = app;

// Локальный запуск (если не на Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Сервер запущен на порту ${PORT}`);
    });
}
    
