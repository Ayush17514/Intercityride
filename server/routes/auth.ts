import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../db";
import type { AuthResponse, UserProfile } from "@shared/api";

const registerCustomerSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  full_name: z.string().min(2, "Full name must be at least 2 characters.").max(100),
  role: z.literal("passenger"),
  phone: z.string().min(8, "Valid mobile number is required."),
  city: z.string().min(2, "Home city is required."),
});

const registerDriverSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  full_name: z.string().min(2, "Full name must be at least 2 characters.").max(100),
  role: z.literal("driver"),
  phone: z.string().min(8, "Valid mobile number is required."),
  city: z.string().min(2, "Home city is required."),
  national_id: z.string().min(4, "Valid Driving Licence / National ID number is required for Driver verification."),
  vehicle_model: z.string().min(2, "Vehicle make and model is required."),
  vehicle_type: z.enum(["sedan", "suv", "van", "tempo_traveller"]).default("suv"),
  registration_number: z.string().min(4, "Valid vehicle registration plate number is required."),
});

const registerSchema = z.discriminatedUnion("role", [
  registerCustomerSchema,
  registerDriverSchema,
]);

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  national_id: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const handleRegister: RequestHandler = (req, res) => {
  if (req.body.role === "admin") {
    return res.status(403).json({ error: "Admin registration is not allowed. Admin accounts are assigned internally." });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid registration details.";
    return res.status(400).json({ error: errorMsg });
  }

  try {
    const authData = db.createUser(parsed.data as any);
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
