// src/components/profile/SocialLinksManager.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import { socialLinksService, SocialLink, SocialPlatform } from '../../services/socialLinks';

interface SocialLinksManagerProps {
  userId?: number; // If provided, shows read-only view for other users
  showTitle?: boolean;
}

const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ 
  userId, 
  showTitle = true 
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [error, setError] = useState<string>('');

  const isReadOnly = userId !== undefined;

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [linksData, platformsData] = await Promise.all([
        userId 
          ? socialLinksService.getUserSocialLinks(userId)
          : socialLinksService.getMySocialLinks(),
        socialLinksService.getAvailablePlatforms()
      ]);
      
      setSocialLinks(linksData);
      setPlatforms(platformsData.platforms);
    } catch (error: any) {
      setError('Failed to load social links');
      console.error('Error fetching social links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async (platform: string, username: string, url?: string) => {
    try {
      const payload = {
        platform,
        username,
        ...(url && url.trim() !== '' && { url })  // Only include URL if provided
      };
      
      const newLink = await socialLinksService.createSocialLink(payload);
      setSocialLinks(prev => [...prev.filter(link => link.platform !== platform), newLink]);
      setShowAddModal(false);
      setError('');
    } catch (error: any) {
      console.error('Social link creation error:', error.response?.data);
      setError(error.response?.data?.detail || 'Failed to add social link');
    }
  };

  const handleUpdateLink = async (platform: string, username: string, url?: string) => {
    try {
      const updatedLink = await socialLinksService.updateSocialLink(platform, {
        username,
        url
      });
      setSocialLinks(prev => 
        prev.map(link => link.platform === platform ? updatedLink : link)
      );
      setEditingLink(null);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to update social link');
    }
  };

  const handleDeleteLink = async (platform: string) => {
    if (!confirm('Are you sure you want to remove this social link?')) return;
    
    try {
      await socialLinksService.deleteSocialLink(platform);
      setSocialLinks(prev => prev.filter(link => link.platform !== platform));
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to delete social link');
    }
  };

  const getPlatformInfo = (platformValue: string) => {
    return platforms.find(p => p.value === platformValue) || {
      value: platformValue,
      label: platformValue,
      icon: 'link'
    };
  };

  const getAvailablePlatforms = () => {
    const usedPlatforms = socialLinks.map(link => link.platform);
    return platforms.filter(platform => !usedPlatforms.includes(platform.value));
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-32"></div>;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Social Media Links</h3>
          {!isReadOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="text-blue-400 hover:text-blue-300"
              disabled={getAvailablePlatforms().length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Social Links List */}
      <div className="space-y-3">
        {socialLinks.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            {isReadOnly ? 'No social links added' : 'No social links added yet'}
          </p>
        ) : (
          socialLinks.map((link) => {
            const platformInfo = getPlatformInfo(link.platform);
            return (
              <SocialLinkItem
                key={link.platform}
                link={link}
                platformInfo={platformInfo}
                isReadOnly={isReadOnly}
                onEdit={() => setEditingLink(link)}
                onDelete={() => handleDeleteLink(link.platform)}
              />
            );
          })
        )}
      </div>

      {/* Add Link Modal */}
      {showAddModal && (
        <SocialLinkModal
          title="Add Social Link"
          availablePlatforms={getAvailablePlatforms()}
          onSave={handleAddLink}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <SocialLinkModal
          title="Edit Social Link"
          availablePlatforms={[getPlatformInfo(editingLink.platform)]}
          initialData={editingLink}
          onSave={handleUpdateLink}
          onCancel={() => setEditingLink(null)}
        />
      )}
    </div>
  );
};

// Social Link Item Component
interface SocialLinkItemProps {
  link: SocialLink;
  platformInfo: SocialPlatform;
  isReadOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const SocialLinkItem: React.FC<SocialLinkItemProps> = ({
  link,
  platformInfo,
  isReadOnly,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-gray-300">
            {platformInfo.label.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{platformInfo.label}</p>
          <p className="text-xs text-gray-400">@{link.username}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
          title="Visit profile"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        
        {!isReadOnly && (
          <>
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Social Link Modal Component
interface SocialLinkModalProps {
  title: string;
  availablePlatforms: SocialPlatform[];
  initialData?: SocialLink;
  onSave: (platform: string, username: string, url?: string) => void;
  onCancel: () => void;
}

const SocialLinkModal: React.FC<SocialLinkModalProps> = ({
  title,
  availablePlatforms,
  initialData,
  onSave,
  onCancel
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState(
    initialData?.platform || availablePlatforms[0]?.value || ''
  );
  const [username, setUsername] = useState(initialData?.username || '');
  const [url, setUrl] = useState(initialData?.url || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !username) return;
    onSave(selectedPlatform, username, url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!initialData}
            >
              {availablePlatforms.map(platform => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username/Handle
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full URL (Optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              If not provided, will be generated automatically
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialLinksManager;