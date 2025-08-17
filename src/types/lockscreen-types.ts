/**
 * 🔐 잠금화면 학습 시스템 타입 정의
 * 특허 청구항에 정확히 맞는 타입 시스템
 */

// ==========================================
// 스마트폰 사용기록 관련 타입 (특허 핵심)
// ==========================================

export interface SmartphoneUsageData {
  userId: string;
  collectedAt: string;
  
  // 앱 사용 패턴 (청구항 1)
  appUsagePatterns: AppUsagePattern[];
  
  // 웹 브라우징 기록 (청구항 1)
  browsingHistory: BrowsingRecord[];
  
  // 위치 패턴 (청구항 1)
  locationPatterns: LocationPattern[];
  
  // 시간대 패턴 (청구항 1)
  timePatterns: TimePattern[];
  
  // 입력 패턴 (청구항 1)
  inputBehaviors: InputPattern[];
  
  // 추출된 학습 컨텍스트
  currentContext: LearningContext;
  historicalContext: HistoricalContext;
  predictedContext: PredictedContext;
  
  // 개인화 프로필
  personalizedProfile: PersonalizedLearningProfile;
  
  // 프라이버시 보호 (청구항 6)
  dataProcessedOnDevice: boolean;
  anonymizationLevel: 'minimal' | 'standard' | 'detailed';
  consentTimestamp: string;
}

export interface AppUsagePattern {
  appCategory: string;
  appName: string;
  usageDuration: number;        // minutes
  usageFrequency: number;       // times per day
  usageContext: string[];       // contexts when used
  contentTopics: string[];      // topics engaged with
  lastUsed: string;
  anonymized: boolean;
}

export interface BrowsingRecord {
  domain: string;               // anonymized domain
  contentCategory: string;
  topicsOfInterest: string[];
  timeSpent: number;           // minutes
  searchQueries: string[];     // anonymized
  timestamp: string;
  anonymized: boolean;
}

export interface LocationPattern {
  locationCategory: 'home' | 'work' | 'school' | 'transport' | 'leisure' | 'other';
  timeOfDay: number[];         // hours when at this location
  associatedActivities: string[];
  learningOpportunities: string[];
  anonymized: boolean;
}

export interface TimePattern {
  activeHours: number[];       // hours of peak usage
  learningWindows: TimeWindow[];
  attentionPeaks: number[];    // hours of high attention
  distractionPeriods: number[]; // hours of low focus
  circadianPreferences: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface TimeWindow {
  startHour: number;
  endHour: number;
  attentionLevel: number;      // 0-1
  learningEffectiveness: number; // 0-1
  distractionLevel: number;    // 0-1
}

export interface InputPattern {
  typingSpeed: number;         // words per minute
  typingAccuracy: number;      // 0-1
  preferredInputMethod: 'touch' | 'voice' | 'gesture' | 'hybrid';
  languageUsage: LanguageUsage[];
  communicationStyle: string;
  errorPatterns: string[];
}

export interface LanguageUsage {
  language: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'native';
  usagePercentage: number;     // 0-100
  contextualUsage: string[];
}

// ==========================================
// 학습 컨텍스트 타입
// ==========================================

export interface LearningContext {
  currentActivity: string;
  availableTime: number;       // estimated available time in minutes
  attentionLevel: number;      // 0-1
  distractionLevel: number;    // 0-1
  deviceUsageContext: 'active' | 'passive' | 'background';
  socialContext: 'alone' | 'with_others' | 'public' | 'private';
  environmentalFactors: string[];
  motivationLevel: number;     // 0-1
  cognitiveLoad: number;       // 0-1
  insights: ContextualInsight[];
}

export interface ContextualInsight {
  type: 'learning_opportunity' | 'knowledge_gap' | 'interest_spike' | 'attention_peak';
  description: string;
  confidence: number;          // 0-1
  actionableRecommendation: string;
  estimatedValue: number;      // learning value 0-1
}

export interface HistoricalContext {
  learningHistory: LearningHistoryEntry[];
  performancePatterns: PerformancePattern[];
  engagementTrends: EngagementTrend[];
  improvementAreas: ImprovementArea[];
}

export interface PredictedContext {
  nextLearningOpportunity: string;
  optimalLearningTime: string;
  predictedDifficulty: number; // 0-1
  expectedEngagement: number;  // 0-1
  confidence: number;          // 0-1
}

// ==========================================
// 문제 생성 관련 타입 (특허 청구항 1)
// ==========================================

export interface ContextualQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  incorrectAnswers: string[];
  
