import { Product, type IProduct } from "../models/Product.js";
import { BaseRepository } from "./BaseRepository.js";

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  // Override findAll để tự động populate category và brand
  async findAll(filter: any = {}): Promise<IProduct[]> {
    return await this.model
      .find(filter)
      .populate("category brand")
      .sort({ createdAt: -1 })
      .exec();
  }

  // Override findById để populate
  async findById(id: string): Promise<IProduct | null> {
    return await this.model.findById(id).populate("category brand").exec();
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    return await this.model.findOne({ slug }).populate("category brand").exec();
  }
}

export const productRepository = new ProductRepository();
