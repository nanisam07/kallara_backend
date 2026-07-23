"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "kallara_super_secret_jwt_key_2026_authentication_token";
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            status: "fail",
            error: "Authentication failed",
            message: "Access token is missing or invalid. Please supply a valid Bearer JWT.",
        });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            status: "fail",
            error: "Authentication failed",
            message: "JWT token is expired or invalid.",
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
