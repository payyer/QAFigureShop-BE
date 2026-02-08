import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../models/Order.js";
import { Voucher, VoucherType } from "../models/Voucher.js";
import { Product } from "../models/Product.js";
import { AppError } from "../middleware/appError.js";
import { cartService } from "./CartService.js";
import VoucherHelper from "../utils/voucherHelper.js";

interface CreateOrderInput {
  shippingAddress: {
    address: string;
    city: string;
    phone: string;
    name: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  voucherCodes?: string[]; // Changed to array
  shippingFee?: number;
}

export class OrderService {
  async createOrder(userId: string, input: CreateOrderInput) {
    const { items, cartTotal } = await cartService.getCart(userId);

    if (!items || items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // Default shipping fee (can be improved later)
    let shippingFee =
      input.shippingFee !== undefined ? input.shippingFee : 30000;

    // 1. Check Inventory & Extract Variant Details
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.name} no longer exists`, 404);
      }
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) {
        throw new AppError(`Variant for ${item.name} no longer exists`, 404);
      }
      if (variant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${item.name}. Available: ${variant.stock}`,
          400,
        );
      }
    }

    let productDiscount = 0;
    let shippingDiscount = 0;
    const appliedVoucherCodes: string[] = [];

    // Apply Vouchers
    if (input.voucherCodes && input.voucherCodes.length > 0) {
      // Find all valid vouchers
      const vouchers = await Voucher.find({
        code: { $in: input.voucherCodes },
      });

      if (vouchers.length !== input.voucherCodes.length) {
        throw new AppError("One or more voucher codes are invalid", 400);
      }

      // Logic: Allow max 1 FREE_SHIP and 1 PRODUCT (PERCENT/FIXED) voucher
      const freeShipVoucher = vouchers.find(
        (v) => v.type === VoucherType.FREE_SHIP,
      );
      const productVoucher = vouchers.find(
        (v) => v.type !== VoucherType.FREE_SHIP,
      );

      if (
        vouchers.length > 2 ||
        (vouchers.length === 2 && (!freeShipVoucher || !productVoucher))
      ) {
        throw new AppError(
          "You can only apply 1 Shipping Voucher and 1 Discount Voucher",
          400,
        );
      }

      // Apply Free Ship Voucher
      if (freeShipVoucher) {
        const discount = VoucherHelper.calculateDiscount(
          freeShipVoucher,
          cartTotal,
          shippingFee,
        );
        shippingDiscount = discount;

        // Atomic Usage Increment
        const updateResult = await Voucher.updateOne(
          {
            _id: freeShipVoucher._id,
            currentUsage: { $lt: freeShipVoucher.maxUsage },
          },
          { $inc: { currentUsage: 1 } },
        );

        if (updateResult.modifiedCount === 0) {
          throw new AppError("Free ship voucher has reached usage limit", 400);
        }

        appliedVoucherCodes.push(freeShipVoucher.code);
      }

      // Apply Product Voucher
      if (productVoucher) {
        const discount = VoucherHelper.calculateDiscount(
          productVoucher,
          cartTotal,
          shippingFee,
        );
        productDiscount = discount;

        // Atomic Usage Increment
        const updateResult = await Voucher.updateOne(
          {
            _id: productVoucher._id,
            currentUsage: { $lt: productVoucher.maxUsage },
          },
          { $inc: { currentUsage: 1 } },
        );

        if (updateResult.modifiedCount === 0) {
          throw new AppError("Discount voucher has reached usage limit", 400);
        }

        appliedVoucherCodes.push(productVoucher.code);
      }
    }

    const totalDiscount = productDiscount + shippingDiscount;
    const totalAmount = cartTotal + shippingFee - totalDiscount;

    const order = await Order.create({
      user: userId,
      items: items.map((item: any) => ({
        product: item.productId,
        variantSku: item.variantSku,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: item.total,
      })),
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus || PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      shippingFee,
      voucherCodes: appliedVoucherCodes,
      productDiscount,
      shippingDiscount,
      totalAmount: totalAmount > 0 ? totalAmount : 0,
    });

    // 4. Update Stock (Atomic Decrement)
    // Note: In a production environment with high concurrency, use MongoDB Transactions if possible.
    // This iterative approach handles stock validation per item.
    for (const item of items) {
      const updateResult = await Product.updateOne(
        {
          _id: item.productId,
          "variants.sku": item.variantSku,
          "variants.stock": { $gte: item.quantity },
        },
        { $inc: { "variants.$.stock": -item.quantity } },
      );

      if (updateResult.modifiedCount === 0) {
        // This is a rare race condition if stock was checked but then bought by someone else
        // In basic implementation, we just log this or throw error.
        console.error(`FAILED TO DECREMENT STOCK for item: ${item.name}`);
        // Consider rollback logic if critical
      }
    }

    // Clear Cart after successful order
    await cartService.clearCart(userId);

    return order;
  }

  async getMyOrders(userId: string) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getOrderById(orderId: string) {
    return await Order.findById(orderId).populate("items.product");
  }

  async getAllOrders() {
    return await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
  }
}

export const orderService = new OrderService();
