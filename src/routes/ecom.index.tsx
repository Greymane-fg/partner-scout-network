import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AgentCard } from "@/components/agent-card";
import { agentListQuery } from "@/lib/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/ecom/")({
  head: () => ({
    meta: [
      {
        title: "Ecommerce Partners — Partner Hub",
        name: "description",
        content:
          "Find vetted ecommerce partners: operations, paid media, retention and more. Search by skill, service, name or partner ID.",
      },
      { property: "og:title", content: "Ecommerce Partners — Partner Hub" },
      {
        property: "og:description",
        content:
          "Find vetted ecommerce partners: operations, paid media, retention and more. Search by skill, service, name or partner ID.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(agentListQuery("ecom")),
  component: EcomHome,
});

function matches(agent: { fullName: string; partnerId: string; skills: string[]; headline: string | null }, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    agent.fullName.toLowerCase().includes(needle) ||
    agent.partnerId.toLowerCase().includes(needle) ||
    (agent.headline ?? "").toLowerCase().includes(needle) ||
    agent.skills.some((s) => s.toLowerCase().includes(needle))
  );
}

function EcomHome() {
  const { data: agents } = useSuspenseQuery(agentListQuery("ecom"));
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => agents.filter((a) => matches(a, query)), [agents, query]);

  return (
    <>
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-border px-6 py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-[10%] h-[34rem] w-[34rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 left-[5%] h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl text-center">
          <p className="font-view-label text-primary">Ecommerce partners · Partner Hub</p>
          <h1 className="mt-6 font-view-display text-5xl font-bold leading-[1.06] tracking-tight text-foreground md:text-7xl">
            Specialists who speak
            <br />
            <span className="text-primary">revenue.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Vetted operators, marketers and specialists for DTC and marketplace
            brands. Search by skill or service — or by name and partner ID if you
            already know who you need.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “Meta Ads”, “supply chain”, “PH-1001”…"
                aria-label="Search agents by skill, service, name or partner ID"
                className="w-full rounded-2xl border border-input bg-card py-4 pl-12 pr-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
                maxLength={120}
              />
            </label>
          </div>
          <p className="mt-5 font-view-label text-muted-foreground">
            {filtered.length} partner{filtered.length === 1 ? "" : "s"} available
          </p>
          <div aria-hidden className="mx-auto mt-16 flex h-10 w-6 items-start justify-center rounded-full border border-border p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No partners match “{query}”. Try a skill, a service, a name or a partner ID.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} basePath="/ecom/agents" />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
