import { Router } from "express";
import { cartController } from "../controllers/CartController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.patch("/", cartController.updateQuantity);
router.delete("/clear", cartController.clearCart);
router.delete("/:productId", cartController.removeFromCart);

export default router;
