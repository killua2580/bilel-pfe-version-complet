-- MySQL Database Schema for Gym Power Application

CREATE DATABASE IF NOT EXISTS gym_power CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gym_power;

-- Table: users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    weight INTEGER,
    age INTEGER,
    photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_weight_positive CHECK (weight > 0),
    CONSTRAINT check_age_positive CHECK (age > 0 AND age < 120),
    CONSTRAINT check_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Table: tournaments
CREATE TABLE tournaments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    image TEXT,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: participants
CREATE TABLE participants (
    tournament_id VARCHAR(36),
    user_id VARCHAR(36),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: fights
CREATE TABLE fights (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tournament_id VARCHAR(36),
    fighter1_id VARCHAR(36),
    fighter2_id VARCHAR(36),
    fight_date TIMESTAMP NOT NULL,
    winner_id VARCHAR(36) NULL,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (fighter1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fighter2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_participants_tournament_id ON participants(tournament_id);
CREATE INDEX idx_fights_tournament_id ON fights(tournament_id);
CREATE INDEX idx_fights_date ON fights(fight_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_tournaments_date ON tournaments(date);

-- Insert default admin user
INSERT INTO users (id, email, password, first_name, last_name, weight, age) 
VALUES ('admin-id-001', 'admin@admin.com', 'admin123', 'Admin', 'Gym Power', 75, 30)
ON DUPLICATE KEY UPDATE email = email;

-- Create a view for tournament statistics
CREATE VIEW tournament_stats AS
SELECT 
    t.*,
    COUNT(p.user_id) as participant_count,
    CASE 
        WHEN t.date < NOW() THEN 'past'
        WHEN t.date > NOW() THEN 'upcoming'
        ELSE 'current'
    END as time_status
FROM tournaments t
LEFT JOIN participants p ON t.id = p.tournament_id
GROUP BY t.id, t.name, t.description, t.date, t.image, t.status, t.created_at, t.updated_at;
