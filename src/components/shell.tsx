import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { LogOut, Menu, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export type ViewKey = "ecom" | "exec" | "agent";

export const viewClass: Record<ViewKey, string> = {
  ecom: "view-ecom",
  exec: "view-exec",
  agent: "view-agent",
};

const viewBrandTag: Record<ViewKey, string> = {
  ecom: "For Ecommerce Brands",
  exec: "For Executive Teams",
  agent: "Agent Network",
};

function Brand({ view }: { view: ViewKey }) {
  return (
    <Link to={view === "agent" ? "/agent" : `/${view}`} className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-view-display text-sm font-bold text-primary-foreground">
        PH
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-view-display text-base font-bold text-foreground">Partner Hub</span>
        <span className="font-view-label text-muted-foreground">{viewBrandTag[view]}</span>
      </span>
    </Link>
  );
}

function AgentSessionChip() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const queryClient = router.options.context?.queryClient;

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) return <div className="h-9 w-24" />;

  if (!email) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <User className="h-4 w-4" /> Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/dashboard"
        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        Dashboard
      </Link>
      <button
        type="button"
        aria-label="Sign out"
        onClick={async () => {
          await queryClient?.cancelQueries();
          queryClient?.clear();
          await supabase.auth.signOut();
          router.navigate({ to: "/auth", replace: true });
        }}
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

function MobileNav({ view, links }: { view: ViewKey; links: { label: string; to: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-border p-2 text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-border bg-background px-6 py-4 shadow-lg">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

export function ViewShell({
  view,
  children,
  sessionAware = false,
}: {
  view: ViewKey;
  children: ReactNode;
  sessionAware?: boolean;
}) {
  const links =
    view === "agent"
      ? [
          { label: "Home", to: "/agent" },
          { label: "Blog", to: "/blog" },
          { label: "About", to: "/about" },
        ]
      : [
          { label: "Home", to: `/${view}` },
          { label: "Blog", to: "/blog" },
          { label: "About", to: "/about" },
        ];

  return (
    <div className={cn("flex min-h-screen flex-col", viewClass[view])}>
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Brand view={view} />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {sessionAware ? (
              <AgentSessionChip />
            ) : (
              <Link
                to="/blog"
                className="hidden rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 md:inline-flex"
              >
                Latest insights
              </Link>
            )}
            <MobileNav view={view} links={links} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-secondary/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Brand view={view} />
            <p className="mt-3 text-sm text-muted-foreground">
              A curated network of specialist partners, each with a verified track record.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <span className="font-view-label text-muted-foreground">Partner Hub</span>
            <Link to="/about" className="text-foreground hover:underline">
              About us
            </Link>
            <Link to="/blog" className="text-foreground hover:underline">
              Blog
            </Link>
            <Link to="/privacy" className="text-foreground hover:underline">
              Privacy policy
            </Link>
            <Link to="/terms" className="text-foreground hover:underline">
              Terms of service
            </Link>
            <Link to="/cookies" className="text-foreground hover:underline">
              Cookie policy
            </Link>
          </nav>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Partner Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export { toast };
