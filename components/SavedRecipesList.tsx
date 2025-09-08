import React from 'react';
import { SavedRecipe } from '../types';
import StarRating from './StarRating';

interface SavedRecipesListProps {
    recipes: SavedRecipe[];
    onLoad: (recipe: SavedRecipe) => void;
    onDelete: (recipeName: string) => void;
    onRate: (recipeName: string, rating: number) => void;
}

const SavedRecipesList: React.FC<SavedRecipesListProps> = ({ recipes, onLoad, onDelete, onRate }) => {
    if (recipes.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Saved Recipes</h2>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                <ul className="space-y-4">
                    {recipes.map(recipe => (
                        <li key={recipe.recipeName} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-shadow hover:shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                           <div className="flex-1">
                                <span className="font-semibold text-gray-800 dark:text-gray-200 block">{recipe.recipeName}</span>
                                <div className="mt-2 sm:mt-0">
                                     <StarRating rating={recipe.userRating || 0} onRatingChange={(newRating) => onRate(recipe.recipeName, newRating)} />
                                </div>
                           </div>
                            <div className="flex-shrink-0 flex gap-2">
                                <button
                                    onClick={() => onLoad(recipe)}
                                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-bold py-2 px-3 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                                    aria-label={`Load recipe for ${recipe.recipeName}`}
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => onDelete(recipe.recipeName)}
                                    className="bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200 text-xs font-bold py-2 px-3 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                                    aria-label={`Delete recipe for ${recipe.recipeName}`}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SavedRecipesList;
