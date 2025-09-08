import React, { useState, useCallback, useEffect } from 'react';
import { Recipe, SavedRecipe } from './types';
import { generateRecipe } from './services/geminiService';
import Header from './components/Header';
import RecipeCard from './components/RecipeCard';
import LoadingSpinner from './components/LoadingSpinner';
import Welcome from './components/Welcome';
import ErrorDisplay from './components/ErrorDisplay';
import CameraModal from './components/CameraModal';
import SavedRecipesList from './components/SavedRecipesList';

type InputMode = 'text' | 'image' | 'video';

const DIETARY_OPTIONS = ["None", "Vegan", "Vegetarian", "Gluten-Free", "Keto"];
const LOCAL_STORAGE_KEY = 'GEMINI_RECIPE_SAVED_RECIPES';

const App: React.FC = () => {
    const [ingredients, setIngredients] = useState<string>('');
    const [dietaryOption, setDietaryOption] = useState<string>(DIETARY_OPTIONS[0]);
    const [dishType, setDishType] = useState<string>('');
    const [recipe, setRecipe] = useState<Recipe | SavedRecipe | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [inputMode, setInputMode] = useState<InputMode>('text');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
    const [shareConfirmation, setShareConfirmation] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedRecipes = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedRecipes) {
                setSavedRecipes(JSON.parse(storedRecipes));
            }
        } catch (error) {
            console.error("Failed to load recipes from localStorage", error);
        }
    }, []);

    const handleMediaCapture = (file: File) => {
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        setShowCamera(false);
    };

    const handleGenerateRecipe = useCallback(async () => {
        if (ingredients.trim()) {
            const invalidCharsRegex = /[^a-zA-Z\s,'-]/;
            if (invalidCharsRegex.test(ingredients)) {
                setError("Your ingredients list contains invalid characters. Please use only letters, commas, apostrophes, and hyphens.");
                return;
            }
        }

        if (inputMode === 'text' && !ingredients.trim()) {
            setError("Please enter some ingredients.");
            return;
        }
        if (inputMode !== 'text' && !mediaFile) {
             setError(`Please capture an ${inputMode} of your ingredients.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setRecipe(null);

        try {
            const result = await generateRecipe(ingredients, dietaryOption, dishType, mediaFile ?? undefined);
            setRecipe(result);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [ingredients, dietaryOption, dishType, mediaFile, inputMode]);

    const handleSaveRecipe = useCallback(() => {
        if (!recipe) return;
        if (savedRecipes.some(r => r.recipeName === recipe.recipeName)) return;

        const newSavedRecipe: SavedRecipe = { ...recipe };
        const updatedRecipes = [...savedRecipes, newSavedRecipe];
        setSavedRecipes(updatedRecipes);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRecipes));
    }, [recipe, savedRecipes]);
    
    const handleLoadRecipe = (recipeToLoad: SavedRecipe) => {
        setRecipe(recipeToLoad);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteRecipe = (recipeNameToDelete: string) => {
        const updatedRecipes = savedRecipes.filter(r => r.recipeName !== recipeNameToDelete);
        setSavedRecipes(updatedRecipes);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRecipes));
    };
    
    const handleRateRecipe = (recipeName: string, rating: number) => {
        const updatedRecipes = savedRecipes.map(r => 
            r.recipeName === recipeName ? { ...r, userRating: rating } : r
        );
        setSavedRecipes(updatedRecipes);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRecipes));

        if (recipe && recipe.recipeName === recipeName) {
            setRecipe(prev => prev ? { ...prev, userRating: rating } : null);
        }
    };

    const handleShareRecipe = useCallback(() => {
        if (!recipe) return;

        const recipeText = `
Check out this recipe: ${recipe.recipeName}

${recipe.description}

---INGREDIENTS---
${recipe.ingredients.map(ing => `- ${ing}`).join('\n')}

---INSTRUCTIONS---
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n\n')}
        `.trim();

        if (navigator.share) {
            navigator.share({
                title: recipe.recipeName,
                text: recipeText,
            }).catch(error => console.error('Error sharing recipe:', error));
        } else {
            navigator.clipboard.writeText(recipeText).then(() => {
                setShareConfirmation('Recipe copied to clipboard!');
                setTimeout(() => setShareConfirmation(null), 3000);
            }).catch(err => {
                console.error('Failed to copy recipe:', err);
                setShareConfirmation('Failed to copy recipe.');
                setTimeout(() => setShareConfirmation(null), 3000);
            });
        }
    }, [recipe]);

    const InputModeButton: React.FC<{mode: InputMode, label: string, icon: React.ReactElement}> = ({mode, label, icon}) => (
        <button
            onClick={() => { setInputMode(mode); setMediaFile(null); setMediaPreview(null); setError(null); }}
            className={`flex-1 p-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${inputMode === mode ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
            {icon}
            {label}
        </button>
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 md:p-10 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">What's in Your Kitchen?</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Tell us what you have, and we'll whip up a recipe.</p>

                    <div className="space-y-6">
                        {/* Input Mode Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                           <InputModeButton mode="text" label="Text" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm1 4a1 1 0 100 2h10a1 1 0 100-2H5z" clipRule="evenodd" /></svg>} />
                           <InputModeButton mode="image" label="Image" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>} />
                           <InputModeButton mode="video" label="Video" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>} />
                        </div>

                        {/* Input Area */}
                        <div>
                            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {inputMode === 'text' ? 'Available Ingredients (comma-separated)' : `Capture Ingredients (${inputMode}) & Add More (Optional)`}
                            </label>
                            {inputMode === 'text' ? (
                                <textarea
                                    id="ingredients"
                                    value={ingredients}
                                    onChange={(e) => setIngredients(e.target.value)}
                                    placeholder="e.g., chicken breast, tomatoes, basil, garlic"
                                    className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out resize-none"
                                />
                            ) : (
                                <div className="grid gap-4">
                                    <div className="w-full h-48 p-3 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                        {mediaPreview ? (
                                            <div className="relative w-full h-full">
                                                {mediaFile?.type.startsWith('image/') && <img src={mediaPreview} className="rounded-md object-contain w-full h-full" alt="Ingredient preview" />}
                                                {mediaFile?.type.startsWith('video/') && <video src={mediaPreview} className="rounded-md object-contain w-full h-full" controls />}
                                                <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 leading-none">&times;</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setShowCamera(true)} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg capitalize">
                                                Capture {inputMode}
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        value={ingredients}
                                        onChange={(e) => setIngredients(e.target.value)}
                                        placeholder="Add any extra ingredients here..."
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                     />
                                </div>
                            )}
                        </div>
                        
                         <div>
                            <label htmlFor="dishType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Dish Type (Optional)
                            </label>
                            <input
                                id="dishType"
                                value={dishType}
                                onChange={(e) => setDishType(e.target.value)}
                                placeholder="e.g., masala, pasta, stir-fry"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                            />
                        </div>


                        <div>
                            <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Dietary Preference
                            </label>
                            <select
                                id="dietary"
                                value={dietaryOption}
                                onChange={(e) => setDietaryOption(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                            >
                                {DIETARY_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleGenerateRecipe}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                        >
                             {isLoading ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.05-7.05l-.707-.707m12.727 0l.707-.707M6.343 17.657l-.707.707m12.727 0l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>Generate Recipe</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                 {showCamera && inputMode !== 'text' && (
                    <CameraModal
                        mode={inputMode}
                        onClose={() => setShowCamera(false)}
                        onCapture={handleMediaCapture}
                    />
                )}

                <div className="mt-12 max-w-4xl mx-auto">
                    {isLoading && <div className="flex justify-center"><LoadingSpinner large={true} /></div>}
                    {error && <ErrorDisplay message={error} />}
                    {recipe && !isLoading && (
                        <RecipeCard 
                            recipe={recipe} 
                            onSave={handleSaveRecipe}
                            isSaved={savedRecipes.some(r => r.recipeName === recipe.recipeName)}
                            onShare={handleShareRecipe}
                        />
                    )}
                    {!recipe && !isLoading && !error && <Welcome />}
                </div>

                <SavedRecipesList 
                    recipes={savedRecipes} 
                    onLoad={handleLoadRecipe} 
                    onDelete={handleDeleteRecipe} 
                    onRate={handleRateRecipe}
                />
            </main>

            {shareConfirmation && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white py-2 px-5 rounded-full shadow-lg text-sm font-semibold animate-fade-in">
                    {shareConfirmation}
                </div>
            )}
        </div>
    );
};

export default App;