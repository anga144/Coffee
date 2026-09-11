-- ============ image_library ============
-- Stores curated stock images across many categories for the AI Image Search feature.
CREATE TABLE IF NOT EXISTS image_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  image_url text NOT NULL,
  thumb_url text NOT NULL,
  photographer text,
  alt_text text,
  width integer,
  height integer,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE image_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_image_library" ON image_library;
CREATE POLICY "anon_select_image_library" ON image_library FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_image_library" ON image_library;
CREATE POLICY "anon_insert_image_library" ON image_library FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_image_library" ON image_library;
CREATE POLICY "anon_delete_image_library" ON image_library FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_image_library_category ON image_library(category);

-- ============ search_history ============
-- Stores the user's image search history.
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  results_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_search_history" ON search_history;
CREATE POLICY "anon_select_search_history" ON search_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_search_history" ON search_history;
CREATE POLICY "anon_insert_search_history" ON search_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_search_history" ON search_history;
CREATE POLICY "anon_delete_search_history" ON search_history FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);
