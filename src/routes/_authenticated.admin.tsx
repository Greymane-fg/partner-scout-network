import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ShieldCheck, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { removeAgent } from "@/lib/agents.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Partner Hub" },
      { name: "description", content: "Approve, promote and remove partners." },
    ],
  }),
  component: AdminPage,
});

const btnCls =
  "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary";
const MAX_ADMINS = 10;

type ProfileRow = {
  id: string;
  partner_id: string;
  full_name: string;
  headline: string | null;
  avatar_url: string | null;
  approved: boolean;
};

function AdminPage() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: userId } = useQuery({
    queryKey: ["admin", "user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin", "is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: userId!, _role: "admin" });
      return data === true;
    },
  });

  const { data: pending } = useQuery({
    queryKey: ["admin", "pending"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, partner_id, full_name, headline, avatar_url, approved")
        .eq("approved", false)
        .order("created_at");
      if (error) throw error;
      return data as ProfileRow[];
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["admin", "agents"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, partner_id, full_name, headline, avatar_url, approved")
        .eq("approved", true)
        .order("full_name");
      if (error) throw error;
      return data as ProfileRow[];
    },
  });

  const { data: adminRoleUserIds } = useQuery({
    queryKey: ["admin", "role-user-ids"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.user_id));
    },
  });

  if (isLoading || !userId) return <p className="p-10 text-sm text-muted-foreground">Checking access…</p>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-view-display text-2xl font-bold text-foreground">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">You don't have admin access to this area.</p>
        <Link to="/dashboard" className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const adminCount = adminRoleUserIds?.size ?? 0;

  async function approve(p: ProfileRow) {
    setBusyId(p.id);
    const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", p.id);
    setBusyId(null);
    if (error) toast.error(error.message);
    else {
      toast.success(`${p.full_name} is now live.`);
      qc.invalidateQueries({ queryKey: ["admin", "pending"] });
      qc.invalidateQueries({ queryKey: ["admin", "agents"] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    }
  }

  async function remove(p: ProfileRow) {
    if (!confirm(`Remove ${p.full_name} and delete their account? This cannot be undone.`)) return;
    setBusyId(p.id);
    const res = await removeAgent({ data: { userId: p.id } });
    setBusyId(null);
    if (!res.ok) toast.error(res.error);
    else {
      toast.success(`${p.full_name} removed.`);
      qc.invalidateQueries({ queryKey: ["admin", "pending"] });
      qc.invalidateQueries({ queryKey: ["admin", "agents"] });
      qc.invalidateQueries({ queryKey: ["admin", "role-user-ids"] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    }
  }

  async function promote(p: ProfileRow) {
    if (adminCount >= MAX_ADMINS) {
      toast.error(`Admin cap reached (${MAX_ADMINS}). Demote someone first.`);
      return;
    }
    setBusyId(p.id);
    const { error } = await supabase.from("user_roles").insert({ user_id: p.id, role: "admin" });
    setBusyId(null);
    if (error) toast.error(error.message);
    else {
      toast.success(`${p.full_name} promoted to admin.`);
      qc.invalidateQueries({ queryKey: ["admin", "role-user-ids"] });
    }
  }

  async function demote(p: ProfileRow) {
    setBusyId(p.id);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", p.id).eq("role", "admin");
    setBusyId(null);
    if (error) toast.error(error.message);
    else {
      toast.success(`${p.full_name} demoted to member.`);
      qc.invalidateQueries({ queryKey: ["admin", "role-user-ids"] });
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-view-label text-primary">Admin panel</p>
          <h1 className="mt-2 font-view-display text-2xl font-bold text-foreground">Network management</h1>
        </div>
        <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
          {adminCount}/{MAX_ADMINS} admins
        </span>
      </div>

      <section className="mt-8">
        <h2 className="font-view-display text-lg font-bold text-foreground">Pending approvals</h2>
        <div className="mt-4 space-y-3">
          {(pending ?? []).map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="font-view-display font-bold text-foreground">{p.full_name}</p>
                <p className="truncate text-sm text-muted-foreground">{p.headline ?? "No headline"} · {p.partner_id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(p)} disabled={busyId === p.id} className={btnCls}>
                  <Check className="h-4 w-4 text-primary" /> Approve
                </button>
                <button onClick={() => remove(p)} disabled={busyId === p.id} className={`${btnCls} text-destructive`}>
                  <X className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
          ))}
          {(pending ?? []).length === 0 && <p className="text-sm text-muted-foreground">No pending partners.</p>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-view-display text-lg font-bold text-foreground">Active partners</h2>
        <div className="mt-4 space-y-3">
          {(agents ?? []).map((p) => {
            const isAdm = adminRoleUserIds?.has(p.id) ?? false;
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="font-view-display font-bold text-foreground">
                    {p.full_name}{" "}
                    {isAdm && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                        <ShieldCheck className="h-3 w-3" /> admin
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{p.partner_id}</p>
                </div>
                <div className="flex gap-2">
                  {isAdm ? (
                    <button onClick={() => demote(p)} disabled={busyId === p.id} className={btnCls}>Demote</button>
                  ) : (
                    <button onClick={() => promote(p)} disabled={busyId === p.id} className={btnCls}>Promote</button>
                  )}
                  <button onClick={() => remove(p)} disabled={busyId === p.id} className={`${btnCls} text-destructive`} aria-label={`Remove ${p.full_name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
