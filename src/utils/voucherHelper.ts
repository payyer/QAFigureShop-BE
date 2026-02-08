import { AppError } from "../middleware/appError.js";
import { VoucherType, type IVoucher } from "../models/Voucher.js";

class VoucherHelper {
  static calculateDiscount(
    voucher: IVoucher,
    subtotal: number,
    shippingFee: number = 0,
  ) {
    // 1. Check thời gian (startDate, endDate)
    const today = Date.now();
    const startTime = new Date(voucher.startDate).getTime();
    const endTime = new Date(voucher.endDate).getTime();
    if (today < startTime || today > endTime)
      throw new AppError("Voucher đã hết hạn hoặc chưa tới ngày sử dụng", 400);

    // 2. Check giá trị đơn hàng tối thiểu (minOrderValue)
    if (subtotal < voucher.minOrderValue) {
      const price = voucher.minOrderValue - subtotal;
      throw new AppError(
        `Đơn hàng còn thiếu ${price} VNĐ để áp dụng mã giảm giá`,
        400,
      );
    }
    // 3. Tính discount dựa trên type
    let discount = 0;
    if (voucher.type === VoucherType.FREE_SHIP) {
      discount = shippingFee;
    } else if (voucher.type === VoucherType.FIXED) {
      discount = voucher.discountValue;
    } else {
      // 4. Nếu type là PERCENT, áp dụng maxDiscountAmount (nếu có)
      // 5. Math.floor để làm tròn xuống
      discount = Math.floor(subtotal * (voucher.discountValue / 100));
      if (discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    }
    return discount;
  }
}

export default VoucherHelper;
