import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.ZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body); // Bảo vệ kiểm tra hành lý ở đây
            next(); // Nếu ổn thì cho vào gặp Bồi bàn (Controller)
        } catch (error: any) {
            if (error instanceof ZodError) {
                // Nếu khách mang đồ cấm, Bảo vệ đuổi khéo ngay tại cửa
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: error.errors.map(e => ({ path: e.path, message: e.message }))
                });
            }
            next(error);
        }
    };