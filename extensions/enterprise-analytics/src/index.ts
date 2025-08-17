/**
 * LockLearn Enterprise Analytics Extension
 * 특허 기반 사용기록 분석 및 기업용 학습 인사이트 모듈
 */

import type { LockLearnClient } from '@locklearn/partner-sdk';

// 타입 정의
export interface UsagePattern {
  userId: string;
  appUsage: AppUsageData[];
  learningContext: LearningContext;
  predictedNeeds: string[];
  timestamp: string;
}

export interface AppUsageData {
  packageName: string;
  category: string;
  usageTimeMs: number;
  lastUsed: string;
  frequency: number;
}

export interface LearningContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  location: 'home' | 'office' | 'transit' | 'other';
  deviceState: 'active' | 'idle' | 'background';
  interruptionLevel: 'low' | 'medium' | 'high';
}

export interface AnalyticsConfig {
  trackingEnabled: boolean;
  privacyMode: 'strict' | 'balanced' | 'permissive';
  retentionDays: number;
  realtimeUpdates: boolean;
  enterpriseFeatures: {
    usageAnalytics: boolean;
    predictiveInsights: boolean;
    customDashboards: boolean;
    exportReports: boolean;
  };
}

export interface LearningInsight {
  type: 'performance' | 'engagement' | 'retention' | 'productivity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  dataPoints: any[];
  confidence: number;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  totalEmployees: number;
  activeUsers: number;
  averageEngagement: number;
  topCategories: Array<{ name: string; usage: number }>;
  learningTrends: Array<{ date: string; value: number }>;
  insights: LearningInsight[];
}

// 메인 플러그인 클래스
export class EnterpriseAnalyticsPlugin {
  public readonly name = 'enterprise-analytics';
  public readonly version = '1.0.0';
  
