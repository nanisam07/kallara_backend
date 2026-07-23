# Kallara Global Sourcing - Backend API Service

This is the Express + TypeScript backend service for Kallara Global Sourcing. It manages customer slot bookings, payment transactions (Mock / Razorpay integration), logistics fulfillments, and admin dashboard operations.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js
- **Server Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (pg client pool)
- **Validation**: Zod Schemas
- **Security**: JWT authentication, Bcrypt password hashing, Helmet headers, Rate limiting

---

## ⚙️ Project Structure
```text
backend/
├── docs/
│   └── swagger.json        # Open API Swagger documentation
├── src/
│   ├── config/             # Environment & general configurations
│   ├── db/
│   │   ├── init.sql        # PostgreSQL Schema tables & indexes
│   │   ├── db.ts           # PostgreSQL connection pool manager
│   │   └── migrate.ts      # Migration runner & seed script
│   ├── middleware/
│   │   ├── auth.ts         # JWT Verification middleware
│   │   └── validate.ts     # Zod request parameters validation
│   ├── routes/             # Prefix route mapping controllers
│   │   ├── admin.ts
│   │   ├── booking.ts
│   │   ├── commission.ts
│   │   ├── fulfillment.ts
│   │   ├── intake.ts
│   │   └── payment.ts
│   ├── services/
│   │   ├── CommissionService.ts   # Automatic basket fee calculator
│   │   ├── NotificationService.ts # Mock email logs trigger
│   │   └── PaymentService.ts      # Order abstraction gateway
│   └── index.ts            # Server entry point
├── .env.example            # Env variables template
├── tsconfig.json           # TS compiler config
└── package.json            # Node project script & dependencies
```

---

## 🚀 Setup & Execution Instructions

### 1. PostgreSQL Database Configuration
Since you do not have a local PostgreSQL setup yet, please follow these steps to initialize it:

1. **Install PostgreSQL** (v14 or higher is recommended) on your machine or deploy a cloud instance (e.g., Supabase, Aiven, AWS RDS).
2. **Create a Database** named `kallara`. You can execute this via terminal or any GUI client (like pgAdmin or DBeaver):
   ```sql
   CREATE DATABASE kallara;
   ```
3. Copy `.env.example` into a new `.env` file in the `backend/` directory:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and replace the database connection credentials (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) with your actual server configuration.

### 2. Install Dependencies
Run the following command inside the `backend/` folder:
```bash
npm install
```

### 3. Run Database Migrations & Seeds
Execute the migration script to build the tables, indexes, and seed the default admin:
```bash
npm run db:init
```
*This command runs `src/db/migrate.ts` which loads `init.sql` and inserts a default admin user:*
- **Admin Email**: `admin@kallara.com`
- **Admin Password**: `admin123`

### 4. Start the Server
Start the Express server in development hot-reload mode:
```bash
npm run dev
```
The server will boot up by default on: **`http://localhost:5000`**

---

## 📍 REST API Reference

All requests must be sent with `Content-Type: application/json`. Admin protected endpoints require a `Authorization: Bearer <JWT_TOKEN>` header.

### Public Routes
- **Create Booking**: `POST /api/bookings`
  - Body: `customerName`, `email`, `phone`, `country`, `packageType` ('market-express'|'premium-event'), `bookingDate`, `bookingTime`, `notes`
- **Get Booking**: `GET /api/bookings/:id` (Accepts public KL-... ID or DB UUID)
- **Create Payment Order**: `POST /api/payments/create-order`
  - Body: `bookingId`
- **Verify Payment**: `POST /api/payments/verify`
  - Body: `orderId`, `shouldSucceed` (boolean)
- **Calculate Sourcing Commission**: `POST /api/commission/calculate`
  - Body: `basketValue`
- **Submit Styling Intake**: `POST /api/intakes`
  - Body: `fullName`, `country`, `city`, `timezone`, `whatsapp`, `language`, `categories` (string[]), `budget`, `digitalSignature`, etc.

### Admin Secured Routes
- **Admin Login**: `POST /api/admin/login`
  - Body: `email`, `password` -> Returns JWT.
- **Admin Profile**: `GET /api/admin/profile`
- **List All Bookings**: `GET /api/bookings`
- **Update Booking Status**: `PATCH /api/bookings/:id`
  - Body: `paymentStatus` ('PENDING'|'SUCCESS'|'FAILED'), `bookingStatus` ('PENDING'|'CONFIRMED'|'STYLIST_ASSIGNED'|'SESSION_SCHEDULED'|'COMPLETED'|'CANCELLED'), `assignedTo` (string), `meetingLink` (url), `notes` (string)
- **Create Sourcing Fulfillment**: `POST /api/fulfillments`
  - Body: `bookingId`, `basketValue`, `shippingCost`, `trackingNumber`, `courierName`
- **Get Sourcing Fulfillment**: `GET /api/fulfillments/:bookingId`

---

## 📖 Swagger API Documentation
OpenAPI 3.0 specs are available in `backend/docs/swagger.json` and can be loaded directly into Swagger UI or Postman to easily test the server endpoints.
# kallara_backend
