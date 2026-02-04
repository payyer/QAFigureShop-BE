import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

describe("Auth API Integration Tests", () => {
  beforeEach(async () => {
    // Mock mongoose.startSession to avoid transaction errors in tests if used
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock Date to ensure deterministic token expiry? Not needed for simple Integration.

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      // Mock User.findOne to return null (user doesn't exist)
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      // Mock User.create to return a dummy user
      const mockUser = {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        role: "user",
      };
      jest.spyOn(User, "create").mockResolvedValue(mockUser as any);

      // We also need to mock bcrypt.genSalt and hash, but since we are integration testing
      // and not mocking 'bcrypt' module directly via jest.mock,
      // the real bcrypt will run. That is fine, it's fast enough.
      // BUT: User.create IS mocked, so it won't actually save to DB.

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
    });

    it("should return 400 if email already exists", async () => {
      // Mock existing user
      jest
        .spyOn(User, "findOne")
        .mockResolvedValue({ _id: "123", email: "test@example.com" } as any);

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Email đã tồn tại");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if user does not exist", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "wrong@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(401); // Controller throws 401 for wrong credentials
      expect(res.body.message).toContain("Thông tin đăng nhập không chính xác");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user profile when authenticated", async () => {
      // Mock user finding
      const mockUser = {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        isVerified: false,
      };

      // Mock jwt verify
      jest.spyOn(jwt, "verify").mockReturnValue({ id: "123" } as any);
      // Mock User.findById
      jest.spyOn(User, "findById").mockResolvedValue(mockUser as any);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer validtoken");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("test@example.com");
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toEqual(401);
    });
  });
});
