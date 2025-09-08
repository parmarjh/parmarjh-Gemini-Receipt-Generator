
import React from 'react';

const Welcome: React.FC = () => {
    return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
            <div className="flex justify-center items-center mb-4">
                 <svg className="h-16 w-16 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Ready to Cook?</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
                Your next favorite meal is just a few clicks away. <br /> Enter your ingredients above to get started.
            </p>
        </div>
    );
};

export default Welcome;
