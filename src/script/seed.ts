import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { Voucher, VoucherType } from '../models/Voucher.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // 1. Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại script
        await Product.deleteMany();
        await Voucher.deleteMany();

        // 2. Tạo dữ liệu mẫu cho Sản phẩm
        const products = [
            { name: 'Goku Figure', price: 500000, stock: 10, image: 'https://cdn11.bigcommerce.com/s-ua4dd/images/stencil/original/products/308144/413402/Copy_of_Website_Image_Template1754__23565.1750948049.png' },
            { name: 'Luffy Gear 5 Figure', price: 750000, stock: 5, image: 'https://product.hstatic.net/200000462939/product/one-piece-figure-figlife-monkey-d-luffy-gear-5__1__b709b8c30583425383c2a54cff5407ec_master.png' },
            { name: 'Naruto Sage Mode Figure', price: 600000, stock: 0, image: 'https://cdn11.bigcommerce.com/s-ua4dd/images/stencil/original/products/329168/457671/Copy_of_Website_Image_Template9999-8212__86182.1759434938.png' },
        ];

        // 3. Tạo dữ liệu mẫu cho Voucher
        const vouchers = [
            { code: 'NARUTO10', type: VoucherType.PERCENT, discountValue: 10, maxUsage: 100, currentUsage: 0 },
            { code: 'LUFFY50', type: VoucherType.FIXED, discountValue: 50000, maxUsage: 10, currentUsage: 10 }, // Voucher hết lượt
        ];

        // 4. Lưu vào DB
        await Product.insertMany(products);
        await Voucher.insertMany(vouchers);

        console.log('✅ Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();