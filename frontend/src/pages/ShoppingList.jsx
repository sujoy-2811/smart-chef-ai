import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Plus, X, Check, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Grains",
  "Spices",
  "Beverages",
  "Other",
];

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchShoppingList = useCallback(async () => {
    try {
      const response = await api.get("/shopping-list?grouped=true");
      const grouped = response.data.data.items;

      // Covert grouped format to flat array for easier manipulation
      const flatItems = [];
      grouped.forEach((group) => {
        group.items.forEach((item) => {
          flatItems.push({ ...item, category: group.category });
        });
      });

      setItems(flatItems);
      organizeByCategory(flatItems);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      toast.error("Failed to load shopping list. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShoppingList();
  }, [fetchShoppingList]);

  const organizeByCategory = (itemsList) => {
    const grouped = {};
    itemsList.forEach((item) => {
      const category = item.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    setGroupedItems(grouped);
  };

  const handleToggleChecked = async (id) => {
    const previousItems = items;
    const updateItems = items.map((item) =>
      item.id === id ? { ...item, is_checked: !item.is_checked } : item
    );

    setItems(updateItems);

    organizeByCategory(updateItems);

    try {
      await api.put(`/shopping-list/${id}/toggle`);
    } catch (error) {
      setItems(previousItems);
      organizeByCategory(previousItems);
      console.error("Error toggling item:", error);
      toast.error("Failed to update item. Please try again.");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/shopping-list/${id}`);
      const updateItems = items.filter((item) => item.id !== id);
      setItems(updateItems);
      organizeByCategory(updateItems);
      toast.success("Item deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleClearChecked = async () => {
    if (!confirm("Remove all checked items?")) return;

    try {
      await api.delete("/shopping-list/clear/checked");
      const updatedItems = items.filter((item) => !item.is_checked);
      setItems(updatedItems);
      organizeByCategory(updatedItems);
      toast.success("Checked items cleared");
    } catch (error) {
      console.error("Error clearing checked items:", error);
      toast.error("Failed to clear checked items. Please try again.");
    }
  };

  const handleAddToPantry = async () => {
    const checkedCount = items.filter((item) => item.is_checked).length;
    if (checkedCount === 0) {
      toast.error("No items checked");
      return;
    }

    if (!confirm(`Add ${checkedCount} checked items to pantry?`)) return;

    try {
      await api.post(`/shopping-list/add-to-pantry`);
      const updatedItems = items.filter((item) => !item.is_checked);
      setItems(updatedItems);
      organizeByCategory(updatedItems);
      toast.success("Checked items added to pantry");
    } catch (error) {
      console.error("Error adding items to pantry:", error);
      toast.error("Failed to add items to pantry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin " />
        </div>
      </div>
    );
  }

  const checkedCount = items.filter((item) => item.is_checked).length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight leading-none">
              Shopping List
            </h1>
            <div className="h-5 w-px bg-stone-300 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm">
              <ShoppingCart className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-semibold">
                {checkedCount}/{totalCount} items
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {checkedCount > 0 && (
              <>
                <button
                  onClick={handleAddToPantry}
                  className="inline-flex items-center gap-2 bg-white border border-stone-200 hover:bg-emerald-50 hover:border-emerald-200 text-stone-600 hover:text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  title="Add checked to pantry"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">To Pantry</span>
                </button>
                <button
                  onClick={handleClearChecked}
                  className="inline-flex items-center gap-2 bg-white border border-stone-200 hover:bg-red-50 hover:border-red-200 text-stone-600 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  title="Clear checked"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Shopping List - Masonry Grid for Categories */}
        {totalCount > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
              if (categoryItems.length === 0) return null;

              return (
                <div
                  key={category}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm break-inside-avoid mb-6"
                >
                  <div className="bg-stone-50/50 px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <h2 className="font-bold text-stone-800 text-sm uppercase tracking-wide">
                      {category}
                    </h2>
                    <span className="text-xs font-medium text-stone-400 bg-white px-1.5 py-0.5 rounded border border-stone-100">
                      {categoryItems.length}
                    </span>
                  </div>
                  <div className="divide-y divide-stone-50">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors"
                      >
                        <button
                          onClick={() => handleToggleChecked(item.id)}
                          className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            item.is_checked
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "border-stone-300 hover:border-orange-500 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium leading-none mb-1 transition-colors ${
                              item.is_checked
                                ? "text-stone-400 line-through"
                                : "text-stone-900"
                            }`}
                          >
                            {item.ingredient_name}
                          </p>
                          <p className="text-xs text-stone-500 flex items-center gap-1">
                            {item.quantity} {item.unit}
                            {item.from_meal_plan && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-1"
                                title="From meal plan"
                              ></span>
                            )}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-sm max-w-lg mx-auto mt-12">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Your list is empty
            </h3>
            <p className="text-stone-500 mb-6 text-sm">
              Start adding items or generate a meal plan to automatically fill
              your list.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Item
            </button>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            await fetchShoppingList();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

const AddItemModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    ingredient_name: "",
    quantity: "",
    unit: "pieces",
    category: "Other",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/shopping-list", {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
      });
      toast.success("Item added");
      await onSuccess();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/50">
          <h2 className="text-lg font-bold text-stone-900">Add Item</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
              Item Name
            </label>
            <input
              type="text"
              value={formData.ingredient_name}
              onChange={(e) =>
                setFormData({ ...formData, ingredient_name: e.target.value })
              }
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-stone-400"
              placeholder="e.g., Avocados"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              >
                <option value="pieces">Pieces</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">L</option>
                <option value="ml">ml</option>
                <option value="cups">Cups</option>
                <option value="tbsp">Tbsp</option>
                <option value="tsp">Tsp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? "Adding..." : "Add to List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShoppingList;
