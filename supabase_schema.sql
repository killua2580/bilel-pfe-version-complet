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


