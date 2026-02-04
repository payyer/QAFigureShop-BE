import type { Request, Response } from "express";
import { authService } from "../services/AuthService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { RegisterInput, LoginInput } from "../dtos/auth.dto.js";
import { pick } from "../utils/pick.js";
import { AppError } from "../middleware/appError.js";

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body as RegisterInput,
    );

    // Set Refresh Token Cookie via Helper
    this.setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận.",
      data: { user, accessToken },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body as LoginInput,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: { user, accessToken },
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    // req.user is attached by protect middleware
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const userResponse = pick(user, [
      "_id",
      "name",
      "email",
      "role",
      "isVerified",
    ]);

    res.status(200).json({
      success: true,
      data: { user: userResponse },
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params.token as string;
    if (!token) {
      throw new AppError("Token is required", 400);
    }
    await authService.verifyEmail(token);
    res.status(200).json({
      success: true,
      message: "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.",
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("No Refresh Token found", 401);
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken);

    this.setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      accessToken,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      // Decode to get userId to clean DB
      // We can try/catch this, or just rely on the controller to clear cookie
      // For simplicity/security, let's clear cookie first.
      // Ideally we should decode it to find the user.
      // Or we can rely on middleware to provide user? No, logout might be called even if token expired.
      // Let's just clear the cookie on client.
      // If we want to clear DB, we need to verify the token first or pass userId from auth middleware.
      // Let's assume logout is a protected route? No, usually public.
      // Refined Logic based on plan: call authService.logout(userId)
      // Accessing userId requires decoding token.
    }

    // If request is authenticated (has accessToken), we can get user.id from req.user
    // If not, we still clear cookie.

    if (req.user) {
      await authService.logout((req.user as any)._id);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  });

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Prevent CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}

export const authController = new AuthController();
