# Wayfare – Smart Intercity Mobility & Carpooling Platform

Wayfare is a full-stack intercity carpooling and ride-sharing platform designed for verified long-distance journeys. It connects passengers with drivers already heading along the same route to share fuel and toll costs, featuring real Supabase authentication with email OTP, strict driver National ID and vehicle verification, and dedicated role-based portals for **Customers (Passengers)**, **Driver Partners**, and **Platform Administrators**.

---

## Tech Stack

- **Frontend**: React 18, React Router 6 (SPA), TypeScript, Vite, TailwindCSS, Lucide React, Sonner Toasts
- **Backend**: Express API server with TypeScript, CORS, Zod validation schemas
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, Triggers, and Stored Procedures) with self-contained fallback store
- **Tooling**: PNPM / NPM, Prettier, PostCSS

---

## Key Features & Role-Based Workflows

### 1. Customer (Passenger) Workflow
- **Registration**: Requires Legal Full Name, Email, 10-digit Mobile Number (+91), Home City, Password, and 6-Digit Email OTP confirmation.
- **Search & Filter**: Search intercity rides by departure city, destination, travel date, passenger count, and price.
- **Instant Booking**: Select seats, specify custom pickup and drop-off landmarks, select payment method (UPI, Card, Wallet, Cash), and generate a secure **4-digit Boarding PIN**.
- **Passenger Dashboard (`/dashboard/user`)**: View active boarding passes, driver details, vehicle info, and 1-click booking cancellation with automated seat restoration.

### 2. Driver Partner Workflow & Strict Verification Gate
- **Registration**: Requires all Customer fields + **Mandatory National ID / Driving Licence Proof Number** + **Vehicle Make & Model**, **Vehicle Type (Sedan, SUV, Van)**, **Registration Plate Number**, and **Seat Capacity**.
- **Verification Gate**: Newly registered drivers are initialized with `is_verified = false`. **Unverified drivers cannot publish trips or take bookings until approved by an administrator.**
- **Driver Hub (`/dashboard/driver`)**:
  - Verification status banner (locked vs verified).
  - KPI overview: Total Earnings (₹), Completed Trips, Active Rides, Rating.
  - Publish new journeys with intermediate route stops (e.g. Jabalpur $\rightarrow$ Katni $\rightarrow$ Kota $\rightarrow$ Jaipur).
  - Passenger roster accordion per trip showing passenger names, booked seats, and verification PINs.
  - Trip controls: Start Ride, Complete Trip, Cancel Trip.
  - Vehicle fleet registration.

### 3. Administrator Portal (`/dashboard/admin`)
- **Internal Role Declaration**: Admin accounts are declared internally in the database / Supabase profiles.
- **Platform Analytics**: Total Platform GMV (₹), Total Bookings, Active Drivers, Total Users, and Pending Document Approvals.
- **Driver & Document Review**: Inspect driver National ID numbers and vehicle registration plates, with 1-click **"Review & Approve Driver"** to grant publishing authorization.
- **Fleet Management**: Review vehicle documents and approve vehicles.
- **Platform Oversight**: Live platform trips monitor and global bookings ledger.

---

## Project Structure

```
├── client/
│   ├── components/
│   │   ├── Navbar.tsx             # Responsive global navigation with role badges
│   │   ├── Footer.tsx             # Footer with routes and safety highlights
│   │   ├── AuthDialog.tsx         # Real auth modal (Login, Register with OTP step)
│   │   ├── BookingDialog.tsx      # Comprehensive booking modal with Boarding PIN
│   │   ├── PublishTripDialog.tsx  # Driver trip publisher with intermediate stops
│   │   └── ui/                    # UI component library (Radix UI + Tailwind)
│   ├── context/
│   │   └── AuthContext.tsx        # Supabase Auth state, OTP verify, session sync
│   ├── pages/
│   │   ├── Index.tsx              # Homepage & interactive trip search engine
│   │   ├── UserDashboard.tsx      # Passenger dashboard & active boarding passes
│   │   ├── DriverDashboard.tsx    # Driver hub, earnings, passenger rosters
│   │   ├── AdminDashboard.tsx     # Admin center, document approvals, GMV metrics
│   │   └── NotFound.tsx           # 404 handler
│   ├── App.tsx                    # React Router 6 setup & role routing
│   └── global.css                 # TailwindCSS design tokens & fonts
├── server/
│   ├── routes/
│   │   ├── auth.ts                # Login, Register (Customer/Driver), Profile API
│   │   ├── trips.ts               # Search, Filter, Publish (Driver Gate), Status API
│   │   ├── bookings.ts            # Create booking, PIN generation, Cancellation API
│   │   ├── driver.ts              # Driver stats, fleet, published trips API
│   │   └── admin.ts               # Admin stats, verification review, global ledger API
│   ├── db.ts                      # Resilient database store & seed data
│   ├── index.ts                   # Express server setup & route registration
│   └── node-build.ts              # Production server runner
├── shared/
│   └── api.ts                     # Shared TypeScript interfaces & API contracts
├── supabase.sql                   # Complete PostgreSQL schema, triggers & RLS policies
└── package.json
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20 or v22 LTS ([Download Node.js](https://nodejs.org/))
- **Package Manager**: PNPM (`npm install -g pnpm`) or standard NPM

### 2. Environment Setup
Create a `.env` file in the project root:

```env
# Client-side Supabase credentials
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...<your-anon-key>

