import { useState, useEffect } from "react";
import { Plus, Search, X, Calendar, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { format } from "date-fns";
import api from "../services/api";

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Meat",
  "Grains",
  "Spices",
  "Other",
];

const Pantry = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPantryItems();
    fetchExpiringItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const response = await api.get("/pantry");
      setItems(response.data.data.items || []);
    } catch {
      toast.error("Failed to load pantry items");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringItems = async () => {
    try {
      const response = await api.get("/pantry/expiring-soon?days=7");
      setExpiringItems(response.data.data.items || []);
    } catch {
      console.error("Failed to load expiring items");
    }
  };

  useEffect(() => {
    let filtered = items;
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.delete(`/pantry/${id}`);
      setItems(items.filter((item) => item.id !== id));
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
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

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              Pantry
            </h1>
            <p className="text-stone-500 mt-1">
              Manage ingredients and track what's fresh
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">
                  Categories
                </p>
                <CategoryButton
                  label="All Items"
                  count={items.length}
                  active={selectedCategory === "All"}
                  onClick={() => setSelectedCategory("All")}
                />
                {CATEGORIES.map((category) => (
                  <CategoryButton
                    key={category}
                    label={category}
                    count={items.filter((i) => i.category === category).length}
                    active={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                  />
                ))}
              </div>
            </div>

            {/* Expiring Alert Sidebar */}
            {expiringItems.length > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">
                      Expiring Soon
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      You have{" "}
                      <span className="font-bold text-orange-700">
                        {expiringItems.length}
                      </span>{" "}
                      items expiring within this week. Use them up!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="lg:col-span-3">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <PantryItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    isExpiring={expiringItems.some((exp) => exp.id === item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 border-dashed p-12 text-center">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-stone-300" />
                </div>
                <h3 className="text-stone-900 font-bold mb-1">
                  No ingredients found
                </h3>
                <p className="text-stone-500 text-sm">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchPantryItems();
            fetchExpiringItems();
          }}
        />
      )}
    </div>
  );
};

const CategoryButton = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-stone-900 text-white shadow-sm"
        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
    }`}
  >
    <span>{label}</span>
    {count > 0 && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const PantryItemCard = ({ item, onDelete, isExpiring }) => {
  const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all group hover:shadow-md ${
        isExpiring
          ? "border-orange-200 ring-1 ring-orange-50"
          : "border-stone-200 hover:border-stone-300"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-stone-900 line-clamp-1">{item.name}</h3>
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mt-0.5">
            {item.category}
          </p>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-stone-800">
              {item.quantity}
            </span>
            <span className="text-sm text-stone-500 font-medium">
              {item.unit}
            </span>
          </div>

          {item.expiry_date && (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                isExpired
                  ? "text-red-600"
                  : isExpiring
                  ? "text-orange-600"
                  : "text-stone-400"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>
                {isExpired ? "Expired" : "Exp"}{" "}
                {format(new Date(item.expiry_date), "MMM d")}
              </span>
            </div>
          )}
        </div>

        {item.is_running_low && (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600"
            title="Running Low"
          >
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};

const AddItemModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "pieces",
    category: "Other",
    expiry_date: "",
    is_running_low: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/pantry", {
        ...formData,
        quantity: parseFloat(formData.quantity),
        expiry_date: formData.expiry_date || null,
      });
      toast.success("Item added to pantry");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-xl border border-stone-100 transform transition-all">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Add Item</h2>
            <p className="text-stone-500 text-sm mt-1">
              Add new ingredients to your pantry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Tomatoes"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-stone-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Unit
              </label>
              <div className="relative">
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Liters (l)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="cups">Cups</option>
                  <option value="tbsp">Tablespoons</option>
                  <option value="tsp">Teaspoons</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Expiry Date{" "}
              <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.expiry_date}
              onChange={(e) =>
                setFormData({ ...formData, expiry_date: e.target.value })
              }
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-stone-600"
            />
          </div>

          <label className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                formData.is_running_low
                  ? "bg-orange-500 border-orange-500"
                  : "border-stone-300 bg-white"
              }`}
            >
              {formData.is_running_low && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={formData.is_running_low}
              onChange={(e) =>
                setFormData({ ...formData, is_running_low: e.target.checked })
              }
              className="hidden"
            />
            <span className="text-sm font-medium text-stone-700">
              Mark as running low
            </span>
          </label>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-3 px-8 py-3.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-stone-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add to Pantry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pantry;
