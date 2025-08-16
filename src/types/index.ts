/**
 * LockLearn Partner SDK - Type Definitions
 */

export interface ConfigOptions {
  // Core Configuration
  partnerId: string;
  apiKey: string;
  baseURL?: string;
  
  // Debugging & Logging
  debug?: boolean;
  maskSensitiveAnswers?: boolean;
  
  // Sync Configuration
  autoSync?: boolean;
  immediateSync?: boolean;
  syncInterval?: number;
  batchSize?: number;
  
  // Retry & Error Handling
  maxRetries?: number;
  timeout?: number;
  tokenRefreshBufferMs?: number;
  respectRetryAfter?: boolean;
  
  // Queue Management
  maxQueueSize?: number;
  maxQueueBytes?: number;
  queueOverflowStrategy?: 'drop-oldest' | 'drop-newest' | 'reject';
  
  // Event Callbacks
  onSyncStart?: () => void;
  onSyncEnd?: (result: SyncResult) => void;
  onAuthStateChange?: (authenticated: boolean) => void;
  onQueueOverflow?: (droppedItems: number) => void;
  onSyncProgress?: (progress: SyncProgress) => void;
}

export interface WrongAnswer {
  userId?: string;
  questionId?: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  options?: string[];
  category?: string;
  subcategory?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  metadata?: Record<string, any>;
  timestamp?: string;
  partnerId?: string;
  attemptNumber?: number;
  timeSpent?: number;
}

export interface SyncResult {
  success: number;
  failed: number;
  skipped: number;
  movedToDeadLetter: number;
  duration?: number;
  timestamp?: string;
}

export interface SyncProgress {
  total: number;
  processed: number;
  percentage: number;
  currentBatch: number;
  totalBatches: number;
}

export interface UserProfile {
  id: string;
  partnerId: string;
  locklearnId: string;
  settings: UserSettings;
  stats: UserStats;
  subscription: SubscriptionInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  enabled: boolean;
  syncInterval: 'immediate' | 'hourly' | 'daily';
  reviewFrequency: 'light' | 'normal' | 'intensive';
  categories: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  notifications: boolean;
  soundEffects: boolean;
  language?: string;
  timezone?: string;
}

export interface UserStats {
  totalReviewed: number;
  accuracy: number;
  streak: number;
  lastReviewDate: string;
  weakCategories: string[];
  strongCategories: string[];
  pendingReviews?: number;
  todayReviewed?: number;
  weeklyProgress?: number[];
  monthlyGoal?: number;
}

export interface SubscriptionInfo {
  tier: 'free' | 'basic' | 'premium' | 'enterprise' | 'family';
  expiresAt: string;
  questionsRemaining: number;
  features: string[];
  autoRenew?: boolean;
  paymentMethod?: string;
}

// Additional exports...
export interface QueueItem extends WrongAnswer {
  id: string;
  retryCount: number;
  addedAt: string;
  lastRetryAt?: string;
  errorHistory?: Array<{
    timestamp: string;
    error: string;
    errorType?: string;
  }>;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: any;
  traceId?: string;
  timestamp?: string;
  path?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services?: Record<string, 'up' | 'down'>;
}