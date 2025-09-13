// src/types/tkr.ts
export enum TKRTeamSize {
  SOLO = 'SOLO',
  DUOS = 'DUOS',
  TRIOS = 'TRIOS',
  QUADS = 'QUADS'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID_FULL = 'PAID_FULL',
  FREE_ENTRY = 'FREE_ENTRY'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

// Player information for team registration
export interface TKRPlayer {
  name: string;
  rank: number;
  stream: string;
}

// TKR Tournament Configuration
export interface TKRTournamentConfig {
  id: number;
  tournament_id: number;
  map_name: string;
  team_size: TKRTeamSize;
  consecutive_hours: number;
  tournament_days: number;
  best_games_count: number;
  placement_multipliers: { [key: string]: number }; // placement -> multiplier
  bonus_point_thresholds?: { [key: string]: number }; // kills -> bonus points
  max_points_per_map?: number;
  host_percentage: number; // 0.0 to 1.0
  show_prize_pool: boolean;
}

export interface TKRTournamentConfigCreate {
  tournament_id: number;
  map_name: string;
  team_size: TKRTeamSize;
  consecutive_hours: number;
  tournament_days: number;
  best_games_count: number;
  placement_multipliers: { [key: string]: number };
  bonus_point_thresholds?: { [key: string]: number };
  max_points_per_map?: number;
  host_percentage: number;
  show_prize_pool: boolean;
}

export interface TKRTournamentConfigUpdate {
  map_name?: string;
  team_size?: TKRTeamSize;
  consecutive_hours?: number;
  tournament_days?: number;
  best_games_count?: number;
  placement_multipliers?: { [key: string]: number };
  bonus_point_thresholds?: { [key: string]: number };
  max_points_per_map?: number;
  host_percentage?: number;
  show_prize_pool?: boolean;
}

// TKR Team Registration
export interface TKRTeamRegistration {
  id: number;
  tournament_id: number;
  config_id: number;
  team_id: number;
  team_name: string;
  team_rank: number;
  players: TKRPlayer[];
  start_time: string; // ISO datetime string
  end_time?: string; // ISO datetime string
  is_rerunning: boolean;
  using_free_entry: boolean;
  free_entry_players?: string[];
  payment_status: PaymentStatus;
  payment_amount: number;
  paid_to?: string;
  payment_notes?: string;
  registered_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface TKRTeamRegistrationCreate {
  tournament_id: number;
  team_name: string;
  team_rank: number;
  players: TKRPlayer[];
  start_time: string; // ISO datetime string
  is_rerunning: boolean;
  using_free_entry: boolean;
  free_entry_players?: string[];
}

export interface TKRTeamRegistrationUpdate {
  team_name?: string;
  players?: TKRPlayer[];
  start_time?: string;
  payment_status?: PaymentStatus;
  payment_amount?: number;
  paid_to?: string;
  payment_notes?: string;
}

// TKR Game Submission
export interface TKRGameSubmission {
  id: number;
  tournament_id: number;
  team_registration_id: number;
  game_number: number;
  kills: number;
  placement: number;
  vod_url: string;
  timestamp: string; // VOD timestamp
  base_score?: number;
  bonus_points: number;
  final_score?: number;
  status: SubmissionStatus;
  verified_by?: number;
  verification_notes?: string;
  submitted_at: string; // ISO datetime string
  verified_at?: string; // ISO datetime string
}

export interface TKRGameSubmissionCreate {
  tournament_id: number;
  team_registration_id: number;
  game_number: number;
  kills: number;
  placement: number;
  vod_url: string;
  timestamp: string;
}

export interface TKRGameSubmissionUpdate {
  kills?: number;
  placement?: number;
  vod_url?: string;
  timestamp?: string;
  status?: SubmissionStatus;
  verification_notes?: string;
}

export interface TKRBulkGameSubmission {
  tournament_id: number;
  team_registration_id: number;
  games: Omit<TKRGameSubmissionCreate, 'tournament_id' | 'team_registration_id'>[];
}

// TKR Leaderboard
export interface TKRLeaderboardEntry {
  id: number;
  tournament_id: number;
  team_registration_id: number;
  team_name: string;
  total_kills: number;
  total_score: number;
  games_submitted: number;
  current_rank?: number;
  average_kills?: number;
  average_placement?: number;
  last_updated: string; // ISO datetime string
  team_registration?: TKRTeamRegistration;
}

// TKR Prize Pool
export interface TKRPrizePool {
  tournament_id: number;
  total_entries: number;
  base_entry_fee: number;
  total_collected: number;
  host_cut: number;
  final_prize_pool: number;
  show_prize_pool: boolean;
}

// TKR Template
export interface TKRTemplate {
  id: number;
  host_id: number;
  template_name: string;
  description?: string;
  map_name: string;
  team_size: TKRTeamSize;
  consecutive_hours: number;
  tournament_days: number;
  best_games_count: number;
  placement_multipliers: { [key: string]: number };
  bonus_point_thresholds?: { [key: string]: number };
  max_points_per_map?: number;
  host_percentage: number;
  show_prize_pool: boolean;
  source_config_id?: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface TKRTemplateCreate {
  template_name: string;
  description?: string;
  map_name: string;
  team_size: TKRTeamSize;
  consecutive_hours: number;
  tournament_days: number;
  best_games_count: number;
  placement_multipliers: { [key: string]: number };
  bonus_point_thresholds?: { [key: string]: number };
  max_points_per_map?: number;
  host_percentage: number;
  show_prize_pool: boolean;
}

export interface TKRTemplateUpdate {
  template_name?: string;
  description?: string;
  map_name?: string;
  team_size?: TKRTeamSize;
  consecutive_hours?: number;
  tournament_days?: number;
  best_games_count?: number;
  placement_multipliers?: { [key: string]: number };
  bonus_point_thresholds?: { [key: string]: number };
  max_points_per_map?: number;
  host_percentage?: number;
  show_prize_pool?: boolean;
}

// Combined TKR Tournament Details
export interface TKRTournamentDetails {
  tournament_id: number;
  config: TKRTournamentConfig;
  total_registrations: number;
  active_teams: number; // Teams currently in their time window
  completed_teams: number; // Teams that have finished
  prize_pool?: TKRPrizePool;
  leaderboard: TKRLeaderboardEntry[];
}

// Form helpers and utilities
export interface PlacementMultiplier {
  placement: string;
  multiplier: number;
}

export interface BonusPointThreshold {
  kills: string;
  bonus: number;
}

// Default placement multipliers based on your specification
export const DEFAULT_PLACEMENT_MULTIPLIERS: { [key: string]: number } = {
  '1': 2.5,
  '2': 2.0,
  '3': 1.5,
  '4': 1.0,
  '5': 1.0,
  '6': 0.75,
  '7': 0.75,
  '8': 0.75,
  '9': 0.75,
  '10': 0.75,
  '11': 0.5 // 11th+ default
};

// Team size configuration
export const TEAM_SIZE_CONFIG = {
  [TKRTeamSize.SOLO]: { value: 1, label: 'Solo' },
  [TKRTeamSize.DUOS]: { value: 2, label: 'Duos' },
  [TKRTeamSize.TRIOS]: { value: 3, label: 'Trios' },
  [TKRTeamSize.QUADS]: { value: 4, label: 'Quads' }
};

// Validation helpers
export const validateTKRPlayer = (player: TKRPlayer): string[] => {
  const errors: string[] = [];
  
  if (!player.name?.trim()) {
    errors.push('Player name is required');
  }
  
  if (!player.rank || player.rank < 1 || player.rank > 9999) {
    errors.push('Player rank must be between 1 and 9999');
  }
  
  if (!player.stream?.trim()) {
    errors.push('Stream URL is required');
  } else if (!player.stream.match(/^https?:\/\/.+/)) {
    errors.push('Stream must be a valid URL');
  }
  
  return errors;
};

export const validateTeamRank = (players: TKRPlayer[], teamRank: number): boolean => {
  const calculatedRank = players.reduce((sum, player) => sum + (player.rank || 0), 0);
  return calculatedRank === teamRank;
};

// Scoring calculation helpers
export const calculateGameScore = (
  kills: number,
  placement: number,
  teamRank: number,
  placementMultipliers: { [key: string]: number },
  bonusThresholds?: { [key: string]: number },
  maxPoints?: number
): { baseScore: number; bonusPoints: number; finalScore: number } => {
  // Get placement multiplier (default to 0.5 for 11th+)
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
};