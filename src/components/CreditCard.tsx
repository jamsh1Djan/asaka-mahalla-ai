import type { CreditProduct } from "@/lib/data";

export default function CreditCard({ c }: { c: CreditProduct }) {
  return (
    <div className="card card-credit">
      <span className="tag">{c.tag}</span>
      <h4>{c.nomi}</h4>
      <div className="credit-rows">
        <div className="row">
          <span>Miqdori</span>
          <b>{c.miqdori}</b>
        </div>
        <div className="row">
          <span>Muddati</span>
          <b>{c.muddati}</b>
        </div>
        <div className="row">
          <span>Foiz stavkasi</span>
          <b>{c.foiz}</b>
        </div>
        <div className="row">
          <span>Ta&apos;minoti</span>
          <b>{c.taminot}</b>
        </div>
      </div>
      <div className="credit-goal">{c.maqsad}</div>
    </div>
  );
}
