import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import type { AdminStatsResponse } from "@shared/api";

export const getAdminStats: RequestHandler = (req, res) => {
  try {
    const stats = db.getAdminStats();
    return res.json(stats satisfies AdminStatsResponse);
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const getAdminUsers: RequestHandler = (req, res) => {
  try {
    const users = db.getAllUsers();
    return res.json({ users });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const toggleUserVerification: RequestHandler = (req, res) => {
  try {
    const userId = req.params.id as string;
    const user = db.toggleUserVerification(userId);
    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Update failed" });
  }
};

export const changeUserRole: RequestHandler = (req, res) => {
  const roleSchema = z.object({ role: z.enum(["passenger", "driver", "admin"]) });
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid role" });

  try {
    const userId = req.params.id as string;
    const user = db.switchUserRole(userId, parsed.data.role);
    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Role update failed" });
  }
};

export const getAdminVehicles: RequestHandler = (req, res) => {
  try {
    const vehicles = db.getAllVehicles();
    return res.json({ vehicles });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const toggleVehicleVerification: RequestHandler = (req, res) => {
  try {
    const vehicleId = req.params.id as string;
    const vehicle = db.toggleVehicleVerification(vehicleId);
    return res.json({ vehicle });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Update failed" });
  }
};

export const getAdminTrips: RequestHandler = (req, res) => {
  try {
    const trips = db.getAllTrips();
    return res.json({ trips });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};

export const getAdminBookings: RequestHandler = (req, res) => {
  try {
    const bookings = db.getAllBookings();
    return res.json({ bookings });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Access denied" });
  }
};
