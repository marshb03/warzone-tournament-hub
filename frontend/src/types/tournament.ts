// src/types/tournament.ts - Updated with TKR support
export enum TournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  TKR = 'TKR'  // Add TKR format
}

export enum TournamentStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING', 
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Tournament {
  id: number;
  name: string;
  format: TournamentFormat;
  start_date: string; // ISO date string
  start_time?: string;
  end_date?: string; // For TKR tournaments
  end_time?: string; // For TKR tournaments  
  team_size?: number;
  max_teams?: number; // null for TKR tournaments
  current_teams: number;
  creator_id: number;
  creator?: {
    id: number;
    username: string;
  };
  creator_username?: string;
  status: TournamentStatus;
  description?: string;
  rules?: string;
  entry_fee?: string;
  game?: string;
  game_mode?: string;
  bracket_config?: any;
}

export interface TournamentCreate {
  name: string;
  format: TournamentFormat;
  start_date: string;
  start_time: string;
  end_date?: string; // Required for TKR
  end_time?: string; // Optional for TKR
  team_size: number;
  max_teams?: number; // Optional, null for TKR
  description?: string;
  rules?: string;
  entry_fee: string;
  game: string;
  game_mode: string;
}

export interface TournamentUpdate {
  name?: string;
  format?: TournamentFormat;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  team_size?: number;
  max_teams?: number;
  description?: string;
  rules?: string;
  entry_fee?: string;
  game?: string;
  game_mode?: string;
}