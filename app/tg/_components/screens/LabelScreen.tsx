"use client";

// Photograph the ingredients / nutrition panel → the vision model reads it
// (25–40 s) → the person checks each field → a moderated update that earns
// points when approved.

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Camera, Check, Clock, Crop, Focus, ImageIcon, Loader2, MessageCircle, Search, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api, ApiError, enc, errText } from "../../_lib/api";
import { useApp } from "../../_lib/app";
import { nkey, plural } from "../../_lib/format";
import { closeApp, haptic, LINK_COPY, notify } from "../../_lib/telegram";
import type { LabelChange, LabelScan } from "../../_lib/types";
import { ActionBar, TopBar } from "../Shell";
import { Button, Card, cx, ease, spring } from "../ui";

type Phase = "intro" | "progress" | "review" | "done" | "error";
const LIST_F = new Set(["ingredients", "allergens", "certifications"]);
const STR_F = new Set(["servingSize", "netQuantity"]);
const MAP_F = new Set(["nutrition", "extraFields"]);
const STATUS: Record<string, string> = { new: "New", changed: "Changed", unchanged: "Unchanged" };

function shrinkImage(f: File): Promise<Blob> {
  return new Promise((res, rej) => {
    const fallback = () => (f.size <= 8 * 1024 * 1024 ? res(f) : rej(new ApiError(400, "bad_image", "We couldn’t open that photo. Try another one, under 8 MB.")));
    let u = "";
    try {
      u = URL.createObjectURL(f);
    } catch {
      return fallback();
    }
    const img = new Image();
    img.onload = () => {
      try {
        const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight, 1));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth * k));
        c.height = Math.max(1, Math.round(img.naturalHeight * k));
        const x = c.getContext("2d")!;
        x.fillStyle = "#fff";
        x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob((b) => (b ? res(b) : fallback()), "image/jpeg", 0.85);
      } catch {
        URL.revokeObjectURL(u);
        fallback();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(u);
      fallback();
    };
    img.src = u;
  });
}

const listText = (v: unknown) => (Array.isArray(v) ? v.map(String).join("\n") : "");
const loose = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function nameMismatch(label: string, ours: string) {
  const a = loose(label),
    b = loose(ours);
  if (!a || !b || a.includes(b) || b.includes(a)) return false;
  const bw = b.split(" ").filter((w) => w.length > 2);
  return !a
    .split(" ")
    .filter((w) => w.length > 2)
    .some((w) => bw.includes(w));
}

