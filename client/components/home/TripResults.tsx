import { ArrowRight, CalendarDays, CarFront, ShieldCheck, Star, Users } from "lucide-react";
import type { TripSearchResult, UserProfile } from "@shared/api";

interface TripResultsProps {
  searched: boolean;
  loading: boolean;
  trips: TripSearchResult[];
  searchError: string;
  origin: string;
  destination: string;
  user: UserProfile | null;
  onClearDestination: () => void;
  onOfferRideClick: () => void;
  onBookClick: (trip: TripSearchResult) => void;
}

export function TripResults({
  searched,
  loading,
  trips,
  searchError,
  origin,
  destination,
  user,
  onClearDestination,
  onOfferRideClick,
  onBookClick,
}: TripResultsProps) {
  if (!searched) return null;

  return (
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
              onClick={onClearDestination}
              className="rounded-xl bg-wayfare-teal px-4 py-2.5 text-xs font-bold text-white shadow"
            >
              View All Rides from {origin}
            </button>
            <button
              onClick={onOfferRideClick}
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

                {trip.stops && trip.stops.length > 2 && (
                  <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="font-semibold text-slate-500">Stops:</span>
                    <span>{trip.stops.slice(1, -1).map((s) => s.city).join(", ")}</span>
                  </div>
                )}

                <div className="my-5 h-px bg-slate-100" />

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
                          <span title="Verified Driver"><ShieldCheck size={14} className="text-wayfare-teal" /></span>
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
                  onClick={() => onBookClick(trip)}
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
  );
}
