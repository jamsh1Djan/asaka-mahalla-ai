"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canEditMahalla } from "@/lib/authz";
import { logActivity } from "@/lib/activityLog";

export type BusinessState = { error?: string; success?: boolean } | null;

export async function createBusinessAction(
  mahallaId: string,
  _prevState: BusinessState,
  formData: FormData
): Promise<BusinessState> {
  const session = await getSession();
  if (!(await canEditMahalla(session, mahallaId))) return { error: "Ruxsat yo'q" };

  const nomi = String(formData.get("nomi") || "").trim();
  const turi = String(formData.get("turi") || "").trim();
  const manzil = String(formData.get("manzil") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  if (!nomi || !turi || !manzil) return { error: "Nomi, turi va manzilni kiriting" };

  const actorId = session?.kind === "banker" ? session.bankerId : null;
  await prisma.business.create({
    data: { mahallaId, nomi, turi, manzil, telefon: telefon || null, createdBy: actorId },
  });

  await logActivity(actorId, "korxona_qoshildi", `mahalla: ${mahallaId}, nomi: ${nomi}`);

  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/bankir");
  return { success: true };
}

export async function updateBusinessAction(
  businessId: string,
  _prevState: BusinessState,
  formData: FormData
): Promise<BusinessState> {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return { error: "Korxona topilmadi" };
  const session = await getSession();
  if (!(await canEditMahalla(session, business.mahallaId))) return { error: "Ruxsat yo'q" };

  const nomi = String(formData.get("nomi") || "").trim();
  const turi = String(formData.get("turi") || "").trim();
  const manzil = String(formData.get("manzil") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  if (!nomi || !turi || !manzil) return { error: "Nomi, turi va manzilni kiriting" };

  await prisma.business.update({
    where: { id: businessId },
    data: { nomi, turi, manzil, telefon: telefon || null },
  });

  const actorId = session?.kind === "banker" ? session.bankerId : null;
  await logActivity(actorId, "korxona_ozgartirildi", `korxona: ${businessId}`);

  revalidatePath(`/mahallalar/${business.mahallaId}`);
  revalidatePath("/bankir");
  return { success: true };
}

export async function deleteBusinessAction(businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("Korxona topilmadi");
  const session = await getSession();
  if (!(await canEditMahalla(session, business.mahallaId))) throw new Error("Ruxsat yo'q");

  await prisma.business.delete({ where: { id: businessId } });

  const actorId = session?.kind === "banker" ? session.bankerId : null;
  await logActivity(actorId, "korxona_ochirildi", `korxona: ${businessId}, nomi: ${business.nomi}`);

  revalidatePath(`/mahallalar/${business.mahallaId}`);
  revalidatePath("/bankir");
}
