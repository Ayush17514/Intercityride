import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import type { BookingResponse, MyBookingsResponse } from "@shared/api";

const createBookingSchema = z.object({
  tripId: z.string().min(1),
  seats: z.number().int().min(1).max(10).default(1),
  pickup: z.string().trim().min(2).max(100),
  dropoff: z.string().trim().min(2).max(100),
  pickup_address: z.string().max(200).optional(),
  dropoff_address: z.string().max(200).optional(),
  payment_method: z.enum(["upi", "card", "wallet", "cash"]).default("upi"),
});

const statusSchema = z.object({
  status: z.enum(["confirmed", "in_progress", "completed", "cancelled"]),
});

export const createBooking: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Please log in before booking a ride." });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Your session has expired. Please sign in again." });

  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid booking details" });
  }

  try {
    const booking = db.createBooking({
      trip_id: parsed.data.tripId,
      passenger_id: user.id,
      seats: parsed.data.seats,
      pickup_city: parsed.data.pickup,
      dropoff_city: parsed.data.dropoff,
      pickup_address: parsed.data.pickup_address,
      dropoff_address: parsed.data.dropoff_address,
      payment_method: parsed.data.payment_method,
    });

    return res.status(201).json({ booking } satisfies BookingResponse);
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Failed to book ride" });
  }
};

export const getMyBookings: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  try {
    const bookings = db.getBookingsByPassengerId(user.id);
    return res.json({ bookings } satisfies MyBookingsResponse);
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve bookings" });
  }
};

export const getTripBookings: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const tripId = req.params.tripId;
  try {
    const bookings = db.getBookingsByTripId(tripId);
    return res.json({ bookings } satisfies MyBookingsResponse);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load passenger roster" });
  }
};

export const cancelBooking: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const bookingId = req.params.id;
  try {
    const cancelled = db.cancelBooking(bookingId, user.id);
    return res.json({ booking: cancelled });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Failed to cancel booking" });
  }
};

export const updateBookingStatus: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const bookingId = req.params.id;
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid status" });

  try {
    const updated = db.updateBookingStatus(bookingId, parsed.data.status, user.id);
    return res.json({ booking: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update booking" });
  }
};
