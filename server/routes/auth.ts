import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import type { AuthResponse, UserProfile } from "@shared/api";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2).max(100),
  role: z.enum(["passenger", "driver", "admin"]).default("passenger"),
  phone: z.string().optional(),
  city: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_type: z.enum(["sedan", "suv", "van", "tempo_traveller"]).optional(),
  registration_number: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

const switchRoleSchema = z.object({
  role: z.enum(["passenger", "driver", "admin"]),
});

export const handleRegister: RequestHandler = (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid registration details" });
  }

  try {
    const authData = db.createUser(parsed.data);
    return res.status(201).json(authData satisfies AuthResponse);
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Registration failed" });
  }
};

export const handleLogin: RequestHandler = (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please enter a valid email and password" });
  }

  try {
    const authData = db.login(parsed.data.email, parsed.data.password);
    return res.json(authData satisfies AuthResponse);
  } catch (error) {
    return res.status(401).json({ error: error instanceof Error ? error.message : "Invalid credentials" });
  }
};

export const handleGetMe: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = db.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const { password_hash, ...profile } = user;
  return res.json({ user: profile satisfies UserProfile });
};

export const handleUpdateProfile: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile data" });
  }

  try {
    const updated = db.updateUserProfile(user.id, parsed.data);
    return res.json({ user: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Update failed" });
  }
};

export const handleSwitchRole: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  const user = db.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const parsed = switchRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid role selected" });
  }

  try {
    const updated = db.switchUserRole(user.id, parsed.data.role);
    return res.json({ user: updated });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Role switch failed" });
  }
};
