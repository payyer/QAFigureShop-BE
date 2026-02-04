import { Brand, type IBrand } from "../models/Brand.js";
import { BaseRepository } from "./BaseRepository.js";

export class BrandRepository extends BaseRepository<IBrand> {
  constructor() {
    super(Brand);
  }

  async findBySlug(slug: string): Promise<IBrand | null> {
    return await this.model.findOne({ slug }).exec();
  }
}

export const brandRepository = new BrandRepository();
