"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";
import { validatePassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/passwordGen";
import type { Role, BankerStatus } from "@prisma/client";

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
  const telefon = String(formData.get("telefon") || "").trim();
  const roleRaw = String(formData.get("role") || "BANKER");
  const role: Role = roleRaw === "ADMIN" ? "ADMIN" : "BANKER";
  const mahallaIds = formData.getAll("mahallaIds").map(String).filter(Boolean);
  if (!ism || !login || !parol) return { error: "Hamma maydonlarni to'ldiring" };

  const passwordIssue = validatePassword(parol);
  if (passwordIssue) return { error: passwordIssue };

  const existing = await prisma.banker.findUnique({ where: { login } });
  if (existing) return { error: "Bu login band" };

  const passwordHash = await bcrypt.hash(parol, 10);
  const created = await prisma.banker.create({
    data: {
      login,
      passwordHash,
      role,
      ism,
      telefon: telefon || null,
      mustChangePassword: true,
      mahallalar: {
        create: mahallaIds.map((mahallaId) => ({ mahallaId, assignedBy: session.bankerId })),
      },
    },
  });

  await logActivity(
    session.bankerId,
    "banker_qoshildi",
    `yangi ${role === "ADMIN" ? "admin" : "bankir"}: ${created.ism} (${login})`
  );
  revalidatePath("/admin");
  // A new banker with mahalla assignments shows up immediately on that
  // mahalla's public "Mahalla bankiri" card and on /mahallalar's own panel.
  if (mahallaIds.length > 0) {
    revalidatePath("/mahallalar/[id]", "page");
    revalidatePath("/mahallalar");
  }
  return { success: true };
}

export async function updateBankerCredentialsAction(
  bankerId: string,
  data: { ism?: string; login?: string; parol?: string; role?: Role }
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Ruxsat yo'q" };
  if (data.role && bankerId === session.bankerId) {
    return { error: "O'z rolingizni bu yerdan o'zgartira olmaysiz" };
  }

  if (data.parol) {
    const passwordIssue = validatePassword(data.parol);
    if (passwordIssue) return { error: passwordIssue };
  }

  const updateData: { ism?: string; login?: string; passwordHash?: string; role?: Role } = {};
  if (data.ism !== undefined) updateData.ism = data.ism;
  if (data.login !== undefined) updateData.login = data.login;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.parol) updateData.passwordHash = await bcrypt.hash(data.parol, 10);

  await prisma.banker.update({ where: { id: bankerId }, data: updateData });

  const changed = Object.keys(updateData).join(", ");
  await logActivity(session.bankerId, "banker_ozgartirildi", `bankir: ${bankerId} (${changed})`);
  revalidatePath("/admin");
  // A name change shows up on every mahalla page this banker is assigned to
  // (the "Mahalla bankiri" card) — revalidating every mahalla detail page
  // at once is simpler and just as correct as looking up which ones apply.
  if (updateData.ism !== undefined) {
    revalidatePath("/mahallalar/[id]", "page");
    revalidatePath("/mahallalar");
  }
  return {};
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
      update: { assignedAt: new Date(), assignedBy: session.bankerId },
      create: { bankerId, mahallaId, assignedBy: session.bankerId },
    });
  } else {
    await prisma.bankerMahalla.delete({
      where: { bankerId_mahallaId: { bankerId, mahallaId } },
    });
  }

  await logActivity(
    session.bankerId,
    "banker_ozgartirildi",
    `bankir: ${bankerId}, mahalla ${checked ? "biriktirildi" : "olib tashlandi"}: ${mahallaId}`
  );
  revalidatePath("/admin");
  // Assigning/unassigning a banker changes what that mahalla's public
  // "Mahalla bankiri" card shows — either the new banker's info, or
  // "hali biriktirilmagan" once removed.
  revalidatePath(`/mahallalar/${mahallaId}`);
  revalidatePath("/mahallalar");
}

export async function toggleBankerStatusAction(bankerId: string, status: BankerStatus) {
  const session = await getSession();
  if (!isAdmin(session)) throw new Error("Ruxsat yo'q");
  if (bankerId === session.bankerId) throw new Error("O'zingizni bloklay olmaysiz");

  await prisma.banker.update({ where: { id: bankerId }, data: { status } });
  await logActivity(
    session.bankerId,
    "banker_ozgartirildi",
    `bankir: ${bankerId}, status: ${status}`
  );
  revalidatePath("/admin");
}

/** Permanently removes a banker/admin account (not just blocking it).
 * Their mahalla assignments, listings, and login history cascade-delete with
 * them (see schema); past ActivityLog rows are kept with bankerId set to
 * null so the audit trail survives the deletion. */
export async function deleteBankerAction(bankerId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Ruxsat yo'q" };
  if (bankerId === session.bankerId) return { error: "O'zingizni o'chira olmaysiz" };

  const target = await prisma.banker.findUnique({ where: { id: bankerId } });
  if (!target) return { error: "Bankir topilmadi" };

  if (target.role === "ADMIN") {
    const adminCount = await prisma.banker.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { error: "Tizimda kamida bitta Super Admin qolishi kerak" };
    }
  }

  await prisma.banker.delete({ where: { id: bankerId } });

  await logActivity(
    session.bankerId,
    "banker_ochirildi",
    `o'chirildi: ${target.ism} (${target.login})`
  );
  revalidatePath("/admin");
  // Their mahalla assignments cascade-delete with them — every mahalla they
  // were on now needs to show "hali biriktirilmagan" instead of their name.
  revalidatePath("/mahallalar/[id]", "page");
  revalidatePath("/mahallalar");
  return {};
}

export type ResetPasswordResult = { error: string } | { tempPassword: string };

/** Generates a random temporary password, stores only its hash, and returns the
 * plaintext exactly once so the admin can hand it to the user out-of-band.
 * It is never written to any log — only "parol reset qilindi" is recorded. */
export async function resetBankerPasswordAction(bankerId: string): Promise<ResetPasswordResult> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Ruxsat yo'q" };

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.banker.update({
    where: { id: bankerId },
    data: { passwordHash, mustChangePassword: true },
  });

  await logActivity(session.bankerId, "parol_reset_qilindi", `bankir: ${bankerId}`);
  revalidatePath("/admin");
  return { tempPassword };
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

  await logActivity(session.bankerId, "profil_yangilandi");
  revalidatePath("/bankir");
  // ism/telefon/ishVaqti/telegram all show on the public "Mahalla bankiri"
  // card of every mahalla this banker is assigned to.
  revalidatePath("/mahallalar/[id]", "page");
  revalidatePath("/mahallalar");
  return { success: true };
}

export type ChangePasswordState = { error?: string } | null;

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getSession();
  if (!session || session.kind !== "banker") return { error: "Ruxsat yo'q" };

  const yangiParol = String(formData.get("yangiParol") || "");
  const tasdiqlash = String(formData.get("tasdiqlash") || "");
  if (yangiParol !== tasdiqlash) return { error: "Parollar mos kelmadi" };

  const passwordIssue = validatePassword(yangiParol);
  if (passwordIssue) return { error: passwordIssue };

  const passwordHash = await bcrypt.hash(yangiParol, 10);
  await prisma.banker.update({
    where: { id: session.bankerId },
    data: { passwordHash, mustChangePassword: false },
  });

  await logActivity(session.bankerId, "parol_ozgartirildi");

  redirect(session.role === "ADMIN" ? "/admin" : "/bankir");
}
