import { Schema, model, Document } from "mongoose";
import { createSlug } from "../utils/slug.js";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String },
  },
  { timestamps: true },
);

categorySchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
});

export const Category = model<ICategory>("Category", categorySchema);
