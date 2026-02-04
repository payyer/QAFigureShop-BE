import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Brand } from "../models/Brand.js";
import { Voucher, VoucherType } from "../models/Voucher.js";
import connectDB from "../config/database.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // 1. Xóa dữ liệu cũ
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Voucher.deleteMany();

    // 2. Tạo Category
    const categories = await Category.create([
      { name: "Scale Figure", description: "Mô hình tỉ lệ chuẩn" },
      { name: "Nendoroid", description: "Mô hình chibi đáng yêu" },
    ]);

    // 3. Tạo Brand
    const brands = await Brand.create([
      {
        name: "Good Smile Company",
        description: "Nhà sản xuất Nendoroid nổi tiếng",
      },
      { name: "Alter", description: "Chất lượng điêu khắc đỉnh cao" },
    ]);

    if (categories.length === 0 || brands.length === 0) {
      throw new Error("Failed to create categories or brands");
    }

    // 4. Tạo Sản phẩm với Variants và Metadata
    const products = [
      {
        name: "Hatsune Miku 15th Anniversary",
        description: "Phiên bản kỷ niệm 15 năm Hatsune Miku",
        thumb: "https://cdn.example.com/miku.png",
        category: categories[0]?._id,
        brand: brands[0]?._id,
        metadata: {
          scale: "1/7",
          series: "Vocaloid",
          material: "PVC, ABS",
          release_date: new Date("2024-12-01"),
        },
        variants: [
          {
            name: "Standard Edition",
            sku: "MIKU-15TH-STD",
            price: 3500000,
            stock: 5,
            images: ["https://cdn.example.com/miku-std-1.png"],
          },
          {
            name: "Special Edition (With Acrylic Stand)",
            sku: "MIKU-15TH-SP",
            price: 4200000,
            stock: 2,
            images: [
              "https://cdn.example.com/miku-sp-1.png",
              "https://cdn.example.com/miku-sp-2.png",
            ],
          },
        ],
      },
    ];

    // 5. Tạo Voucher
    const vouchers = [
      {
        code: "MIKU10",
        type: VoucherType.PERCENT,
        discountValue: 10,
        maxUsage: 100,
        currentUsage: 0,
        minOrderValue: 1000000,
        maxDiscountAmount: 500000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày từ bây giờ
      },
    ];

    // 6. Lưu vào DB
    await Product.create(products as any); // Cast as any to avoid overload issues
    await Voucher.insertMany(vouchers);

    console.log("✅ Data Seeded Successfully with new Schema!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
