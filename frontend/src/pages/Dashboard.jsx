import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ChefHat,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  TrendingUp,
  Clock,
} from "lucide-react";

import api from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    pantryItems: 0,
    mealsThisWeek: 0,
  });
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [upcomingMeals, setUpcomingMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashBoardData();
  }, []);

  const fetchDashBoardData = async () => {
    try {
      setLoading(true);
      const [recipeRes, pantryRes, mealRes, recentRes, upcomingRes] =
        await Promise.all([
          api.get("/recipes/stats"),
          api.get("/pantry/stats"),
          api.get("/meal-plans/stats"),
          api.get("/recipes/recent?limit=4"),
          api.get("/meal-plans/upcoming?limit=5"),
        ]);

      setStats({
        totalRecipes: recipeRes.data.data.stats.total_recipes || 0,
        pantryItems: pantryRes.data.data.stats.total_items || 0,
        mealsThisWeek: mealRes.data.data.stats.this_week_count || 0,
      });
      setRecentRecipes(recentRes.data.data.recipes || []);
      setUpcomingMeals(upcomingRes.data.data.meals || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column (Left takes 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Area */}
            <div>
              <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-stone-500 mt-1">
                Here's what's cooking in your kitchen today.
              </p>
            </div>

            {/* Hero Action: Generate */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm relative overflow-hidden group flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <ChefHat className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Create something delicious
                  </h2>
                </div>
                <p className="text-sm text-stone-600 max-w-lg">
                  Have ingredients but no ideas? Let our AI chef craft the
                  perfect recipe for you in seconds.
                </p>
              </div>

              <Link
                to="/generate"
                className="relative z-10 inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                Generate Recipe
                <TrendingUp className="w-4 h-4" />
              </Link>

              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50 group-hover:opacity-75 transition-opacity pointer-events-none" />
            </div>

            {/* Recent Creations Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-900">
                  Recent Creations
                </h2>
                <Link
                  to="/recipes"
                  className="text-sm text-stone-500 hover:text-orange-600 font-medium transition-colors"
                >
                  View all recipes
                </Link>
              </div>

              {recentRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentRecipes.map((recipe) => (
                    <Link
                      key={recipe.id}
                      to={`/recipes/${recipe.id}`}
                      className="bg-white p-4 rounded-xl border border-stone-200 hover:border-orange-200 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                          <ChefHat className="w-5 h-5 text-stone-500 group-hover:text-orange-500" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-stone-100 text-stone-600 rounded-full">
                          {recipe.cook_time}m
                        </span>
                      </div>
                      <h3 className="font-semibold text-stone-900 line-clamp-1 mb-1">
                        {recipe.name}
                      </h3>
                      <p className="text-sm text-stone-500 line-clamp-2">
                        {recipe.description || "No description available"}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500">
                  No recipes yet. Start cooking!
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column (Right takes 1/3) */}
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-sm text-stone-500 mb-1">Total Recipes</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.totalRecipes}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-sm text-stone-500 mb-1">In Pantry</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.pantryItems}
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                Kitchen Management
              </h3>
              <div className="space-y-3">
                <Link
                  to="/pantry"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-medium text-stone-700">
                      My Pantry
                    </span>
                  </div>
                  <span className="text-stone-400">→</span>
                </Link>
                <Link
                  to="/meal-plan"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-stone-700">
                      Meal Plan
                    </span>
                  </div>
                  <span className="text-stone-400">→</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Meals List */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-4">Upcoming Meals</h3>
              {upcomingMeals.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-start gap-3 pb-3 border-b border-stone-100 last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-orange-600">
                          {meal.meal_date
                            ? new Date(meal.meal_date).getDate()
                            : "Today"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-900 line-clamp-1">
                          {meal.recipe_name}
                        </h4>
                        <p className="text-xs text-stone-500 capitalize">
                          {meal.meal_type}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/meal-plan"
                    className="block text-center text-sm text-stone-500 hover:text-orange-600 mt-2"
                  >
                    View weekly plan
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-stone-500 mb-3">
                    No meals planned yet
                  </p>
                  <Link
                    to="/meal-plan"
                    className="text-sm text-orange-600 font-medium hover:underline"
                  >
                    Plan your week check
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Removed StatCard component as it is replaced by inline stats in sidebar
const StatCard = null;

export default Dashboard;
