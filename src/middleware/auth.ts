import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "kallara_super_secret_jwt_key_2026_authentication_token";

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: "fail",
      error: "Authentication failed",
      message: "JWT token is expired or invalid.",
    });
  }
};
