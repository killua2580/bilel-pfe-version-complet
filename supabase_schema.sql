-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- In a real app, store hashed passwords, not plain text
    first_name TEXT,
    last_name TEXT,
    weight INTEGER,
    age INTEGER,
    photo TEXT -- URL to the photo stored in Supabase Storage
);

-- Table: tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    image TEXT -- URL to the tournament image stored in Supabase Storage
);

-- Table: participants
CREATE TABLE participants (
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (tournament_id, user_id)
);

-- Table: fights
CREATE TABLE fights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    fighter1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fighter2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fight_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Table: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Additional indexes for better performance
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_participants_tournament_id ON participants(tournament_id);
CREATE INDEX idx_fights_tournament_id ON fights(tournament_id);
CREATE INDEX idx_fights_date ON fights(fight_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_tournaments_date ON tournaments(date);

-- Add some constraints for data integrity
ALTER TABLE users ADD CONSTRAINT check_weight_positive CHECK (weight > 0);
ALTER TABLE users ADD CONSTRAINT check_age_positive CHECK (age > 0 AND age < 120);
ALTER TABLE users ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add created_at column to users and tournaments for better tracking
ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE tournaments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add status column to tournaments
ALTER TABLE tournaments ADD COLUMN status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));

-- Add winner column to fights (optional - for future expansion)
ALTER TABLE fights ADD COLUMN winner_id UUID REFERENCES users(id);
ALTER TABLE fights ADD COLUMN status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled'));

-- Insert default admin user (if not exists)
INSERT INTO users (id, email, password, first_name, last_name, weight, age) 
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@admin.com', 'admin123', 'Admin', 'Gym Power', 75, 30)
ON CONFLICT (email) DO NOTHING;

-- Create a view for easier tournament queries with participant counts
CREATE OR REPLACE VIEW tournament_stats AS
SELECT 
    t.*,
    COUNT(p.user_id) as participant_count,
    CASE 
        WHEN t.date < now() THEN 'past'
        WHEN t.date > now() THEN 'upcoming'
        ELSE 'current'
    END as time_status
FROM tournaments t
LEFT JOIN participants p ON t.id = p.tournament_id
GROUP BY t.id, t.name, t.description, t.date, t.image, t.status, t.created_at;

-- Create a function to automatically update tournament status
CREATE OR REPLACE FUNCTION update_tournament_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on date
    UPDATE tournaments 
    SET status = CASE 
        WHEN date < now() AND status != 'completed' THEN 'completed'
        WHEN date > now() AND status = 'completed' THEN 'upcoming'
        ELSE status
    END;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update tournament status
CREATE TRIGGER trigger_update_tournament_status
    AFTER INSERT OR UPDATE OF date ON tournaments
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_tournament_status();

