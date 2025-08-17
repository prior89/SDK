/**
 * LockLearn Simple AI Extension
 * 실용적이고 즉시 구현 가능한 서버 중심 AI 개인화 모듈
 */

import type { LockLearnClient, WrongAnswer, UserProfile } from '@locklearn/partner-sdk';
import { subDays, format } from 'date-fns';
import { groupBy, orderBy, mean } from 'lodash';

// 간단한 AI 설정
export interface SimpleAIConfig {
  enabled: boolean;
  serverEndpoint: string;
  cacheEnabled: boolean;
  cacheDuration: number; // minutes
  fallbackToRules: boolean;
  adaptiveThreshold: number; // 0-1
  debugMode: boolean;
}

export interface LearnerProfile {
  userId: string;
  learningStyle: 'visual' | 'text' | 'interactive' | 'mixed';
  preferredDifficulty: number; // 0-1 (0=easy, 1=hard)
  strongCategories: CategoryStrength[];
  weakCategories: CategoryStrength[];
  learningSpeed: 'slow' | 'normal' | 'fast';
  optimalSessionLength: number; // minutes
  bestPerformanceTimes: string[]; // hour:minute format
  motivationProfile: MotivationProfile;
  lastUpdated: string;
}

export interface CategoryStrength {
  category: string;
  strength: number; // 0-1
  confidence: number; // 0-1
  sampleSize: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface MotivationProfile {
  preferredRewards: ('points' | 'badges' | 'progress' | 'competition')[];
  challengePreference: 'gradual' | 'moderate' | 'aggressive';
  feedbackStyle: 'immediate' | 'summary' | 'detailed';
  socialPreference: 'private' | 'team' | 'public';
}

export interface PersonalizedRecommendation {
  type: 'content' | 'schedule' | 'difficulty' | 'format';
  title: string;
  description: string;
  confidence: number; // 0-1
  reasoning: string[];
  actionable: {
    action: string;
    parameters: Record<string, any>;
  };
  impact: 'low' | 'medium' | 'high';
}

export interface AdaptiveLearningPath {
  userId: string;
  currentLevel: number;
  targetLevel: number;
  estimatedCompletion: string; // ISO date
  milestones: Milestone[];
  nextRecommendations: PersonalizedRecommendation[];
  adaptations: Adaptation[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAccuracy: number;
  requiredQuestions: number;
  category: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface Adaptation {
  timestamp: string;
  type: 'difficulty' | 'content' | 'schedule' | 'format';
  reason: string;
  oldValue: any;
  newValue: any;
  effectMeasured?: boolean;
}

export interface SmartWrongAnswerAnalysis {
  patternId: string;
  errorType: 'conceptual' | 'computational' | 'linguistic' | 'attention';
  frequency: number;
  impactOnProgress: number; // 0-1
  suggestedInterventions: Intervention[];
  similarLearners: Array<{ userId: string; similarityScore: number }>;
  estimatedResolutionTime: number; // hours
}

export interface Intervention {
  type: 'review' | 'practice' | 'tutorial' | 'rest';
  description: string;
  estimatedEffectiveness: number; // 0-1
  estimatedTime: number; // minutes
  resources: Array<{ type: string; url?: string; content?: string }>;
}

// 간단한 AI 개인화 플러그인
export class SimpleAIPlugin {
  public readonly name = 'simple-ai';
  public readonly version = '0.1.0';
  
  private client!: LockLearnClient;
  private config: SimpleAIConfig;
  private profileManager: ProfileManager;
  private recommendationEngine: RecommendationEngine;
  private adaptiveLearning: AdaptiveLearningEngine;
  private wrongAnswerAnalyzer: SmartWrongAnswerAnalyzer;
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(config: Partial<SimpleAIConfig> = {}) {
    this.config = {
      enabled: true,
      serverEndpoint: 'https://api.locklearn.com/ai/v1',
      cacheEnabled: true,
      cacheDuration: 30, // 30분
      fallbackToRules: true,
      adaptiveThreshold: 0.1,
      debugMode: false,
      ...config
    };
    
    this.profileManager = new ProfileManager(this.config);
    this.recommendationEngine = new RecommendationEngine(this.config);
    this.adaptiveLearning = new AdaptiveLearningEngine(this.config);
    this.wrongAnswerAnalyzer = new SmartWrongAnswerAnalyzer(this.config);
  }

  public install(client: LockLearnClient): void {
    this.client = client;
    
    // SDK에 AI 기능 추가
    (client as any).getLearnerProfile = this.getLearnerProfile.bind(this);
    (client as any).updateLearnerProfile = this.updateLearnerProfile.bind(this);
    (client as any).getPersonalizedRecommendations = this.getPersonalizedRecommendations.bind(this);
    (client as any).getAdaptiveLearningPath = this.getAdaptiveLearningPath.bind(this);
    (client as any).analyzeWrongAnswerPattern = this.analyzeWrongAnswerPattern.bind(this);
    (client as any).adaptDifficulty = this.adaptDifficulty.bind(this);
    (client as any).predictOptimalStudyTime = this.predictOptimalStudyTime.bind(this);
    
    console.log('[LL Simple AI] AI personalization plugin installed');
  }

  public uninstall?(client: LockLearnClient): void {
    this.cache.clear();
    console.log('[LL Simple AI] AI plugin uninstalled');
  }

  /**
   * 학습자 프로필 조회 (캐시 포함)
   */
  public async getLearnerProfile(userId: string): Promise<LearnerProfile> {
    const cacheKey = `profile-${userId}`;
    
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const profile = await this.profileManager.getProfile(userId);
      
      if (this.config.cacheEnabled) {
        this.setCache(cacheKey, profile);
      }
      
      return profile;
    } catch (error) {
      if (this.config.fallbackToRules) {
        console.warn('[LL Simple AI] Server error, using fallback profile');
        return this.profileManager.createDefaultProfile(userId);
      }
      throw error;
    }
  }

  /**
   * 학습 이벤트 기반 프로필 업데이트
   */
  public async updateLearnerProfile(
    userId: string,
    learningEvent: {
      questionId: string;
      category: string;
      difficulty: number;
      correct: boolean;
      timeSpent: number;
      confidence?: number;
    }
  ): Promise<LearnerProfile> {
    const currentProfile = await this.getLearnerProfile(userId);
    const updatedProfile = await this.profileManager.updateWithEvent(currentProfile, learningEvent);
    
    // 캐시 업데이트
    if (this.config.cacheEnabled) {
      this.setCache(`profile-${userId}`, updatedProfile);
    }
    
    // 적응형 학습 체크
    if (this.shouldTriggerAdaptation(learningEvent)) {
      await this.adaptiveLearning.triggerAdaptation(userId, learningEvent);
    }
    
    return updatedProfile;
  }

  /**
   * 개인화된 추천 생성
   */
  public async getPersonalizedRecommendations(
    userId: string,
    context?: {
      currentTime?: Date;
      availableTime?: number; // minutes
      preferredCategories?: string[];
      sessionGoal?: 'review' | 'learn' | 'challenge';
    }
  ): Promise<PersonalizedRecommendation[]> {
    const profile = await this.getLearnerProfile(userId);
    
    // 서버 API 호출 시도
    try {
      const serverRecommendations = await this.callServerAPI('recommendations', {
        userId,
        profile,
        context
      });
      
      return serverRecommendations;
    } catch (error) {
      if (this.config.fallbackToRules) {
        console.warn('[LL Simple AI] Server error, using rule-based recommendations');
        return this.recommendationEngine.generateRuleBasedRecommendations(profile, context);
      }
      throw error;
    }
  }

  /**
   * 적응형 학습 경로 조회
   */
  public async getAdaptiveLearningPath(userId: string): Promise<AdaptiveLearningPath> {
    const profile = await this.getLearnerProfile(userId);
    const recentProgress = await this.getRecentProgress(userId);
    
    return this.adaptiveLearning.generateLearningPath(profile, recentProgress);
  }

  /**
   * 틀린 답변 패턴 분석
   */
  public async analyzeWrongAnswerPattern(
    userId: string,
    wrongAnswers: WrongAnswer[]
  ): Promise<SmartWrongAnswerAnalysis[]> {
    const profile = await this.getLearnerProfile(userId);
    
    try {
      const serverAnalysis = await this.callServerAPI('analyze-errors', {
        userId,
        profile,
        wrongAnswers
      });
      
      return serverAnalysis;
    } catch (error) {
      if (this.config.fallbackToRules) {
        return this.wrongAnswerAnalyzer.analyzeWithRules(wrongAnswers, profile);
      }
      throw error;
    }
  }

  /**
   * 실시간 난이도 조정
   */
  public async adaptDifficulty(
    userId: string,
    currentDifficulty: number,
    recentPerformance: Array<{ correct: boolean; timeSpent: number }>
  ): Promise<{ newDifficulty: number; reason: string; confidence: number }> {
    const profile = await this.getLearnerProfile(userId);
    
    // 간단한 규칙 기반 적응
    const accuracy = recentPerformance.filter(p => p.correct).length / recentPerformance.length;
    const avgTime = mean(recentPerformance.map(p => p.timeSpent));
    
    let newDifficulty = currentDifficulty;
    let reason = 'No change needed';
    let confidence = 0.8;

    if (accuracy > 0.8 && avgTime < 10) {
      // 너무 쉬움
      newDifficulty = Math.min(1.0, currentDifficulty + 0.1);
      reason = 'High accuracy with fast response time';
      confidence = 0.9;
    } else if (accuracy < 0.4) {
      // 너무 어려움
      newDifficulty = Math.max(0.1, currentDifficulty - 0.15);
      reason = 'Low accuracy indicates difficulty too high';
      confidence = 0.85;
    } else if (accuracy < 0.6 && avgTime > 30) {
      // 약간 어려움
      newDifficulty = Math.max(0.1, currentDifficulty - 0.05);
      reason = 'Low accuracy with slow response time';
      confidence = 0.7;
    }

    // 학습자 선호도 반영
    if (profile.preferredDifficulty > 0.7 && newDifficulty < currentDifficulty) {
      newDifficulty = currentDifficulty; // 도전을 좋아하는 학습자는 난이도 유지
      reason += ' (adjusted for learner preference for challenge)';
    }

    return { newDifficulty, reason, confidence };
  }

  /**
   * 최적 학습 시간 예측
   */
  public async predictOptimalStudyTime(
    userId: string,
    targetDate?: Date
  ): Promise<{
    recommendedTimes: Array<{ start: string; end: string; confidence: number }>;
    reasoning: string[];
    alternatives: Array<{ start: string; end: string; reason: string }>;
  }> {
    const profile = await this.getLearnerProfile(userId);
    
    // 기존 최적 시간 기반 예측
    const baseRecommendations = profile.bestPerformanceTimes.map(time => {
      const [hour, minute] = time.split(':').map(Number);
      const start = new Date();
      start.setHours(hour, minute, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + profile.optimalSessionLength);
      
      return {
        start: format(start, 'HH:mm'),
        end: format(end, 'HH:mm'),
        confidence: 0.8
      };
    });

    const reasoning = [
      `Based on your performance history at ${profile.bestPerformanceTimes.join(', ')}`,
      `Optimal session length: ${profile.optimalSessionLength} minutes`,
      `Learning speed: ${profile.learningSpeed}`
    ];

    // 대안 시간 생성
    const alternatives = [
      { start: '07:00', end: '07:30', reason: 'Early morning focus time' },
      { start: '13:00', end: '13:30', reason: 'Post-lunch energy boost' },
      { start: '20:00', end: '20:30', reason: 'Evening review session' }
    ].filter(alt => !baseRecommendations.some(rec => rec.start === alt.start));

    return {
      recommendedTimes: baseRecommendations,
      reasoning,
      alternatives
    };
  }

  // 헬퍼 메서드들
  private async callServerAPI(endpoint: string, data: any): Promise<any> {
    const url = `${this.config.serverEndpoint}/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-api-key' // 실제 구현에서는 적절한 인증
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Server API error: ${response.status}`);
    }

