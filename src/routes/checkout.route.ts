import { Router } from "express";
import { CheckoutController } from "../controllers/CheckoutController.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { CheckoutSchema } from "../dtos/checkout.dto.js";

const router = Router();

router.post(
  "/validate-checkout",
  validateRequest(CheckoutSchema),
  CheckoutController.validate,
);

export default router;
