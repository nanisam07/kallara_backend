import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/db";
import { validate, adminLoginSchema } from "../middleware/validate";
import { authenticateAdmin, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "kallara_super_secret_jwt_key_2026_authentication_token";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Admin Login
router.post("/login", validate(adminLoginSchema), async (req, res): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await query("SELECT * FROM admins WHERE email = $1 LIMIT 1;", [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ status: "fail", message: "Invalid email or password" });
      return;
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ status: "fail", message: "Invalid email or password" });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

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
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Admin Profile
router.get("/profile", authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.admin) {
    res.status(401).json({ status: "fail", message: "Unauthorized" });
    return;
  }

  try {
    const result = await query("SELECT id, name, email, role, created_at FROM admins WHERE id = $1 LIMIT 1;", [req.admin.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ status: "fail", message: "Admin profile not found" });
      return;
    }
    
    res.json({
      status: "success",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
