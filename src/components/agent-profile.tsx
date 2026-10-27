import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, BadgeCheck, ExternalLink, MapPin, Quote, Star } from "lucide-react";
import { toast } from "sonner";
import { agentProfileQuery } from "@/lib/queries";
import { ContactSection } from "@/components/contact-section";
import { supabase } from "@/integrations/supabase/client";

type ProfileView = "ecom" | "exec";

function SectionLabel({ children }: { children: string }) {
  return <p className="font-view-label text-primary">{children}</p>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-border bg-card/80 shadow-sm backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  if (url) {
    return (
      <div className="relative">
        <div aria-hidden className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-accent/20 to-transparent blur-xl" />
        <img
          src={url}
          alt={name}
          className="relative h-64 w-64 rounded-[2.5rem] border border-border object-cover shadow-lg md:h-80 md:w-80"
        />
      </div>
    );
  }
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-accent/20 to-transparent blur-xl" />
      <div className="relative grid h-64 w-64 place-items-center rounded-[2.5rem] border border-border bg-gradient-to-br from-primary/20 to-accent/20 font-view-display text-6xl font-bold text-primary shadow-lg md:h-80 md:w-80">
        {initials}
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

function ReviewForm({ agentId, partnerId, view }: { agentId: string; partnerId: string; view: ProfileView }) {
  const qc = useQueryClient();
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      agent_id: agentId,
      author_name: author.trim() || "Anonymous client",
      rating,
      content: content.trim(),
      source_view: view,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not post your review. Please try again.");
      return;
    }
    toast.success("Thank you — your review is now live.");
    setAuthor("");
    setContent("");
    setRating(5);
    qc.invalidateQueries({ queryKey: ["agent", partnerId] });
    qc.invalidateQueries({ queryKey: ["agents"] });
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-3xl border border-border bg-card/80 p-6 backdrop-blur">
      <p className="font-view-label text-muted-foreground">Worked with this partner? Leave a review</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          maxLength={80}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
        />
        <label className="flex items-center gap-3 rounded-xl border border-input bg-background px-3.5 py-2.5">
          <span className="text-sm text-muted-foreground">Rating</span>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            aria-label="Rating"
            className="bg-transparent text-sm font-semibold text-foreground outline-none"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What was it like working together?"
        aria-label="Your review"
        rows={3}
        maxLength={1000}
        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Post review
      </button>
    </form>
  );
}

