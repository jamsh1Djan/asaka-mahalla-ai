"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { createCitizenListingAction, type ListingState } from "@/actions/listings";
import ImagePicker from "@/components/ImagePicker";
import type { Business, Mahalla, ListingType } from "@prisma/client";

const TYPE_LABELS: Record<ListingType, string> = {
  IJARA: "Ijaraga beriladigan joy",
  ISH: "Bo'sh ish o'rni",
  BOSHQA: "Boshqa",
};

function isListingType(v: string | undefined): v is ListingType {
  return v === "IJARA" || v === "ISH" || v === "BOSHQA";
}

export default function CitizenListingForm({
  mahallas,
  businesses,
  defaultMahallaId,
  defaultTuri,
  citizenName,
  defaultPhone,
}: {
  mahallas: Pick<Mahalla, "id" | "nomi">[];
  businesses: Pick<Business, "id" | "nomi" | "mahallaId">[];
  defaultMahallaId?: string;
  defaultTuri?: string;
  citizenName: string;
  defaultPhone?: string;
}) {
  const [state, formAction, pending] = useActionState<ListingState, FormData>(
    createCitizenListingAction,
    null
  );
  const [mahallaId, setMahallaId] = useState(defaultMahallaId ?? mahallas[0]?.id ?? "");
  const [turi, setTuri] = useState<ListingType>(isListingType(defaultTuri) ? defaultTuri : "IJARA");
  const isIsh = turi === "ISH";
  const mahallaBusinesses = businesses.filter((b) => b.mahallaId === mahallaId);

  if (state?.success) {
    return (
      <div className="ok-box" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Rahmat! E&apos;loningiz mahalla bankiri tomonidan ko&apos;rib chiqiladi, tasdiqlangach
          saytda chiqadi.
        </span>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <p className="sub" style={{ marginTop: 0 }}>
        E&apos;lon beruvchi: <b>{citizenName}</b>
      </p>
      <div className="field">
        <label>Mahalla</label>
        <select
          name="mahallaId"
          value={mahallaId}
          onChange={(e) => setMahallaId(e.target.value)}
          required
        >
          {mahallas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nomi}
            </option>
          ))}
        </select>
      </div>
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
        <input name="sarlavha" placeholder="Masalan: Bo'sh joy — sotuvchi kerak" required />
      </div>
      <div className="field">
        <label>Tavsif</label>
        <textarea name="tavsif" rows={3} placeholder="Batafsil yozing — shart va imkoniyatlar" required />
      </div>

      {isIsh && (
        <>
          <div className="field">
            <label>Korxona (ixtiyoriy)</label>
            <select name="businessId" defaultValue="">
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
              <input type="number" name="maoshMin" />
            </div>
            <div className="field">
              <label>Maosh, gacha (so&apos;m, ixtiyoriy)</label>
              <input type="number" name="maoshMax" />
            </div>
          </div>
          <div className="field">
            <label>Talablar (ixtiyoriy)</label>
            <textarea name="talablar" rows={2} placeholder="Masalan: tajriba, malaka" />
          </div>
        </>
      )}

      <div className="grid grid-2">
        {!isIsh && (
          <div className="field">
            <label>Narx (so&apos;m, ixtiyoriy)</label>
            <input type="number" name="narx" />
          </div>
        )}
        <div className="field">
          <label>Manzil</label>
          <input name="manzil" required />
        </div>
      </div>
      <div className="field">
        <label>Kontakt telefon</label>
        <input name="telefon" defaultValue={defaultPhone} placeholder="+998 90 000 00 00" required />
      </div>
      <div className="field">
        <label>Rasmlar (ixtiyoriy, 2 tagacha)</label>
        <ImagePicker
          name="images"
          max={2}
          helpText="Rasm qo'shsangiz, e'loningiz ko'proq ishonch uyg'otadi."
        />
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        type="submit"
        disabled={pending}
      >
        {pending ? "Yuborilmoqda..." : "E'lonni yuborish"}
      </button>
    </form>
  );
}
