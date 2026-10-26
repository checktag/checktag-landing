"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Button, Card, EmptyState, Filters, Select, Spinner } from "./ui";
import { Rocket, Target, Users, BadgeCheck, Copy, EyeOff, Eye, Pause, Play, Square } from "lucide-react";

// Growth: weekly missions (house and brand-sponsored), teams and creator
// applications. House missions pay XP only unless points are set (those come
// out of MISSIONS_WEEKLY_BUDGET); sponsored missions pay from their own budget
// and end when it's spent. API: backend/docs/PROGRESS_API.md.

type Section = "missions" | "teams" | "creators";

interface Mission {
  id: string;
  title: string;
  description: string;
  kind: string;
  target: number;
  rewardXp: number;
  rewardPoints: number;
  weekly: boolean;
  motive: string | null;
  sponsorTenantId: string | null;
  budgetPoints: number | null;
  issuedPoints: number;
  status: "active" | "paused" | "ended";
  startsAt: string | null;
  endsAt: string | null;
}
interface Team { id: string; name: string; kind: string; code: string; country: string | null; status: "active" | "hidden"; members: number; created_at: string }
interface Creator {
  userId: string; status: "pending" | "approved" | "rejected"; handle: string; platform: string; niche: string;
  audience: string | null; note: string | null; createdAt: string; username: string | null; email: string | null; country: string | null;
}
interface BrandRow { id: string; name: string }

