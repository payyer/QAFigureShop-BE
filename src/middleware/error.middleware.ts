import type { Request, Response, NextFunction } from "express";
import { AppError } from "./appError.js";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found. Invalid: ${err.path}`;
  }

  // Handle Zod Validation Error (Duck Typing for robustness)
  const isZodError =
    err instanceof ZodError ||
    err.name === "ZodError" ||
    (err.errors &&
      Array.isArray(err.errors) &&
      err.errors.length > 0 &&
      err.errors[0].path);

  if (isZodError) {
    statusCode = 400;
    // Zod errors usually live in .errors or .issues
    const issues = err.errors || err.issues || [];
    const zodErrors = issues
      .map((e: any) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    message = `Validation Error: ${zodErrors}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
