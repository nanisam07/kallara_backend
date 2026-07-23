"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load Environment Variables
dotenv_1.default.config();
// Import Routes
const admin_1 = __importDefault(require("./routes/admin"));
const booking_1 = __importDefault(require("./routes/booking"));
const payment_1 = __importDefault(require("./routes/payment"));
const commission_1 = __importDefault(require("./routes/commission"));
const intake_1 = __importDefault(require("./routes/intake"));
const fulfillment_1 = __importDefault(require("./routes/fulfillment"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    credentials: true,
}));
// Body Parser
app.use(express_1.default.json());
// Rate Limiter
const limiter = (0, express_rate_limit_1.default)({
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
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Map API Routes
app.use("/api/admin", admin_1.default);
app.use("/api/bookings", booking_1.default);
app.use("/api/payments", payment_1.default);
app.use("/api/commission", commission_1.default);
app.use("/api/intakes", intake_1.default);
app.use("/api/fulfillments", fulfillment_1.default);
// Undefined Routes Handler
app.use("*", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
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
