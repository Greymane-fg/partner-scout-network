import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Store, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Partner Hub — one network, three doors",
        name: "description",
        content:
          "Partner Hub is a curated network of specialist partners. Choose your door: ecommerce brands, executive teams, or the agent network.",
      },
      { property: "og:title", content: "Partner Hub — one network, three doors" },
      {
        property: "og:description",
        content:
          "Partner Hub is a curated network of specialist partners. Choose your door: ecommerce brands, executive teams, or the agent network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gateway,
});

const doors = [
  {
    view: "view-ecom",
    icon: Store,
    tag: "Ecom",
    title: "Ecommerce brands",
    copy: "Operators, growth marketers and specialists for DTC and marketplace brands.",
    to: "/ecom",
  },
  {
    view: "view-exec",
    icon: Building2,
    tag: "Executive",
    title: "White collar executives",
    copy: "Strategy, finance and transformation partners vetted for board-level work.",
    to: "/exec",
  },
  {
    view: "view-agent",
    icon: Users,
    tag: "Agent",
    title: "Agent network",
    copy: "The partners' own door: manage your profile, skills, projects and blog.",
    to: "/agent",
  },
];

function Gateway() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-view-display text-sm font-bold text-primary-foreground">
            PH
          </span>
          <span className="font-view-display text-lg font-bold text-foreground">Partner Hub</span>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16">
        <p className="font-view-label text-muted-foreground">One network — three doors</p>
        <h1 className="mt-3 max-w-2xl font-view-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
          The right specialist, presented the right way.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Every audience gets its own experience of the same vetted network. Pick yours below — each
          view is self-contained, with its own design, search and contact channels.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {doors.map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className={`${d.view} group rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-view-label text-accent-foreground">
                <d.icon className="h-3.5 w-3.5" /> {d.tag}
              </span>
              <h2 className="mt-4 font-view-display text-xl font-bold text-foreground">{d.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{d.copy}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Enter
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Partner Hub ·{" "}
        <Link to="/terms" className="hover:underline">
          Terms
        </Link>{" "}
        ·{" "}
        <Link to="/cookies" className="hover:underline">
          Cookies
        </Link>
      </footer>
    </div>
  );
}
