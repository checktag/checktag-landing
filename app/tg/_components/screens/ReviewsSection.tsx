"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, BadgeCheck, EyeOff, MessageSquareText, MoreHorizontal, Pencil, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, enc, errText } from "../../_lib/api";
import { useApp } from "../../_lib/app";
import { ago, fmtN, initialOf, plural, safeUrl } from "../../_lib/format";
import { haptic } from "../../_lib/telegram";
import type { Product, Review, ReviewPage, ReviewSummary } from "../../_lib/types";
import {
  BlockBody,
  ComposerBody,
  DeleteBody,
  ReportBody,
  ReportDoneBody,
  ReviewMenuBody,
  SupportLink,
  useGuidelines,
  useNameStep,
  useRequireAccount,
  type ComposerProps,
} from "../sheets/ReviewSheets";
import { Bar, Button, Card, Empty, Segmented, SectionTitle, Skel, Stars, cx, itemVariants, listVariants } from "../ui";

type Sort = "recent" | "helpful" | "highest" | "lowest";
const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Newest" },
  { value: "helpful", label: "Helpful" },
  { value: "highest", label: "Highest" },
  { value: "lowest", label: "Lowest" },
];
const PENDING: Record<string, string> = { pending: "Awaiting moderation", hidden: "Hidden after reports", removed: "Removed" };

