import type { Request, Response } from "express";
import { productService } from "../services/ProductService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class ProductController {
  getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await productService.getAllProducts();
    res.status(200).json({ success: true, data: products });
  });

  getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const product = await productService.getProductBySlug(slug);
    res.status(200).json({ success: true, data: product });
  });

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await productService.updateProduct(id, req.body);
    res.status(200).json({ success: true, data: product });
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await productService.deleteProduct(id);
    res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
  });
}

export const productController = new ProductController();
