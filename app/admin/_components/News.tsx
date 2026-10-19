"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Button, Card, EmptyState, Spinner } from "./ui";
import { Eye, EyeOff, Newspaper, Pencil, RefreshCw, Rss, Trash2 } from "lucide-react";

// The app's News section: short posts about what's happening at CheckTag.
// Drafts are only visible here. Publishing can also drop the post in everyone's
// inbox (pushed to people who turned on Tips & news) — once, on first publish.

interface Post {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  country: string | null;
  publishedAt: string | null;
  createdAt: string;
}

type Draft = { title: string; body: string; imageUrl: string; linkUrl: string; linkLabel: string; country: string };
const EMPTY: Draft = { title: "", body: "", imageUrl: "", linkUrl: "", linkLabel: "", country: "" };

const field =
  "w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/50";
const label = "mb-1.5 block text-xs font-medium text-slate-400";
const https = (s: string) => !s.trim() || /^https:\/\/\S+$/.test(s.trim());

export default function News({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [items, setItems] = useState<Post[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // post id, or null for a new post
  const [d, setD] = useState<Draft>(EMPTY);
  const [announce, setAnnounce] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      setItems((await api<{ items: Post[] }>("/admin/news")).items);
    } catch (e: any) {
      notify(e.message, "error");
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = items?.find((p) => p.id === editing) || null;
  const valid = d.title.trim() && d.title.length <= 90 && d.body.trim() && d.body.length <= 1200 && https(d.imageUrl) && https(d.linkUrl);
  const payload = () => ({
    title: d.title.trim(),
    body: d.body.trim(),
    imageUrl: d.imageUrl.trim() || null,
    linkUrl: d.linkUrl.trim() || null,
    linkLabel: d.linkLabel.trim() || null,
    country: d.country.trim() || null,
  });

  function edit(p: Post | null) {
    setEditing(p?.id ?? null);
    setAnnounce(false);
    setD(p ? { title: p.title, body: p.body, imageUrl: p.imageUrl || "", linkUrl: p.linkUrl || "", linkLabel: p.linkLabel || "", country: p.country || "" } : EMPTY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(publish: boolean) {
    const goingLive = publish && !current?.publishedAt;
    if (goingLive && announce && !confirm(`Publish and send "${d.title.trim()}" to ${d.country ? `everyone in ${d.country.toUpperCase()}` : "every user"}'s inbox?`)) return;
    setBusy(publish ? "publish" : "save");
    try {
      const body = JSON.stringify({ ...payload(), ...(publish ? { publish: true, notify: goingLive && announce } : current ? {} : { publish: false }) });
      if (current) await api(`/admin/news/${current.id}`, { method: "PATCH", body });
      else await api("/admin/news", { method: "POST", body });
      notify(goingLive ? (announce ? "Published and sent to inboxes" : "Published") : "Saved", "success");
      edit(null);
      load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function unpublish(p: Post) {
    if (!confirm(`Take "${p.title}" down from the app? It goes back to drafts.`)) return;
    try {
      await api(`/admin/news/${p.id}`, { method: "PATCH", body: JSON.stringify({ publish: false }) });
      notify("Moved back to drafts", "success");
      load();
    } catch (e: any) {
      notify(e.message, "error");
    }
  }

  async function remove(p: Post) {
    if (!confirm(`Delete "${p.title}" for good?`)) return;
    try {
      await api(`/admin/news/${p.id}`, { method: "DELETE" });
      if (editing === p.id) edit(null);
      notify("Deleted", "success");
      load();
    } catch (e: any) {
      notify(e.message, "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">News</h2>
          <p className="text-sm text-slate-400">Short posts for the app&apos;s News section. Keep them few and worth reading.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <Newspaper className="h-5 w-5 text-cyan-300" />
          <h3 className="font-semibold">{current ? "Edit post" : "New post"}</h3>
          {current && (
            <button type="button" onClick={() => edit(null)} className="ml-auto text-sm text-slate-400 hover:text-slate-200">
              Cancel
            </button>
          )}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className={label}>Title ({d.title.length}/90)</span>
              <input className={field} maxLength={90} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="CheckTag now reads NAFDAC numbers from labels" />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>Text ({d.body.length}/1200)</span>
              <textarea className={`${field} min-h-32`} maxLength={1200} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>Image link (optional, https)</span>
              <input className={field} value={d.imageUrl} onChange={(e) => setD({ ...d, imageUrl: e.target.value })} placeholder="https://…/photo.jpg" />
            </label>
            <label className="block">
              <span className={label}>Button link (optional, https)</span>
              <input className={field} value={d.linkUrl} onChange={(e) => setD({ ...d, linkUrl: e.target.value })} placeholder="https://checktag.io/…" />
            </label>
            <label className="block">
              <span className={label}>Button text ({d.linkLabel.length}/30)</span>
              <input className={field} maxLength={30} value={d.linkLabel} onChange={(e) => setD({ ...d, linkLabel: e.target.value })} placeholder="Read more" />
            </label>
            <label className="block">
              <span className={label}>Country (optional, 2 letters)</span>
              <input className={`${field} uppercase`} maxLength={2} value={d.country} onChange={(e) => setD({ ...d, country: e.target.value.replace(/[^a-z]/gi, "") })} placeholder="Everyone" />
            </label>
            {!current?.publishedAt && (
              <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm text-slate-300">
                <input type="checkbox" checked={announce} onChange={(e) => setAnnounce(e.target.checked)} className="h-4 w-4 accent-cyan-400" />
                Also send to inboxes when published
              </label>
            )}
          </div>

          {/* Roughly how it reads in the app */}
          <div>
            <span className={label}>Preview</span>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
              {/^https:\/\/\S+$/.test(d.imageUrl.trim()) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.imageUrl.trim()} alt="" className="aspect-[16/9] w-full object-cover" />
              )}
              <div className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">News{d.country ? ` · ${d.country.toUpperCase()}` : ""}</div>
                <div className="mt-1 font-semibold text-slate-100">{d.title || "Your title"}</div>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-400">{d.body || "What's happening, in a few sentences."}</p>
                {d.linkUrl && <div className="mt-3 inline-block rounded-lg bg-cyan-400/15 px-3 py-1.5 text-sm font-semibold text-cyan-200">{d.linkLabel || "Open"}</div>}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="sm" disabled={!valid} loading={busy === "publish"} onClick={() => save(true)}>
            {current?.publishedAt ? "Save changes" : "Publish"}
          </Button>
          {!current?.publishedAt && (
            <Button variant="outline" size="sm" disabled={!valid} loading={busy === "save"} onClick={() => save(false)}>
              Save draft
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {!items ? (
          <div className="grid place-items-center py-10">
            <Spinner className="h-6 w-6 text-cyan-400" />
          </div>
        ) : !items.length ? (
          <EmptyState label="No posts yet" />
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={"rounded-full border px-2 py-0.5 text-[11px] font-semibold " + (p.publishedAt ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-white/15 text-slate-400")}>
                      {p.publishedAt ? "Live" : "Draft"}
                    </span>
                    {p.country && <span className="text-xs text-slate-500">{p.country}</span>}
                    <span className="truncate font-medium text-slate-100">{p.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {p.publishedAt ? `Published ${new Date(p.publishedAt).toLocaleString()}` : `Created ${new Date(p.createdAt).toLocaleString()}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => edit(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  {p.publishedAt && (
                    <Button variant="ghost" size="sm" onClick={() => unpublish(p)}>
                      Unpublish
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" aria-label={`Delete ${p.title}`} onClick={() => remove(p)}>
                    <Trash2 className="h-4 w-4 text-rose-300" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <OutletStories notify={notify} />
    </div>
  );
}

// ------------------------------------------------------------------ outlets

interface Story {
  id: string;
  source: string;
  title: string;
  url: string;
  region: string | null;
  alert: boolean;
  hidden: boolean;
  publishedAt: string;
}

/**
 * Stories the app's News section shows from regulators (NAFDAC's recalls and
 * safety alerts) and news outlets, picked up every 30 minutes and filtered to
 * food, drink, medicine and counterfeit news. Hide anything that slipped in.
 */
function OutletStories({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [items, setItems] = useState<Story[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      setItems((await api<{ items: Story[] }>("/admin/news/articles")).items);
    } catch (e: any) {
      notify(e.message, "error");
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNow() {
    setBusy("fetch");
    try {
      const r = await api<{ added: number; failed: string[] }>("/admin/news/articles/refresh", { method: "POST" });
      notify(`${r.added} new stor${r.added === 1 ? "y" : "ies"}${r.failed.length ? ` · couldn't reach ${r.failed.join(", ")}` : ""}`, r.failed.length ? "error" : "success");
      load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function toggle(s: Story) {
    setBusy(s.id);
    try {
      await api(`/admin/news/articles/${s.id}`, { method: "POST", body: JSON.stringify({ hidden: !s.hidden }) });
      setItems((list) => list?.map((x) => (x.id === s.id ? { ...x, hidden: !s.hidden } : x)) ?? null);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 p-5">
        <div className="flex items-start gap-3">
          <Rss className="mt-0.5 h-5 w-5 text-cyan-300" />
          <div>
            <h3 className="font-semibold">From regulators and news outlets</h3>
            <p className="text-sm text-slate-400">
              NAFDAC recalls and safety alerts, and food, drink, medicine and counterfeit stories from Punch, Vanguard, Premium Times, Daily Trust,
              Channels TV, Nairametrics, BusinessDay and Leadership. Picked up every 30 minutes; headlines link to the outlet.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" loading={busy === "fetch"} onClick={fetchNow}>
          <RefreshCw className="h-4 w-4" /> Fetch now
        </Button>
      </div>
      {!items ? (
        <div className="grid place-items-center py-10">
          <Spinner className="h-6 w-6 text-cyan-400" />
        </div>
      ) : !items.length ? (
        <EmptyState label="No stories yet — they appear within 30 minutes of a deploy, or use Fetch now." />
      ) : (
        <ul className="max-h-[560px] divide-y divide-white/5 overflow-y-auto">
          {items.map((s) => (
            <li key={s.id} className={"flex items-start gap-3 px-5 py-3 " + (s.hidden ? "opacity-50" : "")}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-300">{s.source}</span>
                  <span>{new Date(s.publishedAt).toLocaleDateString()}</span>
                  {s.region && <span>{s.region}</span>}
                  {s.alert && <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-semibold text-amber-300">Alert</span>}
                  {s.hidden && <span className="rounded-full border border-white/15 px-2 py-0.5">Hidden</span>}
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-sm text-slate-100 hover:text-cyan-300">
                  {s.title}
                </a>
              </div>
              <Button variant="ghost" size="sm" loading={busy === s.id} onClick={() => toggle(s)} aria-label={s.hidden ? `Show ${s.title}` : `Hide ${s.title}`}>
                {s.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {s.hidden ? "Show" : "Hide"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
