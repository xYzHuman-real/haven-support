
-- Tighten direct SELECT on posts to the author only
DROP POLICY IF EXISTS posts_read_all_auth ON public.posts;

CREATE POLICY posts_read_own ON public.posts
  FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

-- Public feed view: omits author_id for anonymous posts.
-- Owned by postgres so it bypasses RLS on the underlying table.
CREATE OR REPLACE VIEW public.posts_feed
WITH (security_invoker = false) AS
SELECT
  id,
  win,
  struggle,
  goal,
  is_anonymous,
  community,
  created_at,
  CASE WHEN is_anonymous THEN NULL ELSE author_id END AS author_id
FROM public.posts;

GRANT SELECT ON public.posts_feed TO authenticated;
