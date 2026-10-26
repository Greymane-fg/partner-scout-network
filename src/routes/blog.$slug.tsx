import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { blogPostQuery } from "@/lib/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    return [
      {
        title: post ? `${post.title} — Partner Hub Blog` : "Article — Partner Hub Blog",
        name: "description",
        content: post?.excerpt ?? "An article from the Partner Hub partner network.",
      },
      { property: "og:title", content: post ? `${post.title} — Partner Hub Blog` : "Article — Partner Hub Blog" },
      {
        property: "og:description",
        content: post?.excerpt ?? "An article from the Partner Hub partner network.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
  },
  loader: async ({ params, context }) => ({
    post: await context.queryClient.ensureQueryData(blogPostQuery(params.slug)),
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { post } = Route.useLoaderData();
  if (!post) throw notFound();

  return (
    <ViewShell view="default">
      <article className="relative mx-auto w-full max-w-3xl px-6 py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-[30%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative">
          <p className="font-view-label text-muted-foreground">
            {post.authorName} ·{" "}
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-4 font-view-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>}
          <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground">
            {post.body.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-12 border-t border-border pt-6">
            <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">
              ← All articles
            </Link>
          </div>
        </div>
      </article>
    </ViewShell>
  );
}
