"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Button, Card, Spinner } from "./ui";
import { BellRing, Megaphone, RefreshCw, ShieldAlert, Smartphone } from "lucide-react";

// Push health, product safety alerts and announcements.
//  • Safety alert: everyone who scanned the product in the last year, top priority,
//    even in quiet hours. Always check the count first; there's no undo.
//  • Announcement: every inbox; pushed only to people who turned on Tips & news
//    ("Important" pushes to everyone with notifications on — once a day, max).
//    Send a test first (to any account's email). One announcement per hour.

interface Status {
  pushConfigured: boolean;
  devices: number;
  last24h: Record<string, number>;
}

const STATUS_LABELS: [string, string][] = [
  ["sent", "Pushed"],
  ["deferred", "Waiting for morning"],
  ["skipped", "Not pushed (settings / daily limit)"],
  ["no_device", "No phone registered"],
  ["failed", "Failed"],
  ["inbox_only", "Inbox only"],
];

const field =
  "w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/50";
const label = "mb-1.5 block text-xs font-medium text-slate-400";

export default function Notifications({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setStatus(await api<Status>("/admin/notifications/status"));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-slate-400">Push health, product safety alerts and announcements.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="p-5">
        {loading || !status ? (
          <div className="grid place-items-center py-8">
            <Spinner className="h-6 w-6 text-cyan-400" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-[1fr_2fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <BellRing className="h-4 w-4 text-slate-400" />
                Push:
                {status.pushConfigured ? (
                  <span className="font-semibold text-emerald-300">Connected</span>
                ) : (
                  <span className="font-semibold text-amber-300">Not set up</span>
                )}
              </div>
              {!status.pushConfigured && (
                <p className="text-xs text-slate-400">
                  Add <code className="text-slate-200">FIREBASE_SERVICE_ACCOUNT</code> on Railway. Until then everything still
                  lands in people&apos;s in-app inbox.
                </p>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4 text-slate-400" />
                <span className="tabular-nums font-semibold">{status.devices}</span> phones can receive pushes
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Last 24 hours</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                {STATUS_LABELS.map(([k, name]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-500">{name}</dt>
                    <dd className="tabular-nums text-lg font-semibold text-slate-100">{status.last24h[k] ?? 0}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </Card>

      <SafetyAlert notify={notify} />
      <Announcement notify={notify} />
    </div>
  );
}

function SafetyAlert({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [barcode, setBarcode] = useState("");
  const [kind, setKind] = useState<"recall" | "counterfeit">("recall");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const payload = () => ({ barcode: barcode.trim(), kind, title: title.trim(), body: body.trim() });
  const ready = barcode.trim() && title.trim() && body.trim();

  async function check() {
    setBusy(true);
    try {
      const r = await api<{ wouldNotify: number }>("/admin/alerts/product", { method: "POST", body: JSON.stringify({ ...payload(), dryRun: true }) });
      setCount(r.wouldNotify);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (count === null) return;
    if (!confirm(`Send this ${kind} alert to ${count} ${count === 1 ? "person" : "people"}? It arrives right away, even at night, and can't be undone.`)) return;
    setBusy(true);
    try {
      const r = await api<{ notified: number }>("/admin/alerts/product", { method: "POST", body: JSON.stringify(payload()) });
      notify(`Alert sent to ${r.notified} ${r.notified === 1 ? "person" : "people"}`, "success");
      setCount(null);
      setTitle("");
      setBody("");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-300" />
        <div>
          <h3 className="font-semibold">Product safety alert</h3>
          <p className="text-sm text-slate-400">
            For a confirmed recall or counterfeit. Warns everyone who scanned this product in the last year, at top priority.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={label}>Barcode</span>
          <input className={`${field} font-mono`} value={barcode} onChange={(e) => (setBarcode(e.target.value), setCount(null))} placeholder="e.g. 6154000086961" />
        </label>
        <div>
          <span className={label}>Type</span>
          <div className="flex gap-2">
            {(["recall", "counterfeit"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={
                  "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition " +
                  (kind === k ? "border-rose-400/40 bg-rose-500/15 text-rose-200" : "border-white/10 text-slate-400 hover:text-slate-200")
                }
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        <label className="block md:col-span-2">
          <span className={label}>Title ({title.length}/80)</span>
          <input className={field} maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recall: Brand X Paracetamol, batch 2307" />
        </label>
        <label className="block md:col-span-2">
          <span className={label}>Message ({body.length}/300)</span>
          <textarea className={`${field} min-h-24`} maxLength={300} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Stop using it and return it to where you bought it. Batch 2307 contains…" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" disabled={!ready} loading={busy && count === null} onClick={check}>
          Check who&apos;ll be notified
        </Button>
        {count !== null && (
          <>
            <span className="text-sm text-slate-300">
              <span className="tabular-nums font-semibold">{count}</span> {count === 1 ? "person" : "people"} scanned it in the last year.
            </span>
            <Button variant="danger" size="sm" disabled={!count} loading={busy} onClick={send}>
              Send alert
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function Announcement({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"News" | "Tips">("News");
  const [country, setCountry] = useState("");
  const [important, setImportant] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [reach, setReach] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const payload = () => ({ title: title.trim(), body: body.trim(), category, country: country.trim() || undefined, important });
  const ready = title.trim() && body.trim() && title.length <= 65 && body.length <= 240;

  async function run(kind: "test" | "check" | "send") {
    if (
      kind === "send" &&
      !confirm(
        `Send this announcement to ${reach} ${reach === 1 ? "person" : "people"}${country ? ` in ${country.toUpperCase()}` : ""}?${important ? "\n\nImportant: it pushes to everyone with notifications on, not just Tips & news." : ""}`,
      )
    )
      return;
    setBusy(kind);
    try {
      if (kind === "test") {
        await api("/admin/notifications/broadcast", { method: "POST", body: JSON.stringify({ ...payload(), test: true, testEmail: testEmail.trim() || undefined }) });
        notify(`Test sent to ${testEmail.trim() || "your account"} — check the phone and inbox`, "success");
      } else if (kind === "check") {
        const r = await api<{ wouldReach: number }>("/admin/notifications/broadcast", { method: "POST", body: JSON.stringify({ ...payload(), dryRun: true }) });
        setReach(r.wouldReach);
      } else {
        const r = await api<{ queued: number }>("/admin/notifications/broadcast", { method: "POST", body: JSON.stringify(payload()) });
        notify(`Sending to ${r.queued} inboxes`, "success");
        setReach(null);
        setTitle("");
        setBody("");
      }
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start gap-3">
        <Megaphone className="mt-0.5 h-5 w-5 text-cyan-300" />
        <div>
          <h3 className="font-semibold">Announcement</h3>
          <p className="text-sm text-slate-400">
            Goes to every inbox; pushed to people who turned on Tips &amp; news. One announcement per hour.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className={label}>Title ({title.length}/65)</span>
          <input className={field} maxLength={65} value={title} onChange={(e) => (setTitle(e.target.value), setReach(null))} placeholder="New: scan the label to fill in missing details" />
        </label>
        <label className="block md:col-span-2">
          <span className={label}>Message ({body.length}/240)</span>
          <textarea className={`${field} min-h-20`} maxLength={240} value={body} onChange={(e) => (setBody(e.target.value), setReach(null))} />
        </label>
        <div>
          <span className={label}>Type</span>
          <div className="flex gap-2">
            {(["News", "Tips"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setCategory(k)}
                aria-pressed={category === k}
                className={
                  "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition " +
                  (category === k ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200" : "border-white/10 text-slate-400 hover:text-slate-200")
                }
              >
                {k === "Tips" ? "Tip" : "News"}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className={label}>Country (optional, 2 letters)</span>
          <input className={`${field} uppercase`} maxLength={2} value={country} onChange={(e) => (setCountry(e.target.value.replace(/[^a-z]/gi, "")), setReach(null))} placeholder="All countries" />
        </label>
        <label className="flex items-start gap-2.5 text-sm text-slate-300 md:col-span-2">
          <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="mt-0.5 h-4 w-4 accent-cyan-400" />
          <span>
            Important — push to everyone with notifications on, not only Tips &amp; news. Once a day at most; save it for things people
            would want to hear about.
          </span>
        </label>
        <label className="block md:col-span-2">
          <span className={label}>Send the test to (email of the account on your phone — blank for your admin account)</span>
          <input className={field} type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" disabled={!ready} loading={busy === "test"} onClick={() => run("test")}>
          Send a test
        </Button>
        <Button variant="outline" size="sm" disabled={!ready} loading={busy === "check"} onClick={() => run("check")}>
          Check audience
        </Button>
        {reach !== null && (
          <>
            <span className="text-sm text-slate-300">
              <span className="tabular-nums font-semibold">{reach}</span> {reach === 1 ? "person" : "people"}
            </span>
            <Button size="sm" disabled={!reach} loading={busy === "send"} onClick={() => run("send")}>
              Send announcement
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
