import { createFileRoute, Link } from "@tanstack/react-router";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About — Partner Hub",
        name: "description",
        content: "Partner Hub is a curated network of specialist partners with verified track records.",
      },
      { property: "og:title", content: "About — Partner Hub" },
      { property: "og:description", content: "Partner Hub is a curated network of specialist partners with verified track records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    title: "Vetted, not voluminous",
    copy: "Every partner is added by an existing member of the network and reviewed by admins before they appear to clients.",
  },
  {
    title: "Specialists only",
    copy: "No generalist agencies. Each partner brings a specific discipline with results to back it up.",
  },
  {
    title: "Direct contact",
    copy: "No middlemen, no lead forms routed into a void. You reach the partner themselves, on the channel you prefer.",
  },
];

function AboutPage() {
  return (
    <ViewShell view="default">
      <section className="relative border-b border-border px-6 py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-[15%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl">
          <p className="font-view-label text-primary">About Partner Hub</p>
          <h1 className="mt-4 font-view-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            A curated network, presented the right way.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Partner Hub is a single network of specialist partners shown through
            three doors: a storefront for ecommerce brands, a boardroom-facing
            view for executive teams, and the partners' own space to manage their
            presence. Same people, right presentation.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              <h2 className="font-view-display text-lg font-bold text-foreground">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 max-w-2xl">
          <h2 className="font-view-display text-2xl font-bold text-foreground">How joining works</h2>
          <ol className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">1. Get invited.</span> Any existing agent can add a
              new partner by email — you'll receive an invite to set your password.
            </li>
            <li>
              <span className="font-semibold text-foreground">2. Build your profile.</span> Add your headline, bio,
              skills, projects and every contact channel you're reachable on.
            </li>
            <li>
              <span className="font-semibold text-foreground">3. Go live.</span> An admin approves your profile and
              you appear in both client views, tailored per audience.
            </li>
          </ol>
        </div>
      </section>
    </ViewShell>
  );
}
