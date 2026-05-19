import type { CareType, TaskStatus } from './constants';

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
  role: 'super_admin' | 'admin' | 'employee';
  isActive: boolean;
  branches: Array<{ _id: string; name: string; code: string }>;
  currentBranch?: { _id: string; name: string; code: string };
  createdAt: string;
  updatedAt: string;
}

/** Plant batch */
export interface PlantBatch {
  _id: string;
  name: string;
  plantType: string | { _id: string; name: string; scientificName?: string };
  scientificName?: string;
  category: string | { _id: string; name: string; slug: string };
  quantity: number;
  zone: string | { _id: string; name: string; code: string };
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
  category: string;
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
  recommendedFertilizers?: string[];
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
  recommendedFertilizers?: Array<{ _id: string; name: string; type: string }>;
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
    recommendedFertilizers?: Array<{ _id: string; name: string; type: string }>;
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
  photoUrls?: string[];
  selectedFertilizers?: Array<{ _id: string; name: string; type: string }>;
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

/** Fertilizer */
export interface Fertilizer {
  _id: string;
  name: string;
  brand?: string;
  type: 'organic' | 'chemical' | 'bio';
  npkRatio?: string;
  description?: string;
  defaultDosage?: number;
  defaultUnit?: 'ml' | 'g' | 'kg' | 'L';
  isActive: boolean;
  branchId: string;
}

/** Fertilizer usage item (per task completion) */
export interface FertilizerUsageItem {
  fertilizerId: { _id: string; name: string; type: string };
  quantity: number;
  unit: 'ml' | 'g' | 'kg' | 'L';
}

/** Fertilizer usage record (from FertilizerUsage collection) */
export interface FertilizerUsageRecord {
  _id: string;
  taskId: { _id: string; scheduledAt: string; careType: string; status: string };
  batchId: { _id: string; name: string; zone: string };
  completedBy: UserRef;
  usages: FertilizerUsageItem[];
  notes?: string;
  recordedAt: string;
}

/** Fertilizer usage history response */
export interface FertilizerUsageHistoryResponse {
  records: FertilizerUsageRecord[];
  pagination: Pagination;
}
