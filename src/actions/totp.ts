"use server";

import QRCode from "qrcode";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";
import { generateTotpSecret, buildOtpauthUri, verifyTotpCode } from "@/lib/totp";

export type EnrollResult = { error: string } | { secret: string; qrDataUrl: string };

/** Generates a new (unconfirmed) secret and stores it — totpEnabled stays false
 * until confirmTotpAction verifies the user actually scanned/entered it. */
export async function startTotpEnrollmentAction(): Promise<EnrollResult> {
  const session = await getSession();
  if (!session || session.kind !== "banker") return { error: "Ruxsat yo'q" };

  const secret = generateTotpSecret();
  await prisma.banker.update({
    where: { id: session.bankerId },
    data: { totpSecret: secret, totpEnabled: false },
  });

  const uri = buildOtpauthUri(secret, session.login);
  const qrDataUrl = await QRCode.toDataURL(uri);
  return { secret, qrDataUrl };
}

export type ConfirmState = { error?: string; success?: boolean } | null;

export async function confirmTotpAction(
  _prevState: ConfirmState,
  formData: FormData
): Promise<ConfirmState> {
  const session = await getSession();
  if (!session || session.kind !== "banker") return { error: "Ruxsat yo'q" };

  const code = String(formData.get("code") || "").trim();
  const acc = await prisma.banker.findUnique({ where: { id: session.bankerId } });
  if (!acc?.totpSecret) return { error: "Avval QR kodni skanerlang" };

  if (!verifyTotpCode(acc.totpSecret, code)) {
    return { error: "Kod noto'g'ri. Ilovadagi joriy kodni kiriting." };
  }

  await prisma.banker.update({ where: { id: session.bankerId }, data: { totpEnabled: true } });
  await logActivity(session.bankerId, "2fa_yoqildi");
  revalidatePath("/bankir");
  revalidatePath("/admin");
  return { success: true };
}

export async function disableTotpAction() {
  const session = await getSession();
  if (!session || session.kind !== "banker") throw new Error("Ruxsat yo'q");

  await prisma.banker.update({
    where: { id: session.bankerId },
    data: { totpEnabled: false, totpSecret: null },
  });
  await logActivity(session.bankerId, "2fa_ochirildi");
  revalidatePath("/bankir");
  revalidatePath("/admin");
}
