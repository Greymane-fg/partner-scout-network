import { createFileRoute } from "@tanstack/react-router";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      {
        title: "Cookie Policy — Partner Hub",
        name: "description",
        content: "How Partner Hub uses cookies and local storage.",
      },
      { property: "og:title", content: "Cookie Policy — Partner Hub" },
      { property: "og:description", content: "How Partner Hub uses cookies and local storage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CookiesPage,
});

const sections = [
  {
    title: "Strictly necessary only",
    body: "Partner Hub uses only the local storage and cookies strictly necessary to keep signed-in agents authenticated — an authentication session token and its refresh token. Without them, signed-in features like the agent dashboard cannot work.",
  },
  {
    title: "No tracking",
    body: "We do not run advertising cookies, analytics cookies or any third-party tracking. We do not sell or share browsing behaviour with anyone.",
  },
  {
    title: "Managing cookies",
    body: "If you never sign in, nothing beyond your normal browser storage is used. Signed-in agents can sign out at any time, which clears the stored session. You can also clear site data from your browser settings at any time.",
  },
];

function CookiesPage() {
  return (
    <ViewShell view="default">
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="font-view-label text-primary">Legal</p>
        <h1 className="mt-3 font-view-display text-4xl font-bold tracking-tight text-foreground">Cookie Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 2026</p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-view-display text-xl font-bold text-foreground">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </section>
    </ViewShell>
  );
}