export function LabelScreen({ barcode, name, visible }: { barcode: string; name: string; visible: boolean }) {
  const { signedIn, pop, toast } = useApp();
  const [phase, setPhase] = useState<Phase>("intro");
  const [photo, setPhoto] = useState<string | null>(null);
  const [data, setData] = useState<LabelScan | null>(null);
  const [inc, setInc] = useState<Record<string, boolean>>({});
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [err, setErr] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [reward, setReward] = useState(0);
  const [step, setStep] = useState(0);
  const [t0, setT0] = useState(0);
  const ctl = useRef<AbortController | null>(null);
  const cam = useRef<HTMLInputElement>(null);
  const pick = useRef<HTMLInputElement>(null);
  const scroller = () => document.getElementById(`screen-label-${barcode}`)?.closest("section");

  useEffect(() => () => ctl.current?.abort(), []);
  useEffect(() => () => void (photo && URL.revokeObjectURL(photo)), [photo]);

  const go = (p: Phase) => {
    setPhase(p);
    scroller()?.scrollTo({ top: 0 });
  };

  const onFile = async (f?: File | null) => {
    if (!f) return;
    if (f.type && !/^image\//i.test(f.type)) return toast("Choose a photo of the label.");
    ctl.current?.abort();
    const c = new AbortController();
    ctl.current = c;
    setErr(null);
    setStep(0);
    setT0(Date.now());
    setPhoto(null);
    go("progress");
    try {
      const blob = await shrinkImage(f);
      if (c.signal.aborted) return;
      setPhoto(URL.createObjectURL(blob));
      setStep(1);
      const fd = new FormData();
      fd.append("image", blob, "label.jpg");
      const d = await api<LabelScan>(`/api/products/${enc(barcode)}/label-scan`, { method: "POST", form: fd, timeout: 120000, signal: c.signal });
      if (c.signal.aborted) return;
      if (d.ok === false || !d.changes) {
        setErr(new ApiError(200, d.reason || "not_a_label", d.message || ""));
        notify("warning");
        return go("error");
      }
      setData(d);
      setInc(Object.fromEntries(d.changes.filter((x) => x.status !== "not_found").map((x) => [x.field, true])));
      setEdit({});
      setStep(3);
      notify("success");
      setTimeout(() => !c.signal.aborted && go("review"), 450);
    } catch (e) {
      if (c.signal.aborted || (e instanceof ApiError && e.code === "cancelled")) return;
      setErr(e instanceof ApiError ? e : new ApiError(0, "unknown"));
      notify("error");
      go("error");
    }
  };

  const included = (data?.changes || []).filter((x) => x.status !== "not_found" && inc[x.field] !== false).map((x) => x.field);

  const submit = async () => {
    if (busy || !data || !included.length) return;
    const fields: Record<string, unknown> = { include: included };
    for (const f of included) {
      if (edit[f] == null) continue;
      const ch = data.changes.find((x) => x.field === f)!;
      const v = LIST_F.has(f)
        ? edit[f]
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
        : edit[f].trim();
      if (!v.length) return toast(`${ch.label || nkey(f)} is empty — fill it in or turn it off.`);
      if (JSON.stringify(v) !== JSON.stringify(ch.proposed)) fields[f] = v;
    }
    setBusy(true);
    haptic("medium");
    try {
      const d = await api<{ rewardPoints?: number }>(`/api/products/${enc(barcode)}/label-scan/submit`, {
        method: "POST",
        json: { token: data.token, fields },
        timeout: 30000,
      });
      setReward(Number(d?.rewardPoints) || 0);
      notify("success");
      go("done");
    } catch (e) {
      const ae = e instanceof ApiError ? e : new ApiError(0, "unknown");
      if (["pending_exists", "expired", "bad_token"].includes(ae.code)) {
        setErr(ae);
        notify("warning");
        go("error");
      } else {
        notify("error");
        toast(errText(e, "Couldn’t submit your update. Please try again."));
      }
    }
    setBusy(false);
  };

  const photoButtons = (first: boolean) => (
    <div className="flex flex-col gap-2.5">
      <Button block size="lg" icon={<Camera size={18} />} onClick={() => (haptic(), cam.current?.click())}>
        {first ? "Take a photo" : "Take another photo"}
      </Button>
      <Button block size="lg" variant="outline" icon={<ImageIcon size={18} />} onClick={() => (haptic(), pick.current?.click())}>
        Choose from photos
      </Button>
    </div>
  );

  return (
    <>
      <TopBar title="Update from label" />
      <div id={`screen-label-${barcode}`} className="mx-auto max-w-[540px] px-4" style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom, 0px))" }}>
        <input ref={cam} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (onFile(e.target.files?.[0]), (e.target.value = ""))} />
        <input ref={pick} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (onFile(e.target.files?.[0]), (e.target.value = ""))} />
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.26, ease }}>
            {phase === "intro" && (
              <Card className="p-5 text-center">
                <Badge icon={<Camera size={24} />} />
                <h2 className="mb-2 text-[20px] font-extrabold tracking-[-0.02em] text-ct-text">Update from label</h2>
                <p className="mb-5 text-[14.5px] leading-relaxed text-ct-text-2">
                  Photograph the ingredients or nutrition panel on <b className="text-ct-text">{name}</b>. We’ll read it, you check it, and a moderator approves it.
                </p>
                {signedIn ? (
                  <>
                    <div className="mb-5 space-y-2 text-left">
                      {[
                        [<Sun key="s" size={17} />, "Good light, no glare on the text"],
                        [<Crop key="c" size={17} />, "The whole panel inside the photo"],
                        [<Focus key="f" size={17} />, "Hold steady so the text is sharp"],
                      ].map(([icon, text], i) => (
                        <div key={i} className="flex items-center gap-3 rounded-[12px] bg-ct-surface-alt px-3.5 py-2.5 text-[14px] text-ct-text">
                          <span className="text-ct-primary">{icon}</span>
                          {text}
                        </div>
                      ))}
                    </div>
                    {photoButtons(true)}
                    <p className="mt-4 text-[12.5px] leading-relaxed text-ct-text-3">Earn points when your update is approved. The moderator sees your photo to check it.</p>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-[14px] text-ct-text-2">{LINK_COPY}</p>
                    <Button block size="lg" icon={<MessageCircle size={18} />} onClick={() => (haptic(), closeApp())}>
                      Back to the chat
                    </Button>
                  </>
                )}
              </Card>
            )}

            {phase === "progress" && (
              <Card className="p-5">
                <div className="mb-4 grid aspect-[4/3] place-items-center overflow-hidden rounded-[16px] bg-ct-surface-alt text-ct-text-3">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <motion.img initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} src={photo} alt="Your label photo" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={28} />
                  )}
                </div>
                <div className="text-[17px] font-bold text-ct-text">Reading the label</div>
                <Hint t0={t0} />
                <Progress t0={t0} done={step >= 3} />
                <div className="mt-4 space-y-2.5">
                  <Step state={step >= 1 ? "done" : "on"}>Preparing your photo</Step>
                  <Step state={step >= 3 ? "done" : step >= 1 ? "on" : "off"}>Reading ingredients and nutrition</Step>
                  <Step state={step >= 3 ? "done" : "off"}>Comparing with what CheckTag has</Step>
                </div>
                <Button
                  block
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    haptic();
                    ctl.current?.abort();
                    go("intro");
                    toast("Label reading cancelled");
                  }}
                >
                  Cancel
                </Button>
              </Card>
            )}

            {phase === "review" && data && (
              <Review
                data={data}
                photo={photo}
                name={name}
                inc={inc}
                edit={edit}
                onToggle={(f, on) => (haptic(), setInc((m) => ({ ...m, [f]: on })))}
                onEdit={(f, v) => setEdit((m) => ({ ...m, [f]: v }))}
                retake={photoButtons(false)}
              />
            )}

            {phase === "done" && (
              <Card className="p-5 text-center">
                <Badge icon={<Check size={26} strokeWidth={2.6} />} ok />
                <h2 className="mb-2 text-[20px] font-extrabold tracking-[-0.02em] text-ct-text">Under review</h2>
                <p className="mb-5 text-[14.5px] leading-relaxed text-ct-text-2">
                  {reward ? (
                    <>
                      Earn <b className="text-ct-text">{plural(reward, "point", "points")}</b> when it’s approved.{" "}
                    </>
                  ) : (
                    "You’ll earn points when it’s approved. "
                  )}
                  A moderator will check your update against the photo — nothing on the product changes until then.
                </p>
                <Button block size="lg" onClick={pop}>
                  Back to product
                </Button>
              </Card>
            )}

            {phase === "error" && <ErrorCard err={err} retake={photoButtons(false)} onBack={pop} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {visible && phase === "review" && data?.changes.some((x) => x.status !== "not_found") && (
          <ActionBar>
            <Button block size="lg" busy={busy} disabled={!included.length} onClick={submit}>
              Submit for review
            </Button>
            <p className="mt-1.5 text-center text-[12px] text-ct-text-3">
              {included.length ? (included.length === 1 ? "1 field selected" : `${included.length} fields selected`) : "Turn on at least one field"}
            </p>
          </ActionBar>
        )}
      </AnimatePresence>
    </>
  );
}

