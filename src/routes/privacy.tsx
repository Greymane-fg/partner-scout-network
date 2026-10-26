import { createFileRoute } from "@tanstack/react-router";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      {
        title: "Privacy Policy — Partner Hub",
        name: "description",
        content: "How Partner Hub collects, uses and protects your data.",
      },
      { property: "og:title", content: "Privacy Policy — Partner Hub" },
      { property: "og:description", content: "How Partner Hub collects, uses and protects your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "What we collect",
    body: "When you contact a partner we collect only what you type into the contact form: your name, the service you're looking for, and the view you're browsing. That information is used solely to prefill the message you send through your chosen contact channel — it is not stored on our servers.",
  },
  {
    title: "Partner data",
    body: "Partner profiles contain information the partners themselves provide: name, headline, bio, skills, projects, contact methods and reviews. Partners can edit or remove their information at any time from their dashboard.",
  },
  {
    title: "Accounts",
    body: "Agent accounts require an email address and password. We use your email only for authentication, invites and password resets. You can request account deletion at any time; deleting an account removes its profile and associated data.",
  },
  {
    title: "Reviews",
    body: "Reviews are public and displayed on partner profiles. Reviews can be removed by the partner they were left for or by network admins.",
  },
  {
    title: "Cookies",
    body: "We use only the cookies and local storage strictly necessary to keep signed-in agents authenticated. We do not run advertising or third-party tracking cookies. See our Cookie Policy for details.",
  },
  {
    title: "Your rights",
    body: "You may request access to, correction of, or deletion of any personal data we hold about you. Contact us through any partner's page or the network contact channels and we will respond promptly.",
  },
];

function PrivacyPage() {
  return (
    <ViewShell view="default">
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="font-view-label text-primary">Legal</p>
        <h1 className="mt-3 font-view-display text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
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
