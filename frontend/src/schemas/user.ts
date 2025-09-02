// src/schemas/user.ts (Updated interface)
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  // Logo fields from host profile (if exists)
  logo_url?: string;
  logo_public_id?: string;
  organization_name?: string;
  // Social links will be loaded separately via socialLinksService
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  password?: string;
  current_password?: string;
  role?: string;
  is_active?: boolean;
}