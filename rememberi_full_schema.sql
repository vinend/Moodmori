DROP TABLE IF EXISTS calendar_analytics CASCADE;
DROP TABLE IF EXISTS mood_reactions CASCADE;
DROP TABLE IF EXISTS group_messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS group_chats CASCADE;
DROP TABLE IF EXISTS direct_messages CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS mood_logs CASCADE;
DROP TABLE IF EXISTS moods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_picture TEXT,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moods (
    id SERIAL PRIMARY KEY,
    mood_name VARCHAR(30) UNIQUE NOT NULL,
    icon TEXT,
    color VARCHAR(10) 
);

INSERT INTO moods (id, mood_name, icon, color) VALUES
(1, 'HAPPY', '😊', '#FFD700'),
(2, 'SAD', '😢', '#6495ED'),
(3, 'ANGRY', '😠', '#FF4500'),
(4, 'AFRAID', '😨', '#9370DB'),
(5, 'NEUTRAL', '😐', '#A9A9A9'),
(6, 'MANIC', '😆', '#FF1493'),
(7, 'DEPRESSED', '😞', '#4682B4'),
(8, 'FURIOUS', '😡', '#DC143C'),
(9, 'TERRIFIED', '😱', '#800080'),
(10, 'CALM', '😌', '#20B2AA');

CREATE TABLE mood_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mood_id INTEGER REFERENCES moods(id) ON DELETE SET NULL,
    note TEXT,
    location TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mood_log_id INTEGER REFERENCES mood_logs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, mood_log_id)
);

CREATE TABLE mood_reactions (
    id SERIAL PRIMARY KEY,
    mood_log_id INTEGER REFERENCES mood_logs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (mood_log_id, user_id)
);

CREATE TABLE direct_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    location TEXT, 
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id)
);

CREATE TABLE group_messages (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES group_chats(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calendar_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mood_id INTEGER REFERENCES moods(id) ON DELETE SET NULL,
    mood_date DATE,
    mood_count INTEGER DEFAULT 1,
    UNIQUE (user_id, mood_id, mood_date)
);

CREATE INDEX idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX idx_mood_logs_mood_id ON mood_logs(mood_id);
CREATE INDEX idx_mood_logs_is_public ON mood_logs(is_public);
CREATE INDEX idx_mood_logs_log_date ON mood_logs(log_date);
CREATE INDEX idx_mood_reactions_mood_log_id ON mood_reactions(mood_log_id);
CREATE INDEX idx_mood_reactions_user_id ON mood_reactions(user_id);
CREATE INDEX idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient_id ON direct_messages(recipient_id);
CREATE INDEX idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_mood_log_id ON favorites(mood_log_id);