function Badge({ icon, ok }: { icon: React.ReactNode; ok?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={spring}
      className={cx("mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[18px]", ok ? "ct-grad text-white" : "bg-ct-primary-soft text-ct-primary")}
    >
      {icon}
    </motion.div>
  );
}

function Hint({ t0 }: { t0: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = (now - t0) / 1000;
  return (
    <p className="mb-3 mt-1 text-[13.5px] text-ct-text-2">
      {s > 75 ? "Taking longer than usual — still working on it." : s > 42 ? "Almost there. Thanks for your patience." : "This usually takes 25–40 seconds. Keep this screen open."}
    </p>
  );
}

/** A calm, steadily slowing bar — honest about the wait without fake stages. */
function Progress({ t0, done }: { t0: number; done: boolean }) {
  const [pct, setPct] = useState(2);
  useEffect(() => {
    if (done) return setPct(100);
    const t = setInterval(() => setPct(2 + 93 * (1 - Math.exp(-(Date.now() - t0) / 18000))), 400);
    return () => clearInterval(t);
  }, [t0, done]);
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ct-border" role="progressbar" aria-label="Reading the label" aria-valuenow={Math.round(pct)}>
      <motion.div className="ct-grad h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: "linear" }} />
    </div>
  );
}

function Step({ state, children }: { state: "off" | "on" | "done"; children: React.ReactNode }) {
  return (
    <div className={cx("flex items-center gap-2.5 text-[14px]", state === "off" ? "text-ct-text-3" : "text-ct-text")}>
      <span className={cx("grid h-5 w-5 place-items-center rounded-full", state === "done" ? "bg-ct-good text-ct-on-fill" : "border border-ct-border-strong")}>
        {state === "done" ? <Check size={12} strokeWidth={3} /> : state === "on" ? <Loader2 size={12} className="ct-spin text-ct-primary" /> : null}
      </span>
      {children}
    </div>
  );
}

