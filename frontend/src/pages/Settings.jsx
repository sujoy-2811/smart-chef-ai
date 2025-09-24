import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Trash2,
  Save,
  ChefHat,
  Utensils,
  Settings as SettingsIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
];
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

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    allergies: [],
    preferred_cuisines: [],
    default_servings: 4,
    measurement_unit: "metric",
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/profile");
      const userData = response.data?.data?.user || {};
      const preferenceData = response.data?.data?.preferences || {};

      setProfile({
        name: userData.name || "",
        email: userData.email || "",
      });
      setPreferences({
        dietary_restrictions: preferenceData.dietary_restrictions || [],
        allergies: preferenceData.allergies || [],
        preferred_cuisines: preferenceData.preferred_cuisines || [],
        default_servings: preferenceData.default_servings || 4,
        measurement_unit: preferenceData.measurement_units || "metric",
      });
    } catch {
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await api.put("/users/profile", profile);
      toast.success("Profile updated successfully");

      // Upate Local storage
      const updatedUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/users/preferences", {
        ...preferences,
        measurement_units: preferences.measurement_unit,
      });
      toast.success("Preferences updated successfully");
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      await api.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== "DELETE") {
      toast.error("Account deletion cancelled");
      return;
    }

    try {
      await api.delete("/users/delete");
      toast.success("Account deleted successfully");
      logout();
      navigate("/login");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const toggleDietary = (option) => {
    setPreferences((prev) => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(option)
        ? prev.dietary_restrictions.filter((d) => d !== option)
        : [...prev.dietary_restrictions, option],
    }));
  };

  const toggleCuisine = (cuisine) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
        ? prev.preferred_cuisines.filter((c) => c !== cuisine)
        : [...prev.preferred_cuisines, cuisine],
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Profile Information
                  </h2>
                  <p className="text-sm text-stone-500">
                    Update your account details
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Dietary Preferences
                  </h2>
                  <p className="text-sm text-stone-500">
                    Customize your recipe suggestions
                  </p>
                </div>
              </div>

              <form onSubmit={handlePreferencesUpdate} className="space-y-8">
                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    Dietary Restrictions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleDietary(option)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          preferences.dietary_restrictions.includes(option)
                            ? "bg-orange-600 text-white shadow-md transform scale-105"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Allergies
                  </label>
                  <input
                    type="text"
                    value={preferences.allergies.join(", ")}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        allergies: e.target.value
                          .split(",")
                          .map((a) => a.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., peanuts, shellfish (comma separated)"
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                {/* Cuisines */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    Preferred Cuisines
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINES.map((cuisine) => (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          preferences.preferred_cuisines.includes(cuisine)
                            ? "bg-orange-600 text-white shadow-md transform scale-105"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Servings */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Default Servings:{" "}
                      <span className="text-orange-600 font-bold">
                        {preferences.default_servings}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={preferences.default_servings}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          default_servings: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="flex justify-between text-xs text-stone-400 mt-1">
                      <span>1</span>
                      <span>12</span>
                    </div>
                  </div>

                  {/* Units */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Measurement Unit
                    </label>
                    <div className="flex p-1 bg-stone-100 rounded-lg">
                      {["metric", "imperial"].map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              measurement_unit: unit,
                            })
                          }
                          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                            preferences.measurement_unit === unit
                              ? "bg-white text-stone-900 shadow-sm"
                              : "text-stone-500 hover:text-stone-700"
                          }`}
                        >
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Security
                  </h2>
                  <p className="text-sm text-stone-500">
                    Manage your password and security settings
                  </p>
                </div>
              </div>

              <form
                onSubmit={handlePasswordChange}
                className="space-y-4 max-w-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-1">
                    Delete Account
                  </h3>
                  <p className="text-red-700 text-sm mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-4 bg-stone-50 border-b border-stone-200">
                <h2 className="font-semibold text-stone-900">Settings</h2>
              </div>
              <nav className="p-2 space-y-1">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  {
                    id: "preferences",
                    label: "Preferences",
                    icon: SettingsIcon,
                  },
                  { id: "security", label: "Security", icon: Lock },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-orange-50 text-orange-700"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
