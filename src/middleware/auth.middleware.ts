import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "./appError.js";

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!token) throw new Error("No token found");

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret_key",
      ) as unknown as JwtPayload;

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(
          new AppError("User belonging to this token no longer exists", 401),
        );
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return next(new AppError("Not authorized, token failed", 401));
    }
  }

  if (!token) {
    return next(new AppError("Not authorized, no token", 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not found in request", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role ${req.user.role} is not authorized to access this route`,
          403,
        ),
      );
    }
    next();
  };
};