    return response.json();
  }

  private getFromCache(key: string): any | null {
    if (!this.config.cacheEnabled) return null;
    
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    if (!this.config.cacheEnabled) return;
    
    const expiry = Date.now() + (this.config.cacheDuration * 60 * 1000);
    this.cache.set(key, { data, expiry });
  }

  private shouldTriggerAdaptation(learningEvent: any): boolean {
    // 간단한 적응 트리거 로직
    return learningEvent.timeSpent > 60 || learningEvent.confidence < 0.3;
  }

  private async getRecentProgress(userId: string) {
    // 실제 구현에서는 SDK를 통해 최근 진도 조회
    return [];
  }
}

// 프로필 관리자
class ProfileManager {
  private config: SimpleAIConfig;

  constructor(config: SimpleAIConfig) {
    this.config = config;
  }

  async getProfile(userId: string): Promise<LearnerProfile> {
    // 서버에서 프로필 조회 시뮬레이션
    if (this.config.debugMode) {
      console.log(`[LL ProfileManager] Loading profile for ${userId}`);
    }

    // 실제 구현에서는 서버 API 호출
    return this.createDefaultProfile(userId);
  }

  createDefaultProfile(userId: string): LearnerProfile {
    return {
      userId,
      learningStyle: 'mixed',
      preferredDifficulty: 0.5,
      strongCategories: [],
      weakCategories: [],
      learningSpeed: 'normal',
      optimalSessionLength: 15,
      bestPerformanceTimes: ['09:00', '14:00', '19:00'],
      motivationProfile: {
        preferredRewards: ['progress', 'points'],
        challengePreference: 'moderate',
        feedbackStyle: 'immediate',
        socialPreference: 'private'
      },
      lastUpdated: new Date().toISOString()
    };
  }

