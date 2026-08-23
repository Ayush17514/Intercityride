import { FormEvent, useState } from "react";
import {
  X,
  Mail,
  LockKeyhole,
  UserRound,
  CarFront,
  Sparkles,
  Shield,
  User,
  Phone,
  MapPin,
  FileCheck2,
  KeyRound,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { VehicleType } from "@shared/api";
import { toast } from "sonner";

type Props = { open: boolean; onClose: () => void };

export function AuthDialog({ open, onClose }: Props) {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [role, setRole] = useState<"passenger" | "driver">("passenger");

  // Common Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // Driver specific inputs
  const [nationalId, setNationalId] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("suv");
  const [regNumber, setRegNumber] = useState("");

  // OTP input
  const [otpCode, setOtpCode] = useState("");

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    const success = await login(email, password);
    setBusy(false);
    if (success) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validations
    if (!phone || phone.trim().length < 8) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!city || city.trim().length < 2) {
      setMessage("Please enter your home city.");
      return;
    }
    if (role === "driver") {
      if (!nationalId || nationalId.trim().length < 4) {
        setMessage("Valid National ID or Driving Licence number is required for Driver verification.");
        return;
      }
      if (!vehicleModel || !regNumber) {
        setMessage("Vehicle make/model and license plate registration are required.");
        return;
      }
    }

    setBusy(true);
    setMessage("");

    const result = await register({
      email,
      password,
      full_name: name,
      role,
      phone,
      city,
      national_id: role === "driver" ? nationalId : undefined,
      vehicle_model: role === "driver" ? vehicleModel : undefined,
      vehicle_type: role === "driver" ? vehicleType : undefined,
      registration_number: role === "driver" ? regNumber : undefined,
    });

    setBusy(false);

    if (result.success) {
      if (result.requiresOtp) {
        setMode("otp");
      } else {
        onClose();
      }
    } else if (result.error) {
      setMessage(result.error);
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setMessage("Please enter the verification code sent to your email.");
      return;
    }

    setBusy(true);
    setMessage("");
    const success = await verifyOtp(email, otpCode.trim());
    setBusy(false);

    if (success) {
      onClose();
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setBusy(true);
    await resendOtp(email);
    setBusy(false);
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

        {/* OTP Screen */}
        {mode === "otp" ? (
          <div>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-wayfare-teal mb-4"
            >
              <ArrowLeft size={14} /> Back to details
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-wayfare-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-wayfare-teal">
                <KeyRound size={13} /> Email Verification
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
                Enter Verification Code
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                We've sent a 6-digit OTP code to <strong className="text-wayfare-ink">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  6-Digit OTP / Token
                </span>
                <input
                  required
                  autoFocus
                  type="text"
                  maxLength={10}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center font-mono text-xl font-extrabold tracking-widest outline-none focus:border-wayfare-teal focus:bg-white"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-wayfare-teal py-3.5 font-bold text-white shadow-md transition hover:bg-wayfare-ink disabled:opacity-60"
              >
                {busy ? "Verifying…" : "Verify Account & Sign In"}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-400">Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={busy}
                  className="font-bold text-wayfare-teal hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Resend Code
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-wayfare-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-wayfare-teal">
                <Sparkles size={13} className="text-wayfare-orange" />
                <span>Wayfare Mobility</span>
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                {mode === "login"
                  ? "Sign in with your email and password."
                  : role === "passenger"
                  ? "Register as a Customer to discover and book verified intercity rides."
                  : "Register as a Driver. Requires valid National ID & vehicle documents for admin verification."}
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

            {/* LOGIN FORM */}
            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal transition">
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-transparent text-sm font-medium outline-none text-wayfare-ink"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal transition">
                  <LockKeyhole size={18} className="text-slate-400 shrink-0" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent text-sm font-medium outline-none text-wayfare-ink"
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 w-full rounded-2xl bg-wayfare-teal py-3.5 font-bold text-white shadow-md transition hover:bg-wayfare-ink disabled:opacity-60"
                >
                  {busy ? "Signing in…" : "Sign In"}
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Account Type Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("passenger")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                        role === "passenger"
                          ? "border-wayfare-teal bg-wayfare-mint/60 text-wayfare-teal shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <User size={15} /> Customer (Passenger)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("driver")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                        role === "driver"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <CarFront size={15} /> Driver Partner
                    </button>
                  </div>
                </div>

                {/* Name */}
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3.5 py-2.5 focus-within:border-wayfare-teal transition">
                  <UserRound size={17} className="text-slate-400 shrink-0" />
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Legal Name"
                    className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none"
                  />
                </label>

                {/* Email */}
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3.5 py-2.5 focus-within:border-wayfare-teal transition">
                  <Mail size={17} className="text-slate-400 shrink-0" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none"
                  />
                </label>

                {/* Mobile & Home City */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 focus-within:border-wayfare-teal transition">
                    <Phone size={15} className="text-slate-400 shrink-0" />
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 Mobile Number"
                      className="w-full bg-transparent text-xs font-medium outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 focus-within:border-wayfare-teal transition">
                    <MapPin size={15} className="text-slate-400 shrink-0" />
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Home City (e.g. Jabalpur)"
                      className="w-full bg-transparent text-xs font-medium outline-none"
                    />
                  </label>
                </div>

                {/* Password */}
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3.5 py-2.5 focus-within:border-wayfare-teal transition">
                  <LockKeyhole size={17} className="text-slate-400 shrink-0" />
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (minimum 6 characters)"
                    className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none"
                  />
                </label>

                {/* DRIVER SPECIFIC VERIFICATION FIELDS */}
                {role === "driver" && (
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                        <FileCheck2 size={14} /> Driver Documents & Vehicle Check
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                        Mandatory
                      </span>
                    </div>

                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                        Driving Licence / National ID Proof Number
                      </span>
                      <input
                        required
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        placeholder="e.g. DL-1420110012345 or Aadhaar"
                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                          Vehicle Make & Model
                        </span>
                        <input
                          required
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="e.g. Maruti Suzuki Ertiga"
                          className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-600"
                        />
                      </label>

                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                          Vehicle Type
                        </span>
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                          className="w-full rounded-xl border border-emerald-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-emerald-600"
                        >
                          <option value="suv">SUV (6 Seats)</option>
                          <option value="sedan">Sedan (4 Seats)</option>
                          <option value="van">Van (8 Seats)</option>
                          <option value="tempo_traveller">Tempo Traveller</option>
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                        Vehicle Registration Plate Number
                      </span>
                      <input
                        required
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="e.g. MP 20 CA 4821"
                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-mono font-bold outline-none focus:border-emerald-600"
                      />
                    </label>

                    <p className="text-[10px] text-emerald-800 leading-4">
                      ℹ️ Driver accounts require Admin verification of National ID and vehicle plate before trips can be published.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 w-full rounded-2xl bg-wayfare-teal py-3.5 font-bold text-white shadow-md transition hover:bg-wayfare-ink disabled:opacity-60"
                >
                  {busy ? "Processing…" : `Register as ${role === "driver" ? "Driver Partner" : "Customer"}`}
                </button>
              </form>
            )}
          </>
        )}

        {message && (
          <p className="mt-3.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
            {message}
          </p>
        )}

        {mode !== "otp" && (
          <p className="mt-5 text-center text-xs text-slate-500">
            {mode === "login" ? "New to Wayfare?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setMessage("");
              }}
              className="font-bold text-wayfare-teal hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
