import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleGetMe,
  handleLogin,
  handleRegister,
  handleSwitchRole,
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
  app.get("/api/auth/me", handleGetMe);
  app.put("/api/auth/profile", handleUpdateProfile);
  app.post("/api/auth/switch-role", handleSwitchRole);

  // --- Trips Routes ---
  app.get("/api/trips/search", searchTrips);
  app.get("/api/trips/from", listTripsFromOrigin);
  app.get("/api/trips/:id", getTripDetails);
  app.post("/api/trips", publishTrip);
  app.patch("/api/trips/:id/status", updateTripStatus);
  app.delete("/api/trips/:id", deleteTrip);

  // --- Bookings Routes ---
  app.post("/api/bookings", createBooking);
  app.get("/api/bookings/my-bookings", getMyBookings);
  app.get("/api/bookings/trip/:tripId", getTripBookings);
  app.patch("/api/bookings/:id/cancel", cancelBooking);
  app.patch("/api/bookings/:id/status", updateBookingStatus);

  // --- Driver Routes ---
  app.get("/api/driver/stats", getDriverStats);
  app.get("/api/driver/trips", getDriverTrips);
  app.get("/api/driver/vehicles", getDriverVehicles);
  app.post("/api/driver/vehicles", createDriverVehicle);

  // --- Admin Routes ---
  app.get("/api/admin/stats", getAdminStats);
  app.get("/api/admin/users", getAdminUsers);
  app.patch("/api/admin/users/:id/verify", toggleUserVerification);
  app.patch("/api/admin/users/:id/role", changeUserRole);
  app.get("/api/admin/vehicles", getAdminVehicles);
  app.patch("/api/admin/vehicles/:id/verify", toggleVehicleVerification);
  app.get("/api/admin/trips", getAdminTrips);
  app.get("/api/admin/bookings", getAdminBookings);

  return app;
}
