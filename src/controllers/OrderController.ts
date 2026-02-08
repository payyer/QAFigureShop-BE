import type { Request, Response } from "express";
import { orderService } from "../services/OrderService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/appError.js";

export class OrderController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const input = req.body;

    if (!input.shippingAddress || !input.paymentMethod) {
      throw new AppError("Missing shipping address or payment method", 400);
    }

    const order = await orderService.createOrder(userId, input);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  });

  getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const orders = await orderService.getMyOrders(userId);
    res.status(200).json({ success: true, data: orders });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id as string;
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Check ownership or admin (TODO: add admin check later)
    const userId = (req.user as any)._id;
    if (order.user.toString() !== userId) {
      throw new AppError("Unauthorized access to this order", 403);
    }

    res.status(200).json({ success: true, data: order });
  });
}

export const orderController = new OrderController();
