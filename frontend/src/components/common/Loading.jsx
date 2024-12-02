// Loading spinner component for inline use
export const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12'
    };
  
    return (
      <div className="flex justify-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`} />
      </div>
    );
  };
  
  // Full page loading overlay
  export const LoadingOverlay = ({ message = 'Loading...' }) => {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    );
  };
  
  // Loading skeleton for content
  export const LoadingSkeleton = () => {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  };
  
  export default { LoadingSpinner, LoadingOverlay, LoadingSkeleton };