  async updateWithEvent(profile: LearnerProfile, event: any): Promise<LearnerProfile> {
    // 이벤트 기반 프로필 업데이트
    const updated = { ...profile };
    
    // 카테고리별 강점/약점 업데이트
    const categoryIndex = updated.strongCategories.findIndex(c => c.category === event.category);
    
    if (categoryIndex >= 0) {
      const current = updated.strongCategories[categoryIndex];
      current.strength = this.adjustStrength(current.strength, event.correct);
      current.sampleSize += 1;
    } else {
      updated.strongCategories.push({
        category: event.category,
        strength: event.correct ? 0.6 : 0.4,
        confidence: 0.5,
        sampleSize: 1,
        trend: 'stable'
      });
    }

    // 선호 난이도 조정
    if (event.correct && event.timeSpent < 10) {
      updated.preferredDifficulty = Math.min(1.0, updated.preferredDifficulty + 0.02);
    } else if (!event.correct) {
      updated.preferredDifficulty = Math.max(0.1, updated.preferredDifficulty - 0.05);
    }

    updated.lastUpdated = new Date().toISOString();
    
    return updated;
  }

  private adjustStrength(currentStrength: number, correct: boolean): number {
    const adjustment = correct ? 0.05 : -0.1;
    return Math.max(0, Math.min(1, currentStrength + adjustment));
  }
}

