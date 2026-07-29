"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  setSession,
  clearSession,
  getSession,
  setPending2fa,
  getPending2fa,
  clearPending2fa,
} from "@/lib/auth";
import { openLoginLog, closeLoginLog } from "@/lib/loginLog";
import { logActivity } from "@/lib/activityLog";
import { verifyTotpCode } from "@/lib/totp";
import type { Banker } from "@prisma/client";

export type AuthState = { error?: string } | null;

export async function citizenLoginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name) return { error: "Ismingizni kiriting" };

  await setSession({ kind: "fuqaro", name, phone });
  redirect("/");
}

async function finishBankerLogin(acc: Banker): Promise<never> {
  const loginLogId = await openLoginLog(acc.id);
  await setSession({
    kind: "banker",
    bankerId: acc.id,
    login: acc.login,
    ism: acc.ism,
    role: acc.role,
    loginLogId,
  });
  await prisma.banker.update({ where: { id: acc.id }, data: { lastLoginAt: new Date() } });
  await logActivity(acc.id, "login", `rol: ${acc.role}`);

  if (acc.mustChangePassword) return redirect("/parol-almashtirish");
  return redirect(acc.role === "ADMIN" ? "/admin" : "/bankir");
}

export async function bankerLoginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "");

  const acc = await prisma.banker.findUnique({ where: { login } });
  if (!acc) return { error: "Login yoki parol noto'g'ri" };

  const ok = await bcrypt.compare(password, acc.passwordHash);
  if (!ok) return { error: "Login yoki parol noto'g'ri" };

  if (acc.status === "BLOKLANGAN") {
    return { error: "Bu hisob bloklangan. Administratorga murojaat qiling." };
  }

  if (acc.totpEnabled) {
    await setPending2fa(acc.id);
    return redirect("/kirish/tasdiqlash");
  }

  return finishBankerLogin(acc);
}

export type TotpState = { error?: string } | null;

export async function verifyTotpAction(
  _prevState: TotpState,
  formData: FormData
): Promise<TotpState> {
  const code = String(formData.get("code") || "").trim();
  const bankerId = await getPending2fa();
  if (!bankerId) return { error: "Sessiya muddati tugadi, qaytadan kiring" };

  const acc = await prisma.banker.findUnique({ where: { id: bankerId } });
  if (!acc || !acc.totpSecret) return { error: "Sessiya muddati tugadi, qaytadan kiring" };

  if (!verifyTotpCode(acc.totpSecret, code)) {
    return { error: "Kod noto'g'ri. Qaytadan urinib ko'ring." };
  }

  await clearPending2fa();
  return finishBankerLogin(acc);
}

export async function logoutAction() {
  const session = await getSession();
  if (session?.kind === "banker") {
    await closeLoginLog(session.loginLogId);
    await logActivity(session.bankerId, "logout");
  }
  await clearSession();
  redirect("/");
}
