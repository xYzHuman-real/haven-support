import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMoodHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ days: z.number().int().min(7).max(120).default(30) }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await (context.supabase as any).rpc("get_mood_history", {
      _user_id: context.userId,
      _days: data.days,
    });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Array<{ day: string; mood: string }>;
  });

export const getEncouragementStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any).rpc("get_encouragement_stats", {
      _user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    const row = (data ?? [])[0] ?? { given_total: 0, given_this_week: 0 };
    return {
      given_total: Number(row.given_total ?? 0),
      given_this_week: Number(row.given_this_week ?? 0),
    };
  });

export const getMyBadges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [allRes, mineRes] = await Promise.all([
      context.supabase
        .from("badges")
        .select("code, name, description, emoji, threshold, kind")
        .order("threshold", { ascending: true }),
      context.supabase
        .from("user_badges")
        .select("badge_code, unlocked_at")
        .eq("user_id", context.userId),
    ]);
    if (allRes.error) throw new Error(allRes.error.message);
    if (mineRes.error) throw new Error(mineRes.error.message);
    const mine = new Map((mineRes.data ?? []).map((r: any) => [r.badge_code, r.unlocked_at]));
    return (allRes.data ?? []).map((b: any) => ({
      ...b,
      unlocked: mine.has(b.code),
      unlocked_at: mine.get(b.code) ?? null,
    }));
  });

export const checkAndAwardBadges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { count } = await supabase
      .from("encouragements")
      .select("id", { head: true, count: "exact" })
      .eq("giver_id", userId);
    const given = count ?? 0;
    const { data: badges } = await supabase
      .from("badges")
      .select("code, threshold, kind")
      .eq("kind", "encouragements_given");
    const eligible = (badges ?? []).filter((b: any) => given >= b.threshold);
    if (eligible.length === 0) return { awarded: [] as string[] };
    const { data: existing } = await supabase
      .from("user_badges")
      .select("badge_code")
      .eq("user_id", userId);
    const have = new Set((existing ?? []).map((r: any) => r.badge_code));
    const toInsert = eligible.filter((b: any) => !have.has(b.code));
    if (toInsert.length === 0) return { awarded: [] as string[] };
    const { error } = await supabase
      .from("user_badges")
      .insert(toInsert.map((b: any) => ({ user_id: userId, badge_code: b.code })));
    if (error) throw new Error(error.message);
    return { awarded: toInsert.map((b: any) => b.code) };
  });

export const listCircles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [circlesRes, membersRes, mineRes] = await Promise.all([
      context.supabase
        .from("circles")
        .select("slug, name, emoji, journey, subcategory, description")
        .order("name"),
      context.supabase.from("circle_members").select("circle_slug"),
      context.supabase
        .from("circle_members")
        .select("circle_slug")
        .eq("user_id", context.userId),
    ]);
    if (circlesRes.error) throw new Error(circlesRes.error.message);
    const counts: Record<string, number> = {};
    (membersRes.data ?? []).forEach((r: any) => {
      counts[r.circle_slug] = (counts[r.circle_slug] ?? 0) + 1;
    });
    const mine = new Set((mineRes.data ?? []).map((r: any) => r.circle_slug));
    return (circlesRes.data ?? []).map((c: any) => ({
      ...c,
      member_count: counts[c.slug] ?? 0,
      joined: mine.has(c.slug),
    }));
  });

export const getCircle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const [meta, membersRes, joinedRes, feedRes] = await Promise.all([
      context.supabase
        .from("circles")
        .select("slug, name, emoji, journey, subcategory, description")
        .eq("slug", data.slug)
        .maybeSingle(),
      context.supabase
        .from("circle_members")
        .select("user_id", { head: true, count: "exact" })
        .eq("circle_slug", data.slug),
      context.supabase
        .from("circle_members")
        .select("user_id")
        .eq("circle_slug", data.slug)
        .eq("user_id", context.userId)
        .maybeSingle(),
      (context.supabase as any).rpc("get_circle_feed", { _slug: data.slug }),
    ]);
    if (meta.error) throw new Error(meta.error.message);
    return {
      circle: meta.data,
      member_count: membersRes.count ?? 0,
      joined: !!joinedRes.data,
      posts: (feedRes.data ?? []) as Array<any>,
    };
  });

export const toggleJoinCircle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ slug: z.string(), join: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.join) {
      const { error } = await context.supabase
        .from("circle_members")
        .insert({ user_id: context.userId, circle_slug: data.slug });
      if (error && !error.message.toLowerCase().includes("duplicate")) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await context.supabase
        .from("circle_members")
        .delete()
        .eq("user_id", context.userId)
        .eq("circle_slug", data.slug);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
