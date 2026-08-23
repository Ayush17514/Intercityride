-- Wayfare Intercity Mobility Marketplace
-- Run this file in Supabase Dashboard > SQL Editor.

create extension if not exists "pgcrypto";

-- Clean drop of existing tables & types to prevent stale enum conflicts
drop table if exists public.bookings cascade;
drop table if exists public.route_stops cascade;
drop table if exists public.trips cascade;
drop table if exists public.vehicles cascade;
drop table if exists public.profiles cascade;

drop type if exists public.trip_kind cascade;
drop type if exists public.trip_status cascade;
drop type if exists public.booking_status cascade;
drop type if exists public.vehicle_type cascade;

-- Custom Enum Types
create type public.trip_kind as enum ('existing', 'return', 'fresh_request');
create type public.trip_status as enum ('published', 'full', 'in_progress', 'completed', 'cancelled');
create type public.booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
create type public.vehicle_type as enum ('sedan', 'suv', 'van', 'tempo_traveller');

-- 1. Profiles Table (Supports Customer, Driver, and Admin)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  avatar_url text,
  role text not null default 'passenger' check (role in ('passenger', 'driver', 'admin', 'both')),
  city text not null,
  national_id text, -- Driving License / National ID Proof for Driver verification
  rating numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  total_trips integer not null default 0 check (total_trips >= 0),
  is_verified boolean not null default false, -- Customers are auto-verified; Drivers require Admin approval
  created_at timestamptz not null default now()
);

-- 2. Vehicles Table
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  make_model text not null,
  vehicle_type public.vehicle_type not null,
  registration_number text not null,
  seat_capacity integer not null check (seat_capacity between 1 and 20),
  is_verified boolean not null default false, -- Requires Admin document check
  created_at timestamptz not null default now()
);

-- 3. Trips Table
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  kind public.trip_kind not null default 'existing',
  status public.trip_status not null default 'published',
  origin_city text not null,
  destination_city text not null,
  origin_lat numeric(8,5),
  origin_lng numeric(8,5),
  destination_lat numeric(8,5),
  destination_lng numeric(8,5),
  departure_at timestamptz not null,
  return_at timestamptz,
  total_seats integer not null check (total_seats > 0),
  available_seats integer not null check (available_seats >= 0),
  price_per_seat numeric(10,2) not null check (price_per_seat >= 0),
  estimated_duration_minutes integer,
  notes text,
  created_at timestamptz not null default now(),
  constraint available_seats_within_capacity check (available_seats <= total_seats)
);

-- 4. Route Stops Table
create table public.route_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  stop_order integer not null check (stop_order >= 0),
  city text not null,
  latitude numeric(8,5),
  longitude numeric(8,5),
  arrival_offset_minutes integer not null default 0,
  unique (trip_id, stop_order)
);

-- 5. Bookings Table
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete restrict,
  passenger_id uuid not null references public.profiles(id) on delete restrict,
  seats integer not null default 1 check (seats between 1 and 8),
  pickup_city text not null,
  dropoff_city text not null,
  pickup_address text,
  dropoff_address text,
  total_price numeric(10,2) not null check (total_price >= 0),
  payment_method text not null default 'upi',
  payment_status text not null default 'paid',
  booking_pin text not null default '4821',
  status public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  unique (trip_id, passenger_id, status)
);

-- Indexes for lightning-fast search
create index trips_search_idx on public.trips (origin_city, destination_city, departure_at, status);
create index trips_departure_idx on public.trips (departure_at);
create index route_stops_city_idx on public.route_stops (city, trip_id);
create index bookings_trip_idx on public.bookings (trip_id, status);

-- Trigger for New Supabase User Profile Creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text := coalesce(new.raw_user_meta_data ->> 'role', 'passenger');
  user_city text := coalesce(new.raw_user_meta_data ->> 'city', 'Jabalpur');
  user_phone text := coalesce(new.phone, new.raw_user_meta_data ->> 'phone', '+91 98000 00000');
  user_national_id text := new.raw_user_meta_data ->> 'national_id';
  v_model text := new.raw_user_meta_data ->> 'vehicle_model';
  v_type text := coalesce(new.raw_user_meta_data ->> 'vehicle_type', 'suv');
  v_plate text := new.raw_user_meta_data ->> 'registration_number';
  v_capacity integer := coalesce((new.raw_user_meta_data ->> 'seat_capacity')::integer, 6);
