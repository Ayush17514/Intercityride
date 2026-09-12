import { ArrowRight, CarFront, MapPin, Navigation, ShieldCheck, Sparkles } from "lucide-react";
import type { UserProfile } from "@shared/api";

interface HeroProps {
  user: UserProfile | null;
  origin: string;
  destination: string;
  tripsCount: number;
  onSearchClick: () => void;
  onDriveClick: () => void;
}

export function Hero({ user, origin, destination, tripsCount, onSearchClick, onDriveClick }: HeroProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14 overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-wayfare-mint/70 blur-3xl" />

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-wayfare-teal/15 bg-white/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-wayfare-teal shadow-sm">
            <Sparkles size={14} className="text-wayfare-orange" />
            <span>Smart Intercity Mobility</span>
          </div>

          <h1 className="max-w-2xl font-display text-[clamp(2.8rem,5.5vw,5.5rem)] font-extrabold leading-[1.0] tracking-[-0.06em]">
            Go where you're going. <br />
            <span className="text-wayfare-teal">Share the ride & cost.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base sm:text-lg leading-7 text-slate-600">
            Find empty seats in cars already traveling along your route. Verified drivers, instant boarding pass PINs, and up to 55% lower fares than private cabs.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onSearchClick}
              className="group flex items-center gap-3 rounded-full bg-wayfare-orange px-6 py-3.5 font-bold text-wayfare-ink shadow-xl shadow-wayfare-orange/25 transition hover:-translate-y-0.5 hover:shadow-wayfare-orange/40"
            >
              <span>Find My Ride</span>
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={onDriveClick}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 font-bold text-wayfare-ink transition hover:bg-white hover:text-wayfare-teal shadow-sm"
            >
              <CarFront size={18} />
              <span>I'm Driving</span>
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
            <div className="flex -space-x-2">
              <img
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80"
                alt="Passenger"
              />
              <img
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80"
                alt="Driver"
              />
              <img
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80"
                alt="Passenger"
              />
            </div>
            <span>
              <strong className="text-wayfare-ink">14,000+</strong> happy intercity travellers
            </span>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck size={16} /> 100% ID Verified Community
            </span>
          </div>
        </div>

        {/* Interactive Map Visual */}
        <div className="relative min-h-[380px] sm:min-h-[460px]">
          <div className="absolute right-2 top-0 z-10 w-48 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl backdrop-blur sm:right-6">
            <div className="flex items-center gap-2 text-xs font-bold text-wayfare-teal">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE NETWORK</span>
            </div>
            <p className="mt-1 font-display text-2xl font-extrabold text-wayfare-ink">3,240</p>
            <p className="text-[11px] text-slate-500">Seats available today</p>
          </div>

          <div className="absolute inset-0 mx-auto h-full max-w-[480px] overflow-hidden rounded-[2.5rem] border-8 border-white bg-[#dbece4] shadow-2xl shadow-wayfare-ink/10">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 70% 30%, #a8c8ba 0 15%, transparent 16%), radial-gradient(ellipse at 25% 70%, #b3d6bf 0 20%, transparent 21%)",
                backgroundSize: "200px 200px, 100% 100%",
              }}
            />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500" fill="none">
              <path
                d="M90 400 C130 330 180 360 205 280 S270 190 320 220 S370 170 415 82"
                stroke="#f59b4a"
                strokeWidth="5"
                strokeDasharray="9 10"
              />
              <path
                d="M90 400 C130 330 180 360 205 280 S270 190 320 220 S370 170 415 82"
                stroke="white"
                strokeWidth="12"
                strokeOpacity=".6"
              />
            </svg>

            <div className="absolute bottom-[16%] left-[15%] flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-wayfare-ink text-white shadow-lg">
                <Navigation size={15} fill="currentColor" />
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow">
                {origin || "Jabalpur"}
              </span>
            </div>

            <div className="absolute right-[12%] top-[14%] flex items-center gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow">
                {destination || "Jaipur"}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-wayfare-orange text-wayfare-ink shadow-lg">
                <MapPin size={15} fill="currentColor" />
              </span>
            </div>

            <div className="absolute left-[40%] top-[42%] grid h-12 w-12 place-items-center rounded-2xl bg-white text-wayfare-teal shadow-xl">
              <CarFront size={24} />
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-wayfare-orange text-[10px] font-extrabold text-wayfare-ink">
                {tripsCount}
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-wayfare-teal">
                    Popular Route
                  </p>
                  <p className="font-display font-extrabold text-sm sm:text-base">
                    {origin} <span className="text-wayfare-orange">→</span> {destination}
                  </p>
                </div>
                <span className="rounded-full bg-wayfare-mint px-2.5 py-1 text-xs font-bold text-wayfare-teal">
                  95% Match
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
