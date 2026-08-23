export type UserRole = "passenger" | "driver" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  city?: string;
  rating: number;
  total_trips: number;
  is_verified: boolean;
  created_at: string;
}

export type VehicleType = "sedan" | "suv" | "van" | "tempo_traveller";

export interface Vehicle {
  id: string;
  driver_id: string;
  make_model: string;
  vehicle_type: VehicleType;
  registration_number: string;
  seat_capacity: number;
  is_verified: boolean;
  created_at: string;
}

export type TripKind = "existing" | "return" | "fresh_request";
export type TripStatus = "published" | "full" | "in_progress" | "completed" | "cancelled";

export interface RouteStop {
  id: string;
  trip_id: string;
  stop_order: number;
  city: string;
  arrival_offset_minutes: number;
}

export interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  kind: TripKind;
  status: TripStatus;
  origin_city: string;
  destination_city: string;
  departure_at: string;
  return_at?: string;
  total_seats: number;
  available_seats: number;
  price_per_seat: number;
  estimated_duration_minutes?: number;
  notes?: string;
  created_at: string;
  driver?: {
    id: string;
    full_name: string;
    phone?: string;
    rating: number;
    is_verified: boolean;
    avatar_url?: string;
  };
  vehicle?: {
    id: string;
    make_model: string;
    vehicle_type: VehicleType;
    registration_number: string;
  };
  stops?: RouteStop[];
}

export interface TripSearchResult {
  trip_id: string;
  driver_id: string;
  driver_name: string;
  driver_rating: number;
  driver_verified: boolean;
  driver_phone?: string;
  vehicle_name: string;
  vehicle_type: VehicleType;
  registration_number: string;
  kind: TripKind;
  status: TripStatus;
  origin_city: string;
  destination_city: string;
  departure_at: string;
  available_seats: number;
  total_seats: number;
  price_per_seat: number;
  match_score: number;
  estimated_duration_minutes?: number;
  notes?: string;
  stops?: RouteStop[];
}

export interface TripSearchResponse {
  trips: TripSearchResult[];
  total: number;
}

export type BookingStatus = "confirmed" | "in_progress" | "completed" | "cancelled";
export type PaymentMethod = "upi" | "card" | "wallet" | "cash";
export type PaymentStatus = "paid" | "pending" | "refunded";

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  seats: number;
  pickup_city: string;
  dropoff_city: string;
  pickup_address?: string;
  dropoff_address?: string;
  total_price: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  booking_pin: string;
  status: BookingStatus;
  created_at: string;
  trip?: TripSearchResult;
  passenger?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    rating: number;
  };
}

export interface BookingResponse {
  booking: Booking;
}

export interface MyBookingsResponse {
  bookings: Booking[];
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface DriverStatsResponse {
  total_earnings: number;
  completed_trips: number;
  active_trips: number;
  total_passengers: number;
  driver_rating: number;
  is_verified: boolean;
}

export interface AdminStatsResponse {
  total_gmv: number;
  total_bookings: number;
  total_users: number;
  total_drivers: number;
  total_trips: number;
  active_trips: number;
  pending_verifications: number;
}

export interface DemoResponse {
  message: string;
}
