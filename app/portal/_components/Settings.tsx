"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { brandApi, brandSignOutEverywhere, brandUpload, type BrandMe } from "@/lib/brandApi";
import { Button, Card } from "../../admin/_components/ui";
import { day, field, fieldLabel, ReadOnlyNote, SectionHead, Thumb, usePortal } from "./shared";
import { ImagePlus, LogOut, Save, Trash2 } from "lucide-react";

// The brand's profile (website, country, logo) and the person's own session.
// The brand's name is the one CheckTag verified: changing it goes through support.

export default function Settings() {
  const { me, notify, canEdit } = usePortal();
  const router = useRouter();
  const [brand, setBrand] = useState(me.brand);
  const [website, setWebsite] = useState(me.brand.website || "");
  const [country, setCountry] = useState(me.brand.country || "");
  const [logoUrl, setLogoUrl] = useState(me.brand.logoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = website.trim() !== (brand.website || "") || country.trim() !== (brand.country || "") || logoUrl !== (brand.logoUrl || "");

  async function upload(file: File) {
    setUploading(true);
    try {
      setLogoUrl(await brandUpload(file));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await brandApi<{ brand: BrandMe["brand"] }>("/brand/profile", {
        method: "PATCH",
        body: JSON.stringify({ website: website.trim(), country: country.trim(), logoUrl }),
      });
      setBrand(r.brand);
      setWebsite(r.brand.website || "");
      setCountry(r.brand.country || "");
      setLogoUrl(r.brand.logoUrl || "");
      notify("Saved.", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function signOutEverywhere() {
    if (!confirm("Sign out of the portal on every device, including this one?")) return;
    setLeaving(true);
    await brandSignOutEverywhere();
    router.replace("/portal/login");
  }

  return (
    <div>
      <SectionHead title="Settings">Your brand&apos;s details on CheckTag, and your own sign-in.</SectionHead>
      {!canEdit && <ReadOnlyNote />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="p-5">
          <h3 className="font-semibold">Brand profile</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Name</dt>
              <dd className="text-slate-200">{brand.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Verified by CheckTag</dt>
              <dd className="text-slate-200">{day(brand.verifiedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Plan</dt>
              <dd className="text-slate-200">{brand.plan === "pilot" ? "Free pilot" : brand.plan}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-slate-500">
            To change your brand&apos;s name, email{" "}
            <a href="mailto:support@checktag.io" className="text-brand-sky hover:underline">
              support@checktag.io
            </a>
            .
          </p>

          <form onSubmit={save} className="mt-5 space-y-4 border-t border-white/10 pt-5">
            <label className="block">
              <span className={fieldLabel}>Website</span>
              <input className={field} value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={200} disabled={!canEdit} placeholder="yourbrand.com" />
            </label>
            <label className="block">
              <span className={fieldLabel}>Country</span>
              <input className={field} value={country} onChange={(e) => setCountry(e.target.value)} maxLength={60} disabled={!canEdit} placeholder="Where the brand is based" />
            </label>
            <div>
              <span className={fieldLabel}>Logo</span>
              <div className="flex flex-wrap items-center gap-3">
                <Thumb src={logoUrl || null} size={56} />
                {canEdit && (
                  <>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                    <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                      <ImagePlus className="h-4 w-4" /> {logoUrl ? "Upload a new logo" : "Upload your logo"}
                    </Button>
                    {logoUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl("")}>
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            {canEdit && (
              <Button type="submit" loading={saving} disabled={!dirty || uploading}>
                <Save className="h-4 w-4" /> Save
              </Button>
            )}
          </form>
        </Card>

        <Card className="h-fit p-5">
          <h3 className="font-semibold">Your sign-in</h3>
          <p className="mt-1 text-sm text-slate-400">
            You&apos;re signed in as {me.user.roleLabel}. A session lasts up to 12 hours and ends when you close this tab.
          </p>
          <p className="mt-3 text-sm text-slate-400">Lost a phone or laptop? Sign out everywhere, then sign in again here.</p>
          <Button variant="outline" size="sm" className="mt-4" loading={leaving} onClick={signOutEverywhere}>
            <LogOut className="h-4 w-4" /> Sign out everywhere
          </Button>
          <p className="mt-4 text-xs text-slate-500">Lost your authenticator? Use a backup code, or ask your brand&apos;s Owner to reset it from the Team page.</p>
        </Card>
      </div>
    </div>
  );
}
