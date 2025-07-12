import ShoppingList from "../models/ShoppingList.js";

// Genrate shopping list from meal plan
export const generateFromMealPlan = async (req, res, next) => {
  try {
    const { start_date, endDate } = req.query;

    if (!start_date || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide start_date and endDate",
      });
    }

    const items = await ShoppingList.generateFromMealPlan(
      req.user.id,
      start_date,
      endDate
    );

    res.status(200).json({
      success: true,
      message: "Shopping list generated successfully",
      data: {
        items,
      },
    });
  } catch (err) {
    console.error("Error in generateFromMealPlan:", err);
    next(err);
  }
};

// GET shopping list
export const getShoppingList = async (req, res, next) => {
  try {
    const grouped = req.query.grouped === "true";

    const items = grouped
      ? await ShoppingList.getGroupedByCategory(req.user.id)
      : await ShoppingList.findByUserId(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        items,
      },
    });
  } catch (err) {
    console.error("Error in getShoppingList:", err);
    next(err);
  }
};

// Add item to shopping list
export const addItem = async (req, res, next) => {
  try {
    const item = await ShoppingList.create(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Item added to shopping list successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in addItem:", err);
    next(err);
  }
};

// Update shopping list item
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await ShoppingList.update(id, req.user.id, req.body);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shopping list item updated successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in updateItem:", err);
    next(err);
  }
};

// Toggle item checked items
export const toggleChecked = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await ShoppingList.toggleChecked(id, req.user.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shopping list item checked status toggled successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in toggleChecked:", err);
    next(err);
  }
};

// DELETE shopping list item
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await ShoppingList.delete(id, req.user.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shopping list item deleted successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in deleteItem:", err);
    next(err);
  }
};

// Clear checked items
export const clearChecked = async (req, res, next) => {
  try {
    const items = await ShoppingList.clearChecked(req.user.id);

    res.status(200).json({
      success: true,
      message: `${items.length} checked items cleared successfully`,
      data: { items },
    });
  } catch (err) {
    console.error("Error in clearChecked:", err);
    next(err);
  }
};

// Clear entire shopping list
export const clearAll = async (req, res, next) => {
  try {
    const item = await ShoppingList.clearAll(req.user.id);

    res.status(200).json({
      success: true,
      message: "All shopping list items cleared successfully",
      data: {
        item,
      },
    });
  } catch (err) {
    console.error("Error in clearAll:", err);
    next(err);
  }
};

// Add checked items to pantry
export const addCheckedToPantry = async (req, res, next) => {
  try {
    const items = await ShoppingList.addCheckedToPantry(req.user.id);

    res.status(200).json({
      success: true,
      message: `${items.length} checked items added to pantry successfully`,
      data: {
        items,
      },
    });
  } catch (err) {
    console.error("Error in addCheckedToPantry:", err);
    next(err);
  }
};
