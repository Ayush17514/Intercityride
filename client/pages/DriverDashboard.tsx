import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CarFront,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  CalendarDays,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  XCircle,
  Play,
  Check,
  Trash2,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PublishTripDialog } from "@/components/PublishTripDialog";
import type { Booking, DriverStatsResponse, TripSearchResult, Vehicle } from "@shared/api";
import { toast } from "sonner";

export default function DriverDashboard() {
  const { user, token, switchRole } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DriverStatsResponse | null>(null);
  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [publishOpen, setPublishOpen] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [tripBookings, setTripBookings] = useState<Record<string, Booking[]>>({});

  // Add vehicle state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleModel, setVehicleModel] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<"sedan" | "suv" | "van">("suv");

  const fetchDriverData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, tripsRes, vehiclesRes] = await Promise.all([
        fetch("/api/driver/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/driver/trips", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/driver/vehicles", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (tripsRes.ok) {
        const data = await tripsRes.json();
        setTrips(data.trips || []);
      }
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      toast.error("Failed to load driver dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    // If not driver, prompt to switch
    if (user.role === "passenger") {
      switchRole("driver");
    }
    fetchDriverData();
  }, [user, token]);

  const loadTripBookings = async (tripId: string) => {
    if (expandedTripId === tripId) {
      setExpandedTripId(null);
      return;
    }
    setExpandedTripId(tripId);
    if (!tripBookings[tripId]) {
      try {
        const res = await fetch(`/api/bookings/trip/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTripBookings((prev) => ({ ...prev, [tripId]: data.bookings || [] }));
        }
      } catch (err) {
        console.error("Failed to load passenger roster", err);
      }
    }
  };

  const handleUpdateTripStatus = async (tripId: string, status: "in_progress" | "completed" | "cancelled") => {
    if (!token) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Trip marked as ${status.replace("_", " ")}!`);
        fetchDriverData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update trip status");
      }
    } catch (err) {
      toast.error("Network error updating trip");
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete/cancel this trip?")) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Trip removed successfully.");
        fetchDriverData();
      }
    } catch (err) {
      toast.error("Failed to delete trip");
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch("/api/driver/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          make_model: vehicleModel,
          registration_number: regNumber,
          vehicle_type: vehicleType,
          seat_capacity: vehicleType === "suv" ? 6 : vehicleType === "van" ? 8 : 4,
        }),
      });
      if (res.ok) {
        toast.success("Vehicle registered successfully!");
        setShowAddVehicle(false);
        setVehicleModel("");
        setRegNumber("");
        fetchDriverData();
      } else {
        toast.error("Failed to register vehicle");
      }
    } catch (err) {
      toast.error("Network error registering vehicle");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-wayfare-sand/40 text-wayfare-ink">
      <Navbar />

      <PublishTripDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onAuthRequired={() => {}}
        onTripCreated={fetchDriverData}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Driver Header Banner */}
        <div className="rounded-3xl border border-wayfare-ink/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md text-2xl font-black">
                <CarFront size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
                    {user?.full_name}
                  </h1>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <ShieldCheck size={13} /> Verified Driver
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                  <span>{user?.email}</span>
                  <span>•</span>
                  <span>Base: {user?.city || "Jabalpur"}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPublishOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-wayfare-teal px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-wayfare-ink transition"
              >
                <PlusCircle size={16} /> Publish New Ride
              </button>
              <button
                onClick={() => switchRole("passenger")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Switch to Passenger
              </button>
            </div>
          </div>

          {/* Earnings & Stats KPI Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Total Earnings
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-emerald-700">
                ₹{(stats?.total_earnings || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-2xl bg-wayfare-sand/60 p-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Active Trips
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-teal">
                {stats?.active_trips || trips.filter((t) => t.status === "published").length}
              </p>
            </div>
            <div className="rounded-2xl bg-wayfare-sand/60 p-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Passengers Carried
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
                {stats?.total_passengers || 0}
              </p>
            </div>
            <div className="rounded-2xl bg-wayfare-sand/60 p-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Driver Rating
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-orange">
                ★ {stats?.driver_rating || user?.rating || 4.9}
              </p>
            </div>
          </div>
        </div>

        {/* Trips Management Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-wayfare-ink">
                My Published Trips ({trips.length})
              </h2>
              <p className="text-xs text-slate-500">Manage seats, passenger rosters, and trip status.</p>
            </div>
            <button
              onClick={() => setPublishOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-wayfare-orange px-3.5 py-2 text-xs font-bold text-wayfare-ink shadow hover:opacity-90"
            >
              <PlusCircle size={14} /> Add Trip
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-wayfare-teal border-t-transparent" />
              <p className="mt-3 text-sm font-semibold">Loading your trips…</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CarFront size={32} className="mx-auto text-slate-400" />
              <h3 className="mt-4 font-display text-xl font-extrabold text-wayfare-ink">No trips published yet</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Turn your empty seats into earnings. Publish your next scheduled journey in under 2 minutes!
              </p>
              <button
                onClick={() => setPublishOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-wayfare-teal px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow"
              >
                <PlusCircle size={15} /> Publish My First Ride
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => {
                const isExpanded = expandedTripId === trip.trip_id;
                const roster = tripBookings[trip.trip_id] || [];

                return (
                  <div
                    key={trip.trip_id}
                    className="rounded-3xl border border-wayfare-ink/10 bg-white p-6 shadow-sm transition hover:border-wayfare-teal/40"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${
                              trip.status === "published"
                                ? "bg-emerald-50 text-emerald-700"
                                : trip.status === "in_progress"
                                ? "bg-amber-50 text-amber-700"
                                : trip.status === "full"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {trip.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {trip.kind === "return" ? "Return Journey" : "Direct Trip"}
                          </span>
                        </div>

                        <h3 className="mt-2 font-display text-xl font-extrabold text-wayfare-ink">
                          {trip.origin_city} <span className="text-wayfare-orange">→</span> {trip.destination_city}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} className="text-wayfare-teal" />
                            {new Date(trip.departure_at).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                            , {new Date(trip.departure_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                          </span>
                          <span>•</span>
                          <span>{trip.vehicle_name}</span>
                        </p>
                      </div>

                      {/* Seats & Price */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-display text-xl font-extrabold text-wayfare-teal">
                            ₹{trip.price_per_seat.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400">
                            {trip.available_seats} of {trip.total_seats} seats free
                          </p>
                        </div>

                        {/* Status Controls */}
                        <div className="flex items-center gap-2">
                          {trip.status === "published" && (
                            <button
                              onClick={() => handleUpdateTripStatus(trip.trip_id, "in_progress")}
                              className="flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-sm"
                              title="Start Trip"
                            >
                              <Play size={13} /> Start Ride
                            </button>
                          )}
                          {trip.status === "in_progress" && (
                            <button
                              onClick={() => handleUpdateTripStatus(trip.trip_id, "completed")}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                              title="Complete Trip"
                            >
                              <Check size={13} /> Complete
                            </button>
                          )}
                          <button
                            onClick={() => loadTripBookings(trip.trip_id)}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            <Users size={14} />
                            <span>Passengers</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.trip_id)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Cancel Trip"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Roster Accordion */}
                    {isExpanded && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                          Booked Passengers & PIN Verification
                        </p>
                        {roster.length === 0 ? (
                          <p className="rounded-xl bg-wayfare-sand/50 p-4 text-xs font-semibold text-slate-500 text-center">
                            No bookings yet for this trip. Seats remain available for instant booking.
                          </p>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {roster.map((b) => (
                              <div
                                key={b.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-wayfare-ink">
                                    {b.passenger?.full_name || "Passenger"} ({b.seats} seat)
                                  </span>
                                  <span className="font-mono font-bold text-wayfare-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                    PIN: {b.booking_pin}
                                  </span>
                                </div>
                                <p className="text-slate-500">Pickup: {b.pickup_address}</p>
                                <p className="text-slate-500">Dropoff: {b.dropoff_address}</p>
                                <p className="font-bold text-emerald-700">
                                  Fare Paid: ₹{b.total_price.toLocaleString("en-IN")} via {b.payment_method.toUpperCase()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vehicle Fleet Section */}
        <div className="mt-10 rounded-3xl border border-wayfare-ink/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-extrabold text-wayfare-ink">Registered Fleet Vehicles</h2>
              <p className="text-xs text-slate-500">Vehicles authorized for Wayfare intercity trips.</p>
            </div>
            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="flex items-center gap-1 text-xs font-bold text-wayfare-teal hover:underline"
            >
              <PlusCircle size={15} /> {showAddVehicle ? "Cancel" : "Add Vehicle"}
            </button>
          </div>

          {showAddVehicle && (
            <form onSubmit={handleAddVehicle} className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <p className="text-xs font-extrabold uppercase text-slate-600">Register New Vehicle</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Make & Model (e.g. Honda City)"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-wayfare-teal"
                />
                <input
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="Plate (e.g. MP 20 CD 4455)"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-wayfare-teal"
                />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                >
                  <option value="sedan">Sedan (4 Seats)</option>
                  <option value="suv">SUV (6 Seats)</option>
                  <option value="van">Van (8 Seats)</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-wayfare-teal px-4 py-2 text-xs font-bold text-white shadow hover:bg-wayfare-ink"
              >
                Save Vehicle
              </button>
            </form>
          )}

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {vehicles.map((v) => (
              <div key={v.id} className="rounded-2xl border border-slate-100 bg-wayfare-sand/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-wayfare-ink text-sm">{v.make_model}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Verified
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-500">{v.registration_number}</p>
                <p className="mt-2 text-[11px] text-slate-400 uppercase font-bold">
                  {v.vehicle_type} • {v.seat_capacity} Seat Capacity
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
