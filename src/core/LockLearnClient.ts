import type { ConfigOptions, WrongAnswer, QueueStatus, SyncResult, UserProfile, UserStats, PartnerStats } from '../types';
import { Storage } from './Storage';
import { Queue } from './Queue';
import { Authentication } from './Authentication';

export class LockLearnClient {
  private static instance: LockLearnClient;
  private config!: ConfigOptions;
  private storage = new Storage(); // 향후 플랫폼별 저장소 구현 예정
  private queue = new Queue();
  private auth = new Authentication();

  private constructor() {}
  public static getInstance() {
    if (!this.instance) this.instance = new LockLearnClient();
    return this.instance;
  }

  public async initialize(config: ConfigOptions) { 
    this.config = config;
    if (config.debug) {
      console.log('[LL] SDK initialized with config:', config.partnerId);
    }
  }
  
  public async authenticateUser(userId: string, token: string): Promise<UserProfile> {
    const profile = await this.auth.authenticate(userId, token);
    await this.storage.set('current_user', profile);
    return profile;
  }
  
  public async addWrongAnswer(w: WrongAnswer) { 
    await this.queue.enqueue(w);
    if (this.config?.autoSync) {
      await this.syncNow();
    }
  }
  
  public async syncNow(): Promise<SyncResult> { return this.queue.processBatch(); }
  public async getQueueStatus(): Promise<QueueStatus> { return this.queue.getStatus(); }
  public async getStats(userId?: string): Promise<UserStats> {
    return this.auth.getUserStats(userId);
  }

  public async getPartnerStats(): Promise<PartnerStats> {
    return this.auth.getPartnerStats();
  }
}