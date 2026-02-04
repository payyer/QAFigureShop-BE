import { AppError } from "../middleware/appError.js";
import { Product } from "../models/Product.js";
import { Voucher, VoucherType } from "../models/Voucher.js";

export class CheckoutService {
  static async validateCheckout(
    items: { productId: string; quantity: number }[],
    voucherCode?: string,
  ) {
    let subtotal = 0;
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Output productsMap: [[id, product],[id, product], ...]
    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of items) {
      // TODO: Fix type logic for variants
      const product = productsMap.get(`${item.productId}`) as any;
      if (!product)
        throw new AppError(`Sản phẩm ${item.productId} không tồn tại`, 404);

      // Logic cũ (tạm cast as any để pass lint)
      // Cần refactor để support variants
      if (product.stock < item.quantity)
        throw new AppError(
          `Sản phẩm ${item.productId} trong kho không đủ đáp `,
          400,
        );
      subtotal += product.price * item.quantity;
    }

    let discount = 0;
    let voucherInfo = null;

    // 2. Xử lý Voucher (nếu có)
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode });

      // TODO: Kiểm tra voucher có tồn tại và còn lượt dùng (isAvailable) không?
      if (!voucher || !voucher.isAvailable)
        throw new AppError(
          "Mã giảm giá không tồn tại hoặc đã hết lượt sử dụng",
          400,
        );
      voucherInfo = voucher;
      // TODO: Tính toán số tiền được giảm dựa trên type (PERCENT hoặc FIXED)
      // Lưu ý: Nếu là PERCENT, hãy cẩn thận với lỗi làm tròn số thập phân.
      if (voucherInfo.type === VoucherType.PERCENT) {
        discount = Math.floor(subtotal * (voucherInfo.discountValue / 100));
      } else {
        discount = voucherInfo.discountValue;
      }
    }

    // 3. Tính toán tổng cuối cùng
    const total = Math.max(0, subtotal - discount);

    return {
      subtotal,
      discount,
      total,
      items: products,
      voucher: voucherInfo,
    };
  }
}
