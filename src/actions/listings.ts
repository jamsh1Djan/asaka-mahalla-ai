"use server";

import sharp from "sharp";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isBanker } from "@/lib/auth";
import { canEditMahalla } from "@/lib/authz";
import { logActivity } from "@/lib/activityLog";
import type { ListingType } from "@prisma/client";

export type ListingState = { error?: string; success?: boolean } | null;

const LISTING_TYPES: ListingType[] = ["IJARA", "ISH", "BOSHQA"];
const MAX_IMAGES = 2;

// Vercel's serverless functions have a read-only filesystem outside /tmp, so
// writing uploaded files to public/uploads (which works fine locally) never
// persists in production — Blob storage is the actual durable, publicly
// servable destination.
async function saveListingImages(mahallaId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${mahallaId}-${Date.now()}-${urls.length}.jpg`;
    const resized = await sharp(buffer)
      .resize(960, undefined, { withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    const blob = await put(`listings/${filename}`, resized, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });
    urls.push(blob.url);
  }
  return urls;
}

function getImageFiles(formData: FormData): File[] {
  return formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
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
  const files = getImageFiles(formData);

  if (!LISTING_TYPES.includes(turi)) return { error: "Turi noto'g'ri tanlangan" };
  if (!sarlavha || !tavsif || !manzil || !telefon) {
    return { error: "Hamma majburiy maydonlarni to'ldiring" };
  }
  if (files.length > MAX_IMAGES) return { error: "Ko'pi bilan 2 ta rasm yuklash mumkin" };

  const narx = narxRaw ? Number(narxRaw) : null;
  const amalMuddati = amalMuddatiRaw ? new Date(amalMuddatiRaw) : null;
  const images = files.length > 0 ? await saveListingImages(mahallaId, files) : [];

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
      images,
      createdBy: session.bankerId,
      source: "BANKIR",
      status: "TASDIQLANGAN",
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
  const files = getImageFiles(formData);

  if (!LISTING_TYPES.includes(turi)) return { error: "Turi noto'g'ri tanlangan" };
  if (!sarlavha || !tavsif || !manzil || !telefon) {
    return { error: "Hamma majburiy maydonlarni to'ldiring" };
  }
  if (files.length > MAX_IMAGES) return { error: "Ko'pi bilan 2 ta rasm yuklash mumkin" };

  // Uploading new images replaces the old set entirely (same as the old
  // single-image behavior) — leaving files empty keeps whatever's there.
  const images = files.length > 0 ? await saveListingImages(listing.mahallaId, files) : listing.images;

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
      images,
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

// ---- Citizen listings: submit → pending → banker approves/rejects ----

export async function createCitizenListingAction(
  _prevState: ListingState,
  formData: FormData
): Promise<ListingState> {
  const session = await getSession();
  if (!session || session.kind !== "fuqaro") {
    return { error: "Avval tizimga kiring" };
  }

  const mahallaId = String(formData.get("mahallaId") || "");
  if (!mahallaId) return { error: "Mahalla tanlanmagan" };

  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) return { error: "Mahalla topilmadi" };

  const turi = String(formData.get("turi") || "") as ListingType;
  const sarlavha = String(formData.get("sarlavha") || "").trim();
  const tavsif = String(formData.get("tavsif") || "").trim();
  const narxRaw = String(formData.get("narx") || "").trim();
  const manzil = String(formData.get("manzil") || "").trim();
  const telefon = String(formData.get("telefon") || session.phone || "").trim();
  const files = getImageFiles(formData);

  if (!LISTING_TYPES.includes(turi)) return { error: "Turi noto'g'ri tanlangan" };
  if (!sarlavha || !tavsif || !manzil || !telefon) {
    return { error: "Hamma majburiy maydonlarni to'ldiring" };
  }
  if (files.length > MAX_IMAGES) return { error: "Ko'pi bilan 2 ta rasm yuklash mumkin" };

  const images = files.length > 0 ? await saveListingImages(mahallaId, files) : [];

  await prisma.listing.create({
    data: {
      mahallaId,
      turi,
      sarlavha,
      tavsif,
      narx: narxRaw ? Number(narxRaw) : null,
      manzil,
      telefon,
      images,
      citizenName: session.name,
      citizenPhone: session.phone,
      source: "FUQARO",
      status: "KUTILMOQDA",
    },
  });

  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/mening-elonlarim");
  revalidatePath("/bankir");
  return { success: true };
}

export async function approveListingAction(listingId: string) {
  const session = await getSession();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("E'lon topilmadi");
  if (!(await canEditMahalla(session, listing.mahallaId)) || !isBanker(session)) {
    throw new Error("Ruxsat yo'q");
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "TASDIQLANGAN", rejectReason: null },
  });
  await logActivity(session.bankerId, "elon_tasdiqlandi", `elon: ${listingId}`);

  revalidatePath(`/mahallalar/${listing.mahallaId}`);
  revalidatePath("/mening-elonlarim");
  revalidatePath("/bankir");
}

export async function rejectListingAction(listingId: string, reason?: string) {
  const session = await getSession();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("E'lon topilmadi");
  if (!(await canEditMahalla(session, listing.mahallaId)) || !isBanker(session)) {
    throw new Error("Ruxsat yo'q");
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "RAD_ETILGAN", rejectReason: reason?.trim() || null },
  });
  await logActivity(session.bankerId, "elon_rad_etildi", `elon: ${listingId}`);

  revalidatePath(`/mahallalar/${listing.mahallaId}`);
  revalidatePath("/mening-elonlarim");
  revalidatePath("/bankir");
}

export async function deleteOwnListingAction(listingId: string) {
  const session = await getSession();
  if (!session || session.kind !== "fuqaro") throw new Error("Ruxsat yo'q");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("E'lon topilmadi");
  if (listing.source !== "FUQARO" || listing.citizenPhone !== session.phone) {
    throw new Error("Ruxsat yo'q");
  }

  await prisma.listing.delete({ where: { id: listingId } });

  revalidatePath(`/mahallalar/${listing.mahallaId}`);
  revalidatePath("/mening-elonlarim");
}
