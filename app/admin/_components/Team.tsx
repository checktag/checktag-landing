"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { Button, Card, Spinner } from "./ui";
import { Copy, KeyRound, Link2, RefreshCw, Send, ShieldOff, UserMinus } from "lucide-react";

// The admin team (Owners only): invite people by email, choose what they can
// do, send a fresh link, reset a lost authenticator, remove them. Nobody's
// password passes through here — each person sets their own from a link.

type Status = "invited" | "needs_authenticator" | "active";

interface Member {
  id: string;
  email: string | null;
  role: string;
  roleLabel: string;
  status: Status;
  locked: boolean;
  lastSeen: string | null;
  createdAt: string;
  you: boolean;
}

interface Role {
  key: string;
  label: string;
  summary: string;
}

interface LinkResult {
  email: string | null;
  link: string;
  emailed: boolean;
  kind: "invite" | "reset";
}

const control =
  "rounded-xl border border-white/10 bg-brand-raised px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-brand-accent/50";

const STATUS: Record<Status, { label: string; cls: string }> = {
  invited: { label: "Invited", cls: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
  needs_authenticator: { label: "No authenticator yet", cls: "border-brand-cyan/20 bg-brand-cyan/10 text-brand-sky" },
  active: { label: "Active", cls: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
};

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", cls)}>{children}</span>;
}

export default function Team({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TRUST_SAFETY");
  const [inviting, setInviting] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api<{ members: Member[]; roles: Role[] }>("/admin/team");
      setMembers(d.members);
      setRoles(d.roles);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const replace = (m: Member) => setMembers((list) => list.map((x) => (x.id === m.id ? m : x)));

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const r = await api<{ member: Member; link: string; emailed: boolean }>("/admin/team/invite", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), role }),
      });
      setMembers((list) => [...list, r.member]);
      setResult({ email: r.member.email, link: r.link, emailed: r.emailed, kind: "invite" });
      setEmail("");
      notify(r.emailed ? `Invite sent to ${r.member.email}` : "Added — copy the link below and send it to them", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setInviting(false);
    }
  }

  async function act(m: Member, what: "link" | "reset" | "remove" | "role", value?: string) {
    const who = m.email ?? "this person";
    if (what === "reset" && !confirm(`Reset ${who}'s authenticator? They'll be signed out and set up a new one at their next sign-in.`)) return;
    if (what === "remove" && !confirm(`Remove ${who} from the admin team? They'll be signed out and can't sign in to the dashboard any more.`)) return;
    if (what === "role" && !confirm(`Make ${who} ${roles.find((r) => r.key === value)?.label ?? value}? They'll be signed out so the change takes effect.`)) return;
    setBusy(m.id);
    try {
      const path = `/admin/team/${encodeURIComponent(m.id)}`;
      if (what === "link") {
        const r = await api<{ member: Member; link: string; emailed: boolean; kind: "invite" | "reset" }>(`${path}/link`, { method: "POST" });
        setResult({ email: r.member.email, link: r.link, emailed: r.emailed, kind: r.kind });
        notify(r.emailed ? `Link sent to ${who}` : "Copy the link below and send it to them", "success");
      } else if (what === "reset") {
        replace((await api<{ member: Member }>(`${path}/reset-authenticator`, { method: "POST" })).member);
        notify(`${who}'s authenticator was reset`, "success");
      } else if (what === "role") {
        replace((await api<{ member: Member }>(path, { method: "PATCH", body: JSON.stringify({ role: value }) })).member);
        notify(`${who} is now ${roles.find((r) => r.key === value)?.label ?? value}`, "success");
      } else {
        await api(path, { method: "DELETE" });
        setMembers((list) => list.filter((x) => x.id !== m.id));
        notify(`${who} was removed from the team`, "success");
      }
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const summary = roles.find((r) => r.key === role)?.summary;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Team</h2>
          <p className="text-sm text-slate-400">Who can sign in to this dashboard, and what each person can do.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="mb-6 p-5">
        <h3 className="font-semibold">Invite someone</h3>
        <p className="mt-1 text-sm text-slate-400">
          They get an email with a link to set their own password (it works once, for 3 days), then add CheckTag to an
          authenticator app the first time they sign in.
        </p>
        <form onSubmit={invite} className="mt-4 flex flex-wrap items-start gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            aria-label="Email"
            className={cn(control, "w-full min-w-0 sm:w-auto sm:flex-1 sm:max-w-xs")}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" className={cn(control, "ct-select")}>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          <Button type="submit" loading={inviting} disabled={!email.trim()}>
            <Send className="h-4 w-4" /> Send invite
          </Button>
        </form>
        {summary && <p className="mt-2 text-xs text-slate-500">{summary}</p>}
        <p className="mt-2 text-xs text-slate-500">
          Use a work email. If the address already has a CheckTag app account, that account gets dashboard access too.
        </p>

        {result && (
          <div className="mt-4 rounded-xl border border-white/10 bg-brand-ink/50 p-4">
            <p className="text-sm text-slate-200">
              {result.emailed
                ? `We emailed ${result.kind === "invite" ? "an invite" : "a set-password link"} to ${result.email}.`
                : `The email to ${result.email} couldn't be sent. Copy the link and send it to them yourself.`}{" "}
              <span className="text-slate-400">Only send it to them — anyone with the link can set the password.</span>
            </p>
            <div className="mt-3 flex gap-2">
              <input readOnly value={result.link} aria-label="Link" className={cn(control, "min-w-0 flex-1 font-mono text-xs")} onFocus={(e) => e.target.select()} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard?.writeText(result.link).then(() => notify("Link copied", "success"))}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setResult(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-brand-accent" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          {/* A table on wide screens; stacked cards on a phone. */}
          <div className="hidden border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 lg:flex lg:gap-4">
            <span className="w-64 shrink-0">Person</span>
            <span className="w-32 shrink-0">Role</span>
            <span className="flex-1">Status</span>
          </div>
          <ul>
            {members.map((m) => (
              <li key={m.id} className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 text-sm last:border-0 lg:flex-row lg:items-center lg:gap-4 lg:py-3">
                <div className="min-w-0 lg:w-64 lg:shrink-0">
                  <span className="text-slate-100 [overflow-wrap:anywhere]">{m.email ?? "—"}</span>
                  {m.you && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">You</span>}
                  <p className="mt-0.5 text-xs text-slate-500">
                    Last sign-in: {m.lastSeen ? new Date(m.lastSeen).toLocaleString() : "never"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:contents">
                  <div className="lg:w-32 lg:shrink-0">
                    {m.you ? (
                      <span className="text-slate-300">{m.roleLabel}</span>
                    ) : (
                      <select
                        value={m.role}
                        disabled={busy === m.id}
                        onChange={(e) => act(m, "role", e.target.value)}
                        aria-label={`Role for ${m.email}`}
                        className={cn(control, "ct-select py-1.5")}
                      >
                        {roles.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 lg:flex-1">
                    <Pill cls={STATUS[m.status].cls}>{STATUS[m.status].label}</Pill>
                    {m.locked && <Pill cls="border-rose-400/20 bg-rose-400/10 text-rose-300">Locked for a few minutes</Pill>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 lg:shrink-0 lg:flex-nowrap lg:justify-end">
                  {!m.you && (
                    <>
                      <Button variant="outline" size="sm" className="whitespace-nowrap" disabled={busy === m.id} onClick={() => act(m, "link")} title={m.status === "invited" ? "Send the invite again" : "Send a link to set a new password"}>
                        {m.status === "invited" ? <Link2 className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                        {m.status === "invited" ? "Resend invite" : "Password link"}
                      </Button>
                      {m.status !== "invited" && (
                        <Button variant="outline" size="sm" className="whitespace-nowrap" disabled={busy === m.id} onClick={() => act(m, "reset")} title="For a lost phone: they set up a new authenticator at their next sign-in">
                          <ShieldOff className="h-4 w-4" /> Reset authenticator
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="whitespace-nowrap text-rose-300 hover:bg-rose-500/10" disabled={busy === m.id} onClick={() => act(m, "remove")}>
                        <UserMinus className="h-4 w-4" /> Remove
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {roles.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {roles.map((r) => (
            <div key={r.key} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <p className="text-sm font-semibold text-slate-200">{r.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{r.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
