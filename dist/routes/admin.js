"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db/db");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "kallara_super_secret_jwt_key_2026_authentication_token";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
// Admin Login
router.post("/login", (0, validate_1.validate)(validate_1.adminLoginSchema), async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await (0, db_1.query)("SELECT * FROM admins WHERE email = $1 LIMIT 1;", [email]);
        if (result.rows.length === 0) {
            res.status(401).json({ status: "fail", message: "Invalid email or password" });
            return;
        }
        const admin = result.rows[0];
        const isMatch = await bcryptjs_1.default.compare(password, admin.password);
        if (!isMatch) {
            res.status(401).json({ status: "fail", message: "Invalid email or password" });
            return;
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: admin.id, name: admin.name, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({
            status: "success",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    }
    catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
// Admin Profile
router.get("/profile", auth_1.authenticateAdmin, async (req, res) => {
    if (!req.admin) {
        res.status(401).json({ status: "fail", message: "Unauthorized" });
        return;
    }
    try {
        const result = await (0, db_1.query)("SELECT id, name, email, role, created_at FROM admins WHERE id = $1 LIMIT 1;", [req.admin.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ status: "fail", message: "Admin profile not found" });
            return;
        }
        res.json({
            status: "success",
            admin: result.rows[0],
        });
    }
    catch (error) {
        console.error("Get admin profile error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.default = router;
