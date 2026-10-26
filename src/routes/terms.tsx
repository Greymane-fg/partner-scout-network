import { createFileRoute } from "@tanstack/react-router";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      {
        title: "Terms of Service — Partner Hub",
        name: "description",
        content: "The terms that govern the use of Partner Hub.",
      },
      { property: "og:title", content: "Terms of Service — Partner Hub" },
      { property: "og:description", content: "The terms that govern the use of Partner Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "The service",
    body: "Partner Hub is a directory that presents vetted independent partners to prospective clients and lets clients contact partners directly. We are not a party to any agreement between a client and a partner.",
  },
  {
    title: "No endorsement of outcomes",
    body: "Partner profiles, projects and reviews are provided by the partners themselves. While the network vets members before they appear publicly, we make no warranty as to the outcome, quality or fitness of any work a partner performs.",
  },
  {
    title: "Partner conduct",
    body: "Partners agree to present accurate information about their skills, projects and contact channels, to keep their profiles current, and to conduct themselves professionally with clients and other partners. Admins may remove any partner, project or review at their discretion.",
  },
  {
    title: "Client conduct",
    body: "Clients agree to use the contact channels to make genuine inquiries only. Spam, scraping and harassment of partners through the platform's contact channels are prohibited.",
  },
  {
    title: "Intellectual property",
    body: "Partners retain ownership of the content they publish, including blog posts and project descriptions. By publishing on Partner Hub, partners grant the network a non-exclusive license to display that content on the site.",
  },
  {
    title: "Changes",
    body: "We may update these terms from time to time. Continued use of the site after a change constitutes acceptance of the updated terms.",
  },
];

function TermsPage() {
  return (
    <ViewShell view="default">
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="font-view-label text-primary">Legal</p>
        <h1 className="mt-3 font-view-display text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
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
