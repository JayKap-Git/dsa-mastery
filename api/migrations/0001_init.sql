-- Accounts come from GitHub sign-in. We keep only public profile fields.
CREATE TABLE users (
  id          INTEGER PRIMARY KEY,
  github_id   INTEGER NOT NULL UNIQUE,
  login       TEXT    NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  seq         INTEGER NOT NULL DEFAULT 0,   -- per-user write counter, used as the sync cursor
  created_at  INTEGER NOT NULL
);

-- Only a SHA-256 hash of the session cookie is stored, never the token itself.
CREATE TABLE sessions (
  token_hash  TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

-- Every piece of synced study state. kind/key/value rules live in src/lib/store/kinds.ts.
CREATE TABLE items (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT    NOT NULL,
  key         TEXT    NOT NULL,
  value       TEXT    NOT NULL,             -- JSON
  updated_at  INTEGER NOT NULL,             -- device timestamp; newest wins
  deleted     INTEGER NOT NULL DEFAULT 0,
  server_seq  INTEGER NOT NULL,             -- users.seq at the time of the write
  PRIMARY KEY (user_id, kind, key)
);
CREATE INDEX items_user_seq ON items(user_id, server_seq);
