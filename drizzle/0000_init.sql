CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  github_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  namespace TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  version TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  changelog TEXT DEFAULT '',
  readme TEXT DEFAULT '',
  downloads INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  author_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(namespace, slug)
);

CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  wasm_url TEXT NOT NULL,
  manifest_url TEXT NOT NULL,
  package_id TEXT REFERENCES packages(id) ON DELETE CASCADE
);
