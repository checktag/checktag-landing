"use client";

// Bottom-sheet bodies for the community features: guidelines, linking an
// account, writing / editing / deleting a review, report and block.

import { motion } from "framer-motion";
import { Ban, Check, Flag, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, enc, errText } from "../../_lib/api";
import { useApp } from "../../_lib/app";
import { fmtN, initialOf } from "../../_lib/format";
import { closeApp, getTG, haptic, LINK_COPY, notify, SUPPORT } from "../../_lib/telegram";
import type { BlockedUser, Guidelines, Product, Review } from "../../_lib/types";
import { Button, Skel, cx, spring } from "../ui";

export const REVIEW_MAX = 1000;
const WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[14.5px] leading-relaxed text-ct-text-2">{children}</p>;
}
function FieldError({ text }: { text: string }) {
  return text ? (
    <p role="alert" className="mb-3 rounded-[12px] bg-ct-danger-soft px-3 py-2 text-[13px] font-medium text-ct-danger">
      {text}
    </p>
  ) : null;
}
function Buttons({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex flex-col gap-2.5">{children}</div>;
}

/** Copies the support address (mailto links don't open inside Telegram). */
export function SupportLink() {
  const { toast } = useApp();
  return (
    <button
      type="button"
      className="font-semibold text-ct-primary underline-offset-2 hover:underline"
      onClick={() => {
        navigator.clipboard?.writeText(SUPPORT).then(
          () => toast(`${SUPPORT} copied`),
          () => toast(`Email us at ${SUPPORT}`),
        );
      }}
    >
      {SUPPORT}
    </button>
  );
}

// ------------------------------------------------------------------ account

/** Runs `fn` when the viewer has a linked account; otherwise explains how to link. */
export function useRequireAccount() {
  const { signedIn, loadMe, openSheet } = useApp();
  return useCallback(
    async (what: string, fn: () => void) => {
      if (signedIn) return fn();
      const me = await loadMe();
      if (me?.signedIn) return fn();
      openSheet({ title: "Link your account", body: <LinkBody what={what} /> });
    },
    [signedIn, loadMe, openSheet],
  );
}

function LinkBody({ what }: { what: string }) {
  const { closeSheet } = useApp();
  return (
    <>
      <Lead>
        To {what}, link your CheckTag account first. {LINK_COPY}
      </Lead>
      <Buttons>
        <Button block icon={<MessageCircle size={17} />} onClick={() => (haptic(), closeApp())}>
          Back to the chat
        </Button>
        <Button block variant="outline" onClick={closeSheet}>
          Not now
        </Button>
      </Buttons>
    </>
  );
}

// ------------------------------------------------------------------ guidelines

export function useGuidelines() {
  const { guidelines, glAccepted, openSheet } = useApp();
  const show = useCallback(
    async (mode: "read" | "accept" | "back", then?: () => void) => {
      const g = await guidelines();
      openSheet({ title: g.title || "Community guidelines", body: <GuidelinesBody g={g} mode={mode} then={then} /> });
    },
    [guidelines, openSheet],
  );
  const ensure = useCallback(
    async (then: () => void) => {
      const g = await guidelines();
      if (glAccepted(g.version)) then();
      else show("accept", then);
    },
    [guidelines, glAccepted, show],
  );
  return { show, ensure };
}

function GuidelinesBody({ g, mode, then }: { g: Guidelines; mode: "read" | "accept" | "back"; then?: () => void }) {
  const { closeSheet, glRemember } = useApp();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const accept = async () => {
    haptic();
    setBusy(true);
    setErr("");
    try {
      const d = await api<{ version?: string }>("/api/community/guidelines/accept", { method: "POST", json: {} });
      glRemember(d.version || g.version);
      notify("success");
      if (then) then();
      else closeSheet();
    } catch (e) {
      setBusy(false);
      setErr(errText(e, "Couldn’t save that. Please try again."));
    }
  };
  return (
    <>
      <Lead>{mode === "accept" ? "Before you post, please read and agree to how reviews work on CheckTag." : "How we keep reviews honest, useful and safe."}</Lead>
      <ul className="mb-4 space-y-2.5">
        {g.points.map((p) => (
          <li key={p} className="flex gap-2.5 text-[14px] leading-relaxed text-ct-text">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ct-primary-soft text-ct-primary">
              <Check size={12} strokeWidth={3} />
            </span>
            {p}
          </li>
        ))}
      </ul>
      {g.zeroTolerance && <p className="mb-3 rounded-[12px] bg-ct-surface-alt p-3 text-[13.5px] font-semibold text-ct-text">{g.zeroTolerance}</p>}
      <p className="mb-4 text-[13px] text-ct-text-2">
        To report a concern or ask about moderation, contact <SupportLink />.
      </p>
      <FieldError text={err} />
      <Buttons>
        {mode === "accept" ? (
          <>
            <Button block busy={busy} onClick={accept}>
              I agree
            </Button>
            <Button block variant="outline" onClick={closeSheet}>
              Not now
            </Button>
          </>
        ) : mode === "back" && then ? (
          <Button block onClick={then}>
            Back to my review
          </Button>
        ) : (
          <Button block onClick={closeSheet}>
            Close
          </Button>
        )}
      </Buttons>
    </>
  );
}

// ------------------------------------------------------------------ username

const NAME_ASKED = "ct_name_asked";
const asked = () => {
  try {
    return localStorage.getItem(NAME_ASKED) === "1";
  } catch {
    return false;
  }
};
const markAsked = () => {
  try {
    localStorage.setItem(NAME_ASKED, "1");
  } catch {}
};

/**
 * Before a first review: if they're still on the automatic name ("user-k3x9"),
 * offer to pick one — prefilled from their email or Telegram @username — or
 * keep it. Asked once; any failure just skips the question.
 */
export function useNameStep() {
  const { openSheet } = useApp();
  return useCallback(
    async (then: () => void) => {
      if (asked()) return then();
      let info: { name: string | null; isDefault: boolean; suggestion: string | null };
      try {
        info = await api("/api/me/username");
      } catch {
        return then();
      }
      if (!info.isDefault) {
        markAsked();
        return then();
      }
      const tgName = (getTG()?.initDataUnsafe?.user?.username || "").toLowerCase().replace(/[^a-z0-9._-]/g, "");
      const suggestion = info.suggestion || (tgName.length >= 3 ? tgName : "");
      openSheet({
        title: "How should we show your name?",
        body: (
          <NameBody
            current={info.name || "your current name"}
            suggestion={suggestion}
            onDone={() => {
              markAsked();
              then();
            }}
          />
        ),
      });
    },
    [openSheet],
  );
}

function NameBody({ current, suggestion, onDone }: { current: string; suggestion: string; onDone(): void }) {
  const { toast } = useApp();
  const [name, setName] = useState(suggestion);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const save = async () => {
    const v = name.trim().toLowerCase();
    if (v.length < 2) return setErr("Use at least 2 characters.");
    haptic();
    setBusy(true);
    setErr("");
    try {
      await api("/api/me/username", { method: "PUT", json: { name: v } });
      notify("success");
      toast(`You'll appear as ${v}`);
      onDone();
    } catch (e) {
      setBusy(false);
      setErr(errText(e, "Couldn’t save that name. Try another."));
    }
  };
  return (
    <>
      <Lead>
        Reviews show a username. Right now you appear as <b className="text-ct-text">{current}</b>. Pick a name you like, or keep that one to stay anonymous.
      </Lead>
      <FieldError text={err} />
      <label htmlFor="rv-name" className="mb-1.5 block text-[13px] font-semibold text-ct-text-2">
        Username
      </label>
      <input
        id="rv-name"
        value={name}
        maxLength={30}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => (setName(e.target.value.replace(/[^a-zA-Z0-9._-]/g, "")), setErr(""))}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="e.g. ada.obi"
        className="mb-1.5 h-11 w-full rounded-[14px] border border-ct-border bg-ct-surface-alt px-3.5 text-[16px] text-ct-text outline-none placeholder:text-ct-text-3 focus:border-ct-accent"
      />
      <p className="mb-4 text-[12.5px] text-ct-text-3">Lowercase letters, numbers, and . _ -</p>
      <Buttons>
        <Button block busy={busy} onClick={save}>
          Use this name
        </Button>
        <Button block variant="outline" disabled={busy} onClick={() => (haptic(), onDone())}>
          Keep {current}
        </Button>
      </Buttons>
    </>
  );
}

