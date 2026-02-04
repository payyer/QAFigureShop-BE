import { productRepository } from "../repositories/ProductRepository.js";
import { categoryRepository } from "../repositories/CategoryRepository.js";
import { brandRepository } from "../repositories/BrandRepository.js";
import type { CreateProductInput } from "../dtos/product.dto.js";
import { AppError } from "../middleware/appError.js";

export class ProductService {
  async getAllProducts() {
    return await productRepository.findAll();
  }

  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new AppError("Không tìm thấy sản phẩm", 404);
    return product;
  }

  async createProduct(data: CreateProductInput) {
    // 1. Kiểm tra Category có tồn tại không
    const categoryExists = await categoryRepository.findById(data.category);
    if (!categoryExists) throw new AppError("Category IDs không hợp lệ", 400);

    // 2. Kiểm tra Brand có tồn tại không
    const brandExists = await brandRepository.findById(data.brand);
    if (!brandExists) throw new AppError("Brand IDs không hợp lệ", 400);

    // 3. Tạo sản phẩm
    return await productRepository.create(data as any);
  }

  async updateProduct(id: string, data: Partial<CreateProductInput>) {
    // Nếu có update category/brand thì phải check
    if (data.category) {
      const categoryExists = await categoryRepository.findById(data.category);
      if (!categoryExists) throw new AppError("Category ID không hợp lệ", 400);
    }
    if (data.brand) {
      const brandExists = await brandRepository.findById(data.brand);
      if (!brandExists) throw new AppError("Brand ID không hợp lệ", 400);
    }

    const product = await productRepository.update(id, data as any);
    if (!product)
      throw new AppError("Không tìm thấy sản phẩm để cập nhật", 404);
    return product;
  }

  async deleteProduct(id: string) {
    const product = await productRepository.delete(id);
    if (!product) throw new AppError("Không tìm thấy sản phẩm để xóa", 404);
    return product;
  }
}

export const productService = new ProductService();
