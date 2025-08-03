import express from "express";
import * as pantryController from "../controllers/pantryController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// GET all pantry items with optional filters
router.get("/", pantryController.getPantryItems);

// GET pantry stats
router.get("/stats", pantryController.getPantryStats);

// GET items expiring soon
router.get("/expiring-soon", pantryController.getExpiringSoon);

// POST /
router.post("/", pantryController.addPantryItem);

// PUT /:id
router.put("/:id", pantryController.updatePantryItem);

// DELETE /:id
router.delete("/:id", pantryController.deletePantryItem);

export default router;
