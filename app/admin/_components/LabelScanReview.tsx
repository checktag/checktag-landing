"use client";
import { safeHttpUrl, cn } from "@/lib/utils";
import type { PublicProduct } from "./useProducts";
import {
  ExternalLink,
  ImageOff,
  PencilLine,
  ScanText,
  ShieldCheck,
} from "lucide-react";

// Moderator view of a label-scan UPDATE submission: the user's photo of the
// product label beside the fields they propose, each marked as read by the AI
// or edited by the user, with the AI's original reading for comparison.
// All values are user/AI supplied and UNTRUSTED — rendered as text only.

const FIELDS = [
  { key: "ingredients", label: "Ingredients", kind: "list" },
  { key: "allergens", label: "Allergens", kind: "list" },
  { key: "nutrition", label: "Nutrition", kind: "map" },
  { key: "servingSize", label: "Serving size", kind: "text" },
  { key: "netQuantity", label: "Net quantity", kind: "text" },
  { key: "certifications", label: "Certifications", kind: "list" },
  { key: "extraFields", label: "Other label details", kind: "map" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type Kind = (typeof FIELDS)[number]["kind"];

export function isLabelScan(payload: Record<string, any> | null | undefined) {
  return payload?.source === "label_scan";
}

// ------------------------------------------------------------ value helpers

function asList(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x ?? "")).filter(Boolean) : [];
}

function asMap(v: unknown): [string, string][] {
  if (!v || typeof v !== "object" || Array.isArray(v)) return [];
  return Object.entries(v as Record<string, unknown>)
    .map(([k, val]) => [k, typeof val === "string" ? val : JSON.stringify(val)] as [string, string])
    .filter(([k, val]) => k && val);
}

function asText(v: unknown): string {
  return v == null ? "" : String(v);
}

