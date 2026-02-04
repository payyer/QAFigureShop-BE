import { Router } from "express";
import { productController } from "../controllers/ProductController.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { CreateProductSchema } from "../dtos/product.dto.js";

const router = Router();

router.get("/", productController.getAllProducts);
router.get("/:slug", productController.getProductBySlug);
router.post(
  "/",
  validateRequest(CreateProductSchema),
  productController.createProduct,
);
router.put(
  "/:id",
  validateRequest(CreateProductSchema.partial()),
  productController.updateProduct,
);
router.delete("/:id", productController.deleteProduct);

export default router;
