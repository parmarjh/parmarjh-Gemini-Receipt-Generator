
import React from 'react';

interface LoadingSpinnerProps {
    large?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ large = false }) => {
    const size = large ? 'h-12 w-12' : 'h-5 w-5';
    return (
        <div 
            className={`${size} animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-emerald-500 motion-reduce:animate-[spin_1.5s_linear_infinite]`}
            role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
            </span>
        </div>
    );
};

export default LoadingSpinner;
