import express from "express";
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import demoGuard from "../middleware/demoGuard.js";

const router = express.Router();

// All routes in this file are protected
router.use(authMiddleware);
router.use(demoGuard);

// Get user profile
router.get("/profile", userController.getProfile);

// Update user profile
router.put("/profile", userController.updateProfile);

// Update user preferences
router.put("/preferences", userController.updatePreferences);

// Change user password
router.put("/change-password", userController.changePassword);

// Delete user account
router.delete("/delete", userController.deleteAccount);

export default router;
