"use client";

import { useActionState, useRef, useTransition } from "react";
import {
  updateMahallaStatsAction,
  uploadMahallaImageAction,
  type MahallaEditState,
} from "@/actions/mahallas";
import type { Mahalla } from "@prisma/client";

export default function MahallaEditPanel({ mahalla }: { mahalla: Mahalla }) {
  const statsAction = updateMahallaStatsAction.bind(null, mahalla.id);
  const [state, formAction, pending] = useActionState<MahallaEditState, FormData>(
    statsAction,
    null
  );

  const [uploadPending, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("image", file);
    startUpload(async () => {
      await uploadMahallaImageAction(mahalla.id, fd);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div className="card" style={{ marginTop: 26 }}>
      <h4 style={{ margin: "0 0 4px" }}>
        Ko&apos;rsatkichlarni tahrirlash <span className="badge-role">Bankir/Admin</span>
      </h4>
      <p className="small-muted" style={{ marginBottom: 16 }}>
        O&apos;zgarishlar darhol saytda va fuqarolarga ko&apos;rinadigan holatga o&apos;tadi.
      </p>
      <form action={formAction}>
        <div className="grid grid-2">
          <div className="field">
            <label>Bo&apos;sh ish o&apos;rinlari</label>
            <input type="number" name="vakansiya" defaultValue={mahalla.vakansiya} />
          </div>
          <div className="field">
            <label>Jami tadbirkorlik subyektlari</label>
            <input type="number" name="tadbirkorlik" defaultValue={mahalla.tadbirkorlik} />
          </div>
          <div className="field">
            <label>YATT soni</label>
            <input type="number" name="yatt" defaultValue={mahalla.yatt} />
          </div>
          <div className="field">
            <label>MChJ (kichik korxonalar) soni</label>
            <input type="number" name="mchj" defaultValue={mahalla.mchj} />
          </div>
          <div className="field">
            <label>Aholi soni</label>
            <input type="number" name="aholi" defaultValue={mahalla.aholi} />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Manzil</label>
            {/* This field was missing entirely, but updateMahallaStatsAction
                always saves whatever it finds under "manzil" — with no input
                for it here, that was always an empty string, silently
                wiping the address on every save. */}
            <input name="manzil" defaultValue={mahalla.manzil} />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Ixtisoslashuv (drayver)</label>
            <input name="drayver" defaultValue={mahalla.drayver} />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Tadbirkorlik joylari (vergul bilan ajrating)</label>
            <input name="faoliyatTurlari" defaultValue={mahalla.faoliyatTurlari} placeholder="Sartaroshxona, Non yopish sexi, ..." />
          </div>
        </div>
        {state?.error && <div className="err">{state.error}</div>}
        {state?.success && <p className="small-muted">Saqlandi.</p>}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
      <hr className="soft" />
      <label className="small-muted">Mahalla rasmini yangilash</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploadPending}
      />
      {uploadPending && <p className="small-muted">Yuklanmoqda...</p>}
    </div>
  );
}
