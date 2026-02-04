import { z } from "zod";

export const CreateBrandSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Tên thương hiệu là bắt buộc")
      .min(2, "Tên thương hiệu phải có ít nhất 2 ký tự"),
    logo: z.string().url("Logo phải là một URL hợp lệ").optional(),
    description: z.string().optional(),
  }),
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>["body"];