  // 맥락 기반 정보
  contextSource: 'news' | 'search' | 'messaging' | 'shopping' | 'social' | 'location';
  sourceContent: string;       // original content that inspired the question
  contextualRelevance: number; // 0-1
  
  // 문제 메타데이터
  subject: string;
  topic: string;
  difficulty: number;          // 0-1
  estimatedTime: number;       // seconds
  learningObjectives: string[];
  
  // 개인화 요소
  personalizedElements: PersonalizationElement[];
  adaptationPotential: number; // 0-1
  
  // 잠금화면 최적화
  lockScreenOptimized: boolean;
  quickAccessible: boolean;
  visuallyOptimized: boolean;
  accessibilitySupported: boolean;
  
  // 생성 정보
  generatedAt: string;
  generationMethod: 'template' | 'ai_generated' | 'hybrid';
  aiModelVersion: string;
  qualityScore: number;        // 0-1
}

export interface PersonalizationElement {
  type: 'language_preference' | 'difficulty_adjustment' | 'interest_alignment' | 'cultural_context';
  value: any;
  reason: string;
  effectiveness: number;       // 0-1
}

// ==========================================
// 잠금화면 인터페이스 타입 (특허 실시예 1)
// ==========================================

export interface LockScreenWidget {
  platform: 'android' | 'ios' | 'web';
  widgetId: string;
  question: ContextualQuestion;
  
  // 표시 설정
  layout: 'lockscreen_overlay' | 'live_activity' | 'notification_panel';
  displayDuration: number;     // seconds
  interactionType: 'touch_selection' | 'action_button' | 'voice_input';
  
  // 접근성
  accessibilitySupport: boolean;
  largeTextSupport: boolean;
  voiceOverSupport: boolean;
  highContrastMode: boolean;
  
  // 시각적 요소
  theme: 'light' | 'dark' | 'auto';
  colorScheme: string;
  animationLevel: 'none' | 'minimal' | 'standard' | 'enhanced';
  
  // 상호작용 설정
  timeoutDuration: number;     // seconds
  unlockBehavior: 'immediate' | 'delayed' | 'explanation_first';
  feedbackType: 'visual' | 'haptic' | 'audio' | 'combined';
}

export interface LockScreenInteraction {
  questionId: string;
  userId: string;
  widgetId: string;
  
  // 사용자 응답
  userAnswer: string;
  responseTime: number;        // milliseconds
  isCorrect: boolean;
  
  // 상호작용 품질
  attentionLevel: number;      // 0-1 (estimated)
  engagementScore: number;     // 0-1
  confidenceLevel: number;     // 0-1 (user's confidence)
  
  // 잠금 해제 동작
  unlockBehavior: 'immediate_unlock' | 'delayed_unlock' | 'explanation_shown';
  unlockTime: number;          // milliseconds after answer
  
  // 컨텍스트 정보
  contextualRelevance: number; // 0-1
  deviceState: DeviceState;
  environmentalContext: string[];
  
  // 결과 정보
  learningValue: number;       // 0-1
  retentionPrediction: number; // 0-1
  difficultyPerception: number; // 0-1
  
  timestamp: string;
}

export interface DeviceState {
  batteryLevel: number;        // 0-100
  networkConnection: 'wifi' | 'cellular' | 'offline';
  deviceOrientation: 'portrait' | 'landscape';
  backgroundApps: string[];
  notificationCount: number;
}

// ==========================================
// 개인화 오답노트 타입 (특허 청구항 3)
// ==========================================

export interface PersonalizedReviewNote {
  userId: string;
  noteId: string;
  generatedAt: string;
  
  // 특허 명시 구성요소
  reviewComponents: {
    originalProblems: OriginalProblem[];    // 원문 문제
    correctAnswers: string[];               // 정답
    explanations: PersonalizedExplanation[]; // 해설
    similarProblems: SimilarProblem[];      // 유사 문제
  };
  
  // 약점 분석 (특허 핵심)
  weaknessAnalysis: {
    identifiedAreas: WeaknessArea[];        // 약점 영역
    patterns: WeaknessPattern[];            // 패턴 분석
    severity: WeaknessSeverity;             // 심각도
    improvementPotential: number;           // 개선 가능성 0-1
  };
  
  // 복습 계획 (학습 패턴 맞춤)
  reviewPlan: {
    schedule: ReviewSchedule;               // 복습 스케줄
    prioritizedAreas: PrioritizedArea[];    // 우선순위 영역
    estimatedImprovementTime: number;       // 예상 개선 시간 (days)
    customizedApproach: string[];           // 맞춤 접근법
  };
  
  // 접근 방식 (특허 명시: 앱 내부 + 잠금화면)
  accessMethods: AccessMethod[];
  
