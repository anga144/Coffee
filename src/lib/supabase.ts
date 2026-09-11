import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string | null;
  end_date: string | null;
  budget: number;
  created_at: string;
};

export type SocialPost = {
  id: string;
  campaign_id: string | null;
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  content: string;
  image_url: string | null;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_at: string | null;
  published_at: string | null;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  created_at: string;
};

export type AiAdvertisement = {
  id: string;
  campaign_id: string | null;
  headline: string;
  body_text: string | null;
  call_to_action: string | null;
  image_url: string | null;
  style: string | null;
  target_audience: string | null;
  status: 'draft' | 'approved' | 'published';
  created_at: string;
};

export type Survey = {
  id: string;
  campaign_id: string | null;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type SurveyQuestion = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'text' | 'rating' | 'multiple_choice';
  options: string[] | null;
  display_order: number;
};

export type SurveyResponse = {
  id: string;
  survey_id: string;
  respondent_name: string | null;
  submitted_at: string;
};

export type SurveyAnswer = {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string | null;
  answer_rating: number | null;
  selected_option: string | null;
};

export type Competition = {
  id: string;
  campaign_id: string | null;
  title: string;
  description: string | null;
  prize: string | null;
  rules: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'draft' | 'active' | 'ended';
  entry_count: number;
  created_at: string;
};

export type CompetitionEntry = {
  id: string;
  competition_id: string;
  entrant_name: string;
  entrant_email: string | null;
  entry_note: string | null;
  submitted_at: string;
};

export type Review = {
  id: string;
  source: string | null;
  author_name: string | null;
  rating: number | null;
  review_text: string;
  sentiment_score: number;
  sentiment_label: 'positive' | 'neutral' | 'negative' | null;
  created_at: string;
};

export type PromptLibraryEntry = {
  id: string;
  title: string;
  prompt_text: string;
  category: 'text' | 'image' | 'code';
  tags: string[];
  created_at: string;
};

export type GeneratedContent = {
  id: string;
  prompt_id: string | null;
  content_type: 'text' | 'code' | 'image';
  prompt_used: string | null;
  generated_text: string | null;
  created_at: string;
};

export type ImageLibraryEntry = {
  id: string;
  category: string;
  image_url: string;
  thumb_url: string;
  photographer: string | null;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type SearchHistoryEntry = {
  id: string;
  query: string;
  results_count: number;
  created_at: string;
};
