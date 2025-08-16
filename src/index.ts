/**
 * LockLearn Partner SDK
 * Entry point for the main SDK
 */

// Core exports
export { LockLearnClient } from './core/LockLearnClient';
export { Storage } from './core/Storage';
export { Queue } from './core/Queue';
export { Authentication } from './core/Authentication';

// Utilities
export { Logger, LogLevel } from './utils/logger';
export { generateUUID } from './utils/uuid';
export { fetchWithTimeout, isOnline } from './utils/net';
export { toSearchParams, parseSearchParams } from './utils/params';
export { getAdjustedTime, getServerTimeOffset } from './utils/net';

// API classes
export { WrongAnswerAPI } from './api/WrongAnswerAPI';
export { StatsAPI } from './api/StatsAPI';

// Types
export type * from './types';

// Default export
const LockLearn = LockLearnClient.getInstance();
export default LockLearn;