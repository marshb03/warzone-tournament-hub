// src/services/socialLinks.ts
import api from './api';

export interface SocialPlatform {
  value: string;
  label: string;
  icon: string;
}

export interface SocialLink {
  id: number;
  user_id: number;
  platform: string;
  username: string;
  url: string;
}

export interface SocialLinkCreate {
  platform: string;
  username: string;
  url?: string;
}

export interface SocialLinkUpdate {
  username?: string;
  url?: string;
}

export const socialLinksService = {
  // Get current user's social links
  async getMySocialLinks(): Promise<SocialLink[]> {
    const response = await api.get('/api/v1/social-links/');
    return response.data;
  },

  // Get any user's social links (public)
  async getUserSocialLinks(userId: number): Promise<SocialLink[]> {
    const response = await api.get(`/api/v1/social-links/${userId}`);
    return response.data;
  },

  // Create or update a social link
  async createSocialLink(socialLink: SocialLinkCreate): Promise<SocialLink> {
    const response = await api.post('/api/v1/social-links/', socialLink);
    return response.data;
  },

  // Update a specific social link
  async updateSocialLink(platform: string, update: SocialLinkUpdate): Promise<SocialLink> {
    const response = await api.put(`/api/v1/social-links/${platform}`, update);
    return response.data;
  },

  // Delete a social link
  async deleteSocialLink(platform: string): Promise<SocialLink> {
    const response = await api.delete(`/api/v1/social-links/${platform}`);
    return response.data;
  },

  // Get available platforms
  async getAvailablePlatforms(): Promise<{ platforms: SocialPlatform[] }> {
    const response = await api.get('/api/v1/social-links/platforms/available');
    return response.data;
  }
};