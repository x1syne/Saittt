// server.js - ПРОСТАЯ ВЕРСИЯ ДЛЯ НАЧАЛА
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Конфигурация Spotify
const SPOTIFY_CONFIG = {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
    scopes: [
        'user-read-email',
        'user-read-private',
        'user-top-read'
    ].join(' ')
};

// 1. Начало авторизации
app.get('/auth/spotify', (req, res) => {
    console.log('🚀 Отправляем пользователя в Spotify...');

    const authUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CONFIG.clientId,
        scope: SPOTIFY_CONFIG.scopes,
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        show_dialog: true  // Всегда показывать окно авторизации
    });

    res.redirect(authUrl);
});

// 2. Callback от Spotify
app.get('/auth/spotify/callback', async (req, res) => {
    console.log('🎯 Получили callback от Spotify');

    try {
        const { code } = req.query;
        console.log('Код авторизации:', code ? 'получен' : 'отсутствует');

        if (!code) {
            return res.status(400).send('No authorization code received');
        }

        // Получаем токен
        console.log('🔄 Получаем access token...');
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

        const access_token = tokenResponse.data.access_token;
        console.log('✅ Access token получен!');

        // Получаем данные пользователя
        console.log('👤 Получаем данные пользователя...');
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const userData = {
            spotifyId: userResponse.data.id,
            displayName: userResponse.data.display_name || 'Пользователь Spotify',
            email: userResponse.data.email || 'email@example.com',
            profileImage: userResponse.data.images?.[0]?.url || 'https://i.pravatar.cc/150',
            country: userResponse.data.country || 'RU',
            accessToken: access_token
        };

        console.log('🎵 Данные пользователя:', userData.displayName);

        // Отправляем пользователя на фронтенд с данными
        const frontendUrl = `http://localhost:5500/dashboard.html?` +
                          `name=${encodeURIComponent(userData.displayName)}&` +
                          `image=${encodeURIComponent(userData.profileImage)}&` +
                          `token=${access_token}`;

        res.redirect(frontendUrl);

    } catch (error) {
        console.error('❌ Ошибка авторизации:', error.response?.data || error.message);
        res.status(500).send(`
            <h1>Ошибка авторизации</h1>
            <p>${error.message}</p>
            <a href="/">Вернуться на главную</a>
        `);
    }
});

// 3. Простой тестовый маршрут
app.get('/', (req, res) => {
    res.send(`
        <h1>SoundMate Backend работает! ✅</h1>
        <p>Сервер запущен на порту ${process.env.PORT}</p>
        <p>Для авторизации перейдите по ссылке:</p>
        <a href="/auth/spotify">Войти через Spotify</a>
    `);
});

// 4. Маршрут для получения музыкальных данных
app.get('/api/music-data', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }

    try {
        // Получаем топ артистов
        const artistsResponse = await axios.get(
            'https://api.spotify.com/v1/me/top/artists?limit=10',
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        // Получаем топ треков
        const tracksResponse = await axios.get(
            'https://api.spotify.com/v1/me/top/tracks?limit=10',
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        res.json({
            success: true,
            topArtists: artistsResponse.data.items.map(artist => ({
                name: artist.name,
                genres: artist.genres,
                image: artist.images?.[0]?.url
            })),
            topTracks: tracksResponse.data.items.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name
            })),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(401).json({ error: 'Неверный токен Spotify' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 Сервер SoundMate запущен!
    🌐 Адрес: http://localhost:${PORT}
    🎵 Spotify Client ID: ${process.env.SPOTIFY_CLIENT_ID ? 'установлен' : 'отсутствует'}

    Для проверки:
    1. Откройте в браузере: http://localhost:${PORT}
    2. Нажмите "Войти через Spotify"
    3. Авторизуйтесь в Spotify
    4. Получите данные!
    `);
});