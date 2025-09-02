// src/components/profile/LogoUpload.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import Button from '../ui/Button';

interface LogoUploadProps {
  currentLogoUrl?: string;
  organizationName?: string;
  onLogoUpdate: (file: File) => Promise<void>;
  onLogoRemove: () => Promise<void>;
}

const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogoUrl,
  organizationName,
  onLogoUpdate,
  onLogoRemove
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      await onLogoUpdate(file);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUploading(true);
      await onLogoRemove();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  };

  const generateDefaultAvatar = (name: string) => {
    const letter = name ? name.charAt(0).toUpperCase() : 'U';
    return (
      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
        {letter}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0">
          {currentLogoUrl ? (
            <img
              src={currentLogoUrl}
              alt="Organization Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            generateDefaultAvatar(organizationName || 'User')
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 mb-3">
            Upload a logo for your organization. Recommended size: 400x400px
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="border border-gray-600 hover:bg-white/10"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : currentLogoUrl ? 'Change Logo' : 'Upload Logo'}
            </Button>
            
            {currentLogoUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default LogoUpload;