import { FormEvent, useState } from "react";
import { X, Mail, LockKeyhole, UserRound, CarFront, Sparkles, Shield, User, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole, VehicleType } from "@shared/api";

type Props = { open: boolean; onClose: () => void };

export function AuthDialog({ open, onClose }: Props) {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole>("passenger");

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Jabalpur");

  // Driver specific inputs
  const [vehicleModel, setVehicleModel] = useState("Maruti Suzuki Ertiga");
  const [vehicleType, setVehicleType] = useState<VehicleType>("suv");
  const [regNumber, setRegNumber] = useState("MP 20 CA 5050");

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    let success = false;
    if (mode === "login") {
      success = await login(email, password);
    } else {
      success = await register({
        email,
        password,
        full_name: name,
        role,
        phone,
        city,
        vehicle_model: role === "driver" ? vehicleModel : undefined,
        vehicle_type: role === "driver" ? vehicleType : undefined,
        registration_number: role === "driver" ? regNumber : undefined,
      });
    }

    setBusy(false);
    if (success) {
      onClose();
    }
  };

  const handleQuickDemo = async (demoRole: "passenger" | "driver" | "admin") => {
    setBusy(true);
    const success = await demoLogin(demoRole);
    setBusy(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-wayfare-ink/60 px-4 py-6 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-wayfare-sand hover:text-wayfare-ink transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-wayfare-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-wayfare-teal">
            <Sparkles size={13} className="text-wayfare-orange" />
            <span>Welcome to Wayfare</span>
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {mode === "login"
              ? "Access your bookings, active rides, and earnings."
              : "Join our intercity community of verified drivers and smart travellers."}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition ${
              mode === "login" ? "bg-white text-wayfare-ink shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition ${
              mode === "signup" ? "bg-white text-wayfare-ink shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register
          </button>
        </div>

        {/* 1-Click Demo Accounts Banner */}
        <div className="mb-5 rounded-2xl border border-dashed border-wayfare-teal/30 bg-wayfare-sand/60 p-3.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-wayfare-teal flex items-center gap-1">
            <Sparkles size={13} className="text-wayfare-orange" /> 1-Click Quick Demo Sign In
          </p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleQuickDemo("passenger")}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-center transition hover:border-wayfare-teal hover:shadow-sm"
            >
              <User size={16} className="text-wayfare-teal" />
              <span className="mt-1 text-xs font-bold text-wayfare-ink">Passenger</span>
              <span className="text-[10px] text-slate-400">Priya K.</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleQuickDemo("driver")}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-center transition hover:border-wayfare-teal hover:shadow-sm"
            >
              <CarFront size={16} className="text-emerald-600" />
              <span className="mt-1 text-xs font-bold text-wayfare-ink">Driver</span>
              <span className="text-[10px] text-slate-400">Arjun M.</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleQuickDemo("admin")}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-center transition hover:border-purple-500 hover:shadow-sm"
            >
              <Shield size={16} className="text-purple-600" />
              <span className="mt-1 text-xs font-bold text-wayfare-ink">Admin</span>
              <span className="text-[10px] text-slate-400">Full Access</span>
            </button>
          </div>
        </div>

        {/* Regular Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  I want to join as
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("passenger")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                      role === "passenger"
                        ? "border-wayfare-teal bg-wayfare-mint/60 text-wayfare-teal"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <User size={15} /> Passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("driver")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                      role === "driver"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CarFront size={15} /> Driver
                  </button>
                </div>
              </div>

              {/* Name */}
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 focus-within:border-wayfare-teal">
                <UserRound size={17} className="text-slate-400 shrink-0" />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </label>

              {/* Phone & City */}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-wayfare-teal">
                  <Phone size={15} className="text-slate-400 shrink-0" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 Phone"
                    className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-wayfare-teal">
                  <MapPin size={15} className="text-slate-400 shrink-0" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (e.g. Jabalpur)"
                    className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none"
                  />
                </label>
              </div>

              {/* Driver-specific fields */}
              {role === "driver" && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                    Vehicle Details
                  </p>
                  <input
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Make & Model (e.g. Maruti Ertiga)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none"
                    >
                      <option value="suv">SUV (6 Seats)</option>
                      <option value="sedan">Sedan (4 Seats)</option>
                      <option value="van">Van (8 Seats)</option>
                      <option value="tempo_traveller">Tempo Traveller</option>
                    </select>
                    <input
                      required
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="Plate (MP 20 CA...)"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 focus-within:border-wayfare-teal">
            <Mail size={17} className="text-slate-400 shrink-0" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-transparent text-sm font-medium outline-none"
            />
          </label>

          {/* Password */}
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 focus-within:border-wayfare-teal">
            <LockKeyhole size={17} className="text-slate-400 shrink-0" />
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm font-medium outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-wayfare-teal py-3.5 font-bold text-white shadow-md transition hover:bg-wayfare-ink disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {message && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
            {message}
          </p>
        )}

        <p className="mt-5 text-center text-xs text-slate-500">
          {mode === "login" ? "New to Wayfare?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
            }}
            className="font-bold text-wayfare-teal hover:underline"
          >
            {mode === "login" ? "Register now" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
