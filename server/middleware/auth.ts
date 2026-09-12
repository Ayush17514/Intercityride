import { Request, Response, NextFunction } from "express";
import { db } from "../db";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = db.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  res.locals.user = user;
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (res.locals.user.role !== "admin") {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    next();
  });
};