  // 효과 추적
  effectivenessTracking: {
    initialWeaknessLevel: number;           // 초기 약점 수준
    targetImprovementLevel: number;         // 목표 개선 수준
    milestones: Milestone[];                // 중간 목표
    successMetrics: SuccessMetric[];        // 성공 지표
  };
}

export interface OriginalProblem {
  questionId: string;
  questionText: string;
  userAnswer: string;
  contextWhenAnswered: string;
  timestamp: string;
  difficultyAtTime: number;
  mistakeCategory: string;
}

export interface PersonalizedExplanation {
  questionId: string;
  explanation: string;
  personalizedInsights: string[];
  learningTips: string[];
  commonMistakes: string[];
  memoryAids: string[];
  relatedConcepts: string[];
}

export interface SimilarProblem {
  originalQuestionId: string;
  generatedQuestionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  similarityScore: number;     // 0-1
  difficultyVariation: number; // -0.5 to 0.5
  generationMethod: 'template_based' | 'ai_generated' | 'hybrid';
}

export interface WeaknessArea {
  area: string;                // e.g., "영어 단어", "역사 연도", "수학 공식"
  category: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  frequency: number;           // how often mistakes occur
  consistency: number;         // 0-1, how consistent the mistakes are
  improvementTrend: 'improving' | 'stable' | 'declining';
  associatedTopics: string[];
}

export interface WeaknessPattern {
  patternType: 'conceptual' | 'procedural' | 'factual' | 'application';
  description: string;
  frequency: number;
  contexts: string[];          // when this pattern appears
  triggerFactors: string[];    // what causes this pattern
  preventionStrategies: string[];
}

export interface WeaknessSeverity {
  overall: number;             // 0-1
  bySubject: Record<string, number>;
  byDifficulty: Record<string, number>;
  byContext: Record<string, number>;
  trend: 'improving' | 'stable' | 'worsening';
}

// ==========================================
// 복습 스케줄 관련 타입
// ==========================================

export interface ReviewSchedule {
  scheduleId: string;
  userId: string;
  createdAt: string;
  
  // 복습 세션들
  sessions: ReviewSession[];
  
  // 스케줄 최적화
  optimizationStrategy: 'spaced_repetition' | 'weakness_focused' | 'balanced' | 'intensive';
  adaptationFrequency: number; // days between schedule adjustments
  
  // 개인화 요소
  personalizedTiming: boolean;
  contextualScheduling: boolean;
  performanceBasedAdjustment: boolean;
}

export interface ReviewSession {
  sessionId: string;
  scheduledDate: string;
  estimatedDuration: number;   // minutes
  targetWeaknessAreas: string[];
  questionCount: number;
  difficultyRange: [number, number];
  sessionType: 'intensive' | 'maintenance' | 'reinforcement';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
  effectiveness?: number;      // 0-1, measured after completion
}

export interface PrioritizedArea {
  area: string;
  priority: number;            // 1-10
  urgency: 'immediate' | 'soon' | 'moderate' | 'low';
  estimatedImprovementTime: number; // days
  requiredSessions: number;
  successProbability: number;  // 0-1
}

// ==========================================
// 난이도 조정 타입 (특허 청구항 4)
// ==========================================

export interface DifficultyAdjustment {
  userId: string;
  adjustmentTimestamp: string;
  
  // 조정 정보
  previousDifficulty: number;  // 0-1
  newDifficulty: number;       // 0-1
  adjustmentDirection: 'increase' | 'decrease' | 'maintain';
  adjustmentMagnitude: number; // 0-1
  
  // 조정 근거
  adjustmentReason: {
    primaryFactor: string;
    secondaryFactors: string[];
    dataPoints: number;
    confidence: number;        // 0-1
  };
  
  // 예상 효과
  expectedImpact: {
    performanceImprovement: number; // 0-1
    engagementIncrease: number;     // 0-1
    learningAcceleration: number;   // 0-1
  };
  
  // 다음 평가
  nextEvaluationAfter: number; // minutes
}

// ==========================================
// 보상 시스템 타입 (특허 청구항 5)
// ==========================================

export interface RewardResult {
  userId: string;
  questionId: string;
  processedAt: string;
  
  // 기본 보상 (특허 명시)
  basicRewards: {
    points: number;
    level: number;
    experience: number;
    virtualCoins: number;
    badges: Badge[];
  };
  
  // 파트너사 연동 보상 (특허 청구항 5)
  partnerIntegration: {
    subscriptionDiscounts: SubscriptionDiscount[];
    advertisingRewards: AdvertisingReward[];
    appIncentives: AppIncentive[];
  };
  
