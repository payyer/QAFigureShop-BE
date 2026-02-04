import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Tên sản phẩm là bắt buộc")
      .min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
    category: z.string().min(1, "Danh mục là bắt buộc"),
    brand: z.string().min(1, "Thương hiệu là bắt buộc"),
    description: z.string().optional(),
    metadata: z.any().optional(), // Relaxed type to avoid lint issues
    variants: z
      .array(
        z.object({
          name: z.string().min(1, "Tên variant là bắt buộc"),
          sku: z.string().min(1, "SKU là bắt buộc"),
          price: z.number().min(0, "Giá không được nhỏ hơn 0"),
          stock: z.number().int().min(0, "Tồn kho không được nhỏ hơn 0"),
          images: z
            .array(z.string().url("Link ảnh không hợp lệ"))
            .min(1, "Cần ít nhất 1 tấm ảnh cho mỗi variant"),
        }),
      )
      .min(1, "Sản phẩm phải có ít nhất 1 variant"),
    is_active: z.boolean().optional().default(true),
  }),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>["body"];
