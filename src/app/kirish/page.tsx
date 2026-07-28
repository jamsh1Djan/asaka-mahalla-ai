import LoginTabs from "@/components/LoginTabs";

export const metadata = { title: "Kirish — Asaka Mahalla AI" };

export default async function KirishPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const { rol } = await searchParams;
  const initialTab = rol === "banker" ? "banker" : "fuqaro";

  return (
    <section>
      <div className="wrap">
        <LoginTabs initialTab={initialTab} />
      </div>
    </section>
  );
}
