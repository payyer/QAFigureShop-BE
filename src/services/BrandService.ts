import { brandRepository } from "../repositories/BrandRepository.js";
import type { CreateBrandInput } from "../dtos/brand.dto.js";
import { AppError } from "../middleware/appError.js";

export class BrandService {
  async getAllBrands() {
    return await brandRepository.findAll();
  }

  async getBrandBySlug(slug: string) {
    const brand = await brandRepository.findBySlug(slug);
    if (!brand) throw new AppError("Không tìm thấy thương hiệu", 404);
    return brand;
  }

  async createBrand(data: CreateBrandInput) {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-");
    const existing = await brandRepository.findBySlug(slug);
    if (existing) throw new AppError("Thương hiệu này đã tồn tại", 400);
    return await brandRepository.create(data as any);
  }

  async updateBrand(id: string, data: Partial<CreateBrandInput>) {
    const brand = await brandRepository.update(id, data as any);
    if (!brand)
      throw new AppError("Không tìm thấy thương hiệu để cập nhật", 404);
    return brand;
  }

  async deleteBrand(id: string) {
    const brand = await brandRepository.delete(id);
    if (!brand) throw new AppError("Không tìm thấy thương hiệu để xóa", 404);
    return brand;
  }
}

export const brandService = new BrandService();
