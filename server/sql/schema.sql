DROP TABLE IF EXISTS affirmations, bookmarks, resources, reports, messages, chats,
                     reactions, comments, posts, assessments, journal_entries,
                     mood_entries, helper_profiles, users CASCADE;

CREATE TABLE users (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(100) NOT NULL,
  email                 VARCHAR(150) UNIQUE NOT NULL,
  password_hash         TEXT NOT NULL,
  role                  VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'helper', 'admin')),
  pen_name              VARCHAR(60) UNIQUE NOT NULL,
  public_key            TEXT,
  encrypted_private_key TEXT,
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE helper_profiles (
  user_id         INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  kind            VARCHAR(20) NOT NULL CHECK (kind IN ('licensed', 'volunteer')),
  license_number  VARCHAR(50),
  bio             TEXT NOT NULL,
  specialisations TEXT[] NOT NULL DEFAULT '{}',
  languages       TEXT[] NOT NULL DEFAULT '{}',
  gender          VARCHAR(20),
  is_free         BOOLEAN NOT NULL DEFAULT TRUE,
  is_available    BOOLEAN NOT NULL DEFAULT FALSE,
  status          VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at      TIMESTAMP DEFAULT NOW(),
  approved_at     TIMESTAMP
);

CREATE TABLE mood_entries (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  mood        SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  stress      SMALLINT NOT NULL CHECK (stress BETWEEN 1 AND 5),
  energy      SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  sleep_hours NUMERIC(3, 1),
  note        TEXT,
  UNIQUE (user_id, entry_date)
);

CREATE TABLE journal_entries (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  emotion     VARCHAR(30),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessments (
  id        SERIAL PRIMARY KEY,
  user_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type      VARCHAR(10) NOT NULL,
  score     SMALLINT NOT NULL,
  level     VARCHAR(20) NOT NULL,
  taken_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  circle      VARCHAR(40) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  is_hidden   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id          SERIAL PRIMARY KEY,
  post_id     INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  is_hidden   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reactions (
  post_id  INT REFERENCES posts(id) ON DELETE CASCADE,
  user_id  INT REFERENCES users(id) ON DELETE CASCADE,
  type     VARCHAR(20) NOT NULL,
  PRIMARY KEY (post_id, user_id, type)
);

CREATE TABLE chats (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helper_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, helper_id)
);

CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  chat_id     INT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ciphertext  TEXT NOT NULL,
  iv          TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reports (
  id          SERIAL PRIMARY KEY,
  reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     INT REFERENCES posts(id) ON DELETE CASCADE,
  comment_id  INT REFERENCES comments(id) ON DELETE CASCADE,
  chat_id     INT REFERENCES chats(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  evidence    TEXT,
  status      VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resources (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  type        VARCHAR(20) NOT NULL CHECK (type IN ('article', 'video', 'link')),
  category    VARCHAR(50) NOT NULL,
  url         TEXT,
  body        TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookmarks (
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, resource_id)
);

CREATE TABLE affirmations (
  id    SERIAL PRIMARY KEY,
  text  TEXT NOT NULL
);
