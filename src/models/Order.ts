import { Schema, model, Document, Types } from "mongoose";

export enum PaymentMethod {
  COD = "COD",
  BANKING = "BANKING",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface IOrderItem {
  product: Types.ObjectId;
  variantSku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  total: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    phone: string;
    name: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingFee: number;
  voucherCodes: string[]; // Support multiple vouchers (e.g. FreeShip + Discount)
  productDiscount: number;
  shippingDiscount: number;
  totalAmount: number;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantSku: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        total: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      name: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    shippingFee: { type: Number, default: 0 },
    voucherCodes: [{ type: String }],
    productDiscount: { type: Number, default: 0 },
    shippingDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Order = model<IOrder>("Order", OrderSchema);
