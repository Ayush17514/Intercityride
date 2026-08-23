import { FormEvent, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Users,
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  MapPin,
  CarFront,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Booking, PaymentMethod, TripSearchResult } from "@shared/api";
import { toast } from "sonner";

type Props = {
  trip: TripSearchResult | null;
  onClose: () => void;
  onAuthRequired: () => void;
};

export function BookingDialog({ trip, onClose, onAuthRequired }: Props) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [seats, setSeats] = useState(1);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [busy, setBusy] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!trip) return null;

  const pricePerSeat = trip.price_per_seat;
  const subtotal = pricePerSeat * seats;
  const discount = Math.round(subtotal * 0.1); // 10% Smart Match Saver discount
  const finalPrice = subtotal - discount;

  const handleBook = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !token) {
      onClose();
      onAuthRequired();
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId: trip.trip_id,
          seats,
          pickup: trip.origin_city,
          dropoff: trip.destination_city,
          pickup_address: pickupAddress || `${trip.origin_city} Main Station / Center`,
          dropoff_address: dropoffAddress || `${trip.destination_city} Central Point`,
          payment_method: paymentMethod,
        }),
      });

      const payload = await response.json();
      setBusy(false);

      if (!response.ok) {
        toast.error(payload.error || "Unable to complete booking");
        return;
      }

      toast.success("Ride booked successfully!");
      setConfirmedBooking(payload.booking);
    } catch (err) {
      setBusy(false);
      toast.error("Network error during booking");
    }
  };

  const handleGoToBookings = () => {
    onClose();
    navigate("/dashboard/user");
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
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-wayfare-sand transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {!confirmedBooking ? (
          <>
            {/* Header */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-wayfare-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-wayfare-teal">
                <ShieldCheck size={14} /> Instant Confirmation
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
                {trip.origin_city} <span className="text-wayfare-orange">→</span> {trip.destination_city}
              </h2>
            </div>

            {/* Trip summary badge */}
            <div className="mt-4 rounded-2xl bg-wayfare-sand/80 p-4 border border-wayfare-ink/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-wayfare-ink text-sm sm:text-base">{trip.driver_name}</p>
                  <p className="text-xs text-slate-500">{trip.vehicle_name} ({trip.registration_number})</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold text-wayfare-teal">
                    ₹{trip.price_per_seat.toLocaleString("en-IN")}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">per seat</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 border-t border-wayfare-ink/10 pt-2.5 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-wayfare-teal" />
                  {new Date(trip.departure_at).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  , {new Date(trip.departure_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-wayfare-teal" />
                  {trip.available_seats} seats remaining
                </span>
              </div>
            </div>

            <form onSubmit={handleBook} className="mt-5 space-y-3.5">
              {/* Seats Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Number of Passengers / Seats
                </label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-wayfare-teal"
                >
                  {Array.from({ length: Math.min(trip.available_seats, 6) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "seat" : "seats"} (₹{(num * pricePerSeat).toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pickup & Dropoff Address */}
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Pickup Point in {trip.origin_city}
                  </span>
                  <input
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder={`e.g. Near Station, ${trip.origin_city}`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-wayfare-teal"
                  />
                </label>
                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Drop-off in {trip.destination_city}
                  </span>
                  <input
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    placeholder={`e.g. City Center, ${trip.destination_city}`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-wayfare-teal"
                  />
                </label>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: "upi", label: "UPI / QR", icon: QrCode },
                    { id: "card", label: "Card", icon: CreditCard },
                    { id: "wallet", label: "Wallet", icon: Sparkles },
                    { id: "cash", label: "Cash on Board", icon: CarFront },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                          paymentMethod === item.id
                            ? "border-wayfare-teal bg-wayfare-mint/50 font-bold text-wayfare-teal"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={16} />
                        <span className="mt-1 text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fare calculation breakdown */}
              <div className="rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Base fare ({seats} × ₹{pricePerSeat})</span>
                  <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-wayfare-teal font-semibold">
                  <span>Smart Match Saver (10% OFF)</span>
                  <span>- ₹{discount.toLocaleString("en-IN")}</span>
                </div>
                <div className="my-1.5 h-px bg-slate-200" />
                <div className="flex justify-between text-sm font-extrabold text-wayfare-ink">
                  <span>Total Amount</span>
                  <span className="text-wayfare-teal">₹{finalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-wayfare-teal py-3.5 font-bold text-white shadow-md transition hover:bg-wayfare-ink disabled:opacity-60"
              >
                {busy ? "Confirming Seat…" : `Pay & Confirm (₹${finalPrice.toLocaleString("en-IN")})`}
              </button>
            </form>
          </>
        ) : (
          /* Confirmation Success Ticket */
          <div className="text-center py-2">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-wayfare-mint text-wayfare-teal">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="mt-4 font-display text-2xl font-extrabold text-wayfare-ink">
              Seat Confirmed!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Your ticket pass is ready. Please present your booking PIN to the driver upon boarding.
            </p>

            <div className="mt-5 rounded-2xl border-2 border-dashed border-wayfare-teal/40 bg-wayfare-sand/50 p-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Boarding PIN</p>
                  <p className="font-display text-2xl font-extrabold text-wayfare-teal tracking-widest">
                    {confirmedBooking.booking_pin}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Confirmed
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Route:</span>
                  <p className="font-bold text-wayfare-ink">{confirmedBooking.pickup_city} → {confirmedBooking.dropoff_city}</p>
                </div>
                <div>
                  <span className="text-slate-400">Passengers:</span>
                  <p className="font-bold text-wayfare-ink">{confirmedBooking.seats} seat(s)</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Pickup Address:</span>
                  <p className="font-medium text-slate-700">{confirmedBooking.pickup_address}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleGoToBookings}
                className="flex-1 rounded-xl bg-wayfare-teal py-3 text-sm font-bold text-white shadow hover:bg-wayfare-ink flex items-center justify-center gap-1.5"
              >
                <span>View My Bookings</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
