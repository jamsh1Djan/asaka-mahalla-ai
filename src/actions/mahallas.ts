"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { canEditMahalla } from "@/lib/authz";
import { logActivity } from "@/lib/activityLog";

export type MahallaEditState = { error?: string; success?: boolean } | null;

export async function updateMahallaStatsAction(
  mahallaId: string,
  _prevState: MahallaEditState,
  formData: FormData
): Promise<MahallaEditState> {
  const session = await getSession();
  if (!(await canEditMahalla(session, mahallaId))) return { error: "Ruxsat yo'q" };

  const vakansiya = Number(formData.get("vakansiya")) || 0;
  const tadbirkorlik = Number(formData.get("tadbirkorlik")) || 0;
  const yatt = Number(formData.get("yatt")) || 0;
  const mchj = Number(formData.get("mchj")) || 0;
  const aholi = Number(formData.get("aholi")) || 0;
  const drayver = String(formData.get("drayver") || "").trim();
  const faoliyatTurlari = String(formData.get("faoliyatTurlari") || "").trim();
  const manzil = String(formData.get("manzil") || "").trim();

  await prisma.mahalla.update({
    where: { id: mahallaId },
    data: { vakansiya, tadbirkorlik, yatt, mchj, aholi, drayver, faoliyatTurlari, manzil },
  });

  const actorId = session?.kind === "banker" ? session.bankerId : null;
  await logActivity(actorId, "mahalla_tahrirlandi", `mahalla: ${mahallaId}`);

  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/mahallalar");
  revalidatePath("/");
  return { success: true };
}

export async function uploadMahallaImageAction(mahallaId: string, formData: FormData) {
  const session = await getSession();
  if (!(await canEditMahalla(session, mahallaId))) throw new Error("Ruxsat yo'q");

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return;

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "mahallas");
  await mkdir(dir, { recursive: true });

  const filename = `${mahallaId}-${Date.now()}.jpg`;
  const resized = await sharp(buffer).resize(960, undefined, { withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  await writeFile(path.join(dir, filename), resized);

  await prisma.mahalla.update({
    where: { id: mahallaId },
    data: { image: `/uploads/mahallas/${filename}` },
  });

  const actorId = session?.kind === "banker" ? session.bankerId : null;
  await logActivity(actorId, "mahalla_tahrirlandi", `mahalla: ${mahallaId} (rasm yangilandi)`);

  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/mahallalar");
  revalidatePath("/");
}

export async function adminUpdateMahallaAction(mahallaId: string, formData: FormData) {
  const session = await getSession();
  if (!isAdmin(session)) throw new Error("Ruxsat yo'q");

  const aholi = Number(formData.get("aholi")) || 0;
  const tadbirkorlik = Number(formData.get("tadbirkorlik")) || 0;
  const vakansiya = Number(formData.get("vakansiya")) || 0;

  await prisma.mahalla.update({
    where: { id: mahallaId },
    data: { aholi, tadbirkorlik, vakansiya },
  });

  await logActivity(session.bankerId, "mahalla_tahrirlandi", `mahalla: ${mahallaId} (admin)`);

  revalidatePath("/admin");
  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/mahallalar");
  revalidatePath("/");
}

function slugify(nomi: string): string {
  const base = nomi
    .toLowerCase()
    .replace(/[^a-z0-9а-яёʻʼ']+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

export type CreateMahallaState = { error?: string; success?: boolean } | null;

export async function createMahallaAction(
  _prevState: CreateMahallaState,
  formData: FormData
): Promise<CreateMahallaState> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Ruxsat yo'q" };

  const nomi = String(formData.get("nomi") || "").trim();
  const tuman = String(formData.get("tuman") || "").trim() || "Yunusobod";
  const manzil = String(formData.get("manzil") || "").trim();
  const aholi = Number(formData.get("aholi")) || 0;
  const mahallaBankiri = String(formData.get("mahallaBankiri") || "").trim();
  if (!nomi) return { error: "Mahalla nomini kiriting" };

  const id = slugify(nomi);
  const mahalla = await prisma.mahalla.create({
    data: {
      id,
      nomi,
      tuman,
      manzil,
      aholi,
      sector: tuman,
      tashkil: new Date().getFullYear(),
      erkak: 0,
      ayol: 0,
      xonadon: 0,
      oila: 0,
      tadbirkorlik: 0,
      yatt: 0,
      mchj: 0,
      vakansiya: 0,
      drayver: "",
      agent: "",
      color: "#0B2545",
      mapPoints: null,
      isSeed: false,
    },
  });

  if (mahallaBankiri) {
    await prisma.bankerMahalla.create({
      data: { bankerId: mahallaBankiri, mahallaId: mahalla.id, assignedBy: session.bankerId },
    });
  }

  await logActivity(session.bankerId, "mahalla_qoshildi", `mahalla: ${mahalla.nomi} (${mahalla.id})`);

  revalidatePath("/admin");
  revalidatePath("/mahallalar");
  revalidatePath("/");
  return { success: true };
}

export async function toggleMahallaStatusAction(mahallaId: string, status: "FAOL" | "FAOL_EMAS") {
  const session = await getSession();
  if (!isAdmin(session)) throw new Error("Ruxsat yo'q");

  await prisma.mahalla.update({ where: { id: mahallaId }, data: { status } });
  await logActivity(session.bankerId, "mahalla_tahrirlandi", `mahalla: ${mahallaId}, status: ${status}`);

  revalidatePath("/admin");
  revalidatePath("/mahallalar");
  revalidatePath("/");
}

export async function deleteMahallaAction(mahallaId: string) {
  const session = await getSession();
  if (!isAdmin(session)) throw new Error("Ruxsat yo'q");

  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) throw new Error("Mahalla topilmadi");
  if (mahalla.isSeed) {
    throw new Error("Bu asl Yunusobod MFY ma'lumoti — o'chirib bo'lmaydi, faqat tahrirlash mumkin");
  }

  await prisma.mahalla.delete({ where: { id: mahallaId } });
  await logActivity(session.bankerId, "mahalla_ochirildi", `mahalla: ${mahalla.nomi} (${mahallaId})`);

  revalidatePath("/admin");
  revalidatePath("/mahallalar");
  revalidatePath("/");
}
