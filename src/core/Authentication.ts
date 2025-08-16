import type { UserProfile, UserStats, PartnerStats } from '../types';

export class Authentication {
  private current: UserProfile | null = null;
  async authenticate(userId: string, _token: string): Promise<UserProfile> {
    this.current = { 
      id: userId, 
      partnerId: 'mock', 
      locklearnId: 'mock', 
      settings: {
        enabled: true, 
        syncInterval: 'daily', 
        reviewFrequency: 'normal', 
        categories: [], 
        difficulty: 'adaptive', 
        notifications: true, 
        soundEffects: true
      }, 
      stats: { 
        totalReviewed: 0, 
        accuracy: 0, 
        streak: 0, 
        lastReviewDate: new Date().toISOString(), 
        weakCategories: [], 
        strongCategories: [] 
      }, 
      subscription: { 
        tier: 'free', 
        expiresAt: new Date().toISOString(), 
        questionsRemaining: 0, 
        features: [] 
      } 
    };
    return this.current;
  }
  async refreshToken(): Promise<string> { return 'mock-token'; }
  async logout(): Promise<void> { this.current = null; }
  isAuthenticated(): boolean { return !!this.current; }
  getCurrentUser(): UserProfile | null { return this.current; }
  
  async getUserStats(_userId?: string): Promise<UserStats> {
    return {
      totalReviewed: 100,
      accuracy: 85.5,
      streak: 7,
      lastReviewDate: new Date().toISOString(),
      weakCategories: ['math'],
      strongCategories: ['science']
    };
  }
  
  async getPartnerStats(): Promise<PartnerStats> {
    return {
      totalUsers: 1000,
      totalWrongAnswers: 15000,
      dailyActiveUsers: 50,
      weeklyActiveUsers: 200,
      topCategories: [
        { name: 'math', count: 3000 },
        { name: 'science', count: 2500 }
      ],
      updatedAt: new Date().toISOString()
    };
  }
}