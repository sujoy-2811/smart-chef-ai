import { useState, useEffect } from "react";
import { ChefHat, Sparkles, Plus, X, Clock, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";

const CUISINES = [
  "Any",
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
const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
];
const COOKING_TIMES = [
  { value: "quick", label: "Quick (<30 min)" },
  { value: "medium", label: "Medium (30-60 min)" },
  { value: "long", label: "Long (>60 min)" },
];

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [usePantry, setUsePantry] = useState(false);
  const [cuisineType, setCuisineType] = useState("Any");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [servings, setServings] = useState(4);
  const [cookingTime, setCookingTime] = useState("medium");
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load user preferences on component mount
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await api.get("/users/profile");
        const preferences = response.data.data.preferences;
        if (preferences) {
          if (
            preferences.dietary_restrictions &&
            preferences.dietary_restrictions.length > 0
          ) {
            setDietaryRestrictions(preferences.dietary_restrictions);
          }
          if (
            preferences.preferred_cuisines &&
            preferences.preferred_cuisines.length > 0
          ) {
            setCuisineType(preferences.preferred_cuisines[0]);
          }
          if (preferences.default_servings) {
            setServings(preferences.default_servings);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchUserPreferences();
  }, []);

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const toggleDietary = (option) => {
    if (dietaryRestrictions.includes(option)) {
      setDietaryRestrictions(dietaryRestrictions.filter((d) => d !== option));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, option]);
    }
  };

  const handleGenerate = async () => {
    if (!usePantry && ingredients.length === 0) {
      toast.error("Please add at least one ingredient or use pantry items");
      return;
    }

    setGenerating(true);
    setGeneratedRecipe(null);

    try {
      const response = await api.post("/recipes/generate", {
        ingredients,
        usePantryIngredients: usePantry,
        dietaryRestrictions,
        cuisineType: cuisineType === "Any" ? "any" : cuisineType,
        servings,
        cookingTime,
      });

      setGeneratedRecipe(response.data.data.recipe);
      toast.success("Recipe generated successfully!");
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Failed to generate recipe. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    setSaving(true);
    try {
      await api.post("/recipes", {
        name: generatedRecipe.name,
        description: generatedRecipe.description,
        cuisine_type: generatedRecipe.cuisineType,
        difficulty: generatedRecipe.difficulty,
        prep_time: generatedRecipe.prepTime,
        cook_time: generatedRecipe.cookTime,
        servings: generatedRecipe.servings,
        instructions: generatedRecipe.instructions,
        dietary_tags: generatedRecipe.dietaryTags || [],
        ingredients: generatedRecipe.ingredients,
        nutrition: generatedRecipe.nutrition,
      });
      toast.success("Recipe saved to your collection!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Input Section (Left) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2.5 rounded-xl">
                  <Sparkles className="w-7 h-7 text-orange-600" />
                </div>
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
                  AI Chef
                </h1>
              </div>
              <p className="text-base text-stone-500">
                Tell us what you have, and we'll tell you what to cook.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5">
              {/* Ingredients Section */}
              <div>
                <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-orange-500 rounded-full" />
                  Ingredients
                </h2>

                {/* Use Pantry Toggle */}
                <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl mb-3 cursor-pointer hover:bg-stone-100 transition-colors border border-stone-100">
                  <span className="text-sm font-medium text-stone-700">
                    Use pantry items
                  </span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePantry}
                      onChange={(e) => setUsePantry(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                  </div>
                </label>

                {/* Manual Ingredient Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                    placeholder="e.g., tomatoes, chicken"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-stone-400 text-sm"
                  />
                  <button
                    onClick={addIngredient}
                    className="px-3 bg-stone-900 hover:bg-black text-white rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Ingredient Tags */}
                {ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-800 rounded-lg text-xs font-medium border border-orange-100"
                      >
                        {ingredient}
                        <button
                          onClick={() => removeIngredient(ingredient)}
                          className="hover:text-orange-900 transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    No custom ingredients added.
                  </p>
                )}
              </div>

              <div className="h-px bg-stone-100" />

              {/* Preferences Section */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                  Preferences
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {/* Cuisine Type */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                      Cuisine
                    </label>
                    <select
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer text-sm"
                    >
                      {CUISINES.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Servings */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                        Servings
                      </label>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        {servings}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                    Dietary
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleDietary(option)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                          dietaryRestrictions.includes(option)
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cooking Time */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                    Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COOKING_TIMES.map((time) => (
                      <button
                        key={time.value}
                        onClick={() => setCookingTime(time.value)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors border text-center flex flex-col items-center justify-center gap-0.5 ${
                          cookingTime === time.value
                            ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        <span className="font-bold">
                          {time.label.split(" (")[0]}
                        </span>
                        <span className="text-[10px] opacity-80 whitespace-nowrap">
                          {time.label.split(" (")[1].replace(")", "")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Recipe
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-6">
            {generatedRecipe ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm h-full">
                {/* Recipe Header */}
                <div>
                  <h2 className="text-3xl font-bold text-stone-900 mb-3">
                    {generatedRecipe.name}
                  </h2>
                  <p className="text-stone-600 text-lg leading-relaxed">
                    {generatedRecipe.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium border border-stone-200">
                      {generatedRecipe.cuisineType}
                    </span>
                    <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100 capitalize">
                      {generatedRecipe.difficulty}
                    </span>
                    {generatedRecipe.dietaryTags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-8 mt-6 py-6 border-y border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                          Time
                        </p>
                        <p className="font-semibold text-stone-900">
                          {generatedRecipe.prepTime + generatedRecipe.cookTime}{" "}
                          mins
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-stone-100 text-stone-600 rounded-lg">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                          Servings
                        </p>
                        <p className="font-semibold text-stone-900">
                          {generatedRecipe.servings} people
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-stone-900 mb-4">
                    Ingredients
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {generatedRecipe.ingredients?.map((ing, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-stone-700 p-3 bg-stone-50 rounded-xl border border-stone-100"
                      >
                        <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0"></span>
                        <span className="font-medium">
                          {ing.quantity} {ing.unit}
                        </span>{" "}
                        <span className="text-stone-600">{ing.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-stone-900 mb-4">
                    Instructions
                  </h3>
                  <ol className="space-y-4">
                    {generatedRecipe.instructions?.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="shrink-0 w-8 h-8 bg-stone-900 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                          {index + 1}
                        </span>
                        <span className="text-stone-700 pt-1 text-lg leading-relaxed">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition */}
                {generatedRecipe.nutrition && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-stone-900 mb-4">
                      Nutrition{" "}
                      <span className="text-sm font-normal text-stone-500">
                        (per serving)
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <NutritionBadge
                        label="Calories"
                        value={generatedRecipe.nutrition.calories}
                        unit="kcal"
                      />
                      <NutritionBadge
                        label="Protein"
                        value={generatedRecipe.nutrition.protein}
                        unit="g"
                      />
                      <NutritionBadge
                        label="Carbs"
                        value={generatedRecipe.nutrition.carbs}
                        unit="g"
                      />
                      <NutritionBadge
                        label="Fats"
                        value={generatedRecipe.nutrition.fats}
                        unit="g"
                      />
                      <NutritionBadge
                        label="Fiber"
                        value={generatedRecipe.nutrition.fiber}
                        unit="g"
                      />
                    </div>
                  </div>
                )}

                {/* Cooking Tips */}
                {generatedRecipe.cookingTips &&
                  generatedRecipe.cookingTips.length > 0 && (
                    <div className="mt-8 bg-amber-50 rounded-xl p-5 border border-amber-100">
                      <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <div className="p-1 bg-amber-100 rounded-md">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                        </div>
                        Cooking Tips
                      </h3>
                      <ul className="space-y-2">
                        {generatedRecipe.cookingTips.map((tip, index) => (
                          <li
                            key={index}
                            className="text-sm text-amber-800 flex gap-2"
                          >
                            <span className="text-amber-500">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-8 border-t border-stone-100">
                  <button
                    onClick={handleSaveRecipe}
                    disabled={saving}
                    className="flex-1 bg-stone-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    {saving ? "Saving..." : "Save Recipe"}
                  </button>
                  <button
                    onClick={() => setGeneratedRecipe(null)}
                    className="px-8 py-3.5 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50 font-bold transition-colors"
                  >
                    New Recipe
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] shadow-sm">
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                  <ChefHat className="w-12 h-12 text-stone-300" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">
                  Ready to Cook?
                </h3>
                <p className="text-stone-500 max-w-md mx-auto">
                  Add your ingredients and preferences, and let our AI chef
                  create the perfect recipe for you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NutritionBadge = ({ label, value, unit }) => (
  <div className="text-center p-3 bg-stone-50 rounded-xl border border-stone-100">
    <div className="text-lg font-bold text-stone-900">
      {value}
      {unit}
    </div>
    <div className="text-xs text-stone-500 font-medium uppercase tracking-wide mt-1">
      {label}
    </div>
  </div>
);

export default RecipeGenerator;
