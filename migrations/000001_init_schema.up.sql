-- 1. Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'listener'
        CHECK (role IN ('listener', 'creator', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Справочник категорий подкастов
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Таблица подкастов (шоу)
CREATE TABLE IF NOT EXISTS podcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url VARCHAR(512),
    rss_slug VARCHAR(255) NOT NULL UNIQUE,
    language VARCHAR(10) NOT NULL DEFAULT 'ru',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Таблица аудиоэпизодов
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    show_notes TEXT,
    audio_url VARCHAR(512) NOT NULL,
    duration_sec INT NOT NULL CHECK (duration_sec > 0),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    episode_number INT NOT NULL CHECK (episode_number > 0),
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Таблица подписок слушателей на подкасты (связь N:M)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subscription_user_podcast UNIQUE (user_id, podcast_id)
);

-- 6. Журнал прослушиваний (аналитика)
CREATE TABLE IF NOT EXISTS listening_logs (
    id BIGSERIAL PRIMARY KEY,
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    listened_seconds INT NOT NULL CHECK (listened_seconds >= 0),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    client_ip VARCHAR(45),
    user_agent VARCHAR(255),
    listened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы на столбцах внешних ключей и для ускорения частых выборок
CREATE INDEX IF NOT EXISTS idx_podcasts_author_id ON podcasts(author_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_category_id ON podcasts(category_id);
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_pub ON episodes(podcast_id, is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_podcast_id ON subscriptions(podcast_id);
CREATE INDEX IF NOT EXISTS idx_listening_logs_episode_date ON listening_logs(episode_id, listened_at);
CREATE INDEX IF NOT EXISTS idx_listening_logs_user_id ON listening_logs(user_id);