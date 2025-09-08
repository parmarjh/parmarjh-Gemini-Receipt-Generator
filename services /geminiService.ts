import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeName: {
            type: Type.STRING,
            description: 'The name of the recipe.',
        },
        description: {
            type: Type.STRING,
            description: 'A short, enticing description of the dish.',
        },
        prepTime: {
            type: Type.STRING,
            description: 'Estimated preparation time (e.g., "15 minutes").'
        },
        cookTime: {
            type: Type.STRING,
            description: 'Estimated cooking time (e.g., "30 minutes").'
        },
        servings: {
            type: Type.STRING,
            description: 'How many servings the recipe makes (e.g., "4 servings").'
        },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: 'A single ingredient with its quantity (e.g., "1 cup of flour").'
            },
            description: 'A list of all ingredients required for the recipe.',
        },
        instructions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: 'A single, clear step in the cooking instructions.'
            },
            description: 'The step-by-step instructions to prepare the dish.',
        },
    },
    required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"],
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // remove the data url prefix: "data:image/jpeg;base64,"
                resolve(reader.result.split(',')[1]); 
            } else {
                reject(new Error("Failed to read blob as a base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


export const generateRecipe = async (
    ingredients: string, 
    dietaryOption: string,
    dishType: string,
    mediaFile?: File
): Promise<Recipe> => {
    const dietaryPrompt = dietaryOption === 'None' ? '' : `The recipe must be ${dietaryOption}.`;
    const dishTypePrompt = dishType ? `The recipe should be a type of "${dishType}".` : '';

    const parts: any[] = [];
    let prompt;

    if (mediaFile) {
        const base64Data = await blobToBase64(mediaFile);
        parts.push({
            inlineData: {
                mimeType: mediaFile.type,
                data: base64Data,
            },
        });
        prompt = `You are an expert chef who creates simple, delicious, and creative recipes.
Analyze the provided media (image or video) to identify all available food ingredients.
Based on the ingredients you identify, generate a complete recipe.
The user has also provided the following text for additional context: "${ingredients}". Use this to clarify ambiguity, but prioritize visually present ingredients. Ensure any text ingredients are also valid food items.
You can assume common pantry staples like salt, pepper, oil, and water are available.
${dishTypePrompt}
${dietaryPrompt}
Return the response in a JSON format that adheres to the provided schema. If you cannot identify any valid food ingredients from the media or text, return an error message in the JSON's description field.`;

    } else {
        prompt = `You are an expert chef who creates simple, delicious, and creative recipes.
First, verify that the following list of items contains actual food ingredients. If the list contains non-food items or is nonsensical, your response's description field should contain an error message explaining why a recipe cannot be created.
If the ingredients are valid, generate a complete recipe based on them.
Available ingredients: ${ingredients}.
${dishTypePrompt}
${dietaryPrompt}
You can assume common pantry staples like salt, pepper, oil, and water are available.
Please create a recipe that primarily uses the listed ingredients.
Return the response in a JSON format that adheres to the provided schema.`;
    }

    parts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
                temperature: 0.8,
                topP: 0.95,
            },
        });
        
        const jsonText = response.text.trim();
        const recipeData: Recipe = JSON.parse(jsonText);
        
        return recipeData;
    } catch (error) {
        console.error("Error generating recipe:", error);
        if (mediaFile) {
            throw new Error("Failed to generate recipe from media. The model may have been unable to identify ingredients. Please try again with a clearer picture or video.");
        }
        throw new Error("Failed to generate recipe. The model may be unable to create a recipe with the provided ingredients. Please try again.");
    }
};