const KINDS: { value: string; label: string }[] = [
  { value: "scan_count", label: "Scan N different products" },
  { value: "scan_categories", label: "Scan N categories" },
  { value: "active_days", label: "Scan on N days" },
  { value: "review", label: "Write N reviews" },
  { value: "contribution", label: "Get N additions/fixes approved" },
  { value: "referral", label: "Invite N friends who scan" },
  { value: "brand_scan", label: "Scan N of the sponsor's products" },
  { value: "code_check", label: "Check N CheckTag codes" },
];
const kindLabel = (k: string) => KINDS.find((x) => x.value === k)?.label ?? k;
const input = "w-full rounded-xl border border-white/10 bg-brand-raised px-3 py-2 text-sm outline-none placeholder:text-slate-600 focus:border-brand-accent/50";
const label = "mb-1 block text-xs font-medium text-slate-400";
const day = (s: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—");

export default function Growth({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [section, setSection] = useState<Section>("missions");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Rocket className="h-5 w-5 text-brand-accent" /> Growth</h2>
          <p className="text-sm text-slate-400">Missions, teams and creators. XP is status only; points paid here always come out of a budget.</p>
        </div>
        <Filters>
          <Select<Section>
            label="Show"
            value={section}
            onChange={setSection}
            options={[
              { value: "missions", label: "Missions" },
              { value: "teams", label: "Teams" },
              { value: "creators", label: "Creators" },
            ]}
          />
        </Filters>
      </div>
      {section === "missions" && <Missions notify={notify} />}
      {section === "teams" && <Teams notify={notify} />}
      {section === "creators" && <Creators notify={notify} />}
    </div>
  );
}

// ------------------------------------------------------------------ missions

const blank = { title: "", description: "", kind: "scan_count", target: "3", rewardXp: "40", rewardPoints: "0", weekly: true, sponsorTenantId: "", budgetPoints: "", endsAt: "" };

function Missions({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [items, setItems] = useState<Mission[] | null>(null);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState<string | null>(null);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function load() {
    try {
      setItems((await api<{ items: Mission[] }>("/admin/missions")).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load();
    api<{ items: BrandRow[] }>("/admin/brands").then((r) => setBrands(r.items)).catch(() => setBrands([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sponsored = f.kind === "brand_scan" || !!f.sponsorTenantId;

  async function create() {
    setBusy("new");
    try {
      await api("/admin/missions", {
        method: "POST",
        body: JSON.stringify({
          title: f.title,
          description: f.description,
          kind: f.kind,
          target: Number(f.target),
          rewardXp: Number(f.rewardXp),
          rewardPoints: Number(f.rewardPoints || 0),
          weekly: f.weekly,
          sponsorTenantId: f.sponsorTenantId || null,
          budgetPoints: f.budgetPoints === "" ? null : Number(f.budgetPoints),
          endsAt: f.endsAt || null,
        }),
      });
      notify("Mission created.", "success");
      setF(blank);
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function status(m: Mission, s: Mission["status"]) {
    setBusy(m.id);
    try {
      await api(`/admin/missions/${m.id}`, { method: "PATCH", body: JSON.stringify({ status: s }) });
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const sponsorName = (id: string | null) => (id ? brands.find((b) => b.id === id)?.name ?? id : null);

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-brand-accent" /> New mission</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block"><span className={label}>Title (shown in the app)</span><input className={input} maxLength={60} value={f.title} onChange={set("title")} placeholder="Scan 3 breakfast products" /></label>
          <label className="block"><span className={label}>What counts</span>
            <select className={input} value={f.kind} onChange={set("kind")}>{KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</select>
          </label>
          <label className="block md:col-span-2"><span className={label}>Description</span><input className={input} maxLength={200} value={f.description} onChange={set("description")} placeholder="Check 3 different breakfast products this week." /></label>
          <label className="block"><span className={label}>N (target)</span><input className={input} type="number" min={1} value={f.target} onChange={set("target")} /></label>
          <label className="block"><span className={label}>XP reward</span><input className={input} type="number" min={0} value={f.rewardXp} onChange={set("rewardXp")} /></label>
          <label className="block"><span className={label}>Points reward (0 = XP only)</span><input className={input} type="number" min={0} value={f.rewardPoints} onChange={set("rewardPoints")} /></label>
          <label className="block"><span className={label}>Repeats</span>
            <select className={input} value={f.weekly ? "weekly" : "once"} onChange={(e) => setF((x) => ({ ...x, weekly: e.target.value === "weekly" }))}>
              <option value="weekly">Every week</option>
              <option value="once">Once per person</option>
            </select>
          </label>
          <label className="block"><span className={label}>Sponsor brand {f.kind === "brand_scan" ? "(required)" : "(optional)"}</span>
            <select className={input} value={f.sponsorTenantId} onChange={set("sponsorTenantId")}>
              <option value="">None (CheckTag)</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          {sponsored && (
            <label className="block"><span className={label}>Brand points budget (ends the mission when spent)</span><input className={input} type="number" min={0} value={f.budgetPoints} onChange={set("budgetPoints")} placeholder="e.g. 5000" /></label>
          )}
          <label className="block"><span className={label}>Ends (optional)</span><input className={input} type="date" value={f.endsAt} onChange={set("endsAt")} /></label>
        </div>
        <p className="text-xs text-slate-500">
          {sponsored
            ? "Shown as “Sponsored by” the brand. Points come from the brand's budget above."
            : "House missions: points, if any, come from the weekly house budget (MISSIONS_WEEKLY_BUDGET). Leave points at 0 for XP-only."}
        </p>
        <Button onClick={create} loading={busy === "new"} disabled={!f.title.trim() || !f.description.trim() || (f.kind === "brand_scan" && !f.sponsorTenantId)}>Create mission</Button>
      </Card>

      {items === null ? (
        <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
      ) : items.length === 0 ? (
        <EmptyState label="No missions yet." />
      ) : (
        items.map((m) => (
          <Card key={m.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{m.title}</span>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${m.status === "active" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : m.status === "paused" ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/5 text-slate-400"}`}>{m.status}</span>
                {m.sponsorTenantId && <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-xs text-sky-300">Sponsored by {sponsorName(m.sponsorTenantId)}</span>}
                {m.id.startsWith("house-") && <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">Built in</span>}
              </div>
              <p className="text-sm text-slate-300">{m.description}</p>
              <p className="text-xs text-slate-500">
                {kindLabel(m.kind).replace("N", String(m.target))} · {m.weekly ? "weekly" : "once"} · +{m.rewardXp} XP{m.rewardPoints ? ` · +${m.rewardPoints} points` : ""}
                {m.budgetPoints != null ? ` · budget ${m.issuedPoints}/${m.budgetPoints} points used` : m.rewardPoints ? ` · ${m.issuedPoints} points paid` : ""}
                {m.endsAt ? ` · ends ${day(m.endsAt)}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              {m.status === "active" && <Button size="sm" variant="ghost" onClick={() => status(m, "paused")} loading={busy === m.id}><Pause className="h-4 w-4" /> Pause</Button>}
              {m.status === "paused" && <Button size="sm" variant="ghost" onClick={() => status(m, "active")} loading={busy === m.id}><Play className="h-4 w-4" /> Resume</Button>}
              {m.status !== "ended" && <Button size="sm" variant="outline" onClick={() => status(m, "ended")} disabled={busy === m.id}><Square className="h-4 w-4" /> End</Button>}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ------------------------------------------------------------------ teams

const TEAM_KINDS = ["campus", "gym", "community", "workplace", "other"] as const;

function Teams({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [items, setItems] = useState<Team[] | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<string>("campus");
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      setItems((await api<{ items: Team[] }>("/admin/teams")).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create() {
    setBusy("new");
    try {
      const t = await api<Team>("/admin/teams", { method: "POST", body: JSON.stringify({ name, kind, country: country || null }) });
      notify(`Team created. Join code: ${t.code}`, "success");
      setName("");
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function toggle(t: Team) {
    setBusy(t.id);
    try {
      await api(`/admin/teams/${t.id}`, { method: "PATCH", body: JSON.stringify({ status: t.status === "active" ? "hidden" : "active" }) });
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-brand-accent" /> New team</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block"><span className={label}>Name</span><input className={input} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Riverside Campus" /></label>
          <label className="block"><span className={label}>Kind</span>
            <select className={input} value={kind} onChange={(e) => setKind(e.target.value)}>{TEAM_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
          </label>
          <label className="block"><span className={label}>Country code (optional)</span><input className={input} maxLength={2} value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} placeholder="GB" /></label>
        </div>
        <p className="text-xs text-slate-500">People join with the code shown on the team. Approved creators can also start teams from the app.</p>
        <Button onClick={create} loading={busy === "new"} disabled={name.trim().length < 3}>Create team</Button>
      </Card>

      {items === null ? (
        <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
      ) : items.length === 0 ? (
        <EmptyState label="No teams yet." />
      ) : (
        items.map((t) => (
          <Card key={t.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{t.name}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">{t.kind}{t.country ? ` · ${t.country}` : ""}</span>
                {t.status === "hidden" && <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">hidden</span>}
              </div>
              <p className="text-xs text-slate-500">{t.members} member{t.members === 1 ? "" : "s"} · created {day(t.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(t.code).then(() => notify("Code copied.", "success"))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-sm tracking-widest hover:border-brand-accent/40"
                title="Copy join code"
              >
                {t.code} <Copy className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <Button size="sm" variant="ghost" onClick={() => toggle(t)} loading={busy === t.id}>
                {t.status === "active" ? <><EyeOff className="h-4 w-4" /> Hide</> : <><Eye className="h-4 w-4" /> Show</>}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ------------------------------------------------------------------ creators

type CreatorFilter = "pending" | "approved" | "rejected" | "all";

function Creators({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [status, setStatus] = useState<CreatorFilter>("pending");
  const [items, setItems] = useState<Creator[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(s: CreatorFilter = status) {
    setItems(null);
    try {
      setItems((await api<{ items: Creator[] }>(`/admin/creators?status=${s}`)).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function decide(c: Creator, approve: boolean) {
    setBusy(c.userId);
    try {
      await api(`/admin/creators/${c.userId}/${approve ? "approve" : "reject"}`, { method: "POST" });
      notify(approve ? `@${c.handle} approved.` : "Application declined.", "success");
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Creators earn only when people they invite make their first genuine scan. Approving unlocks their toolkit and team creation.</p>
        <Select<CreatorFilter>
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Declined" },
            { value: "all", label: "All" },
          ]}
        />
      </div>
      {items === null ? (
        <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
      ) : items.length === 0 ? (
        <EmptyState label={status === "pending" ? "No applications waiting." : "Nothing here."} />
      ) : (
        items.map((c) => (
          <Card key={c.userId} className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <BadgeCheck className={`h-4 w-4 ${c.status === "approved" ? "text-emerald-300" : "text-slate-500"}`} />
                <span className="font-semibold">@{c.handle}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">{c.platform} · {c.niche}{c.audience ? ` · ${c.audience}` : ""}</span>
                <span className="text-xs text-slate-500">{c.status}</span>
              </div>
              <p className="text-xs text-slate-500">{[c.username && `CheckTag @${c.username}`, c.email, c.country, `applied ${day(c.createdAt)}`].filter(Boolean).join(" · ")}</p>
              {c.note && <p className="max-w-2xl whitespace-pre-wrap text-sm text-slate-300">{c.note}</p>}
            </div>
            {c.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => decide(c, true)} loading={busy === c.userId}>Approve</Button>
                <Button size="sm" variant="ghost" onClick={() => decide(c, false)} disabled={busy === c.userId}>Decline</Button>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
