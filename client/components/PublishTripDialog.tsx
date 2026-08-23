import { FormEvent, useState } from "react";
import { CarFront, X, Plus, Trash2, CalendarDays, MapPin, Sparkles, Navigation } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { TripKind } from "@shared/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
  onTripCreated?: () => void;
};

export function PublishTripDialog({ open, onClose, onAuthRequired, onTripCreated }: Props) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("Jabalpur");
  const [destination, setDestination] = useState("Jaipur");
  const [vehicle, setVehicle] = useState("Maruti Suzuki Ertiga");
  const [seats, setSeats] = useState("3");
  const [price, setPrice] = useState("1249");
  const [kind, setKind] = useState<TripKind>("return");
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  });
  const [departureTime, setDepartureTime] = useState("08:00");
  const [notes, setNotes] = useState("AC vehicle with boot space. Rest stop at mid-way food plaza.");
  const [stops, setStops] = useState<string[]>(["Katni", "Kota"]);

  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleAddStop = () => {
    setStops([...stops, ""]);
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, val: string) => {
    const updated = [...stops];
    updated[index] = val;
    setStops(updated);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !token) {
      onClose();
      onAuthRequired();
      return;
    }

    setBusy(true);
    try {
      const departureDateTime = new Date(`${departureDate}T${departureTime}:00`).toISOString();
      const filteredStops = stops.filter((s) => s.trim() !== "");

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin,
          destination,
          vehicle,
          seats: Number(seats),
          price: Number(price),
          departureAt: departureDateTime,
          kind,
          notes,
          stops: filteredStops,
        }),
      });

      const payload = await response.json();
      setBusy(false);

      if (!response.ok) {
        toast.error(payload.error || "Unable to publish your trip.");
        return;
      }

      toast.success("Trip published successfully! Passengers can now discover it.");
      if (onTripCreated) onTripCreated();
      onClose();
      navigate("/dashboard/driver");
    } catch (err) {
      setBusy(false);
      toast.error("Network error while publishing trip.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-wayfare-ink/60 px-4 py-6 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-wayfare-sand transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-800">
            <CarFront size={14} /> Driver Ride Publisher
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-wayfare-ink">
            Publish an Intercity Trip
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Offer your empty seats to verified travellers and cover your fuel and toll expenses.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Origin & Destination */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block rounded-2xl border border-slate-200 p-3 focus-within:border-wayfare-teal">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <MapPin size={12} className="text-wayfare-orange" /> Origin City
              </span>
              <input
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Jabalpur"
                className="mt-1 w-full bg-transparent font-bold text-sm outline-none"
              />
            </label>

            <label className="block rounded-2xl border border-slate-200 p-3 focus-within:border-wayfare-teal">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Navigation size={12} className="text-wayfare-teal" /> Destination City
              </span>
              <input
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Jaipur"
                className="mt-1 w-full bg-transparent font-bold text-sm outline-none"
              />
            </label>
          </div>

          {/* Intermediate Route Stops */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Intermediate Route Stops (Optional)
              </span>
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-1 text-xs font-bold text-wayfare-teal hover:underline"
              >
                <Plus size={14} /> Add Stop
              </button>
            </div>
            <div className="space-y-2">
              {stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-6">#{index + 1}</span>
                  <input
                    value={stop}
                    onChange={(e) => handleStopChange(index, e.target.value)}
                    placeholder="e.g. Katni / Kota / Sagar"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block rounded-2xl border border-slate-200 p-3">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <CalendarDays size={12} /> Departure Date
              </span>
              <input
                required
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="mt-1 w-full bg-transparent font-bold text-xs sm:text-sm outline-none"
              />
            </label>

            <label className="block rounded-2xl border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Departure Time</span>
              <input
                required
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="mt-1 w-full bg-transparent font-bold text-xs sm:text-sm outline-none"
              />
            </label>
          </div>

          {/* Vehicle, Seats, Price */}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block rounded-2xl border border-slate-200 p-3 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle</span>
              <input
                required
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Make & Model"
                className="mt-1 w-full bg-transparent font-bold text-xs outline-none"
              />
            </label>

            <label className="block rounded-2xl border border-slate-200 p-3 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seats to Offer</span>
              <input
                required
                type="number"
                min="1"
                max="10"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="mt-1 w-full bg-transparent font-bold text-xs sm:text-sm outline-none"
              />
            </label>

            <label className="block rounded-2xl border border-slate-200 p-3 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price per Seat (₹)</span>
              <input
                required
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full bg-transparent font-bold text-xs sm:text-sm text-wayfare-teal outline-none"
              />
            </label>
          </div>

          {/* Trip Type & Notes */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block rounded-2xl border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trip Category</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as TripKind)}
                className="mt-1 w-full bg-transparent font-bold text-xs outline-none"
              >
                <option value="return">Return Journey (Save 50%+)</option>
                <option value="existing">Direct Scheduled Trip</option>
                <option value="fresh_request">Custom Trip</option>
              </select>
            </label>

            <label className="block rounded-2xl border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Luggage & Notes</span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Boot space, AC on"
                className="mt-1 w-full bg-transparent text-xs font-medium outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-2xl bg-wayfare-teal py-3.5 font-bold text-white shadow-lg shadow-wayfare-teal/20 transition hover:bg-wayfare-ink disabled:opacity-60"
          >
            {busy ? "Publishing Trip…" : `Publish Trip (Offer ${seats} Seats at ₹${price}/seat)`}
          </button>
        </form>
      </div>
    </div>
  );
}