// 추천 엔진
class RecommendationEngine {
  private config: SimpleAIConfig;

  constructor(config: SimpleAIConfig) {
    this.config = config;
  }

  generateRuleBasedRecommendations(
    profile: LearnerProfile,
    context?: any
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // 약한 카테고리 개선 추천
    if (profile.weakCategories.length > 0) {
      const weakest = profile.weakCategories[0];
      recommendations.push({
        type: 'content',
        title: `${weakest.category} 분야 집중 학습`,
        description: `${weakest.category} 분야의 정확도를 높이기 위한 추가 학습을 권장합니다.`,
        confidence: 0.8,
        reasoning: [`현재 ${weakest.category} 정확도: ${Math.round(weakest.strength * 100)}%`],
        actionable: {
          action: 'focus_category',
          parameters: { category: weakest.category, sessions: 3 }
        },
        impact: 'high'
      });
    }

    // 난이도 조정 추천
    if (profile.preferredDifficulty < 0.3) {
      recommendations.push({
        type: 'difficulty',
        title: '난이도 점진적 증가',
        description: '현재 수준에서 조금씩 난이도를 높여보세요.',
        confidence: 0.7,
        reasoning: ['현재 선호 난이도가 낮음', '점진적 증가로 자신감 향상 가능'],
        actionable: {
          action: 'increase_difficulty',
          parameters: { increment: 0.1, gradual: true }
        },
        impact: 'medium'
      });
    }

    // 학습 시간 최적화 추천
    const currentHour = new Date().getHours();
    const isOptimalTime = profile.bestPerformanceTimes.some(time => {
      const [hour] = time.split(':').map(Number);
      return Math.abs(hour - currentHour) <= 1;
    });

    if (!isOptimalTime) {
      recommendations.push({
        type: 'schedule',
        title: '최적 학습 시간 활용',
        description: `${profile.bestPerformanceTimes.join(', ')} 시간대에 학습하면 더 좋은 성과를 낼 수 있습니다.`,
        confidence: 0.6,
        reasoning: ['과거 성과 데이터 기반', '집중도가 높은 시간대'],
        actionable: {
          action: 'schedule_session',
          parameters: { times: profile.bestPerformanceTimes }
        },
        impact: 'medium'
      });
    }

    return recommendations;
  }
}

// 적응형 학습 엔진
class AdaptiveLearningEngine {
  private config: SimpleAIConfig;

  constructor(config: SimpleAIConfig) {
    this.config = config;
  }

  generateLearningPath(profile: LearnerProfile, recentProgress: any[]): AdaptiveLearningPath {
    const milestones = this.generateMilestones(profile);
    const recommendations = this.generatePathRecommendations(profile);
    
    return {
      userId: profile.userId,
      currentLevel: this.calculateCurrentLevel(profile),
      targetLevel: this.calculateTargetLevel(profile),
      estimatedCompletion: this.estimateCompletion(profile),
      milestones,
      nextRecommendations: recommendations,
      adaptations: []
    };
  }

