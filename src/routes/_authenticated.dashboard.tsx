import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addAgent } from "@/lib/agents.functions";
import { PLATFORM_OPTIONS } from "@/lib/contact";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Partner Hub Agent Network" },
      { name: "description", content: "Manage your Partner Hub profile, skills, projects, contacts and blog." },
    ],
  }),
  component: DashboardPage,
});

type Tab = "profile" | "skills" | "projects" | "contacts" | "reviews" | "blog" | "team";

const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "contacts", label: "Contact methods" },
  { key: "reviews", label: "Reviews" },
  { key: "blog", label: "Blog" },
  { key: "team", label: "Add agent" },
];

const inputCls =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring";
const labelCls = "block text-sm font-medium text-foreground";
const btnPrimaryCls =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60";
const btnGhostCls =
  "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={labelCls}>
      {label}
      {children}
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["dash", "profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("profile");

  const { data: userData } = useQuery({
    queryKey: ["dash", "user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });
  const userId = userData?.id;

  const { data: profile } = useProfile(userId);
  const { data: isAdmin } = useQuery({
    queryKey: ["dash", "is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: userId!, _role: "admin" });
      return data === true;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!userId) return <div className="min-h-[60vh]" />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="min-w-0">
            <p className="font-view-label text-primary">Agent dashboard</p>
            <h1 className="truncate font-view-display text-xl font-bold text-foreground">
              {profile?.full_name ?? "Loading…"}{" "}
              <span className="text-sm font-medium text-muted-foreground">· {profile?.partner_id}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className={btnGhostCls}>
                <ShieldCheck className="h-4 w-4" /> Admin panel
              </Link>
            )}
            <button onClick={signOut} className={btnGhostCls} aria-label="Sign out">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-6 pb-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        {tab === "profile" && <ProfileTab userId={userId} profile={profile} />}
        {tab === "skills" && <SkillsTab userId={userId} />}
        {tab === "projects" && <ProjectsTab userId={userId} />}
        {tab === "contacts" && <ContactsTab userId={userId} />}
        {tab === "reviews" && <ReviewsTab userId={userId} />}
        {tab === "blog" && <BlogTab userId={userId} />}
        {tab === "team" && <TeamTab />}
      </main>
    </div>
  );
}

/* ============ Profile ============ */

function ProfileTab({ userId, profile }: { userId: string; profile: Record<string, unknown> | null | undefined }) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setHeadline(profile.headline ?? "");
    setBio(profile.bio ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
    setLocation(profile.location ?? "");
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        location: location.trim() || null,
      })
      .eq("id", userId);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile saved.");
      qc.invalidateQueries({ queryKey: ["dash", "profile", userId] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    }
  }

  if (!profile) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <form onSubmit={save} className="space-y-5 rounded-3xl border border-border bg-card p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} className={inputCls} />
        </Field>
        <Field label="Location">
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" maxLength={120} className={inputCls} />
        </Field>
      </div>
      <Field label="Headline">
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Ecommerce operations partner" maxLength={160} className={inputCls} />
      </Field>
      <Field label="Bio">
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} maxLength={2000} className={inputCls} />
      </Field>
      <Field label="Avatar URL">
        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" type="url" className={inputCls} />
      </Field>
      <button type="submit" disabled={busy} className={btnPrimaryCls}>
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

/* ============ Skills ============ */

type SkillRow = { id: string; name: string };
type AgentSkillRow = { skill_id: string; for_ecom: boolean; for_exec: boolean };

function SkillsTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [newSkill, setNewSkill] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: skills } = useQuery({
    queryKey: ["dash", "skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("id, name").order("name");
      if (error) throw error;
      return data as SkillRow[];
    },
  });
  const { data: mine } = useQuery({
    queryKey: ["dash", "my-skills", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_skills")
        .select("skill_id, for_ecom, for_exec")
        .eq("agent_id", userId);
      if (error) throw error;
      return data as AgentSkillRow[];
    },
  });

  const mineByKey = useMemo(() => new Map((mine ?? []).map((m) => [m.skill_id, m])), [mine]);

  async function toggle(skillId: string, col: "for_ecom" | "for_exec", value: boolean) {
    const existing = mineByKey.get(skillId);
    if (existing) {
      const { error } = await supabase.from("agent_skills").update({ [col]: value }).eq("agent_id", userId).eq("skill_id", skillId);
      if (error) toast.error(error.message);
    } else {
      const insert: Record<string, unknown> = { agent_id: userId, skill_id: skillId, for_ecom: false, for_exec: false, [col]: value };
      const { error } = await supabase.from("agent_skills").insert(insert);
      if (error) toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["dash", "my-skills", userId] });
    qc.invalidateQueries({ queryKey: ["agents"] });
  }

  async function addSkill(e: React.FormEvent) {
    e.preventDefault();
    const name = newSkill.trim();
    if (!name) return;
    setBusy(true);
    const { data: created, error } = await supabase.from("skills").insert({ name, created_by: userId }).select("id").single();
    if (error) {
      toast.error(error.code === "23505" ? "That skill already exists." : error.message);
      setBusy(false);
      return;
    }
    if (created) {
      const { error: linkError } = await supabase.from("agent_skills").insert({
        agent_id: userId,
        skill_id: created.id,
        for_ecom: true,
        for_exec: false,
      });
      if (linkError) toast.error(linkError.message);
    }
    setBusy(false);
    setNewSkill("");
    qc.invalidateQueries({ queryKey: ["dash", "skills"] });
    qc.invalidateQueries({ queryKey: ["dash", "my-skills", userId] });
  }

  return (
    <div className="space-y-6">
      <p className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        Skills are shared across the whole network — add one and every partner can use it. Toggle which
        client views your version of each skill appears in.
      </p>
      <div className="rounded-3xl border border-border bg-card p-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 border-b border-border pb-3 font-view-label text-muted-foreground">
          <span>Skill</span>
          <span>Ecom</span>
          <span>Exec</span>
          <span className="sr-only">Actions</span>
        </div>
        {(skills ?? []).map((s) => {
          const row = mineByKey.get(s.id);
          return (
            <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 border-b border-border/60 py-3 last:border-0">
              <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
              <input type="checkbox" checked={row?.for_ecom ?? false} onChange={(e) => toggle(s.id, "for_ecom", e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" aria-label={`${s.name} in ecom view`} />
              <input type="checkbox" checked={row?.for_exec ?? false} onChange={(e) => toggle(s.id, "for_exec", e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" aria-label={`${s.name} in exec view`} />
              <span className="w-5" />
            </div>
          );
        })}
      </div>
      <form onSubmit={addSkill} className="flex flex-wrap items-end gap-3 rounded-3xl border border-border bg-card p-6">
        <Field label="Add a new skill (visible to all partners)">
          <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. Klaviyo flows" maxLength={80} className={`${inputCls} w-64`} />
        </Field>
        <button type="submit" disabled={busy} className={btnPrimaryCls}>
          <Plus className="h-4 w-4" /> Add skill
        </button>
      </form>
    </div>
  );
}

/* ============ Projects ============ */

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  result: string | null;
  url: string | null;
  for_ecom: boolean;
  for_exec: boolean;
};

function ProjectsTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: projects } = useQuery({
    queryKey: ["dash", "projects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("agent_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProjectRow[];
    },
  });

  async function remove(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id).eq("agent_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("Project removed.");
      qc.invalidateQueries({ queryKey: ["dash", "projects", userId] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Your projects. Choose which views each appears in.</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className={btnPrimaryCls}>
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>
      {showForm && (
        <ProjectForm
          userId={userId}
          initial={editing}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["dash", "projects", userId] });
            qc.invalidateQueries({ queryKey: ["agents"] });
          }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      <div className="space-y-3">
        {(projects ?? []).map((p) => (
          <div key={p.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="min-w-0">
              <p className="font-view-display font-bold text-foreground">{p.title}</p>
              {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
              <p className="mt-2 font-view-label text-muted-foreground">
                {[p.for_ecom ? "Ecom" : null, p.for_exec ? "Exec" : null].filter(Boolean).join(" · ") || "Hidden from both views"}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(p); setShowForm(true); }} className={btnGhostCls}>Edit</button>
              <button onClick={() => remove(p.id)} className={`${btnGhostCls} text-destructive`} aria-label={`Delete ${p.title}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(projects ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No projects yet.</p>}
      </div>
    </div>
  );
}

function ProjectForm({
  userId,
  initial,
  onDone,
  onCancel,
}: {
  userId: string;
  initial: ProjectRow | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [result, setResult] = useState(initial?.result ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [forEcom, setForEcom] = useState(initial?.for_ecom ?? true);
  const [forExec, setForExec] = useState(initial?.for_exec ?? false);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!forEcom && !forExec) {
      toast.error("Choose at least one view for this project.");
      return;
    }
    setBusy(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      result: result.trim() || null,
      url: url.trim() || null,
      for_ecom: forEcom,
      for_exec: forExec,
    };
    const { error } = initial
      ? await supabase.from("projects").update(payload).eq("id", initial.id).eq("agent_id", userId)
      : await supabase.from("projects").insert({ ...payload, agent_id: userId });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(initial ? "Project updated." : "Project added.");
      onDone();
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={140} className={inputCls} />
        </Field>
        <Field label="Result (short)">
          <input value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g. +38% repeat revenue" maxLength={140} className={inputCls} />
        </Field>
      </div>
      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1200} className={inputCls} />
      </Field>
      <Field label="Project URL (optional)">
        <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://…" className={inputCls} />
      </Field>
      <div className="flex gap-6">
        <Check label="Show in Ecom view" checked={forEcom} onChange={setForEcom} />
        <Check label="Show in Exec view" checked={forExec} onChange={setForExec} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={btnPrimaryCls}>{busy ? "Saving…" : "Save project"}</button>
        <button type="button" onClick={onCancel} className={btnGhostCls}>Cancel</button>
      </div>
    </form>
  );
}

/* ============ Contacts ============ */

type ContactRow = {
  id: string;
  platform: string;
  label: string | null;
  value: string;
  is_primary_ecom: boolean;
  is_primary_exec: boolean;
};

function ContactsTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: contacts } = useQuery({
    queryKey: ["dash", "contacts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_methods")
        .select("*")
        .eq("agent_id", userId)
        .order("created_at");
      if (error) throw error;
      return data as ContactRow[];
    },
  });

  async function setPrimary(row: ContactRow, col: "ecom" | "exec", value: boolean) {
    const field = col === "ecom" ? "is_primary_ecom" : "is_primary_exec";
    if (value) {
      // Clear the current primary first (DB enforces one primary per view).
      await supabase.from("contact_methods").update({ [field]: false }).eq("agent_id", userId).neq("id", row.id);
    }
    const { error } = await supabase.from("contact_methods").update({ [field]: value }).eq("id", row.id).eq("agent_id", userId);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["dash", "contacts", userId] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("contact_methods").delete().eq("id", id).eq("agent_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("Contact method removed.");
      qc.invalidateQueries({ queryKey: ["dash", "contacts", userId] });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Add as many channels as you like — pick the primary for each client view.</p>
        <button onClick={() => setShowForm(true)} className={btnPrimaryCls}>
          <Plus className="h-4 w-4" /> Add method
        </button>
      </div>
      {showForm && (
        <ContactForm
          userId={userId}
          onDone={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["dash", "contacts", userId] });
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
      <div className="space-y-3">
        {(contacts ?? []).map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="min-w-0 flex-1">
              <p className="font-view-display font-bold text-foreground">
                {c.label?.trim() || c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}
              </p>
              <p className="truncate text-sm text-muted-foreground">{c.value}</p>
            </div>
            <Check label="Primary ecom" checked={c.is_primary_ecom} onChange={(v) => setPrimary(c, "ecom", v)} />
            <Check label="Primary exec" checked={c.is_primary_exec} onChange={(v) => setPrimary(c, "exec", v)} />
            <button onClick={() => remove(c.id)} className={`${btnGhostCls} text-destructive`} aria-label="Delete contact method">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {(contacts ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No contact methods yet.</p>}
      </div>
    </div>
  );
}

function ContactForm({
  userId,
  onDone,
  onCancel,
}: {
  userId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [platform, setPlatform] = useState<string>(PLATFORM_OPTIONS[0]);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("contact_methods").insert({
      agent_id: userId,
      platform,
      label: label.trim() || null,
      value: value.trim(),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Contact method added.");
      onDone();
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Platform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </Field>
        <Field label="Label (optional)">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Business WhatsApp" maxLength={80} className={inputCls} />
        </Field>
        <Field label={platform === "email" ? "Email address" : "Handle / number / link"}>
          <input value={value} onChange={(e) => setValue(e.target.value)} required maxLength={200} className={inputCls} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={btnPrimaryCls}>{busy ? "Saving…" : "Add method"}</button>
        <button type="button" onClick={onCancel} className={btnGhostCls}>Cancel</button>
      </div>
    </form>
  );
}

/* ============ Reviews ============ */

function ReviewsTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: reviews } = useQuery({
    queryKey: ["dash", "reviews", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("agent_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function remove(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id).eq("agent_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("Review removed.");
      qc.invalidateQueries({ queryKey: ["dash", "reviews", userId] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    }
  }

  return (
    <div className="space-y-3">
      {(reviews ?? []).map((r) => (
        <div key={r.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {r.author_name} · {"★".repeat(r.rating)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{r.content}</p>
          </div>
          <button onClick={() => remove(r.id)} className={`${btnGhostCls} shrink-0 text-destructive`} aria-label="Delete review">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {(reviews ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet.</p>}
    </div>
  );
}

/* ============ Blog ============ */

type PostRow = { id: string; title: string; slug: string; excerpt: string | null; body: string; published: boolean };

function BlogTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ["dash", "posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, body, published")
        .eq("agent_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PostRow[];
    },
  });

  async function remove(id: string) {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id).eq("agent_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("Post deleted.");
      qc.invalidateQueries({ queryKey: ["dash", "posts", userId] });
      qc.invalidateQueries({ queryKey: ["blog"] });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Your articles. Drafts stay private until you publish.</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className={btnPrimaryCls}>
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>
      {showForm && (
        <PostForm
          userId={userId}
          initial={editing}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["dash", "posts", userId] });
            qc.invalidateQueries({ queryKey: ["blog"] });
          }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      <div className="space-y-3">
        {(posts ?? []).map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="min-w-0">
              <p className="font-view-display font-bold text-foreground">{p.title}</p>
              <p className="mt-1 font-view-label text-muted-foreground">
                {p.published ? "Published" : "Draft"} · /blog/{p.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(p); setShowForm(true); }} className={btnGhostCls}>Edit</button>
              <button onClick={() => remove(p.id)} className={`${btnGhostCls} text-destructive`} aria-label={`Delete ${p.title}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(posts ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No posts yet.</p>}
      </div>
    </div>
  );
}

function PostForm({
  userId,
  initial,
  onDone,
  onCancel,
}: {
  userId: string;
  initial: PostRow | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const finalSlug = (slug.trim() || slugify(title)).toLowerCase();
    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      body: body.trim(),
      published,
    };
    const { error } = initial
      ? await supabase.from("blog_posts").update(payload).eq("id", initial.id).eq("agent_id", userId)
      : await supabase.from("blog_posts").insert({ ...payload, agent_id: userId });
    setBusy(false);
    if (error) toast.error(error.code === "23505" ? "That slug is already taken." : error.message);
    else {
      toast.success(initial ? "Post updated." : published ? "Post published." : "Draft saved.");
      onDone();
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} className={inputCls} />
        </Field>
        <Field label="Slug (auto from title if blank)">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-post" maxLength={80} className={inputCls} />
        </Field>
      </div>
      <Field label="Excerpt">
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} className={inputCls} />
      </Field>
      <Field label="Body (blank line between paragraphs)">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} required className={inputCls} />
      </Field>
      <Check label="Published (visible on the blog and your profile)" checked={published} onChange={setPublished} />
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={btnPrimaryCls}>{busy ? "Saving…" : "Save post"}</button>
        <button type="button" onClick={onCancel} className={btnGhostCls}>Cancel</button>
      </div>
    </form>
  );
}

/* ============ Team ============ */

function TeamTab() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const res = await addAgent({ data: { fullName, email, headline: headline || undefined, location: location || undefined } });
    setBusy(false);
    if (res.ok) {
      toast.success(`Invite sent. New partner ID: ${res.partnerId}`);
      setResult(`Invite sent to ${email}. Their partner ID is ${res.partnerId} — their profile stays hidden until an admin approves it.`);
      setFullName(""); setEmail(""); setHeadline(""); setLocation("");
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-5">
      <p className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        Any agent can add a new partner by email. The new partner receives an invite to set their
        password; their profile appears publicly once an admin approves it.
      </p>
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} className={inputCls} />
          </Field>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className={inputCls} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline (optional)">
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Paid media partner" maxLength={160} className={inputCls} />
          </Field>
          <Field label="Location (optional)">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" maxLength={120} className={inputCls} />
          </Field>
        </div>
        <button type="submit" disabled={busy} className={btnPrimaryCls}>{busy ? "Sending invite…" : "Send invite"}</button>
        {result && <p className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">{result}</p>}
      </form>
    </div>
  );
}
