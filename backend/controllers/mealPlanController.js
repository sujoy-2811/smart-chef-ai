import MealPlan from "../models/MealPlan.js";

// ADD recipe to meal plan
export const addToMealPlan = async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.create(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Recipe added to meal plan",
      data: {
        mealPlan,
      },
    });
  } catch (err) {
    console.error("Error in addToMealPlan:", err);
    next(err);
  }
};

// GET weekly meal plan
export const getWeeklyMealPlan = async (req, res, next) => {
  try {
    const { start_date, end_date, weekStartDate, weekEndDate } = req.query;
    const startDate = start_date || weekStartDate;
    const endDate = end_date || weekEndDate;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide start_date or weekStartDate",
      });
    }

    const mealPlans = endDate
      ? await MealPlan.findByDateRange(req.user.id, startDate, endDate)
      : await MealPlan.getWeeklyPlan(req.user.id, startDate);

    res.json({
      success: true,
      data: {
        mealPlans,
      },
    });
  } catch (err) {
    console.error("Error in getWeeklyMealPlan:", err);
    next(err);
  }
};

// GET upcoming meals
export const getUpcomingMeals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const meals = await MealPlan.getUpcoming(req.user.id, limit);

    res.status(200).json({
      success: true,
      data: {
        meals,
      },
    });
  } catch (err) {
    console.error("Error in getUpcomingMeals:", err);
    next(err);
  }
};

// DELETE meal plan entry
export const deleteMealPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await MealPlan.delete(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Meal plan entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meal plan entry deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteMealPlan:", err);
    next(err);
  }
};

// Get Meal Plan stats
export const getMealPlanStats = async (req, res, next) => {
  try {
    const stats = await MealPlan.getStats(req.user.id);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (err) {
    console.error("Error in getMealPlanStats:", err);
    next(err);
  }
};
