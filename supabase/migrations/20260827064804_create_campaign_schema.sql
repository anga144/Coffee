/*
# Brew Haus Coffee — Social Media Campaign Platform Schema

## Purpose
A single-tenant campaign management app for a local coffee shop ("Brew Haus") targeting young adults and students. It manages social media posts across Instagram, Facebook, Twitter, and TikTok; generates AI advertisements; runs customer surveys and promotional competitions; performs sentiment analysis on customer reviews; and shows a performance dashboard.

## New Tables

1. `campaigns` — Top-level marketing campaigns (e.g. "Back to School Brew").
   - id, name, description, status (draft/active/paused/completed), start_date, end_date, budget, created_at.

2. `social_posts` — Individual posts scheduled across platforms (Instagram, Facebook, Twitter, TikTok).
   - id, campaign_id (FK), platform, content, image_url, status (draft/scheduled/published), scheduled_at, published_at, likes, comments, shares, reach, created_at.

3. `ai_advertisements` — AI-generated ad creatives (copy + image) associated with a campaign.
   - id, campaign_id (FK), headline, body_text, call_to-action, image_url, style, target_audience, status, created_at.

4. `surveys` — Customer survey definitions.
   - id, campaign_id (FK), title, description, is_active, created_at.

5. `survey_questions` — Questions belonging to a survey.
   - id, survey_id (FK), question_text, question_type (text/rating/multiple_choice), options (jsonb), display_order.

6. `survey_responses` — Submitted survey answers.
   - id, survey_id (FK), respondent_name, submitted_at.

7. `survey_answers` — Individual answers tied to a response.
   - id, response_id (FK), question_id (FK), answer_text, answer_rating, selected_option.

8. `competitions` — Promotional competitions/giveaways.
   - id, campaign_id (FK), title, description, prize, rules, start_date, end_date, status, entry_count, created_at.

9. `competition_entries` — Entries submitted to a competition.
   - id, competition_id (FK), entrant_name, entrant_email, entry_note, submitted_at.

10. `reviews` — Customer reviews/feedback collected for sentiment analysis.
    - id, source (google/yelp/instagram/facebook), author_name, rating (1-5), review_text, sentiment_score, sentiment_label, created_at.

11. `prompt_library` — Saved reusable prompts for text, image, and code generation.
    - id, title, prompt_text, category (text/image/code), tags (text[]), created_at.

12. `generated_content` — Content generated from prompts (text, code, or image references).
    - id, prompt_id (FK nullable), content_type (text/code/image), prompt_used, generated_text, created_at.

## Security
- Single-tenant app with NO sign-in screen. All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the data is intentionally public/shared within this campaign tool.
- RLS enabled on every table.

## Notes
1. Foreign keys cascade on delete so removing a campaign cleans up its posts, ads, surveys, and competitions.
2. `sentiment_score` is a float from -1 (negative) to +1 (positive); `sentiment_label` is positive/neutral/negative.
3. `tags` on prompt_library uses a PostgreSQL text array for easy filtering.
*/

-- ============ campaigns ============
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed')),
  start_date date,
  end_date date,
  budget numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_campaigns" ON campaigns;
CREATE POLICY "anon_crud_campaigns" ON campaigns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_campaigns" ON campaigns FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_campaigns" ON campaigns FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_campaigns" ON campaigns FOR DELETE TO anon, authenticated USING (true);

-- ============ social_posts ============
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('instagram','facebook','twitter','tiktok')),
  content text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published')),
  scheduled_at timestamptz,
  published_at timestamptz,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  reach integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_social_posts" ON social_posts;
CREATE POLICY "anon_select_social_posts" ON social_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_social_posts" ON social_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_social_posts" ON social_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_social_posts" ON social_posts FOR DELETE TO anon, authenticated USING (true);

-- ============ ai_advertisements ============
CREATE TABLE IF NOT EXISTS ai_advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  headline text NOT NULL,
  body_text text,
  call_to_action text,
  image_url text,
  style text,
  target_audience text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','published')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_advertisements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ai_ads" ON ai_advertisements;
