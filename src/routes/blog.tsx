import { createFileRoute, Link } from "@tanstack/react-router";
import { blogListQuery } from "@/lib/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      {
        title: "Blog — Partner Hub",
        name: "description",
        content: "Insights, playbooks and notes from the Partner Hub partner network.",
      },
      { property: "og:title", content: "Blog — Partner Hub" },
      { property: "og:description", content: "Insights, playbooks and notes from the Partner Hub partner network." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(blogListQuery()),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(blogListQuery());

  return (
    <ViewShell view="default">
      <section className="relative border-b border-border px-6 py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-[20%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="font-view-label text-primary">Partner Hub · Blog</p>
          <h1 className="mt-4 font-view-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Insights from the network.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Playbooks, field notes and opinions from vetted specialists — written by the partners themselves.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No posts published yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="font-view-label text-muted-foreground">{p.authorName}</span>
                <h2 className="mt-3 font-view-display text-xl font-bold leading-snug text-foreground">
                  {p.title}
                </h2>
                {p.excerpt && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>}
                <span className="mt-auto pt-5 text-sm font-semibold text-primary transition-opacity group-hover:opacity-80">
                  Read article →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </ViewShell>
  );
}
