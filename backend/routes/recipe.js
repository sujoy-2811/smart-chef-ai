import express from "express";

import * as recipeController from "../controllers/recipeController.js";
import authMiddleware from "../middleware/auth.js";
import demoGuard from "../middleware/demoGuard.js";

const router = express.Router();

router.use(authMiddleware);
router.use(demoGuard);

// AI generation
router.post("/generate", recipeController.generateRecipe);
router.get("/suggestions", recipeController.generatePantrySuggestions);

// CRUD operations
router.get("/", recipeController.getRecipes);
router.get("/recent", recipeController.getRecentRecipes);
router.get("/stats", recipeController.getRecipeStats);
router.get("/:id", recipeController.getRecipeById);
router.post("/", recipeController.saveRecipe);
router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

export default router;
