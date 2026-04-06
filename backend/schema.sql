-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================= ENUMS =================
CREATE TYPE user_type AS ENUM ('student','client','college_admin','supervisor','admin');
CREATE TYPE user_status AS ENUM ('active','suspended','deleted');
CREATE TYPE gig_status AS ENUM ('draft','published','in_progress','completed','cancelled');
CREATE TYPE application_status AS ENUM ('applied','confirmed','rejected','cancelled','completed','no_show');
CREATE TYPE attendance_status AS ENUM ('checked_in','checked_out','absent','excused');
CREATE TYPE escrow_status AS ENUM ('pending','held','released','refunded','disputed');
CREATE TYPE payout_status AS ENUM ('pending','processing','completed','failed');
CREATE TYPE level_type AS ENUM ('rookie','rising','regular','pro','elite');

-- ================= USERS =================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type user_type NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status user_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================= COLLEGES =================
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  city TEXT,
  state TEXT,
  admin_user_id UUID REFERENCES users(id),
  verified BOOLEAN DEFAULT FALSE,
  partner_since DATE
);

-- ================= STUDENT PROFILES =================
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id),
  college_name TEXT,
  year INT CHECK (year BETWEEN 1 AND 10),
  skills TEXT[],
  availability JSONB,
  reliability_score INT CHECK (reliability_score BETWEEN 0 AND 100),
  xp INT DEFAULT 0,
  level level_type DEFAULT 'rookie',
  total_gigs INT DEFAULT 0,
  total_earned NUMERIC(12,2) DEFAULT 0,
  avg_rating NUMERIC(3,2),
  aadhar_verified BOOLEAN DEFAULT FALSE,
  bank_details JSONB
);

-- ================= CLIENT PROFILES =================
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  gst_number TEXT UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  contact_person TEXT,
  avg_rating NUMERIC(3,2)
);

-- ================= GIGS =================
CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  start_date DATE,
  end_date DATE,
  pay_per_day NUMERIC(10,2),
  slots INT CHECK (slots > 0),
  filled_slots INT DEFAULT 0,
  gig_type TEXT,
  requirements JSONB,
  dress_code TEXT,
  geo_fence_radius INT DEFAULT 100,
  status gig_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================= APPLICATIONS =================
CREATE TABLE gig_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  status application_status DEFAULT 'applied',
  applied_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  UNIQUE (gig_id, student_id)
);

-- ================= ATTENDANCE =================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES gig_applications(id) ON DELETE CASCADE,
  date DATE,
  check_in_time TIMESTAMPTZ,
  check_in_lat DOUBLE PRECISION,
  check_in_lng DOUBLE PRECISION,
  check_in_selfie TEXT,
  check_out_time TIMESTAMPTZ,
  check_out_lat DOUBLE PRECISION,
  check_out_lng DOUBLE PRECISION,
  status attendance_status
);

-- ================= PAYMENTS =================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_profiles(id),
  total_amount NUMERIC(12,2),
  escrow_status escrow_status DEFAULT 'pending',
  platform_fee NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================= PAYOUTS =================
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id),
  gig_id UUID REFERENCES gigs(id),
  amount NUMERIC(12,2),
  status payout_status DEFAULT 'pending',
  upi_bank_ref TEXT,
  processed_at TIMESTAMPTZ
);

-- ================= RATINGS =================
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES gigs(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  score INT CHECK (score BETWEEN 1 AND 5),
  tags TEXT[],
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);