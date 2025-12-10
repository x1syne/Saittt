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

// 8. Получение альбомов пользователя
app.get('/api/user-albums', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        const response = await axios.get(
            'https://api.spotify.com/v1/me/albums?limit=20',
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        const albums = response.data.items.map(item => ({
            id: item.album.id,
            name: item.album.name,
            artist: item.album.artists[0].name,
            artists: item.album.artists.map(a => ({ name: a.name, id: a.id })),
            image: item.album.images[0]?.url,
            releaseDate: item.album.release_date,
            totalTracks: item.album.total_tracks,
            addedAt: item.added_at
        }));
        
        res.json({
            success: true,
            count: albums.length,
            albums: albums,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка получения альбомов:', error.response?.data || error.message);
        res.status(401).json({ 
            error: 'Не удалось получить альбомы из Spotify',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 9. Получение плейлистов пользователя
app.get('/api/user-playlists', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        const response = await axios.get(
            'https://api.spotify.com/v1/me/playlists?limit=20',
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        const playlists = response.data.items.map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            description: playlist.description || 'Плейлист пользователя',
            image: playlist.images[0]?.url,
            tracks: playlist.tracks.total,
            owner: playlist.owner.display_name,
            public: playlist.public,
            collaborative: playlist.collaborative
        }));
        
        res.json({
            success: true,
            count: playlists.length,
            playlists: playlists,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка получения плейлистов:', error.response?.data || error.message);
        res.status(401).json({ 
            error: 'Не удалось получить плейлисты из Spotify',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 10. Получение недавно прослушанных треков
app.get('/api/recently-played', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        const response = await axios.get(
            'https://api.spotify.com/v1/me/player/recently-played?limit=50',
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        const tracks = response.data.items.map(item => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists[0].name,
            album: item.track.album.name,
            image: item.track.album.images[0]?.url,
            playedAt: item.played_at,
            duration: item.track.duration_ms
        }));
        
        // Подсчитываем статистику
        const totalMinutes = tracks.reduce((sum, track) => sum + track.duration, 0) / 60000;
        const uniqueArtists = [...new Set(tracks.map(t => t.artist))].length;
        const uniqueAlbums = [...new Set(tracks.map(t => t.album))].length;
        
        res.json({
            success: true,
            count: tracks.length,
            tracks: tracks,
            statistics: {
                totalTracks: tracks.length,
                totalMinutes: Math.round(totalMinutes),
                uniqueArtists: uniqueArtists,
                uniqueAlbums: uniqueAlbums
            },
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка получения истории:', error.response?.data || error.message);
        res.status(401).json({ 
            error: 'Не удалось получить историю прослушиваний из Spotify',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 11. Получение жанров пользователя
app.get('/api/user-genres', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        // Получаем топ артистов для анализа жанров
        const response = await axios.get(
            'https://api.spotify.com/v1/me/top/artists?limit=50',
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        // Собираем все жанры
        const allGenres = [];
        response.data.items.forEach(artist => {
            allGenres.push(...artist.genres);
        });
        
        // Подсчитываем частоту жанров
        const genreCount = {};
        allGenres.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
        
        // Сортируем по популярности
        const sortedGenres = Object.entries(genreCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([genre, count]) => ({ genre, count }));
        
        res.json({
            success: true,
            genres: sortedGenres,
            totalGenres: Object.keys(genreCount).length,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка получения жанров:', error.response?.data || error.message);
        res.status(401).json({ 
            error: 'Не удалось получить жанры из Spotify',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// 12. Поиск пользователей по музыкальной совместимости
app.get('/api/find-users', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    const { genre, location, compatibility } = req.query;
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        // Получаем данные текущего пользователя для анализа совместимости
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const currentUser = userResponse.data;
        
        // Получаем топ артистов пользователя для анализа
        const artistsResponse = await axios.get(
            'https://api.spotify.com/v1/me/top/artists?limit=50',
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        const userGenres = [];
        artistsResponse.data.items.forEach(artist => {
            userGenres.push(...artist.genres);
        });
        
        // Генерируем похожих пользователей (в реальном приложении это была бы база данных)
        const similarUsers = generateSimilarUsers(currentUser, userGenres, { genre, location, compatibility });
        
        res.json({
            success: true,
            currentUser: {
                id: currentUser.id,
                name: currentUser.display_name,
                genres: [...new Set(userGenres)].slice(0, 5)
            },
            users: similarUsers,
            filters: { genre, location, compatibility },
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка поиска пользователей:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Не удалось найти пользователей',
            details: error.message
        });
    }
});

// 13. Отправка запроса в друзья
app.post('/api/friend-request', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { targetUserId, message } = req.body;
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        // Получаем данные отправителя
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const sender = userResponse.data;
        
        // В реальном приложении здесь была бы запись в базу данных
        // Пока что просто возвращаем успешный ответ
        
        res.json({
            success: true,
            message: 'Запрос в друзья отправлен',
            request: {
                from: sender.display_name,
                to: targetUserId,
                message: message || 'Привет! Давайте дружить и создавать музыку вместе!',
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Ошибка отправки запроса:', error);
        res.status(500).json({ 
            error: 'Не удалось отправить запрос в друзья',
            details: error.message
        });
    }
});

// 14. Получение списка друзей
app.get('/api/friends', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }
    
    try {
        // В реальном приложении здесь был бы запрос к базе данных
        // Пока генерируем демо-друзей
        const friends = generateDemoFriends();
        
        res.json({
            success: true,
            friends: friends,
            count: friends.length,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка получения друзей:', error);
        res.status(500).json({ 
            error: 'Не удалось получить список друзей',
            details: error.message
        });
    }
});

// Вспомогательные функции для генерации данных
function generateSimilarUsers(currentUser, userGenres, filters) {
    const names = ['Алексей Музыкант', 'Мария Певица', 'Дмитрий Продюсер', 'Анна Композитор', 'Иван Гитарист', 'Елена Пианистка'];
    const cities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород'];
    const instruments = ['Гитара', 'Фортепиано', 'Вокал', 'Барабаны', 'Бас-гитара', 'Синтезатор'];
    const allGenres = ['pop', 'rock', 'electronic', 'hip-hop', 'jazz', 'classical', 'indie', 'folk'];
    
    return Array.from({length: 8}, (_, i) => {
        const compatibility = Math.floor(Math.random() * 30 + 70); // 70-100%
        const commonGenres = userGenres.slice(0, Math.floor(Math.random() * 3 + 1));
        
        return {
            id: `user_${i + 1}`,
            name: names[i % names.length],
            avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
            location: cities[Math.floor(Math.random() * cities.length)],
            compatibility: compatibility,
            commonGenres: commonGenres.length > 0 ? commonGenres : [allGenres[Math.floor(Math.random() * allGenres.length)]],
            instruments: [instruments[Math.floor(Math.random() * instruments.length)]],
            mutualFriends: Math.floor(Math.random() * 15),
            lastActive: `${Math.floor(Math.random() * 24)} часов назад`,
            bio: `Музыкант из ${cities[Math.floor(Math.random() * cities.length)]}. Люблю создавать музыку и искать новые звуки.`
        };
    }).sort((a, b) => b.compatibility - a.compatibility);
}

function generateDemoFriends() {
    const friends = [
        {
            id: 'friend_1',
            name: 'Алексей Петров',
            avatar: 'https://i.pravatar.cc/150?img=1',
            status: 'online',
            lastSeen: 'Сейчас онлайн',
            compatibility: 94,
            commonTracks: 127,
            location: 'Москва',
            instruments: ['Гитара', 'Вокал']
        },
        {
            id: 'friend_2', 
            name: 'Мария Иванова',
            avatar: 'https://i.pravatar.cc/150?img=2',
            status: 'offline',
            lastSeen: '2 часа назад',
            compatibility: 89,
            commonTracks: 89,
            location: 'СПб',
            instruments: ['Фортепиано']
        },
        {
            id: 'friend_3',
            name: 'Дмитрий Козлов', 
            avatar: 'https://i.pravatar.cc/150?img=3',
            status: 'away',
            lastSeen: '30 минут назад',
            compatibility: 87,
            commonTracks: 156,
            location: 'Екатеринбург',
            instruments: ['DJ', 'Продюсер']
        },
        {
            id: 'friend_4',
            name: 'Анна Композитор',
            avatar: 'https://i.pravatar.cc/150?img=4',
            status: 'online',
            lastSeen: 'Сейчас онлайн',
            compatibility: 91,
            commonTracks: 203,
            location: 'Казань',
            instruments: ['Синтезатор', 'Композиция']
        },
        {
            id: 'friend_5',
            name: 'Иван Барабанщик',
            avatar: 'https://i.pravatar.cc/150?img=5',
            status: 'offline',
            lastSeen: '1 день назад',
            compatibility: 85,
            commonTracks: 67,
            location: 'Новосибирск',
            instruments: ['Барабаны', 'Перкуссия']
        }
    ];
    
    return friends;
}

// 15. Маршрут для проверки здоровья сервера
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
    
