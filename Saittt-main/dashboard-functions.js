// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

const BACKEND_URL = 'https://saittt.vercel.app';

// Global variables
let currentUser = null;
let currentMusicData = null;
let currentPeriod = 'month';
let currentMusicTab = 'tracks';

// ═══════════════════════════════════════════════════════════════════════
// PROFILE SECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

async function loadProfileSection() {
    const token = localStorage.getItem('spotify_token');
    const name = localStorage.getItem('spotify_name');
    const email = localStorage.getItem('spotify_email');
    const image = localStorage.getItem('spotify_image');
    
    // Загружаем базовую информацию из localStorage
    if (name) document.getElementById('profileName').textContent = name;
    if (email) document.getElementById('profileEmail').textContent = email;
    if (image) document.getElementById('profileAvatar').src = image;
    
    // Set join date
    const joinDate = new Date();
    document.getElementById('profileJoinDate').textContent = joinDate.toLocaleDateString('ru-RU');
    
    if (!token) {
        console.warn('❌ Нет токена для профиля, используем базовые данные');
        return;
    }
    
    try {
        // Загружаем полную информацию о пользователе
        const userResponse = await fetch(`${BACKEND_URL}/api/user-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ Данные профиля получены:', userData.user);
            
            // Обновляем профиль реальными данными
            document.getElementById('profileName').textContent = userData.user.displayName || name || 'Пользователь';
            document.getElementById('profileEmail').textContent = userData.user.email || email || '';
            document.getElementById('profileCountry').innerHTML = `<i class="fas fa-globe"></i> ${userData.user.country || 'Неизвестно'}`;
            document.getElementById('profileSpotifyId').textContent = userData.user.id || '-';
            document.getElementById('profileFollowers').textContent = userData.user.followers || '0';
            
            if (userData.user.image) {
                document.getElementById('profileAvatar').src = userData.user.image;
            }
        }
        
        // Загружаем жанры пользователя
        const genresResponse = await fetch(`${BACKEND_URL}/api/user-genres`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (genresResponse.ok) {
            const genresData = await genresResponse.json();
            console.log('✅ Жанры получены:', genresData.genres);
            
            const genresContainer = document.getElementById('profileGenres');
            genresContainer.innerHTML = '';
            
            genresData.genres.slice(0, 8).forEach(genreObj => {
                genresContainer.innerHTML += `
                    <span style="padding: 8px 16px; background: var(--light-gray); border-radius: 20px; font-size: 14px; margin: 4px;">
                        ${genreObj.genre} (${genreObj.count})
                    </span>
                `;
            });
        } else {
            // Демо жанры
            const demoGenres = ['pop', 'rock', 'electronic', 'hip-hop', 'indie'];
            const genresContainer = document.getElementById('profileGenres');
            genresContainer.innerHTML = '';
            
            demoGenres.forEach(genre => {
                genresContainer.innerHTML += `
                    <span style="padding: 8px 16px; background: var(--light-gray); border-radius: 20px; font-size: 14px; margin: 4px;">
                        ${genre}
                    </span>
                `;
            });
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки профиля:', error);
    }
}

function editProfile() {
    alert('Функция редактирования профиля будет доступна в следующей версии!');
}

// ═══════════════════════════════════════════════════════════════════════
// STATS SECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function changePeriod(period) {
    currentPeriod = period;
    
    // Update button states
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const clickedBtn = document.querySelector(`[onclick="changePeriod('${period}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // Load stats for period
    loadStatsSection();
}

async function loadStatsSection() {
    const token = localStorage.getItem('spotify_token');
    
    if (!token) {
        console.warn('❌ Нет токена для статистики, используем демо данные');
        loadDemoStats();
        return;
    }
    
    try {
        console.log('📊 Загружаем реальную статистику...');
        
        // Загружаем недавно прослушанные треки для статистики
        const recentResponse = await fetch(`${BACKEND_URL}/api/recently-played`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (recentResponse.ok) {
            const recentData = await recentResponse.json();
            console.log('✅ Статистика получена:', recentData.statistics);
            
            // Обновляем статистику на основе реальных данных
            document.getElementById('statsPlays').textContent = recentData.statistics.totalTracks.toLocaleString();
            document.getElementById('statsMinutes').textContent = recentData.statistics.totalMinutes.toLocaleString();
            document.getElementById('statsAlbums').textContent = recentData.statistics.uniqueAlbums;
            document.getElementById('statsPlaylists').textContent = '0'; // Будет обновлено отдельно
            
            // Загружаем количество плейлистов
            const playlistsResponse = await fetch(`${BACKEND_URL}/api/user-playlists`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (playlistsResponse.ok) {
                const playlistsData = await playlistsResponse.json();
                document.getElementById('statsPlaylists').textContent = playlistsData.count;
            }
            
            // Обновляем изменения (можно сделать более умно, сравнивая с предыдущими данными)
            document.getElementById('statsPlaysChange').textContent = '+' + Math.floor(Math.random() * 20 + 5) + '% за период';
            document.getElementById('statsMinutesChange').textContent = '+' + Math.floor(Math.random() * 15 + 3) + '% за период';
            document.getElementById('statsAlbumsChange').textContent = '+' + Math.floor(Math.random() * 5) + ' новых';
            document.getElementById('statsPlaylistsChange').textContent = 'Активных: ' + Math.floor(playlistsData?.count * 0.7 || 0);
            
        } else {
            console.warn('⚠️ API статистики недоступен, используем демо');
            loadDemoStats();
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки статистики:', error);
        loadDemoStats();
    }
}

// Загрузка демо статистики
function loadDemoStats() {
    const stats = {
        plays: Math.floor(Math.random() * 5000 + 1000),
        minutes: Math.floor(Math.random() * 10000 + 2000),
        albums: Math.floor(Math.random() * 200 + 50),
        playlists: Math.floor(Math.random() * 50 + 10)
    };
    
    document.getElementById('statsPlays').textContent = stats.plays.toLocaleString();
    document.getElementById('statsMinutes').textContent = stats.minutes.toLocaleString();
    document.getElementById('statsAlbums').textContent = stats.albums;
    document.getElementById('statsPlaylists').textContent = stats.playlists;
    
    // Update changes
    document.getElementById('statsPlaysChange').textContent = '+' + Math.floor(Math.random() * 20 + 5) + '% (демо)';
    document.getElementById('statsMinutesChange').textContent = '+' + Math.floor(Math.random() * 15 + 3) + '% (демо)';
    document.getElementById('statsAlbumsChange').textContent = '+' + Math.floor(Math.random() * 10) + ' новых (демо)';
    document.getElementById('statsPlaylistsChange').textContent = '+' + Math.floor(Math.random() * 5) + ' новых (демо)';
}

// ═══════════════════════════════════════════════════════════════════════
// MUSIC SECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function changeMusicTab(tab) {
    currentMusicTab = tab;
    
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const clickedBtn = document.querySelector(`[onclick="changeMusicTab('${tab}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // Hide all tabs
    document.querySelectorAll('.music-tab').forEach(t => {
        t.style.display = 'none';
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tab + 'Tab');
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    // Load data for tab
    loadMusicTab(tab);
}

async function loadMusicTab(tab) {
    const token = localStorage.getItem('spotify_token');
    console.log('🔑 Проверяем токен для', tab, ':', token ? 'Есть' : 'Отсутствует');
    
    if (!token) {
        console.warn('❌ Нет токена Spotify, используем демо данные');
        const demoData = generateDemoData(tab);
        displayMusicData(getContainerIdForTab(tab), demoData, tab);
        return;
    }
    
    try {
        let endpoint = '';
        let containerId = '';
        
        switch(tab) {
            case 'tracks':
                endpoint = '/api/top-tracks';
                containerId = 'musicTracksList';
                break;
            case 'artists':
                endpoint = '/api/top-artists';
                containerId = 'musicArtistsList';
                break;
            case 'albums':
                endpoint = '/api/user-albums';
                containerId = 'musicAlbumsList';
                break;
            case 'playlists':
                endpoint = '/api/user-playlists';
                containerId = 'musicPlaylistsList';
                break;
        }
        
        if (endpoint) {
            console.log(`🌐 Загружаем ${tab} из API:`, `${BACKEND_URL}${endpoint}`);
            
            try {
                const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`📡 Ответ API для ${tab}:`, response.status, response.statusText);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Данные ${tab} получены:`, data);
                    displayMusicData(containerId, data, tab);
                } else {
                    const errorData = await response.text();
                    console.error(`❌ Ошибка API ${tab}:`, response.status, errorData);
                    
                    // Если токен истек, пробуем обновить
                    if (response.status === 401) {
                        console.log('🔄 Токен истек, нужна повторная авторизация');
                        showTokenExpiredMessage();
                    }
                    
                    const demoData = generateDemoData(tab);
                    displayMusicData(containerId, demoData, tab);
                }
            } catch (error) {
                console.error(`❌ Сетевая ошибка для ${tab}:`, error);
                const demoData = generateDemoData(tab);
                displayMusicData(containerId, demoData, tab);
            }
        } else {
            console.log(`📋 Используем демо данные для ${tab}`);
            const demoData = generateDemoData(tab);
            displayMusicData(containerId, demoData, tab);
        }
    } catch (error) {
        console.error('❌ Общая ошибка загрузки:', error);
        const demoData = generateDemoData(tab);
        displayMusicData(getContainerIdForTab(tab), demoData, tab);
    }
}

// Вспомогательная функция для получения ID контейнера
function getContainerIdForTab(tab) {
    const containerMap = {
        'tracks': 'musicTracksList',
        'artists': 'musicArtistsList', 
        'albums': 'musicAlbumsList',
        'playlists': 'musicPlaylistsList'
    };
    return containerMap[tab] || 'musicTracksList';
}

// Показать сообщение об истекшем токене
function showTokenExpiredMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    message.innerHTML = `
        <strong>⚠️ Токен Spotify истек</strong><br>
        <small>Нужна повторная авторизация</small><br>
        <button onclick="reconnectSpotify()" style="margin-top: 10px; padding: 5px 10px; background: white; color: #ff4444; border: none; border-radius: 5px; cursor: pointer;">
            Переподключить
        </button>
    `;
    
    document.body.appendChild(message);
    
    // Автоматически убираем через 10 секунд
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 10000);
}

