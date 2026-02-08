import { Schema, model, Document, Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  variantSku: string;
  quantity: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
}

const CartSchema = new Schema<ICart>(
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
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true },
);

export const Cart = model<ICart>("Cart", CartSchema);
