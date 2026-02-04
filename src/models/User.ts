import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth later
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    refreshToken: { type: String }, // For Refresh Token Rotation
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
