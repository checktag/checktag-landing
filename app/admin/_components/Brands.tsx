"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { cn, safeHttpUrl } from "@/lib/utils";
import { Button, Card, EmptyState, Filters, Select, Spinner } from "./ui";
import { ArrowLeft, Building2, Check, Copy, Pause, Play, RefreshCw, RotateCcw, Send, Unlink, X } from "lucide-react";

// Brands (producers) on CheckTag:
//  • Applications from checktag.io/business: approve (creates the brand and
//    invites its Owner) or reject (the applicant is emailed).
//  • Verified brands: their people and products; pause portal access; undo a
//    brand's edits to a product or take a product away from it.
//  • Product claims: check the barcodes are theirs, approve all or some.
//  • Recalls brands submitted: publishing notifies everyone who scanned the
//    product in the last year, so check the count first.

type Notify = (m: string, k: "success" | "error") => void;
type Section = "applications" | "brands" | "claims" | "recalls";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "applications", label: "Applications" },
  { key: "brands", label: "Brands" },
  { key: "claims", label: "Claims" },
  { key: "recalls", label: "Recalls" },
];

const field =
  "w-full rounded-xl border border-white/10 bg-brand-raised px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-brand-accent/50";
const label = "mb-1.5 block text-xs font-medium text-slate-400";
const when = (s: string | null | undefined) => (s ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", cls)}>{children}</span>;
}
const tone = {
  good: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  bad: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  info: "border-brand-cyan/20 bg-brand-cyan/10 text-brand-sky",
  muted: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

function Loading() {
  return (
    <div className="grid place-items-center py-20">
      <Spinner className="h-6 w-6 text-brand-accent" />
    </div>
  );
}

/** A website as typed by the applicant ("acme.ng") → a safe link, or null. */
const siteLink = (w: string | null) => (w ? safeHttpUrl(/^https?:\/\//i.test(w) ? w : `https://${w}`) : null);

export default function Brands({ notify }: { notify: Notify }) {
  const [section, setSection] = useState<Section>("applications");
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-brand-accent" /> Brands
          </h2>
          <p className="text-sm text-slate-400">Brand portal applications, verified brands, product claims and recalls brands send us.</p>
        </div>
        <div role="tablist" className="flex flex-wrap rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={section === s.key}
              onClick={() => setSection(s.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                section === s.key ? "bg-brand-cyan/15 text-brand-cyan-soft" : "text-slate-400 hover:text-slate-200",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {section === "applications" && <Applications notify={notify} />}
      {section === "brands" && <BrandList notify={notify} />}
      {section === "claims" && <Claims notify={notify} />}
      {section === "recalls" && <Recalls notify={notify} />}
    </div>
  );
}

// ================================================================== applications

interface Application {
  id: string;
  companyName: string;
  website: string | null;
  country: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  brands: string | null;
  gs1Prefixes: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  tenantId: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

type AppStatus = "pending" | "approved" | "rejected" | "all";
const APP_STATUS: Record<Application["status"], { label: string; cls: string }> = {
  pending: { label: "Waiting", cls: tone.warn },
  approved: { label: "Approved", cls: tone.good },
  rejected: { label: "Rejected", cls: tone.bad },
};

function Applications({ notify }: { notify: Notify }) {
  const [status, setStatus] = useState<AppStatus>("pending");
  const [items, setItems] = useState<Application[] | null>(null);

  async function load(s: AppStatus = status) {
    setItems(null);
    try {
      const r = await api<{ items: Application[] }>(`/admin/brands/applications?status=${s}`);
      // Waiting ones first, then newest.
      setItems([...r.items].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending")));
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <Filters>
        <Select<AppStatus>
          label="Show"
          value={status}
          onChange={setStatus}
          options={[
            { value: "pending", label: "Waiting" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "all", label: "All" },
          ]}
        />
        <Button variant="outline" size="sm" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </Filters>
      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label={status === "pending" ? "No applications waiting." : "Nothing here."} />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <ApplicationCard key={a.id} a={a} notify={notify} onDone={(next) => setItems((l) => (l || []).map((x) => (x.id === a.id ? next : x)))} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ a, notify, onDone }: { a: Application; notify: Notify; onDone: (a: Application) => void }) {
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState<{ link: string; emailed: boolean; email: string } | null>(null);
  const site = siteLink(a.website);

  async function approve(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ tenantId: string; invite: { member: { email: string | null }; link: string; emailed: boolean } }>(`/admin/brands/applications/${encodeURIComponent(a.id)}/approve`, {
        method: "POST",
        body: JSON.stringify({ ...(ownerEmail.trim() && { ownerEmail: ownerEmail.trim() }), ...(brandName.trim() && { brandName: brandName.trim() }) }),
      });
      const email = r.invite.member.email || ownerEmail.trim() || a.contactEmail;
      setInvite({ link: r.invite.link, emailed: r.invite.emailed, email });
      setMode(null);
      notify(r.invite.emailed ? `Approved. Invite emailed to ${email}.` : "Approved. The invite email failed: copy the link and send it.", "success");
      onDone({ ...a, status: "approved", tenantId: r.tenantId });
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function reject(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Reject ${a.companyName}'s application? ${a.contactEmail} is emailed${note.trim() ? " with your note" : ""}.`)) return;
    setBusy(true);
    try {
      await api(`/admin/brands/applications/${encodeURIComponent(a.id)}/reject`, { method: "POST", body: JSON.stringify({ note: note.trim() }) });
      notify("Application rejected. The applicant was emailed.", "success");
      setMode(null);
      onDone({ ...a, status: "rejected", reviewNote: note.trim() || null });
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Pill cls={APP_STATUS[a.status].cls}>{APP_STATUS[a.status].label}</Pill>
            <span>Applied {when(a.createdAt)}</span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-100">{a.companyName}</p>
          <p className="text-sm text-slate-300 [overflow-wrap:anywhere]">
            {a.contactName} · <a href={`mailto:${a.contactEmail}`} className="text-brand-sky hover:underline">{a.contactEmail}</a>
            {a.contactPhone && ` · ${a.contactPhone}`}
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            <Row k="Website" v={site ? <a href={site} target="_blank" rel="noopener noreferrer" className="text-brand-sky hover:underline">{a.website}</a> : a.website} />
            <Row k="Country" v={a.country} />
            <Row k="Brands" v={a.brands} />
            <Row k="Barcodes / GS1 prefixes" v={a.gs1Prefixes} mono />
          </dl>
          {a.message && <p className="mt-3 whitespace-pre-line rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300 [overflow-wrap:anywhere]">{a.message}</p>}
          {a.status === "rejected" && a.reviewNote && <p className="mt-2 text-xs text-slate-500">Our note: {a.reviewNote}</p>}
        </div>
        {a.status === "pending" && !mode && (
          <div className="flex shrink-0 gap-2">
            <Button variant="success" size="sm" onClick={() => setMode("approve")}>
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button variant="ghost" size="sm" className="text-rose-300 hover:bg-rose-500/10" onClick={() => setMode("reject")}>
              <X className="h-4 w-4" /> Reject
            </Button>
          </div>
        )}
      </div>

      {mode === "approve" && (
        <form onSubmit={approve} className="mt-4 space-y-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
          <p className="text-sm text-slate-300">
            Approving creates the brand on the free pilot and invites its first Owner to the portal. Check the company is real and the contact works there first.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Owner&apos;s email (optional)</span>
              <input type="email" className={field} value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder={a.contactEmail} />
            </label>
            <label className="block">
              <span className={label}>Brand name shown on CheckTag (optional)</span>
              <input className={field} value={brandName} onChange={(e) => setBrandName(e.target.value)} maxLength={120} placeholder={a.companyName} />
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="success" size="sm" loading={busy}>
              <Check className="h-4 w-4" /> Approve and send the invite
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {mode === "reject" && (
        <form onSubmit={reject} className="mt-4 space-y-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.04] p-4">
          <label className="block">
            <span className={label}>Note to the applicant (optional, included in the email)</span>
            <textarea className={`${field} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="We couldn't confirm you work for this company. Reply from your company email address and we'll look again." />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="danger" size="sm" loading={busy}>
              Reject application
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {invite && <LinkBox notify={notify} link={invite.link} text={invite.emailed ? `We emailed the invite to ${invite.email}. If it doesn't arrive, send them this link.` : `The invite email to ${invite.email} couldn't be sent. Copy this link and send it to them.`} onDone={() => setInvite(null)} />}
    </Card>
  );
}

function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className={cn("text-slate-200 [overflow-wrap:anywhere]", mono && "font-mono text-xs")}>{v || "—"}</dd>
    </div>
  );
}

function LinkBox({ link, text, notify, onDone }: { link: string; text: string; notify: Notify; onDone: () => void }) {
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-brand-ink/50 p-4">
      <p className="text-sm text-slate-200">
        {text} <span className="text-slate-400">Only send it to them: anyone with the link can set the password. It works once, for 3 days.</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input readOnly value={link} aria-label="Invite link" className={cn(field, "min-w-0 flex-1 basis-full py-2 font-mono text-xs sm:basis-auto")} onFocus={(e) => e.target.select()} />
        <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(link).then(() => notify("Link copied", "success"))}>
          <Copy className="h-4 w-4" /> Copy
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

// ================================================================== verified brands

interface BrandRow {
  id: string;
  name: string;
  status: string;
  website: string | null;
  country: string | null;
  verifiedAt: string | null;
  createdAt: string;
  members: number;
  products: number;
  codes: number;
  openAlerts: number;
}

interface BrandDetail {
  brand: { id: string; name: string; status: string; website: string | null; country: string | null; logoUrl: string | null; plan: string; verifiedAt: string | null };
  members: { id: string; email: string | null; role: string; mfaState: string | null; lastSeen: string | null; joined: boolean }[];
  products: { barcode: string; name: string | null; imageUrl: string | null; brandProvided: string[]; scans: number; scans30d: number; reviewCount: number; rating: number | null; reports: number }[];
}

const ROLE_LABEL: Record<string, string> = { ORG_OWNER: "Owner", ORG_ADMIN: "Admin", ANALYST: "Viewer" };

function BrandList({ notify }: { notify: Notify }) {
  const [items, setItems] = useState<BrandRow[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    setItems(null);
    try {
      setItems((await api<{ items: BrandRow[] }>("/admin/brands")).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (open) return <BrandView id={open} notify={notify} onBack={() => (setOpen(null), load())} />;

  return (
    <div>
      <Filters>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </Filters>
      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label="No verified brands yet. Approve an application to add one." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 md:flex md:gap-4">
            <span className="flex-1">Brand</span>
            <span className="w-20 text-right">People</span>
            <span className="w-20 text-right">Products</span>
            <span className="w-24 text-right">Codes</span>
            <span className="w-24 text-right">Open alerts</span>
          </div>
          <ul>
            {items.map((b) => (
              <li key={b.id} className="border-b border-white/5 last:border-0">
                <button onClick={() => setOpen(b.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-left text-sm transition hover:bg-white/[0.03] md:flex-nowrap">
                  <span className="min-w-0 flex-1 basis-full md:basis-auto">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium text-slate-100">{b.name}</span>
                      {b.status !== "active" && <Pill cls={tone.warn}>Paused</Pill>}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{[b.country, b.website, `verified ${when(b.verifiedAt)}`].filter(Boolean).join(" · ")}</span>
                  </span>
                  <Num v={b.members} label="people" />
                  <Num v={b.products} label="products" />
                  <Num v={b.codes} label="codes" w="md:w-24" />
                  <Num v={b.openAlerts} label="open alerts" w="md:w-24" warn={b.openAlerts > 0} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Num({ v, label, w = "md:w-20", warn }: { v: number; label: string; w?: string; warn?: boolean }) {
  return (
    <span className={cn("text-xs text-slate-400 md:text-right md:text-sm md:text-slate-200", w, warn && "text-amber-300 md:text-amber-300")}>
      <span className="tabular-nums">{v.toLocaleString()}</span>
      <span className="md:hidden"> {label}</span>
    </span>
  );
}

function BrandView({ id, notify, onBack }: { id: string; notify: Notify; onBack: () => void }) {
  const [d, setD] = useState<BrandDetail | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      setD(await api<BrandDetail>(`/admin/brands/${encodeURIComponent(id)}`));
    } catch (e: any) {
      notify(e.message, "error");
      onBack();
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!d) return <Loading />;
  const paused = d.brand.status !== "active";

  async function setStatus() {
    const msg = paused
      ? `Resume portal access for ${d!.brand.name}? Its people can sign in again.`
      : `Pause portal access for ${d!.brand.name}? Everyone at the brand is signed out and can't sign in until you resume it. Their codes keep working for shoppers.`;
    if (!confirm(msg)) return;
    setBusy("status");
    try {
      const r = await api<{ brand: BrandDetail["brand"] }>(`/admin/brands/${encodeURIComponent(id)}/status`, { method: "POST", body: JSON.stringify({ status: paused ? "active" : "paused" }) });
      setD((x) => (x ? { ...x, brand: { ...x.brand, status: r.brand.status } } : x));
      notify(paused ? "Portal access resumed." : "Portal access paused. The brand's people were signed out.", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function product(barcode: string, name: string, what: "revert" | "release") {
    const msg =
      what === "revert"
        ? `Roll back ${d!.brand.name}'s edits to "${name}"? The product goes back to what it showed before their first edit.`
        : `Remove "${name}" from ${d!.brand.name}? They can't edit it, make codes for it or send recalls for it any more. Their edits stay until you roll them back.`;
    if (!confirm(msg)) return;
    setBusy(barcode + what);
    try {
      await api(`/admin/brands/products/${encodeURIComponent(barcode)}/${what}`, { method: "POST" });
      notify(what === "revert" ? "Brand edits rolled back." : "Product removed from the brand.", "success");
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const site = siteLink(d.brand.website);
  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> All brands
      </button>
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold">
              {d.brand.name} {paused ? <Pill cls={tone.warn}>Paused</Pill> : <Pill cls={tone.good}>Active</Pill>}
            </p>
            <p className="text-sm text-slate-400">
              {[d.brand.country, d.brand.plan === "pilot" ? "Free pilot" : d.brand.plan, `verified ${when(d.brand.verifiedAt)}`].filter(Boolean).join(" · ")}
              {site && (
                <>
                  {" · "}
                  <a href={site} target="_blank" rel="noopener noreferrer" className="text-brand-sky hover:underline">
                    {d.brand.website}
                  </a>
                </>
              )}
            </p>
          </div>
          <Button variant={paused ? "success" : "outline"} size="sm" loading={busy === "status"} onClick={setStatus}>
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} {paused ? "Resume portal access" : "Pause portal access"}
          </Button>
        </div>
      </Card>

      <h3 className="mb-3 mt-6 font-semibold">People ({d.members.length})</h3>
      <Card className="overflow-hidden">
        <ul>
          {d.members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-5 py-3 text-sm last:border-0">
              <span className="min-w-0 text-slate-100 [overflow-wrap:anywhere]">{m.email || "—"}</span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-300">{ROLE_LABEL[m.role] || m.role}</span>
                {!m.joined ? <Pill cls={tone.warn}>Invited</Pill> : m.mfaState !== "enabled" ? <Pill cls={tone.info}>No authenticator yet</Pill> : <Pill cls={tone.good}>Active</Pill>}
                <span>Last sign-in {m.lastSeen ? when(m.lastSeen) : "never"}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <h3 className="mb-3 mt-6 font-semibold">Products ({d.products.length})</h3>
      {d.products.length === 0 ? (
        <Card>
          <EmptyState label="No products yet." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul>
            {d.products.map((p) => {
              const name = p.name || p.barcode;
              return (
                <li key={p.barcode} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-3 text-sm last:border-0">
                  <div className="min-w-0 flex-1 basis-60">
                    <p className="truncate font-medium text-slate-100">{name}</p>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono">{p.barcode}</span> · {p.scans30d.toLocaleString()} scans in 30 days · {p.reports} report{p.reports === 1 ? "" : "s"}
                      {p.brandProvided.length > 0 && <span className="text-brand-sky"> · brand edited: {p.brandProvided.join(", ")}</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.brandProvided.length > 0 && (
                      <Button variant="outline" size="sm" loading={busy === p.barcode + "revert"} disabled={!!busy} onClick={() => product(p.barcode, name, "revert")}>
                        <RotateCcw className="h-4 w-4" /> Roll back brand edits
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-rose-300 hover:bg-rose-500/10" loading={busy === p.barcode + "release"} disabled={!!busy} onClick={() => product(p.barcode, name, "release")}>
                      <Unlink className="h-4 w-4" /> Remove from brand
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

// ================================================================== claims

interface ClaimItem {
  barcode: string;
  name?: string;
  catalogue: { name: string | null; brand: string | null } | null;
}
interface Claim {
  id: string;
  tenantId: string;
  brand: string | null;
  items: ClaimItem[];
  evidence: string;
  status: "pending" | "approved" | "partial" | "rejected";
  reviewNote: string | null;
  createdAt: string;
}

const CLAIM_STATUS: Record<Claim["status"], { label: string; cls: string }> = {
  pending: { label: "Waiting", cls: tone.warn },
  approved: { label: "Approved", cls: tone.good },
  partial: { label: "Partly approved", cls: tone.info },
  rejected: { label: "Rejected", cls: tone.bad },
};

function Claims({ notify }: { notify: Notify }) {
  const [status, setStatus] = useState<"pending" | "all">("pending");
  const [items, setItems] = useState<Claim[] | null>(null);

  async function load(s = status) {
    setItems(null);
    try {
      setItems((await api<{ items: Claim[] }>(`/admin/brands/claims?status=${s}`)).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <Filters>
        <Select
          label="Show"
          value={status}
          onChange={setStatus}
          options={[
            { value: "pending", label: "Waiting" },
            { value: "all", label: "All" },
          ]}
        />
        <Button variant="outline" size="sm" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </Filters>
      <p className="mb-4 text-xs text-slate-500">
        Check the barcodes really belong to the brand: the GS1 prefix (the first digits) should match theirs, and the catalogue&apos;s brand name should fit. Approved products can be edited by the brand straight away.
      </p>
      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label={status === "pending" ? "No claims waiting." : "Nothing here."} />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <ClaimCard key={c.id} c={c} notify={notify} onDone={() => load()} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClaimCard({ c, notify, onDone }: { c: Claim; notify: Notify; onDone: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(c.items.map((i) => i.barcode)));
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const pending = c.status === "pending";
  const all = picked.size === c.items.length;

  async function approve(subset: boolean) {
    const n = subset ? picked.size : c.items.length;
    if (!confirm(`Approve ${n} product${n === 1 ? "" : "s"} for ${c.brand}? They can edit ${n === 1 ? "it" : "them"}, make codes and send recalls straight away.`)) return;
    setBusy("approve");
    try {
      const r = await api<{ status: string; approved: number }>(`/admin/brands/claims/${encodeURIComponent(c.id)}/approve`, {
        method: "POST",
        body: JSON.stringify(subset ? { barcodes: [...picked] } : {}),
      });
      notify(`${r.approved} product${r.approved === 1 ? "" : "s"} approved for ${c.brand}.`, "success");
      onDone();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function reject(e: React.FormEvent) {
    e.preventDefault();
    setBusy("reject");
    try {
      await api(`/admin/brands/claims/${encodeURIComponent(c.id)}/reject`, { method: "POST", body: JSON.stringify({ note: note.trim() }) });
      notify("Claim rejected. The brand sees your note in the portal.", "success");
      onDone();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Pill cls={CLAIM_STATUS[c.status].cls}>{CLAIM_STATUS[c.status].label}</Pill>
        <span className="font-semibold text-slate-200">{c.brand || c.tenantId}</span>
        <span>
          · {c.items.length} product{c.items.length === 1 ? "" : "s"} · {when(c.createdAt)}
        </span>
      </div>
      <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300 [overflow-wrap:anywhere]">
        <span className="mb-1 block text-xs text-slate-500">Their evidence</span>
        {c.evidence}
      </p>
      <ul className="mt-3 divide-y divide-white/5 rounded-xl border border-white/10">
        {c.items.map((i) => (
          <li key={i.barcode}>
            <label className={cn("flex items-start gap-3 px-3 py-2 text-sm", pending && "cursor-pointer hover:bg-white/[0.03]")}>
              {pending && (
                <input
                  type="checkbox"
                  className="mt-1 accent-[#22AED1]"
                  checked={picked.has(i.barcode)}
                  onChange={(e) =>
                    setPicked((s) => {
                      const n = new Set(s);
                      if (e.target.checked) n.add(i.barcode);
                      else n.delete(i.barcode);
                      return n;
                    })
                  }
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="font-mono text-xs text-slate-300">{i.barcode}</span>{" "}
                {i.catalogue ? (
                  <span className="text-slate-100">
                    {i.catalogue.name || "Unnamed"}
                    <span className="text-slate-500"> · catalogue brand: {i.catalogue.brand && i.catalogue.brand !== "Unknown" ? i.catalogue.brand : "unknown"}</span>
                  </span>
                ) : (
                  <span className="text-amber-200">
                    Not in the catalogue. Approving creates it as &ldquo;{i.name || "Product"}&rdquo;.
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {c.reviewNote && <p className="mt-2 text-xs text-slate-500">Our note: {c.reviewNote}</p>}

      {pending && !rejecting && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="success" size="sm" loading={busy === "approve" && all} disabled={!!busy} onClick={() => approve(false)}>
            <Check className="h-4 w-4" /> Approve all ({c.items.length})
          </Button>
          {!all && picked.size > 0 && (
            <Button variant="outline" size="sm" loading={busy === "approve"} disabled={!!busy} onClick={() => approve(true)}>
              <Check className="h-4 w-4" /> Approve selected ({picked.size})
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-rose-300 hover:bg-rose-500/10" disabled={!!busy} onClick={() => setRejecting(true)}>
            <X className="h-4 w-4" /> Reject
          </Button>
        </div>
      )}
      {pending && rejecting && (
        <form onSubmit={reject} className="mt-4 space-y-2">
          <textarea className={`${field} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Why, so the brand can fix it (shown in their portal). E.g. these barcodes use another company's GS1 prefix." />
          <div className="flex gap-2">
            <Button type="submit" variant="danger" size="sm" loading={busy === "reject"}>
              Reject claim
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

// ================================================================== recalls

interface Recall {
  id: string;
  tenantId: string;
  brand: string | null;
  kind: "recall" | "safety_notice" | "counterfeit_warning";
  title: string | null;
  body: string | null;
  barcodes: string[];
  lots: string[];
  status: "DRAFT" | "STAGED" | "PUBLISHED" | "RESOLVED";
  createdAt: string;
  submittedAt: string | null;
  publishedAt: string | null;
  resolvedAt: string | null;
  notifiedCount: number | null;
}

const KIND_LABEL: Record<Recall["kind"], string> = { recall: "Recall", safety_notice: "Safety notice", counterfeit_warning: "Counterfeit warning" };
type RecallFilter = "STAGED" | "PUBLISHED" | "all";

function Recalls({ notify }: { notify: Notify }) {
  const [status, setStatus] = useState<RecallFilter>("STAGED");
  const [items, setItems] = useState<Recall[] | null>(null);
  const [names, setNames] = useState<Record<string, string | null>>({});

  async function load(s = status) {
    setItems(null);
    try {
      const r = await api<{ items: Recall[]; names: Record<string, string | null> }>(`/admin/brands/recalls?status=${s}`);
      setItems(r.items);
      setNames(r.names);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <Filters>
        <Select<RecallFilter>
          label="Show"
          value={status}
          onChange={setStatus}
          options={[
            { value: "STAGED", label: "Waiting for review" },
            { value: "PUBLISHED", label: "Published" },
            { value: "all", label: "All" },
          ]}
        />
        <Button variant="outline" size="sm" onClick={() => load()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </Filters>
      <p className="mb-4 text-xs text-slate-500">
        Publishing notifies everyone who scanned the product in the last year, and every scan shows it until it&apos;s resolved. There&apos;s no undo: check it&apos;s accurate and comes from the brand.
      </p>
      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label={status === "STAGED" ? "No recalls waiting for review." : "Nothing here."} />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <RecallCard key={r.id} r={r} names={names} notify={notify} onDone={() => load()} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecallCard({ r, names, notify, onDone }: { r: Recall; names: Record<string, string | null>; notify: Notify; onDone: () => void }) {
  const [audience, setAudience] = useState<number | null>(null);
  const [sendingBack, setSendingBack] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (r.status !== "STAGED") return;
    api<{ wouldNotify: number }>(`/admin/brands/recalls/${encodeURIComponent(r.id)}/audience`).then(
      (x) => setAudience(x.wouldNotify),
      () => {},
    );
  }, [r.id, r.status]);

  async function approve() {
    if (audience === null) return;
    if (!confirm(`Publish this ${KIND_LABEL[r.kind].toLowerCase()} and notify ${audience.toLocaleString()} ${audience === 1 ? "person" : "people"} now? They're notified straight away, and it can't be undone.`)) return;
    setBusy("approve");
    try {
      const out = await api<{ recall: Recall }>(`/admin/brands/recalls/${encodeURIComponent(r.id)}/approve`, { method: "POST" });
      notify(`Published. ${(out.recall.notifiedCount ?? 0).toLocaleString()} people notified.`, "success");
      onDone();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function sendBack(e: React.FormEvent) {
    e.preventDefault();
    setBusy("reject");
    try {
      await api(`/admin/brands/recalls/${encodeURIComponent(r.id)}/reject`, { method: "POST", body: JSON.stringify({ note: note.trim() }) });
      notify("Sent back to the brand with your note.", "success");
      onDone();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function resolve() {
    if (!confirm("Mark this resolved? Scans stop showing it. Nobody is notified.")) return;
    setBusy("resolve");
    try {
      await api(`/admin/brands/recalls/${encodeURIComponent(r.id)}/resolve`, { method: "POST" });
      notify("Marked as resolved.", "success");
      onDone();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const statusPill =
    r.status === "STAGED" ? <Pill cls={tone.warn}>Waiting for review</Pill> : r.status === "PUBLISHED" ? <Pill cls={tone.bad}>Published</Pill> : r.status === "RESOLVED" ? <Pill cls={tone.good}>Resolved</Pill> : <Pill cls={tone.muted}>Draft</Pill>;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {statusPill}
        <Pill cls={tone.muted}>{KIND_LABEL[r.kind] || r.kind}</Pill>
        <span className="font-semibold text-slate-200">{r.brand || r.tenantId}</span>
        <span>· {r.publishedAt ? `published ${when(r.publishedAt)}` : r.submittedAt ? `sent ${when(r.submittedAt)}` : when(r.createdAt)}</span>
      </div>
      <p className="mt-2 font-semibold text-slate-100">{r.title}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-slate-300 [overflow-wrap:anywhere]">{r.body}</p>
      <div className="mt-3 space-y-1 text-xs text-slate-400">
        <p>
          Products:{" "}
          {r.barcodes.map((b, i) => (
            <span key={b}>
              {i > 0 && ", "}
              <span className="text-slate-200">{names[b] || "Unknown product"}</span> <span className="font-mono">({b})</span>
            </span>
          ))}
        </p>
        <p>{r.lots.length ? `Lots: ${r.lots.join(", ")}` : "All lots"}</p>
        {r.status !== "STAGED" && r.notifiedCount != null && <p>Notified {r.notifiedCount.toLocaleString()} people</p>}
      </div>

      {r.status === "STAGED" && !sendingBack && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-300">
            {audience === null ? "Counting who'd be notified…" : `${audience.toLocaleString()} ${audience === 1 ? "person" : "people"} scanned ${r.barcodes.length === 1 ? "it" : "these"} in the last year.`}
          </span>
          <Button variant="danger" size="sm" loading={busy === "approve"} disabled={audience === null || !!busy} onClick={approve}>
            <Send className="h-4 w-4" /> Approve &amp; publish
          </Button>
          <Button variant="ghost" size="sm" disabled={!!busy} onClick={() => setSendingBack(true)}>
            Send back
          </Button>
        </div>
      )}
      {r.status === "STAGED" && sendingBack && (
        <form onSubmit={sendBack} className="mt-4 space-y-2">
          <textarea className={`${field} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="What to change, shown to the brand. E.g. say which lot numbers are affected and where people can return it." />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={busy === "reject"}>
              Send back with note
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSendingBack(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {r.status === "PUBLISHED" && (
        <div className="mt-4">
          <Button variant="outline" size="sm" loading={busy === "resolve"} onClick={resolve}>
            <Check className="h-4 w-4" /> Resolve
          </Button>
        </div>
      )}
    </Card>
  );
}
