import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { authConfig } from "../config/auth";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = verify(token, authConfig.jwt.secret);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
