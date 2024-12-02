import { useState } from 'react';
import { LoadingSpinner, LoadingOverlay, LoadingSkeleton } from './Loading';

export const ErrorTest = () => {
  const [throwError, setThrowError] = useState(false);

  if (throwError) {
    throw new Error('Test error');
  }

  return (
    <button
      onClick={() => setThrowError(true)}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Trigger Error
    </button>
  );
};

export const LoadingTest = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  if (loading) {
    return <LoadingOverlay message="Testing loading state..." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Loading Components Demo</h2>
      
      <div className="space-y-2">
        <p>Spinner Sizes:</p>
        <div className="flex space-x-4 items-center">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </div>
      
      <div className="space-y-2">
        <p>Loading Skeleton:</p>
        <LoadingSkeleton />
      </div>
      
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Show Loading Overlay
      </button>
    </div>
  );
};