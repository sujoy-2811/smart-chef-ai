import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  Users,
  ChefHat,
  ArrowLeft,
  Trash2,
  Calendar,
  ShoppingCart as ShoppingListIcon,
  BookOpen,
} from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(4);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        setRecipe(response.data.data.recipe);
        setServings(response.data.servings || 4);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("Failed to load recipe. Please try again.");
        navigate("/recipes");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    // UI-only delete
    toast.success("Recipe deleted");
    navigate("/recipes");
  };

  const toggleIngredient = (index) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const adjustQuantity = (originalQty, originalServings) => {
    return ((originalQty * servings) / originalServings).toFixed(2);
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

  if (!recipe) {
    return null;
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const originalServings = recipe.servings || 4;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Header with Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/recipes"
              className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-500 hover:text-stone-900 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 leading-none mb-1">
                {recipe.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totalTime}m total</span>
                </div>
                {recipe.calories && (
                  <>
                    <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                    <span>~{recipe.calories} kcal</span>
                  </>
                )}
                {recipe.cuisine_type && (
                  <>
                    <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                    <span className="text-stone-600 font-medium">
                      {recipe.cuisine_type}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:text-orange-600 hover:border-orange-200 transition-colors shadow-sm"
              onClick={() => window.print()}
            >
              <ChefHat className="w-4 h-4" />
              <span>Cook Mode</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Ingredients & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions / Tags - Mobile Friendly */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {/* Difficulty Tag */}
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                    recipe.difficulty === "easy"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : recipe.difficulty === "medium"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {recipe.difficulty || "Medium"}
                </span>

                {/* Description if short */}
                <p className="w-full text-sm text-stone-600 mt-2 italic leading-relaxed">
                  {recipe.description || "A delicious recipe to try."}
                </p>
              </div>
            </div>

            {/* Ingredients Card */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <ShoppingListIcon className="w-4 h-4 text-orange-500" />
                  Ingredients
                </h2>

                {/* Compact Servings Control */}
                <div className="flex items-center bg-stone-50 rounded-lg p-1 border border-stone-200">
                  <button
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-stone-500 hover:text-stone-900 hover:shadow-sm transition-all text-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings(servings + 1)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-stone-500 hover:text-stone-900 hover:shadow-sm transition-all text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {recipe.ingredients &&
                  recipe.ingredients.map((ingredient, index) => {
                    const adjustedQty = adjustQuantity(
                      ingredient.quantity,
                      originalServings
                    );
                    const isChecked = checkedIngredients.has(index);

                    return (
                      <label
                        key={index}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? "bg-stone-50" : "hover:bg-stone-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleIngredient(index)}
                          className="mt-1 w-4 h-4 text-orange-600 border-stone-300 rounded focus:ring-orange-500 accent-orange-600"
                        />
                        <div
                          className={`flex-1 text-sm ${
                            isChecked
                              ? "line-through text-stone-400"
                              : "text-stone-700"
                          }`}
                        >
                          <span className="font-bold text-stone-900">
                            {adjustedQty} {ingredient.unit}
                          </span>
                          <span className="ml-1">{ingredient.name}</span>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Column: Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions Card */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  Instructions
                </h2>
                <span className="text-xs font-medium text-stone-500 bg-white px-2 py-1 rounded border border-stone-200">
                  {recipe.instructions?.length || 0} Steps
                </span>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {recipe.instructions &&
                    recipe.instructions.map((step, index) => (
                      <div key={index} className="flex gap-4 group">
                        <div className="shrink-0">
                          <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold border border-orange-200 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-stone-700 text-sm leading-relaxed pt-0.5 group-hover:text-stone-900 transition-colors">
                          {step}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Nutrition Grid - Ultra Compact */}
            {recipe.nutrition && (
              <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                  Nutrition Facts{" "}
                  <span className="font-normal normal-case text-stone-400">
                    (per serving)
                  </span>
                </h3>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <NutritionCard
                    label="Calories"
                    value={recipe.nutrition.calories}
                    unit="kcal"
                    color="orange"
                  />
                  <NutritionCard
                    label="Protein"
                    value={recipe.nutrition.protein}
                    unit="g"
                    color="stone"
                  />
                  <NutritionCard
                    label="Carbs"
                    value={recipe.nutrition.carbs}
                    unit="g"
                    color="stone"
                  />
                  <NutritionCard
                    label="Fats"
                    value={recipe.nutrition.fats}
                    unit="g"
                    color="stone"
                  />
                  <NutritionCard
                    label="Fiber"
                    value={recipe.nutrition.fiber}
                    unit="g"
                    color="stone"
                  />
                </div>
              </div>
            )}

            {/* User Notes */}
            {recipe.user_notes && (
              <div className="bg-stone-50 rounded-xl border border-stone-200 p-5 mt-6">
                <h3 className="font-bold text-stone-900 mb-2 text-sm flex items-center gap-2">
                  <span className="text-lg">📝</span> Notes
                </h3>
                <p className="text-stone-700 text-sm leading-relaxed">
                  {recipe.user_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NutritionCard = ({ label, value, unit, color = "stone" }) => (
  <div
    className={`p-2 rounded-lg border ${
      color === "orange"
        ? "bg-orange-50 border-orange-100"
        : "bg-stone-50 border-stone-100"
    }`}
  >
    <div
      className={`text-sm font-bold ${
        color === "orange" ? "text-orange-700" : "text-stone-700"
      }`}
    >
      {value || 0}
      <span className="text-[10px] font-normal ml-0.5">{unit}</span>
    </div>
    <div className="text-[10px] uppercase font-bold text-stone-400 mt-0.5 tracking-wide">
      {label}
    </div>
  </div>
);

export default RecipeDetail;
