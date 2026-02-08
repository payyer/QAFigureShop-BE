import type { Request, Response } from "express";
import { cartService } from "../services/CartService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/appError.js";

export class CartController {
  getCart = asyncHandler(async (req: Request, res: Response) => {
    // req.user is guaranteed by protect middleware
    const userId = (req.user as any)._id;
    const cart = await cartService.getCart(userId);
    res.status(200).json({ success: true, data: cart });
  });

  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { productId, variantSku, quantity } = req.body;

    if (!productId || !variantSku || !quantity) {
      throw new AppError(
        "Product ID, Variant SKU, and Quantity are required",
        400,
      );
    }

    const cart = await cartService.addToCart(
      userId,
      productId,
      variantSku,
      Number(quantity),
    );
    res
      .status(200)
      .json({ success: true, message: "Added to cart", data: cart });
  });

  updateQuantity = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { productId, variantSku, quantity } = req.body;

    if (!productId || !variantSku || quantity === undefined) {
      throw new AppError(
        "Product ID, Variant SKU, and Quantity are required",
        400,
      );
    }

    const cart = await cartService.updateQuantity(
      userId,
      productId,
      variantSku,
      Number(quantity),
    );
    res
      .status(200)
      .json({ success: true, message: "Cart updated", data: cart });
  });

  removeFromCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const productId = req.params.productId as string;
    const variantSku = req.query.variantSku as string;

    if (!productId || !variantSku) {
      throw new AppError("Product ID and Variant SKU are required", 400);
    }

    const cart = await cartService.removeFromCart(
      userId,
      productId,
      variantSku,
    );
    res
      .status(200)
      .json({ success: true, message: "Item removed", data: cart });
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    await cartService.clearCart(userId);
    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: { items: [], cartTotal: 0 },
    });
  });
}

export const cartController = new CartController();
