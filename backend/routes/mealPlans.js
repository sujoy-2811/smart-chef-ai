import express from "express";
import * as mealPlanController from "../controllers/mealPlanController.js";
import authMiddleware from "../middleware/auth.js";
import demoGuard from "../middleware/demoGuard.js";

const router = express.Router();

router.use(authMiddleware);
router.use(demoGuard);

router.get("/weekly", mealPlanController.getWeeklyMealPlan);
router.get("/upcoming", mealPlanController.getUpcomingMeals);
router.get("/stats", mealPlanController.getMealPlanStats);
router.post("/", mealPlanController.addToMealPlan);
router.delete("/:id", mealPlanController.deleteMealPlan);

export default router;
