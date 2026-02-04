import { Router } from "express";
import { brandController } from "../controllers/BrandController.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { CreateBrandSchema } from "../dtos/brand.dto.js";

const router = Router();

router.get("/", brandController.getAllBrands);
router.get("/:slug", brandController.getBrandBySlug);
router.post(
  "/",
  validateRequest(CreateBrandSchema),
  brandController.createBrand,
);
router.put(
  "/:id",
  validateRequest(CreateBrandSchema.partial()),
  brandController.updateBrand,
);
router.delete("/:id", brandController.deleteBrand);

export default router;
