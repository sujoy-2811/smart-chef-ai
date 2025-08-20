import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY,
});

if (!process.env.GEMINI_KEY || !process.env.AI_MODEL) {
  console.error("GEMINI_KEY is not set. AI features will not work.");
}

export const generateRecipe = async ({
  ingredients,
  dietaryRestrictions = [],
  cuisineType = "any",
  servings = 4,
  cookingTime = "medium",
}) => {
  const safeDietaryRestrictions = Array.isArray(dietaryRestrictions)
    ? dietaryRestrictions
    : [];

  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];

  const dietaryInfo =
    safeDietaryRestrictions.length > 0
      ? `Dietary restrictions: ${safeDietaryRestrictions.join(", ")}.`
      : "No dietary restrictions.";

  const timeGuide = {
    quick: "under 30 minutes",
    medium: "30-60 minutes",
    long: "over 60 minutes",
  };

  const prompt = `Generate a detailed recipe with the following requirements :
    
    Ingredients available: ${safeIngredients.join(", ")}
    ${dietaryInfo}
    Cuisine type: ${cuisineType}
    Servings: ${servings}
    Cooking time: ${timeGuide[cookingTime] || "any"}

    Please provide a complete recipe in the following JSON format (return only valid JSON , no markdown):

    {
        "name": "Recipe Name",
        "description": "Brief description of the recipe",
        "cuisineType": "${cuisineType}",
        "difficulty": "easy/medium/hard",
        "prepTime" : number (in minutes),
        "cookTime" : number (in minutes),
        "servings" : ${servings},
        "ingredients" : [
            {
                "name" : "Ingredient name",
                "quantity" : number,
                "unit" : "measurement unit"
            },
        ],
        "instructions" : [
            "Step 1 description",
            "Step 2 description",
        ],

        "dietaryTags": ["vegetarian", "gluten-free", etc.],
        "nutrition": {
            "calories": number (in grams),
            "protein": number (in grams),
            "carbs": number (in grams),
            "fats": number (in grams),
            "fiber": number (in grams)
        },
        "cookingTips" : [
            "Tip 1",
            "Tip 2"
        ]   
    }

    Make sure the recipe is creative and utilizes the provided ingredients effectively.`;

  try {
    const response = await ai.models.generateContent({
      model: process.env.AI_MODEL,
      contents: prompt,
    });

    const generatedText = response.text.trim();

    // Remove markdown code blocks if present
    let jsonText = generatedText;

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const recipe = JSON.parse(jsonText);
    return recipe;
  } catch (err) {
    console.error("Error generating recipe:", err);
    throw new Error("Failed to generate recipe. Please try again.");
  }
};

export const generatePantrySuggestions = async (pantryItems, expiringItem) => {
  const ingredients = pantryItems.map((item) => item.name).join(", ");
  const expiringText =
    expiringItem.length > 0
      ? `Priority ingredients (expiring soon): ${expiringItem.join(", ")}.`
      : "";

  const prompt = `Based on these available ingredients : ${ingredients}${expiringText} , suggest 5 creative recipe ideas that use these ingredients. Return only a JSON array of strings (no markdown) :
    ["Recipe idea 1",  "Recipe idea 2", "Recipe idea 3" ]

    Each suggestion should be a brief, appetizing description (1-2 sentences).`;

  try {
    const response = await ai.models.generateContent({
      model: process.env.AI_MODEL,
      contents: prompt,
    });

    const generatedText = response.text.trim();

    // Remove markdown code blocks if present
    let jsonText = generatedText;

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const suggestions = JSON.parse(jsonText);
    return suggestions;
  } catch (err) {
    console.error("Error generating pantry suggestions:", err);
    throw new Error("Failed to generate pantry suggestions. Please try again.");
  }
};

export const generateCookingTips = async (recipe) => {
  const prompt = `For this recipe : "${recipe.name}"
    Provide 3-5 helpful cooking tips to make this recipe better. Return a JSON array of strings (no markdown) :
    ["Tip 1", "Tip 2", "Tip 3"]`;

  try {
    const response = await ai.models.generateContent({
      model: process.env.AI_MODEL,
      contents: prompt,
    });

    const generatedText = response.text.trim();

    // Remove markdown code blocks if present
    let jsonText = generatedText;

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const tips = JSON.parse(jsonText);
    return tips;
  } catch (err) {
    console.error("Error generating cooking tips:", err);
    return ["Cooking with love and patience"];
  }
};