function displayMusicData(containerId, data, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (type === 'tracks' && data.tracks) {
        data.tracks.forEach((track, index) => {
            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-number">${index + 1}</div>
                    <img class="list-item-image" src="${track.image || 'https://via.placeholder.com/50'}" alt="${track.name}">
                    <div class="list-item-info">
                        <div class="list-item-title">${track.name}</div>
                        <div class="list-item-subtitle">${track.artist}</div>
                    </div>
                    <div style="color: #999; font-size: 14px;">${formatDuration(track.duration)}</div>
                </div>
            `;
        });
    } else if (type === 'artists' && data.artists) {
        data.artists.forEach((artist, index) => {
            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-number">${index + 1}</div>
                    <div class="list-item-image" style="background: linear-gradient(135deg, var(--accent) 0%, #00cc70 100%); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-microphone" style="color: white;"></i>
                    </div>
                    <div class="list-item-info">
                        <div class="list-item-title">${artist.name}</div>
                        <div class="list-item-subtitle">${artist.genres ? artist.genres.join(', ') : 'Artist'}</div>
                    </div>
                    <div style="color: #999; font-size: 14px;">${artist.popularity || 0}% популярность</div>
                </div>
            `;
        });
    }
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// ═══════════════════════════════════════════════════════════════════════
// MATCHES SECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

async function findMatches() {
    const matchesList = document.getElementById('matchesList');
    matchesList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    // Simulate finding matches
    setTimeout(() => {
        const matches = generateMockMatches(6);
        displayMatches(matches);
    }, 2000);
}

function generateMockMatches(count) {
    const names = ['Алексей', 'Мария', 'Дмитрий', 'Анна', 'Иван', 'Елена', 'Сергей', 'Ольга'];
    const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical'];
    
    return Array.from({length: count}, (_, i) => ({
        name: names[Math.floor(Math.random() * names.length)] + ' ' + String.fromCharCode(65 + i) + '.',
        match: Math.floor(Math.random() * 20 + 75),
        genres: genres.sort(() => 0.5 - Math.random()).slice(0, 3),
        tracks: Math.floor(Math.random() * 500 + 100)
    }));
}

function displayMatches(matches) {
    const matchesList = document.getElementById('matchesList');
    matchesList.innerHTML = '';
    
    matches.forEach(match => {
        matchesList.innerHTML += `
            <div class="content-card" style="text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent) 0%, #00cc70 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700;">
                    ${match.name.charAt(0)}
                </div>
                <h3 style="margin-bottom: 8px;">${match.name}</h3>
                <div style="color: var(--accent); font-size: 24px; font-weight: 700; margin-bottom: 10px;">
                    ${match.match}% совпадение
                </div>
                <div style="color: #999; font-size: 14px; margin-bottom: 15px;">
                    ${match.genres.join(', ')}
                </div>
                <div style="color: #999; font-size: 13px; margin-bottom: 20px;">
                    ${match.tracks} общих треков
                </div>
                <button onclick="connectWithUser('${match.name}')" style="width: 100%; padding: 12px; background: var(--accent); border: none; border-radius: 20px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-user-plus"></i> Подключиться
                </button>
            </div>
        `;
    });
}

function connectWithUser(name) {
    alert(`Запрос на подключение отправлен пользователю ${name}!`);
}

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS SECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function reconnectSpotify() {
    if (confirm('Переподключить Spotify аккаунт? Вы будете перенаправлены на страницу авторизации.')) {
        localStorage.clear();
        window.location.href = `${BACKEND_URL}/auth/spotify`;
    }
}

async function syncData() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Синхронизация...';
    btn.disabled = true;
    
    // Simulate sync
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Синхронизировано!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            location.reload();
        }, 1500);
    }, 2000);
}

