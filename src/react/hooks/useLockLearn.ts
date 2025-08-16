import { useState, useEffect, useCallback } from 'react';
import type { ConfigOptions, UserProfile, QueueStatus, UserStats, WrongAnswer, SyncResult } from '../../types';
import { LockLearnClient } from '../../core/LockLearnClient';

export interface UseLockLearnOptions {
  config: ConfigOptions;
  autoInit?: boolean;
  autoSync?: boolean;
}

export interface UseLockLearnReturn {
  isInitialized: boolean;
  isConnected: boolean;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  queueStatus: QueueStatus | null;
  stats: UserStats | null;
  
  // 액션 함수들
  initialize: (config: ConfigOptions) => Promise<void>;
  authenticateUser: (userId: string, token: string) => Promise<UserProfile>;
  addWrongAnswer: (wrongAnswer: WrongAnswer) => Promise<void>;
  syncNow: () => Promise<SyncResult>;
  logout: () => Promise<void>;
}

export function useLockLearn(options: UseLockLearnOptions): UseLockLearnReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [queueStatus] = useState<QueueStatus | null>(null);
  const [stats] = useState<UserStats | null>(null);

  const client = LockLearnClient.getInstance();

  const initialize = useCallback(async (config: ConfigOptions) => {
    await client.initialize(config);
    setIsInitialized(true);
    setIsConnected(true);
  }, [client]);

  const authenticateUser = useCallback(async (userId: string, token: string): Promise<UserProfile> => {
    const profile = await client.authenticateUser(userId, token);
    setCurrentUser(profile);
    setIsAuthenticated(true);
    return profile;
  }, [client]);

  const addWrongAnswer = useCallback(async (wrongAnswer: WrongAnswer): Promise<void> => {
    await client.addWrongAnswer(wrongAnswer);
  }, [client]);

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    return await client.syncNow();
  }, [client]);

  const logout = useCallback(async (): Promise<void> => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (options.autoInit) {
      initialize(options.config);
    }
  }, [options.autoInit, options.config, initialize]);

  return {
    isInitialized,
    isConnected,
    isAuthenticated,
    currentUser,
    queueStatus,
    stats,
    initialize,
    authenticateUser,
    addWrongAnswer,
    syncNow,
    logout
  };
}