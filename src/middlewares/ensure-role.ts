import { Request, Response, NextFunction } from "express";

export function ensureRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}
