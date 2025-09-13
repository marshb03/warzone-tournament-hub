// src/services/tkr.ts - Updated with full template support and Submit Scores functionality
import api from './api';
import {
  TKRTournamentConfig,
  TKRTournamentConfigCreate,
  TKRTournamentConfigUpdate,
  TKRTeamRegistration,
  TKRTeamRegistrationCreate,
  TKRTeamRegistrationUpdate,
  TKRGameSubmission,
  TKRGameSubmissionCreate,
  TKRGameSubmissionUpdate,
  TKRBulkGameSubmission,
  TKRLeaderboardEntry,
  TKRTemplate,
  TKRTemplateCreate,
  TKRTemplateUpdate,
  TKRPrizePool,
  TKRTournamentDetails
} from '../types/tkr';

export const tkrService = {
  // TKR Tournament Configuration
  async createTournamentConfig(
    tournamentId: number,
    config: Omit<TKRTournamentConfigCreate, 'tournament_id'>
  ): Promise<TKRTournamentConfig> {
    const response = await api.post(`/api/v1/tkr/tournaments/${tournamentId}/config`, {
      ...config,
      tournament_id: tournamentId
    });
    return response.data;
  },

  async getTournamentConfig(tournamentId: number): Promise<TKRTournamentConfig> {
    const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/config`);
    return response.data;
  },

  async updateTournamentConfig(
    tournamentId: number,
    config: TKRTournamentConfigUpdate
  ): Promise<TKRTournamentConfig> {
    const response = await api.put(`/api/v1/tkr/tournaments/${tournamentId}/config`, config);
    return response.data;
  },

  // TKR Team Registration
  async registerTeam(
    tournamentId: number,
    registration: Omit<TKRTeamRegistrationCreate, 'tournament_id'>
  ): Promise<TKRTeamRegistration> {
    const response = await api.post(`/api/v1/tkr/tournaments/${tournamentId}/register`, {
      ...registration,
      tournament_id: tournamentId
    });
    return response.data;
  },

  async getTournamentRegistrations(tournamentId: number): Promise<TKRTeamRegistration[]> {
    const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/registrations`);
    return response.data;
  },

  async updateTeamRegistration(
    registrationId: number,
    update: TKRTeamRegistrationUpdate
  ): Promise<TKRTeamRegistration> {
    const response = await api.put(`/api/v1/tkr/registrations/${registrationId}`, update);
    return response.data;
  },

  // NEW: User-specific registration methods for Submit Scores
  async getMyRegistration(tournamentId: number): Promise<TKRTeamRegistration | null> {
    try {
      const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/my-registration`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No registration found
      }
      console.error('Failed to get user registration:', error);
      throw error;
    }
  },

  // ADD: Method to get ALL user registrations
  async getMyRegistrations(tournamentId: number): Promise<TKRTeamRegistration[]> {
    try {
      const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/my-registrations`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return []; // No registrations found
      }
      console.error('Failed to get user registrations:', error);
      throw error;
    }
  },

  async canSubmitScores(tournamentId: number): Promise<{
    can_submit: boolean;
    registration?: TKRTeamRegistration;
    message: string;
  }> {
    try {
      const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/can-submit-scores`);
      return response.data;
    } catch (error) {
      console.error('Failed to check submission eligibility:', error);
      throw error;
    }
  },

  // ADD: Method to check submission eligibility for specific team
  async canSubmitScoresForTeam(tournamentId: number, teamRegistrationId: number): Promise<{
    can_submit: boolean;
    registration: TKRTeamRegistration;
    message: string;
    submission_deadline?: string;
  }> {
    try {
      const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/can-submit-scores/${teamRegistrationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to check submission eligibility:', error);
      throw error;
    }
  },

  // TKR Game Submissions
  async submitGame(
    tournamentId: number,
    submission: Omit<TKRGameSubmissionCreate, 'tournament_id'>
  ): Promise<TKRGameSubmission> {
    const response = await api.post(`/api/v1/tkr/tournaments/${tournamentId}/submissions`, {
      ...submission,
      tournament_id: tournamentId
    });
    return response.data;
  },

  async submitGames(
    tournamentId: number,
    bulkSubmission: Omit<TKRBulkGameSubmission, 'tournament_id'>
  ): Promise<TKRGameSubmission[]> {
    const response = await api.post(`/api/v1/tkr/tournaments/${tournamentId}/bulk-submissions`, {
      ...bulkSubmission,
      tournament_id: tournamentId
    });
    return response.data;
  },

  // MODIFY: Update existing bulk submission to be more explicit about team ID
  async submitGamesForTeam(
    tournamentId: number,
    teamRegistrationId: number,
    games: Omit<TKRGameSubmissionCreate, 'tournament_id' | 'team_registration_id'>[]
  ): Promise<TKRGameSubmission[]> {
    const response = await api.post(`/api/v1/tkr/tournaments/${tournamentId}/bulk-submissions`, {
      tournament_id: tournamentId,
      team_registration_id: teamRegistrationId,
      games: games
    });
    return response.data;
  },

  async getTournamentSubmissions(
    tournamentId: number,
    teamRegistrationId?: number
  ): Promise<TKRGameSubmission[]> {
    const params = teamRegistrationId ? { team_registration_id: teamRegistrationId } : {};
    const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/submissions`, { params });
    return response.data;
  },

  // NEW: Get current user's game submissions for Submit Scores functionality
  async getMyGameSubmissions(tournamentId: number, teamRegistrationId: number): Promise<TKRGameSubmission[]> {
    try {
      const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/submissions`, {
        params: { team_registration_id: teamRegistrationId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get game submissions:', error);
      throw error;
    }
  },

  // ADD: Method to get submissions for specific team
  async getSubmissionsForTeam(tournamentId: number, teamRegistrationId: number): Promise<TKRGameSubmission[]> {
    try {
      const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/submissions?team_registration_id=${teamRegistrationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get team submissions:', error);
      throw error;
    }
  },

  async updateGameSubmission(
    submissionId: number,
    update: TKRGameSubmissionUpdate
  ): Promise<TKRGameSubmission> {
    const response = await api.put(`/api/v1/tkr/submissions/${submissionId}`, update);
    return response.data;
  },

  async deleteGameSubmission(submissionId: number): Promise<void> {
    await api.delete(`/api/v1/tkr/submissions/${submissionId}`);
  },

  // TKR Leaderboard
  async getLeaderboard(tournamentId: number): Promise<TKRLeaderboardEntry[]> {
    const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/leaderboard`);
    return response.data;
  },

  async refreshLeaderboard(tournamentId: number): Promise<void> {
    await api.post(`/api/v1/tkr/tournaments/${tournamentId}/leaderboard/refresh`);
  },

  // TKR Prize Pool
  async getPrizePool(tournamentId: number): Promise<TKRPrizePool> {
    const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/prize-pool`);
    return response.data;
  },

  // TKR Templates - Full CRUD operations
  async createTemplate(template: TKRTemplateCreate): Promise<TKRTemplate> {
    const response = await api.post('/api/v1/tkr/templates', template);
    return response.data;
  },

  async getMyTemplates(): Promise<TKRTemplate[]> {
    const response = await api.get('/api/v1/tkr/templates');
    return response.data;
  },

  async getTemplate(templateId: number): Promise<TKRTemplate> {
    const response = await api.get(`/api/v1/tkr/templates/${templateId}`);
    return response.data;
  },

  async updateTemplate(templateId: number, update: TKRTemplateUpdate): Promise<TKRTemplate> {
    const response = await api.put(`/api/v1/tkr/templates/${templateId}`, update);
    return response.data;
  },

  async deleteTemplate(templateId: number): Promise<void> {
    await api.delete(`/api/v1/tkr/templates/${templateId}`);
  },

  // TKR Tournament Details (combined endpoint)
  async getTournamentDetails(tournamentId: number): Promise<TKRTournamentDetails> {
    const response = await api.get(`/api/v1/tkr/tournaments/${tournamentId}/details`);
    return response.data;
  },

  // Utility functions
  async checkTournamentIsTKR(tournamentId: number): Promise<boolean> {
    try {
      await this.getTournamentConfig(tournamentId);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Template management utilities
  async saveConfigAsTemplate(
    tournamentId: number,
    templateName: string,
    description?: string
  ): Promise<TKRTemplate> {
    try {
      const config = await this.getTournamentConfig(tournamentId);
      
      const templateData: TKRTemplateCreate = {
        template_name: templateName,
        description: description || '',
        map_name: config.map_name,
        team_size: config.team_size,
        consecutive_hours: config.consecutive_hours,
        tournament_days: config.tournament_days || 7, // Use existing or default
        best_games_count: config.best_games_count,
        placement_multipliers: config.placement_multipliers,
        bonus_point_thresholds: config.bonus_point_thresholds,
        max_points_per_map: config.max_points_per_map,
        host_percentage: config.host_percentage,
        show_prize_pool: config.show_prize_pool
      };

      return await this.createTemplate(templateData);
    } catch (error) {
      console.error('Failed to save config as template:', error);
      throw error;
    }
  },

  async applyTemplateToTournament(
    tournamentId: number,
    templateId: number
  ): Promise<TKRTournamentConfig> {
    try {
      const template = await this.getTemplate(templateId);
      
      const configData: TKRTournamentConfigUpdate = {
        map_name: template.map_name,
        team_size: template.team_size,
        consecutive_hours: template.consecutive_hours,
        tournament_days: template.tournament_days || 7, // Use template value or default
        best_games_count: template.best_games_count,
        placement_multipliers: template.placement_multipliers,
        bonus_point_thresholds: template.bonus_point_thresholds,
        max_points_per_map: template.max_points_per_map,
        host_percentage: template.host_percentage,
        show_prize_pool: template.show_prize_pool
      };

      // Check if config exists
      try {
        await this.getTournamentConfig(tournamentId);
        // Config exists, update it
        return await this.updateTournamentConfig(tournamentId, configData);
      } catch (error) {
        // Config doesn't exist, create it
        return await this.createTournamentConfig(tournamentId, {
          ...configData,
          tournament_id: tournamentId
        } as TKRTournamentConfigCreate);
      }
    } catch (error) {
      console.error('Failed to apply template to tournament:', error);
      throw error;
    }
  },

  // Validation utilities
  validateTournamentConfig(config: Partial<TKRTournamentConfigCreate>): string[] {
    const errors: string[] = [];

    if (!config.map_name?.trim()) {
      errors.push('Map name is required');
    }

    if (!config.consecutive_hours || config.consecutive_hours < 1 || config.consecutive_hours > 24) {
      errors.push('Consecutive hours must be between 1 and 24');
    }

    if (!config.tournament_days || config.tournament_days < 1 || config.tournament_days > 30) {
      errors.push('Tournament days must be between 1 and 30');
    }

    if (!config.best_games_count || config.best_games_count < 1 || config.best_games_count > 20) {
      errors.push('Best games count must be between 1 and 20');
    }

    if (config.host_percentage !== undefined && (config.host_percentage < 0 || config.host_percentage > 1)) {
      errors.push('Host percentage must be between 0 and 100%');
    }

    if (!config.placement_multipliers || Object.keys(config.placement_multipliers).length === 0) {
      errors.push('At least one placement multiplier is required');
    }

    if (config.placement_multipliers) {
      const placements = Object.keys(config.placement_multipliers);
      const duplicates = placements.filter((placement, index) => placements.indexOf(placement) !== index);
      if (duplicates.length > 0) {
        errors.push('Duplicate placement values found');
      }

      for (const [placement, multiplier] of Object.entries(config.placement_multipliers)) {
        const placementNum = parseInt(placement);
        if (isNaN(placementNum) || placementNum < 1) {
          errors.push(`Invalid placement: ${placement}`);
        }
        if (typeof multiplier !== 'number' || multiplier < 0) {
          errors.push(`Invalid multiplier for placement ${placement}`);
        }
      }
    }

    if (config.bonus_point_thresholds) {
      for (const [kills, bonus] of Object.entries(config.bonus_point_thresholds)) {
        const killsNum = parseInt(kills);
        if (isNaN(killsNum) || killsNum < 1) {
          errors.push(`Invalid kills threshold: ${kills}`);
        }
        if (typeof bonus !== 'number' || bonus < 0) {
          errors.push(`Invalid bonus points for ${kills} kills`);
        }
      }
    }

    if (config.max_points_per_map !== undefined && config.max_points_per_map < 1) {
      errors.push('Max points per map must be greater than 0');
    }

    return errors;
  },

  // Score calculation preview (client-side)
  calculateScorePreview(
    kills: number,
    placement: number,
    teamRank: number,
    placementMultipliers: { [key: string]: number },
    bonusThresholds?: { [key: string]: number },
    maxPoints?: number
  ): { baseScore: number; bonusPoints: number; finalScore: number } {
    // Get placement multiplier (default to 0.5 for unspecified placements)
    const multiplier = placementMultipliers[placement.toString()] || 0.5;
    
    // Calculate base score: ((kills × placement_multiplier) / (10% of team_rank))
    const tenPercentRank = Math.max(teamRank * 0.1, 1); // Prevent division by zero
    const baseScore = (kills * multiplier) / tenPercentRank;
    
    // Calculate bonus points
    let bonusPoints = 0;
    if (bonusThresholds) {
      for (const [killThreshold, bonus] of Object.entries(bonusThresholds)) {
        if (kills >= parseInt(killThreshold)) {
          bonusPoints = Math.max(bonusPoints, bonus); // Take highest applicable bonus
        }
      }
    }
    
    // Calculate total before cap
    let finalScore = baseScore + bonusPoints;
    
    // Apply point cap if specified
    if (maxPoints && finalScore > maxPoints) {
      finalScore = maxPoints;
    }
    
    return {
      baseScore: Math.round(baseScore * 100) / 100, // Round to 2 decimals
      bonusPoints,
      finalScore: Math.round(finalScore * 100) / 100
    };
  }
};