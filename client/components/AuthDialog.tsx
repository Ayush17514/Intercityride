import { FormEvent, useState } from "react";
import { X, Mail, LockKeyhole, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = { open: boolean; onClose: () => void };

export function AuthDialog({ open, onClose }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    if (!supabase) {
      setMessage("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect authentication.");
      setBusy(false);
      return;
    }
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    setMessage(mode === "login" ? "You are signed in." : "Account created. Check your email to confirm your account.");
    if (mode === "login") setTimeout(onClose, 600);
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-wayfare-ink/50 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
      <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-wayfare-sand hover:text-wayfare-ink" aria-label="Close"><X size={18} /></button>
      <div className="mb-7"><p className="text-sm font-bold uppercase tracking-[.16em] text-wayfare-teal">Welcome to wayfare</p><h2 className="mt-2 font-display text-3xl font-extrabold">{mode === "login" ? "Good to see you." : "Start your journey."}</h2><p className="mt-2 text-sm text-slate-500">{mode === "login" ? "Sign in to manage rides and bookings." : "Join a better way to move between cities."}</p></div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"><UserRound size={18} className="text-slate-400" /><input required value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full bg-transparent text-sm outline-none" /></label>}
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"><Mail size={18} className="text-slate-400" /><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full bg-transparent text-sm outline-none" /></label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"><LockKeyhole size={18} className="text-slate-400" /><input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ characters)" className="w-full bg-transparent text-sm outline-none" /></label>
        <button disabled={busy} className="mt-2 w-full rounded-xl bg-wayfare-teal py-3.5 font-bold text-white transition hover:bg-wayfare-ink disabled:opacity-60">{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      </form>
      {message && <p className="mt-4 rounded-xl bg-wayfare-sand px-3 py-2 text-sm font-semibold text-slate-600">{message}</p>}
      <p className="mt-6 text-center text-sm text-slate-500">{mode === "login" ? "New to wayfare?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }} className="font-bold text-wayfare-teal hover:underline">{mode === "login" ? "Sign up" : "Log in"}</button></p>
    </div>
  </div>;
}
