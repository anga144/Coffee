/*
# Seed Brew Haus Coffee Campaign Data

Populates all tables with realistic sample data for a local coffee shop targeting young adults and students.
*/

-- Campaigns
INSERT INTO campaigns (id, name, description, status, start_date, end_date, budget) VALUES
('a0000000-0000-0000-0000-000000000001', 'Back to School Brew', 'Back-to-school promotion targeting students with discounted study-brew bundles and campus-area pop-ups.', 'active', '2026-08-15', '2026-09-30', 3500.00),
('a0000000-0000-0000-0000-000000000002', 'Latte Art Contest', 'Instagram latte-art competition encouraging young adults to post their best latte art for a chance to win a month of free coffee.', 'active', '2026-08-01', '2026-09-15', 2000.00),
('a0000000-0000-0000-0000-000000000003', 'Study Session Specials', 'Late-night study hours with specialty drinks and snack bundles during finals season.', 'draft', '2026-09-20', '2026-10-15', 1500.00)
ON CONFLICT (id) DO NOTHING;

-- Social Posts
INSERT INTO social_posts (campaign_id, platform, content, image_url, status, scheduled_at, published_at, likes, comments, shares, reach) VALUES
('a0000000-0000-0000-0000-000000000001', 'instagram', 'Back to school means back to brew! Students get 20% off any study bundle this week. Show your student ID at checkout.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'published', '2026-08-15 09:00:00+00', '2026-08-15 09:00:00+00', 842, 67, 124, 12400),
('a0000000-0000-0000-0000-000000000001', 'facebook', 'New semester, new brew! Tag your study group and each person gets a free espresso shot with any large drink purchase.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'published', '2026-08-16 10:00:00+00', '2026-08-16 10:00:00+00', 521, 89, 45, 8200),
('a0000000-0000-0000-0000-000000000001', 'twitter', 'Finals week survival kit: large cold brew + pastry for $8. Because you deserve it. #BackToSchoolBrew', NULL, 'published', '2026-08-20 07:30:00+00', '2026-08-20 07:30:00+00', 289, 22, 78, 5600),
('a0000000-0000-0000-0000-000000000001', 'tiktok', 'POV: you found the best study spot in town iced caramel latte + free wifi + lo-fi beats', 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg', 'published', '2026-08-18 14:00:00+00', '2026-08-18 14:00:00+00', 3200, 145, 670, 45000),
('a0000000-0000-0000-0000-000000000002', 'instagram', 'Latte Art Contest! Post your best latte art, tag us, and use #BrewHausArt. Winner gets a month of free coffee!', 'https://images.pexels.com/photos/310150/pexels-photo-310150.jpeg', 'published', '2026-08-01 11:00:00+00', '2026-08-01 11:00:00+00', 1567, 234, 412, 23000),
('a0000000-0000-0000-0000-000000000002', 'tiktok', 'Watch our barista pour the perfect rosetta and try it yourself! #LatteArt #BrewHausArt', 'https://images.pexels.com/photos/310150/pexels-photo-310150.jpeg', 'published', '2026-08-05 16:00:00+00', '2026-08-05 16:00:00+00', 5400, 298, 1100, 78000),
('a0000000-0000-0000-0000-000000000002', 'facebook', 'The Latte Art Contest is live! Come in, order a latte, and try your hand at latte art. Post a photo to enter!', 'https://images.pexels.com/photos/310150/pexels-photo-310150.jpeg', 'published', '2026-08-03 09:00:00+00', '2026-08-03 09:00:00+00', 412, 56, 34, 6100),
('a0000000-0000-0000-0000-000000000002', 'twitter', 'The latte art entries are rolling in and they are GORGEOUS. Keep them coming with #BrewHausArt!', NULL, 'published', '2026-08-10 12:00:00+00', '2026-08-10 12:00:00+00', 445, 38, 92, 7300),
('a0000000-0000-0000-0000-000000000001', 'instagram', 'Study tip: hydration + caffeine = productivity. Come grab your study fuel and camp out with us.', 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg', 'scheduled', '2026-08-28 08:00:00+00', NULL, 0, 0, 0, 0),
('a0000000-0000-0000-0000-000000000001', 'tiktok', '3 drinks that will actually get you through your study session', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'draft', NULL, NULL, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- AI Advertisements
INSERT INTO ai_advertisements (campaign_id, headline, body_text, call_to_action, image_url, style, target_audience, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'Brew Brighter This Semester', 'Students get 20% off study bundles all September. Cold brew, espresso, and pastries made for marathon study sessions.', 'Show your student ID today', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'Vibrant & Energetic', 'College students 18-24', 'approved'),
('a0000000-0000-0000-0000-000000000001', 'Your Study Spot Just Got Better', 'Free WiFi, lo-fi beats, and the best cold brew on campus. Come for the coffee, stay for the vibes.', 'Find your seat', 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg', 'Cozy & Minimalist', 'Young adults 18-25', 'published'),
('a0000000-0000-0000-0000-000000000002', 'Can You Pour the Perfect Rosetta?', 'Enter our Latte Art Contest for a chance to win a month of free coffee. No experience needed, just creativity!', 'Enter now', 'https://images.pexels.com/photos/310150/pexels-photo-310150.jpeg', 'Playful & Bold', 'Coffee enthusiasts 20-30', 'approved'),
('a0000000-0000-0000-0000-000000000002', 'Latte Art Fridays', 'Every Friday in August, our baristas teach free latte art mini-lessons. Drop in and discover your inner barista.', 'Join us Friday', 'https://images.pexels.com/photos/310150/pexels-photo-310150.jpeg', 'Warm & Inviting', 'Young adults 18-28', 'draft')
ON CONFLICT DO NOTHING;

-- Surveys
INSERT INTO surveys (id, campaign_id, title, description, is_active) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Back to School Brew Feedback', 'Tell us about your study-brew experience and help us serve you better!', true),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Latte Art Contest Survey', 'How was your latte art contest experience?', true)
ON CONFLICT (id) DO NOTHING;

-- Survey Questions
INSERT INTO survey_questions (survey_id, question_text, question_type, options, display_order) VALUES
('b0000000-0000-0000-0000-000000000001', 'How would you rate your overall experience?', 'rating', NULL, 1),
('b0000000-0000-0000-0000-000000000001', 'Which drink did you order?', 'multiple_choice', '["Cold Brew","Iced Latte","Hot Coffee","Espresso","Other"]'::jsonb, 2),
('b0000000-0000-0000-0000-000000000001', 'What time of day do you usually visit?', 'multiple_choice', '["Morning (6-10am)","Midday (10am-2pm)","Afternoon (2-6pm)","Evening (6-10pm)","Late night (10pm+)"]'::jsonb, 3),
('b0000000-0000-0000-0000-000000000001', 'Any suggestions for our study-brew bundles?', 'text', NULL, 4),
('b0000000-0000-0000-0000-000000000002', 'How would you rate the contest?', 'rating', NULL, 1),
('b0000000-0000-0000-0000-000000000002', 'Did you learn something new about latte art?', 'multiple_choice', '["Yes, a lot!","A little","Not really"]'::jsonb, 2),
('b0000000-0000-0000-0000-000000000002', 'Would you participate again?', 'multiple_choice', '["Definitely","Maybe","Probably not"]'::jsonb, 3)
ON CONFLICT DO NOTHING;

-- Survey Responses
INSERT INTO survey_responses (id, survey_id, respondent_name, submitted_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Maya R.', '2026-08-16 10:30:00+00'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Jordan T.', '2026-08-17 14:15:00+00'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Anonymous', '2026-08-18 09:00:00+00'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Aisha K.', '2026-08-06 16:20:00+00'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Dev P.', '2026-08-08 11:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- Survey Answers
INSERT INTO survey_answers (response_id, question_id, answer_text, answer_rating, selected_option) VALUES
('c0000000-0000-0000-0000-000000000001', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=1), NULL, 5, NULL),
('c0000000-0000-0000-0000-000000000001', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=2), NULL, NULL, 'Cold Brew'),
('c0000000-0000-0000-0000-000000000001', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=3), NULL, NULL, 'Morning (6-10am)'),
('c0000000-0000-0000-0000-000000000001', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=4), 'Would love a decaf option in the study bundle!', NULL, NULL),
('c0000000-0000-0000-0000-000000000002', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=1), NULL, 4, NULL),
('c0000000-0000-0000-0000-000000000002', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=2), NULL, NULL, 'Iced Latte'),
('c0000000-0000-0000-0000-000000000002', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=3), NULL, NULL, 'Afternoon (2-6pm)'),
('c0000000-0000-0000-0000-000000000003', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=1), NULL, 3, NULL),
('c0000000-0000-0000-0000-000000000003', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=2), NULL, NULL, 'Hot Coffee'),
('c0000000-0000-0000-0000-000000000003', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000001' AND display_order=3), NULL, NULL, 'Midday (10am-2pm)'),
('c0000000-0000-0000-0000-000000000004', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000002' AND display_order=1), NULL, 5, NULL),
('c0000000-0000-0000-0000-000000000004', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000002' AND display_order=2), NULL, NULL, 'Yes, a lot!'),
('c0000000-0000-0000-0000-000000000004', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000002' AND display_order=3), NULL, NULL, 'Definitely'),
('c0000000-0000-0000-0000-000000000005', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000002' AND display_order=1), NULL, 4, NULL),
('c0000000-0000-0000-0000-000000000005', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000002' AND display_order=2), NULL, NULL, 'A little'),
('c0000000-0000-0000-0000-000000000005', (SELECT id FROM survey_questions WHERE survey_id='b0000000-0000-0000-0000-000000000002' AND display_order=3), NULL, NULL, 'Maybe')
ON CONFLICT DO NOTHING;

-- Competitions
INSERT INTO competitions (id, campaign_id, title, description, prize, rules, start_date, end_date, status, entry_count) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Latte Art Showdown', 'Post your best latte art on Instagram, tag @brewhaus, and use #BrewHausArt. Top 3 entries win prizes!', '1 month of free coffee (1 drink/day) + featured on our socials', '1. Follow @brewhaus on Instagram. 2. Post a photo of your latte art. 3. Tag us and use #BrewHausArt. 4. One entry per person. 5. Entries judged on creativity and technique.', '2026-08-01', '2026-09-15', 'active', 47),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Study Selfie Contest', 'Snap a selfie at your study spot with a Brew Haus cup and share it. Most creative wins!', 'Free study bundle for a week + Brew Haus merch', '1. Follow us on TikTok. 2. Post a study selfie with a Brew Haus cup. 3. Tag @brewhaus. 4. One entry per person.', '2026-08-15', '2026-09-30', 'active', 23)
ON CONFLICT (id) DO NOTHING;

-- Competition Entries
INSERT INTO competition_entries (competition_id, entrant_name, entrant_email, entry_note) VALUES
('d0000000-0000-0000-0000-000000000001', 'Maya Rodriguez', 'maya.r@email.com', 'First time trying latte art, so proud of this rosetta!'),
('d0000000-0000-0000-0000-000000000001', 'Jordan Taylor', 'jordan.t@email.com', 'My tulip pour is getting better every day!'),
('d0000000-0000-0000-0000-000000000001', 'Aisha Khan', 'aisha.k@email.com', 'Swan attempt number 5, finally got it!'),
('d0000000-0000-0000-0000-000000000001', 'Dev Patel', 'dev.p@email.com', 'Abstract art latte, because why not?'),
('d0000000-0000-0000-0000-000000000001', 'Liam OBrien', 'liam.o@email.com', 'Heart pour for my study group!'),
('d0000000-0000-0000-0000-000000000002', 'Sophia Lee', 'sophia.l@email.com', 'Study selfie with my iced caramel latte at 2am, we persevere!'),
('d0000000-0000-0000-0000-000000000002', 'Noah Garcia', 'noah.g@email.com', 'Brew Haus is my second home during finals week.'),
('d0000000-0000-0000-0000-000000000002', 'Emma Chen', 'emma.c@email.com', 'Study squad selfie with matching cold brews!')
ON CONFLICT DO NOTHING;

-- Reviews with sentiment
INSERT INTO reviews (source, author_name, rating, review_text, sentiment_score, sentiment_label) VALUES
('google', 'Sarah M.', 5, 'Absolutely love this place! The cold brew is the best in the neighborhood and the staff are so friendly. Perfect study spot with great WiFi.', 0.92, 'positive'),
('yelp', 'James K.', 5, 'Brew Haus has become my go-to study spot. The atmosphere is cozy, the coffee is excellent, and they play the best lo-fi music. Highly recommend!', 0.88, 'positive'),
('instagram', 'coffee_lover_22', 4, 'Beautiful latte art and tasty drinks. A bit crowded during peak hours but worth the wait. The baristas really know their craft.', 0.65, 'positive'),
('google', 'Mike R.', 2, 'Coffee was decent but the wait was way too long. Almost 20 minutes for a simple latte. They need more staff during busy hours.', -0.55, 'negative'),
('yelp', 'Ashley P.', 5, 'The Back to School Brew deal is amazing! Got a large cold brew and a pastry for such a good price. Will definitely be back.', 0.85, 'positive'),
('facebook', 'Tom B.', 3, 'Coffee is good, prices are okay. Nothing special but a solid neighborhood spot. The WiFi could be faster though.', 0.10, 'neutral'),
('google', 'Jenny L.', 1, 'Really disappointed. My order was wrong twice and the staff seemed annoyed when I asked them to fix it. Wont be back.', -0.82, 'negative'),
('instagram', 'studygram_life', 5, 'My absolute favorite study spot! The iced caramel latte is perfection and the vibe is immaculate. Thank you Brew Haus for keeping me fueled!', 0.94, 'positive'),
('twitter', 'night_owl_99', 4, 'Late night study hours are a lifesaver during finals. Coffee is solid and the playlist is perfect for focusing.', 0.72, 'positive'),
('yelp', 'Chris D.', 2, 'Wanted to love it but the coffee tasted burnt and the place was too loud to study. Maybe I came on a bad day.', -0.48, 'negative'),
('google', 'Priya S.', 5, 'The latte art contest was so much fun! The baristas taught me how to pour a heart. Such a welcoming community here.', 0.90, 'positive'),
('facebook', 'Marcus W.', 3, 'Decent coffee, friendly staff. Prices are a bit high for a student budget but the study bundles help.', 0.15, 'neutral')
ON CONFLICT DO NOTHING;

-- Prompt Library
INSERT INTO prompt_library (title, prompt_text, category, tags) VALUES
('Instagram Caption - Study Brew', 'Write a catchy Instagram caption for a coffee shop promoting its study bundle deal targeting college students. Include emojis and a call-to-action. Tone: energetic, relatable, Gen-Z friendly.', 'text', ARRAY['instagram','caption','students','social-media']),
('Facebook Post - Community Event', 'Write a Facebook post announcing a latte art workshop at a local coffee shop. Include date, time, what to expect, and a warm community-focused tone.', 'text', ARRAY['facebook','event','community']),
('TikTok Script - Study POV', 'Write a 15-second TikTok script for a coffee shop showing a POV study session. Include visual cues, text overlays, and a trending-style hook.', 'text', ARRAY['tiktok','script','study','video']),
('Twitter Thread - Coffee Facts', 'Write a 5-tweet thread about the benefits of coffee for studying, with the last tweet promoting a study bundle deal. Keep each tweet under 280 characters.', 'text', ARRAY['twitter','thread','coffee-facts']),
('Ad Headline Generator', 'Generate 5 attention-grabbing ad headlines for a coffee shop targeting young adults. Each headline should be under 8 words and convey energy and quality.', 'text', ARRAY['ad','headline','copywriting']),
('Coffee Product Photography', 'A cozy coffee shop scene with a beautifully crafted latte on a wooden table, warm natural lighting, steam rising, blurred background with students studying. Professional product photography style.', 'image', ARRAY['coffee','product','photography','cozy']),
('Study Spot Aesthetic', 'Aesthetic flat lay of a study setup with a cold brew coffee, notebook, laptop, and headphones on a marble desk. Top-down view, soft natural light, minimalist style.', 'image', ARRAY['study','flat-lay','aesthetic','minimalist']),
('Latte Art Close-Up', 'Close-up of a barista pouring latte art into a cup, creating a rosetta pattern. Warm tones, shallow depth of field, artisanal coffee shop atmosphere.', 'image', ARRAY['latte-art','barista','close-up','artisanal']),
('TikTok Video Thumbnail', 'Vibrant coffee shop interior with neon sign, young people enjoying coffee, trendy aesthetic, perfect for TikTok thumbnail. Bold colors, energetic mood.', 'image', ARRAY['tiktok','thumbnail','vibrant','trendy']),
('Email Newsletter Template', 'Generate HTML email newsletter markup for a coffee shop monthly update. Include a hero section, featured drinks, upcoming events, and a footer with social links. Use inline CSS and a warm color scheme.', 'code', ARRAY['email','html','newsletter','template']),
('Landing Page Component', 'Generate a React + Tailwind landing page hero section for a coffee shop campaign. Include a headline, subheadline, CTA button, and a background image placeholder. Responsive and animated.', 'code', ARRAY['react','tailwind','landing-page','component']),
('Social Media Scheduler API', 'Generate a TypeScript function that schedules social media posts across multiple platforms. Include types for Post, Platform, and ScheduleResult. Handle rate limiting and error cases.', 'code', ARRAY['typescript','api','scheduling','social-media'])
ON CONFLICT DO NOTHING;

-- Generated content samples
INSERT INTO generated_content (content_type, prompt_used, generated_text) VALUES
('text', 'Write a catchy Instagram caption for a coffee shop promoting its study bundle deal targeting college students.', 'study mode: ON iced cold brew + fresh pastry to keep you going show your student ID for 20% off the study bundle let us fuel your finals grind'),
('text', 'Generate 5 attention-grabbing ad headlines for a coffee shop targeting young adults.', '1. Brew Bold, Study Harder
2. Your Coffee, Your Vibe
3. Fuel Your Hustle
4. Sip. Study. Succeed.
5. Wake Up to Better'),
('code', 'Generate a React + Tailwind landing page hero section for a coffee shop campaign.', 'export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-amber-900">Brew Brighter</h1>
        <p className="mt-4 text-lg text-amber-700">Your study spot, perfected.</p>
        <button className="mt-8 px-8 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition">
          Order Now
        </button>
      </div>
    </section>
  );
}')
ON CONFLICT DO NOTHING;
