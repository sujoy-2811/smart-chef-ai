import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  ChefHat,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import api from "../services/api";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const MealPlanner = () => {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [mealPlan, setMealPlan] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMealPlan = useCallback(async () => {
    try {
      const startDate = format(weekStart, "yyyy-MM-dd");
      const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");

      const response = await api.get(
        `/meal-plans/weekly?start_date=${startDate}&end_date=${endDate}`
      );
      const meals = response.data?.data?.mealPlans || [];

      // Organize meals by date and meal type
      const organized = {};

      meals.forEach((meal) => {
        const dateKey = meal.meal_date;
        if (!organized[dateKey]) {
          organized[dateKey] = {};
        }
        organized[dateKey][meal.meal_type] = meal;
      });

      setMealPlan(organized);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      toast.error("Failed to load meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  const fetchRecipes = useCallback(async () => {
    try {
      const response = await api.get("/recipes");
      setRecipes(response.data.data.recipes || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load recipes. Please try again.");
    }
  }, []);

  useEffect(() => {
    fetchMealPlan();
    fetchRecipes();
  }, [fetchMealPlan, fetchRecipes]);

  const handleAddMeal = (date, mealType) => {
    setSelectedSlot({ date, mealType });
    setShowAddModal(true);
  };

  const handleRemoveMeal = async (mealId) => {
    if (!confirm("Remove this meal from your plan?")) return;

    try {
      await api.delete(`/meal-plans/${mealId}`);
      await fetchMealPlan();
      toast.success("Meal removed from plan");
    } catch (error) {
      console.error("Error removing meal:", error);
      toast.error("Failed to remove meal. Please try again.");
    }
  };

  const getDayMeals = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return mealPlan[dateStr] || {};
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Ultra Compact */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight leading-none">
              Meal Planner
            </h1>

            <div className="hidden lg:flex items-center gap-3 ml-4">
              <div className="h-5 w-px bg-stone-300"></div>
              {/* Stats - Compact Row */}
              <div className="flex items-center bg-white border border-stone-200 rounded-lg shadow-sm h-[32px] overflow-hidden">
                <div className="px-3 py-1 border-r border-stone-100 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    Planned Meals
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {Object.values(mealPlan).reduce(
                      (acc, day) => acc + Object.keys(day).length,
                      0
                    )}
                  </span>
                </div>
                <div className="px-3 py-1 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    Recipes
                  </span>
                  <span className="text-sm font-bold text-stone-700">
                    {recipes.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm hidden sm:flex h-[36px]">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-semibold">
                {format(weekStart, "MMM d")} -{" "}
                {format(addDays(weekStart, 6), "MMM d")}
              </span>
            </div>

            {/* Nav - Ultra Compact */}
            <div className="flex items-center bg-white rounded-lg border border-stone-200 shadow-sm h-[36px] p-0.5">
              <button
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setWeekStart(startOfWeek(new Date()))}
                className="px-3 text-[11px] font-bold uppercase text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 border-x border-stone-100 h-full transition-all"
              >
                This Week
              </button>

              <button
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Grid - Ultra Compact View */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden h-[600px]">
          <div className="h-full overflow-auto custom-scrollbar">
            <div className="grid grid-cols-[40px_repeat(7,minmax(100px,1fr))] grid-rows-[32px_repeat(3,1fr)] min-w-[900px] h-full divide-x divide-stone-200">
              {/* Header Corner */}
              <div className="bg-stone-50 border-b border-stone-200 sticky top-0 z-20"></div>

              {/* Day Headers */}
              {[...Array(7)].map((_, index) => {
                const date = addDays(weekStart, index);
                const isToday = isSameDay(date, new Date());
                return (
                  <div
                    key={index}
                    className={`text-center border-b border-stone-200 sticky top-0 z-10 flex items-center justify-center gap-2 ${
                      isToday
                        ? "bg-emerald-50/95 backdrop-blur-sm"
                        : "bg-stone-50/95 backdrop-blur-sm"
                    }`}
                  >
                    <span
                      className={`font-bold text-xs uppercase tracking-wider ${
                        isToday ? "text-emerald-700" : "text-stone-700"
                      }`}
                    >
                      {format(date, "EEE")}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isToday ? "text-emerald-600" : "text-stone-400"
                      }`}
                    >
                      {format(date, "d")}
                    </span>
                  </div>
                );
              })}

              {/* Meal Rows */}
              {MEAL_TYPES.map((mealType) => (
                <>
                  {/* Meal Type Label - Vertical */}
                  <div
                    key={`${mealType}-label`}
                    className="flex items-center justify-center font-bold text-stone-400 bg-stone-50/50 uppercase text-[10px] tracking-widest border-b border-stone-200 last:border-b-0"
                  >
                    <span className="-rotate-90 whitespace-nowrap">
                      {mealType}
                    </span>
                  </div>

                  {/* Days for this meal type */}
                  {[...Array(7)].map((_, index) => {
                    const date = addDays(weekStart, index);
                    const meal = getDayMeals(date)[mealType];
                    const isToday = isSameDay(date, new Date());

                    return (
                      <div
                        key={`${mealType}-${index}`}
                        className={`p-1 border-b border-stone-200 last:border-b-0 transition-colors relative group/cell ${
                          isToday ? "bg-emerald-50/20" : "hover:bg-stone-50"
                        }`}
                      >
                        {meal ? (
                          <div className="h-full w-full bg-white border border-stone-100 hover:border-emerald-300 rounded-lg p-2 shadow-sm group relative flex flex-col gap-1 transition-all">
                            <div className="flex items-start gap-1.5">
                              <div className="bg-emerald-100 p-0.5 rounded text-emerald-600 shrink-0 mt-[1px]">
                                <ChefHat className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-medium text-stone-700 line-clamp-3 leading-tight break-words">
                                {meal.recipe_name}
                              </span>
                            </div>

                            <button
                              onClick={() => handleRemoveMeal(meal.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 text-stone-300 hover:text-red-500 rounded transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleAddMeal(
                                format(date, "yyyy-MM-dd"),
                                mealType
                              )
                            }
                            className="w-full h-full border border-dashed border-stone-100 rounded-lg flex items-center justify-center text-stone-200 hover:text-emerald-500 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all opacity-0 group-hover/cell:opacity-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && selectedSlot && (
        <AddMealModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedSlot(null);
          }}
          selectedSlot={selectedSlot}
          recipes={recipes}
          onSuccess={async () => {
            await fetchMealPlan();
            setShowAddModal(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
};

const AddMealModal = ({
  isOpen,
  onClose,
  selectedSlot,
  recipes,
  onSuccess,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipe) {
      toast.error("Please select a recipe");
      return;
    }

    setLoading(true);
    try {
      await api.post("/meal-plans", {
        recipe_id: selectedRecipe,
        meal_date: selectedSlot.date,
        meal_type: selectedSlot.mealType,
      });
      toast.success("Meal added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding meal:", error);
      toast.error("Failed to add meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Add Meal</h2>
            <p className="text-stone-500 text-sm mt-1 capitalize">
              {format(new Date(selectedSlot.date), "EEEE, MMM d")} •{" "}
              {selectedSlot.mealType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-50 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              Select Recipe
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-stone-400 transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
            </div>

            <div className="mt-2 h-60 overflow-y-auto border border-stone-200 rounded-xl custom-scrollbar bg-stone-50/50">
              {filteredRecipes.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe.id)}
                      className={`p-3 cursor-pointer hover:bg-stone-50 transition-all duration-200 flex items-center gap-3 ${
                        selectedRecipe === recipe.id
                          ? "bg-emerald-50 hover:bg-emerald-50"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          selectedRecipe === recipe.id
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-stone-300"
                        }`}
                      >
                        {selectedRecipe === recipe.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-sm block ${
                            selectedRecipe === recipe.id
                              ? "text-emerald-900 font-semibold"
                              : "text-stone-700 font-medium"
                          }`}
                        >
                          {recipe.name}
                        </span>
                        {recipe.cuisine_type && (
                          <span className="text-xs text-stone-500">
                            {recipe.cuisine_type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 p-4">
                  <ChefHat className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">No recipes found</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRecipe}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Meal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealPlanner;
