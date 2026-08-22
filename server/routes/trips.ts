import { createClient } from "@supabase/supabase-js";
import { RequestHandler } from "express";
import { z } from "zod";
import type { BookingResponse, TripSearchResponse } from "@shared/api";

const searchSchema = z.object({
  origin: z.string().trim().min(2).max(80),
  destination: z.string().trim().min(2).max(80),
  date: z.string().date(),
  seats: z.coerce.number().int().min(1).max(8).default(1),
});

const publishSchema = z.object({
  origin: z.string().trim().min(2).max(80),
  destination: z.string().trim().min(2).max(80),
  departureAt: z.string().datetime(),
  seats: z.number().int().min(1).max(20),
  price: z.number().min(0).max(100000),
  vehicle: z.string().trim().min(2).max(100),
});

const bookingSchema = z.object({
  tripId: z.string().uuid(),
  seats: z.number().int().min(1).max(8),
  pickup: z.string().trim().min(2).max(80),
  dropoff: z.string().trim().min(2).max(80),
});

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export const searchTrips: RequestHandler = async (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Enter a valid origin, destination, date, and passenger count." });

  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." });

  const { data, error } = await supabase.rpc("search_trips", {
    requested_origin: parsed.data.origin,
    requested_destination: parsed.data.destination,
    requested_departure: parsed.data.date,
    requested_seats: parsed.data.seats,
  });
  if (error) return res.status(502).json({ error: error.message });

  const response: TripSearchResponse = { trips: data ?? [] };
  return res.json(response);
};

export const publishTrip: RequestHandler = async (req, res) => {
  const parsed = publishSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter valid trip, vehicle, seat, and fare details." });
  const accessToken = req.headers.authorization?.replace(/^Bearer\\s+/i, "");
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: "Supabase is not configured." });
  if (!accessToken) return res.status(401).json({ error: "Sign in before publishing a trip." });
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  const { data: vehicle, error: vehicleError } = await supabase.from("vehicles").insert({ driver_id: userData.user.id, make_model: parsed.data.vehicle, vehicle_type: "sedan", seat_capacity: parsed.data.seats + 1, is_verified: false }).select("id").single();
  if (vehicleError) return res.status(400).json({ error: vehicleError.message });
  const { data, error } = await supabase.from("trips").insert({ driver_id: userData.user.id, vehicle_id: vehicle.id, kind: "existing", origin_city: parsed.data.origin, destination_city: parsed.data.destination, departure_at: parsed.data.departureAt, total_seats: parsed.data.seats, available_seats: parsed.data.seats, price_per_seat: parsed.data.price, status: "published" }).select("id, origin_city, destination_city, departure_at, available_seats, price_per_seat").single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ trip: data });
};

export const createBooking: RequestHandler = async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Booking details are incomplete." });

  const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: "Supabase is not configured." });
  if (!accessToken) return res.status(401).json({ error: "Sign in before booking a trip." });

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return res.status(401).json({ error: "Your session has expired. Please sign in again." });

  const userClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await userClient.rpc("create_booking", {
    requested_trip_id: parsed.data.tripId,
    requested_seats: parsed.data.seats,
    requested_pickup: parsed.data.pickup,
    requested_dropoff: parsed.data.dropoff,
  });
  if (error) return res.status(400).json({ error: error.message });

  const response: BookingResponse = { booking: data };
  return res.status(201).json(response);
};
