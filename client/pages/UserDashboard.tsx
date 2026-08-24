import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Users,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Booking } from "@shared/api";
import { toast } from "sonner";

export default function UserDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      toast.error("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchBookings();
  }, [user, token]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    if (!token) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel booking");
      } else {
        toast.success("Booking cancelled. Amount refunded to your payment method.");
        fetchBookings();
      }
    } catch (err) {
      toast.error("Network error while cancelling booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-wayfare-sand/40 text-wayfare-ink">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* User Hero Banner */}
        <div className="rounded-3xl border border-wayfare-ink/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-wayfare-teal text-white shadow-md text-2xl font-black">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
                    {user?.full_name}
                  </h1>
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    Passenger
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                  <span>{user?.email}</span>
                  <span>•</span>
                  <span>{user?.city || "Intercity Traveller"}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-wayfare-teal px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-wayfare-ink transition"
              >
                <Search size={15} /> Find New Ride
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-wayfare-sand/50 p-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Bookings</span>
              <p className="mt-1 font-display text-2xl font-extrabold text-wayfare-ink">{bookings.length}</p>
            </div>
            <div className="rounded-2xl bg-wayfare-sand/50 p-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Rides</span>
              <p className="mt-1 font-display text-2xl font-extrabold text-wayfare-teal">{upcomingBookings.length}</p>
            </div>
            <div className="rounded-2xl bg-wayfare-sand/50 p-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Travel Spend</span>
              <p className="mt-1 font-display text-2xl font-extrabold text-wayfare-ink">₹{totalSpent.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-wayfare-sand/50 p-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Passenger Rating</span>
              <p className="mt-1 font-display text-2xl font-extrabold text-wayfare-orange">★ {user?.rating || 5.0}</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "upcoming"
                  ? "bg-wayfare-teal text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Ticket size={15} />
              <span>Active & Upcoming ({upcomingBookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "past"
                  ? "bg-wayfare-teal text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock size={15} />
              <span>Past Trips ({pastBookings.length})</span>
            </button>
          </div>
        </div>

        {/* Bookings Display */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-wayfare-teal border-t-transparent" />
              <p className="mt-3 text-sm font-semibold">Loading your bookings…</p>
            </div>
          ) : activeTab === "upcoming" ? (
            upcomingBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-wayfare-sand text-wayfare-teal">
                  <Ticket size={28} />
                </div>
                <h3 className="mt-4 font-display text-xl font-extrabold text-wayfare-ink">No upcoming trips</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  You don't have any confirmed rides right now. Search for journeys headed your way!
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-wayfare-teal px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-wayfare-ink transition"
                >
                  <Search size={15} /> Find a Ride Now
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="relative overflow-hidden rounded-3xl border border-wayfare-ink/10 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    {/* Status & PIN header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={13} /> {booking.status === "in_progress" ? "Trip In Progress" : "Confirmed"}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Boarding PIN</span>
                        <p className="font-display text-xl font-extrabold tracking-widest text-wayfare-teal">
                          {booking.booking_pin}
                        </p>
                      </div>
                    </div>

                    {/* Journey Route */}
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">From</span>
                        <p className="font-display text-xl font-extrabold text-wayfare-ink">{booking.pickup_city}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[140px] sm:max-w-[180px]">
                          {booking.pickup_address}
                        </p>
                      </div>
                      <div className="flex flex-col items-center px-3">
                        <span className="text-[10px] font-bold text-wayfare-orange uppercase">Direct Match</span>
                        <div className="my-1 flex items-center gap-1 text-wayfare-teal">
                          <div className="h-0.5 w-6 sm:w-10 bg-wayfare-teal/30" />
                          <CarFront size={16} />
                          <div className="h-0.5 w-6 sm:w-10 bg-wayfare-teal/30" />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400">To</span>
                        <p className="font-display text-xl font-extrabold text-wayfare-ink">{booking.dropoff_city}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[140px] sm:max-w-[180px]">
                          {booking.dropoff_address}
                        </p>
                      </div>
                    </div>

                    {/* Driver & Vehicle info */}
                    <div className="mt-5 rounded-2xl bg-wayfare-sand/50 p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-wayfare-ink">{booking.trip?.driver_name || "Wayfare Driver"}</p>
                        <p className="text-[11px] text-slate-500">
                          {booking.trip?.vehicle_name || "Verified Vehicle"} ({booking.trip?.registration_number})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-wayfare-teal">★ {booking.trip?.driver_rating || 4.9}</span>
                        <p className="text-[11px] text-slate-500">{booking.seats} seat(s) booked</p>
                      </div>
                    </div>

                    {/* Timing & Payment */}
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-wayfare-teal" />
                        {booking.trip?.departure_at
                          ? new Date(booking.trip.departure_at).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })
                          : "Scheduled Ride"}
                      </span>
                      <span className="font-display text-base font-extrabold text-wayfare-ink">
                        ₹{booking.total_price.toLocaleString("en-IN")}{" "}
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Paid ({booking.payment_method.toUpperCase()})</span>
                      </span>
                    </div>

                    {/* Cancel action */}
                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? "Cancelling…" : "Cancel Booking"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : pastBookings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <Clock size={32} className="mx-auto text-slate-400" />
              <p className="mt-3 text-sm font-semibold">No past ride history yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm opacity-85">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        booking.status === "completed"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {booking.status === "completed" ? "Trip Completed" : "Cancelled"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(booking.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{booking.pickup_city} → {booking.dropoff_city}</p>
                      <p className="text-xs text-slate-500">{booking.seats} seat(s) • {booking.payment_method.toUpperCase()}</p>
                    </div>
                    <p className="font-display font-bold text-slate-700">₹{booking.total_price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
