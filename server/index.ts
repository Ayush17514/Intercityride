import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { requireAuth, requireAdmin } from "./middleware/auth";
import {
  handleGetMe,
  handleLogin,
  handleRegister,
  handleUpdateProfile,
} from "./routes/auth";
import {
  deleteTrip,
  getTripDetails,
  listTripsFromOrigin,
  publishTrip,
  searchTrips,
  updateTripStatus,
} from "./routes/trips";
import {
  cancelBooking,
  createBooking,
  getMyBookings,
  getTripBookings,
  updateBookingStatus,
} from "./routes/bookings";
import {
  createDriverVehicle,
  getDriverStats,
  getDriverTrips,
  getDriverVehicles,
} from "./routes/driver";
import {
  changeUserRole,
  getAdminBookings,
  getAdminStats,
  getAdminTrips,
  getAdminUsers,
  getAdminVehicles,
  toggleUserVerification,
  toggleVehicleVerification,
} from "./routes/admin";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic Health/Ping
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "pong", status: "ok", timestamp: new Date().toISOString() });
  });
  app.get("/api/demo", handleDemo);

  // --- Auth Routes ---
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/me", requireAuth, handleGetMe);
  app.put("/api/auth/profile", requireAuth, handleUpdateProfile);

  // --- Trips Routes ---
  app.get("/api/trips/search", searchTrips);
  app.get("/api/trips/from", listTripsFromOrigin);
  app.get("/api/trips/:id", getTripDetails);
  app.post("/api/trips", requireAuth, publishTrip);
  app.patch("/api/trips/:id/status", requireAuth, updateTripStatus);
  app.delete("/api/trips/:id", requireAuth, deleteTrip);

  // --- Bookings Routes ---
  app.post("/api/bookings", createBooking); // Custom auth logic inside
  app.get("/api/bookings/my-bookings", requireAuth, getMyBookings);
  app.get("/api/bookings/trip/:tripId", requireAuth, getTripBookings);
  app.patch("/api/bookings/:id/cancel", requireAuth, cancelBooking);
  app.patch("/api/bookings/:id/status", requireAuth, updateBookingStatus);

  // --- Driver Routes ---
  app.get("/api/driver/stats", requireAuth, getDriverStats);
  app.get("/api/driver/trips", requireAuth, getDriverTrips);
  app.get("/api/driver/vehicles", requireAuth, getDriverVehicles);
  app.post("/api/driver/vehicles", requireAuth, createDriverVehicle);

  // --- Admin Routes ---
  app.get("/api/admin/stats", requireAdmin, getAdminStats);
  app.get("/api/admin/users", requireAdmin, getAdminUsers);
  app.patch("/api/admin/users/:id/verify", requireAdmin, toggleUserVerification);
  app.patch("/api/admin/users/:id/role", requireAdmin, changeUserRole);
  app.get("/api/admin/vehicles", requireAdmin, getAdminVehicles);
  app.patch("/api/admin/vehicles/:id/verify", requireAdmin, toggleVehicleVerification);
  app.get("/api/admin/trips", requireAdmin, getAdminTrips);
  app.get("/api/admin/bookings", requireAdmin, getAdminBookings);

  return app;
}
