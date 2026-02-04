import { Schema, model, Document } from "mongoose";
import { createSlug } from "../utils/slug.js";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    logo: { type: String },
    description: { type: String },
  },
  { timestamps: true },
);

brandSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
});

export const Brand = model<IBrand>("Brand", brandSchema);
