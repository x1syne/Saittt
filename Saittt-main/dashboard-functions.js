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
    if (!currentUser) return;

    document.getElementById('profileAvatar').src = currentUser.image || 'https://via.placeholder.com/120';
    document.getElementById('profileName').textContent = currentUser.displayName || 'Пользователь';
    document.getElementById('profileEmail').textContent = currentUser.email || '';
    document.getElementById('profileCountry').innerHTML = `<i class="fas fa-globe"></i> ${currentUser.country || 'Unknown'}`;
    document.getElementById('profileSpotifyId').textContent = currentUser.id || '-';
    document.getElementById('profileFollowers').textContent = currentUser.followers || '0';
    
    // Set join date
    const joinDate = new Date();
    document.getElementById('profileJoinDate').textContent = joinDate.toLocaleDateString('ru-RU');
    
    // Load genres
    if (currentMusicData && currentMusicData.genres) {
        const genresContainer = document.getElementById('profileGenres');
        genresContainer.innerHTML = '';
        currentMusicData.genres.forEach(genre => {
            genresContainer.innerHTML += `
                <span style="padding: 8px 16px; background: var(--light-gray); border-radius: 20px; font-size: 14px;">
                    ${genre}
                </span>
            `;
        });
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
    event.target.classList.add('active');
    
    // Load stats for period
    loadStatsSection();
}

async function loadStatsSection() {
    // Simulate loading stats
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
    document.getElementById('statsPlaysChange').textContent = '+' + Math.floor(Math.random() * 20 + 5) + '%';
    document.getElementById('statsMinutesChange').textContent = '+' + Math.floor(Math.random() * 15 + 3) + '%';
    document.getElementById('statsAlbumsChange').textContent = '+' + Math.floor(Math.random() * 10) + ' новых';
    document.getElementById('statsPlaylistsChange').textContent = '+' + Math.floor(Math.random() * 5) + ' новых';
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
    event.target.classList.add('active');
    
    // Hide all tabs
    document.querySelectorAll('.music-tab').forEach(t => {
        t.style.display = 'none';
    });
    
    // Show selected tab
    document.getElementById(tab + 'Tab').style.display = 'block';
    
    // Load data for tab
    loadMusicTab(tab);
}

async function loadMusicTab(tab) {
    const token = localStorage.getItem('spotify_token');
    if (!token) return;
    
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
                containerId = 'musicAlbumsList';
                // Albums endpoint
                break;
            case 'playlists':
                containerId = 'musicPlaylistsList';
                // Playlists endpoint
                break;
        }
        
        if (endpoint) {
            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                displayMusicData(containerId, data, tab);
            }
        } else {
            // Show placeholder for not implemented tabs
            document.getElementById(containerId).innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-compact-disc" style="font-size: 64px; color: #666; margin-bottom: 20px;"></i>
                    <p style="color: #999;">Эта функция будет доступна в следующей версии</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading music tab:', error);
    }
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