function ErrorCard({ err, retake, onBack }: { err: ApiError | null; retake: React.ReactNode; onBack(): void }) {
  const c = err?.code || "";
  let title = "Couldn’t read the label";
  let msg = errText(err, "Something went wrong. Please try again.");
  let icon = <AlertCircle size={24} />;
  let retry = true;
  if (c === "not_a_label") {
    title = "That doesn’t look like a label";
    msg = err?.msg || "Photograph the ingredients or nutrition panel, with the text in focus.";
    icon = <ImageIcon size={24} />;
  } else if (c === "ai_failed") {
    title = "We couldn’t read that label";
    msg = err?.msg || "Try a sharper, well-lit photo of the panel.";
  } else if (c === "bad_image" || c === "no_image") {
    title = "That photo didn’t work";
    icon = <ImageIcon size={24} />;
  } else if (c === "pending_exists") {
    title = "An update is already waiting";
    msg = "You already sent an update for this product. You can send another once a moderator has checked it.";
    retry = false;
    icon = <Clock size={24} />;
  } else if (c === "expired" || c === "bad_token") {
    title = "This reading has expired";
    msg = "Readings are kept for 30 minutes. Take the photo again to start over.";
  } else if (c === "not_found") {
    title = "Scan the barcode first";
    msg = err?.msg || "Scan the product’s barcode, then its label.";
    retry = false;
  } else if (c === "timeout") {
    title = "This took too long";
    msg = "The label couldn’t be read in time. Please try again with a clear, well-lit photo.";
  } else if (err?.status === 429) {
    title = "Please wait a little";
    retry = false;
  }
  return (
    <Card className="p-5 text-center">
      <Badge icon={icon} />
      <h2 className="mb-2 text-[20px] font-extrabold tracking-[-0.02em] text-ct-text">{title}</h2>
      <p className="mb-5 text-[14.5px] leading-relaxed text-ct-text-2">{msg}</p>
      {retry ? (
        <>
          {retake}
          <button type="button" onClick={onBack} className="mt-4 text-[14px] font-semibold text-ct-primary">
            Back to product
          </button>
        </>
      ) : (
        <Button block size="lg" onClick={onBack}>
          Back to product
        </Button>
      )}
    </Card>
  );
}

