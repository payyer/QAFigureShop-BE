import { Router } from "express";
import { categoryController } from "../controllers/CategoryController.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { CreateCategorySchema } from "../dtos/category.dto.js";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);
router.post(
  "/",
  validateRequest(CreateCategorySchema),
  categoryController.createCategory,
);
router.put(
  "/:id",
  validateRequest(CreateCategorySchema.partial()),
  categoryController.updateCategory,
);
router.delete("/:id", categoryController.deleteCategory);

export default router;