export function AgentProfilePage({ partnerId, view }: { partnerId: string; view: ProfileView }) {
  const { data: agent } = useSuspenseQuery(agentProfileQuery(partnerId, view));

  if (!agent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="text-muted-foreground">This partner profile is not available.</p>
      </div>
    );
  }

  const firstName = agent.fullName.split(" ")[0] ?? agent.fullName;

  return (
    <div className="relative overflow-hidden">
      {/* Decorative orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-[40rem] -left-40 h-[26rem] w-[26rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Hero header */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 pb-20 pt-16 md:flex-row md:items-center md:gap-16 md:pt-24">
        <div className="min-w-0 flex-1">
          <p className="font-view-label text-primary">Partner ID · {agent.partnerId}</p>
          <h1 className="mt-4 font-view-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            {agent.fullName}
          </h1>
          {agent.headline && (
            <p className="mt-4 max-w-xl text-xl text-muted-foreground">{agent.headline}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {agent.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {agent.location}
              </span>
            )}
            {agent.avgRating != null && (
              <span className="flex items-center gap-2">
                <Stars rating={Math.round(agent.avgRating)} />
                <span className="font-semibold text-foreground">{agent.avgRating}</span>
                <span>({agent.reviewCount} reviews)</span>
              </span>
            )}
          </div>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Start a project <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="relative shrink-0">
          <Avatar url={agent.avatarUrl} name={agent.fullName} />
          {agent.avgRating != null && (
            <div className="absolute -bottom-6 -left-8 hidden rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-lg backdrop-blur md:block">
              <p className="font-view-display text-2xl font-bold text-primary">{agent.avgRating} ★</p>
              <p className="font-view-label text-muted-foreground">Client rating</p>
            </div>
          )}
          <div className="absolute -right-6 top-8 hidden rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-lg backdrop-blur md:block">
            <p className="font-view-display text-2xl font-bold text-foreground">{agent.skills.length}</p>
            <p className="font-view-label text-muted-foreground">Skills listed</p>
          </div>
        </div>
      </section>

      {/* About */}
      {agent.bio && (
        <section className="relative mx-auto w-full max-w-6xl px-6 py-14">
          <GlassCard className="grid gap-8 p-8 md:grid-cols-[1fr_1.4fr] md:p-10">
            <div>
              <SectionLabel>About</SectionLabel>
              <h2 className="mt-3 font-view-display text-2xl font-bold text-foreground">
                Background & focus
              </h2>
            </div>
            <div>
              <p className="text-base leading-relaxed text-muted-foreground">{agent.bio}</p>
              <div className="mt-6 flex flex-wrap gap-6">
                <div>
                  <p className="font-view-display text-xl font-bold text-foreground">{agent.projects.length}</p>
                  <p className="font-view-label text-muted-foreground">Projects</p>
                </div>
                <div>
                  <p className="font-view-display text-xl font-bold text-foreground">{agent.skills.length}</p>
                  <p className="font-view-label text-muted-foreground">Skills</p>
                </div>
                <div>
                  <p className="font-view-display text-xl font-bold text-foreground">{agent.reviewCount}</p>
                  <p className="font-view-label text-muted-foreground">Reviews</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>
      )}

      {/* Skills */}
      {agent.skills.length > 0 && (
        <section className="relative mx-auto w-full max-w-6xl px-6 py-10">
          <SectionLabel>Skills</SectionLabel>
          <h2 className="mt-3 font-view-display text-2xl font-bold text-foreground">What {firstName} does</h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {agent.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {agent.projects.length > 0 && (
        <section className="relative mx-auto w-full max-w-6xl px-6 py-10">
          <SectionLabel>Selected work</SectionLabel>
          <h2 className="mt-3 font-view-display text-2xl font-bold text-foreground">Projects & results</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {agent.projects.map((p) => (
              <GlassCard key={p.id} className="flex flex-col p-7">
                <h3 className="font-view-display text-lg font-bold text-foreground">{p.title}</h3>
                {p.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                )}
                {p.result && (
                  <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <BadgeCheck className="h-3.5 w-3.5" /> {p.result}
                  </p>
                )}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary hover:opacity-80"
                  >
                    View project <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-10">
        <SectionLabel>Testimonials</SectionLabel>
        <h2 className="mt-3 font-view-display text-2xl font-bold text-foreground">What clients say</h2>
        {agent.reviews.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {agent.reviews.slice(0, 6).map((r) => (
              <GlassCard key={r.id} className="flex flex-col p-6">
                <Quote className="h-5 w-5 text-primary/60" />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">{r.content}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{r.authorName}</span>
                  <Stars rating={r.rating} />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No reviews yet — be the first.</p>
        )}
        <ReviewForm agentId={agent.id} partnerId={agent.partnerId} view={view} />
      </section>

      {/* Blog posts */}
      {agent.posts.length > 0 && (
        <section className="relative mx-auto w-full max-w-6xl px-6 py-10">
          <SectionLabel>Published</SectionLabel>
          <h2 className="mt-3 font-view-display text-2xl font-bold text-foreground">Recent articles</h2>
          <div className="mt-6 space-y-3">
            {agent.posts.map((p) => (
              <a
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur transition-colors hover:bg-secondary"
              >
                <div className="min-w-0">
                  <p className="truncate font-view-display text-base font-bold text-foreground">{p.title}</p>
                  {p.excerpt && <p className="truncate text-sm text-muted-foreground">{p.excerpt}</p>}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="relative mx-auto w-full max-w-4xl scroll-mt-24 px-6 py-16">
        <GlassCard className="p-8 md:p-10">
          <SectionLabel>Let's connect</SectionLabel>
          <h2 className="mt-3 font-view-display text-2xl font-bold text-foreground">
            Work with {firstName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your name and the service you need — every contact option below arrives prefilled.
          </p>
          <div className="mt-6">
            <ContactSection methods={agent.contactMethods} agentFirstName={firstName} view={view} />
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
