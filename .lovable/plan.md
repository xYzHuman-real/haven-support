## Haven v1 — Implementation Plan

A mobile-first web app for students to share one Win, one Struggle, one Goal per day, check in on mood, and encourage each other. Built on TanStack Start + Lovable Cloud, using the **Serene Academic Journal** design direction (cream background, sage greens, Instrument Serif headings, Inter body).

### Design tokens (locked, from chosen direction)
- Colors: `--sage-50 #f4f7f4`, `--sage-100 #e8f0e6`, `--sage-600 #4f7942`, `--sage-900 #1a2e15`, `--cream #fdfdfb`. Accent labels: emerald (Win), amber (Struggle), blue (Goal).
- Fonts: Instrument Serif (italic display) + Inter (body), loaded via `<link>` in `__root.tsx`.
- Phone frame centered on desktop (390×844), full-screen on mobile.

### Screen flow (routes)

```text
/                       Splash (auto-advances to /onboarding or /home)
/onboarding             3-step onboarding carousel → /exam-select
/exam-select            Pick 1+ exam tracks → /auth (or /check-in if logged in)
/auth                   Email + Google sign-in/up
/_authenticated/check-in    Daily mood check-in (skips if today already logged)
/_authenticated/home        Feed with greeting, mood chip, posts
/_authenticated/create      Compose Win/Struggle/Goal + anon toggle
/_authenticated/communities Grid of exam communities
/_authenticated/communities/$slug   Community feed
/_authenticated/encourage   Today's encouragements summary
/_authenticated/profile     Streak, counts, exams, sign out
```

Bottom tab bar (Home / Communities / Encourage / Profile) on all `_authenticated` screens.

### Backend (Lovable Cloud)

Enable Cloud, then one migration creates:

- `profiles` — `id` (FK auth.users), `display_name`, `avatar_initials`, `exams text[]`, `onboarded bool`, timestamps. Trigger auto-creates on signup.
- `mood_checkins` — `id`, `user_id`, `mood` (enum: great/good/okay/struggling/exhausted/peaceful), `created_at`, `date` (generated). Unique on (user_id, date).
- `posts` — `id`, `author_id`, `win`, `struggle`, `goal`, `is_anonymous bool`, `community` (nullable exam slug), `created_at`.
- `encouragements` — `id`, `post_id`, `giver_id`, `kind` (enum: understand/keep_going/not_alone/proud), `created_at`. Unique on (post_id, giver_id, kind).

All tables: `GRANT` to `authenticated` + `service_role`, RLS enabled.
- Profiles: each user reads/updates own; everyone authenticated can read display info.
- Posts: insert as self; read all; update/delete own. Anonymous posts hide author client-side (author_id still stored for moderation).
- Mood: own rows only.
- Encouragements: insert as self, read all, delete own.

Derived counts come from `count()` queries (no follower/like metrics surfaced anywhere).

### Data access pattern

TanStack Query + `createServerFn` with `requireSupabaseAuth`:
- `getFeed`, `getProfile`, `getTodayMood`, `getCommunities`, `getEncouragementsToday`, `getMyStreak` — server fns under `src/lib/*.functions.ts`.
- Mutations: `submitMood`, `createPost`, `sendEncouragement`, `updateExams`, `completeOnboarding`.
- Public auth/onboarding screens use browser supabase client directly.

### v1 explicitly excludes
Followers, following, likes, reels, stories, chat, calls, AI, accountability partners, red badges, viral metrics. Encouragement buttons show counts only on your own posts (privately).

### Build order
1. Enable Lovable Cloud; configure Google + email auth.
2. Migration: enums, tables, grants, RLS policies, profile trigger.
3. Design tokens in `src/styles.css`; font link in `__root.tsx`; `MobileFrame` + `TabBar` components.
4. Public routes: Splash, Onboarding (3 panels), Exam Select, Auth.
5. `_authenticated` shell + Check-in gate.
6. Home feed (server fn + `useSuspenseQuery`) and PostCard with support buttons.
7. Create Post screen (form, anon toggle, validation via zod).
8. Communities list + community detail.
9. Encourage screen (today's summary).
10. Profile (streak calc from `mood_checkins`, counts, sign out).
11. Verify build + walk through preview in mobile viewport.

### Technical notes
- Mobile-first; on ≥640px, content rendered inside a centered 390-wide phone frame with subtle shadow on a zinc-100 backdrop.
- Streak = consecutive days with a `mood_checkins` row ending today/yesterday, computed in a server fn.
- Anonymous toggle hides display_name → renders "Anonymous" + neutral avatar in feed; author_id retained server-side.
- All forms use zod schemas; text fields capped (Win/Struggle/Goal ≤ 280 chars).
- No `useEffect`+`fetch` for initial data — always loader-primed queries.

