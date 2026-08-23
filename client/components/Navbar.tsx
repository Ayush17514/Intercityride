import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Route,
  CarFront,
  LogOut,
  UserCircle,
  Menu,
  X,
  Shield,
  Briefcase,
  Ticket,
  ChevronDown,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthDialog } from "./AuthDialog";
import { PublishTripDialog } from "./PublishTripDialog";

export function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOfferRide = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (user.role === "passenger") {
      switchRole("driver");
    }
    setPublishOpen(true);
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "driver") return "/dashboard/driver";
    return "/dashboard/user";
  };

  return (
    <>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <PublishTripDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onAuthRequired={() => setAuthOpen(true)}
      />

      <header className="sticky top-0 z-40 border-b border-wayfare-ink/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-wayfare-teal text-white shadow-md shadow-wayfare-teal/20 transition group-hover:scale-105">
              <Route size={19} strokeWidth={2.6} />
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.04em] text-wayfare-ink">
              wayfare<span className="text-wayfare-orange">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <Link
              to="/"
              className={`transition hover:text-wayfare-teal ${
                location.pathname === "/" ? "text-wayfare-teal font-bold" : ""
              }`}
            >
              Find a ride
            </Link>

            <button
              onClick={handleOfferRide}
              className="flex items-center gap-1.5 transition hover:text-wayfare-teal"
            >
              <CarFront size={16} className="text-wayfare-orange" />
              <span>Offer a ride</span>
            </button>

            {user && (
              <>
                <Link
                  to="/dashboard/user"
                  className={`flex items-center gap-1.5 transition hover:text-wayfare-teal ${
                    location.pathname.startsWith("/dashboard/user") ? "text-wayfare-teal font-bold" : ""
                  }`}
                >
                  <Ticket size={15} />
                  <span>My Bookings</span>
                </Link>

                <Link
                  to="/dashboard/driver"
                  className={`flex items-center gap-1.5 transition hover:text-wayfare-teal ${
                    location.pathname.startsWith("/dashboard/driver") ? "text-wayfare-teal font-bold" : ""
                  }`}
                >
                  <Briefcase size={15} />
                  <span>Driver Hub</span>
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/dashboard/admin"
                    className={`flex items-center gap-1.5 transition hover:text-wayfare-teal ${
                      location.pathname.startsWith("/dashboard/admin") ? "text-wayfare-teal font-bold" : ""
                    }`}
                  >
                    <Shield size={15} className="text-purple-600" />
                    <span className="text-purple-700 font-bold">Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Role Badge with Quick Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdown(!roleDropdown)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize transition border ${
                      user.role === "admin"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : user.role === "driver"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-teal-200 bg-teal-50 text-teal-700"
                    }`}
                    title="Click to switch role"
                  >
                    <span>{user.role}</span>
                    <ChevronDown size={12} />
                  </button>

                  {roleDropdown && (
                    <div className="absolute right-0 top-8 z-50 w-44 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Switch Role
                      </p>
                      <button
                        onClick={() => {
                          switchRole("passenger");
                          setRoleDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                          user.role === "passenger" ? "bg-wayfare-mint text-wayfare-teal font-bold" : "hover:bg-slate-50"
                        }`}
                      >
                        <Ticket size={14} /> Passenger
                      </button>
                      <button
                        onClick={() => {
                          switchRole("driver");
                          setRoleDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                          user.role === "driver" ? "bg-emerald-50 text-emerald-700 font-bold" : "hover:bg-slate-50"
                        }`}
                      >
                        <CarFront size={14} /> Driver
                      </button>
                      <button
                        onClick={() => {
                          switchRole("admin");
                          setRoleDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                          user.role === "admin" ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-slate-50"
                        }`}
                      >
                        <Shield size={14} /> Admin
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <UserCircle size={17} className="text-wayfare-teal" />
                  <span>{user.full_name.split(" ")[0]}</span>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="text-sm font-semibold text-slate-600 hover:text-wayfare-teal transition px-3 py-2"
                >
                  Log in
                </button>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="rounded-full bg-wayfare-ink px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-wayfare-teal"
                >
                  Get started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg md:hidden">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenu(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Find a ride
              </Link>
              <button
                onClick={() => {
                  setMobileMenu(false);
                  handleOfferRide();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <CarFront size={16} className="text-wayfare-orange" /> Offer a ride
              </button>

              {user ? (
                <>
                  <div className="my-2 h-px bg-slate-100" />
                  <Link
                    to="/dashboard/user"
                    onClick={() => setMobileMenu(false)}
                    className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Passenger Dashboard
                  </Link>
                  <Link
                    to="/dashboard/driver"
                    onClick={() => setMobileMenu(false)}
                    className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Driver Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/dashboard/admin"
                      onClick={() => setMobileMenu(false)}
                      className="block rounded-xl px-4 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-50"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="my-2 h-px bg-slate-100" />
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs font-bold text-slate-500">
                      Logged in as {user.full_name} ({user.role})
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenu(false);
                        logout();
                      }}
                      className="text-xs font-bold text-red-600"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      setAuthOpen(true);
                    }}
                    className="w-full rounded-xl bg-wayfare-teal py-3 text-center text-sm font-bold text-white shadow"
                  >
                    Sign in / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
