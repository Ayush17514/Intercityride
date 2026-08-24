import { ArrowLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function ComingSoon() {
  const location = useLocation();
  const title = location.state?.label || "This experience";
  return <main className="grid min-h-screen place-items-center bg-wayfare-sand px-5 text-center text-wayfare-ink"><div className="max-w-md"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-wayfare-orange"><Sparkles size={25} /></span><p className="mt-7 text-sm font-bold uppercase tracking-[.18em] text-wayfare-teal">Coming soon</p><h1 className="mt-3 font-display text-4xl font-extrabold">{title} is on the way.</h1><p className="mt-4 leading-7 text-slate-600">We’re polishing this part of Wayfare. Keep exploring the routes that are already live.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-wayfare-teal px-5 py-3 font-bold text-white"><ArrowLeft size={17} /> Back to home</Link></div></main>;
}