  async triggerAdaptation(userId: string, event: any): Promise<void> {
    console.log(`[LL AdaptiveLearning] Triggered adaptation for ${userId}:`, event);
    // 적응 로직 구현
  }

  private generateMilestones(profile: LearnerProfile): Milestone[] {
    return profile.weakCategories.slice(0, 3).map((weak, index) => ({
      id: `milestone-${index}`,
      title: `${weak.category} 마스터하기`,
      description: `${weak.category} 분야에서 80% 이상 정확도 달성`,
      targetAccuracy: 0.8,
      requiredQuestions: 20,
      category: weak.category,
      status: 'pending' as const
    }));
  }

  private generatePathRecommendations(profile: LearnerProfile): PersonalizedRecommendation[] {
    return [
      {
        type: 'content',
        title: '다음 학습 추천',
        description: '약점 보완을 위한 맞춤 콘텐츠',
        confidence: 0.8,
        reasoning: ['프로필 분석 기반'],
        actionable: {
          action: 'next_content',
          parameters: { focus: 'weak_areas' }
        },
        impact: 'high'
      }
    ];
  }

  private calculateCurrentLevel(profile: LearnerProfile): number {
    const avgStrength = profile.strongCategories.length > 0
      ? mean(profile.strongCategories.map(c => c.strength))
      : 0.5;
    return Math.round(avgStrength * 10);
  }

  private calculateTargetLevel(profile: LearnerProfile): number {
    return Math.min(10, this.calculateCurrentLevel(profile) + 2);
  }

  private estimateCompletion(profile: LearnerProfile): string {
    const weeksToTarget = 4; // 기본 4주
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToTarget * 7));
    return targetDate.toISOString();
  }
}

// 스마트 오답 분석기
class SmartWrongAnswerAnalyzer {
  private config: SimpleAIConfig;

  constructor(config: SimpleAIConfig) {
    this.config = config;
  }

  analyzeWithRules(wrongAnswers: WrongAnswer[], profile: LearnerProfile): SmartWrongAnswerAnalysis[] {
    const analyses: SmartWrongAnswerAnalysis[] = [];
    
    // 카테고리별 그룹화
    const byCategory = groupBy(wrongAnswers, 'category');
    
    Object.entries(byCategory).forEach(([category, answers]) => {
      if (answers.length >= 2) { // 2개 이상 틀린 경우만 패턴으로 간주
        analyses.push({
          patternId: `pattern-${category}-${Date.now()}`,
          errorType: this.classifyErrorType(answers),
          frequency: answers.length,
          impactOnProgress: this.calculateImpact(answers, profile),
          suggestedInterventions: this.generateInterventions(category, answers),
          similarLearners: [], // 실제 구현에서는 유사 학습자 찾기
          estimatedResolutionTime: this.estimateResolutionTime(answers.length)
        });
      }
    });

    return analyses;
  }

  private classifyErrorType(answers: WrongAnswer[]): 'conceptual' | 'computational' | 'linguistic' | 'attention' {
    // 간단한 분류 로직
    const hasComputationKeywords = answers.some(a => 
      a.question.includes('계산') || a.question.includes('수식')
    );
    
    if (hasComputationKeywords) return 'computational';
    
    const hasLanguageKeywords = answers.some(a =>
      a.question.includes('문법') || a.question.includes('어법')
    );
    
    if (hasLanguageKeywords) return 'linguistic';
    
    return 'conceptual';
  }

  private calculateImpact(answers: WrongAnswer[], profile: LearnerProfile): number {
    const category = answers[0].category || '';
    const categoryStrength = profile.strongCategories.find(c => c.category === category);
    
    if (categoryStrength && categoryStrength.strength < 0.5) {
      return 0.8; // 약한 분야의 오답은 높은 임팩트
    }
    
    return 0.5; // 기본 임팩트
  }

  private generateInterventions(category: string, answers: WrongAnswer[]): Intervention[] {
    return [
      {
        type: 'review',
        description: `${category} 기본 개념 복습`,
        estimatedEffectiveness: 0.8,
        estimatedTime: 20,
        resources: [
          { type: 'tutorial', content: `${category} 기초 튜토리얼` },
          { type: 'practice', content: `${category} 연습 문제` }
        ]
      },
      {
        type: 'practice',
        description: '유사 문제 반복 연습',
        estimatedEffectiveness: 0.7,
        estimatedTime: 15,
        resources: [
          { type: 'quiz', content: '맞춤형 연습 퀴즈' }
        ]
      }
    ];
  }

  private estimateResolutionTime(errorCount: number): number {
    return Math.min(errorCount * 2, 12); // 최대 12시간
  }
}

export default SimpleAIPlugin;