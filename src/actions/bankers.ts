"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export type AddBankerState = { error?: string; success?: boolean } | null;

export async function addBankerAction(
  _prevState: AddBankerState,
  formData: FormData
): Promise<AddBankerState> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Ruxsat yo'q" };

  const ism = String(formData.get("ism") || "").trim();
  const login = String(formData.get("login") || "").trim();
  const parol = String(formData.get("parol") || "").trim();
  if (!ism || !login || !parol) return { error: "Hamma maydonlarni to'ldiring" };

  const existing = await prisma.banker.findUnique({ where: { login } });
  if (existing) return { error: "Bu login band" };

  const passwordHash = await bcrypt.hash(parol, 10);
  await prisma.banker.create({
    data: { login, passwordHash, role: "BANKER", ism },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function updateBankerCredentialsAction(
  bankerId: string,
  data: { ism?: string; login?: string; parol?: string }
) {
  const session = await getSession();
  if (!isAdmin(session)) throw new Error("Ruxsat yo'q");

  const updateData: { ism?: string; login?: string; passwordHash?: string } = {};
  if (data.ism !== undefined) updateData.ism = data.ism;
  if (data.login !== undefined) updateData.login = data.login;
  if (data.parol) updateData.passwordHash = await bcrypt.hash(data.parol, 10);

  await prisma.banker.update({ where: { id: bankerId }, data: updateData });
  revalidatePath("/admin");
}

export async function toggleBankerMahallaAction(
  bankerId: string,
  mahallaId: string,
  checked: boolean
) {
  const session = await getSession();
  if (!isAdmin(session)) throw new Error("Ruxsat yo'q");

  if (checked) {
    await prisma.bankerMahalla.upsert({
      where: { bankerId_mahallaId: { bankerId, mahallaId } },
      update: {},
      create: { bankerId, mahallaId },
    });
  } else {
    await prisma.bankerMahalla.delete({
      where: { bankerId_mahallaId: { bankerId, mahallaId } },
    });
  }

  revalidatePath("/admin");
}

export type ProfileState = { error?: string; success?: boolean } | null;

export async function saveProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession();
  if (!session || session.kind !== "banker") return { error: "Ruxsat yo'q" };

  const ism = String(formData.get("ism") || "").trim();
  const ishVaqti = String(formData.get("ishVaqti") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const telegram = String(formData.get("telegram") || "").trim();
  if (!ism) return { error: "Ism kiritilishi shart" };

  await prisma.banker.update({
    where: { id: session.bankerId },
    data: { ism, ishVaqti, telefon, telegram },
  });

  revalidatePath("/bankir");
  return { success: true };
}
