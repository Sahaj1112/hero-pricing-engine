-- Parts table
CREATE TABLE IF NOT EXISTS parts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('frame','gear','tyre','accessory')),
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
  old_price NUMERIC(10,2),
  new_price NUMERIC(10,2),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Configurations table
CREATE TABLE IF NOT EXISTS configurations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Config parts (many-to-many)
CREATE TABLE IF NOT EXISTS config_parts (
  id SERIAL PRIMARY KEY,
  config_id INTEGER REFERENCES configurations(id) ON DELETE CASCADE,
  part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE
);

-- Seed some sample parts
INSERT INTO parts (name, category, price) VALUES
  ('Aluminium Frame', 'frame', 2500),
  ('Steel Frame', 'frame', 1800),
  ('21-Speed Gear Set', 'gear', 1500),
  ('7-Speed Gear Set', 'gear', 800),
  ('Schwalbe Road Tyre', 'tyre', 350),
  ('MRF MTB Tyre', 'tyre', 230),
  ('Mudguard Set', 'accessory', 150),
  ('LED Front Light', 'accessory', 200);