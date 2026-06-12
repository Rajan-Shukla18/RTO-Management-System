-- RTO Management System - Supabase PostgreSQL Schema
-- Phase 2 Migration Script

-- Compatibility Notes & Differences from SQLite:
-- 1. Auto-incrementing primary keys: SQLite uses `INTEGER PRIMARY KEY AUTOINCREMENT`. Postgres uses `SERIAL PRIMARY KEY`.
-- 2. Datetimes: SQLite uses `DATETIME DEFAULT CURRENT_TIMESTAMP` stored as text. Postgres uses `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.
-- 3. Booleans/Strings: Handled natively in Postgres just like SQLite.
-- 4. Foreign Keys: Postgres enforces FK constraints strictly. `ON DELETE CASCADE` is fully supported.

-- 1. Owners Table
CREATE TABLE IF NOT EXISTS owners (
  owner_id SERIAL PRIMARY KEY,
  user_id INTEGER DEFAULT 1,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(50),
  mobile_no VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  aadhar_no VARCHAR(20) UNIQUE,
  permanent_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups by aadhar/mobile
CREATE INDEX idx_owners_aadhar ON owners(aadhar_no);
CREATE INDEX idx_owners_mobile ON owners(mobile_no);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES owners(owner_id) ON DELETE CASCADE,
  chassis_number VARCHAR(100) UNIQUE,
  engine_number VARCHAR(100) UNIQUE,
  manufacturer VARCHAR(100),
  model_name VARCHAR(100),
  vehicle_type VARCHAR(50),
  fuel_type VARCHAR(50),
  color VARCHAR(50),
  manufacturing_year INTEGER
);

-- Index for quick lookups by chassis/engine or owner
CREATE INDEX idx_vehicles_chassis ON vehicles(chassis_number);
CREATE INDEX idx_vehicles_engine ON vehicles(engine_number);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);

-- 3. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  registration_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  registration_no VARCHAR(50) UNIQUE,
  registration_date DATE,
  registration_expiry DATE,
  status VARCHAR(50) DEFAULT 'Pending'
);

-- Index for searching registrations by vehicle or number
CREATE INDEX idx_registrations_reg_no ON registrations(registration_no);
CREATE INDEX idx_registrations_vehicle ON registrations(vehicle_id);

-- 4. Insurance Table
CREATE TABLE IF NOT EXISTS insurance (
  insurance_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  policy_number VARCHAR(100) UNIQUE,
  provider_name VARCHAR(100),
  insurance_type VARCHAR(50),
  start_date DATE,
  expiry_date DATE,
  premium_amount DECIMAL(10, 2)
);

-- Index for fast expiry checks (Alerts)
CREATE INDEX idx_insurance_expiry ON insurance(expiry_date);
CREATE INDEX idx_insurance_vehicle ON insurance(vehicle_id);

-- 5. Driving Licenses Table
CREATE TABLE IF NOT EXISTS driving_licenses (
  license_id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES owners(owner_id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE,
  license_type VARCHAR(50),
  issue_date DATE,
  expiry_date DATE,
  issuing_rto VARCHAR(50)
);

-- Index for fast expiry checks (Alerts)
CREATE INDEX idx_licenses_expiry ON driving_licenses(expiry_date);
CREATE INDEX idx_licenses_owner ON driving_licenses(owner_id);

-- 6. RTO Offices Table
CREATE TABLE IF NOT EXISTS rto_offices (
  office_id SERIAL PRIMARY KEY,
  office_code VARCHAR(50) UNIQUE,
  office_name VARCHAR(255),
  city VARCHAR(100),
  address TEXT,
  contact_no VARCHAR(50),
  jurisdiction_area VARCHAR(100)
);

-- 7. Activities (Audit Log) Table
CREATE TABLE IF NOT EXISTS activities (
  activity_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  related_entity VARCHAR(255),
  performed_by VARCHAR(100),
  status VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast sorting of audit logs
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);

-- Note: In Supabase, you must ensure that Row Level Security (RLS) is either disabled,
-- or properly configured. Since your current SQLite database does not have row-level permissions, 
-- we will leave RLS disabled for these tables by default during migration. You can lock this down later.
