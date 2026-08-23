import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import type { TripSearchResponse } from "@shared/api";

const searchSchema = z.object({
  origin: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  date: z.string().optional(),
  seats: z.coerce.number().int().min(1).max(20).default(1),
  maxPrice: z.coerce.number().positive().optional(),
  kind: z.string().optional(),
});

const originSchema = z.object({
  origin: z.string().trim().min(1),
  seats: z.coerce.number().int().min(1).max(20).default(1),
});

const publishSchema = z.object({
  origin: z.string().trim().min(2).max(80),
  destination: z.string().trim().min(2).max(80),
  departureAt: z.string(),
  returnAt: z.string().optional(),
  seats: z.number().int().min(1).max(20),
  price: z.number().min(0).max(100000),
  vehicle: z.string().trim().min(2).max(100).optional(),
  vehicle_id: z.string().optional(),
  kind: z.enum(["existing", "return", "fresh_request"]).default("existing"),
  notes: z.string().max(500).optional(),
  stops: z.array(z.string()).optional(),
});

const statusSchema = z.object({
  status: z.enum(["published", "full", "in_progress", "completed", "cancelled"]),
});

export const searchTrips: RequestHandler = (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid search parameters" });
  }

  try {
    const results = db.searchTrips({
      origin: parsed.data.origin,
      destination: parsed.data.destination,
      date: parsed.data.date,
      seats: parsed.data.seats,
      maxPrice: parsed.data.maxPrice,
      kind: parsed.data.kind,
    });
    return res.json({ trips: results, total: results.length } satisfies TripSearchResponse);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Search failed" });
  }
};

export const listTripsFromOrigin: RequestHandler = (req, res) => {
  const parsed = originSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please provide a valid departure city." });
  }

  try {
    const results = db.getTripsFromOrigin(parsed.data.origin, parsed.data.seats);
    return res.json({ trips: results, total: results.length } satisfies TripSearchResponse);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unable to load rides" });
  }
};

export const getTripDetails: RequestHandler = (req, res) => {
  const tripId = req.params.id;
  if (!tripId) return res.status(400).json({ error: "Trip ID required" });

  const trip = db.getTripById(tripId);
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  return res.json({ trip });
};

export const publishTrip: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Sign in before publishing a trip." });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Session expired. Please sign in again." });

  // Strict verification gate for drivers
  if (user.role !== "driver" && user.role !== "admin") {
    return res.status(403).json({ error: "Only registered drivers can publish trips." });
  }

  if (!user.is_verified && user.role !== "admin") {
    return res.status(403).json({
      error: "Driver verification pending. Your National ID and vehicle documents are under review by our admin team. You will be authorized to publish rides once approved.",
    });
  }

  const parsed = publishSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid trip details" });
  }

  try {
    const created = db.createTrip({
      driver_id: user.id,
      vehicle_id: parsed.data.vehicle_id,
      vehicle_name: parsed.data.vehicle,
      origin: parsed.data.origin,
      destination: parsed.data.destination,
      departure_at: parsed.data.departureAt,
      return_at: parsed.data.returnAt,
      seats: parsed.data.seats,
      price: parsed.data.price,
      kind: parsed.data.kind,
      notes: parsed.data.notes,
      stops: parsed.data.stops,
    });

    return res.status(201).json({ trip: created });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Failed to publish trip" });
  }
};

export const updateTripStatus: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const tripId = req.params.id;
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid status" });

  try {
    const updated = db.updateTripStatus(tripId, parsed.data.status, user.id);
    return res.json({ trip: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update trip" });
  }
};

export const deleteTrip: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const tripId = req.params.id;
  try {
    db.deleteTrip(tripId, user.id);
    return res.json({ success: true, message: "Trip deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Failed to delete trip" });
  }
};
