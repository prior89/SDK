/**
 * LockLearn Realistic Analytics Extension
 * 즉시 구현 가능한 현실적 기업용 학습 분석 모듈
 */

import type { LockLearnClient, WrongAnswer, UserProfile } from '@locklearn/partner-sdk';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { groupBy, orderBy } from 'lodash';

// 현실적 타입 정의
export interface SimpleAnalyticsConfig {
  enabled: boolean;
  trackingInterval: number; // minutes
  retentionDays: number;
  enableExport: boolean;
  debugMode: boolean;
}

export interface LearningSession {
  userId: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  questionsAnswered: number;
  correctAnswers: number;
  categories: string[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  duration: number; // seconds
}

export interface UserProgress {
  userId: string;
  totalSessions: number;
  totalQuestions: number;
  accuracy: number;
  streak: number;
  lastActiveDate: string;
  strongCategories: string[];
  weakCategories: string[];
  progressTrend: 'improving' | 'declining' | 'stable';
}

export interface DepartmentSummary {
  departmentId: string;
  departmentName: string;
  totalUsers: number;
  activeUsers: number;
  averageAccuracy: number;
  totalSessions: number;
  engagementScore: number; // 0-100
  topPerformers: Array<{ userId: string; accuracy: number }>;
  improvementAreas: string[];
}

export interface AnalyticsReport {
  reportId: string;
  generatedAt: string;
  dateRange: { from: string; to: string };
  summary: {
    totalUsers: number;
    totalSessions: number;
    averageAccuracy: number;
    mostPopularCategory: string;
  };
  userProgress: UserProgress[];
  departmentSummaries: DepartmentSummary[];
  trends: Array<{ date: string; sessions: number; accuracy: number }>;
}

// 현실적 분석 플러그인
export class RealisticAnalyticsPlugin {
  public readonly name = 'realistic-analytics';
  public readonly version = '0.1.0';
  
  private client!: LockLearnClient;
  private config: SimpleAnalyticsConfig;
  private sessionTracker: SessionTracker;
  private progressCalculator: ProgressCalculator;
  private reportGenerator: ReportGenerator;

  constructor(config: Partial<SimpleAnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      trackingInterval: 5, // 5분마다
      retentionDays: 90,
      enableExport: true,
      debugMode: false,
      ...config
    };
    
    this.sessionTracker = new SessionTracker(this.config);
    this.progressCalculator = new ProgressCalculator();
    this.reportGenerator = new ReportGenerator();
  }

  public install(client: LockLearnClient): void {
    this.client = client;
    
    // SDK에 현실적 분석 메서드 추가
    (client as any).trackLearningSession = this.trackLearningSession.bind(this);
    (client as any).getUserProgress = this.getUserProgress.bind(this);
    (client as any).getDepartmentSummary = this.getDepartmentSummary.bind(this);
    (client as any).generateAnalyticsReport = this.generateAnalyticsReport.bind(this);
    (client as any).getEngagementMetrics = this.getEngagementMetrics.bind(this);
    
    // 세션 추적 시작
    this.sessionTracker.startTracking();
    
    console.log('[LL Analytics] Realistic analytics plugin installed');
  }

  public uninstall?(client: LockLearnClient): void {
    this.sessionTracker.stopTracking();
    console.log('[LL Analytics] Analytics plugin uninstalled');
  }

  /**
   * 학습 세션 추적 (간단하고 신뢰성 있음)
   */
  public async trackLearningSession(session: Partial<LearningSession>): Promise<string> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullSession: LearningSession = {
      sessionId,
      userId: session.userId || 'anonymous',
      startTime: session.startTime || new Date().toISOString(),
      endTime: session.endTime || new Date().toISOString(),
      questionsAnswered: session.questionsAnswered || 0,
      correctAnswers: session.correctAnswers || 0,
      categories: session.categories || [],
      deviceType: session.deviceType || this.detectDeviceType(),
      duration: session.duration || 0
    };
    
    // 로컬 스토리지에 저장 (현실적 접근)
    await this.sessionTracker.saveSession(fullSession);
    
    if (this.config.debugMode) {
      console.log('[LL Analytics] Session tracked:', sessionId);
    }
    
