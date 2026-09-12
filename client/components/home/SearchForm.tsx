import { CalendarDays, MapPin, Navigation, Search, Users } from "lucide-react";
import type { UserProfile } from "@shared/api";

interface SearchFormProps {
  user: UserProfile | null;
  activeTab: "need" | "going";
  setActiveTab: (tab: "need" | "going") => void;
  origin: string;
  setOrigin: (origin: string) => void;
  destination: string;
  setDestination: (destination: string) => void;
  date: string;
  setDate: (date: string) => void;
  seats: number;
  setSeats: (seats: number) => void;
  loading: boolean;
  onSearch: () => void;
  onQuickRoute: (from: string, to: string) => void;
  onOfferRideClick: () => void;
}

export function SearchForm({
  user,
  activeTab,
  setActiveTab,
  origin,
  setOrigin,
  destination,
  setDestination,
  date,
  setDate,
  seats,
  setSeats,
  loading,
  onSearch,
  onQuickRoute,
  onOfferRideClick,
}: SearchFormProps) {
  return (
    <section id="search" className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-[2.5rem] border border-wayfare-ink/10 bg-white p-4 shadow-2xl shadow-wayfare-ink/10 sm:p-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex gap-1 rounded-2xl bg-wayfare-sand p-1">
            <button
              type="button"
              onClick={() => setActiveTab("need")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "need" ? "bg-white text-wayfare-teal shadow-sm" : "text-slate-500"
              }`}
            >
              I need a ride
            </button>
            <button
              type="button"
              onClick={onOfferRideClick}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "going" ? "bg-white text-wayfare-teal shadow-sm" : "text-slate-500"
              }`}
            >
              I'm offering a ride
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Quick routes:</span>
            <button
              onClick={() => onQuickRoute("Jabalpur", "Jaipur")}
              className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-wayfare-mint hover:text-wayfare-teal transition"
            >
              Jabalpur → Jaipur
            </button>
            <button
              onClick={() => onQuickRoute("Mumbai", "Pune")}
              className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-wayfare-mint hover:text-wayfare-teal transition"
            >
              Mumbai → Pune
            </button>
            <button
              onClick={() => onQuickRoute("Delhi", "Jaipur")}
              className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-wayfare-mint hover:text-wayfare-teal transition"
            >
              Delhi → Jaipur
            </button>
          </div>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-2 md:grid-cols-[1.2fr_1.2fr_170px_140px_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal transition">
            <MapPin size={20} className="text-wayfare-orange shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Leaving from</span>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin City"
                className="w-full bg-transparent font-extrabold text-sm outline-none text-wayfare-ink"
              />
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal transition">
            <Navigation size={20} className="text-wayfare-teal shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Heading to</span>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination City"
                className="w-full bg-transparent font-extrabold text-sm outline-none text-wayfare-ink"
              />
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <CalendarDays size={18} className="text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent font-bold text-xs sm:text-sm outline-none"
              />
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Users size={18} className="text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Seats</span>
              <select
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full bg-transparent font-bold text-xs sm:text-sm outline-none"
              >
                <option value={1}>1 Seat</option>
                <option value={2}>2 Seats</option>
                <option value={3}>3 Seats</option>
                <option value={4}>4 Seats</option>
              </select>
            </div>
          </label>

          <button
            onClick={onSearch}
            disabled={loading}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-wayfare-teal px-7 font-bold text-white shadow-lg shadow-wayfare-teal/20 transition hover:bg-wayfare-ink disabled:opacity-60"
          >
            <Search size={18} />
            <span className="font-bold">Search</span>
          </button>
        </div>
      </div>
    </section>
  );
}
