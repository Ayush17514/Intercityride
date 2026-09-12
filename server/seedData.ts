import type { UserRecord } from "./db";
import type { Booking, RouteStop, Trip, Vehicle } from "@shared/api";

export function getSeedData(
  hashPassword: (password: string) => string,
  generateId: () => string
): {
  users: UserRecord[];
  vehicles: Vehicle[];
  trips: Trip[];
  routeStops: RouteStop[];
  bookings: Booking[];
} {
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

  const users: UserRecord[] = [
    {
      id: passengerId,
      email: "passenger@wayfare.com",
      password_hash: hashPassword("password123"),
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
      password_hash: hashPassword("password123"),
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
      password_hash: hashPassword("password123"),
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
      password_hash: hashPassword("admin123"),
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

  const vehicles: Vehicle[] = [
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

  const trips: Trip[] = [
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

  const routeStops: RouteStop[] = [
    { id: generateId(), trip_id: trip1Id, stop_order: 0, city: "Jabalpur", arrival_offset_minutes: 0 },
    { id: generateId(), trip_id: trip1Id, stop_order: 1, city: "Katni", arrival_offset_minutes: 90 },
    { id: generateId(), trip_id: trip1Id, stop_order: 2, city: "Kota", arrival_offset_minutes: 450 },
    { id: generateId(), trip_id: trip1Id, stop_order: 3, city: "Jaipur", arrival_offset_minutes: 630 },
    { id: generateId(), trip_id: trip2Id, stop_order: 0, city: "Jabalpur", arrival_offset_minutes: 0 },
    { id: generateId(), trip_id: trip2Id, stop_order: 1, city: "Sagar", arrival_offset_minutes: 150 },
    { id: generateId(), trip_id: trip2Id, stop_order: 2, city: "Jaipur", arrival_offset_minutes: 585 },
  ];

  const bookings: Booking[] = [
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

  return { users, vehicles, trips, routeStops, bookings };
}
