import { Schema, model, Document } from 'mongoose';

// Interface để TypeScript hiểu kiểu dữ liệu của Product
export interface IProduct extends Document {
    name: string;
    price: number;
    stock: number;
    image: string;
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    image: { type: String },
}, { timestamps: true });

export const Product = model<IProduct>('Product', productSchema);