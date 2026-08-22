/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface TripSearchResult {
  trip_id: string;
  driver_name: string;
  driver_rating: number;
  driver_verified: boolean;
  vehicle_name: string;
  kind: "existing" | "return" | "fresh_request";
  origin_city: string;
  destination_city: string;
  departure_at: string;
  available_seats: number;
  price_per_seat: number;
  match_score: number;
}

export interface TripSearchResponse {
  trips: TripSearchResult[];
}

export interface BookingResponse {
  booking: {
    id: string;
    trip_id: string;
    passenger_id: string;
    seats: number;
    pickup_city: string;
    dropoff_city: string;
    total_price: number;
    status: "pending" | "confirmed" | "cancelled";
  };
}
