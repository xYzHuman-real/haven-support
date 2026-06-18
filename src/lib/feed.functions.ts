import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TEXT_MAX = 280;

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, exams, onboarded")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        display_name: z.string().trim().min(1).max(40).optional(),
        exams: z.array(z.string()).max(6).optional(),
        onboarded: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getTodayMood = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await context.supabase
      .from("mood_checkins")
      .select("mood, day")
      .eq("user_id", context.userId)
      .eq("day", today)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const submitMood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        mood: z.enum(["great", "good", "okay", "struggling", "exhausted", "peaceful"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await context.supabase.from("mood_checkins").upsert(
      { user_id: context.userId, mood: data.mood, day: today },
      { onConflict: "user_id,day" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const PostInput = z.object({
  win: z.string().trim().min(1).max(TEXT_MAX),
  struggle: z.string().trim().min(1).max(TEXT_MAX),
  goal: z.string().trim().min(1).max(TEXT_MAX),
  is_anonymous: z.boolean().default(false),
  community: z.string().nullable().optional(),
});

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PostInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("posts").insert({
      author_id: context.userId,
      win: data.win,
      struggle: data.struggle,
      goal: data.goal,
      is_anonymous: data.is_anonymous,
      community: data.community ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ community: z.string().nullable().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let q = supabase
      .from("posts")
      .select("id, win, struggle, goal, is_anonymous, community, created_at, author_id")
      .order("created_at", { ascending: false })
      .limit(40);
    if (data.community) q = q.eq("community", data.community);
    const { data: posts, error } = await q;
    if (error) throw new Error(error.message);
    if (!posts || posts.length === 0) return [];
    const authorIds = Array.from(new Set(posts.map((p) => p.author_id)));
    const postIds = posts.map((p) => p.id);
    const [{ data: profs }, { data: encs }] = await Promise.all([
      supabase.from("profiles").select("id, display_name").in("id", authorIds),
      supabase
        .from("encouragements")
        .select("post_id, kind")
        .in("post_id", postIds)
        .eq("giver_id", userId),
    ]);
    const nameMap = new Map((profs ?? []).map((p: any) => [p.id, p.display_name]));
    const mineMap = new Map<string, string[]>();
    (encs ?? []).forEach((e: any) => {
      const list = mineMap.get(e.post_id) ?? [];
      list.push(e.kind as string);
      mineMap.set(e.post_id, list);
    });
    return posts.map((p) => ({
      id: p.id,
      win: p.win,
      struggle: p.struggle,
      goal: p.goal,
      is_anonymous: p.is_anonymous,
      community: p.community,
      created_at: p.created_at,
      author_name: nameMap.get(p.author_id) ?? "Student",
      my_kinds: (mineMap.get(p.id) ?? []) as Array<
        "understand" | "keep_going" | "not_alone" | "proud"
      >,
    }));
  });

export const sendEncouragement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        postId: z.string().uuid(),
        kind: z.enum(["understand", "keep_going", "not_alone", "proud"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("encouragements")
      .insert({ post_id: data.postId, giver_id: context.userId, kind: data.kind });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const getEncouragementsToday = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { data, error } = await context.supabase
      .from("encouragements")
      .select("id, kind, created_at, post_id, posts(author_id, win, is_anonymous)")
      .eq("giver_id", context.userId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const unique = new Set((data ?? []).map((d: any) => d.posts?.author_id).filter(Boolean));
    return { count: data?.length ?? 0, students: unique.size, items: data ?? [] };
  });

export const getProfileStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [postsRes, encsRes, moodsRes, profileRes] = await Promise.all([
      supabase.from("posts").select("id", { head: true, count: "exact" }).eq("author_id", userId),
      supabase
        .from("encouragements")
        .select("id", { head: true, count: "exact" })
        .eq("giver_id", userId),
      supabase
        .from("mood_checkins")
        .select("day")
        .eq("user_id", userId)
        .order("day", { ascending: false })
        .limit(120),
      supabase.from("profiles").select("display_name, exams").eq("id", userId).maybeSingle(),
    ]);

    let streak = 0;
    const moods = moodsRes.data;
    if (moods && moods.length) {
      const set = new Set(moods.map((m: any) => m.day));
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      const todayKey = cursor.toISOString().slice(0, 10);
      if (!set.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
      while (set.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
    return {
      posts: postsRes.count ?? 0,
      encouragements: encsRes.count ?? 0,
      streak,
      display_name: profileRes.data?.display_name ?? "Student",
      exams: (profileRes.data?.exams as string[]) ?? [],
    };
  });

export const getCommunityCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("posts")
      .select("community")
      .not("community", "is", null);
    if (error) throw new Error(error.message);
    const counts: Record<string, number> = {};
    (data ?? []).forEach((r: any) => {
      counts[r.community] = (counts[r.community] ?? 0) + 1;
    });
    return counts;
  });