// ------------------------------------------------------------------ composer

export interface ComposerProps {
  barcode: string;
  product: Product;
  mine: Review | null;
  held: boolean;
  onSaved: (message?: string) => void;
  onDeleted: () => void;
  /** Text and stars carried over when the sheet is reopened. */
  draft?: { rating: number; body: string };
  /** Post immediately (after accepting the guidelines mid-post). */
  autoSubmit?: boolean;
}

export function ComposerBody(props: ComposerProps) {
  const { barcode, product, mine, held, onSaved, draft, autoSubmit } = props;
  const { openSheet, glRemember } = useApp();
  const guidelines = useGuidelines();
  const [rating, setRating] = useState(draft?.rating ?? (Number(mine?.rating) || 0));
  const [body, setBody] = useState(draft?.body ?? (mine?.body ? String(mine.body) : ""));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const reopen = (r = rating, b = body, auto = false) =>
    openSheet({
      title: mine ? "Edit your review" : "Write a review",
      body: <ComposerBody {...props} draft={{ rating: r, body: b }} autoSubmit={auto} key={Date.now()} />,
    });

  const submit = useCallback(async () => {
    const text = body.trim();
    if (!rating) return setErr("Tap the stars to choose a rating.");
    if (text.length > REVIEW_MAX) return setErr(`Reviews can be up to ${fmtN(REVIEW_MAX)} characters. Please shorten yours.`);
    setErr("");
    setBusy(true);
    haptic("medium");
    try {
      const d = await api<{ message?: string }>(`/api/products/${enc(barcode)}/reviews/mine`, { method: "PUT", json: { rating, body: text } });
      notify("success");
      onSaved(d?.message);
    } catch (e) {
      setBusy(false);
      const code = e instanceof ApiError ? e.code : "";
      if (code === "terms_required") {
        glRemember(null);
        guidelines.show("accept", () => reopen(rating, body, true));
        return;
      }
      notify("error");
      setErr(
        code === "scan_required"
          ? "Only people who’ve scanned this product can review it. Scan its barcode with CheckTag, then come back."
          : code === "banned"
            ? `${(e as ApiError).msg || "Your ability to post reviews has been removed."} If you think this is a mistake, contact ${SUPPORT}.`
            : code === "too_long"
              ? `Reviews can be up to ${fmtN(REVIEW_MAX)} characters. Please shorten yours.`
              : errText(e, "Couldn’t save your review. Please try again."),
      );
    }
  }, [barcode, body, rating, onSaved, glRemember, guidelines]);

  // After accepting the guidelines mid-post, send it straight away.
  useEffect(() => {
    if (autoSubmit && rating) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <p className="mb-3 text-[13.5px] text-ct-text-3">{[product.name, product.brand].filter(Boolean).join(" · ")}</p>
      <div role="radiogroup" aria-label="Your rating" className="flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === rating}
            aria-label={`${n} star${n === 1 ? "" : "s"} — ${WORDS[n]}`}
            whileTap={{ scale: 0.82 }}
            animate={{ scale: n <= rating ? 1.08 : 1 }}
            transition={spring}
            onClick={() => {
              haptic();
              setRating(n);
              setErr("");
            }}
            className={cx("text-[38px] leading-none", n <= rating ? "text-ct-gold" : "text-ct-border-strong")}
          >
            ★
          </motion.button>
        ))}
      </div>
      <p className="mb-4 mt-1.5 text-center text-[13.5px] font-semibold text-ct-text-2">{rating ? WORDS[rating] : "Tap a star to rate"}</p>
      <label htmlFor="rv-body" className="mb-1.5 block text-[13px] font-semibold text-ct-text">
        Your review <span className="font-normal text-ct-text-3">(optional)</span>
      </label>
      <textarea
        id="rv-body"
        rows={5}
        maxLength={REVIEW_MAX}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you like or not like? Keep it about the product."
        className="w-full resize-none rounded-[14px] border border-ct-border bg-ct-surface-alt p-3.5 text-[15px] text-ct-text outline-none placeholder:text-ct-text-3 focus:border-ct-accent"
      />
      <p className={cx("mb-3 mt-1 text-right text-[12px]", body.length > REVIEW_MAX * 0.9 ? "text-ct-danger" : "text-ct-text-3")}>
        {fmtN(body.length)} / {fmtN(REVIEW_MAX)}
      </p>
      {held && (
        <p className="mb-3 text-[13px] text-ct-text-2">
          Your review was hidden after reports. If you edit it, it goes back to a moderator before it’s public again.
        </p>
      )}
      <FieldError text={err} />
      <Buttons>
        <Button block busy={busy} onClick={submit}>
          {mine ? "Save changes" : "Post review"}
        </Button>
        {mine && (
          <Button
            block
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={() => openSheet({ title: "Delete your review?", body: <DeleteBody {...props} /> })}
          >
            Delete review
          </Button>
        )}
      </Buttons>
      <p className="mt-4 text-center text-[12.5px] leading-relaxed text-ct-text-3">
        Reviews are public and show your CheckTag username. Please follow the{" "}
        <button type="button" className="font-semibold text-ct-primary" onClick={() => guidelines.show("back", () => reopen())}>
          community guidelines
        </button>
        .
      </p>
    </>
  );
}