  private client!: LockLearnClient;
  private config: AnalyticsConfig;
  private usageTracker: UsageTracker;
  private insightEngine: InsightEngine;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      trackingEnabled: true,
      privacyMode: 'balanced',
      retentionDays: 90,
      realtimeUpdates: true,
      enterpriseFeatures: {
        usageAnalytics: true,
        predictiveInsights: true,
        customDashboards: true,
        exportReports: true
      },
      ...config
    };
    
    this.usageTracker = new UsageTracker(this.config);
    this.insightEngine = new InsightEngine(this.config);
  }

  public install(client: LockLearnClient): void {
    this.client = client;
    
    // SDK에 새로운 메서드들 추가
    (client as any).getUsageAnalytics = this.getUsageAnalytics.bind(this);
    (client as any).getDepartmentAnalytics = this.getDepartmentAnalytics.bind(this);
    (client as any).generateLearningInsights = this.generateLearningInsights.bind(this);
    (client as any).exportAnalyticsReport = this.exportAnalyticsReport.bind(this);
    
    // 사용기록 수집 시작
    this.usageTracker.startTracking();
    
    console.log('[LL Enterprise] Analytics extension installed');
  }

  public uninstall?(client: LockLearnClient): void {
    this.usageTracker.stopTracking();
    console.log('[LL Enterprise] Analytics extension uninstalled');
  }

  /**
   * 특허 핵심 기능: 스마트폰 사용기록 기반 학습 패턴 분석
   */
  public async getUsageAnalytics(
    filters?: {
      userId?: string;
      departmentId?: string;
      dateRange?: { from: string; to: string };
      categories?: string[];
    }
  ): Promise<UsagePattern[]> {
    return this.usageTracker.getAnalytics(filters);
  }

  /**
   * 부서별 학습 분석 및 인사이트
   */
  public async getDepartmentAnalytics(departmentId: string): Promise<DepartmentAnalytics> {
    const usageData = await this.usageTracker.getDepartmentUsage(departmentId);
    const insights = await this.insightEngine.generateDepartmentInsights(usageData);
    
    return {
      departmentId,
      departmentName: usageData.name,
      totalEmployees: usageData.totalEmployees,
      activeUsers: usageData.activeUsers,
      averageEngagement: usageData.averageEngagement,
      topCategories: usageData.topCategories,
      learningTrends: usageData.trends,
      insights
    };
  }

  /**
   * AI 기반 학습 인사이트 생성
   */
  public async generateLearningInsights(
    userId: string,
    options?: { 
      includePersonalized: boolean;
      includePredictive: boolean;
    }
  ): Promise<LearningInsight[]> {
    const usagePattern = await this.usageTracker.getUserPattern(userId);
    return this.insightEngine.generateInsights(usagePattern, options);
  }

  /**
   * 기업용 분석 리포트 내보내기
   */
  public async exportAnalyticsReport(
    format: 'pdf' | 'excel' | 'json',
    options: {
      departmentIds?: string[];
      dateRange: { from: string; to: string };
      includeRawData: boolean;
    }
  ): Promise<Blob | string> {
    if (!this.config.enterpriseFeatures.exportReports) {
      throw new Error('Export reports feature not enabled');
    }
    
    const analytics = await this.getUsageAnalytics({
      dateRange: options.dateRange
    });
    
    return this.generateReport(analytics, format, options);
  }

  private async generateReport(
    data: UsagePattern[],
    format: string,
    options: any
  ): Promise<Blob | string> {
    // 리포트 생성 로직 (실제 구현에서는 PDF/Excel 라이브러리 사용)
    if (format === 'json') {
      return JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalUsers: data.length,
        summary: this.calculateSummary(data),
        data: options.includeRawData ? data : undefined
      }, null, 2);
    }
    
    // PDF/Excel 생성은 추후 구현
    throw new Error(`Format ${format} not implemented yet`);
  }

  private calculateSummary(data: UsagePattern[]) {
    return {
      totalLearningTime: data.reduce((sum, pattern) => 
        sum + pattern.appUsage.reduce((appSum, app) => appSum + app.usageTimeMs, 0), 0
      ),
      averageSessionLength: data.length > 0 ? 
        data.reduce((sum, p) => sum + p.appUsage.length, 0) / data.length : 0,
      topCategories: this.getTopCategories(data)
    };
  }

  private getTopCategories(data: UsagePattern[]) {
    const categoryMap = new Map<string, number>();
    
    data.forEach(pattern => {
      pattern.appUsage.forEach(app => {
        const current = categoryMap.get(app.category) || 0;
        categoryMap.set(app.category, current + app.usageTimeMs);
      });
    });
    
    return Array.from(categoryMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, usage]) => ({ name, usage }));
  }
}

// 사용기록 추적 클래스
class UsageTracker {
  private config: AnalyticsConfig;
  private isTracking = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  public startTracking(): void {
    if (!this.config.trackingEnabled) return;
    
    this.isTracking = true;
    
    // 실제 환경에서는 UsageStatsManager (Android) 또는 Screen Time API 사용
    console.log('[LL Analytics] Usage tracking started');
    
    // 모의 데이터 수집 시작
    if (this.config.realtimeUpdates) {
      setInterval(() => this.collectUsageData(), 60000); // 1분마다
    }
  }

  public stopTracking(): void {
    this.isTracking = false;
    console.log('[LL Analytics] Usage tracking stopped');
  }

  public async getAnalytics(filters?: any): Promise<UsagePattern[]> {
    // 실제 구현에서는 데이터베이스에서 조회
    return this.generateMockUsagePatterns();
  }

  public async getDepartmentUsage(departmentId: string) {
    // 부서별 사용 데이터 조회 (모의 데이터)
    return {
      id: departmentId,
      name: '개발팀',
      totalEmployees: 25,
      activeUsers: 20,
      averageEngagement: 0.85,
      topCategories: [
        { name: 'programming', usage: 1200000 },
        { name: 'documentation', usage: 800000 },
        { name: 'design', usage: 600000 }
      ],
      trends: this.generateTrendData()
    };
  }

