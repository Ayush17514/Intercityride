import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  MapPin,
  Navigation,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  WalletCards,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthDialog } from "@/components/AuthDialog";
import { PublishTripDialog } from "@/components/PublishTripDialog";
import { BookingDialog } from "@/components/BookingDialog";
import { useAuth } from "@/context/AuthContext";
import type { TripSearchResult } from "@shared/api";
import { toast } from "sonner";

export default function Index() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"need" | "going">("need");
  const [origin, setOrigin] = useState(() => searchParams.get("from") || "Jabalpur");
  const [destination, setDestination] = useState(() => searchParams.get("to") || "Jaipur");
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  });
  const [seats, setSeats] = useState(1);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [authOpen, setAuthOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripSearchResult | null>(null);

  // Initial load: fetch popular rides
  const fetchTrips = async (customOrigin?: string, customDest?: string) => {
    setLoading(true);
    setSearchError("");
    setSearched(true);

    try {
      const orig = customOrigin !== undefined ? customOrigin : origin;
      const dest = customDest !== undefined ? customDest : destination;

      const params = new URLSearchParams({
        seats: String(seats),
      });
      if (orig) params.set("origin", orig);
      if (dest) params.set("destination", dest);
      if (date) params.set("date", date);
      if (maxPrice) params.set("maxPrice", String(maxPrice));

      const res = await fetch(`/api/trips/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to search trips.");

      setTrips(data.trips || []);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error loading rides");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchTrips();
  }, []);

  const handleQuickRoute = (fromCity: string, toCity: string) => {
    setOrigin(fromCity);
    setDestination(toCity);
    fetchTrips(fromCity, toCity);
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSearch = () => {
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-wayfare-sand text-wayfare-ink">
      <Navbar />

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <PublishTripDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onAuthRequired={() => setAuthOpen(true)}
        onTripCreated={() => fetchTrips()}
      />
      <BookingDialog
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onAuthRequired={() => setAuthOpen(true)}
      />

      {/* Hero Section */}
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
                onClick={scrollToSearch}
                className="group flex items-center gap-3 rounded-full bg-wayfare-orange px-6 py-3.5 font-bold text-wayfare-ink shadow-xl shadow-wayfare-orange/25 transition hover:-translate-y-0.5 hover:shadow-wayfare-orange/40"
              >
                <span>Find My Ride</span>
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => {
                  if (!user) setAuthOpen(true);
                  else setPublishOpen(true);
                }}
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
                  {trips.length}
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

      {/* Main Search Component */}
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
                onClick={() => {
                  setActiveTab("going");
                  if (!user) setAuthOpen(true);
                  else setPublishOpen(true);
                }}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  activeTab === "going" ? "bg-white text-wayfare-teal shadow-sm" : "text-slate-500"
                }`}
              >
                I'm offering a ride
              </button>
            </div>

            {/* Quick Route Filter Pills */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Quick routes:</span>
              <button
                onClick={() => handleQuickRoute("Jabalpur", "Jaipur")}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-wayfare-mint hover:text-wayfare-teal transition"
              >
                Jabalpur → Jaipur
              </button>
              <button
                onClick={() => handleQuickRoute("Mumbai", "Pune")}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-wayfare-mint hover:text-wayfare-teal transition"
              >
                Mumbai → Pune
              </button>
              <button
                onClick={() => handleQuickRoute("Delhi", "Jaipur")}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-wayfare-mint hover:text-wayfare-teal transition"
              >
                Delhi → Jaipur
              </button>
            </div>
          </div>

          {/* Search Inputs Form */}
          <div className="grid gap-3 py-5 sm:grid-cols-2 md:grid-cols-[1.2fr_1.2fr_170px_140px_auto]">
            {/* From City */}
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal transition">
              <MapPin size={20} className="text-wayfare-orange shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Leaving from
                </span>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Origin City"
                  className="w-full bg-transparent font-extrabold text-sm outline-none text-wayfare-ink"
                />
              </div>
            </label>

            {/* To City */}
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal transition">
              <Navigation size={20} className="text-wayfare-teal shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Heading to
                </span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination City"
                  className="w-full bg-transparent font-extrabold text-sm outline-none text-wayfare-ink"
                />
              </div>
            </label>

            {/* Date */}
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <CalendarDays size={18} className="text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Date
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-xs sm:text-sm outline-none"
                />
              </div>
            </label>

            {/* Seats */}
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <Users size={18} className="text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Seats
                </span>
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

            {/* Submit Button */}
            <button
              onClick={() => fetchTrips()}
              disabled={loading}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-wayfare-teal px-7 font-bold text-white shadow-lg shadow-wayfare-teal/20 transition hover:bg-wayfare-ink disabled:opacity-60"
            >
              <Search size={18} />
              <span className="font-bold">Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {searched && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-wayfare-teal">
                {trips.length} {trips.length === 1 ? "Ride Match Found" : "Ride Matches Found"}
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-wayfare-ink">
                Intercity Rides Available
              </h2>
            </div>
          </div>

          {searchError && (
            <p className="mb-6 rounded-2xl bg-orange-50 px-4 py-3 text-xs sm:text-sm font-semibold text-orange-900">
              {searchError}
            </p>
          )}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-wayfare-teal border-t-transparent" />
              <p className="mt-3 text-sm font-semibold">Finding best intercity matches…</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CarFront size={36} className="mx-auto text-slate-400" />
              <h3 className="mt-4 font-display text-xl font-extrabold text-wayfare-ink">
                No direct rides found for this query
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                No driver has published this exact route yet. You can publish your own trip or check out all rides from your city!
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setDestination("");
                    fetchTrips(origin, "");
                  }}
                  className="rounded-xl bg-wayfare-teal px-4 py-2.5 text-xs font-bold text-white shadow"
                >
                  View All Rides from {origin}
                </button>
                <button
                  onClick={() => {
                    if (!user) setAuthOpen(true);
                    else setPublishOpen(true);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Offer a Ride Instead
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {trips.map((trip) => (
                <article
                  key={trip.trip_id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-wayfare-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-wayfare-ink/5"
                >
                  <div>
                    {/* Badge & Rating Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          trip.kind === "return"
                            ? "bg-wayfare-mint text-wayfare-teal"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {trip.kind === "return" ? "Smart Return Match (Save 55%)" : "Direct Trip"}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-wayfare-orange bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star size={13} fill="currentColor" /> {trip.driver_rating}
                      </span>
                    </div>

                    {/* Route Visual */}
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <div className="text-left">
                        <p className="font-display text-lg font-extrabold text-wayfare-ink">{trip.origin_city}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {new Date(trip.departure_at).toLocaleTimeString("en-IN", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="relative flex flex-1 items-center px-2">
                        <div className="h-px flex-1 bg-wayfare-teal/30" />
                        <span className="mx-2 grid h-8 w-8 place-items-center rounded-full bg-wayfare-mint text-wayfare-teal shadow-sm">
                          <CarFront size={16} />
                        </span>
                        <div className="h-px flex-1 bg-wayfare-teal/30" />
                      </div>

                      <div className="text-right">
                        <p className="font-display text-lg font-extrabold text-wayfare-ink">{trip.destination_city}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {trip.estimated_duration_minutes
                            ? `${Math.floor(trip.estimated_duration_minutes / 60)}h ${
                                trip.estimated_duration_minutes % 60
                              }m`
                            : "Expressway"}
                        </p>
                      </div>
                    </div>

                    {/* Stops display if available */}
                    {trip.stops && trip.stops.length > 2 && (
                      <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="font-semibold text-slate-500">Stops:</span>
                        <span>{trip.stops.slice(1, -1).map((s) => s.city).join(", ")}</span>
                      </div>
                    )}

                    <div className="my-5 h-px bg-slate-100" />

                    {/* Driver info & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-wayfare-teal text-xs font-bold text-white shadow">
                          {trip.driver_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-wayfare-ink flex items-center gap-1">
                            {trip.driver_name}
                            {trip.driver_verified && (
                              <ShieldCheck size={14} className="text-wayfare-teal" title="Verified Driver" />
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{trip.vehicle_name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-2xl font-extrabold text-wayfare-teal">
                            ₹{trip.price_per_seat.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">per seat</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Trigger Footer */}
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-wayfare-sand/80 px-4 py-3 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-wayfare-teal" />
                      {new Date(trip.departure_at).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-wayfare-teal" />
                      {trip.available_seats} seats left
                    </span>
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="flex items-center gap-1 rounded-xl bg-wayfare-teal px-4 py-1.5 font-bold text-white shadow transition hover:bg-wayfare-ink"
                    >
                      <span>Book</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trust & Highlights Section */}
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

      <Footer />
    </div>
  );
}