export function ReviewsSection({ barcode, product, onLoaded }: { barcode: string; product: Product; onLoaded?: () => void }) {
  const { openSheet, closeSheet, toast, blocked, block, accountEpoch } = useApp();
  const requireAccount = useRequireAccount();
  const guidelines = useGuidelines();
  const nameStep = useNameStep();
  const [sort, setSort] = useState<Sort>("recent");
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [items, setItems] = useState<Review[]>([]);
  const [mine, setMine] = useState<Review | null>(null);
  const [next, setNext] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const req = useRef(0);
  const loaded = useRef(onLoaded);
  loaded.current = onLoaded;

  const visible = useCallback((r: Review | null | undefined) => !!r && !gone.has(r.id) && !blocked.has(r.authorId), [gone, blocked]);

  const load = useCallback(
    async (append = false) => {
      const my = ++req.current;
      if (append) setMore(true);
      else {
        setLoading(true);
        setErr(null);
      }
      try {
        const off = append ? next || 0 : 0;
        // A short first page keeps the product screen light; "Show more" loads the rest.
        const d = await api<ReviewPage>(`/api/products/${enc(barcode)}/reviews?sort=${sort}&limit=${append ? 10 : 3}&offset=${off}`);
        if (my !== req.current) return;
        setSummary(d.summary || { count: 0, average: null, distribution: {} });
        setItems((prev) => {
          if (!append) return d.items || [];
          const have = new Set(prev.map((x) => x.id));
          return prev.concat((d.items || []).filter((x) => !have.has(x.id)));
        });
        setNext(d.nextOffset ?? null);
        const own = d.mine !== undefined ? d.mine : (d.items || []).find((x) => x.mine) || null;
        if (!append) setMine(own || null);
        if (!append) loaded.current?.();
      } catch (e) {
        if (my !== req.current) return;
        if (append) toast(errText(e, "Couldn’t load more reviews."));
        else setErr(e);
      } finally {
        if (my === req.current) {
          setLoading(false);
          setMore(false);
        }
      }
    },
    [barcode, sort, next, toast],
  );

  // First load, re-sorting, and when the account changes.
  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode, sort, accountEpoch]);

  const live = mine && mine.pending !== "removed" ? mine : null;

  const composerProps = (): ComposerProps => ({
    barcode,
    product,
    mine: live,
    held: mine?.pending === "hidden",
    onSaved: (message) => {
      closeSheet();
      toast(message || "Your review was saved.");
      setSort("recent");
      load(false);
    },
    onDeleted: () => {
      if (mine) setGone((g) => new Set(g).add(mine.id));
      setMine(null);
      closeSheet();
      toast("Your review was deleted");
      load(false);
    },
  });
  const openComposer = () =>
    openSheet({ title: live ? "Edit your review" : "Write a review", body: <ComposerBody {...composerProps()} key={Date.now()} /> });
  const write = () =>
    requireAccount("write a review", () => {
      if (live) openComposer();
      else guidelines.ensure(() => nameStep(openComposer));
    });

  const blockFlow = (r: Review) =>
    requireAccount("block someone", () =>
      openSheet({
        title: `Block ${r.author || "this person"}?`,
        body: (
          <BlockBody
            review={r}
            onBlocked={() => {
              block(r.authorId);
              closeSheet();
              toast(`${r.author || "They"} ${r.author ? "is" : "are"} blocked`);
            }}
          />
        ),
      }),
    );
  const reportFlow = (r: Review) =>
    requireAccount("report a review", () =>
      openSheet({
        title: "Report review",
        body: (
          <ReportBody
            review={r}
            onDone={(already) =>
              openSheet({
                title: already ? "Already reported" : "Thanks for reporting",
                body: <ReportDoneBody review={r} already={already} onBlock={() => blockFlow(r)} />,
              })
            }
          />
        ),
      }),
    );
  const menu = (r: Review) =>
    openSheet({
      title: r.mine ? "Your review" : `Review by ${r.author || "this author"}`,
      body: (
        <ReviewMenuBody
          review={r}
          onEdit={openComposer}
          onDelete={() => openSheet({ title: "Delete your review?", body: <DeleteBody {...composerProps()} /> })}
          onReport={() => reportFlow(r)}
          onBlock={() => blockFlow(r)}
        />
      ),
    });

  const toggleHelpful = (r: Review) =>
    requireAccount("mark reviews as helpful", async () => {
      haptic();
      const was = !!r.votedHelpful;
      const cnt = Number(r.helpfulCount) || 0;
      const patch = (v: boolean, n: number) => setItems((l) => l.map((x) => (x.id === r.id ? { ...x, votedHelpful: v, helpfulCount: n } : x)));
      patch(!was, Math.max(0, cnt + (was ? -1 : 1)));
      try {
        const d = await api<{ voted: boolean; helpfulCount: number }>(`/api/reviews/${enc(r.id)}/helpful`, { method: "POST", json: {} });
        patch(!!d.voted, Number(d.helpfulCount) || 0);
      } catch (e) {
        patch(was, cnt);
        toast(errText(e, "Couldn’t save that. Please try again."));
      }
    });

  const count = Number(summary?.count) || 0;
  const shown = items.filter(visible);

  return (
    <Card className="p-4">
      <SectionTitle
        title="Reviews"
        sub={count ? `★ ${(Number(summary?.average) || 0).toFixed(1)} · ${plural(count, "review", "reviews")} from people who scanned it` : "From people who scanned it"}
        right={
          <Button size="sm" variant={live ? "outline" : "primary"} icon={<Pencil size={14} />} onClick={() => (haptic(), write())}>
            {live ? "Edit review" : "Write a review"}
          </Button>
        }
      />

      {err && !summary ? (
        <Empty
          icon={<AlertCircle size={20} />}
          text={errText(err, "Couldn’t load reviews right now.")}
          action={
            <Button size="sm" variant="outline" onClick={() => load(false)}>
              Try again
            </Button>
          }
        />
      ) : !summary ? (
        <div className="space-y-3">
          <Skel className="h-[92px] rounded-[14px]" />
          <Skel className="h-14 rounded-[14px]" />
        </div>
      ) : (
        <>
          {count > 3 && (
            <div className="mb-3">
              <Segmented layoutId={`rv-sort-${barcode}`} label="Sort reviews" full value={sort} onChange={(v) => (haptic(), setSort(v))} options={SORTS} />
            </div>
          )}
          {loading ? (
            <div className="space-y-3">
              <Skel className="h-16 rounded-[14px]" />
              <Skel className="h-16 rounded-[14px]" />
            </div>
          ) : shown.length === 0 ? (
            <Empty
              icon={<MessageSquareText size={20} />}
              title={count ? undefined : "No reviews yet"}
              text={count ? "No other reviews to show." : "Scanned it? Tell others what you thought."}
            />
          ) : (
            <motion.ul variants={listVariants} initial="hidden" animate="show" className="divide-y divide-ct-border">
              <AnimatePresence initial={false}>
                {shown.map((r) => (
                  <motion.li key={r.id} variants={itemVariants} exit={{ opacity: 0, height: 0 }} layout className="py-3.5">
                    <ReviewItem r={r} onMenu={() => (haptic(), menu(r))} onHelpful={() => toggleHelpful(r)} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
          {next != null && !loading && shown.length > 0 && (
            <Button block size="sm" variant="outline" busy={more} className="mt-2" onClick={() => load(true)}>
              Show more reviews
            </Button>
          )}
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-ct-border pt-3 text-[12.5px] text-ct-text-3">
        <button type="button" className="font-semibold text-ct-primary" onClick={() => (haptic(), guidelines.show("read"))}>
          Community guidelines
        </button>
        <span aria-hidden>·</span>
        <span>
          Concerns? <SupportLink />
        </span>
      </div>
    </Card>
  );
}

function ReviewItem({ r, onMenu, onHelpful }: { r: Review; onMenu(): void; onHelpful(): void }) {
  const name = r.author || "CheckTag user";
  const av = safeUrl(r.avatarUrl);
  const [avBroken, setAvBroken] = useState(false);
  const state = r.mine && r.pending ? PENDING[r.pending] || "Not public" : "";
  return (
    <article>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-ct-primary-soft text-[14px] font-bold text-ct-primary">
          {av && !avBroken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={av} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setAvBroken(true)} />
          ) : (
            initialOf(name)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-[14px] font-semibold text-ct-text">{name}</span>
            {r.mine && <span className="rounded-full bg-ct-primary-soft px-1.5 py-0.5 text-[10.5px] font-bold text-ct-primary">You</span>}
            {r.verifiedScan && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-ct-good">
                <BadgeCheck size={13} />
                Verified scan
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-ct-text-3">
            <Stars value={r.rating} size={11} />
            <span>{ago(r.createdAt)}</span>
            {r.edited && <span>· edited</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={onMenu}
          aria-label={r.mine ? "Options for your review" : `Report or block — review by ${name}`}
          className="grid h-8 w-8 place-items-center rounded-full text-ct-text-3 active:bg-ct-surface-alt"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
      {r.body && <p className="mt-2 whitespace-pre-line text-[14.5px] leading-relaxed text-ct-text">{r.body}</p>}
      {state && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ct-surface-alt px-2.5 py-1 text-[12px] text-ct-text-2">
          <EyeOff size={13} />
          {state} · only you can see this
        </div>
      )}
      {r.mine ? (
        !!r.helpfulCount &&
        !r.pending && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-ct-text-3">
            <ThumbsUp size={13} />
            {plural(r.helpfulCount, "person", "people")} found this helpful
          </div>
        )
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          aria-pressed={!!r.votedHelpful}
          onClick={onHelpful}
          className={cx(
            "mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
            r.votedHelpful ? "border-transparent bg-ct-primary-soft text-ct-primary" : "border-ct-border text-ct-text-2",
          )}
        >
          <ThumbsUp size={13} />
          Helpful{r.helpfulCount ? ` · ${fmtN(r.helpfulCount)}` : ""}
        </motion.button>
      )}
    </article>
  );
}
