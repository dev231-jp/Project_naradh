-- schema.sql

-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP
);

-- devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    mac_address VARCHAR(17) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    status VARCHAR(50) NOT NULL DEFAULT 'secure',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- networks table
CREATE TABLE networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ssid VARCHAR(255) NOT NULL,
    bssid VARCHAR(17) NOT NULL,
    encryption_type VARCHAR(50),
    is_trusted BOOLEAN NOT NULL DEFAULT false,
    last_seen TIMESTAMP NOT NULL DEFAULT NOW()
);

-- telemetry_events table
CREATE TABLE telemetry_events (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    network_id UUID REFERENCES networks(id) ON DELETE SET NULL,
    raw_data JSONB,
    src_ip VARCHAR(45),
    dest_ip VARCHAR(45),
    protocol VARCHAR(50),
    bytes BIGINT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    network_id UUID REFERENCES networks(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    risk_score INTEGER,
    description TEXT,
    recommended_actions JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- assistant_conversations table
CREATE TABLE assistant_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- assistant_messages table
CREATE TABLE assistant_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    related_alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    risk_score_threshold INTEGER NOT NULL DEFAULT 75,
    notification_preferences JSONB,
    assistant_mode VARCHAR(50) NOT NULL DEFAULT 'simple'
);
