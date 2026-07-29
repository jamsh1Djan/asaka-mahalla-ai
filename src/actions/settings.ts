"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";

export type SettingsState = { error?: string; success?: boolean } | null;

export async function updateSystemSettingsAction(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await getSession();
  if (!isAdmin(session)) return { error: "Ruxsat yo'q" };

  const aiPlannerYoqilgan = formData.get("aiPlannerYoqilgan") === "on";

  await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: { aiPlannerYoqilgan },
    create: { id: 1, aiPlannerYoqilgan },
  });

  await logActivity(
    session.bankerId,
    "tizim_sozlamasi_ozgartirildi",
    `AI tavsiyachi: ${aiPlannerYoqilgan ? "yoqildi" : "o'chirildi"}`
  );

  revalidatePath("/admin");
  revalidatePath("/mahallalar/[id]", "page");
  return { success: true };
}