function deleteAccount() {
    if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!')) {
        if (confirm('Последнее предупреждение! Все ваши данные будут удалены безвозвратно.')) {
            // Delete account logic
            localStorage.clear();
            alert('Аккаунт удален. До свидания!');
            window.location.href = 'index.html';
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

function initializeSections() {
    // Load initial data for all sections
    loadProfileSection();
    loadStatsSection();
    loadMusicTab('tracks');
}
// ═══════════════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS FOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════

// Logout function
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 Dashboard загружается...');
    
    // Check token first
    const token = localStorage.getItem('spotify_token');
    const name = localStorage.getItem('spotify_name');
    console.log('🔑 Токен в localStorage:', token ? 'Есть' : 'Отсутствует');
    console.log('👤 Имя пользователя:', name || 'Не найдено');
    
    if (!token) {
        console.warn('⚠️ Нет токена Spotify, все данные будут демо');
    }
    
    // Check if functions are available
    if (typeof initializeSections === 'function') {
        initializeSections();
    }
    
    // Set up event listeners for music tabs
    setupMusicTabListeners();
    
    // Load initial music data
    setTimeout(() => {
        console.log('🎵 Загружаем начальные данные...');
        loadMusicTab('tracks');
    }, 1000);
    
    console.log('✅ Dashboard готов!');
});

// Setup music tab listeners
function setupMusicTabListeners() {
    // Add click listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract tab name from onclick
                const match = onclick.match(/changeMusicTab\('(\w+)'\)/);
                if (match) {
                    changeMusicTab(match[1]);
                }
            }
        });
    });
    
    // Add click listeners to period buttons
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // Extract period from onclick
                const match = onclick.match(/changePeriod\('(\w+)'\)/);
                if (match) {
                    changePeriod(match[1]);
                }
            }
        });
    });
}

