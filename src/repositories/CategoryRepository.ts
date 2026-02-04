import { Category, type ICategory } from "../models/Category.js";
import { BaseRepository } from "./BaseRepository.js";

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }

  // Thêm các method riêng cho Category nếu cần
  async findBySlug(slug: string): Promise<ICategory | null> {
    return await this.model.findOne({ slug }).exec();
  }
}

export const categoryRepository = new CategoryRepository();
