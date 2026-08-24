-- Wayfare intercity mobility marketplace
-- Schema seed v1: trips, route matching, authentication, and bookings.
-- Run this file once in Supabase Dashboard > SQL Editor.

create extension if not exists "pgcrypto";

create type public.trip_kind as enum ('existing', 'return', 'fresh_request');
create type public.trip_status as enum ('published', 'full', 'completed', 'cancelled');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');
create type public.vehicle_type as enum ('sedan', 'suv', 'van', 'tempo_traveller');

create table public.profiles (
  id uuid primary key,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'passenger' check (role in ('passenger', 'driver', 'both')),
  city text,
  rating numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  total_trips integer not null default 0 check (total_trips >= 0),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  make_model text not null,
  vehicle_type public.vehicle_type not null,
  registration_number text,
  seat_capacity integer not null check (seat_capacity between 1 and 20),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

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

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete restrict,
  passenger_id uuid not null references public.profiles(id) on delete restrict,
  seats integer not null default 1 check (seats between 1 and 8),
  pickup_city text not null,
  dropoff_city text not null,
  total_price numeric(10,2) not null check (total_price >= 0),
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (trip_id, passenger_id, status)
);

create index trips_search_idx on public.trips (origin_city, destination_city, departure_at, status);
create index trips_departure_idx on public.trips (departure_at);
create index route_stops_city_idx on public.route_stops (city, trip_id);
create index bookings_trip_idx on public.bookings (trip_id, status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.phone,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.search_trips(
  requested_origin text,
  requested_destination text,
  requested_departure date,
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
    where t.status = 'published'
      and t.available_seats >= requested_seats
      and t.departure_at::date = requested_departure
      and (lower(t.origin_city) = lower(requested_origin)
        or lower(t.destination_city) = lower(requested_destination)
        or exists (
          select 1 from public.route_stops rs
          where rs.trip_id = t.id
            and lower(rs.city) in (lower(requested_origin), lower(requested_destination))
        ))
  )
  select * from scored order by match_score desc, price_per_seat asc, departure_at asc;
$$;

create or replace function public.create_booking(
  requested_trip_id uuid,
  requested_seats integer,
  requested_pickup text,
  requested_dropoff text
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
begin
  if auth_passenger is null then raise exception 'Authentication required'; end if;
  select * into current_trip from public.trips where id = requested_trip_id for update;
  if current_trip.id is null then raise exception 'Trip not found'; end if;
  if current_trip.available_seats < requested_seats then raise exception 'Not enough seats available'; end if;
  insert into public.bookings (trip_id, passenger_id, seats, pickup_city, dropoff_city, total_price, status)
  values (requested_trip_id, auth_passenger, requested_seats, requested_pickup, requested_dropoff, current_trip.price_per_seat * requested_seats, 'confirmed')
  returning * into new_booking;
  update public.trips set available_seats = available_seats - requested_seats,
    status = case when available_seats - requested_seats = 0 then 'full' else status end
    where id = requested_trip_id;
  return new_booking;
end;
$$;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.route_stops enable row level security;
alter table public.bookings enable row level security;

create policy "Public can view verified profiles" on public.profiles for select using (is_verified = true or id = auth.uid());
create policy "Users can update their profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Anyone can view verified vehicles" on public.vehicles for select using (is_verified = true or driver_id = auth.uid());
create policy "Drivers manage their vehicles" on public.vehicles for all using (driver_id = auth.uid()) with check (driver_id = auth.uid());
create policy "Anyone can view published trips" on public.trips for select using (status in ('published', 'full') or driver_id = auth.uid());
create policy "Drivers create trips" on public.trips for insert with check (driver_id = auth.uid());
create policy "Drivers update their trips" on public.trips for update using (driver_id = auth.uid()) with check (driver_id = auth.uid());
create policy "Anyone can view route stops" on public.route_stops for select using (true);
create policy "Drivers manage route stops" on public.route_stops for all using (exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid())) with check (exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid()));
create policy "Passengers view their bookings" on public.bookings for select using (passenger_id = auth.uid() or exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid()));
create policy "Passengers create bookings" on public.bookings for insert with check (passenger_id = auth.uid());
create policy "Passengers cancel their bookings" on public.bookings for update using (passenger_id = auth.uid()) with check (passenger_id = auth.uid());

-- Demo records. These profiles are intentionally standalone so the UI works before sign-up.
insert into public.profiles (id, full_name, phone, role, city, rating, total_trips, is_verified) values
('00000000-0000-0000-0000-000000000001', 'Arjun Mehta', '+91 98765 43210', 'driver', 'Jabalpur', 4.9, 128, true),
('00000000-0000-0000-0000-000000000002', 'Nikhil Sharma', '+91 98111 22334', 'driver', 'Jabalpur', 4.8, 86, true),
('00000000-0000-0000-0000-000000000003', 'Priya Kapoor', null, 'passenger', 'Jaipur', 5.0, 4, true)
on conflict (id) do nothing;

insert into public.vehicles (id, driver_id, make_model, vehicle_type, registration_number, seat_capacity, is_verified) values
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Maruti Suzuki Ertiga', 'suv', 'MP 20 CA 4821', 6, true),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Toyota Innova Crysta', 'suv', 'MP 20 CB 9173', 6, true)
on conflict (id) do nothing;

insert into public.trips (id, driver_id, vehicle_id, kind, origin_city, destination_city, origin_lat, origin_lng, destination_lat, destination_lng, departure_at, return_at, total_seats, available_seats, price_per_seat, estimated_duration_minutes, notes) values
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'return', 'Jabalpur', 'Jaipur', 23.1815, 79.9864, 26.9124, 75.7873, '2025-08-12 07:00:00+05:30', '2025-08-15 08:00:00+05:30', 4, 3, 1249, 630, 'Returning from Jaipur after a three-day stay.'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'existing', 'Jabalpur', 'Jaipur', 23.1815, 79.9864, 26.9124, 75.7873, '2025-08-12 21:30:00+05:30', null, 4, 2, 1680, 585, 'Direct overnight trip with one scheduled rest stop.')
on conflict (id) do nothing;

insert into public.route_stops (trip_id, stop_order, city, latitude, longitude, arrival_offset_minutes) values
('20000000-0000-0000-0000-000000000001', 0, 'Jabalpur', 23.1815, 79.9864, 0),
('20000000-0000-0000-0000-000000000001', 1, 'Katni', 23.8344, 80.3950, 90),
('20000000-0000-0000-0000-000000000001', 2, 'Kota', 25.2138, 75.8648, 450),
('20000000-0000-0000-0000-000000000001', 3, 'Jaipur', 26.9124, 75.7873, 630),
('20000000-0000-0000-0000-000000000002', 0, 'Jabalpur', 23.1815, 79.9864, 0),
('20000000-0000-0000-0000-000000000002', 1, 'Sagar', 23.8388, 78.7378, 150),
('20000000-0000-0000-0000-000000000002', 2, 'Jaipur', 26.9124, 75.7873, 585)
on conflict (trip_id, stop_order) do nothing;

-- Example client environment values (never expose the service role key in the browser):
-- VITE_SUPABASE_URL=https://<project-ref>.supabase.co
-- VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
-- SUPABASE_URL=https://<project-ref>.supabase.co
-- SUPABASE_SERVICE_ROLE_KEY=<server-only-secret>
