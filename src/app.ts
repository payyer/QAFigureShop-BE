import express from "express";
import checkoutRoutes from "./routes/checkout.route.js";
import authRoutes from "./routes/auth.route.js";

import categoryRoutes from "./routes/category.route.js";
import brandRoutes from "./routes/brand.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api", checkoutRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Error Middleware luôn nằm cuối
app.use(errorHandler);

export default app;