export function DeleteBody({ barcode, onDeleted }: ComposerProps) {
  const { closeSheet } = useApp();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <Lead>It will be removed from this product for everyone. You can write a new one later.</Lead>
      <FieldError text={err} />
      <Buttons>
        <Button
          block
          variant="danger"
          busy={busy}
          icon={<Trash2 size={16} />}
          onClick={async () => {
            haptic();
            setBusy(true);
            try {
              await api(`/api/products/${enc(barcode)}/reviews/mine`, { method: "DELETE" });
              onDeleted();
            } catch (e) {
              setBusy(false);
              setErr(errText(e, "Couldn’t delete your review. Please try again."));
            }
          }}
        >
          Delete review
        </Button>
        <Button block variant="outline" onClick={closeSheet}>
          Keep it
        </Button>
      </Buttons>
    </>
  );
}

// ------------------------------------------------------------------ menu, report, block

export function ReviewMenuBody({ review, onEdit, onDelete, onReport, onBlock }: { review: Review; onEdit(): void; onDelete(): void; onReport(): void; onBlock(): void }) {
  const name = review.author || "this author";
  const opts = review.mine
    ? [
        { k: "edit", icon: <Pencil size={18} />, label: "Edit your review", fn: onEdit },
        { k: "delete", icon: <Trash2 size={18} />, label: "Delete your review", fn: onDelete, danger: true },
      ]
    : [
        { k: "report", icon: <Flag size={18} />, label: "Report review", fn: onReport },
        { k: "block", icon: <Ban size={18} />, label: `Block ${name}`, fn: onBlock, danger: true },
      ];
  return (
    <>
      <div className="overflow-hidden rounded-[16px] border border-ct-border">
        {opts.map((o, i) => (
          <button
            key={o.k}
            type="button"
            onClick={() => (haptic(), o.fn())}
            className={cx(
              "flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-semibold active:bg-ct-surface-alt",
              i > 0 && "border-t border-ct-border",
              o.danger ? "text-ct-danger" : "text-ct-text",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
      {!review.mine && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-ct-text-3">
          The author isn’t told who reported or blocked them. Blocking hides all of their reviews from you.
        </p>
      )}
    </>
  );
}

const REASONS = [
  ["spam", "Spam", "Ads, links or repeated text"],
  ["offensive", "Offensive", "Hate speech, slurs or sexual content"],
  ["harassment", "Harassment", "Threatens or targets a person"],
  ["misleading", "Misleading", "False, or not about this product"],
  ["other", "Something else", "Tell us more below"],
] as const;

export function ReportBody({ review, onDone }: { review: Review; onDone(already: boolean): void }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <Lead>
        Why are you reporting <b className="text-ct-text">{review.author || "this person"}</b>’s review? Our moderators check every report.
      </Lead>
      <div role="radiogroup" aria-label="Reason" className="mb-4 space-y-2">
        {REASONS.map(([v, t, d]) => {
          const on = reason === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => (haptic(), setReason(v), setErr(""))}
              className={cx(
                "flex w-full items-center gap-3 rounded-[14px] border px-3.5 py-3 text-left transition-colors",
                on ? "border-ct-primary bg-ct-primary-soft" : "border-ct-border bg-ct-surface",
              )}
            >
              <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2", on ? "border-ct-primary" : "border-ct-border-strong")}>
                {on && <motion.span layoutId="report-dot" className="h-2.5 w-2.5 rounded-full bg-ct-primary" />}
              </span>
              <span>
                <span className="block text-[14.5px] font-semibold text-ct-text">{t}</span>
                <span className="block text-[12.5px] text-ct-text-3">{d}</span>
              </span>
            </button>
          );
        })}
      </div>
      <label htmlFor="rp-note" className="mb-1.5 block text-[13px] font-semibold text-ct-text">
        Anything else? <span className="font-normal text-ct-text-3">(optional)</span>
      </label>
      <textarea
        id="rp-note"
        rows={3}
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add details for our moderators"
        className="mb-3 w-full resize-none rounded-[14px] border border-ct-border bg-ct-surface-alt p-3.5 text-[15px] text-ct-text outline-none placeholder:text-ct-text-3 focus:border-ct-accent"
      />
      <FieldError text={err} />
      <Buttons>
        <Button
          block
          disabled={!reason}
          busy={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const d = await api<{ alreadyReported?: boolean }>(`/api/reviews/${enc(review.id)}/report`, {
                method: "POST",
                json: { reason, note: note.trim() || undefined },
              });
              notify("success");
              onDone(!!d?.alreadyReported);
            } catch (e) {
              setBusy(false);
              setErr(errText(e, "Couldn’t send your report. Please try again."));
            }
          }}
        >
          Send report
        </Button>
      </Buttons>
    </>
  );
}

