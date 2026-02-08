import type { Request, Response } from "express";
import { reviewService } from "../services/ReviewService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class ReviewController {
  createReview = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const { productId, rating, comment } = req.body;

    const review = await reviewService.createReview(userId, productId, {
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  });

  getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await reviewService.getProductReviews(
      productId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  deleteReview = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";
    const id = req.params.id as string;

    const result = await reviewService.deleteReview(userId, id, isAdmin);

    res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export const reviewController = new ReviewController();
