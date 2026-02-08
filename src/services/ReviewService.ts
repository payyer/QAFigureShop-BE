import { Review } from "../models/Review.js";
import type { IReview } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order, OrderStatus } from "../models/Order.js";
import { AppError } from "../middleware/appError.js";
import mongoose from "mongoose";

export class ReviewService {
  async createReview(
    userId: string,
    productId: string,
    data: { rating: number; comment: string },
  ) {
    // 1. Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview) {
      throw new AppError("Bạn đã đánh giá sản phẩm này rồi", 400);
    }

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Sản phẩm không tồn tại", 404);
    }

    // 3. Check for verified purchase (Optional but professional)
    const hasPurchased = await Order.findOne({
      user: userId,
      "items.product": productId,
      orderStatus: OrderStatus.DELIVERED,
    });

    const isVerifiedPurchase = !!hasPurchased;

    // 4. Create Review
    const review = await Review.create({
      user: new mongoose.Types.ObjectId(userId),
      product: new mongoose.Types.ObjectId(productId),
      rating: data.rating,
      comment: data.comment,
      isVerifiedPurchase,
    });

    // 5. Update Product Rating Summary
    await this.updateProductRating(productId);

    return review;
  }

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteReview(userId: string, reviewId: string, isAdmin = false) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError("Không tìm thấy đánh giá", 404);
    }

    // Only owner or admin can delete
    if (review.user.toString() !== userId && !isAdmin) {
      throw new AppError("Bạn không có quyền xóa đánh giá này", 403);
    }

    const productId = review.product.toString();
    await review.deleteOne();

    // Update Product Rating Summary
    await this.updateProductRating(productId);

    return { message: "Xóa đánh giá thành công" };
  }

  private async updateProductRating(productId: string) {
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: stats[0].reviewCount,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  }
}

export const reviewService = new ReviewService();
