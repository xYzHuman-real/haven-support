
-- Enums
CREATE TYPE public.mood_kind AS ENUM ('great','good','okay','struggling','exhausted','peaceful');
CREATE TYPE public.encouragement_kind AS ENUM ('understand','keep_going','not_alone','proud');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Student',
  exams TEXT[] NOT NULL DEFAULT '{}',
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_all_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Mood check-ins
CREATE TABLE public.mood_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood public.mood_kind NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  UNIQUE (user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_checkins TO authenticated;
GRANT ALL ON public.mood_checkins TO service_role;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mood_self_all" ON public.mood_checkins FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  win TEXT NOT NULL,
  struggle TEXT NOT NULL,
  goal TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  community TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX posts_created_at_idx ON public.posts (created_at DESC);
CREATE INDEX posts_community_idx ON public.posts (community);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read_all_auth" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_self" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Encouragements
CREATE TABLE public.encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.encouragement_kind NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, giver_id, kind)
);
CREATE INDEX encouragements_post_idx ON public.encouragements (post_id);
CREATE INDEX encouragements_giver_day_idx ON public.encouragements (giver_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encouragements TO authenticated;
GRANT ALL ON public.encouragements TO service_role;
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enc_read_all_auth" ON public.encouragements FOR SELECT TO authenticated USING (true);
CREATE POLICY "enc_insert_self" ON public.encouragements FOR INSERT TO authenticated WITH CHECK (auth.uid() = giver_id);
CREATE POLICY "enc_delete_own" ON public.encouragements FOR DELETE TO authenticated USING (auth.uid() = giver_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
