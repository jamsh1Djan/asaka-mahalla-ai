import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const metadata = { title: "Parolni almashtirish — Asaka Mahalla AI" };

export default async function ParolAlmashtirishPage() {
  const session = await getSession();
  if (!session || session.kind !== "banker") redirect("/kirish?rol=banker");

  return (
    <section>
      <div className="wrap">
        <div className="modal" style={{ maxWidth: 420, margin: "40px auto" }}>
          <h3>Parolni almashtirish shart</h3>
          <p className="sub">
            Xavfsizlik uchun davom etishdan oldin yangi parol o&apos;rnatishingiz kerak.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </section>
  );
}
