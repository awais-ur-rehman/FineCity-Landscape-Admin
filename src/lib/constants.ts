export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
} as const;

export const CARE_TYPES = [
  'watering',
  'fertilizing',
  'pruning',
  'pest_control',
  'repotting',
] as const;

export type CareType = (typeof CARE_TYPES)[number];

export const TASK_STATUSES = [
  'pending',
  'completed',
  'missed',
  'skipped',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PLANT_CATEGORIES = [
  'indoor',
  'outdoor',
  'cactus',
  'succulent',
  'palm',
  'herb',
] as const;

export type PlantCategory = (typeof PLANT_CATEGORIES)[number];

export const ZONES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export type Zone = (typeof ZONES)[number];

export const TOKEN_KEYS = {
  ACCESS: 'fc_access_token',
  REFRESH: 'fc_refresh_token',
  USER: 'fc_user',
} as const;