// Fix for missing functions
window.showSection = function(section) {
    if (typeof showSection !== 'undefined') {
        showSection(section);
    } else {
        console.error('showSection function not found');
    }
};

window.changeMusicTab = changeMusicTab;
window.changePeriod = changePeriod;
window.logout = logout;

// ═══════════════════════════════════════════════════════════════════════
// DEMO DATA GENERATION
// ═══════════════════════════════════════════════════════════════════════

function generateDemoData(type) {
    switch(type) {
        case 'tracks':
            return {
                tracks: [
                    { name: 'Blinding Lights', artist: 'The Weeknd', image: 'https://via.placeholder.com/50', duration: 200040, popularity: 95 },
                    { name: 'Shape of You', artist: 'Ed Sheeran', image: 'https://via.placeholder.com/50', duration: 233713, popularity: 92 },
                    { name: 'Someone Like You', artist: 'Adele', image: 'https://via.placeholder.com/50', duration: 285120, popularity: 89 },
                    { name: 'Bohemian Rhapsody', artist: 'Queen', image: 'https://via.placeholder.com/50', duration: 354320, popularity: 94 },
                    { name: 'Imagine', artist: 'John Lennon', image: 'https://via.placeholder.com/50', duration: 183000, popularity: 88 },
                    { name: 'Hotel California', artist: 'Eagles', image: 'https://via.placeholder.com/50', duration: 391000, popularity: 91 },
                    { name: 'Billie Jean', artist: 'Michael Jackson', image: 'https://via.placeholder.com/50', duration: 294000, popularity: 93 },
                    { name: 'Smells Like Teen Spirit', artist: 'Nirvana', image: 'https://via.placeholder.com/50', duration: 301920, popularity: 87 },
                    { name: 'Sweet Child O Mine', artist: 'Guns N Roses', image: 'https://via.placeholder.com/50', duration: 356000, popularity: 90 },
                    { name: 'Stairway to Heaven', artist: 'Led Zeppelin', image: 'https://via.placeholder.com/50', duration: 482830, popularity: 96 }
                ]
            };
        case 'artists':
            return {
                artists: [
                    { name: 'The Weeknd', genres: ['pop', 'r&b'], popularity: 95, followers: 45000000 },
                    { name: 'Ed Sheeran', genres: ['pop', 'folk'], popularity: 92, followers: 42000000 },
                    { name: 'Adele', genres: ['pop', 'soul'], popularity: 89, followers: 38000000 },
                    { name: 'Queen', genres: ['rock', 'classic rock'], popularity: 94, followers: 35000000 },
                    { name: 'Michael Jackson', genres: ['pop', 'r&b'], popularity: 93, followers: 40000000 },
                    { name: 'Eagles', genres: ['rock', 'country rock'], popularity: 91, followers: 25000000 },
                    { name: 'Nirvana', genres: ['grunge', 'alternative rock'], popularity: 87, followers: 22000000 },
                    { name: 'Led Zeppelin', genres: ['rock', 'hard rock'], popularity: 96, followers: 30000000 },
                    { name: 'John Lennon', genres: ['rock', 'pop'], popularity: 88, followers: 18000000 },
                    { name: 'Guns N Roses', genres: ['hard rock', 'heavy metal'], popularity: 90, followers: 28000000 }
                ]
            };
        case 'albums':
            return {
                albums: [
                    { name: 'Любимые хиты 2024', artist: 'Сборник', image: 'https://via.placeholder.com/50', tracks: 25 },
                    { name: 'Классическая музыка', artist: 'Различные исполнители', image: 'https://via.placeholder.com/50', tracks: 18 },
                    { name: 'Рок коллекция', artist: 'Rock Hits', image: 'https://via.placeholder.com/50', tracks: 32 },
                    { name: 'Электронная музыка', artist: 'EDM Collection', image: 'https://via.placeholder.com/50', tracks: 15 },
                    { name: 'Джаз и блюз', artist: 'Jazz Masters', image: 'https://via.placeholder.com/50', tracks: 22 }
                ]
            };
        case 'playlists':
            return {
                playlists: [
                    { name: 'Моя музыка', description: 'Любимые треки', tracks: 127, image: 'https://via.placeholder.com/50' },
                    { name: 'Для работы', description: 'Фоновая музыка', tracks: 45, image: 'https://via.placeholder.com/50' },
                    { name: 'Тренировки', description: 'Энергичная музыка', tracks: 38, image: 'https://via.placeholder.com/50' },
                    { name: 'Релакс', description: 'Спокойная музыка', tracks: 52, image: 'https://via.placeholder.com/50' },
                    { name: 'Вечеринка', description: 'Танцевальные хиты', tracks: 73, image: 'https://via.placeholder.com/50' }
                ]
            };
        default:
            return {};
    }
}

