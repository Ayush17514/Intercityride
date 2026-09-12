import { WalletCards, ShieldCheck, Clock3 } from "lucide-react";

export function TrustHighlights() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-wayfare-mint p-8">
          <WalletCards className="text-wayfare-teal" size={28} />
          <h3 className="mt-6 font-display text-2xl font-extrabold text-wayfare-ink">Save Up to 55%</h3>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-700">
            Only pay for the seats you occupy, sharing fuel and toll costs on trips that are already taking place.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <ShieldCheck className="text-wayfare-teal" size={28} />
          <h3 className="mt-6 font-display text-2xl font-extrabold text-wayfare-ink">Verified Trust Network</h3>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-600">
            Government IDs, driver licences, and vehicles are checked with in-app PIN verification on boarding.
          </p>
        </div>

        <div className="rounded-3xl bg-[#fce7d2] p-8">
          <Clock3 className="text-orange-800" size={28} />
          <h3 className="mt-6 font-display text-2xl font-extrabold text-wayfare-ink">Frequent Intercity Routes</h3>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-700">
            From Jabalpur to Jaipur, Mumbai to Pune, discover smooth journeys tailored around real travel schedules.
          </p>
        </div>
      </div>
    </section>
  );
}
