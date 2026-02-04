import type { Request, Response } from "express";
import { brandService } from "../services/BrandService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class BrandController {
  getAllBrands = asyncHandler(async (req: Request, res: Response) => {
    const brands = await brandService.getAllBrands();
    res.status(200).json({ success: true, data: brands });
  });

  getBrandBySlug = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const brand = await brandService.getBrandBySlug(slug);
    res.status(200).json({ success: true, data: brand });
  });

  createBrand = asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.createBrand(req.body);
    res.status(201).json({ success: true, data: brand });
  });

  updateBrand = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const brand = await brandService.updateBrand(id, req.body);
    res.status(200).json({ success: true, data: brand });
  });

  deleteBrand = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await brandService.deleteBrand(id);
    res
      .status(200)
      .json({ success: true, message: "Xóa thương hiệu thành công" });
  });
}

export const brandController = new BrandController();
