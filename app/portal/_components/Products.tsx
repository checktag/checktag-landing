"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { brandApi, brandUpload, type BrandProductRow } from "@/lib/brandApi";
import { productPath } from "@/lib/links";
import { Button, Card, EmptyState } from "../../admin/_components/ui";
import { field, fieldLabel, Loading, num, Pill, ReadOnlyNote, SectionHead, Thumb, tone, usePortal, when } from "./shared";
import { ArrowLeft, BadgeCheck, ExternalLink, ImagePlus, PackagePlus, RefreshCw, RotateCcw, Save, Trash2 } from "lucide-react";

// The brand's verified products: scans, rating and reports for each, and an
// editor for the details shoppers see. Edits go live at once, labelled
// "Provided by <brand>", and can be reverted to what CheckTag showed before.

interface ProductDetail {
  barcode: string;
  name: string | null;
  brand: string | null;
  description: string | null;
  ingredients: string[];
  imageUrl: string | null;
  category: string | null;
  brandProvided: string[];
  brandEditedAt: string | null;
  canRevert: boolean;
}

const FIELD_NAMES: Record<string, string> = { name: "name", description: "description", ingredients: "ingredients", imageUrl: "photo", category: "category" };

export default function Products({ initial }: { initial: string | null }) {
  const { notify, go, canEdit } = usePortal();
  const [items, setItems] = useState<BrandProductRow[] | null>(null);
  const [open, setOpen] = useState<string | null>(initial);

  async function load() {
    setItems(null);
    try {
      setItems((await brandApi<{ items: BrandProductRow[] }>("/brand/products")).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => setOpen(initial), [initial]);

  if (open) {
    return (
      <ProductEditor
        barcode={open}
        onBack={() => {
          go("products");
          setOpen(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <SectionHead
        title="Products"
        actions={
          <>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => go("claims")}>
                <PackagePlus className="h-4 w-4" /> Claim more products
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </>
        }
      >
        The products CheckTag has verified as yours. Open one to see or change the details shoppers see.
      </SectionHead>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label="No verified products yet. Claim your products and CheckTag will check them." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 md:flex md:gap-4">
            <span className="flex-1">Product</span>
            <span className="w-28 text-right">Scans (30 days)</span>
            <span className="w-24 text-right">Rating</span>
            <span className="w-20 text-right">Reports</span>
          </div>
          <ul>
            {items.map((p) => (
              <li key={p.barcode} className="border-b border-white/5 last:border-0">
                <button onClick={() => go("products", p.barcode)} className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left text-sm transition hover:bg-white/[0.03] md:flex-nowrap md:gap-4">
                  <span className="flex min-w-0 flex-1 basis-full items-center gap-3 md:basis-auto">
                    <Thumb src={p.imageUrl} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-100">{p.name || "Unnamed product"}</span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono">{p.barcode}</span>
                        {p.brandProvided.length > 0 && <span className="text-brand-sky">Edited by you</span>}
                      </span>
                    </span>
                  </span>
                  <span className="text-xs text-slate-400 md:w-28 md:text-right md:text-sm md:text-slate-200">
                    <span className="tabular-nums">{num(p.scans30d)}</span>
                    <span className="text-xs text-slate-500"> · {num(p.scans)} all time</span>
                  </span>
                  <span className="text-xs text-slate-400 md:w-24 md:text-right md:text-sm md:text-slate-200">
                    {p.rating != null ? (
                      <>
                        ★ {p.rating.toFixed(1)} <span className="text-xs text-slate-500">({num(p.reviewCount)})</span>
                      </>
                    ) : (
                      <span className="text-slate-500">No reviews</span>
                    )}
                  </span>
                  <span className="text-xs md:w-20 md:text-right md:text-sm">
                    {p.reports > 0 ? <Pill cls={tone.warn}>{num(p.reports)} report{p.reports === 1 ? "" : "s"}</Pill> : <span className="text-slate-500">None</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ProductEditor({ barcode, onBack }: { barcode: string; onBack: () => void }) {
  const { notify, canEdit, me } = usePortal();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function fill(p: ProductDetail) {
    setProduct(p);
    setName(p.name || "");
    setDescription(p.description || "");
    setIngredients(p.ingredients.join("\n"));
    setCategory(p.category || "");
    setImageUrl(p.imageUrl || "");
  }

  useEffect(() => {
    brandApi<{ product: ProductDetail }>(`/brand/products/${encodeURIComponent(barcode)}`).then(
      (r) => fill(r.product),
      (e) => {
        notify(e.message, "error");
        setFailed(true);
      },
    );
  }, [barcode, notify]);

  if (failed) {
    return (
      <div>
        <BackButton onBack={onBack} />
        <Card>
          <EmptyState label="This product isn't verified for your brand." />
        </Card>
      </div>
    );
  }
  if (!product) return <Loading />;

  const changes: Record<string, string> = {};
  if (name.trim() !== (product.name || "")) changes.name = name.trim();
  if (description.trim() !== (product.description || "")) changes.description = description.trim();
  if (ingredients.trim() !== product.ingredients.join("\n")) changes.ingredients = ingredients;
  if (category.trim() !== (product.category || "")) changes.category = category.trim();
  if (imageUrl !== (product.imageUrl || "")) changes.imageUrl = imageUrl;
  const dirty = Object.keys(changes).length > 0;
  const provided = new Set([...product.brandProvided, ...Object.keys(changes)]);
  const resetsAi = "description" in changes || "ingredients" in changes;

  async function upload(file: File) {
    setUploading(true);
    try {
      setImageUrl(await brandUpload(file));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      const r = await brandApi<{ product: ProductDetail }>(`/brand/products/${encodeURIComponent(barcode)}`, { method: "PUT", body: JSON.stringify(changes) });
      fill(r.product);
      notify("Saved. It's live on CheckTag now.", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function revert() {
    if (!confirm("Put back the details CheckTag showed before your brand's first edit? All your changes to this product are removed.")) return;
    setSaving(true);
    try {
      const r = await brandApi<{ product: ProductDetail }>(`/brand/products/${encodeURIComponent(barcode)}/revert`, { method: "POST" });
      fill(r.product);
      notify("The earlier details are back.", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const ingredientList = ingredients
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div>
      <BackButton onBack={onBack} />
      <SectionHead
        title={product.name || "Product"}
        actions={
          <Link href={productPath({ barcode, name: product.name || "product" })} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
            <ExternalLink className="h-4 w-4" /> See it on checktag.io
          </Link>
        }
      >
        <span className="font-mono">{barcode}</span>
        {product.brandEditedAt && <> · Last edited by your team {when(product.brandEditedAt)}</>}
      </SectionHead>

      {!canEdit && <ReadOnlyNote />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="p-5">
          <form onSubmit={save} className="space-y-4">
            <label className="block">
              <span className={fieldLabel}>Product name</span>
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} disabled={!canEdit} required minLength={2} />
            </label>
            <label className="block">
              <span className={fieldLabel}>Description</span>
              <textarea className={`${field} min-h-24`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} disabled={!canEdit} placeholder="What it is, what it's for, pack size…" />
            </label>
            <label className="block">
              <span className={fieldLabel}>Ingredients (one per line, or separated by commas)</span>
              <textarea className={`${field} min-h-32 font-mono text-xs leading-relaxed`} value={ingredients} onChange={(e) => setIngredients(e.target.value)} disabled={!canEdit} placeholder={"Wheat flour\nSugar\nPalm oil"} />
              <span className="mt-1 block text-xs text-slate-500">Copy them from the label, in the same order.</span>
            </label>
            <label className="block">
              <span className={fieldLabel}>Category</span>
              <input className={field} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={60} disabled={!canEdit} placeholder="e.g. Biscuits" />
            </label>
            <div>
              <span className={fieldLabel}>Photo</span>
              <div className="flex flex-wrap items-center gap-3">
                <Thumb src={imageUrl || null} size={64} />
                {canEdit && (
                  <>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                    <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                      <ImagePlus className="h-4 w-4" /> {imageUrl ? "Upload a new photo" : "Upload a photo"}
                    </Button>
                    {imageUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>
                        <Trash2 className="h-4 w-4" /> Remove photo
                      </Button>
                    )}
                  </>
                )}
              </div>
              {canEdit && <p className="mt-1 text-xs text-slate-500">A clear photo of the pack, up to 8 MB.</p>}
            </div>

            {canEdit && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <p className="text-xs text-slate-400">
                  Saved changes go live on CheckTag straight away, marked &ldquo;Provided by {me.brand.name}&rdquo;. The checktag.io page can take up to an hour to catch up.
                  {resetsAi && " Changing the description or ingredients clears CheckTag's AI analysis of this product, so it's worked out again from your details."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" loading={saving} disabled={!dirty || uploading}>
                    <Save className="h-4 w-4" /> Save and publish
                  </Button>
                  {dirty && (
                    <Button type="button" variant="ghost" onClick={() => fill(product)}>
                      Discard changes
                    </Button>
                  )}
                  {product.canRevert && !dirty && (
                    <Button type="button" variant="outline" onClick={revert} disabled={saving} title="Puts back what the product showed before your brand's first edit">
                      <RotateCcw className="h-4 w-4" /> Revert to CheckTag&apos;s earlier details
                    </Button>
                  )}
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Live preview: roughly how the product page shows it. */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Preview</p>
          <Card className="p-5">
            <div className="flex gap-4">
              <Thumb src={imageUrl || null} size={88} className="rounded-xl" />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-accent">
                  {product.brand || me.brand.name}
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] normal-case tracking-normal text-emerald-300">
                    <BadgeCheck className="h-3 w-3" /> Verified brand
                  </span>
                </p>
                <p className="mt-1 text-lg font-bold leading-snug [overflow-wrap:anywhere]">{name || "Product name"}</p>
                {provided.has("name") && <ProvidedBy brand={me.brand.name} />}
                {provided.has("imageUrl") && imageUrl && <ProvidedBy brand={me.brand.name} what="Photo" />}
              </div>
            </div>
            {category && (
              <p className="mt-4 text-sm text-slate-400">
                Category: <span className="text-slate-200">{category}</span> {provided.has("category") && <ProvidedBy brand={me.brand.name} inline />}
              </p>
            )}
            {description && (
              <div className="mt-4">
                <p className="text-sm font-semibold">About this product {provided.has("description") && <ProvidedBy brand={me.brand.name} inline />}</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-300 [overflow-wrap:anywhere]">{description}</p>
              </div>
            )}
            {ingredientList.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold">
                  Ingredients <span className="font-normal text-slate-500">· {ingredientList.length} listed</span> {provided.has("ingredients") && <ProvidedBy brand={me.brand.name} inline />}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {ingredientList.slice(0, 40).map((x, i) => (
                    <li key={i} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-300">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          {provided.size > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Marked as yours: {[...provided].map((f) => FIELD_NAMES[f] || f).join(", ")}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProvidedBy({ brand, what, inline }: { brand: string; what?: string; inline?: boolean }) {
  const cls = "text-xs font-normal text-brand-sky";
  return inline ? <span className={cls}>· Provided by {brand}</span> : <p className={cls + " mt-0.5"}>{what ? `${what} provided by ${brand}` : `Provided by ${brand}`}</p>;
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-200">
      <ArrowLeft className="h-4 w-4" /> All products
    </button>
  );
}
