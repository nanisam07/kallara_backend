# Kallara Backend - Production Deployment & Infrastructure Guide

This document outlines the requirements and step-by-step procedure to deploy the Kallara Express + TypeScript backend service and initialize its PostgreSQL database in a production environment.

---

## 1. Prerequisites & Hosting Platforms

### Recommended Hosting Providers
*   **Render** (Recommended): Simplest platform to host Express.js servers with auto-deploy from Git and built-in managed PostgreSQL databases.
*   **Railway**: Excellent for deploying Node.js apps and PostgreSQL instances with minimal setup.
*   **AWS (Lightsail or ECS)**: Ideal for custom Docker or VM instances if more scalability is needed.

### Engine Requirements
*   **Node.js**: `v18.x` or `v20.x` (LTS)
*   **PostgreSQL**: `v14` or higher

---

## 2. Environment Variables Checklist

Ensure that the following environment variables are defined in your production hosting platform dashboard:

| Variable | Description | Production Value Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Running environment | `production` |
| `PORT` | HTTP Port for Express | `5000` (or leave default if managed by host) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:port/dbname` |
| `CORS_ORIGIN` | Allowed Client Frontend origin | `https://kallara-app.vercel.app` |
| `JWT_SECRET` | Signing secret for Admin JWTs | *Generate a long, secure cryptorandom string* |
| `JWT_EXPIRES_IN` | Session token lifespan | `24h` |
| `BCRYPT_SALT_ROUNDS` | Password hash complexity | `10` |
| `RATE_LIMIT_WINDOW_MS` | IP request rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX` | Max requests per IP in window | `200` (increase if high traffic) |
| `SMTP_HOST` | Hostname of the mail server | `smtp.gmail.com` |
| `SMTP_PORT` | Port of the mail server | `587` or `465` |
| `SMTP_USER` | Username of the mail account | `kallaraservices@gmail.com` |
| `SMTP_PASS` | Password/App Password of the account | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM_EMAIL` | Sender address | `kallaraservices@gmail.com` |
| `SMTP_FROM_NAME` | Display name of sender | `Kallara Global Concierge` |

---

## 3. Database Initialization from Scratch

To set up a fresh production database:

1.  **Provision PostgreSQL**: Create a new empty database named `kallara` on your hosting provider (e.g. Render PostgreSQL or Supabase).
2.  **Locate Schema File**: The complete schema is defined in [init.sql](file:///c:/Users/samue/Desktop/kallara/kallara-main/backend/src/db/init.sql).
3.  **Run Initialization**:
    *   **Option A (Auto-Migration)**: If you connect your database and run the backend build scripts, you can execute the following command in the server shell:
        ```bash
        npm run db:init
        ```
        This command runs [migrate.ts](file:///c:/Users/samue/Desktop/kallara/kallara-main/backend/src/db/migrate.ts) to execute `init.sql` and seeds the default administrator.
    *   **Option B (Manual Import)**: Import `init.sql` directly using a PostgreSQL client tool (like `psql` or DBeaver):
        ```bash
        psql -U <YOUR_DB_USER> -h <YOUR_DB_HOST> -d kallara -f src/db/init.sql
        ```

### Seed Administrator Details
By default, the database initialization script seeds a single system administrator if the `admins` table is empty:
*   **Email**: `admin@kallara.com`
*   **Password**: `admin123` *(We strongly recommend logging in and changing this password immediately upon deployment).*

---

## 4. Build & Run Commands

Configure the hosting platform to run the following build and startup commands:

*   **Build Command**:
    ```bash
    npm install && npm run build
    ```
    *(Under the hood, `npm run build` runs `tsc` to compile TypeScript to JavaScript in the `dist` folder).*
*   **Start Command**:
    ```bash
    npm run start
    ```
    *(Runs `node dist/index.js`).*

---

## 5. Frontend Integration & CORS

*   **Production Backend Base URL**: Update your Next.js application's environment variable (e.g., `NEXT_PUBLIC_API_URL`) to point to your deployed URL (e.g., `https://kallara-api.onrender.com`).
*   **CORS Policy**: Ensure the backend's `CORS_ORIGIN` matches the exact URL of your production Next.js frontend. The backend will reject any cross-origin requests that do not match this origin.
