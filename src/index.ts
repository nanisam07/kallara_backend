import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

// Load Environment Variables
dotenv.config();

// Import Routes
import adminRoutes from "./routes/admin";
import bookingRoutes from "./routes/booking";
import paymentRoutes from "./routes/payment";
import commissionRoutes from "./routes/commission";
import intakeRoutes from "./routes/intake";
import fulfillmentRoutes from "./routes/fulfillment";

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Body Parser
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api/", limiter);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Map API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/intakes", intakeRoutes);
app.use("/api/fulfillments", fulfillmentRoutes);

// Undefined Routes Handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("GLOBAL ERROR EXCEPTION:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Something went wrong inside the server!",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Kallara Server running in ${process.env.NODE_ENV || "development"} mode`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
