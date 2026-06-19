
DROP VIEW IF EXISTS public.posts_feed;

CREATE OR REPLACE FUNCTION public.get_posts_feed(_community text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  win text,
  struggle text,
  goal text,
  is_anonymous boolean,
  community text,
  created_at timestamptz,
  author_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.win,
    p.struggle,
    p.goal,
    p.is_anonymous,
    p.community,
    p.created_at,
    CASE WHEN p.is_anonymous THEN NULL ELSE p.author_id END AS author_id
  FROM public.posts p
  WHERE (_community IS NULL OR p.community = _community)
  ORDER BY p.created_at DESC
  LIMIT 40;
$$;

REVOKE ALL ON FUNCTION public.get_posts_feed(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_posts_feed(text) TO authenticated;

-- Function to fetch a small batch of posts (for encouragements list), redacting author_id when anonymous.
CREATE OR REPLACE FUNCTION public.get_posts_redacted(_ids uuid[])
RETURNS TABLE (
  id uuid,
  win text,
  is_anonymous boolean,
  author_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.win,
    p.is_anonymous,
    CASE WHEN p.is_anonymous THEN NULL ELSE p.author_id END AS author_id
  FROM public.posts p
  WHERE p.id = ANY(_ids);
$$;

REVOKE ALL ON FUNCTION public.get_posts_redacted(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_posts_redacted(uuid[]) TO authenticated;

-- Community counts (was reading from posts directly)
CREATE OR REPLACE FUNCTION public.get_community_counts()
RETURNS TABLE (community text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.community, COUNT(*)::bigint
  FROM public.posts p
  WHERE p.community IS NOT NULL
  GROUP BY p.community;
$$;

REVOKE ALL ON FUNCTION public.get_community_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_community_counts() TO authenticated;