CREATE POLICY "anon_select_ai_ads" ON ai_advertisements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_ai_ads" ON ai_advertisements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_ai_ads" ON ai_advertisements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ai_ads" ON ai_advertisements FOR DELETE TO anon, authenticated USING (true);

-- ============ surveys ============
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_surveys" ON surveys;
CREATE POLICY "anon_select_surveys" ON surveys FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_surveys" ON surveys FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_surveys" ON surveys FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_surveys" ON surveys FOR DELETE TO anon, authenticated USING (true);

-- ============ survey_questions ============
CREATE TABLE IF NOT EXISTS survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('text','rating','multiple_choice')),
  options jsonb,
  display_order integer DEFAULT 0
);
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_survey_questions" ON survey_questions;
CREATE POLICY "anon_select_survey_questions" ON survey_questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_survey_questions" ON survey_questions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_survey_questions" ON survey_questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_survey_questions" ON survey_questions FOR DELETE TO anon, authenticated USING (true);

-- ============ survey_responses ============
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_name text,
  submitted_at timestamptz DEFAULT now()
);
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_survey_responses" ON survey_responses;
CREATE POLICY "anon_select_survey_responses" ON survey_responses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_survey_responses" ON survey_responses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_survey_responses" ON survey_responses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_survey_responses" ON survey_responses FOR DELETE TO anon, authenticated USING (true);

-- ============ survey_answers ============
CREATE TABLE IF NOT EXISTS survey_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id uuid REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer_text text,
  answer_rating integer,
  selected_option text
);
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_survey_answers" ON survey_answers;
CREATE POLICY "anon_select_survey_answers" ON survey_answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_survey_answers" ON survey_answers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_survey_answers" ON survey_answers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_survey_answers" ON survey_answers FOR DELETE TO anon, authenticated USING (true);

-- ============ competitions ============
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  prize text,
  rules text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','ended')),
  entry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_competitions" ON competitions;
CREATE POLICY "anon_select_competitions" ON competitions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_competitions" ON competitions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_competitions" ON competitions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_competitions" ON competitions FOR DELETE TO anon, authenticated USING (true);

-- ============ competition_entries ============
CREATE TABLE IF NOT EXISTS competition_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE,
  entrant_name text NOT NULL,
  entrant_email text,
  entry_note text,
  submitted_at timestamptz DEFAULT now()
);
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_competition_entries" ON competition_entries;
CREATE POLICY "anon_select_competition_entries" ON competition_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_competition_entries" ON competition_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_competition_entries" ON competition_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_competition_entries" ON competition_entries FOR DELETE TO anon, authenticated USING (true);

-- ============ reviews ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text CHECK (source IN ('google','yelp','instagram','facebook','twitter','tiktok')),
  author_name text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  sentiment_score numeric(3,2) DEFAULT 0,
  sentiment_label text CHECK (sentiment_label IN ('positive','neutral','negative')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE TO anon, authenticated USING (true);

-- ============ prompt_library ============
CREATE TABLE IF NOT EXISTS prompt_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  prompt_text text NOT NULL,
  category text NOT NULL CHECK (category IN ('text','image','code')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE prompt_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_prompt_library" ON prompt_library;
CREATE POLICY "anon_select_prompt_library" ON prompt_library FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_prompt_library" ON prompt_library FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_prompt_library" ON prompt_library FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_prompt_library" ON prompt_library FOR DELETE TO anon, authenticated USING (true);

-- ============ generated_content ============
CREATE TABLE IF NOT EXISTS generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompt_library(id) ON DELETE SET NULL,
  content_type text NOT NULL CHECK (content_type IN ('text','code','image')),
  prompt_used text,
  generated_text text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_generated_content" ON generated_content;
CREATE POLICY "anon_select_generated_content" ON generated_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_generated_content" ON generated_content FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_generated_content" ON generated_content FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_generated_content" ON generated_content FOR DELETE TO anon, authenticated USING (true);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_social_posts_campaign ON social_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ai_ads_campaign ON ai_advertisements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_surveys_campaign ON surveys(campaign_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response ON survey_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_competitions_campaign ON competitions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_competition_entries_competition ON competition_entries(competition_id);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_prompt_library_category ON prompt_library(category);