    return sessionId;
  }

  /**
   * 사용자 진도 조회
   */
  public async getUserProgress(userId: string): Promise<UserProgress> {
    const sessions = await this.sessionTracker.getUserSessions(userId);
    return this.progressCalculator.calculateProgress(userId, sessions);
  }

  /**
   * 부서별 요약 정보
   */
  public async getDepartmentSummary(departmentId: string): Promise<DepartmentSummary> {
    const departmentUsers = await this.getDepartmentUsers(departmentId);
    const allSessions = await this.sessionTracker.getDepartmentSessions(departmentUsers);
    
    return this.progressCalculator.calculateDepartmentSummary(
      departmentId,
      departmentUsers,
      allSessions
    );
  }

  /**
   * 분석 리포트 생성 (즉시 사용 가능)
   */
  public async generateAnalyticsReport(
    options: {
      dateRange?: { from: string; to: string };
      departmentIds?: string[];
      includeUserDetails?: boolean;
    } = {}
  ): Promise<AnalyticsReport> {
    const dateRange = options.dateRange || {
      from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd')
    };
    
    const sessions = await this.sessionTracker.getSessionsInRange(dateRange);
    const userProgress = await this.getAllUserProgress(sessions);
    const departmentSummaries = await this.getAllDepartmentSummaries(options.departmentIds);
    
    return this.reportGenerator.generateReport({
      dateRange,
      sessions,
      userProgress,
      departmentSummaries
    });
  }

  /**
   * 참여도 메트릭스 (실시간)
   */
  public async getEngagementMetrics(): Promise<{
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    averageSessionLength: number;
    retentionRate: number;
    engagementTrend: 'up' | 'down' | 'stable';
  }> {
    const today = new Date();
    const weekAgo = subDays(today, 7);
    
    const recentSessions = await this.sessionTracker.getSessionsInRange({
      from: format(weekAgo, 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd')
    });
    
    const dailyUsers = new Set(
      recentSessions
        .filter(s => format(new Date(s.startTime), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
        .map(s => s.userId)
    ).size;
    
    const weeklyUsers = new Set(recentSessions.map(s => s.userId)).size;
    
    const avgDuration = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length
      : 0;
    
    return {
      dailyActiveUsers: dailyUsers,
      weeklyActiveUsers: weeklyUsers,
      averageSessionLength: avgDuration,
      retentionRate: this.calculateRetentionRate(recentSessions),
      engagementTrend: this.calculateEngagementTrend(recentSessions)
    };
  }

  // 헬퍼 메서드들
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      if (/Mobi|Android/i.test(userAgent)) return 'mobile';
      if (/Tablet|iPad/i.test(userAgent)) return 'tablet';
    }
    return 'desktop';
  }

  private async getDepartmentUsers(departmentId: string): Promise<string[]> {
    // 실제 구현에서는 HR 시스템과 연동
    return [`user-${departmentId}-1`, `user-${departmentId}-2`, `user-${departmentId}-3`];
  }

  private async getAllUserProgress(sessions: LearningSession[]): Promise<UserProgress[]> {
    const userIds = [...new Set(sessions.map(s => s.userId))];
    const progressPromises = userIds.map(id => this.getUserProgress(id));
    return Promise.all(progressPromises);
  }

  private async getAllDepartmentSummaries(departmentIds?: string[]): Promise<DepartmentSummary[]> {
    const deptIds = departmentIds || ['dev', 'sales', 'marketing'];
    const summaryPromises = deptIds.map(id => this.getDepartmentSummary(id));
    return Promise.all(summaryPromises);
  }

  private calculateRetentionRate(sessions: LearningSession[]): number {
    // 간단한 7일 리텐션 계산
    const usersByDay = groupBy(sessions, s => format(new Date(s.startTime), 'yyyy-MM-dd'));
    const days = Object.keys(usersByDay).length;
    return days > 0 ? (days / 7) * 100 : 0;
  }

  private calculateEngagementTrend(sessions: LearningSession[]): 'up' | 'down' | 'stable' {
    if (sessions.length < 2) return 'stable';
    
    const sorted = orderBy(sessions, 'startTime');
    const half = Math.floor(sessions.length / 2);
    const first = sorted.slice(0, half);
    const second = sorted.slice(half);
    
    const firstAvg = first.reduce((sum, s) => sum + s.duration, 0) / first.length;
    const secondAvg = second.reduce((sum, s) => sum + s.duration, 0) / second.length;
    
    const diff = (secondAvg - firstAvg) / firstAvg;
    if (diff > 0.1) return 'up';
    if (diff < -0.1) return 'down';
    return 'stable';
  }
}

