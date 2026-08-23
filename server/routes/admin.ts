import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import type { AdminStatsResponse } from "@shared/api";

function requireAdmin(token?: string) {
  if (!token) throw new Error("Authentication required");
  const user = db.verifyToken(token);
  if (!user) throw new Error("Invalid session");
  if (user.role !== "admin") throw new Error("Admin privileges required");
  return user;
}

export const getAdminStats: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    requireAdmin(token);
    const stats = db.getAdminStats();
    return res.json(stats satisfies AdminStatsResponse);
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const getAdminUsers: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    requireAdmin(token);
    const users = db.getAllUsers();
    return res.json({ users });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const toggleUserVerification: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    requireAdmin(token);
    const userId = req.params.id;
    const user = db.toggleUserVerification(userId);
    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Update failed" });
  }
};

export const changeUserRole: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const roleSchema = z.object({ role: z.enum(["passenger", "driver", "admin"]) });
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid role" });

  try {
    requireAdmin(token);
    const userId = req.params.id;
    const user = db.switchUserRole(userId, parsed.data.role);
    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Role update failed" });
  }
};

export const getAdminVehicles: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    requireAdmin(token);
    const vehicles = db.getAllVehicles();
    return res.json({ vehicles });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const toggleVehicleVerification: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    requireAdmin(token);
    const vehicleId = req.params.id;
    const vehicle = db.toggleVehicleVerification(vehicleId);
    return res.json({ vehicle });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Update failed" });
  }
};

export const getAdminTrips: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    requireAdmin(token);
    const trips = db.getAllTrips();
    return res.json({ trips });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const getAdminBookings: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    requireAdmin(token);
    const bookings = db.getAllBookings();
    return res.json({ bookings });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};
