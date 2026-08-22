import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle2, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Trip = { id: string; from: string; to: string; date: string; time: string; price: string; driver: string; vehicle: string; seats: string };
type Props = { trip: Trip | null; onClose: () => void; onAuthRequired: () => void };

export function BookingDialog({ trip, onClose, onAuthRequired }: Props) {
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (!trip) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return setMessage("Connect Supabase environment variables first.");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { onClose(); onAuthRequired(); return; }
    setBusy(true); setMessage("");
    const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ tripId: trip.id, seats, pickup: trip.from, dropoff: trip.to }) });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(payload.error || "Unable to complete this booking.");
    setMessage("Ride booked successfully. Your confirmation is ready.");
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-wayfare-ink/50 px-5 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-wayfare-sand" aria-label="Close"><X size={18} /></button><p className="text-sm font-bold uppercase tracking-[.16em] text-wayfare-teal">Confirm your seat</p><h2 className="mt-2 font-display text-3xl font-extrabold">{trip.from} <span className="text-wayfare-orange">→</span> {trip.to}</h2><div className="mt-5 rounded-2xl bg-wayfare-sand p-4"><div className="flex items-center justify-between"><div><p className="font-bold">{trip.driver}</p><p className="text-sm text-slate-500">{trip.vehicle}</p></div><p className="font-display text-xl font-extrabold text-wayfare-teal">{trip.price}</p></div><div className="mt-4 flex gap-4 border-t border-wayfare-ink/10 pt-3 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5"><CalendarDays size={14} /> {trip.date}, {trip.time}</span><span className="flex items-center gap-1.5"><Users size={14} /> {trip.seats}</span></div></div><form onSubmit={submit} className="mt-5"><label className="block text-sm font-bold">How many seats?<select value={seats} onChange={e => setSeats(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-wayfare-teal"><option value={1}>1 seat</option><option value={2}>2 seats</option><option value={3}>3 seats</option><option value={4}>4 seats</option></select></label><button disabled={busy} className="mt-4 w-full rounded-xl bg-wayfare-teal py-3.5 font-bold text-white hover:bg-wayfare-ink disabled:opacity-60">{busy ? "Booking…" : `Book for ${trip.price}`}</button></form>{message && <p className="mt-4 flex items-start gap-2 rounded-xl bg-wayfare-mint px-3 py-2 text-sm font-semibold text-wayfare-teal"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /> {message}</p>}</div></div>;
}
