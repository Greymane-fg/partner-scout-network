import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import type { AgentCardData } from "@/lib/agents.functions";

export function AgentCard({
  agent,
  basePath,
}: {
  agent: AgentCardData;
  basePath: "/ecom/agents" | "/exec/agents";
}) {
  const initials = agent.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <Link
      to={`${basePath}/$partnerId`}
      params={{ partnerId: agent.partnerId }}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {agent.avatarUrl ? (
          <img
            src={agent.avatarUrl}
            alt={agent.fullName}
            className="h-14 w-14 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 font-view-display text-lg font-bold text-primary">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-view-display text-lg font-bold leading-tight text-foreground">
            {agent.fullName}
          </h3>
          <p className="text-sm text-muted-foreground">{agent.headline}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {agent.location} · {agent.partnerId}
          </p>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{agent.bio}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.skills.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            {s}
          </span>
        ))}
        {agent.skills.length > 4 && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            +{agent.skills.length - 4}
          </span>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          {agent.avgRating != null ? (
            <>
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">{agent.avgRating}</span>
              <span className="text-xs">({agent.reviewCount})</span>
            </>
          ) : (
            <span className="text-xs">No reviews yet</span>
          )}
        </span>
        <span className="text-sm font-semibold text-primary transition-opacity group-hover:opacity-80">
          View profile →
        </span>
      </div>
    </Link>
  );
}