function Review({
  data,
  photo,
  name,
  inc,
  edit,
  onToggle,
  onEdit,
  retake,
}: {
  data: LabelScan;
  photo: string | null;
  name: string;
  inc: Record<string, boolean>;
  edit: Record<string, string>;
  onToggle(f: string, on: boolean): void;
  onEdit(f: string, v: string): void;
  retake: React.ReactNode;
}) {
  const shown = data.changes.filter((c) => c.status !== "not_found");
  const missing = data.changes.filter((c) => c.status === "not_found");
  const pname = data.product?.name || name;
  const ex = data.extraction || {};
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex gap-3">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-16 w-16 shrink-0 rounded-[12px] object-cover" />
          )}
          <div>
            <div className="text-[17px] font-bold text-ct-text">Check what we read</div>
            <p className="mt-0.5 text-[13.5px] leading-snug text-ct-text-2">
              From your photo of <b className="text-ct-text">{pname}</b>. Turn off anything that’s wrong, or correct it below.
            </p>
          </div>
        </div>
        {ex.productName && nameMismatch(ex.productName, pname) && (
          <Callout>
            This label names “{ex.productName}”. Make sure the photo is of {pname} before you submit.
          </Callout>
        )}
        {ex.confidence === "low" && <Callout>Parts of this photo were hard to read. Check each field carefully.</Callout>}
      </Card>
      {!shown.length ? (
        <Card className="p-5 text-center">
          <Badge icon={<Search size={24} />} />
          <h2 className="mb-2 text-[19px] font-extrabold text-ct-text">Nothing to update</h2>
          <p className="mb-5 text-[14.5px] text-ct-text-2">We couldn’t find ingredients, nutrition or other label details on this photo.</p>
          {retake}
        </Card>
      ) : (
        <>
          {shown.map((c) => (
            <ChangeCard key={c.field} c={c} on={inc[c.field] !== false} value={edit[c.field]} onToggle={(v) => onToggle(c.field, v)} onEdit={(v) => onEdit(c.field, v)} />
          ))}
          {missing.length > 0 && (
            <p className="px-1 text-[12.5px] text-ct-text-3">Not found on this photo: {missing.map((c) => c.label || nkey(c.field)).join(", ")}.</p>
          )}
          <p className="px-1 text-[12.5px] text-ct-text-3">Nothing changes on the product until a moderator checks your update against the photo.</p>
        </>
      )}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex gap-2.5 rounded-[12px] bg-ct-warn-soft p-3 text-[13.5px] leading-snug text-ct-text">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-ct-warn" />
      <p>{children}</p>
    </div>
  );
}

