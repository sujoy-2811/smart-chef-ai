import User from "../models/User.js";
import UserPreference from "../models/UserPreference.js";

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = await UserPreference.findByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        user,
        preferences,
      },
    });
  } catch (err) {
    console.error("Error in getProfile:", err);
    next(err);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.update(req.user.id, { name, email });
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    next(err);
  }
};

// Update user preferences
export const updatePreferences = async (req, res, next) => {
  try {
    const preferences = await UserPreference.upsert(req.user.id, req.body);
    res.json({
      success: true,
      message: "Preferences updated successfully",
      data: { preferences },
    });
  } catch (err) {
    console.error("Error in updatePreferences:", err);
    next(err);
  }
};

// Change user password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new passwords are required",
      });
    }

    // Verify current password
    const user = await User.findByEmail(req.user.email);
    const isCurrentPasswordValid = await User.verifyPassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Update password
    await User.updatePassword(req.user.id, newPassword);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Error in changePassword:", err);
    next(err);
  }
};

// Delete user account
export const deleteAccount = async (req, res, next) => {
  try {
    await User.delete(req.user.id);
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error in deleteAccount:", err);
    next(err);
  }
};
