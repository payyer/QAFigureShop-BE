import { Cart } from "../models/Cart.js";
import { Product, type IProduct } from "../models/Product.js";
import { AppError } from "../middleware/appError.js";

export class CartService {
  async getCart(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || !cart.items) {
      return { items: [], cartTotal: 0 };
    }

    let cartTotal = 0;
    const items = cart.items
      .map((item: any) => {
        const product = item.product as IProduct;
        // Handle case where product might be deleted
        if (!product) return null;

        // Find Variant
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (!variant) return null; // Variant might have been deleted/changed

        const total = variant.price * item.quantity;
        cartTotal += total;

        return {
          productId: product._id,
          variantSku: variant.sku,
          name: `${product.name} - ${variant.name}`,
          price: variant.price,
          image: variant.images?.[0] || product.thumb || "",
          quantity: item.quantity,
          total,
        };
      })
      .filter((item) => item !== null);

    return { items, cartTotal };
  }

  async addToCart(
    userId: string,
    productId: string,
    variantSku: string,
    quantity: number,
  ) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Verify Variant exists
    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, variantSku, quantity }],
      });
    } else {
      // Initialize items array if it somehow doesn't exist
      if (!cart.items) {
        cart.items = [];
      }

      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.variantSku === variantSku,
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex]!.quantity += quantity;
      } else {
        cart.items.push({ product: productId as any, variantSku, quantity });
      }
      await cart.save();
    }

    return this.getCart(userId);
  }

  async updateQuantity(
    userId: string,
    productId: string,
    variantSku: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId, variantSku);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.items) {
      throw new AppError("Cart not found", 404);
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId && item.variantSku === variantSku,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex]!.quantity = quantity;
      await cart.save();
    } else {
      throw new AppError("Product variant not in cart", 404);
    }

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string, variantSku: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.items) {
      return { items: [], cartTotal: 0 };
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.variantSku === variantSku
        ),
    );

    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await Cart.findOneAndDelete({ user: userId });
    return { items: [], cartTotal: 0 };
  }
}

export const cartService = new CartService();