function ChangeCard({ c, on, value, onToggle, onEdit }: { c: LabelChange; on: boolean; value?: string; onToggle(v: boolean): void; onEdit(v: string): void }) {
  const f = c.field;
  const initial = LIST_F.has(f) ? listText(c.proposed) : String(c.proposed ?? "");
  const v = value ?? initial;
  const label = c.label || nkey(f);
  return (
    <motion.div layout className={cx("ct-card p-4 transition-opacity", !on && "opacity-55")}>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-[15px] font-semibold text-ct-text">{label}</span>
        {STATUS[c.status] && (
          <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-bold", c.status === "unchanged" ? "bg-ct-surface-alt text-ct-text-3" : "bg-ct-primary-soft text-ct-primary")}>
            {STATUS[c.status]}
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={`Include ${label}`}
          onClick={() => onToggle(!on)}
          className={cx("relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors", on ? "bg-ct-primary" : "bg-ct-border-strong")}
        >
          <motion.span layout transition={spring} className={cx("absolute top-[3px] h-5 w-5 rounded-full bg-white shadow", on ? "right-[3px]" : "left-[3px]")} />
        </button>
      </div>
      {c.wasVerified && (
        <div className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-ct-good">
          <Check size={12} strokeWidth={3} />
          Currently verified from an earlier label photo
        </div>
      )}
      <div className="mt-3">
        {LIST_F.has(f) && (
          <>
            {c.status === "changed" && Array.isArray(c.current) && c.current.length > 0 && (
              <Now>{(c.current as string[]).join(", ")}</Now>
            )}
            <FieldLabel htmlFor={`lb-${f}`}>From your photo · one per line</FieldLabel>
            <textarea
              id={`lb-${f}`}
              rows={Math.max(2, Math.min(12, (Array.isArray(c.proposed) ? c.proposed.length : 1) + 1))}
              spellCheck={false}
              value={v}
              onChange={(e) => onEdit(e.target.value)}
              className="w-full resize-none rounded-[12px] border border-ct-border bg-ct-surface-alt p-3 text-[14px] leading-relaxed text-ct-text outline-none focus:border-ct-accent"
            />
          </>
        )}
        {STR_F.has(f) && (
          <>
            {c.status === "changed" && c.current != null && <Now>{String(c.current)}</Now>}
            <FieldLabel htmlFor={`lb-${f}`}>From your photo</FieldLabel>
            <input
              id={`lb-${f}`}
              autoComplete="off"
              maxLength={120}
              value={v}
              onChange={(e) => onEdit(e.target.value)}
              className="h-11 w-full rounded-[12px] border border-ct-border bg-ct-surface-alt px-3 text-[15px] text-ct-text outline-none focus:border-ct-accent"
            />
          </>
        )}
        {MAP_F.has(f) && <MapTable c={c} />}
      </div>
    </motion.div>
  );
}

function Now({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <FieldLabel>Now on CheckTag</FieldLabel>
      <div className="rounded-[12px] bg-ct-surface-alt px-3 py-2 text-[13.5px] text-ct-text-2">{children}</div>
    </div>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ct-text-3">
      {children}
    </label>
  );
}

function MapTable({ c }: { c: LabelChange }) {
  const p = (c.proposed && typeof c.proposed === "object" ? c.proposed : {}) as Record<string, unknown>;
  const cu = (c.current && typeof c.current === "object" ? c.current : {}) as Record<string, unknown>;
  const both = c.status !== "new";
  const nk = c.newFieldKeys || [];
  return (
    <div className="overflow-hidden rounded-[12px] border border-ct-border text-[13.5px]">
      <div className="flex gap-2 bg-ct-surface-alt px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ct-text-3">
        <span className="flex-1">{c.field === "nutrition" ? "Nutrient" : "Detail"}</span>
        {both && <span className="w-[72px] text-right">Now</span>}
        <span className="w-[72px] text-right">Photo</span>
      </div>
      {Object.keys(p).map((k) => {
        const cv = cu[k];
        return (
          <div key={k} className="flex gap-2 border-t border-ct-border px-3 py-2">
            <span className="flex-1 text-ct-text-2">
              {c.field === "nutrition" ? nkey(k) : k}
              {both && nk.includes(k) && <span className="ml-1.5 rounded-full bg-ct-primary-soft px-1.5 text-[10px] font-bold text-ct-primary">new</span>}
            </span>
            {both && <span className="w-[72px] text-right text-ct-text-3">{cv != null && String(cv) !== "" ? String(cv) : "—"}</span>}
            <span className="w-[72px] text-right font-semibold text-ct-text">{String(p[k])}</span>
          </div>
        );
      })}
    </div>
  );
}
