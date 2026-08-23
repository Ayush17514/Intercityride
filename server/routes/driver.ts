import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import type { DriverStatsResponse } from "@shared/api";

const createVehicleSchema = z.object({
  make_model: z.string().min(2).max(100),
  vehicle_type: z.enum(["sedan", "suv", "van", "tempo_traveller"]).default("suv"),
  registration_number: z.string().min(4).max(25),
  seat_capacity: z.number().int().min(2).max(20).default(6),
});

export const getDriverStats: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  try {
    const stats = db.getDriverStats(user.id);
    return res.json(stats satisfies DriverStatsResponse);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load driver stats" });
  }
};

export const getDriverTrips: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  try {
    const trips = db.getTripsByDriverId(user.id);
    return res.json({ trips });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load driver trips" });
  }
};

export const getDriverVehicles: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  try {
    const vehicles = db.getVehiclesByDriverId(user.id);
    return res.json({ vehicles });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load driver vehicles" });
  }
};

export const createDriverVehicle: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const parsed = createVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid vehicle details" });
  }

  try {
    const vehicle = db.createVehicle({
      driver_id: user.id,
      make_model: parsed.data.make_model,
      vehicle_type: parsed.data.vehicle_type,
      registration_number: parsed.data.registration_number,
      seat_capacity: parsed.data.seat_capacity,
    });
    return res.status(201).json({ vehicle });
  } catch (error) {
    return res.status(400).json({ error: "Failed to register vehicle" });
  }
};
