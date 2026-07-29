import TotpVerifyForm from "@/components/TotpVerifyForm";

export const metadata = { title: "Ikki bosqichli tasdiqlash — Asaka Mahalla AI" };

export default function TotpVerifyPage() {
  return (
    <section>
      <div className="wrap">
        <div className="modal" style={{ maxWidth: 420, margin: "40px auto" }}>
          <h3>Ikki bosqichli tasdiqlash</h3>
          <p className="sub">
            Hisobingiz 2FA bilan himoyalangan. Davom etish uchun autentifikator ilovangizdagi
            kodni kiriting.
          </p>
          <TotpVerifyForm />
        </div>
      </div>
    </section>
  );
}
