import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, ChefHat, Trash2, Filter, Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);

  const cuisines = [
    "All",
    "Italian",
    "Mexican",
    "Indian",
    "Chinese",
    "Japanese",
    "Thai",
    "French",
    "Mediterranean",
    "American",
  ];
  const difficulties = ["All", "easy", "medium", "hard"];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await api.get("/recipes");
        setRecipes(response.data.data.recipes || []);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("Failed to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await api.delete(`/recipes/${id}`);
      setRecipes(recipes.filter((recipe) => recipe.id !== id));
      toast.success("Recipe deleted successfully!");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe. Please try again.");
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      !searchQuery ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine =
      selectedCuisine === "All" || recipe.cuisine_type === selectedCuisine;

    const matchesDifficulty =
      selectedDifficulty === "All" || recipe.difficulty === selectedDifficulty;

    return matchesSearch && matchesCuisine && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Compact */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight leading-none">
              My Recipes
            </h1>
            <div className="h-5 w-px bg-stone-300 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm">
              <ChefHat className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-semibold">
                {recipes.length} Recipes
              </span>
            </div>
          </div>

          <Link
            to="/generate"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Recipe</span>
          </Link>
        </div>

        {/* Search and Filters - Compact */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your recipes..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Filters Group */}
            <div className="flex gap-3">
              {/* Cuisine Filter */}
              <div className="relative">
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer text-stone-700 font-medium"
                >
                  {cuisines.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine === "All" ? "All Cuisines" : cuisine}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer text-stone-700 font-medium capitalized"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff === "All"
                        ? "All Difficulties"
                        : diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChefHat className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              No recipes found
            </h3>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              {recipes.length === 0
                ? "You haven't saved any recipes yet. Start by generating one with our AI Chef!"
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {recipes.length === 0 && (
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                <ChefHat className="w-5 h-5" />
                Generate Recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, onDelete }) => {
  const totalTime =
    (parseInt(recipe.prep_time) || 0) + (parseInt(recipe.cook_time) || 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      {/* Recipe Image Placeholder */}
      <div className="h-48 bg-orange-100 flex items-center justify-center relative overflow-hidden group-hover:bg-orange-200 transition-colors duration-300">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ChefHat className="w-16 h-16 text-orange-500 group-hover:text-orange-700 group-hover:scale-110 transition-all duration-300" />
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-stone-700 border border-stone-200 shadow-sm">
          {recipe.cuisine_type || "Unknown"}
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <Link
            to={`/recipes/${recipe.id}`}
            className="block mb-2 group-hover:text-orange-600 transition-colors"
          >
            <h3 className="font-bold text-xl text-stone-900 line-clamp-1">
              {recipe.name}
            </h3>
          </Link>

          {recipe.description && (
            <p className="text-sm text-stone-500 line-clamp-2 mb-4 h-10">
              {recipe.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                recipe.difficulty === "easy"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : recipe.difficulty === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-red-50 text-red-700 border-red-100"
              } capitalize`}
            >
              {recipe.difficulty}
            </span>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium border border-stone-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalTime}m
            </span>
            {recipe.calories && (
              <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium border border-stone-200">
                {recipe.calories} kcal
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-stone-100 mt-auto">
          <Link
            to={`/recipes/${recipe.id}`}
            className="flex-1 bg-stone-900 hover:bg-black text-white text-center py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm"
          >
            View Details
          </Link>
          <button
            onClick={() => onDelete(recipe.id)}
            className="px-3.5 py-2.5 border border-stone-200 text-stone-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-xl transition-colors"
            title="Delete Recipe"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyRecipes;
