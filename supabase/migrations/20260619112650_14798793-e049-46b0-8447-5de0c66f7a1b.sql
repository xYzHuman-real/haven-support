
-- 1. Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS journey text,
  ADD COLUMN IF NOT EXISTS subcategories text[] NOT NULL DEFAULT '{}';

-- 2. Badges catalog
CREATE TABLE IF NOT EXISTS public.badges (
  code text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  emoji text NOT NULL,
  kind text NOT NULL,
  threshold int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY badges_read_all ON public.badges FOR SELECT USING (true);

-- 3. User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code text NOT NULL REFERENCES public.badges(code) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_code)
);
GRANT SELECT, INSERT, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_badges_read_all ON public.user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY user_badges_insert_self ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_badges_delete_self ON public.user_badges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Circles catalog
CREATE TABLE IF NOT EXISTS public.circles (
  slug text PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL,
  journey text NOT NULL,
  subcategory text,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.circles TO anon, authenticated;
GRANT ALL ON public.circles TO service_role;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY circles_read_all ON public.circles FOR SELECT USING (true);

-- 5. Circle members
CREATE TABLE IF NOT EXISTS public.circle_members (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_slug text NOT NULL REFERENCES public.circles(slug) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, circle_slug)
);
GRANT SELECT, INSERT, DELETE ON public.circle_members TO authenticated;
GRANT ALL ON public.circle_members TO service_role;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY circle_members_read_all ON public.circle_members FOR SELECT TO authenticated USING (true);
CREATE POLICY circle_members_insert_self ON public.circle_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY circle_members_delete_self ON public.circle_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. RPC: encouragement stats
CREATE OR REPLACE FUNCTION public.get_encouragement_stats(_user_id uuid)
RETURNS TABLE(given_total bigint, given_this_week bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COUNT(*)::bigint AS given_total,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::bigint AS given_this_week
  FROM public.encouragements
  WHERE giver_id = _user_id;
$$;

-- 7. RPC: mood history
CREATE OR REPLACE FUNCTION public.get_mood_history(_user_id uuid, _days int DEFAULT 30)
RETURNS TABLE(day date, mood text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT day, mood::text
  FROM public.mood_checkins
  WHERE user_id = _user_id
    AND day >= (now() AT TIME ZONE 'UTC')::date - _days
  ORDER BY day ASC;
$$;

-- 8. RPC: circle feed
CREATE OR REPLACE FUNCTION public.get_circle_feed(_slug text)
RETURNS TABLE(
  id uuid, win text, struggle text, goal text,
  is_anonymous boolean, created_at timestamptz, author_id uuid
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.id, p.win, p.struggle, p.goal, p.is_anonymous, p.created_at,
    CASE WHEN p.is_anonymous THEN NULL ELSE p.author_id END
  FROM public.posts p
  WHERE p.community = _slug
  ORDER BY p.created_at DESC
  LIMIT 40;
$$;

-- 9. Seed badges
INSERT INTO public.badges (code, name, description, emoji, kind, threshold) VALUES
  ('first_encouragement', 'First Encouragement', 'You sent your first bit of kindness.', '🌱', 'encouragements_given', 1),
  ('kind_heart', 'Kind Heart', 'Encouraged 10 people.', '❤️', 'encouragements_given', 10),
  ('supporter', 'Supporter', 'Encouraged 50 people.', '🤝', 'encouragements_given', 50),
  ('community_builder', 'Community Builder', 'Encouraged 100 people.', '🌟', 'encouragements_given', 100)
ON CONFLICT (code) DO NOTHING;

-- 10. Seed circles
INSERT INTO public.circles (slug, name, emoji, journey, subcategory, description) VALUES
  ('neet', 'NEET Aspirants', '🩺', 'exams', 'NEET', 'Support for medical entrance prep.'),
  ('jee', 'JEE Aspirants', '⚙️', 'exams', 'JEE', 'For engineering entrance journeys.'),
  ('upsc', 'UPSC Aspirants', '📖', 'exams', 'UPSC', 'Civil services prep, together.'),
  ('ssc', 'SSC Aspirants', '📝', 'exams', 'SSC', 'SSC prep companions.'),
  ('banking', 'Banking Aspirants', '🏦', 'exams', 'Banking', 'Banking exams support.'),
  ('gate', 'GATE Aspirants', '🎯', 'exams', 'GATE', 'GATE prep circle.'),
  ('cat', 'CAT Aspirants', '📊', 'exams', 'CAT', 'MBA entrance support.'),
  ('ca', 'CA Aspirants', '📒', 'exams', 'CA', 'CA prep companions.'),
  ('early_risers', 'Early Risers', '⏰', 'productivity', 'Wake Up Early', 'Wake up early together.'),
  ('deep_work', 'Deep Work', '🧠', 'productivity', 'Deep Work', 'Long focus sessions.'),
  ('consistency', 'Consistency', '📅', 'productivity', 'Consistency', 'Show up daily.'),
  ('focus', 'Focus', '🎯', 'productivity', 'Focus', 'Stay focused together.'),
  ('digital_detox', 'Digital Detox', '📵', 'productivity', 'Digital Detox', 'Step back from screens.'),
  ('fitness', 'Fitness', '💪', 'self_improvement', 'Fitness', 'Move your body.'),
  ('reading', 'Reading', '📚', 'self_improvement', 'Reading', 'Read more books.'),
  ('meditation', 'Meditation', '🧘', 'self_improvement', 'Meditation', 'Calm the mind.'),
  ('confidence', 'Confidence', '✨', 'self_improvement', 'Confidence', 'Build self-belief.'),
  ('coding', 'Coding', '💻', 'career', 'Coding', 'Level up as a developer.'),
  ('freelancing', 'Freelancing', '🧑‍💻', 'career', 'Freelancing', 'Build your freelance path.'),
  ('startups', 'Startup Builders', '🚀', 'career', 'Startups', 'Build something new.'),
  ('job_prep', 'Job Preparation', '💼', 'career', 'Job Preparation', 'Land your next role.'),
  ('study_life', 'Study Life', '🎓', 'college', 'Study Life', 'Balance studies and life.'),
  ('placements', 'Placements', '🏢', 'college', 'Placements', 'Campus placement prep.'),
  ('college_stress', 'College Stress', '🫂', 'college', 'College Stress', 'You are not alone.')
ON CONFLICT (slug) DO NOTHING;