  public async getUserPattern(userId: string): Promise<UsagePattern> {
    const patterns = await this.getAnalytics({ userId });
    return patterns[0] || this.generateMockUsagePatterns()[0];
  }

  private collectUsageData(): void {
    if (!this.isTracking) return;
    
    // 실제 디바이스 사용 데이터 수집
    // Android: UsageStatsManager
    // iOS: Screen Time API (제한적)
    
    console.log('[LL Analytics] Collecting usage data...');
  }

  private generateMockUsagePatterns(): UsagePattern[] {
    return [
      {
        userId: 'user-001',
        appUsage: [
          {
            packageName: 'com.chrome.android',
            category: 'web',
            usageTimeMs: 1800000, // 30분
            lastUsed: new Date().toISOString(),
            frequency: 25
          },
          {
            packageName: 'com.slack',
            category: 'communication',
            usageTimeMs: 900000, // 15분
            lastUsed: new Date().toISOString(),
            frequency: 15
          }
        ],
        learningContext: {
          timeOfDay: 'morning',
          location: 'office',
          deviceState: 'active',
          interruptionLevel: 'medium'
        },
        predictedNeeds: ['web-development', 'team-communication', 'project-management'],
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateTrendData() {
    const dates = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50
      });
    }
    return dates;
  }
}

// AI 인사이트 엔진
class InsightEngine {
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  public async generateDepartmentInsights(usageData: any): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // 참여도 분석
    if (usageData.averageEngagement < 0.7) {
      insights.push({
        type: 'engagement',
        title: '참여도 개선 필요',
        description: `평균 참여도가 ${(usageData.averageEngagement * 100).toFixed(1)}%로 낮습니다.`,
        impact: 'high',
        recommendation: '게이미피케이션 요소 도입 및 마이크로러닝 콘텐츠 제공을 권장합니다.',
        dataPoints: [usageData.averageEngagement],
        confidence: 0.85
      });
    }

    // 학습 트렌드 분석
    const recentTrend = this.calculateTrend(usageData.trends);
    if (recentTrend < -0.1) {
      insights.push({
        type: 'retention',
        title: '학습 활동 감소 추세',
        description: '최근 30일간 학습 활동이 감소하고 있습니다.',
        impact: 'medium',
        recommendation: '개인화된 학습 경로 제공 및 리마인더 설정을 권장합니다.',
        dataPoints: usageData.trends,
        confidence: 0.75
      });
    }

    return insights;
  }

  public async generateInsights(
    pattern: UsagePattern,
    options?: any
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // 사용 시간 기반 인사이트
    const totalUsage = pattern.appUsage.reduce((sum, app) => sum + app.usageTimeMs, 0);
    if (totalUsage > 7200000) { // 2시간 이상
      insights.push({
        type: 'productivity',
        title: '높은 디지털 활동 감지',
        description: '일일 디지털 사용량이 높아 번아웃 위험이 있습니다.',
        impact: 'medium',
        recommendation: '짧은 학습 세션과 휴식 알림을 설정하세요.',
        dataPoints: [totalUsage],
        confidence: 0.8
      });
    }

    // 컨텍스트 기반 학습 추천
    if (pattern.learningContext.timeOfDay === 'morning' && 
        pattern.learningContext.interruptionLevel === 'low') {
      insights.push({
        type: 'performance',
        title: '최적 학습 시간대',
        description: '아침 시간대에 집중도가 높습니다.',
        impact: 'high',
        recommendation: '복잡한 개념 학습을 아침 시간에 배치하세요.',
        dataPoints: [pattern.learningContext],
        confidence: 0.9
      });
    }

    return insights;
  }

  private calculateTrend(trendData: Array<{ date: string; value: number }>): number {
    if (trendData.length < 2) return 0;
    
    const recent = trendData.slice(-7); // 최근 7일
    const earlier = trendData.slice(-14, -7); // 이전 7일
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d.value, 0) / earlier.length;
    
    return (recentAvg - earlierAvg) / earlierAvg;
  }
}

// 기본 내보내기
export default EnterpriseAnalyticsPlugin;