begin
  -- Prevent public signups from self-assigning admin role
  if user_role not in ('passenger', 'driver') then
    user_role := 'passenger';
  end if;

  insert into public.profiles (id, full_name, phone, avatar_url, role, city, national_id, is_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    user_phone,
    new.raw_user_meta_data ->> 'avatar_url',
    user_role,
    user_city,
    user_national_id,
    -- Customers auto-verified upon OTP confirmation; Drivers require Admin verification
    (user_role = 'passenger')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    city = excluded.city,
    national_id = coalesce(excluded.national_id, profiles.national_id);

  -- If driver registered vehicle details, create unverified vehicle record
  if user_role = 'driver' and v_model is not null and v_plate is not null then
    insert into public.vehicles (driver_id, make_model, vehicle_type, registration_number, seat_capacity, is_verified)
    values (new.id, v_model, v_type::public.vehicle_type, v_plate, v_capacity, false);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Search Trips Stored Function
create or replace function public.search_trips(
  requested_origin text,
  requested_destination text,
  requested_departure date default null,
  requested_seats integer default 1
)
returns table (
  trip_id uuid,
  driver_name text,
  driver_rating numeric,
  driver_verified boolean,
  vehicle_name text,
  kind public.trip_kind,
  origin_city text,
  destination_city text,
  departure_at timestamptz,
  available_seats integer,
  price_per_seat numeric,
  match_score integer
)
language sql
stable
as $$
  with scored as (
    select
      t.id as trip_id,
      p.full_name as driver_name,
      p.rating as driver_rating,
      p.is_verified as driver_verified,
      v.make_model as vehicle_name,
      t.kind,
      t.origin_city,
      t.destination_city,
      t.departure_at,
      t.available_seats,
      t.price_per_seat,
      (
        case when lower(t.origin_city) = lower(requested_origin) then 35 else 0 end +
        case when lower(t.destination_city) = lower(requested_destination) then 35 else 0 end +
        case when t.kind = 'return' then 15 else 5 end +
        case when p.is_verified then 8 else 0 end +
        least(7, floor(p.rating)::integer)
      )::integer as match_score
    from public.trips t
    join public.profiles p on p.id = t.driver_id
    join public.vehicles v on v.id = t.vehicle_id
    where t.status in ('published', 'full')
      and t.available_seats >= requested_seats
      and (requested_departure is null or t.departure_at::date = requested_departure)
      and (
        requested_origin is null or lower(t.origin_city) like '%' || lower(requested_origin) || '%'
        or exists (select 1 from public.route_stops rs where rs.trip_id = t.id and lower(rs.city) like '%' || lower(requested_origin) || '%')
      )
      and (
        requested_destination is null or lower(t.destination_city) like '%' || lower(requested_destination) || '%'
        or exists (select 1 from public.route_stops rs where rs.trip_id = t.id and lower(rs.city) like '%' || lower(requested_destination) || '%')
      )
  )
  select * from scored order by match_score desc, price_per_seat asc, departure_at asc;
$$;

-- Create Booking Stored Function
create or replace function public.create_booking(
  requested_trip_id uuid,
  requested_seats integer,
  requested_pickup text,
  requested_dropoff text,
  requested_pickup_address text default null,
  requested_dropoff_address text default null,
  requested_payment_method text default 'upi'
)
returns public.bookings
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_trip public.trips;
  new_booking public.bookings;
  auth_passenger uuid := auth.uid();
  generated_pin text := lpad(floor(random() * 9000 + 1000)::text, 4, '0');
begin
  if auth_passenger is null then raise exception 'Authentication required'; end if;
  select * into current_trip from public.trips where id = requested_trip_id for update;
  if current_trip.id is null then raise exception 'Trip not found'; end if;
  if current_trip.available_seats < requested_seats then raise exception 'Not enough seats available'; end if;

  insert into public.bookings (
    trip_id, passenger_id, seats, pickup_city, dropoff_city,
    pickup_address, dropoff_address, total_price, payment_method,
    payment_status, booking_pin, status
  )
  values (
    requested_trip_id, auth_passenger, requested_seats, requested_pickup, requested_dropoff,
    coalesce(requested_pickup_address, requested_pickup || ' Central Point'),
    coalesce(requested_dropoff_address, requested_dropoff || ' City Center'),
    current_trip.price_per_seat * requested_seats,
    requested_payment_method,
    'paid',
    generated_pin,
    'confirmed'
  )
  returning * into new_booking;

  update public.trips set available_seats = available_seats - requested_seats,
    status = case when available_seats - requested_seats = 0 then 'full' else status end
    where id = requested_trip_id;

  update public.profiles set total_trips = total_trips + 1 where id = auth_passenger;

  return new_booking;
end;
$$;

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.route_stops enable row level security;
alter table public.bookings enable row level security;

-- Profiles Policies
create policy "Public can view verified profiles" on public.profiles for select using (is_verified = true or id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Users can update their profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins manage profiles" on public.profiles for all using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Vehicles Policies
create policy "Anyone can view verified vehicles" on public.vehicles for select using (is_verified = true or driver_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Drivers manage their vehicles" on public.vehicles for all using (driver_id = auth.uid()) with check (driver_id = auth.uid());

-- Trips Policies (Only verified drivers or admins can publish)
create policy "Anyone can view published trips" on public.trips for select using (status in ('published', 'full', 'in_progress') or driver_id = auth.uid());
create policy "Verified drivers create trips" on public.trips for insert with check (driver_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('driver', 'admin') and p.is_verified = true));
create policy "Drivers update their trips" on public.trips for update using (driver_id = auth.uid()) with check (driver_id = auth.uid());
create policy "Anyone can view route stops" on public.route_stops for select using (true);
create policy "Drivers manage route stops" on public.route_stops for all using (exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid())) with check (exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid()));

-- Bookings Policies
create policy "Passengers view their bookings" on public.bookings for select using (passenger_id = auth.uid() or exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid()));
create policy "Passengers create bookings" on public.bookings for insert with check (passenger_id = auth.uid());
create policy "Passengers cancel their bookings" on public.bookings for update using (passenger_id = auth.uid()) with check (passenger_id = auth.uid());
