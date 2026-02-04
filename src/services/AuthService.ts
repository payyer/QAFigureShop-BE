import { User, type IUser } from "../models/User.js";
import type {
  RegisterInput,
  LoginInput,
  UserResponse,
} from "../dtos/auth.dto.js";
import { AppError } from "../middleware/appError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { emailService } from "./EmailService.js";

import { pick } from "../utils/pick.js";

export class AuthService {
  async register(
    input: RegisterInput,
  ): Promise<{ user: Partial<IUser>; token: string }> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError("Email đã tồn tại", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Explicitly cast to unknown first to avoid TS error with ObjectId
    const userIdStr = newUser._id as unknown as string;
    const token = this.generateToken(userIdStr);

    try {
      await emailService.sendVerificationEmail(
        newUser.email,
        verificationToken,
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    const userResponse = pick(newUser, [
      "_id",
      "name",
      "email",
      "role",
      "isVerified",
    ]);
    return { user: userResponse, token };
  }

  async login(
    input: LoginInput,
  ): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new AppError("Thông tin đăng nhập không chính xác", 401);
    }

    if (!user.password) {
      throw new AppError("Tài khoản này đăng nhập bằng Google/Facebook", 400);
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError("Thông tin đăng nhập không chính xác", 401);
    }

    // Explicitly cast to unknown first to avoid TS error with ObjectId
    const userIdStr = user._id as unknown as string;
    const token = this.generateToken(userIdStr);

    const userResponse = pick(user, [
      "_id",
      "name",
      "email",
      "role",
      "isVerified",
    ]);
    return { user: userResponse, token };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Token không hợp lệ hoặc đã hết hạn", 400);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || "default_secret_key",
      {
        expiresIn: "1d",
      },
    );
  }
}

export const authService = new AuthService();
