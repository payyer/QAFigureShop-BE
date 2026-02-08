import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>["body"];
export type LoginInput = z.infer<typeof LoginSchema>["body"];

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  // No sensitive fields
}