// Update displayMusicData to handle all types including real data
const originalDisplayMusicData = displayMusicData;
displayMusicData = function(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ Контейнер не найден:', containerId);
        return;
    }
    
    container.innerHTML = '';
    
    if (type === 'albums' && data.albums) {
        data.albums.forEach((album, index) => {
            const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : '';
            const trackCount = album.totalTracks || album.tracks || 0;
            
            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-number">${index + 1}</div>
                    <img class="list-item-image" src="${album.image || 'https://via.placeholder.com/50'}" alt="${album.name}">
                    <div class="list-item-info">
                        <div class="list-item-title">${album.name}</div>
                        <div class="list-item-subtitle">${album.artist} ${releaseYear ? '• ' + releaseYear : ''}</div>
                    </div>
                    <div style="color: #999; font-size: 14px;">${trackCount} треков</div>
                </div>
            `;
        });
    } else if (type === 'playlists' && data.playlists) {
        data.playlists.forEach((playlist, index) => {
            const isOwn = playlist.owner ? (playlist.owner !== 'Spotify' ? '👤 ' : '🎵 ') : '';
            
            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-number">${index + 1}</div>
                    <img class="list-item-image" src="${playlist.image || 'https://via.placeholder.com/50'}" alt="${playlist.name}">
                    <div class="list-item-info">
                        <div class="list-item-title">${playlist.name}</div>
                        <div class="list-item-subtitle">${isOwn}${playlist.description || playlist.owner || 'Плейлист'}</div>
                    </div>
                    <div style="color: #999; font-size: 14px;">${playlist.tracks} треков</div>
                </div>
            `;
        });
    } else {
        // Use original function for tracks and artists
        originalDisplayMusicData(containerId, data, type);
    }
};
// ═══════════════════════════════════════════════════════════════════════
// DEBUG AND TESTING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

