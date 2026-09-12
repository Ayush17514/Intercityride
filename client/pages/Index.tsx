import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthDialog } from "@/components/AuthDialog";
import { PublishTripDialog } from "@/components/PublishTripDialog";
import { BookingDialog } from "@/components/BookingDialog";
import { useAuth } from "@/context/AuthContext";
import type { TripSearchResult } from "@shared/api";
import { Hero } from "@/components/home/Hero";
import { SearchForm } from "@/components/home/SearchForm";
import { TripResults } from "@/components/home/TripResults";
import { TrustHighlights } from "@/components/home/TrustHighlights";

export default function Index() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<"need" | "going">("need");
  const [origin, setOrigin] = useState(() => searchParams.get("from") || "Jabalpur");
  const [destination, setDestination] = useState(() => searchParams.get("to") || "Jaipur");
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  });
  const [seats, setSeats] = useState(1);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [authOpen, setAuthOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripSearchResult | null>(null);

  const fetchTrips = async (customOrigin?: string, customDest?: string) => {
    setLoading(true);
    setSearchError("");
    setSearched(true);

    try {
      const orig = customOrigin !== undefined ? customOrigin : origin;
      const dest = customDest !== undefined ? customDest : destination;

      const params = new URLSearchParams({
        seats: String(seats),
      });
      if (orig) params.set("origin", orig);
      if (dest) params.set("destination", dest);
      if (date) params.set("date", date);
      if (maxPrice) params.set("maxPrice", String(maxPrice));

      const res = await fetch(`/api/trips/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to search trips.");

      setTrips(data.trips || []);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error loading rides");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleQuickRoute = (fromCity: string, toCity: string) => {
    setOrigin(fromCity);
    setDestination(toCity);
    fetchTrips(fromCity, toCity);
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSearch = () => {
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOfferRide = () => {
    if (!user) setAuthOpen(true);
    else setPublishOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-wayfare-sand text-wayfare-ink">
      <Navbar />

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <PublishTripDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onAuthRequired={() => setAuthOpen(true)}
        onTripCreated={() => fetchTrips()}
      />
      <BookingDialog
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onAuthRequired={() => setAuthOpen(true)}
      />

      <Hero
        user={user}
        origin={origin}
        destination={destination}
        tripsCount={trips.length}
        onSearchClick={scrollToSearch}
        onDriveClick={handleOfferRide}
      />

      <SearchForm
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        origin={origin}
        setOrigin={setOrigin}
        destination={destination}
        setDestination={setDestination}
        date={date}
        setDate={setDate}
        seats={seats}
        setSeats={setSeats}
        loading={loading}
        onSearch={() => fetchTrips()}
        onQuickRoute={handleQuickRoute}
        onOfferRideClick={handleOfferRide}
      />

      <TripResults
        searched={searched}
        loading={loading}
        trips={trips}
        searchError={searchError}
        origin={origin}
        destination={destination}
        user={user}
        onClearDestination={() => {
          setDestination("");
          fetchTrips(origin, "");
        }}
        onOfferRideClick={handleOfferRide}
        onBookClick={(trip) => setSelectedTrip(trip)}
      />

      <TrustHighlights />

      <Footer />
    </div>
  );
}
