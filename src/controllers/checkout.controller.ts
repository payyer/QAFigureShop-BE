import type { Request, Response } from 'express';
import { CheckoutService } from '../services/checkout.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class CheckoutController {
    static validate = asyncHandler(async (req: Request, res: Response) => {
        const result = await CheckoutService.validateCheckout(req.body.items, req.body.voucherCode);
        res.status(200).json({
            success: true,
            data: result
        });
    });
}