// Тестирование API
async function testSpotifyAPI() {
    const token = localStorage.getItem('spotify_token');
    
    if (!token) {
        alert('❌ Нет токена Spotify! Сначала авторизуйтесь.');
        return;
    }
    
    console.log('🧪 Тестируем Spotify API...');
    
    try {
        // Тест 1: Информация о пользователе
        console.log('📋 Тест 1: Информация о пользователе');
        const userResponse = await fetch(`${BACKEND_URL}/api/user-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('👤 User API статус:', userResponse.status);
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ Данные пользователя:', userData);
        } else {
            const error = await userResponse.text();
            console.error('❌ Ошибка user API:', error);
        }
        
        // Тест 2: Топ треки
        console.log('📋 Тест 2: Топ треки');
        const tracksResponse = await fetch(`${BACKEND_URL}/api/top-tracks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('🎵 Tracks API статус:', tracksResponse.status);
        if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json();
            console.log('✅ Топ треки:', tracksData);
        } else {
            const error = await tracksResponse.text();
            console.error('❌ Ошибка tracks API:', error);
        }
        
        // Тест 3: Топ артисты
        console.log('📋 Тест 3: Топ артисты');
        const artistsResponse = await fetch(`${BACKEND_URL}/api/top-artists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('🎤 Artists API статус:', artistsResponse.status);
        if (artistsResponse.ok) {
            const artistsData = await artistsResponse.json();
            console.log('✅ Топ артисты:', artistsData);
        } else {
            const error = await artistsResponse.text();
            console.error('❌ Ошибка artists API:', error);
        }
        
        // Тест 4: Альбомы пользователя
        console.log('📋 Тест 4: Альбомы пользователя');
        const albumsResponse = await fetch(`${BACKEND_URL}/api/user-albums`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('💿 Albums API статус:', albumsResponse.status);
        if (albumsResponse.ok) {
            const albumsData = await albumsResponse.json();
            console.log('✅ Альбомы пользователя:', albumsData);
        } else {
            const error = await albumsResponse.text();
            console.error('❌ Ошибка albums API:', error);
        }
        
        // Тест 5: Плейлисты пользователя
        console.log('📋 Тест 5: Плейлисты пользователя');
        const playlistsResponse = await fetch(`${BACKEND_URL}/api/user-playlists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📋 Playlists API статус:', playlistsResponse.status);
        if (playlistsResponse.ok) {
            const playlistsData = await playlistsResponse.json();
            console.log('✅ Плейлисты пользователя:', playlistsData);
        } else {
            const error = await playlistsResponse.text();
            console.error('❌ Ошибка playlists API:', error);
        }
        
        // Тест 6: Статистика прослушиваний
        console.log('📋 Тест 6: Статистика прослушиваний');
        const recentResponse = await fetch(`${BACKEND_URL}/api/recently-played`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📊 Recent API статус:', recentResponse.status);
        if (recentResponse.ok) {
            const recentData = await recentResponse.json();
            console.log('✅ Статистика прослушиваний:', recentData.statistics);
        } else {
            const error = await recentResponse.text();
            console.error('❌ Ошибка recent API:', error);
        }
        
        alert('🧪 Полный тест завершен! Проверьте консоль (F12) для подробностей.');
        
    } catch (error) {
        console.error('❌ Общая ошибка тестирования:', error);
        alert('❌ Ошибка тестирования: ' + error.message);
    }
}

// Показать отладочную информацию
function showDebugInfo() {
    const token = localStorage.getItem('spotify_token');
    const name = localStorage.getItem('spotify_name');
    const email = localStorage.getItem('spotify_email');
    
    const debugInfo = `
🔍 ОТЛАДОЧНАЯ ИНФОРМАЦИЯ:

🔑 Токен: ${token ? 'Есть (' + token.substring(0, 20) + '...)' : 'Отсутствует'}
👤 Имя: ${name || 'Не найдено'}
📧 Email: ${email || 'Не найден'}
🌐 Backend URL: ${BACKEND_URL}
📅 Время: ${new Date().toLocaleString('ru-RU')}

🔧 Доступные функции:
- testSpotifyAPI() - тест API
- loadMusicTab('tracks') - загрузить треки
- loadMusicTab('artists') - загрузить артистов
- reconnectSpotify() - переподключить Spotify
    `;
    
    console.log(debugInfo);
    alert(debugInfo);
}

// ═══════════════════════════════════════════════════════════════════════
// FRIENDS SECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

async function loadFriendsSection() {
    console.log('👥 Загружаем секцию друзей...');
    
    // Загружаем статистику друзей
    await loadFriendsStats();
    
    // Загружаем список друзей
    await loadFriends();
    
    // Загружаем запросы в друзья
    await loadFriendRequests();
}

async function loadFriendsStats() {
    const token = localStorage.getItem('spotify_token');
    
    if (!token) {
        // Демо статистика
        document.getElementById('friendsCount').textContent = '0';
        document.getElementById('sharedTracks').textContent = '0';
        document.getElementById('avgCompatibility').textContent = '0%';
        document.getElementById('activeChats').textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/friends`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const friends = data.friends || [];
            
            // Подсчитываем статистику
            const friendsCount = friends.length;
            const avgCompatibility = friends.length > 0 
                ? Math.round(friends.reduce((sum, f) => sum + f.compatibility, 0) / friends.length)
                : 0;
            const sharedTracks = friends.reduce((sum, f) => sum + (f.commonTracks || 0), 0);
            const activeChats = friends.filter(f => f.status === 'online').length;
            
            document.getElementById('friendsCount').textContent = friendsCount;
            document.getElementById('sharedTracks').textContent = sharedTracks;
            document.getElementById('avgCompatibility').textContent = avgCompatibility + '%';
            document.getElementById('activeChats').textContent = activeChats;
            
            console.log('✅ Статистика друзей загружена:', { friendsCount, avgCompatibility, sharedTracks, activeChats });
        } else {
            throw new Error('Failed to load friends stats');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки статистики друзей:', error);
        // Показываем демо данные
        document.getElementById('friendsCount').textContent = '3';
        document.getElementById('sharedTracks').textContent = '127';
        document.getElementById('avgCompatibility').textContent = '89%';
        document.getElementById('activeChats').textContent = '1';
    }
}

async function loadFriends() {
    const token = localStorage.getItem('spotify_token');
    const friendsList = document.getElementById('friendsList');
    
    friendsList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    if (!token) {
        console.warn('❌ Нет токена для загрузки друзей, используем демо данные');
        displayFriends(generateDemoFriends());
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/friends`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Друзья получены:', data.friends);
            displayFriends(data.friends);
        } else {
            throw new Error('Failed to load friends');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки друзей:', error);
        displayFriends(generateDemoFriends());
    }
}

function displayFriends(friends) {
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';
    
    if (!friends || friends.length === 0) {
        friendsList.innerHTML = `
            <div class="content-card" style="text-align: center; padding: 60px 40px;">
                <i class="fas fa-user-plus" style="font-size: 64px; color: var(--accent); margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 15px;">У вас пока нет друзей</h3>
                <p style="color: #999; margin-bottom: 30px;">
                    Найдите людей с похожими музыкальными предпочтениями в разделе "Поиск людей"
                </p>
                <button onclick="showSection('discover')" style="padding: 15px 40px; background: var(--accent); border: none; border-radius: 30px; cursor: pointer; font-weight: 600; font-size: 16px;">
                    <i class="fas fa-search"></i> Найти друзей
                </button>
            </div>
        `;
        return;
    }
    
    friends.forEach(friend => {
        const statusIcon = friend.status === 'online' ? '🟢' : 
                          friend.status === 'away' ? '🟡' : '⚫';
        
        friendsList.innerHTML += `
            <div class="content-card" style="position: relative;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="position: relative;">
                        <img src="${friend.avatar}" alt="${friend.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                        <span style="position: absolute; bottom: -2px; right: -2px; font-size: 12px;">${statusIcon}</span>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 4px;">${friend.name}</h4>
                        <p style="color: #999; font-size: 14px; margin-bottom: 4px;">${friend.location || 'Неизвестно'}</p>
                        <p style="color: #999; font-size: 12px;">${friend.lastSeen}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: var(--accent); font-size: 18px; font-weight: 700; margin-bottom: 4px;">
                            ${friend.compatibility}%
                        </div>
                        <div style="color: #999; font-size: 12px;">
                            ${friend.commonTracks} общих
                        </div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid var(--light-gray); padding-top: 15px;">
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        ${friend.instruments.map(inst => 
                            `<span style="padding: 4px 8px; background: var(--light-gray); border-radius: 12px; font-size: 12px;">${inst}</span>`
                        ).join('')}
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="openChat('${friend.id}')" style="flex: 1; padding: 8px; background: var(--accent); border: none; border-radius: 15px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-comment"></i> Чат
                        </button>
                        <button onclick="viewProfile('${friend.id}')" style="flex: 1; padding: 8px; background: var(--light-gray); border: none; border-radius: 15px; cursor: pointer; font-size: 14px; font-weight: 600; color: white;">
                            <i class="fas fa-user"></i> Профиль
                        </button>
                        <button onclick="removeFriend('${friend.id}')" style="padding: 8px 12px; background: #ff4444; border: none; border-radius: 15px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function generateDemoFriends() {
    return [
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
        }
    ];
}

async function loadFriendRequests() {
    // В реальном приложении здесь был бы запрос к API
    // Пока показываем пустое состояние
    document.getElementById('requestsCount').textContent = '0 новых';
}

// ═══════════════════════════════════════════════════════════════════════
// DISCOVER SECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

async function loadDiscoverSection() {
    console.log('🔍 Загружаем секцию поиска...');
    await loadRecommendations();
}

async function searchUsers() {
    const genre = document.getElementById('genreFilter').value;
    const location = document.getElementById('locationFilter').value;
    const compatibility = document.getElementById('compatibilityFilter').value;
    
    console.log('🔍 Поиск пользователей с фильтрами:', { genre, location, compatibility });
    
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const token = localStorage.getItem('spotify_token');
    
    try {
        let users = [];
        
        if (token) {
            // Пытаемся получить реальные данные
            const response = await fetch(`${BACKEND_URL}/api/find-users?genre=${genre}&location=${location}&compatibility=${compatibility}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                users = data.users || [];
                console.log('✅ Пользователи найдены:', users);
            } else {
                throw new Error('API недоступен');
            }
        } else {
            throw new Error('Нет токена');
        }
        
        // Если API не работает, генерируем демо данные
        if (users.length === 0) {
            users = generateSearchResults(genre, location, parseInt(compatibility));
        }
        
        displaySearchResults(users);
        document.getElementById('searchResultsCount').textContent = `${users.length} найдено`;
        
    } catch (error) {
        console.error('❌ Ошибка поиска пользователей:', error);
        
        // Генерируем демо результаты
        const users = generateSearchResults(genre, location, parseInt(compatibility));
        displaySearchResults(users);
        document.getElementById('searchResultsCount').textContent = `${users.length} найдено (демо)`;
    }
}

function generateSearchResults(genre, location, minCompatibility) {
    const names = ['Анна Музыкант', 'Сергей Гитарист', 'Елена Певица', 'Михаил Продюсер', 'Ольга Пианистка', 'Андрей Барабанщик'];
    const cities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород'];
    const instruments = ['Гитара', 'Фортепиано', 'Вокал', 'Барабаны', 'Бас-гитара', 'Синтезатор', 'DJ', 'Продюсер'];
    const genres = ['pop', 'rock', 'electronic', 'hip-hop', 'jazz', 'classical', 'indie', 'folk'];
    
    return Array.from({length: Math.floor(Math.random() * 8 + 4)}, (_, i) => {
        const compatibility = Math.floor(Math.random() * (100 - minCompatibility) + minCompatibility);
        const userGenres = genre ? [genre] : genres.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        return {
            id: `search_user_${i + 1}`,
            name: names[i % names.length],
            avatar: `https://i.pravatar.cc/150?img=${i + 20}`,
            location: location ? cities.find(c => c.toLowerCase().includes(location)) || cities[0] : cities[Math.floor(Math.random() * cities.length)],
            compatibility: compatibility,
            commonGenres: userGenres,
            instruments: [instruments[Math.floor(Math.random() * instruments.length)]],
            mutualFriends: Math.floor(Math.random() * 15),
            lastActive: `${Math.floor(Math.random() * 24)} часов назад`,
            bio: `Музыкант из ${cities[Math.floor(Math.random() * cities.length)]}. Люблю создавать музыку и искать новые звуки.`
        };
    }).sort((a, b) => b.compatibility - a.compatibility);
}

function displaySearchResults(users) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    
    if (!users || users.length === 0) {
        searchResults.innerHTML = `
            <div class="content-card" style="text-align: center; padding: 60px 40px;">
                <i class="fas fa-search" style="font-size: 64px; color: #666; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 15px;">Никого не найдено</h3>
                <p style="color: #999; margin-bottom: 30px;">
                    Попробуйте изменить фильтры поиска или расширить критерии
                </p>
                <button onclick="document.getElementById('compatibilityFilter').value='50'; searchUsers();" style="padding: 15px 40px; background: var(--accent); border: none; border-radius: 30px; cursor: pointer; font-weight: 600; font-size: 16px;">
                    <i class="fas fa-refresh"></i> Расширить поиск
                </button>
            </div>
        `;
        return;
    }
    
    users.forEach(user => {
        searchResults.innerHTML += `
            <div class="content-card">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <img src="${user.avatar}" alt="${user.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 4px;">${user.name}</h4>
                        <p style="color: #999; font-size: 14px; margin-bottom: 4px;">
                            <i class="fas fa-map-marker-alt"></i> ${user.location}
                        </p>
                        <p style="color: #999; font-size: 12px;">${user.lastActive}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: var(--accent); font-size: 20px; font-weight: 700; margin-bottom: 4px;">
                            ${user.compatibility}%
                        </div>
                        <div style="color: #999; font-size: 12px;">
                            совместимость
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p style="color: #ccc; font-size: 14px; line-height: 1.4;">${user.bio}</p>
                </div>
                
                <div style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
                    ${user.commonGenres.map(genre => 
                        `<span style="padding: 4px 8px; background: rgba(0, 255, 136, 0.1); color: var(--accent); border-radius: 12px; font-size: 12px;">${genre}</span>`
                    ).join('')}
                    ${user.instruments.map(inst => 
                        `<span style="padding: 4px 8px; background: var(--light-gray); border-radius: 12px; font-size: 12px;">${inst}</span>`
                    ).join('')}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--light-gray); padding-top: 15px;">
                    <div style="color: #999; font-size: 13px;">
                        <i class="fas fa-users"></i> ${user.mutualFriends} общих друзей
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="viewUserProfile('${user.id}')" style="padding: 8px 16px; background: var(--light-gray); border: none; border-radius: 15px; cursor: pointer; font-size: 14px; font-weight: 600; color: white;">
                            <i class="fas fa-eye"></i> Профиль
                        </button>
                        <button onclick="sendFriendRequest('${user.id}', '${user.name}')" style="padding: 8px 16px; background: var(--accent); border: none; border-radius: 15px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-user-plus"></i> Добавить
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

async function loadRecommendations() {
    const recommendedUsers = document.getElementById('recommendedUsers');
    recommendedUsers.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    // Симулируем загрузку рекомендаций
    setTimeout(() => {
        const recommendations = generateSearchResults('', '', 75).slice(0, 4);
        displayRecommendations(recommendations);
    }, 1000);
}

function displayRecommendations(users) {
    const recommendedUsers = document.getElementById('recommendedUsers');
    recommendedUsers.innerHTML = '';
    
    if (!users || users.length === 0) {
        recommendedUsers.innerHTML = `
            <div class="content-card" style="text-align: center; padding: 40px;">
                <i class="fas fa-magic" style="font-size: 48px; color: #666; margin-bottom: 15px;"></i>
                <p style="color: #999;">Рекомендации будут доступны после анализа ваших предпочтений</p>
            </div>
        `;
        return;
    }
    
    users.forEach(user => {
        recommendedUsers.innerHTML += `
            <div class="content-card" style="text-align: center;">
                <img src="${user.avatar}" alt="${user.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 15px;">
                <h4 style="margin-bottom: 8px;">${user.name}</h4>
                <p style="color: #999; font-size: 14px; margin-bottom: 8px;">
                    <i class="fas fa-map-marker-alt"></i> ${user.location}
                </p>
                <div style="color: var(--accent); font-size: 20px; font-weight: 700; margin-bottom: 10px;">
                    ${user.compatibility}% совпадение
                </div>
                <div style="display: flex; gap: 4px; justify-content: center; margin-bottom: 15px; flex-wrap: wrap;">
                    ${user.commonGenres.slice(0, 2).map(genre => 
                        `<span style="padding: 3px 6px; background: rgba(0, 255, 136, 0.1); color: var(--accent); border-radius: 8px; font-size: 11px;">${genre}</span>`
                    ).join('')}
                </div>
                <button onclick="sendFriendRequest('${user.id}', '${user.name}')" style="width: 100%; padding: 10px; background: var(--accent); border: none; border-radius: 15px; cursor: pointer; font-weight: 600; font-size: 14px;">
                    <i class="fas fa-user-plus"></i> Добавить в друзья
                </button>
            </div>
        `;
    });
}

// ═══════════════════════════════════════════════════════════════════════
// FRIEND INTERACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

async function sendFriendRequest(userId, userName) {
    const token = localStorage.getItem('spotify_token');
    
    if (!token) {
        alert('❌ Необходима авторизация для отправки запросов в друзья');
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/friend-request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                targetUserId: userId,
                message: `Привет! Мне нравится твой музыкальный вкус. Давайте дружить и создавать музыку вместе! 🎵`
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Запрос в друзья отправлен:', data);
            
            // Показываем уведомление
            showNotification(`✅ Запрос в друзья отправлен пользователю ${userName}!`, 'success');
            
            // Обновляем кнопку
            const button = event.target;
            button.innerHTML = '<i class="fas fa-check"></i> Запрос отправлен';
            button.style.background = '#666';
            button.disabled = true;
            
        } else {
            throw new Error('Failed to send friend request');
        }
    } catch (error) {
        console.error('❌ Ошибка отправки запроса:', error);
        
        // Показываем демо уведомление
        showNotification(`✅ Запрос в друзья отправлен пользователю ${userName}! (демо режим)`, 'success');
        
        const button = event.target;
        button.innerHTML = '<i class="fas fa-check"></i> Запрос отправлен';
        button.style.background = '#666';
        button.disabled = true;
    }
}

function openChat(friendId) {
    showNotification('💬 Функция чата будет доступна в следующей версии!', 'info');
}

function viewProfile(friendId) {
    showNotification('👤 Просмотр профиля друга будет доступен в следующей версии!', 'info');
}

function viewUserProfile(userId) {
    showNotification('👤 Просмотр профиля пользователя будет доступен в следующей версии!', 'info');
}

function removeFriend(friendId) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя из друзей?')) {
        showNotification('👋 Пользователь удален из друзей', 'info');
        loadFriends(); // Перезагружаем список
    }
}

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#666'};
        color: ${type === 'success' ? '#000' : '#fff'};
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        max-width: 300px;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    // Автоматически убираем через 4 секунды
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Добавляем функции в глобальную область
window.testSpotifyAPI = testSpotifyAPI;
window.showDebugInfo = showDebugInfo;
window.loadFriendsSection = loadFriendsSection;
window.loadDiscoverSection = loadDiscoverSection;
window.searchUsers = searchUsers;
window.loadRecommendations = loadRecommendations;
window.sendFriendRequest = sendFriendRequest;
window.openChat = openChat;
window.viewProfile = viewProfile;
window.viewUserProfile = viewUserProfile;
window.removeFriend = removeFriend;
window.loadFriends = loadFriends;