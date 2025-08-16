import type { UserStats, PartnerStats } from '../types';

export class StatsAPI {
  async getUserStats(_userId: string): Promise<UserStats> {
    return {
      totalReviewed: 0,
      accuracy: 0,
      streak: 0,
      lastReviewDate: new Date().toISOString(),
      weakCategories: [],
      strongCategories: []
    };
  }
  async getPartnerStats(): Promise<PartnerStats> {
    return {
      totalUsers: 0,
      totalWrongAnswers: 0
    };
  }
}