import { FormEvent, useState } from "react";
import { CarFront, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = { open: boolean; onClose: () => void; onAuthRequired: () => void };

export function PublishTripDialog({ open, onClose, onAuthRequired }: Props) {
  const [origin, setOrigin] = useState("Jabalpur");
  const [destination, setDestination] = useState("Jaipur");
  const [vehicle, setVehicle] = useState("Maruti Suzuki Ertiga");
  const [seats, setSeats] = useState("3");
  const [price, setPrice] = useState("1249");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return setMessage("Connect Supabase environment variables first.");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { onClose(); onAuthRequired(); return; }
    setBusy(true); setMessage("");
    const response = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ origin, destination, vehicle, seats: Number(seats), price: Number(price), departureAt: new Date(Date.now() + 86400000 * 7).toISOString() }) });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(payload.error || "Unable to publish your trip.");
    setMessage("Your trip is live. Passengers can now discover it.");
    setTimeout(onClose, 1200);
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-wayfare-ink/50 px-5 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"><button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-wayfare-sand" aria-label="Close"><X size={18} /></button><div className="mb-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-wayfare-orange text-wayfare-ink"><CarFront size={22} /></span><h2 className="mt-5 font-display text-3xl font-extrabold">Publish your trip</h2><p className="mt-2 text-sm text-slate-500">Tell passengers where you’re already headed.</p></div><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><label className="rounded-xl border border-slate-200 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">From</span><input required value={origin} onChange={e => setOrigin(e.target.value)} className="mt-1 w-full bg-transparent font-bold outline-none" /></label><label className="rounded-xl border border-slate-200 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">To</span><input required value={destination} onChange={e => setDestination(e.target.value)} className="mt-1 w-full bg-transparent font-bold outline-none" /></label><label className="rounded-xl border border-slate-200 p-3 sm:col-span-2"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle</span><input required value={vehicle} onChange={e => setVehicle(e.target.value)} className="mt-1 w-full bg-transparent font-bold outline-none" /></label><label className="rounded-xl border border-slate-200 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Seats available</span><input required type="number" min="1" max="20" value={seats} onChange={e => setSeats(e.target.value)} className="mt-1 w-full bg-transparent font-bold outline-none" /></label><label className="rounded-xl border border-slate-200 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Fare per seat</span><input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full bg-transparent font-bold outline-none" /></label><button disabled={busy} className="mt-2 rounded-xl bg-wayfare-teal py-3.5 font-bold text-white hover:bg-wayfare-ink disabled:opacity-60 sm:col-span-2">{busy ? "Publishing…" : "Publish trip"}</button></form>{message && <p className="mt-4 rounded-xl bg-wayfare-sand px-3 py-2 text-sm font-semibold text-slate-600">{message}</p>}</div></div>;
}
