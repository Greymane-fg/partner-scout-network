export type ContactMethodLite = {
  id: string;
  platform: string;
  label: string | null;
  value: string;
  isPrimaryEcom: boolean;
  isPrimaryExec: boolean;
};

export type ViewName = "ecom" | "exec";

export const VIEW_LABEL: Record<ViewName, string> = {
  ecom: "Ecom",
  exec: "Executive",
};

export const PLATFORM_OPTIONS = [
  "email",
  "whatsapp",
  "telegram",
  "linkedin",
  "instagram",
  "x",
  "facebook",
  "tiktok",
  "youtube",
  "upwork",
  "fiverr",
  "website",
] as const;

/** Prefilled intro message. Always carries the visitor's name, the service needed, and the view. */
export function buildContactMessage(
  agentFirstName: string,
  visitorName: string,
  service: string,
  view: ViewName,
): string {
  const name = visitorName.trim() || "a Partner Hub visitor";
  const need = service.trim() || "a partnership";
  return `Hi ${agentFirstName}, my name is ${name}. I'm reaching out about ${need}. (Sent via Partner Hub — ${VIEW_LABEL[view]} view)`;
}

/** Platforms that accept a prefilled message directly in the link. */
export function platformSupportsPrefill(platform: string): boolean {
  return platform === "email" || platform === "whatsapp";
}

export function buildContactHref(
  method: ContactMethodLite,
  message: string,
  service: string,
): string {
  const platform = method.platform.toLowerCase();
  const value = method.value.trim();
  switch (platform) {
    case "email":
      return `mailto:${value}?subject=${encodeURIComponent(
        `Partnership inquiry: ${service.trim() || "New project"}`,
      )}&body=${encodeURIComponent(message)}`;
    case "whatsapp": {
      const digits = value.replace(/\D/g, "");
      return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    }
    default:
      // Every other platform gets a plain link; the visitor copies the intro message.
      return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }
}

export function methodLabel(method: ContactMethodLite): string {
  const platform = method.platform.toLowerCase();
  const pretty = platform.charAt(0).toUpperCase() + platform.slice(1);
  return method.label?.trim() || pretty;
}
