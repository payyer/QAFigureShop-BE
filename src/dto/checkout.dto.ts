import { z } from 'zod';

export const CheckoutSchema = z.object({
    items: z.array(z.object({
        productId: z.string().min(1, "ProductId không được để trống"),
        quantity: z.number().int().positive("Số lượng phải là số nguyên dương")
    })).min(1, "Giỏ hàng không được rỗng"), // CHẶN GIỎ HÀNG RỖNG Ở ĐÂY
    voucherCode: z.string().optional()
});

// Tạo type từ Schema để dùng trong code
export type CheckoutDTO = z.infer<typeof CheckoutSchema>;