import type { CareType, TaskStatus, PlantCategory } from './constants';

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Pagination metadata */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** User (populated reference) */
export interface UserRef {
  _id: string;
  name: string;
  email: string;
}

/** Full user */
export interface User extends UserRef {
  phone?: string;
  role: 'admin' | 'employee';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Plant batch */
export interface PlantBatch {
  _id: string;
  name: string;
  plantType: string;
  scientificName?: string;
  category: PlantCategory;
  quantity: number;
  zone: string;
  location: string;
  imageUrl?: string;
  notes?: string;
  status: 'active' | 'archived';
  createdBy: UserRef;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Plant batch create/update payload */
export interface PlantBatchPayload {
  name: string;
  plantType: string;
  scientificName?: string;
  category: PlantCategory;
  quantity: number;
  zone: string;
  location: string;
  imageUrl?: string;
  notes?: string;
}

/** Care schedule create/update payload */
export interface CareSchedulePayload {
  batchId: string;
  careType: CareType;
  frequencyDays: number;
  scheduledTime: string;
  assignedTo: string[];
  instructions?: string;
  startDate: string;
  isActive: boolean;
}

/** Care schedule */
export interface CareSchedule {
  _id: string;
  batchId: { _id: string; name: string; plantType: string; zone: string; location: string };
  careType: CareType;
  frequencyDays: number;
  scheduledTime: string;
  assignedTo: UserRef[];
  instructions?: string;
  startDate: string;
  isActive: boolean;
  createdBy: UserRef;
  createdAt: string;
  updatedAt: string;
}

/** Care task */
export interface CareTask {
  _id: string;
  scheduleId: {
    _id: string;
    careType: CareType;
    scheduledTime: string;
    instructions?: string;
  };
  batchId: {
    _id: string;
    name: string;
    plantType: string;
    zone: string;
    location: string;
    imageUrl?: string;
  };
  careType: CareType;
  scheduledAt: string;
  status: TaskStatus;
  assignedTo: UserRef[];
  completedBy?: UserRef;
  completedAt?: string;
  skippedBy?: UserRef;
  skipReason?: string;
  notes?: string;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Task stats response */
export interface TaskStats {
  pending: number;
  completed: number;
  missed: number;
  skipped: number;
  total: number;
  completionRate: number;
  overdue: number;
  byEmployee: Array<{
    userId: string;
    name: string;
    email: string;
    completedCount: number;
  }>;
  byCareType: Record<
    CareType,
    { total: number; completed: number; pending: number; missed: number; skipped: number }
  >;
}
