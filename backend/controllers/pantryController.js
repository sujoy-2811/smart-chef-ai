import PantryItem from "../models/PantryItem.js";

// GET all pantry items
export const getPantryItems = async (req, res, next) => {
  try {
    const { category, is_running_low, search } = req.query;

    const items = await PantryItem.findByUserId(req.user.id, {
      category,
      is_running_low: is_running_low === "true",
      search,
    });

    res.status(200).json({
      success: true,
      data: {
        items,
      },
    });
  } catch (err) {
    console.error("Error in getPantryItems:", err);
    next(err);
  }
};

// GET pantry stats
export const getPantryStats = async (req, res, next) => {
  try {
    const stats = await PantryItem.getStats(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (err) {
    console.error("Error in getPantryStats:", err);
    next(err);
  }
};

// GET items expiring soon
export const getExpiringSoon = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const items = await PantryItem.getExpiringSoon(req.user.id, days);

    res.status(200).json({
      success: true,
      data: {
        items,
      },
    });
  } catch (err) {
    console.error("Error in getExpiringSoon:", err);
    next(err);
  }
};

// Add  pantry item
export const addPantryItem = async (req, res, next) => {
  try {
    const item = await PantryItem.create(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Pantry item added successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in addPantryItem:", err);
    next(err);
  }
};

// update pantry item
export const updatePantryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await PantryItem.update(id, req.user.id, req.body);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pantry item updated successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in updatePantryItem:", err);
    next(err);
  }
};

// DELETE pantry item
export const deletePantryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await PantryItem.delete(id, req.user.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pantry item deleted successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in deletePantryItem:", err);
    next(err);
  }
};
