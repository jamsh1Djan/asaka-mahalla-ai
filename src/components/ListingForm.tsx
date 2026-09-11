"use client";

import { useActionState, useEffect, useState } from "react";
import { createListingAction, updateListingAction, type ListingState } from "@/actions/listings";
import ImagePicker from "@/components/ImagePicker";
import type { Business, Listing, Mahalla, ListingType } from "@prisma/client";

const TYPE_LABELS: Record<string, string> = {
  IJARA: "Ijaraga beriladigan joy",
  ISH: "Bo'sh ish o'rni",
  BOSHQA: "Boshqa",
};

function toDateInputValue(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function ListingForm({
  mahallas,
  businesses,
  defaultMahallaId,
  listing,
  onDone,
}: {
  mahallas: Pick<Mahalla, "id" | "nomi">[];
  businesses: Pick<Business, "id" | "nomi" | "mahallaId">[];
  defaultMahallaId?: string;
  listing?: Listing;
  onDone?: () => void;
}) {
  const isEdit = !!listing;
  const action = isEdit ? updateListingAction.bind(null, listing.id) : createListingAction;
  const [state, formAction, pending] = useActionState<ListingState, FormData>(action, null);
  const [mahallaId, setMahallaId] = useState(
    listing?.mahallaId ?? defaultMahallaId ?? mahallas[0]?.id ?? ""
  );
  const [turi, setTuri] = useState<ListingType>(listing?.turi ?? "IJARA");
  const isIsh = turi === "ISH";
  const mahallaBusinesses = businesses.filter((b) => b.mahallaId === mahallaId);

  useEffect(() => {
    if (state?.success) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      {!isEdit && (
        <div className="field">
          <label>Mahalla</label>
          <select name="mahallaId" value={mahallaId} onChange={(e) => setMahallaId(e.target.value)}>
            {mahallas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nomi}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="field">
        <label>Turi</label>
        <select name="turi" value={turi} onChange={(e) => setTuri(e.target.value as ListingType)}>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Sarlavha</label>
        <input name="sarlavha" defaultValue={listing?.sarlavha} required />
      </div>
      <div className="field">
        <label>Tavsif</label>
        <textarea name="tavsif" rows={3} defaultValue={listing?.tavsif} required />
      </div>

      {isIsh && (
        <>
          <div className="field">
            <label>Korxona (ixtiyoriy)</label>
            <select name="businessId" defaultValue={listing?.businessId ?? ""}>
              <option value="">— Ko&apos;rsatilmasin —</option>
              {mahallaBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nomi}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Maosh, dan (so&apos;m, ixtiyoriy)</label>
              <input type="number" name="maoshMin" defaultValue={listing?.maoshMin ?? undefined} />
            </div>
            <div className="field">
              <label>Maosh, gacha (so&apos;m, ixtiyoriy)</label>
              <input type="number" name="maoshMax" defaultValue={listing?.maoshMax ?? undefined} />
            </div>
          </div>
          <div className="field">
            <label>Talablar (ixtiyoriy)</label>
            <textarea name="talablar" rows={2} defaultValue={listing?.talablar ?? undefined} placeholder="Masalan: tajriba, malaka" />
          </div>
        </>
      )}

      <div className="grid grid-2">
        {!isIsh && (
          <div className="field">
            <label>Narx (so&apos;m, ixtiyoriy)</label>
            <input type="number" name="narx" defaultValue={listing?.narx ?? undefined} />
          </div>
        )}
        <div className="field">
          <label>Amal qilish muddati (ixtiyoriy)</label>
          <input type="date" name="amalMuddati" defaultValue={toDateInputValue(listing?.amalMuddati)} />
        </div>
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label>Manzil</label>
          <input name="manzil" defaultValue={listing?.manzil} required />
        </div>
        <div className="field">
          <label>Kontakt telefon</label>
          <input name="telefon" defaultValue={listing?.telefon} placeholder="+998 90 000 00 00" required />
        </div>
      </div>
      <div className="field">
        <label>Rasmlar (ixtiyoriy, 2 tagacha)</label>
        <ImagePicker
          name="images"
          max={2}
          helpText={isEdit ? "Yangi rasm(lar) tanlasangiz, avvalgi rasmlar o'rniga shular saqlanadi." : undefined}
        />
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "E'lonni joylash"}
      </button>
    </form>
  );
}
