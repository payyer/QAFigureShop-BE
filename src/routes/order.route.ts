import { Router } from "express";
import { orderController } from "../controllers/OrderController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);

export default router;
