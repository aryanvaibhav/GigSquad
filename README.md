# GigSquad Backend Documentation

## 1. Overview

The GigSquad backend is designed to handle user authentication, data management, and business logic for a gig marketplace connecting students and clients.

---

## 2. Architecture

The backend follows a modular architecture:

- Controllers → Handle business logic
- Routes → Define API endpoints
- Middleware → Handle authentication and security
- Config → Database connection setup

This separation ensures scalability and maintainability.

---

## 3. Authentication System

The authentication system is built using JWT.

### Flow:
1. User registers with credentials
2. Password is hashed using bcrypt
3. On login, a JWT token is generated
4. Token is verified using middleware for protected routes

---

## 4. Database Design

The system uses PostgreSQL with a structured schema.

### Key Features:
- ENUM types for roles and statuses
- Strong constraints (NOT NULL, UNIQUE)
- Relational tables (users, profiles, gigs, etc.)
- UUID-based primary keys

---

## 5. Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for stateless authentication
- Environment variables are used for sensitive data

---

## 6. API Design

RESTful API structure:

- POST /register → Create user
- POST /login → Authenticate user
- GET /protected → Secured endpoint

---

## 7. Future Enhancements

- Role-based access control
- Profile completion flows
- File uploads for KYC
- Payment integration
- Real-time gig tracking

---

## 8. Conclusion

The backend establishes a strong foundation for building a scalable gig marketplace platform.
