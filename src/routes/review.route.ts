import { Router } from "express";
import { reviewController } from "../controllers/ReviewController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/product/:productId", reviewController.getProductReviews);

// Protected routes
router.use(protect);
router.post("/", reviewController.createReview);
router.delete("/:id", reviewController.deleteReview);

export default router;
