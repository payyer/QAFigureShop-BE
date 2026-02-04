import { Schema, model, Document, Types } from "mongoose";
import { createSlug } from "../utils/slug.js";

/**
 * Metadata linh hoạt cho từng loại Figure
 */
interface IMetadata {
  scale?: string; // e.g., 1/7, 1/12
  series?: string; // e.g., One Piece, Naruto
  material?: string; // e.g., PVC, ABS
  release_date?: Date;
  [key: string]: any; // Cho phép thêm các trường khác linh hoạt
}

/**
 * Các phiên bản của sản phẩm (e.g., Standard, Deluxe, Limited)
 */
interface IVariant {
  name: string; // Tên variant
  sku: string; // Mã định danh tàng kho
  price: number;
  stock: number;
  images: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  thumb: string;
  category: Types.ObjectId;
  brand: Types.ObjectId;
  metadata: IMetadata;
  variants: IVariant[];
  is_active: boolean;
}

const variantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    thumb: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    metadata: {
      scale: String,
      series: String,
      material: String,
      release_date: Date,
    },
    variants: [variantSchema],
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Tự động tạo slug trước khi lưu
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
});

// Virtual để lấy giá thấp nhất (tiện cho việc hiển thị "Giá từ...")
productSchema.virtual("minPrice").get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return Math.min(...this.variants.map((v) => v.price));
});

export const Product = model<IProduct>("Product", productSchema);
