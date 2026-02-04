import type { Request, Response } from "express";
import { authService } from "../services/AuthService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { RegisterInput, LoginInput } from "../dtos/auth.dto.js";
import { pick } from "../utils/pick.js";
import { AppError } from "../middleware/appError.js";

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await authService.register(
      req.body as RegisterInput,
    );
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận.",
      data: { user, token },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await authService.login(req.body as LoginInput);
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: { user, token },
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
}

export const authController = new AuthController();
