"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";

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

  await setSession({
    kind: "banker",
    bankerId: acc.id,
    login: acc.login,
    ism: acc.ism,
    role: acc.role,
  });
  redirect(acc.role === "ADMIN" ? "/admin" : "/bankir");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
