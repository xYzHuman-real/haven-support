## Haven V2 — Implementation Plan

Expand Haven from exam-focused to a broader journey-based support platform. Keep V1 features working; layer V2 on top.

### 1. Database changes (one migration)

- `profiles`: add `journey text` (main category) and keep `exams text[]` but treat it as generic `subcategories` (no schema rename — code-level only) — OR add `subcategories text[]` and stop reading `exams`. Choosing **add `subcategories text[]`** + keep `exams` for backward compat.
- `mood_checkins`: already has `mood` + `day`. Reuse for mood history; no change.
- `encouragements`: already exists. Used for streak counts; no change.
- New table `badges` (catalog) — static, seeded:
  - `code text pk`, `name text`, `description text`, `emoji text`, `threshold int`, `kind text` (e.g. `encouragements_given`).
- New table `user_badges`:
  - `user_id`, `badge_code`, `unlocked_at` — PK (user_id, badge_code).
- New table `circles` (catalog of support circles):
  - `slug text pk`, `name text`, `emoji text`, `journey text`, `subcategory text`, `description text`.
- New table `circle_members`:
  - `user_id`, `circle_slug`, `joined_at` — PK (user_id, circle_slug).
- RPCs:
  - `get_encouragement_stats(_user_id uuid)` → given_total, given_this_week.
  - `get_mood_history(_user_id uuid, _days int)` → day, mood.
  - `get_circle_feed(_slug text)` → recent wins/struggles/goals + member count.
- Add GRANTs + RLS per project rules.

### 2. Onboarding redesign

- Replace `exam-select.tsx` flow with two-step journey picker:
  - Step 1: pick main journey (5 options).
  - Step 2: pick subcategories (multi-select) from chosen journey.
- Save `journey` + `subcategories` to `profiles`. Mark `onboarded=true`.
- Keep `onboarding.tsx` intro; route: intro → journey → subcategories → check-in.

### 3. Support Circles

- New route `/_authenticated/circles` — list circles filtered by user journey/subcategories, plus "All circles".
- Replace/augment `communities.$slug.tsx` to a circle screen: members count, recent wins, recent struggles, shared goals, Join/Leave button.
- Add a "Circles" bottom-nav tab (replace or sit next to Communities).

### 4. Encouragement streak

- On profile screen and home header: show "❤️ You encouraged N people this week" using new RPC.
- No like counts. Pure outgoing kindness.

### 5. Mood history

- New section on profile (or `/check-in` history view): weekly + monthly chart using `recharts` (already common). Show emoji legend.
- Expand mood enum if needed: V1 has moods; ensure `great/good/okay/struggling/exhausted` all valid. Check current enum and extend via migration if missing.

### 6. Helper badges

- Seed 4 starter badges in migration.
- After each encouragement insert, client checks count and unlocks badges (simple client-side or RPC `check_and_award_badges`).
- Display on profile.

### 7. UI polish

- Add fade-in/scale transitions on route changes.
- Improve empty states for feed, circles, mood history.
- Improve loading skeletons.
- Refine dark mode tokens in `styles.css`.

### Technical notes

- Migration runs first (separate approval step).
- Then code changes: new routes, updated onboarding, profile additions, circles screens, charts.
- Keep V1 routes working — exam selection becomes a special case of the journey flow (`journey='exams'`).

### Out of scope (per request)

DMs, calls, followers, likes, reels, stories, AI journaling, accountability partners.

### Files to create/edit (high level)

- `supabase/migrations/<new>.sql`
- `src/routes/onboarding.tsx` — rewrite as 2-step journey picker
- delete or repurpose `src/routes/exam-select.tsx`
- `src/lib/journeys.ts` — journey + subcategory catalog
- `src/routes/_authenticated/circles.tsx` + `.index.tsx` + `.$slug.tsx`
- `src/routes/_authenticated/profile.tsx` — add streak, badges, mood history
- `src/components/MoodChart.tsx`, `StreakCard.tsx`, `BadgeGrid.tsx`
- `src/styles.css` — empty/loading polish

Approve and I'll start with the migration.