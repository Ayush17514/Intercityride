import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Menu,
  Navigation,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  UserCircle,
  LogOut,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { PublishTripDialog } from "@/components/PublishTripDialog";
import { supabase } from "@/lib/supabase";

const trips = [
  {
    type: "Best match",
    typeClass: "bg-wayfare-mint text-wayfare-teal",
    from: "Jabalpur",
    to: "Jaipur",
    date: "Tue, 12 Aug",
    time: "7:00 AM",
    duration: "10h 30m",
    seats: "3 seats left",
    price: "₹1,249",
    oldPrice: "₹2,800",
    saving: "Save 55%",
    driver: "Arjun Mehta",
    rating: "4.9",
    initials: "AM",
    vehicle: "Maruti Suzuki Ertiga",
    route: "Existing return trip",
  },
  {
    type: "Direct trip",
    typeClass: "bg-orange-50 text-orange-700",
    from: "Jabalpur",
    to: "Jaipur",
    date: "Tue, 12 Aug",
    time: "9:30 PM",
    duration: "9h 45m",
    seats: "2 seats left",
    price: "₹1,680",
    oldPrice: "₹2,800",
    saving: "Save 40%",
    driver: "Nikhil Sharma",
    rating: "4.8",
    initials: "NS",
    vehicle: "Toyota Innova Crysta",
    route: "Driver is already going",
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<"need" | "going">("need");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searched, setSearched] = useState(false);
  const [liveTrips, setLiveTrips] = useState<typeof trips>([]);
  const [searchError, setSearchError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setUserEmail(null);
  };

  const scrollToSearch = () => document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  const handleSearch = async () => {
    const origin = (document.querySelector("input[name=origin]") as HTMLInputElement)?.value || "Jabalpur";
    const destination = (document.querySelector("input[name=destination]") as HTMLInputElement)?.value || "Jaipur";
    setSearched(true);
    setSearchError("");
    try {
      const response = await fetch(`/api/trips/search?${new URLSearchParams({ origin, destination, date: "2025-08-12", seats: "1" })}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to search trips.");
      setLiveTrips(payload.trips.map((trip: any) => ({
        type: trip.kind === "return" ? "Best match" : "Direct trip",
        typeClass: trip.kind === "return" ? "bg-wayfare-mint text-wayfare-teal" : "bg-orange-50 text-orange-700",
        from: trip.origin_city, to: trip.destination_city, date: new Date(trip.departure_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
        time: new Date(trip.departure_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }), duration: "Intercity route", seats: `${trip.available_seats} seats left`, price: `₹${Number(trip.price_per_seat).toLocaleString("en-IN")}`, oldPrice: "₹2,800", saving: "Smart fare", driver: trip.driver_name, rating: String(trip.driver_rating), initials: trip.driver_name.split(" ").map((name: string) => name[0]).join("").slice(0, 2), vehicle: trip.vehicle_name, route: trip.kind === "return" ? "Existing return trip" : "Driver is already going",
      })));
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Unable to search trips.");
      setLiveTrips([]);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-wayfare-sand text-wayfare-ink">
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <PublishTripDialog open={publishOpen} onClose={() => setPublishOpen(false)} onAuthRequired={() => setAuthOpen(true)} />
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-wayfare-teal text-white shadow-lg shadow-wayfare-teal/20"><Route size={19} strokeWidth={2.6} /></span>
          <span className="font-display text-xl font-extrabold tracking-[-0.04em]">wayfare<span className="text-wayfare-orange">.</span></span>
        </button>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <button onClick={scrollToSearch} className="transition hover:text-wayfare-teal">Find a ride</button>
          <button onClick={() => setActiveTab("going")} className="transition hover:text-wayfare-teal">Offer a ride</button>
          <a href="#how-it-works" className="transition hover:text-wayfare-teal">How it works</a>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {userEmail ? <div className="flex items-center gap-3"><div className="hidden items-center gap-2 text-sm font-semibold text-slate-600 lg:flex"><UserCircle size={19} className="text-wayfare-teal" /> {userEmail.split("@")[0]}</div><button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-wayfare-teal"><LogOut size={16} /> Log out</button></div> : <><button onClick={() => setAuthOpen(true)} className="text-sm font-semibold text-slate-600">Log in</button><button onClick={() => setAuthOpen(true)} className="rounded-full bg-wayfare-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-wayfare-teal">Get started</button></>}
        </div>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
        {mobileMenu && <div className="absolute left-5 right-5 top-16 rounded-2xl border border-wayfare-ink/10 bg-white p-4 shadow-xl md:hidden"><button onClick={scrollToSearch} className="block w-full rounded-xl px-4 py-3 text-left font-semibold">Find a ride</button><button onClick={() => setActiveTab("going")} className="block w-full rounded-xl px-4 py-3 text-left font-semibold">Offer a ride</button></div>}
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pb-28 lg:pt-16">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-wayfare-mint/70 blur-3xl" />
        <div className="relative grid items-center gap-14 lg:grid-cols-[1.03fr_.97fr] lg:gap-8">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-wayfare-teal/15 bg-white/70 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-wayfare-teal shadow-sm"><Sparkles size={14} className="text-wayfare-orange" /> Travel smarter, together</div>
            <h1 className="max-w-2xl font-display text-[clamp(3.1rem,6vw,5.8rem)] font-extrabold leading-[.98] tracking-[-0.07em]">Go where you're going.<br /><span className="text-wayfare-teal">Pay for the way.</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">Find a seat in a vehicle already headed your way. Lower fares for you, better returns for drivers.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5"><button onClick={scrollToSearch} className="group flex items-center gap-3 rounded-full bg-wayfare-orange px-6 py-3.5 font-bold text-wayfare-ink shadow-xl shadow-wayfare-orange/25 transition hover:-translate-y-0.5 hover:shadow-wayfare-orange/40">Find my ride <ArrowRight size={18} className="transition group-hover:translate-x-1" /></button><button onClick={() => { setActiveTab("going"); setPublishOpen(true); }} className="flex items-center gap-2 font-bold text-wayfare-ink transition hover:text-wayfare-teal"><CarFront size={18} /> I'm going somewhere</button></div>
            <div className="mt-12 flex items-center gap-5 text-sm text-slate-500"><div className="flex -space-x-2"><img className="h-8 w-8 rounded-full border-2 border-wayfare-sand object-cover" src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80" /><img className="h-8 w-8 rounded-full border-2 border-wayfare-sand object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" /><img className="h-8 w-8 rounded-full border-2 border-wayfare-sand object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" /></div><span><strong className="text-wayfare-ink">12,000+</strong> happy travellers</span><span className="hidden h-5 w-px bg-slate-300 sm:block" /><span className="hidden items-center gap-1 sm:flex"><ShieldCheck size={16} className="text-wayfare-teal" /> Verified community</span></div>
          </div>
          <div className="relative min-h-[450px] lg:min-h-[540px]">
            <div className="absolute right-1 top-0 z-10 w-44 rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-xl backdrop-blur sm:right-12"><div className="flex items-center gap-2 text-xs font-bold text-wayfare-teal"><span className="h-2 w-2 rounded-full bg-wayfare-teal" /> LIVE NETWORK</div><p className="mt-2 font-display text-2xl font-extrabold">2,840</p><p className="text-xs text-slate-500">seats moving today</p></div>
            <div className="absolute inset-x-0 top-14 mx-auto h-[410px] max-w-[500px] overflow-hidden rounded-[2.5rem] border-8 border-white bg-[#dcebe3] shadow-2xl shadow-wayfare-ink/15 sm:h-[470px] lg:top-8 lg:h-[500px]">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(28deg, transparent 48%, #a8c8ba 49%, #a8c8ba 50%, transparent 51%), linear-gradient(110deg, transparent 45%, #b8d4c5 46%, #b8d4c5 47%, transparent 48%), radial-gradient(ellipse at 80% 20%, #b3d6bf 0 13%, transparent 14%), radial-gradient(ellipse at 18% 74%, #b6d3c3 0 17%, transparent 18%)", backgroundSize: "180px 180px, 220px 220px, 100% 100%, 100% 100%" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-wayfare-teal/20" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500" fill="none"><path d="M90 400 C130 330 180 360 205 280 S270 190 320 220 S370 170 415 82" stroke="#f59b4a" strokeWidth="5" strokeDasharray="9 10" /><path d="M90 400 C130 330 180 360 205 280 S270 190 320 220 S370 170 415 82" stroke="white" strokeWidth="11" strokeOpacity=".55" /></svg>
              <div className="absolute bottom-[16%] left-[15%] flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-wayfare-ink text-white shadow-lg"><Navigation size={15} fill="currentColor" /></span><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow">Jabalpur</span></div>
              <div className="absolute right-[10%] top-[11%] flex items-center gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow">Jaipur</span><span className="grid h-8 w-8 place-items-center rounded-full bg-wayfare-orange text-wayfare-ink shadow-lg"><MapPin size={15} fill="currentColor" /></span></div>
              <div className="absolute left-[39%] top-[41%] grid h-12 w-12 place-items-center rounded-2xl bg-white text-wayfare-teal shadow-xl"><CarFront size={22} /><span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-wayfare-orange text-[10px] font-extrabold">3</span></div>
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-widest text-wayfare-teal">Your route</p><p className="mt-1 font-display font-extrabold">Jabalpur <span className="text-wayfare-orange">→</span> Jaipur</p></div><span className="rounded-full bg-wayfare-mint px-2.5 py-1 text-xs font-bold text-wayfare-teal">92% match</span></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="search" className="relative z-10 mx-auto max-w-6xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-wayfare-ink/10 bg-white p-3 shadow-2xl shadow-wayfare-ink/10 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-4 sm:px-3"><div className="flex gap-1 rounded-xl bg-wayfare-sand p-1"><button onClick={() => setActiveTab("need")} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeTab === "need" ? "bg-white text-wayfare-teal shadow-sm" : "text-slate-500"}`}>I need to go</button><button onClick={() => setActiveTab("going")} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeTab === "going" ? "bg-white text-wayfare-teal shadow-sm" : "text-slate-500"}`}>I'm going</button></div><span className="hidden items-center gap-1.5 text-xs font-bold text-slate-400 sm:flex"><ShieldCheck size={15} className="text-wayfare-teal" /> All drivers are verified</span></div>
          {activeTab === "need" ? <><div className="grid gap-3 py-5 md:grid-cols-[1fr_1fr_170px_150px_auto]"><label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal"><MapPin size={19} className="text-wayfare-orange" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">From</span><input defaultValue="Jabalpur" name="origin" className="w-full bg-transparent font-bold outline-none" /></span></label><label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-wayfare-teal"><Navigation size={19} className="text-wayfare-teal" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">To</span><input defaultValue="Jaipur" name="destination" className="w-full bg-transparent font-bold outline-none" /></span></label><label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"><CalendarDays size={18} className="text-slate-400" /><span><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">When</span><span className="block whitespace-nowrap text-sm font-bold">12 Aug 2025</span></span></label><label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"><Users size={18} className="text-slate-400" /><span><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Travellers</span><span className="block whitespace-nowrap text-sm font-bold">1 passenger</span></span><ChevronDown size={15} className="ml-auto text-slate-400" /></label><button onClick={handleSearch} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-wayfare-teal px-6 font-bold text-white transition hover:bg-wayfare-ink"><Search size={18} /> <span className="md:hidden lg:inline">Search</span></button></div><div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Sparkles size={14} className="text-wayfare-orange" /> We found 8 existing trips for you</span><button className="font-bold text-wayfare-teal hover:underline">+ Add a return trip</button></div></> : <div className="flex flex-col items-center justify-between gap-5 px-3 py-8 sm:flex-row"><div><p className="font-display text-xl font-extrabold">Turn your empty seats into extra income.</p><p className="mt-1 text-sm text-slate-500">Publish your route in under 2 minutes.</p></div><button onClick={() => setPublishOpen(true)} className="flex items-center gap-2 rounded-xl bg-wayfare-orange px-5 py-3 font-bold">Publish a trip <ArrowRight size={17} /></button></div>}
        </div>
      </section>

      {searched && activeTab === "need" && <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 lg:px-10"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-wayfare-teal">{liveTrips.length} matches found</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Trips going your way</h2></div><button className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold sm:block">Sort: Best match <ChevronDown size={14} className="ml-1 inline" /></button></div>{searchError && <p className="mb-4 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">{searchError}</p>}<div className="grid gap-4 lg:grid-cols-2">{liveTrips.map((trip) => <article key={trip.driver} className="group rounded-3xl border border-wayfare-ink/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-wayfare-ink/10 sm:p-6"><div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${trip.typeClass}`}>{trip.type}</span><span className="flex items-center gap-1 text-xs font-bold text-wayfare-orange"><Star size={14} fill="currentColor" /> {trip.rating}</span></div><div className="mt-6 flex items-center gap-3"><div className="w-20 text-right"><p className="font-display font-extrabold">{trip.from}</p><p className="mt-1 text-xs text-slate-400">{trip.time}</p></div><div className="relative flex flex-1 items-center"><div className="h-px flex-1 bg-wayfare-teal/30" /><span className="mx-2 grid h-7 w-7 place-items-center rounded-full bg-wayfare-mint text-wayfare-teal"><CarFront size={14} /></span><div className="h-px flex-1 bg-wayfare-teal/30" /></div><div className="w-20"><p className="font-display font-extrabold">{trip.to}</p><p className="mt-1 text-xs text-slate-400">{trip.duration}</p></div></div><div className="my-5 h-px bg-slate-100" /><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-wayfare-ink text-sm font-bold text-white">{trip.initials}</div><div><p className="text-sm font-bold">{trip.driver}</p><p className="text-xs text-slate-500">{trip.vehicle}</p></div></div><div className="text-right"><div className="flex items-center gap-2"><span className="text-xs text-slate-400 line-through">{trip.oldPrice}</span><span className="font-display text-xl font-extrabold text-wayfare-teal">{trip.price}</span></div><p className="text-[11px] font-bold text-wayfare-orange">{trip.saving} · per seat</p></div></div><div className="mt-5 flex items-center justify-between rounded-xl bg-wayfare-sand px-3.5 py-2.5 text-xs font-semibold text-slate-600"><span className="flex items-center gap-1.5"><CalendarDays size={14} /> {trip.date}</span><span className="flex items-center gap-1.5"><Users size={14} /> {trip.seats}</span><button className="font-bold text-wayfare-teal">View <ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-1" /></button></div></article>)}</div></section>}

      <section id="how-it-works" className="bg-wayfare-ink px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto max-w-6xl"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-wayfare-orange">The wayfare way</p><h2 className="mt-4 max-w-md font-display text-4xl font-extrabold leading-tight tracking-[-.05em] sm:text-5xl">Match first.<br /><span className="text-wayfare-orange">Book new second.</span></h2><p className="mt-5 max-w-sm leading-7 text-white/60">We start with the journeys that are already happening. It’s better for your wallet, better for drivers, and lighter on the road.</p></div><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-wayfare-orange text-wayfare-ink"><Route size={20} /></span><p className="mt-7 font-display text-lg font-bold">Search</p><p className="mt-2 text-sm leading-6 text-white/55">Tell us where you need to go.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-wayfare-teal text-white"><Sparkles size={20} /></span><p className="mt-7 font-display text-lg font-bold">Compare</p><p className="mt-2 text-sm leading-6 text-white/55">See smart matches ranked for you.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-wayfare-mint text-wayfare-teal"><Check size={20} /></span><p className="mt-7 font-display text-lg font-bold">Book</p><p className="mt-2 text-sm leading-6 text-white/55">Travel with confidence and save.</p></div></div></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"><div className="grid gap-5 md:grid-cols-3"><div className="rounded-3xl bg-wayfare-mint p-7"><WalletCards className="text-wayfare-teal" size={25} /><p className="mt-8 font-display text-2xl font-extrabold">Save up to 55%</p><p className="mt-2 text-sm leading-6 text-slate-600">Pay for the seat you use, not the empty return journey.</p></div><div className="rounded-3xl bg-white p-7 shadow-sm"><ShieldCheck className="text-wayfare-teal" size={25} /><p className="mt-8 font-display text-2xl font-extrabold">People you can trust</p><p className="mt-2 text-sm leading-6 text-slate-600">Identity, licence and vehicle documents checked before every trip.</p></div><div className="rounded-3xl bg-[#fce7d2] p-7"><Clock3 className="text-orange-700" size={25} /><p className="mt-8 font-display text-2xl font-extrabold">More ways to move</p><p className="mt-2 text-sm leading-6 text-slate-600">From Jabalpur to Jaipur, discover routes that fit your life.</p></div></div></section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-wayfare-ink/10 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><span className="font-display text-lg font-extrabold text-wayfare-ink">wayfare<span className="text-wayfare-orange">.</span></span><span>Intercity travel, made more human.</span><span>© 2025 Wayfare</span></footer>
    </main>
  );
}
