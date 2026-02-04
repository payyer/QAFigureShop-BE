import { z } from "zod";

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Tên danh mục là bắt buộc")
      .min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
    description: z.string().optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>["body"];