export function ReportDoneBody({ review, already, onBlock }: { review: Review; already: boolean; onBlock(): void }) {
  const { closeSheet } = useApp();
  return (
    <>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
        className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-ct-primary-soft text-ct-primary"
      >
        <Check size={26} strokeWidth={2.6} />
      </motion.div>
      <p className="mb-4 text-center text-[14.5px] leading-relaxed text-ct-text-2">
        {already
          ? "You’ve already reported this review. Our moderators will look at it."
          : "Our moderators will look at it. Reviews that break the community guidelines are removed."}
      </p>
      <Buttons>
        <Button block onClick={closeSheet}>
          Done
        </Button>
        <Button block variant="danger" icon={<Ban size={16} />} onClick={onBlock}>
          Also block {review.author || "this person"}
        </Button>
      </Buttons>
    </>
  );
}

export function BlockBody({ review, onBlocked }: { review: Review; onBlocked(): void }) {
  const { closeSheet } = useApp();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const name = review.author || "this person";
  return (
    <>
      <Lead>
        You won’t see reviews from <b className="text-ct-text">{name}</b> anywhere on CheckTag. They won’t be told. You can unblock them in Settings.
      </Lead>
      <FieldError text={err} />
      <Buttons>
        <Button
          block
          variant="danger"
          busy={busy}
          icon={<Ban size={16} />}
          onClick={async () => {
            haptic();
            setBusy(true);
            try {
              await api(`/api/users/${enc(review.authorId)}/block`, { method: "POST", json: {} });
              notify("success");
              onBlocked();
            } catch (e) {
              setBusy(false);
              setErr(errText(e, "Couldn’t block right now. Please try again."));
            }
          }}
        >
          Block
        </Button>
        <Button block variant="outline" onClick={closeSheet}>
          Cancel
        </Button>
      </Buttons>
    </>
  );
}

