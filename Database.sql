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

-- ================= STUDENTS =================
CREATE TABLE student_profiles (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID UNIQUE REFERENCES users(id),
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

-- ================= CLIENT =================
CREATE TABLE client_profiles (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID UNIQUE REFERENCES users(id),
company_name TEXT NOT NULL,
gst_number TEXT UNIQUE,
verified BOOLEAN DEFAULT FALSE,
contact_person TEXT,
avg_rating NUMERIC(3,2)
);

-- ================= GIGS =================
CREATE TABLE gigs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
client_id UUID REFERENCES client_profiles(id),
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
gig_id UUID REFERENCES gigs(id),
student_id UUID REFERENCES student_profiles(id),
status application_status DEFAULT 'applied',
applied_at TIMESTAMPTZ DEFAULT now(),
confirmed_at TIMESTAMPTZ,
cancelled_at TIMESTAMPTZ,
UNIQUE (gig_id, student_id)
);

-- ================= ATTENDANCE =================
CREATE TABLE attendance (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
application_id UUID REFERENCES gig_applications(id),
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
gig_id UUID REFERENCES gigs(id),
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


-- ================= USERS =================
INSERT INTO users (id, type, email, phone, password_hash, status) VALUES
(gen_random_uuid(), 'student', '[aryan@mail.com](mailto:aryan@mail.com)', '9990000001', 'hash1', 'active'),
(gen_random_uuid(), 'student', '[rohit@mail.com](mailto:rohit@mail.com)', '9990000002', 'hash2', 'active'),
(gen_random_uuid(), 'student', '[sneha@mail.com](mailto:sneha@mail.com)', '9990000003', 'hash3', 'active'),
(gen_random_uuid(), 'client', '[zomato@mail.com](mailto:zomato@mail.com)', '8880000001', 'hash4', 'active'),
(gen_random_uuid(), 'client', '[flipkart@mail.com](mailto:flipkart@mail.com)', '8880000002', 'hash5', 'active');

-- ================= COLLEGES =================
INSERT INTO colleges (id, name, city, state, admin_user_id, verified)
SELECT
gen_random_uuid(),
'IIT BHU',
'Varanasi',
'UP',
u.id,
TRUE
FROM users u WHERE u.type = 'client' LIMIT 1;

INSERT INTO colleges (id, name, city, state, admin_user_id, verified)
SELECT
gen_random_uuid(),
'MMMUT',
'Gorakhpur',
'UP',
u.id,
TRUE
FROM users u WHERE u.type = 'client' OFFSET 1 LIMIT 1;

-- ================= STUDENT PROFILES =================
INSERT INTO student_profiles (id, user_id, college_id, college_name, year, skills, xp, level)
SELECT
gen_random_uuid(),
u.id,
c.id,
c.name,
2,
ARRAY['Marketing','Communication'],
300,
'rising'
FROM users u, colleges c
WHERE u.type = 'student'
LIMIT 3;

-- ================= CLIENT PROFILES =================
INSERT INTO client_profiles (id, user_id, company_name, verified)
SELECT gen_random_uuid(), id, 'Zomato', TRUE
FROM users WHERE email = '[zomato@mail.com](mailto:zomato@mail.com)';

INSERT INTO client_profiles (id, user_id, company_name, verified)
SELECT gen_random_uuid(), id, 'Flipkart', TRUE
FROM users WHERE email = '[flipkart@mail.com](mailto:flipkart@mail.com)';

-- ================= GIGS =================
INSERT INTO gigs (id, client_id, title, description, location, latitude, longitude, pay_per_day, slots, status)
SELECT
gen_random_uuid(),
cp.id,
'Campus Promotion',
'Promote brand on campus',
'IIT BHU',
25.2, 82.9,
500,
3,
'published'
FROM client_profiles cp LIMIT 1;

INSERT INTO gigs (id, client_id, title, description, location, latitude, longitude, pay_per_day, slots, status)
SELECT
gen_random_uuid(),
cp.id,
'Event Management',
'Manage college fest',
'MMMUT',
26.7, 83.3,
700,
2,
'published'
FROM client_profiles cp OFFSET 1 LIMIT 1;

-- ================= APPLICATIONS =================
INSERT INTO gig_applications (id, gig_id, student_id, status)
SELECT
gen_random_uuid(),
g.id,
sp.id,
'confirmed'
FROM gigs g, student_profiles sp
LIMIT 3;

-- ================= ATTENDANCE =================
INSERT INTO attendance (id, application_id, date, check_in_time, check_out_time, status)
SELECT
gen_random_uuid(),
ga.id,
CURRENT_DATE,
now(),
now() + interval '8 hours',
'checked_out'
FROM gig_applications ga;

-- ================= PAYMENTS =================
INSERT INTO payments (id, gig_id, client_id, total_amount, escrow_status, platform_fee)
SELECT
gen_random_uuid(),
g.id,
cp.id,
3000,
'released',
300
FROM gigs g JOIN client_profiles cp ON g.client_id = cp.id;

-- ================= PAYOUTS =================
INSERT INTO payouts (id, student_id, gig_id, amount, status)
SELECT
gen_random_uuid(),
sp.id,
g.id,
1000,
'completed'
FROM student_profiles sp, gigs g
LIMIT 3;

-- ================= RATINGS =================
INSERT INTO ratings (id, gig_id, from_user_id, to_user_id, score, comment)
SELECT
gen_random_uuid(),
g.id,
u1.id,
u2.id,
5,
'Great work!'
FROM gigs g
JOIN users u1 ON u1.type = 'client'
JOIN users u2 ON u2.type = 'student'
LIMIT 3;


SELECT * FROM users;