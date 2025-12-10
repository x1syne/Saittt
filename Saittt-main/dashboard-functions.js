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
    
    // Find and activate the clicked button
    const clickedBtn = document.querySelector(`[onclick="changePeriod('${period}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
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
            // Show demo data for not implemented tabs
            const demoData = generateDemoData(tab);
            displayMusicData(containerId, demoData, tab);
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
    
    // Check if functions are available
    if (typeof initializeSections === 'function') {
        initializeSections();
    }
    
    // Set up event listeners for music tabs
    setupMusicTabListeners();
    
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

// Update displayMusicData to handle albums and playlists
const originalDisplayMusicData = displayMusicData;
displayMusicData = function(containerId, data, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (type === 'albums' && data.albums) {
        data.albums.forEach((album, index) => {
            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-number">${index + 1}</div>
                    <img class="list-item-image" src="${album.image}" alt="${album.name}">
                    <div class="list-item-info">
                        <div class="list-item-title">${album.name}</div>
                        <div class="list-item-subtitle">${album.artist}</div>
                    </div>
                    <div style="color: #999; font-size: 14px;">${album.tracks} треков</div>
                </div>
            `;
        });
    } else if (type === 'playlists' && data.playlists) {
        data.playlists.forEach((playlist, index) => {
            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-number">${index + 1}</div>
                    <img class="list-item-image" src="${playlist.image}" alt="${playlist.name}">
                    <div class="list-item-info">
                        <div class="list-item-title">${playlist.name}</div>
                        <div class="list-item-subtitle">${playlist.description}</div>
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