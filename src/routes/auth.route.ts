import express from "express";
import { authController } from "../controllers/AuthController.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { RegisterSchema, LoginSchema } from "../dtos/auth.dto.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(RegisterSchema),
  authController.register,
);
router.post("/login", validateRequest(LoginSchema), authController.login);
router.get("/verify/:token", authController.verifyEmail);
router.get("/me", protect, authController.getProfile);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
