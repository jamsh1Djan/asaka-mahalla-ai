"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isBanker } from "@/lib/auth";
import { canEditMahalla } from "@/lib/authz";
import { logActivity } from "@/lib/activityLog";
import type { ApplicationStatus } from "@prisma/client";

export type ArizaState = { error?: string; success?: boolean } | null;

export async function submitArizaAction(
  mahallaId: string,
  _prevState: ArizaState,
  formData: FormData
): Promise<ArizaState> {
  const fio = String(formData.get("fio") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const kredit = String(formData.get("kredit") || "").trim();
  const izoh = String(formData.get("izoh") || "").trim();

  if (!fio || !phone) return { error: "Ism va telefon raqamini kiriting" };

  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) return { error: "Mahalla topilmadi" };

  await prisma.application.create({
    data: { mahallaId, fio, phone, kredit, izoh: izoh || null },
  });

  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/bankir");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateArizaStatusAction(applicationId: string, status: ApplicationStatus) {
  const session = await getSession();
  if (!isBanker(session)) throw new Error("Ruxsat yo'q");

  const existing = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!existing) throw new Error("Ariza topilmadi");
  if (!(await canEditMahalla(session, existing.mahallaId))) throw new Error("Ruxsat yo'q");

  const app = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  await logActivity(
    session.bankerId,
    "ariza_korildi",
    `ariza: ${applicationId}, yangi holat: ${status}`
  );

  revalidatePath("/bankir");
  revalidatePath("/admin");
  revalidatePath(`/mahallalar/${app.mahallaId}`);
}
