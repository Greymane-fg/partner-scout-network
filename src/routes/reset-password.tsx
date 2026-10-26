import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      {
        title: "Reset password — Partner Hub",
        name: "description",
        content: "Set a new password for your Partner Hub account.",
      },
      { property: "og:title", content: "Reset password — Partner Hub" },
      { property: "og:description", content: "Set a new password for your Partner Hub account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase detects the recovery hash and hydrates the session automatically.
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated.");
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lg">
        <p className="font-view-label text-primary">Partner Hub</p>
        <h1 className="mt-3 font-view-display text-2xl font-bold text-foreground">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ready ? "Choose a new password for your account." : "Validating your reset link…"}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">New password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
