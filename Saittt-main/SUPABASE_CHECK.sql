-- ═══════════════════════════════════════════════════════════════════════
-- ПРОВЕРКА ТАБЛИЦ SUPABASE
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Проверка существующих таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- 2. Проверка структуры таблицы users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Проверка структуры таблицы user_music_data
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_music_data'
ORDER BY ordinal_position;

-- 4. Проверка структуры таблицы user_stats
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_stats'
ORDER BY ordinal_position;

-- 5. Проверка количества записей
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM user_music_data) as music_data_count,
  (SELECT COUNT(*) FROM user_stats) as stats_count;

-- ═══════════════════════════════════════════════════════════════════════
-- ЕСЛИ НУЖНО ПЕРЕСОЗДАТЬ ТАБЛИЦЫ (УДАЛИТ ВСЕ ДАННЫЕ!)
-- ═══════════════════════════════════════════════════════════════════════

-- Раскомментируйте эти строки только если нужно начать с чистого листа:

-- DROP TABLE IF EXISTS user_stats CASCADE;
-- DROP TABLE IF EXISTS user_music_data CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Затем запустите основной SQL из ИНТЕГРАЦИЯ_SUPABASE.txt
