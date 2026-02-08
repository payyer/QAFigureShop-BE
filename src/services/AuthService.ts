import { User, type IUser } from "../models/User.js";
import type { RegisterInput, LoginInput } from "../dtos/auth.dto.js";
import { AppError } from "../middleware/appError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { emailService } from "./EmailService.js";

import { pick } from "../utils/pick.js";

export class AuthService {
  async register(input: RegisterInput): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
  }> {
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
    const { accessToken, refreshToken } = this.generateTokens(userIdStr);

    // Save refreshToken to DB
    newUser.refreshToken = refreshToken;
    await newUser.save();

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
    return { user: userResponse, accessToken, refreshToken };
  }

  async login(input: LoginInput): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
  }> {
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
    const { accessToken, refreshToken } = this.generateTokens(userIdStr);

    // Save refreshToken to DB (Single Session Strategy)
    user.refreshToken = refreshToken;
    await user.save();

    const userResponse = pick(user, [
      "_id",
      "name",
      "email",
      "role",
      "isVerified",
    ]);
    return { user: userResponse, accessToken, refreshToken };
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

  async refreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Verify Token Signature
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
      ) as { id: string };
    } catch (error) {
      throw new AppError("Invalid Refresh Token", 403);
    }

    // 2. Find User with this token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: token,
    });

    if (!user) {
      // Possible Token Reuse Detected! (Security Alert)
      // In a real app, we might want to invalidate ALL tokens for this user.
      throw new AppError("Invalid Refresh Token (Reuse or Revoked)", 403);
    }

    // 3. Rotate Token (Generate NEW pair)
    const userIdStr = user._id as unknown as string;
    const tokens = this.generateTokens(userIdStr);

    // 4. Update DB with NEW Refresh Token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  private generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jwt.sign(
      { id: userId },
      process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret",
      { expiresIn: (process.env.ACCESS_TOKEN_EXPIRE as any) || "15m" },
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret",
      { expiresIn: (process.env.REFRESH_TOKEN_EXPIRE as any) || "7d" },
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