// 세션 추적기 (localStorage 기반)
class SessionTracker {
  private config: SimpleAnalyticsConfig;
  private storageKey = 'locklearn-sessions';

  constructor(config: SimpleAnalyticsConfig) {
    this.config = config;
  }

  startTracking(): void {
    console.log('[LL SessionTracker] Started tracking');
    
    // 주기적으로 세션 정리
    setInterval(() => {
      this.cleanupOldSessions();
    }, this.config.trackingInterval * 60 * 1000);
  }

  stopTracking(): void {
    console.log('[LL SessionTracker] Stopped tracking');
  }

  async saveSession(session: LearningSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      sessions.push(session);
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('[LL SessionTracker] Failed to save session:', error);
    }
  }

  async getUserSessions(userId: string): Promise<LearningSession[]> {
    const allSessions = await this.getAllSessions();
    return allSessions.filter(s => s.userId === userId);
  }

  async getDepartmentSessions(userIds: string[]): Promise<LearningSession[]> {
    const allSessions = await this.getAllSessions();
    return allSessions.filter(s => userIds.includes(s.userId));
  }

  async getSessionsInRange(dateRange: { from: string; to: string }): Promise<LearningSession[]> {
    const allSessions = await this.getAllSessions();
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    return allSessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      return sessionDate >= fromDate && sessionDate <= toDate;
    });
  }

  private async getAllSessions(): Promise<LearningSession[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch (error) {
      console.error('[LL SessionTracker] Failed to load sessions:', error);
      return [];
    }
  }

  private async cleanupOldSessions(): Promise<void> {
    const cutoffDate = subDays(new Date(), this.config.retentionDays);
    const sessions = await this.getAllSessions();
    
    const filtered = sessions.filter(s => new Date(s.startTime) > cutoffDate);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }
  }
}

// 진도 계산기
class ProgressCalculator {
  calculateProgress(userId: string, sessions: LearningSession[]): UserProgress {
    if (sessions.length === 0) {
      return this.getDefaultProgress(userId);
    }

    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // 카테고리별 성과 분석
    const categoryStats = this.analyzeCategoryPerformance(sessions);
    
    return {
      userId,
      totalSessions: sessions.length,
      totalQuestions,
      accuracy: Math.round(accuracy * 100) / 100,
      streak: this.calculateStreak(sessions),
      lastActiveDate: sessions[sessions.length - 1]?.startTime || '',
      strongCategories: categoryStats.strong,
      weakCategories: categoryStats.weak,
      progressTrend: this.calculateProgressTrend(sessions)
    };
  }

  calculateDepartmentSummary(
    departmentId: string,
    userIds: string[],
    sessions: LearningSession[]
  ): DepartmentSummary {
    const activeUsers = new Set(sessions.map(s => s.userId)).size;
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return {
      departmentId,
      departmentName: this.getDepartmentName(departmentId),
      totalUsers: userIds.length,
      activeUsers,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      totalSessions: sessions.length,
      engagementScore: this.calculateEngagementScore(userIds.length, activeUsers, sessions.length),
      topPerformers: this.getTopPerformers(sessions),
      improvementAreas: this.getImprovementAreas(sessions)
    };
  }

  private getDefaultProgress(userId: string): UserProgress {
    return {
      userId,
      totalSessions: 0,
      totalQuestions: 0,
      accuracy: 0,
      streak: 0,
      lastActiveDate: '',
      strongCategories: [],
      weakCategories: [],
      progressTrend: 'stable'
    };
  }

  private analyzeCategoryPerformance(sessions: LearningSession[]) {
    const categoryStats = new Map<string, { correct: number; total: number }>();
    
    sessions.forEach(session => {
      session.categories.forEach(category => {
        const stats = categoryStats.get(category) || { correct: 0, total: 0 };
        stats.total += session.questionsAnswered;
        stats.correct += session.correctAnswers;
        categoryStats.set(category, stats);
      });
    });

    const strong: string[] = [];
    const weak: string[] = [];

    categoryStats.forEach((stats, category) => {
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) : 0;
      if (accuracy > 0.8) strong.push(category);
      if (accuracy < 0.6) weak.push(category);
    });

