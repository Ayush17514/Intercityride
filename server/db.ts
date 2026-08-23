import crypto from "node:crypto";
import type {
  AdminStatsResponse,
  Booking,
  BookingStatus,
  DriverStatsResponse,
  PaymentMethod,
  PaymentStatus,
  RouteStop,
  Trip,
  TripKind,
  TripSearchResult,
  TripStatus,
  UserProfile,
  UserRole,
  Vehicle,
  VehicleType,
} from "@shared/api";

export interface UserRecord extends UserProfile {
  password_hash: string;
}

// Self-contained Database Store
class DatabaseStore {
  public users: UserRecord[] = [];
  public vehicles: Vehicle[] = [];
  public trips: Trip[] = [];
  public routeStops: RouteStop[] = [];
  public bookings: Booking[] = [];

  constructor() {
    this.seed();
  }

  public hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  public generateId(): string {
    return crypto.randomUUID();
  }

  public generateToken(userId: string): string {
    const payload = `${userId}:${Date.now()}`;
    const sig = crypto.createHmac("sha256", "wayfare-secret-key-2025").update(payload).digest("hex").slice(0, 16);
    return Buffer.from(`${payload}:${sig}`).toString("base64");
  }

  public verifyToken(token: string): UserRecord | null {
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const [userId, timestamp, sig] = decoded.split(":");
      if (!userId || !timestamp || !sig) return null;
      const expectedSig = crypto.createHmac("sha256", "wayfare-secret-key-2025").update(`${userId}:${timestamp}`).digest("hex").slice(0, 16);
      if (sig !== expectedSig) return null;
      return this.users.find((u) => u.id === userId) || null;
    } catch {
      return null;
    }
  }

  private seed() {
    const now = new Date();
    const futureDate = (days: number, hour = 8, min = 0) => {
      const d = new Date(now.getTime() + days * 86400000);
      d.setHours(hour, min, 0, 0);
      return d.toISOString();
    };

    // Preloaded users
    const passengerId = "00000000-0000-0000-0000-000000000003";
    const driver1Id = "00000000-0000-0000-0000-000000000001";
    const driver2Id = "00000000-0000-0000-0000-000000000002";
    const adminId = "00000000-0000-0000-0000-000000000099";

    this.users = [
      {
        id: passengerId,
        email: "passenger@wayfare.com",
        password_hash: this.hashPassword("password123"),
        full_name: "Priya Kapoor",
        phone: "+91 98222 11334",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
        role: "passenger",
        city: "Jaipur",
        rating: 5.0,
        total_trips: 4,
        is_verified: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: driver1Id,
        email: "driver@wayfare.com",
        password_hash: this.hashPassword("password123"),
        full_name: "Arjun Mehta",
        phone: "+91 98765 43210",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
        role: "driver",
        city: "Jabalpur",
        national_id: "DL-142011004821",
        rating: 4.9,
        total_trips: 128,
        is_verified: true,
        created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
      },
      {
        id: driver2Id,
        email: "nikhil@wayfare.com",
        password_hash: this.hashPassword("password123"),
        full_name: "Nikhil Sharma",
        phone: "+91 98111 22334",
        avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&q=80",
        role: "driver",
        city: "Jabalpur",
        national_id: "DL-142011009173",
        rating: 4.8,
        total_trips: 86,
        is_verified: true,
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      },
      {
        id: adminId,
        email: "admin@wayfare.com",
        password_hash: this.hashPassword("admin123"),
        full_name: "Admin Control",
        phone: "+91 99999 00000",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        role: "admin",
        city: "New Delhi",
        rating: 5.0,
        total_trips: 0,
        is_verified: true,
        created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
      },
    ];

    // Preloaded vehicles
    const vehicle1Id = "10000000-0000-0000-0000-000000000001";
    const vehicle2Id = "10000000-0000-0000-0000-000000000002";

    this.vehicles = [
      {
        id: vehicle1Id,
        driver_id: driver1Id,
        make_model: "Maruti Suzuki Ertiga",
        vehicle_type: "suv",
        registration_number: "MP 20 CA 4821",
        seat_capacity: 6,
        is_verified: true,
        created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
      },
      {
        id: vehicle2Id,
        driver_id: driver2Id,
        make_model: "Toyota Innova Crysta",
        vehicle_type: "suv",
        registration_number: "MP 20 CB 9173",
        seat_capacity: 6,
        is_verified: true,
        created_at: new Date(Date.now() - 80 * 86400000).toISOString(),
      },
    ];

    // Preloaded trips
    const trip1Id = "20000000-0000-0000-0000-000000000001";
    const trip2Id = "20000000-0000-0000-0000-000000000002";
    const trip3Id = "20000000-0000-0000-0000-000000000003";

    this.trips = [
      {
        id: trip1Id,
        driver_id: driver1Id,
        vehicle_id: vehicle1Id,
        kind: "return",
        status: "published",
        origin_city: "Jabalpur",
        destination_city: "Jaipur",
        departure_at: futureDate(1, 7, 0),
        return_at: futureDate(4, 18, 0),
        total_seats: 4,
        available_seats: 3,
        price_per_seat: 1249,
        estimated_duration_minutes: 630,
        notes: "Returning from Jaipur after business meetings. Clean AC car, boot space available.",
        created_at: new Date().toISOString(),
      },
      {
        id: trip2Id,
        driver_id: driver2Id,
        vehicle_id: vehicle2Id,
        kind: "existing",
        status: "published",
        origin_city: "Jabalpur",
        destination_city: "Jaipur",
        departure_at: futureDate(1, 21, 30),
        total_seats: 4,
        available_seats: 2,
        price_per_seat: 1680,
        estimated_duration_minutes: 585,
        notes: "Direct overnight expressway route. One 20-min dinner stop at Sagar bypass.",
        created_at: new Date().toISOString(),
      },
      {
        id: trip3Id,
        driver_id: driver1Id,
        vehicle_id: vehicle1Id,
        kind: "existing",
        status: "published",
        origin_city: "Mumbai",
        destination_city: "Pune",
        departure_at: futureDate(2, 9, 0),
        total_seats: 4,
        available_seats: 4,
        price_per_seat: 450,
        estimated_duration_minutes: 180,
        notes: "Via Mumbai-Pune Expressway. Pickup available near Dadar and Chembur.",
        created_at: new Date().toISOString(),
      },
    ];

    this.routeStops = [
      { id: this.generateId(), trip_id: trip1Id, stop_order: 0, city: "Jabalpur", arrival_offset_minutes: 0 },
      { id: this.generateId(), trip_id: trip1Id, stop_order: 1, city: "Katni", arrival_offset_minutes: 90 },
      { id: this.generateId(), trip_id: trip1Id, stop_order: 2, city: "Kota", arrival_offset_minutes: 450 },
      { id: this.generateId(), trip_id: trip1Id, stop_order: 3, city: "Jaipur", arrival_offset_minutes: 630 },
      { id: this.generateId(), trip_id: trip2Id, stop_order: 0, city: "Jabalpur", arrival_offset_minutes: 0 },
      { id: this.generateId(), trip_id: trip2Id, stop_order: 1, city: "Sagar", arrival_offset_minutes: 150 },
      { id: this.generateId(), trip_id: trip2Id, stop_order: 2, city: "Jaipur", arrival_offset_minutes: 585 },
    ];

    this.bookings = [
      {
        id: "30000000-0000-0000-0000-000000000001",
        trip_id: trip1Id,
        passenger_id: passengerId,
        seats: 1,
        pickup_city: "Jabalpur",
        dropoff_city: "Jaipur",
        pickup_address: "Russell Chowk, Jabalpur",
        dropoff_address: "Sindhi Camp, Jaipur",
        total_price: 1249,
        payment_method: "upi",
        payment_status: "paid",
        booking_pin: "4821",
        status: "confirmed",
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ];
  }

  public enrichTrip(trip: Trip): TripSearchResult {
    const driver = this.users.find((u) => u.id === trip.driver_id);
    const vehicle = this.vehicles.find((v) => v.id === trip.vehicle_id);
    const stops = this.routeStops.filter((s) => s.trip_id === trip.id).sort((a, b) => a.stop_order - b.stop_order);

    return {
      trip_id: trip.id,
      driver_id: trip.driver_id,
      driver_name: driver?.full_name ?? "Wayfare Driver",
      driver_rating: driver?.rating ?? 4.9,
      driver_verified: driver?.is_verified ?? true,
      driver_phone: driver?.phone,
      vehicle_name: vehicle?.make_model ?? "Verified Sedan/SUV",
      vehicle_type: vehicle?.vehicle_type ?? "suv",
      registration_number: vehicle?.registration_number ?? "Verified Plate",
      kind: trip.kind,
      status: trip.status,
      origin_city: trip.origin_city,
      destination_city: trip.destination_city,
      departure_at: trip.departure_at,
      available_seats: trip.available_seats,
      total_seats: trip.total_seats,
      price_per_seat: trip.price_per_seat,
      match_score: trip.kind === "return" ? 95 : 85,
      estimated_duration_minutes: trip.estimated_duration_minutes,
      notes: trip.notes,
      stops,
    };
  }

  public enrichBooking(booking: Booking): Booking {
    const trip = this.trips.find((t) => t.id === booking.trip_id);
    const passenger = this.users.find((u) => u.id === booking.passenger_id);
    const enrichedTrip = trip ? this.enrichTrip(trip) : undefined;

    return {
      ...booking,
      trip: enrichedTrip,
      passenger: passenger
        ? {
            id: passenger.id,
            full_name: passenger.full_name,
            email: passenger.email,
            phone: passenger.phone,
            rating: passenger.rating,
          }
        : undefined,
    };
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.users.find((u) => u.id === id);
  }

  public createUser(data: {
    email: string;
    password: string;
    full_name: string;
    role: "passenger" | "driver";
    phone: string;
    city: string;
    national_id?: string;
    vehicle_model?: string;
    vehicle_type?: VehicleType;
    registration_number?: string;
  }): { user: UserProfile; token: string } {
    if (data.role as string === "admin") {
      throw new Error("Admin registration is not permitted.");
    }

    const existing = this.findUserByEmail(data.email);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    // Driver requirements
    if (data.role === "driver") {
      if (!data.national_id || data.national_id.trim().length < 4) {
        throw new Error("A valid National ID or Driving Licence number is required for Driver registration.");
      }
      if (!data.vehicle_model || !data.registration_number) {
        throw new Error("Vehicle Make, Model, and Registration Plate are required for Driver registration.");
      }
    }

    const userId = this.generateId();
    const isDriver = data.role === "driver";

    const newUser: UserRecord = {
      id: userId,
      email: data.email.toLowerCase(),
      password_hash: this.hashPassword(data.password),
      full_name: data.full_name,
      phone: data.phone,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.full_name)}`,
      role: data.role,
      city: data.city,
      national_id: data.national_id,
      rating: 5.0,
      total_trips: 0,
      is_verified: !isDriver, // Customers auto-verified; Drivers start unverified pending admin check
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);

    if (isDriver && data.vehicle_model) {
      const vehicleId = this.generateId();
      this.vehicles.push({
        id: vehicleId,
        driver_id: userId,
        make_model: data.vehicle_model,
        vehicle_type: data.vehicle_type || "suv",
        registration_number: data.registration_number!,
        seat_capacity: 6,
        is_verified: false,
        created_at: new Date().toISOString(),
      });
    }

    const token = this.generateToken(userId);
    const { password_hash, ...profile } = newUser;
    return { user: profile, token };
  }

  public login(email: string, password: string): { user: UserProfile; token: string } {
    const user = this.findUserByEmail(email);
    if (!user) {
      throw new Error("No account found with this email.");
    }
    const hash = this.hashPassword(password);
    if (user.password_hash !== hash) {
      throw new Error("Incorrect password.");
    }

    const token = this.generateToken(user.id);
    const { password_hash, ...profile } = user;
    return { user: profile, token };
  }

  public updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, "full_name" | "phone" | "city" | "avatar_url" | "national_id">>
  ): UserProfile {
    const user = this.findUserById(userId);
    if (!user) throw new Error("User not found");
    if (updates.full_name) user.full_name = updates.full_name;
    if (updates.phone) user.phone = updates.phone;
    if (updates.city) user.city = updates.city;
    if (updates.avatar_url) user.avatar_url = updates.avatar_url;
    if (updates.national_id) user.national_id = updates.national_id;
    const { password_hash, ...profile } = user;
    return profile;
  }

  public switchUserRole(userId: string, targetRole: UserRole, adminUser?: UserRecord): UserProfile {
    const user = this.findUserById(userId);
    if (!user) throw new Error("User not found");

    // Only Admin can grant admin role
    if (targetRole === "admin" && adminUser?.role !== "admin") {
      throw new Error("Only an administrator can assign the admin role.");
    }

    user.role = targetRole;
    const { password_hash, ...profile } = user;
    return profile;
  }

  public searchTrips(query: {
    origin?: string;
    destination?: string;
    date?: string;
    seats?: number;
    maxPrice?: number;
    kind?: string;
  }): TripSearchResult[] {
    const minSeats = query.seats ?? 1;
    let results = this.trips.filter((t) => (t.status === "published" || t.status === "full") && t.available_seats >= minSeats);

    if (query.origin && query.origin.trim() !== "") {
      const orig = query.origin.toLowerCase().trim();
      results = results.filter((t) => {
        if (t.origin_city.toLowerCase().includes(orig)) return true;
        const stops = this.routeStops.filter((s) => s.trip_id === t.id);
        return stops.some((s) => s.city.toLowerCase().includes(orig));
      });
    }

    if (query.destination && query.destination.trim() !== "") {
      const dest = query.destination.toLowerCase().trim();
      results = results.filter((t) => {
        if (t.destination_city.toLowerCase().includes(dest)) return true;
        const stops = this.routeStops.filter((s) => s.trip_id === t.id);
        return stops.some((s) => s.city.toLowerCase().includes(dest));
      });
    }

    if (query.date && query.date.trim() !== "") {
      const targetDate = query.date.split("T")[0];
      const matchingDate = results.filter((t) => t.departure_at.startsWith(targetDate));
      if (matchingDate.length > 0) {
        results = matchingDate;
      }
    }

    if (query.maxPrice) {
      results = results.filter((t) => t.price_per_seat <= query.maxPrice!);
    }

    if (query.kind && query.kind !== "all") {
      results = results.filter((t) => t.kind === query.kind);
    }

    return results.map((t) => this.enrichTrip(t));
  }

  public getTripsFromOrigin(origin: string, seats = 1): TripSearchResult[] {
    return this.searchTrips({ origin, seats });
  }

  public getTripById(tripId: string): TripSearchResult | null {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) return null;
    return this.enrichTrip(trip);
  }

  public createTrip(data: {
    driver_id: string;
    vehicle_id?: string;
    vehicle_name?: string;
    origin: string;
    destination: string;
    departure_at: string;
    return_at?: string;
    seats: number;
    price: number;
    kind?: TripKind;
    notes?: string;
    stops?: string[];
  }): TripSearchResult {
    const driver = this.findUserById(data.driver_id);
    if (!driver) throw new Error("Driver account not found");
    if (driver.role !== "driver" && driver.role !== "admin") {
      throw new Error("Only registered driver accounts can publish trips.");
    }
    if (!driver.is_verified && driver.role !== "admin") {
      throw new Error("Driver verification pending. Your National ID and vehicle documents are under review by our admin team.");
    }

    let vehicleId = data.vehicle_id;
    if (!vehicleId) {
      const existing = this.vehicles.find((v) => v.driver_id === data.driver_id);
      if (existing) {
        vehicleId = existing.id;
      } else {
        const newVehicleId = this.generateId();
        this.vehicles.push({
          id: newVehicleId,
          driver_id: data.driver_id,
          make_model: data.vehicle_name || "Registered Vehicle",
          vehicle_type: "suv",
          registration_number: "MP 20 " + Math.floor(1000 + Math.random() * 9000),
          seat_capacity: data.seats + 2,
          is_verified: true,
          created_at: new Date().toISOString(),
        });
        vehicleId = newVehicleId;
      }
    }

    const tripId = this.generateId();
    const newTrip: Trip = {
      id: tripId,
      driver_id: data.driver_id,
      vehicle_id: vehicleId,
      kind: data.kind || "existing",
      status: "published",
      origin_city: data.origin,
      destination_city: data.destination,
      departure_at: data.departure_at,
      return_at: data.return_at,
      total_seats: data.seats,
      available_seats: data.seats,
      price_per_seat: data.price,
      estimated_duration_minutes: 360,
      notes: data.notes || "Comfortable intercity journey.",
      created_at: new Date().toISOString(),
    };

    this.trips.unshift(newTrip);

    this.routeStops.push({
      id: this.generateId(),
      trip_id: tripId,
      stop_order: 0,
      city: data.origin,
      arrival_offset_minutes: 0,
    });

    if (data.stops && data.stops.length > 0) {
      data.stops.forEach((stopCity, idx) => {
        if (stopCity && stopCity.trim() !== "") {
          this.routeStops.push({
            id: this.generateId(),
            trip_id: tripId,
            stop_order: idx + 1,
            city: stopCity.trim(),
            arrival_offset_minutes: (idx + 1) * 90,
          });
        }
      });
    }

    this.routeStops.push({
      id: this.generateId(),
      trip_id: tripId,
      stop_order: (data.stops?.length || 0) + 1,
      city: data.destination,
      arrival_offset_minutes: ((data.stops?.length || 0) + 1) * 120,
    });

    return this.enrichTrip(newTrip);
  }

  public updateTripStatus(tripId: string, status: TripStatus, userId: string): TripSearchResult {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error("Trip not found");
    const user = this.findUserById(userId);
    if (!user) throw new Error("Unauthorized");
    if (user.role !== "admin" && trip.driver_id !== userId) {
      throw new Error("You are not authorized to update this trip.");
    }
    trip.status = status;
    return this.enrichTrip(trip);
  }

  public deleteTrip(tripId: string, userId: string): boolean {
    const index = this.trips.findIndex((t) => t.id === tripId);
    if (index === -1) throw new Error("Trip not found");
    const trip = this.trips[index];
    const user = this.findUserById(userId);
    if (!user) throw new Error("Unauthorized");
    if (user.role !== "admin" && trip.driver_id !== userId) {
      throw new Error("You are not authorized to delete this trip.");
    }
    this.trips.splice(index, 1);
    this.routeStops = this.routeStops.filter((s) => s.trip_id !== tripId);
    return true;
  }

  public createBooking(data: {
    trip_id: string;
    passenger_id: string;
    seats: number;
    pickup_city: string;
    dropoff_city: string;
    pickup_address?: string;
    dropoff_address?: string;
    payment_method?: PaymentMethod;
  }): Booking {
    const trip = this.trips.find((t) => t.id === data.trip_id);
    if (!trip) throw new Error("Selected trip was not found.");
    if (trip.status !== "published") throw new Error("This trip is no longer accepting bookings.");
    if (trip.available_seats < data.seats) {
      throw new Error(`Only ${trip.available_seats} seat(s) remaining for this trip.`);
    }

    trip.available_seats -= data.seats;
    if (trip.available_seats === 0) {
      trip.status = "full";
    }

    const bookingId = this.generateId();
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const totalPrice = trip.price_per_seat * data.seats;

    const newBooking: Booking = {
      id: bookingId,
      trip_id: data.trip_id,
      passenger_id: data.passenger_id,
      seats: data.seats,
      pickup_city: data.pickup_city,
      dropoff_city: data.dropoff_city,
      pickup_address: data.pickup_address || `${data.pickup_city} Central Point`,
      dropoff_address: data.dropoff_address || `${data.dropoff_city} City Center`,
      total_price: totalPrice,
      payment_method: data.payment_method || "upi",
      payment_status: "paid",
      booking_pin: pin,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);

    const passenger = this.findUserById(data.passenger_id);
    if (passenger) passenger.total_trips += 1;

    return this.enrichBooking(newBooking);
  }

  public getBookingsByPassengerId(passengerId: string): Booking[] {
    return this.bookings
      .filter((b) => b.passenger_id === passengerId)
      .map((b) => this.enrichBooking(b));
  }

  public getBookingsByTripId(tripId: string): Booking[] {
    return this.bookings
      .filter((b) => b.trip_id === tripId)
      .map((b) => this.enrichBooking(b));
  }

  public cancelBooking(bookingId: string, userId: string): Booking {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error("Booking not found");
    const user = this.findUserById(userId);
    if (!user) throw new Error("Unauthorized");
    if (user.role !== "admin" && booking.passenger_id !== userId) {
      throw new Error("You are not authorized to cancel this booking.");
    }
    if (booking.status === "cancelled") {
      return this.enrichBooking(booking);
    }

    booking.status = "cancelled";
    booking.payment_status = "refunded";

    const trip = this.trips.find((t) => t.id === booking.trip_id);
    if (trip) {
      trip.available_seats += booking.seats;
      if (trip.status === "full") trip.status = "published";
    }

    return this.enrichBooking(booking);
  }

  public updateBookingStatus(bookingId: string, status: BookingStatus, userId: string): Booking {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error("Booking not found");
    const trip = this.trips.find((t) => t.id === booking.trip_id);
    const user = this.findUserById(userId);
    if (!user) throw new Error("Unauthorized");

    const isDriver = trip && trip.driver_id === userId;
    const isAdmin = user.role === "admin";
    if (!isDriver && !isAdmin) {
      throw new Error("Unauthorized to update booking status.");
    }

    booking.status = status;
    return this.enrichBooking(booking);
  }

  public getDriverStats(driverId: string): DriverStatsResponse {
    const driver = this.findUserById(driverId);
    const driverTrips = this.trips.filter((t) => t.driver_id === driverId);
    const driverTripIds = driverTrips.map((t) => t.id);
    const driverBookings = this.bookings.filter(
      (b) => driverTripIds.includes(b.trip_id) && b.status !== "cancelled"
    );

    const totalEarnings = driverBookings.reduce((sum, b) => sum + b.total_price, 0);
    const completedTrips = driverTrips.filter((t) => t.status === "completed").length;
    const activeTrips = driverTrips.filter((t) => t.status === "published" || t.status === "full" || t.status === "in_progress").length;
    const totalPassengers = driverBookings.reduce((sum, b) => sum + b.seats, 0);

    return {
      total_earnings: totalEarnings,
      completed_trips: completedTrips,
      active_trips: activeTrips,
      total_passengers: totalPassengers,
      driver_rating: driver?.rating ?? 4.9,
      is_verified: driver?.is_verified ?? false,
    };
  }

  public getVehiclesByDriverId(driverId: string): Vehicle[] {
    return this.vehicles.filter((v) => v.driver_id === driverId);
  }

  public createVehicle(data: {
    driver_id: string;
    make_model: string;
    vehicle_type: VehicleType;
    registration_number: string;
    seat_capacity: number;
  }): Vehicle {
    const newVehicle: Vehicle = {
      id: this.generateId(),
      driver_id: data.driver_id,
      make_model: data.make_model,
      vehicle_type: data.vehicle_type,
      registration_number: data.registration_number,
      seat_capacity: data.seat_capacity,
      is_verified: false,
      created_at: new Date().toISOString(),
    };
    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  public getTripsByDriverId(driverId: string): TripSearchResult[] {
    return this.trips.filter((t) => t.driver_id === driverId).map((t) => this.enrichTrip(t));
  }

  public getAdminStats(): AdminStatsResponse {
    const totalGmv = this.bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.total_price, 0);
    const totalBookings = this.bookings.length;
    const totalUsers = this.users.length;
    const totalDrivers = this.users.filter((u) => u.role === "driver").length;
    const totalTrips = this.trips.length;
    const activeTrips = this.trips.filter((t) => t.status === "published" || t.status === "full" || t.status === "in_progress").length;
    const pendingVerifications = this.users.filter((u) => u.role === "driver" && !u.is_verified).length + this.vehicles.filter((v) => !v.is_verified).length;

    return {
      total_gmv: totalGmv,
      total_bookings: totalBookings,
      total_users: totalUsers,
      total_drivers: totalDrivers,
      total_trips: totalTrips,
      active_trips: activeTrips,
      pending_verifications: pendingVerifications,
    };
  }

  public getAllUsers(): UserProfile[] {
    return this.users.map(({ password_hash, ...u }) => u);
  }

  public toggleUserVerification(userId: string): UserProfile {
    const user = this.findUserById(userId);
    if (!user) throw new Error("User not found");
    user.is_verified = !user.is_verified;
    // If driver is verified, also verify their primary vehicle
    if (user.role === "driver" && user.is_verified) {
      const v = this.vehicles.find((veh) => veh.driver_id === userId);
      if (v) v.is_verified = true;
    }
    const { password_hash, ...profile } = user;
    return profile;
  }

  public getAllVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public toggleVehicleVerification(vehicleId: string): Vehicle {
    const vehicle = this.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    vehicle.is_verified = !vehicle.is_verified;
    return vehicle;
  }

  public getAllTrips(): TripSearchResult[] {
    return this.trips.map((t) => this.enrichTrip(t));
  }

  public getAllBookings(): Booking[] {
    return this.bookings.map((b) => this.enrichBooking(b));
  }
}

export const db = new DatabaseStore();