function isEmpty(kind: Kind, v: unknown) {
  if (kind === "list") return asList(v).length === 0;
  if (kind === "map") return asMap(v).length === 0;
  return !asText(v).trim();
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** "total_fat" → "Total fat"; human labels ("Country of origin") pass through. */
function humanKey(k: string) {
  if (!/_/.test(k) && /[A-Z ]/.test(k)) return k;
  const s = k.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ------------------------------------------------------------ renderers

/**
 * Renders a field value. `compare`, when given, is the other side of the
 * comparison: entries missing from it are marked (added on the submitted
 * side, dropped on the AI side).
 */
function Value({
  kind,
  value,
  compare,
  mark,
}: {
  kind: Kind;
  value: unknown;
  compare?: unknown;
  mark?: "added" | "dropped";
}) {
  const markCls =
    mark === "added"
      ? "bg-amber-400/15 text-amber-100 ring-1 ring-inset ring-amber-400/30"
      : "text-slate-500 line-through decoration-rose-300/60";

  if (kind === "list") {
    const items = asList(value);
    const other = compare === undefined ? null : new Set(asList(compare).map(norm));
    return (
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item, i) => {
          const diff = other && !other.has(norm(item));
          return (
            <li
              key={i}
              className={cn(
                "rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[13px] leading-snug text-slate-100",
                diff && markCls,
              )}
            >
              {item}
            </li>
          );
        })}
      </ul>
    );
  }

  if (kind === "map") {
    const entries = asMap(value);
    const other =
      compare === undefined
        ? null
        : new Map(asMap(compare).map(([k, v]) => [norm(k), norm(v)]));
    return (
      <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1 text-[13px]">
        {entries.map(([k, v]) => {
          const diff = other && other.get(norm(k)) !== norm(v);
          return (
            <div key={k} className="contents">
              <dt className="truncate text-slate-400" title={k}>
                {humanKey(k)}
              </dt>
              <dd
                className={cn(
                  "[overflow-wrap:anywhere] rounded px-1 text-slate-100",
                  diff && markCls,
                )}
              >
                {v}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }

  const text = asText(value);
  const diff = compare !== undefined && norm(text) !== norm(asText(compare));
  return (
    <p className={cn("inline-block rounded px-1 text-sm text-slate-100", diff && markCls)}>
      {text}
    </p>
  );
}

function Provenance({ edited }: { edited: boolean }) {
  return edited ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
      <PencilLine className="h-3 w-3" strokeWidth={2} /> User edited
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-[11px] font-semibold text-sky-200">
      <ScanText className="h-3 w-3" strokeWidth={2} /> Read by AI
    </span>
  );
}

/** The product's current value for a field, from the public product shape. */
function currentValue(product: PublicProduct | null | undefined, key: FieldKey) {
  if (!product) return undefined;
  if (key === "extraFields") return product.details;
  return (product as any)[key];
}

// ------------------------------------------------------------ main

export function LabelScanReview({
  payload,
  product,
}: {
  payload: Record<string, any>;
  product: PublicProduct | null | undefined;
}) {
  const photo = safeHttpUrl(payload.labelImage);
  const ai: Record<string, any> =
    payload.aiExtraction && typeof payload.aiExtraction === "object"
      ? payload.aiExtraction
      : {};
  const edited = new Set<string>(asList(payload.userEdited));
  const submitted = FIELDS.filter((f) => !isEmpty(f.kind, payload[f.key]));
  const notSubmitted = FIELDS.filter(
    (f) => isEmpty(f.kind, payload[f.key]) && !isEmpty(f.kind, ai[f.key]),
  );
  const verified = new Set(product?.verifiedFields || []);

  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Photo */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Label photo
        </p>
        {photo ? (
          <a
            href={photo}
            target="_blank"
            rel="noreferrer noopener"
            className="group block overflow-hidden rounded-xl border border-white/10 bg-black/40"
            title="Open full size"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Photo of the product label submitted by the user"
              className="mx-auto max-h-[560px] w-full object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="flex items-center justify-center gap-1.5 border-t border-white/10 py-2 text-xs text-slate-400 transition group-hover:text-slate-200">
              <ExternalLink className="h-3.5 w-3.5" /> Open full size
            </span>
          </a>
        ) : (
          <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-white/15 px-6 py-12 text-center">
            <ImageOff className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
            <p className="text-sm text-slate-300">No photo stored</p>
            <p className="max-w-xs text-xs text-slate-500">
              Image storage wasn&rsquo;t available when this was submitted.
              Without the photo the fields can&rsquo;t be checked against the
              label — reject unless you can verify them another way.
            </p>
          </div>
        )}
        {(ai.productName || ai.brand) && (
          <p className="mt-3 text-xs text-slate-400">
            <span className="text-slate-500">Label reads: </span>
            {[ai.productName, ai.brand].filter(Boolean).map(String).join(" · ")}
          </p>
        )}
      </div>

      {/* Proposed fields */}
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Proposed fields
          </p>
          <p className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-400/40 ring-1 ring-amber-400/50" />
              differs from AI
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-slate-500 line-through">abc</span> replaced or dropped
            </span>
          </p>
        </div>

        <div className="divide-y divide-white/[0.06] rounded-xl border border-white/10">
          {submitted.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-400">
              No fields in this submission.
            </p>
          )}
          {submitted.map((f) => {
            const wasEdited = edited.has(f.key);
            const current = currentValue(product, f.key);
            return (
              <section key={f.key} className="px-4 py-3.5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">{f.label}</h4>
                  <Provenance edited={wasEdited} />
                  {verified.has(f.key) && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200"
                      title="This field was already verified from a label; approving replaces it"
                    >
                      <ShieldCheck className="h-3 w-3" /> Replaces verified data
                    </span>
                  )}
                </div>

                <Value
                  kind={f.kind}
                  value={payload[f.key]}
                  compare={wasEdited ? ai[f.key] ?? null : undefined}
                  mark="added"
                />

                {wasEdited && (
                  <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      AI read
                    </p>
                    {isEmpty(f.kind, ai[f.key]) ? (
                      <p className="text-xs italic text-slate-500">Nothing — the user added this.</p>
                    ) : (
                      <Value
                        kind={f.kind}
                        value={ai[f.key]}
                        compare={payload[f.key]}
                        mark="dropped"
                      />
                    )}
                  </div>
                )}

                {!isEmpty(f.kind, current) && (
                  <details className="group mt-2.5">
                    <summary className="cursor-pointer select-none text-xs text-slate-500 hover:text-slate-300">
                      Currently on CheckTag
                    </summary>
                    <div className="mt-2 opacity-80">
                      <Value kind={f.kind} value={current} />
                    </div>
                  </details>
                )}
              </section>
            );
          })}
        </div>

        {notSubmitted.length > 0 && (
          <details className="mt-3 rounded-xl border border-white/10 px-4 py-3">
            <summary className="cursor-pointer select-none text-xs text-slate-400 hover:text-slate-200">
              Also read by AI but not submitted ({notSubmitted.map((f) => f.label).join(", ")})
            </summary>
            <div className="mt-3 space-y-3">
              {notSubmitted.map((f) => (
                <div key={f.key}>
                  <p className="mb-1.5 text-xs font-semibold text-slate-400">{f.label}</p>
                  <Value kind={f.kind} value={ai[f.key]} />
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/** Small header pill: "Label scan" + the AI's legibility confidence. */
export function LabelScanTag({ payload }: { payload: Record<string, any> }) {
  const conf = payload?.aiExtraction?.confidence;
  const tone =
    conf === "high"
      ? "text-emerald-300"
      : conf === "medium"
        ? "text-amber-300"
        : "text-rose-300";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-200">
      <ScanText className="h-3.5 w-3.5 text-slate-400" /> Label scan
      {(conf === "high" || conf === "medium" || conf === "low") && (
        <span className={cn("font-semibold", tone)}>· {conf} legibility</span>
      )}
    </span>
  );
}
