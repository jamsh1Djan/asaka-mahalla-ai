"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isBanker } from "@/lib/auth";
import { canEditMahalla } from "@/lib/authz";
import { logActivity } from "@/lib/activityLog";
import type { ListingType } from "@prisma/client";

export type ListingState = { error?: string; success?: boolean } | null;

const LISTING_TYPES: ListingType[] = ["IJARA", "ISH", "BOSHQA"];

async function saveListingImage(mahallaId: string, file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "listings");
  await mkdir(dir, { recursive: true });
  const filename = `${mahallaId}-${Date.now()}.jpg`;
  const resized = await sharp(buffer)
    .resize(960, undefined, { withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  await writeFile(path.join(dir, filename), resized);
  return `/uploads/listings/${filename}`;
}

export async function createListingAction(
  _prevState: ListingState,
  formData: FormData
): Promise<ListingState> {
  const session = await getSession();
  const mahallaId = String(formData.get("mahallaId") || "");
  if (!mahallaId) return { error: "Mahalla tanlanmagan" };
  if (!(await canEditMahalla(session, mahallaId))) return { error: "Ruxsat yo'q" };
  if (!isBanker(session)) return { error: "Ruxsat yo'q" };

  const turi = String(formData.get("turi") || "") as ListingType;
  const sarlavha = String(formData.get("sarlavha") || "").trim();
  const tavsif = String(formData.get("tavsif") || "").trim();
  const narxRaw = String(formData.get("narx") || "").trim();
  const manzil = String(formData.get("manzil") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const amalMuddatiRaw = String(formData.get("amalMuddati") || "").trim();
  const file = formData.get("image");

  if (!LISTING_TYPES.includes(turi)) return { error: "Turi noto'g'ri tanlangan" };
  if (!sarlavha || !tavsif || !manzil || !telefon) {
    return { error: "Hamma majburiy maydonlarni to'ldiring" };
  }

  const narx = narxRaw ? Number(narxRaw) : null;
  const amalMuddati = amalMuddatiRaw ? new Date(amalMuddatiRaw) : null;

  let image: string | null = null;
  if (file instanceof File && file.size > 0) {
    image = await saveListingImage(mahallaId, file);
  }

  await prisma.listing.create({
    data: {
      mahallaId,
      turi,
      sarlavha,
      tavsif,
      narx,
      manzil,
      telefon,
      amalMuddati,
      image,
      createdBy: session.bankerId,
    },
  });

  await logActivity(session.bankerId, "elon_qoshildi", `mahalla: ${mahallaId}, sarlavha: ${sarlavha}`);

  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/bankir");
  return { success: true };
}

export async function updateListingAction(
  listingId: string,
  _prevState: ListingState,
  formData: FormData
): Promise<ListingState> {
  const session = await getSession();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "E'lon topilmadi" };
  if (!(await canEditMahalla(session, listing.mahallaId)) || !isBanker(session)) {
    return { error: "Ruxsat yo'q" };
  }

  const turi = String(formData.get("turi") || "") as ListingType;
  const sarlavha = String(formData.get("sarlavha") || "").trim();
  const tavsif = String(formData.get("tavsif") || "").trim();
  const narxRaw = String(formData.get("narx") || "").trim();
  const manzil = String(formData.get("manzil") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const amalMuddatiRaw = String(formData.get("amalMuddati") || "").trim();
  const file = formData.get("image");

  if (!LISTING_TYPES.includes(turi)) return { error: "Turi noto'g'ri tanlangan" };
  if (!sarlavha || !tavsif || !manzil || !telefon) {
    return { error: "Hamma majburiy maydonlarni to'ldiring" };
  }

  let image = listing.image;
  if (file instanceof File && file.size > 0) {
    image = await saveListingImage(listing.mahallaId, file);
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      turi,
      sarlavha,
      tavsif,
      narx: narxRaw ? Number(narxRaw) : null,
      manzil,
      telefon,
      amalMuddati: amalMuddatiRaw ? new Date(amalMuddatiRaw) : null,
      image,
    },
  });

  await logActivity(session.bankerId, "elon_ozgartirildi", `elon: ${listingId}`);

  revalidatePath(`/mahallalar/${listing.mahallaId}`);
  revalidatePath("/bankir");
  return { success: true };
}

export async function deleteListingAction(listingId: string) {
  const session = await getSession();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("E'lon topilmadi");
  if (!(await canEditMahalla(session, listing.mahallaId)) || !isBanker(session)) {
    throw new Error("Ruxsat yo'q");
  }

  await prisma.listing.delete({ where: { id: listingId } });
  await logActivity(session.bankerId, "elon_ochirildi", `elon: ${listingId}, sarlavha: ${listing.sarlavha}`);

  revalidatePath(`/mahallalar/${listing.mahallaId}`);
  revalidatePath("/bankir");
}
