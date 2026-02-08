import { Schema, model, Document } from "mongoose";
export enum VoucherType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
  FREE_SHIP = "FREE_SHIP",
}

// Interface để TypeScript hiểu kiểu dữ liệu của Product
export interface IVoucher extends Document {
  code: string;
  type: VoucherType;
  discountValue: number;
  maxUsage: number;
  currentUsage: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
}

const voucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(VoucherType), required: true },
    discountValue: { type: Number, required: true },
    maxUsage: { type: Number, required: true },
    currentUsage: { type: Number, required: true, default: 0 },
    minOrderValue: { type: Number, required: true },
    maxDiscountAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true },
);
voucherSchema.virtual("isAvailable").get(function () {
  return this.currentUsage < this.maxUsage;
});
voucherSchema.set("toJSON", { virtuals: true });
voucherSchema.set("toObject", { virtuals: true });

export const Voucher = model<IVoucher>("Voucher", voucherSchema);
