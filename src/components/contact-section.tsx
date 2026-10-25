import { useState } from "react";
import { BadgeCheck, Check, Copy, ExternalLink, Mail, MessageCircle, Send } from "lucide-react";
import {
  buildContactHref,
  buildContactMessage,
  methodLabel,
  platformSupportsPrefill,
  VIEW_LABEL,
  type ContactMethodLite,
  type ViewName,
} from "@/lib/contact";

function platformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "whatsapp":
    case "telegram":
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
}

export function ContactSection({
  methods,
  agentFirstName,
  view,
}: {
  methods: ContactMethodLite[];
  agentFirstName: string;
  view: ViewName;
}) {
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const message = buildContactMessage(agentFirstName, name, service, view);
  const primaryForView = methods.filter((m) =>
    view === "ecom" ? m.isPrimaryEcom : m.isPrimaryExec,
  );
  const others = methods.filter((m) =>
    view === "ecom" ? !m.isPrimaryEcom : !m.isPrimaryExec,
  );
  const ordered = [...primaryForView, ...others];

  if (methods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No contact methods listed yet — check back soon.
      </p>
    );
  }

  const copy = async (m: ContactMethodLite) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-view-label text-muted-foreground">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Blake"
            className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            maxLength={100}
          />
        </label>
        <label className="block">
          <span className="font-view-label text-muted-foreground">Service needed</span>
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Meta Ads management"
            className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            maxLength={120}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Every contact option below is prefilled with your name, the service you need, and this
        Partner Hub view ({VIEW_LABEL[view]}).
      </p>

      <ul className="space-y-2.5">
        {ordered.map((m) => {
          const isPrimary = view === "ecom" ? m.isPrimaryEcom : m.isPrimaryExec;
          const supportsPrefill = platformSupportsPrefill(m.platform);
          return (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3.5"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {platformIcon(m.platform)}
                {methodLabel(m)}
              </span>
              {isPrimary && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  <BadgeCheck className="h-3.5 w-3.5" /> Preferred for {VIEW_LABEL[view]}
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <a
                  href={buildContactHref(m, message, service)}
                  target={supportsPrefill ? undefined : "_blank"}
                  rel={supportsPrefill ? undefined : "noopener noreferrer"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {supportsPrefill ? <Send className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  {supportsPrefill ? "Send" : "Open"}
                </a>
                <button
                  type="button"
                  onClick={() => copy(m)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  aria-label="Copy intro message"
                >
                  {copiedId === m.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedId === m.id ? "Copied" : "Copy intro"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
