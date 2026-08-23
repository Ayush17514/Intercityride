import { Route, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-wayfare-ink/10 bg-white pt-12 pb-8 text-sm text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 pb-12 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-wayfare-teal text-white">
                <Route size={17} strokeWidth={2.6} />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-wayfare-ink">
                wayfare<span className="text-wayfare-orange">.</span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              India's smart intercity carpooling network. Connecting passengers with drivers already headed along the same route.
            </p>
          </div>

          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-wider text-wayfare-ink">
              Popular Routes
            </p>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link to="/?from=Jabalpur&to=Jaipur" className="hover:text-wayfare-teal">Jabalpur → Jaipur</Link></li>
              <li><Link to="/?from=Mumbai&to=Pune" className="hover:text-wayfare-teal">Mumbai → Pune</Link></li>
              <li><Link to="/?from=Delhi&to=Jaipur" className="hover:text-wayfare-teal">Delhi → Jaipur</Link></li>
              <li><Link to="/?from=Bengaluru&to=Mysuru" className="hover:text-wayfare-teal">Bengaluru → Mysuru</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-wider text-wayfare-ink">
              Dashboards & Portals
            </p>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link to="/dashboard/user" className="hover:text-wayfare-teal">Passenger Bookings</Link></li>
              <li><Link to="/dashboard/driver" className="hover:text-wayfare-teal">Driver Hub & Earnings</Link></li>
              <li><Link to="/dashboard/admin" className="hover:text-wayfare-teal">Admin Control Center</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-wider text-wayfare-ink">
              Trust & Safety
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-wayfare-teal" />
                <span>Verified Drivers & Vehicles</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-wayfare-orange" />
                <span>Secure In-app Pin Verification</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Wayfare Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={13} className="text-red-500 fill-red-500" /> for comfortable intercity journeys.
          </p>
        </div>
      </div>
    </footer>
  );
}