# Server-side Supabase credentials
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...<your-service-role-key>

PORT=8080
NODE_ENV=development
```

> **Note**: If Supabase credentials are not provided, the application will automatically fall back to the built-in database service seeded with test accounts and intercity routes so you can test immediately offline without crashing.

### 3. Database Initialization (Supabase)
1. Open your **Supabase Dashboard**.
2. Navigate to **SQL Editor**.
3. Copy the contents of [`supabase.sql`](./supabase.sql) and paste it into the editor.
4. Click **Run**. All tables (`profiles`, `vehicles`, `trips`, `route_stops`, `bookings`), RLS policies, and triggers will be created.

### 4. Running Locally

```bash
# Install dependencies
pnpm install

# Start development server (Client + Server on port 8080)
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## Deployment Guide (Render)

When deploying as a **Web Service** on Render:

| Field | Configuration |
| :--- | :--- |
| **Runtime** | `Node` |
| **Build Command** | `pnpm install && pnpm build` *(or `npm install && npm run build`)* |
| **Start Command** | `node dist/server/node-build.mjs` *(or `pnpm start`)* |
| **Port** | `8080` (Render will bind via `$PORT`) |
| **Health Check Path** | `/api/ping` |
| **Environment Variables** | Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

---

## Test Accounts

The following verified accounts are preloaded for testing:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `passenger@wayfare.com` | `password123` | Priya Kapoor (4 completed rides, active booking) |
| **Verified Driver** | `driver@wayfare.com` | `password123` | Arjun Mehta (MP 20 CA 4821, 128 trips, ₹1,249/seat) |
| **Administrator** | `admin@wayfare.com` | `admin123` | System Admin (Full platform governance) |

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` – Register customer or driver (validates National ID and vehicle for drivers).
- `POST /api/auth/login` – Authenticate with email and password.
- `GET /api/auth/me` – Retrieve currently logged-in user profile.
- `PUT /api/auth/profile` – Update name, phone, city, or avatar.

### Trips
- `GET /api/trips/search` – Search rides with query filters (`origin`, `destination`, `date`, `seats`, `maxPrice`).
- `GET /api/trips/from` – Browse all rides from a specific departure city.
- `GET /api/trips/:id` – Detailed itinerary and route stops.
- `POST /api/trips` – Publish a new trip *(Restricted: requires verified driver)*.
- `PATCH /api/trips/:id/status` – Update trip status (`in_progress`, `completed`, `cancelled`).
- `DELETE /api/trips/:id` – Cancel/Delete published trip.

### Bookings
- `POST /api/bookings` – Book seat(s) with pickup/dropoff landmarks, payment method, and 4-digit PIN generation.
- `GET /api/bookings/my-bookings` – Retrieve current passenger's active and past bookings.
- `GET /api/bookings/trip/:tripId` – Retrieve passenger roster for a driver's trip.
- `PATCH /api/bookings/:id/cancel` – Cancel booking and restore trip seat capacity.

### Driver & Admin
- `GET /api/driver/stats` – Earnings and passenger statistics.
- `GET /api/driver/trips` & `GET /api/driver/vehicles` – Driver trips and fleet list.
- `POST /api/driver/vehicles` – Register vehicle for verification.
- `GET /api/admin/stats` – Platform GMV and platform KPI metrics.
- `GET /api/admin/users` – List all accounts with National ID review.
- `PATCH /api/admin/users/:id/verify` – Approve/Verify driver partner.
- `GET /api/admin/vehicles` & `PATCH /api/admin/vehicles/:id/verify` – Approve fleet vehicles.
- `GET /api/admin/trips` & `GET /api/admin/bookings` – Platform trips and bookings ledger.

---

## License
MIT
