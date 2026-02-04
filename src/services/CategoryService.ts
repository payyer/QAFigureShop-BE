import { categoryRepository } from "../repositories/CategoryRepository.js";
import type { CreateCategoryInput } from "../dtos/category.dto.js";
import { AppError } from "../middleware/appError.js";

export class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new AppError("Không tìm thấy danh mục", 404);
    return category;
  }

  async createCategory(data: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(
      data.name.toLowerCase().replace(/\s+/g, "-"),
    );
    if (existing) throw new AppError("Danh mục này đã tồn tại", 400);
    return await categoryRepository.create(data as any);
  }

  async updateCategory(id: string, data: Partial<CreateCategoryInput>) {
    const category = await categoryRepository.update(id, data as any);
    if (!category)
      throw new AppError("Không tìm thấy danh mục để cập nhật", 404);
    return category;
  }

  async deleteCategory(id: string) {
    const category = await categoryRepository.delete(id);
    if (!category) throw new AppError("Không tìm thấy danh mục để xóa", 404);
    return category;
  }
}

export const categoryService = new CategoryService();
