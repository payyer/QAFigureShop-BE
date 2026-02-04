import type { Request, Response } from "express";
import { categoryService } from "../services/CategoryService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { CreateCategoryInput } from "../dtos/category.dto.js";

export class CategoryController {
  getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  });

  getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const category = await categoryService.getCategoryBySlug(slug);
    res.status(200).json({ success: true, data: category });
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(
      req.body as CreateCategoryInput,
    );
    res.status(201).json({ success: true, data: category });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await categoryService.updateCategory(
      id,
      req.body as Partial<CreateCategoryInput>,
    );
    res.status(200).json({ success: true, data: category });
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await categoryService.deleteCategory(id);
    res.status(200).json({ success: true, message: "Xóa danh mục thành công" });
  });
}

export const categoryController = new CategoryController();
