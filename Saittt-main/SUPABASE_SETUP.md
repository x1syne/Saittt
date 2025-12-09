# 🗄️ Настройка Supabase для SoundMate

## Шаг 1: Создание проекта Supabase

1. Откройте: https://supabase.com
2. Нажмите "Start your project"
3. Войдите через GitHub
4. Нажмите "New Project"
5. Заполните:
   - Name: `soundmate`
   - Database Password: (придумайте надежный пароль)
   - Region: выберите ближайший к вам
6. Нажмите "Create new project"
7. Подождите 2-3 минуты

## Шаг 2: Создание таблиц

### Таблица: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spotify_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  profile_image TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска
CREATE INDEX idx_users_spotify_id ON users(spotify_id);
```

### Таблица: user_music_data

```sql
CREATE TABLE user_music_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  top_artists JSONB,
  top_tracks JSONB,
  top_genres JSONB,
  audio_features JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для связи с пользователем
CREATE INDEX idx_music_data_user_id ON user_music_data(user_id);
```

### Таблица: user_stats

```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_tracks INTEGER DEFAULT 0,
  total_artists INTEGER DEFAULT 0,
  total_playlists INTEGER DEFAULT 0,
  listening_time_minutes INTEGER DEFAULT 0,
  favorite_genre TEXT,
  music_diversity_score DECIMAL(3,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для связи с пользователем
CREATE INDEX idx_stats_user_id ON user_stats(user_id);
```

## Шаг 3: Получение API ключей

1. В Supabase Dashboard откройте "Settings" → "API"
2. Скопируйте:
   - `Project URL` (например: https://xxxxx.supabase.co)
   - `anon public` ключ

## Шаг 4: Добавление в Vercel

1. Откройте: https://vercel.com/dashboard
2. Выберите проект `saittt`
3. Settings → Environment Variables
4. Добавьте:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=ваш_anon_public_ключ
   ```
5. Redeploy проекта

## Готово! 🎉

Теперь у вас есть база данных для хранения:
- Профилей пользователей
- Музыкальных предпочтений
- Статистики прослушивания
