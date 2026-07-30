"use client";

import { useActionState, useEffect } from "react";
import { createListingAction, updateListingAction, type ListingState } from "@/actions/listings";
import type { Listing, Mahalla } from "@prisma/client";

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
  defaultMahallaId,
  listing,
  onDone,
}: {
  mahallas: Pick<Mahalla, "id" | "nomi">[];
  defaultMahallaId?: string;
  listing?: Listing;
  onDone?: () => void;
}) {
  const isEdit = !!listing;
  const action = isEdit ? updateListingAction.bind(null, listing.id) : createListingAction;
  const [state, formAction, pending] = useActionState<ListingState, FormData>(action, null);

  useEffect(() => {
    if (state?.success) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      {!isEdit && (
        <div className="field">
          <label>Mahalla</label>
          <select name="mahallaId" defaultValue={defaultMahallaId ?? mahallas[0]?.id}>
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
        <select name="turi" defaultValue={listing?.turi ?? "IJARA"}>
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
      <div className="grid grid-2">
        <div className="field">
          <label>Narx / Maosh (so&apos;m, ixtiyoriy)</label>
          <input type="number" name="narx" defaultValue={listing?.narx ?? undefined} />
        </div>
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
        <label>Rasm (ixtiyoriy)</label>
        <input type="file" name="image" accept="image/*" />
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "E'lonni joylash"}
      </button>
    </form>
  );
}