export function BlockedListBody() {
  const { unblock, toast } = useApp();
  const [items, setItems] = useState<BlockedUser[] | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    api<{ items: BlockedUser[] }>("/api/me/blocked").then(
      (d) => setItems(d.items || []),
      (e) => setErr(errText(e, "Couldn’t load your blocked list right now.")),
    );
  }, []);
  if (err) return <Lead>{err}</Lead>;
  if (!items)
    return (
      <div className="space-y-3 pb-2">
        <Skel className="h-12 rounded-[14px]" />
        <Skel className="h-12 rounded-[14px]" />
      </div>
    );
  if (!items.length) return <Lead>You haven’t blocked anyone. To block someone, tap ⋯ on one of their reviews.</Lead>;
  return (
    <div className="space-y-2">
      {items.map((x) => (
        <div key={x.userId} className="flex items-center gap-3 rounded-[14px] border border-ct-border px-3 py-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ct-primary-soft text-[14px] font-bold text-ct-primary">{initialOf(x.name)}</span>
          <span className="flex-1 truncate text-[14.5px] font-semibold text-ct-text">{x.name || "CheckTag user"}</span>
          <Button
            size="sm"
            variant="tonal"
            busy={busy === x.userId}
            onClick={async () => {
              haptic();
              setBusy(x.userId);
              try {
                await api(`/api/users/${enc(x.userId)}/block`, { method: "DELETE" });
                unblock(x.userId);
                setItems((l) => (l || []).filter((y) => y.userId !== x.userId));
                toast("Unblocked");
              } catch (e) {
                toast(errText(e, "Couldn’t unblock right now."));
              }
              setBusy(null);
            }}
          >
            Unblock
          </Button>
        </div>
      ))}
    </div>
  );
}
