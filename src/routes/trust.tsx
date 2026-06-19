import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & Privacy · Haven" },
      {
        name: "description",
        content:
          "How Haven protects your data, handles anonymous posts, and what we store about your activity.",
      },
      { property: "og:title", content: "Trust & Privacy · Haven" },
      {
        property: "og:description",
        content:
          "How Haven protects your data, handles anonymous posts, and what we store about your activity.",
      },
    ],
  }),
  component: TrustPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-serif text-xl text-sage-900">{title}</h2>
      <div className="text-sm leading-relaxed text-sage-900/80 space-y-2">{children}</div>
    </section>
  );
}

function TrustPage() {
  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-12 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-sage-700">Trust</p>
          <h1 className="font-serif text-3xl text-sage-900">Privacy & security at Haven</h1>
          <p className="text-sm text-sage-900/70">
            This page is maintained by the Haven team to answer common questions about how the app
            handles your data. It is editable project content, not an independent certification.
          </p>
        </header>

        <Section title="Accounts & sign-in">
          <p>
            You sign in with email/password or Google. Sessions are stored in your browser only and
            are validated on every request to the backend.
          </p>
        </Section>

        <Section title="What we store">
          <p>
            Your display name, the exams you selected, your mood check-ins, the posts you write,
            and the encouragements you send or receive. Standard server logs may include request
            timestamps and error details for reliability.
          </p>
        </Section>

        <Section title="Anonymous posts">
          <p>
            When you tick &ldquo;Post anonymously&rdquo;, Haven hides your identity from other
            students. Author identifiers for anonymous posts are not returned by the backend feed
            &mdash; they are stripped before the post leaves the database. The author can still
            edit or delete their own posts.
          </p>
        </Section>

        <Section title="Access controls">
          <p>
            Database row-level security restricts every table to the rows each signed-in user is
            allowed to see. Sensitive admin operations are not exposed to the client.
          </p>
        </Section>

        <Section title="Backend & hosting">
          <p>
            Haven runs on Lovable Cloud (backed by Supabase for database, auth, and storage) and
            Cloudflare for delivery. These platforms provide encryption in transit and at rest.
            This is a factual description of the platforms used, not a certification claim about
            Haven itself.
          </p>
        </Section>

        <Section title="Data deletion">
          <p>
            To delete your account or specific posts, contact the Haven team. We will remove your
            profile, posts, mood check-ins, and encouragements you authored.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Security questions or concerns? Reach out to the Haven team through the support
            channel listed in the app.
          </p>
        </Section>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-sage-900 px-5 py-2 text-sm text-cream"
          >
            Back to Haven
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