    return { strong, weak };
  }

  private calculateStreak(sessions: LearningSession[]): number {
    // 간단한 연속 학습일 계산
    const sorted = orderBy(sessions, 'startTime', 'desc');
    let streak = 0;
    let lastDate = '';

    for (const session of sorted) {
      const sessionDate = format(new Date(session.startTime), 'yyyy-MM-dd');
      if (lastDate === '' || lastDate === sessionDate) {
        streak++;
        lastDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateProgressTrend(sessions: LearningSession[]): 'improving' | 'declining' | 'stable' {
    if (sessions.length < 4) return 'stable';

    const sorted = orderBy(sessions, 'startTime');
    const half = Math.floor(sessions.length / 2);
    const first = sorted.slice(0, half);
    const second = sorted.slice(half);

    const firstAccuracy = this.getAverageAccuracy(first);
    const secondAccuracy = this.getAverageAccuracy(second);

    const diff = secondAccuracy - firstAccuracy;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private getAverageAccuracy(sessions: LearningSession[]): number {
    const total = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const correct = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    return total > 0 ? (correct / total) * 100 : 0;
  }

  private getDepartmentName(departmentId: string): string {
    const names: Record<string, string> = {
      'dev': '개발팀',
      'sales': '영업팀',
      'marketing': '마케팅팀',
      'hr': '인사팀'
    };
    return names[departmentId] || departmentId;
  }

  private calculateEngagementScore(totalUsers: number, activeUsers: number, totalSessions: number): number {
    const participation = activeUsers / totalUsers;
    const activity = Math.min(totalSessions / activeUsers / 10, 1); // 평균 10세션 = 100점
    return Math.round((participation * 0.6 + activity * 0.4) * 100);
  }

  private getTopPerformers(sessions: LearningSession[]) {
    const userStats = groupBy(sessions, 'userId');
    const performers = Object.entries(userStats).map(([userId, userSessions]) => {
      const total = userSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
      const correct = userSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = total > 0 ? (correct / total) * 100 : 0;
      return { userId, accuracy };
    });

    return orderBy(performers, 'accuracy', 'desc').slice(0, 3);
  }

  private getImprovementAreas(sessions: LearningSession[]): string[] {
    const allCategories = [...new Set(sessions.flatMap(s => s.categories))];
    const categoryStats = new Map<string, { correct: number; total: number }>();

    sessions.forEach(session => {
      session.categories.forEach(category => {
        const stats = categoryStats.get(category) || { correct: 0, total: 0 };
        stats.total += session.questionsAnswered;
        stats.correct += session.correctAnswers;
        categoryStats.set(category, stats);
      });
    });

    const improvements: string[] = [];
    categoryStats.forEach((stats, category) => {
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) : 0;
      if (accuracy < 0.7) improvements.push(category);
    });

    return improvements.slice(0, 3); // 상위 3개
  }
}

// 리포트 생성기
class ReportGenerator {
  generateReport(data: {
    dateRange: { from: string; to: string };
    sessions: LearningSession[];
    userProgress: UserProgress[];
    departmentSummaries: DepartmentSummary[];
  }): AnalyticsReport {
    const reportId = `report-${Date.now()}`;
    
    return {
      reportId,
      generatedAt: new Date().toISOString(),
      dateRange: data.dateRange,
      summary: this.generateSummary(data.sessions, data.userProgress),
      userProgress: data.userProgress,
      departmentSummaries: data.departmentSummaries,
      trends: this.generateTrends(data.sessions)
    };
  }

  private generateSummary(sessions: LearningSession[], userProgress: UserProgress[]) {
    const totalUsers = new Set(sessions.map(s => s.userId)).size;
    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // 가장 인기있는 카테고리
    const allCategories = sessions.flatMap(s => s.categories);
    const categoryCount = groupBy(allCategories);
    const mostPopular = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || '';

    return {
      totalUsers,
      totalSessions,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      mostPopularCategory: mostPopular
    };
  }

  private generateTrends(sessions: LearningSession[]) {
    const dailyStats = groupBy(sessions, s => format(new Date(s.startTime), 'yyyy-MM-dd'));
    
    return Object.entries(dailyStats).map(([date, daySessions]) => {
      const totalQuestions = daySessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
      const totalCorrect = daySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      return {
        date,
        sessions: daySessions.length,
        accuracy: Math.round(accuracy * 100) / 100
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default RealisticAnalyticsPlugin;