import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  CarFront,
  Ticket,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  MapPin,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { AdminStatsResponse, Booking, TripSearchResult, UserProfile, Vehicle } from "@shared/api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [activeTab, setActiveTab] = useState<"users" | "vehicles" | "trips" | "bookings">("users");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, usersRes, vehiclesRes, tripsRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/vehicles", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/trips", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.users || []);
      }
      if (vehiclesRes.ok) {
        const v = await vehiclesRes.json();
        setVehicles(v.vehicles || []);
      }
      if (tripsRes.ok) {
        const t = await tripsRes.json();
        setTrips(t.trips || []);
      }
      if (bookingsRes.ok) {
        const b = await bookingsRes.json();
        setBookings(b.bookings || []);
      }
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchAdminData();
  }, [user, token]);

  const handleToggleUserVerification = async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("User verification updated");
        fetchAdminData();
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleToggleVehicleVerification = async (vehicleId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Vehicle verification updated");
        fetchAdminData();
      }
    } catch {
      toast.error("Failed to update vehicle");
    }
  };

  const handleChangeUserRole = async (userId: string, role: "passenger" | "driver" | "admin") => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        toast.success(`Role changed to ${role}`);
        fetchAdminData();
      }
    } catch {
      toast.error("Failed to update role");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-wayfare-sand/40 text-wayfare-ink">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Admin Header Banner */}
        <div className="rounded-3xl border border-purple-200 bg-purple-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-600 text-white shadow-lg">
                <Shield size={28} />
              </div>
              <div>
                <span className="rounded-full bg-purple-800 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                  Platform Oversight & Control
                </span>
                <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold">
                  Wayfare Admin Center
                </h1>
              </div>
            </div>

            <button
              onClick={fetchAdminData}
              className="flex items-center gap-2 rounded-xl bg-purple-800 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
            >
              <RotateCcw size={14} /> Refresh Metrics
            </button>
          </div>

          {/* Stats KPI Cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 border-t border-purple-800/80 pt-6">
            <div className="rounded-2xl bg-purple-800/50 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] font-extrabold uppercase text-purple-300">Platform GMV</span>
              <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-white">
                ₹{(stats?.total_gmv || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-2xl bg-purple-800/50 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] font-extrabold uppercase text-purple-300">Total Bookings</span>
              <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-white">
                {stats?.total_bookings || bookings.length}
              </p>
            </div>
            <div className="rounded-2xl bg-purple-800/50 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] font-extrabold uppercase text-purple-300">Total Users</span>
              <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-white">
                {stats?.total_users || users.length}
              </p>
            </div>
            <div className="rounded-2xl bg-purple-800/50 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] font-extrabold uppercase text-purple-300">Active Drivers</span>
              <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-emerald-400">
                {stats?.total_drivers || users.filter((u) => u.role === "driver").length}
              </p>
            </div>
            <div className="rounded-2xl bg-purple-800/50 p-3.5 backdrop-blur-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-extrabold uppercase text-purple-300">Active Trips</span>
              <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-wayfare-orange">
                {stats?.active_trips || trips.filter((t) => t.status === "published").length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "users" ? "bg-purple-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users size={15} /> Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "vehicles" ? "bg-purple-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CarFront size={15} /> Vehicles ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "trips" ? "bg-purple-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp size={15} /> Platform Trips ({trips.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "bookings" ? "bg-purple-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Ticket size={15} /> Bookings Ledger ({bookings.length})
            </button>
          </div>

          {activeTab === "users" && (
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name/email…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-purple-600"
              />
            </div>
          )}
        </div>

        {/* Tab Content Display */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-700 border-t-transparent" />
              <p className="mt-3 text-sm font-semibold">Loading platform records…</p>
            </div>
          ) : activeTab === "users" ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">City</th>
                      <th className="px-6 py-4">Rating & Trips</th>
                      <th className="px-6 py-4">Verification</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : u.role === "driver"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-teal-100 text-teal-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">{u.city || "—"}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-amber-600">★ {u.rating}</span> ({u.total_trips} rides)
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleUserVerification(u.id)}
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              u.is_verified
                                ? "bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700"
                                : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            <ShieldCheck size={13} />
                            {u.is_verified ? "Verified" : "Unverified (Click)"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value as any)}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs outline-none"
                          >
                            <option value="passenger">Passenger</option>
                            <option value="driver">Driver</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "vehicles" ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {vehicles.map((v) => (
                <div key={v.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{v.make_model}</span>
                    <button
                      onClick={() => handleToggleVehicleVerification(v.id)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        v.is_verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {v.is_verified ? "Verified" : "Pending (Verify)"}
                    </button>
                  </div>
                  <p className="font-mono text-sm font-extrabold text-wayfare-teal">{v.registration_number}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    {v.vehicle_type} • {v.seat_capacity} Seats Capacity
                  </p>
                </div>
              ))}
            </div>
          ) : activeTab === "trips" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {trips.map((t) => (
                <div key={t.trip_id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-purple-700 uppercase">{t.kind} ride</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                      {t.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-extrabold text-base">{t.origin_city} → {t.destination_city}</h4>
                      <p className="text-xs text-slate-500">Driver: {t.driver_name} ({t.vehicle_name})</p>
                      <p className="text-xs text-slate-400">
                        {new Date(t.departure_at).toLocaleDateString("en-IN")} • {t.available_seats} seats free
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-extrabold text-wayfare-teal">
                        ₹{t.price_per_seat.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Booking ID & PIN</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Passenger</th>
                      <th className="px-6 py-4">Fare & Payment</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            PIN: {b.booking_pin}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {b.pickup_city} → {b.dropoff_city} ({b.seats} seat)
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800">{b.passenger?.full_name || "Passenger"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">₹{b.total_price.toLocaleString("en-IN")}</span>{" "}
                          <span className="text-[10px] text-slate-400 uppercase">({b.payment_method})</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