  // 동기 부여 요소
  motivationalElements: {
    streakBonus: number;
    achievementUnlocked: Achievement[];
    nextLevelProgress: number;   // 0-1
    socialComparison: SocialComparisonData;
  };
  
  // 학습 효과 추적
  learningImpact: {
    conceptMastery: number;      // 0-1
    retentionPrediction: number; // 0-1
    transferLearning: number;    // 0-1
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  associatedAchievement: string;
}

export interface SubscriptionDiscount {
  partnerAppId: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_trial_extension';
  discountValue: number;
  validUntil: string;
  terms: string[];
  usageLimit: number;
}

export interface AdvertisingReward {
  adProvider: string;
  rewardType: 'virtual_coins' | 'premium_content' | 'app_credits';
  rewardValue: number;
  earnedFor: string;           // what action earned this reward
  expiresAt: string;
}

export interface AppIncentive {
  sourceAppId: string;
  incentiveType: 'feature_unlock' | 'content_access' | 'priority_support';
  description: string;
  value: number;
  validUntil: string;
}

// ==========================================
// 시스템 개선 타입
// ==========================================

export interface SystemImprovementResult {
  updateTimestamp: string;
  modelVersion: string;
  
  // 개선 영역
  improvements: {
    questionGenerationAccuracy: number; // 0-1
    contextualRelevance: number;        // 0-1
    difficultyCalibration: number;      // 0-1
    userEngagement: number;             // 0-1
    learningEffectiveness: number;      // 0-1
  };
  
  // 하이브리드 AI 최적화 (청구항 2)
  hybridOptimization: {
    onDeviceTaskOptimization: TaskOptimization;
    cloudTaskOptimization: TaskOptimization;
    dataTransferOptimization: number;   // 0-1
    latencyImprovements: number;        // milliseconds reduced
  };
  
  // 다음 개선 일정
  nextImprovementSchedule: string;
}

export interface TaskOptimization {
  taskCategory: string;
  performanceImprovement: number; // 0-1
  accuracyImprovement: number;    // 0-1
  speedImprovement: number;       // 0-1
  resourceEfficiency: number;     // 0-1
}

// ==========================================
// 개인화 프로필 타입
// ==========================================

export interface PersonalizedLearningProfile {
  userId: string;
  createdAt: string;
  lastUpdated: string;
  
  // 기본 정보
  demographicInfo: {
    ageGroup: string;
    occupation: string;
    educationLevel: string;
    interests: string[];
    culturalBackground: string;
  };
  
  // 학습 특성
  learningCharacteristics: {
    preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    attentionSpan: number;       // minutes
    optimalSessionLength: number; // minutes
    preferredDifficulty: number; // 0-1
    motivationTriggers: string[];
  };
  
  // 성과 프로필
  performanceProfile: {
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
    masteryLevels: Record<string, number>; // subject -> mastery level
    learningVelocity: number;    // improvement rate
  };
  
  // 컨텍스트 선호도
  contextualPreferences: {
    preferredLearningTimes: number[];    // hours
    preferredLearningLocations: string[];
    preferredQuestionTypes: string[];
    avoidancePatterns: string[];
  };
}

// ==========================================
// 지원 타입들
// ==========================================

export interface LearningHistoryEntry {
  timestamp: string;
  activity: string;
  performance: number;         // 0-1
  context: string;
  outcome: string;
}

export interface PerformancePattern {
  pattern: string;
  frequency: number;
  context: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface EngagementTrend {
  period: string;
  averageEngagement: number;   // 0-1
  peakTimes: number[];         // hours
  dropOffPoints: string[];
}

export interface ImprovementArea {
  area: string;
  currentLevel: number;        // 0-1
  targetLevel: number;         // 0-1
  priority: number;            // 1-10
  timeframe: number;           // days
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  unlockedAt: string;
  prerequisites: string[];
  rewards: any[];
}

export interface SocialComparisonData {
  userRank: number;
  totalUsers: number;
  percentile: number;          // 0-100
  comparisonGroup: string;
  improvementSuggestions: string[];
}

export interface Milestone {
  id: string;
  description: string;
  targetDate: string;
  targetMetric: string;
  targetValue: number;
  currentProgress: number;     // 0-1
  achievable: boolean;
}

export interface SuccessMetric {
  metricName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  lastMeasured: string;
}

export type AccessMethod = 'lockscreen_widget' | 'in_app_review' | 'notification_reminder' | 'scheduled_popup';

console.log('🔐 LockScreen Types v1.0.0 로드 완료 - 특허 청구항 정확 타입 시스템');