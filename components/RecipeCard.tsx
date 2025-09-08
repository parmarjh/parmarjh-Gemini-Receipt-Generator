import React from 'react';
import { Recipe } from '../types';
import StarRating from './StarRating';

interface RecipeCardProps {
    recipe: Recipe & { userRating?: number };
    onSave?: () => void;
    isSaved?: boolean;
    onShare?: () => void;
}

const InfoPill: React.FC<{ icon: React.ReactElement; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center bg-emerald-50 dark:bg-emerald-900/50 p-3 rounded-lg">
        <div className="text-emerald-500 mb-1">{icon}</div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</span>
        <span className="text-gray-800 dark:text-white font-bold">{value}</span>
    </div>
);


const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSave, isSaved, onShare }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white flex-1 pr-4">{recipe.recipeName}</h2>
                    <div className="flex-shrink-0 flex items-center gap-2">
                         {onSave && (
                            <button
                                onClick={onSave}
                                disabled={isSaved}
                                className="flex-shrink-0 flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 dark:hover:bg-emerald-900"
                            >
                                {isSaved ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                )}
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                        )}
                        {onShare && (
                             <button
                                onClick={onShare}
                                className="flex-shrink-0 flex items-center gap-2 bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-blue-200 dark:hover:bg-blue-900"
                                aria-label="Share this recipe"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                Share
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{recipe.description}</p>
                
                {recipe.userRating !== undefined && recipe.userRating > 0 && (
                     <div className="flex items-center gap-2 mb-6">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Your Rating:</span>
                        <StarRating rating={recipe.userRating} />
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <InfoPill 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        label="Prep Time"
                        value={recipe.prepTime}
                    />
                    <InfoPill 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.354 15.646A8.01 8.01 0 016.343 7.343" /></svg>}
                        label="Cook Time"
                        value={recipe.cookTime}
                    />
                     <InfoPill 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        label="Servings"
                        value={recipe.servings}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold border-b-2 border-emerald-500 pb-2 mb-4 text-gray-800 dark:text-white">Ingredients</h3>
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-start">
                                    <svg className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                        <h3 className="text-xl font-bold border-b-2 border-emerald-500 pb-2 mb-4 text-gray-800 dark:text-white">Instructions</h3>
                        <ol className="space-y-4">
                            {recipe.instructions.map((step, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex-shrink-0 h-8 w-8 bg-emerald-500 text-white font-bold text-sm rounded-full flex items-center justify-center mr-4">{index + 1}</span>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{step}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;