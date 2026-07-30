"use client";

import { useActionState, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  startTotpEnrollmentAction,
  confirmTotpAction,
  disableTotpAction,
  type ConfirmState,
  type EnrollResult,
} from "@/actions/totp";

export default function TwoFactorSection({ totpEnabled }: { totpEnabled: boolean }) {
  const [enrollment, setEnrollment] = useState<EnrollResult | null>(null);
  const [enrollPending, startEnroll] = useTransition();
  const [disablePending, startDisable] = useTransition();
  const [confirmState, confirmFormAction, confirmPending] = useActionState<ConfirmState, FormData>(
    confirmTotpAction,
    null
  );

  if (totpEnabled) {
    return (
      <div className="card" style={{ maxWidth: 480, marginTop: 18 }}>
        <h4 style={{ margin: "0 0 8px" }}>Ikki bosqichli tasdiqlash (2FA)</h4>
        <p className="ok-box" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={16} /> 2FA yoqilgan — hisobingiz qo&apos;shimcha himoyalangan.
        </p>
        <button
          className="btn btn-outline"
          disabled={disablePending}
          onClick={() => {
            if (!confirm("2FA'ni o'chirishni tasdiqlaysizmi? Hisobingiz kamroq himoyalangan bo'ladi.")) return;
            startDisable(() => disableTotpAction());
          }}
        >
          {disablePending ? "O'chirilmoqda..." : "2FA'ni o'chirish"}
        </button>
      </div>
    );
  }

  if (confirmState?.success) {
    return (
      <div className="card" style={{ maxWidth: 480, marginTop: 18 }}>
        <h4 style={{ margin: "0 0 8px" }}>Ikki bosqichli tasdiqlash (2FA)</h4>
        <p className="ok-box" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={16} /> 2FA muvaffaqiyatli yoqildi.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480, marginTop: 18 }}>
      <h4 style={{ margin: "0 0 8px" }}>Ikki bosqichli tasdiqlash (2FA)</h4>
      {!enrollment ? (
        <>
          <p className="small-muted" style={{ marginBottom: 14 }}>
            Google Authenticator, Authy yoki shunga o&apos;xshash ilova bilan hisobingizni
            qo&apos;shimcha himoyalang.
          </p>
          <button
            className="btn btn-primary"
            disabled={enrollPending}
            onClick={() =>
              startEnroll(async () => {
                const res = await startTotpEnrollmentAction();
                setEnrollment(res);
              })
            }
          >
            {enrollPending ? "Tayyorlanmoqda..." : "2FA sozlashni boshlash"}
          </button>
        </>
      ) : "error" in enrollment ? (
        <div className="err">{enrollment.error}</div>
      ) : (
        <>
          <p className="small-muted" style={{ marginBottom: 10 }}>
            1. Autentifikator ilovada QR kodni skanerlang (yoki kalitni qo&apos;lda kiriting):
          </p>
          <img
            src={enrollment.qrDataUrl}
            alt="2FA QR kod"
            width={180}
            height={180}
            style={{ borderRadius: 12, border: "1px solid var(--line)" }}
          />
          <p className="small-muted" style={{ margin: "10px 0", wordBreak: "break-all" }}>
            Qo&apos;lda kiritish uchun kalit: <code>{enrollment.secret}</code>
          </p>
          <p className="small-muted" style={{ marginBottom: 10 }}>
            2. Ilovada ko&apos;rsatilgan 6 xonali kodni kiriting:
          </p>
          <form action={confirmFormAction}>
            <div className="field">
              <input
                name="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                style={{ fontSize: 20, letterSpacing: 5, textAlign: "center" }}
                required
              />
            </div>
            {confirmState?.error && <div className="err">{confirmState.error}</div>}
            <button className="btn btn-primary" type="submit" disabled={confirmPending}>
              {confirmPending ? "Tekshirilmoqda..." : "Tasdiqlash va yoqish"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
