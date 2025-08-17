/**
 * 💰 구독 수익화 타입 정의
 * SubscriptionManager를 위한 완전한 수익화 타입 시스템
 */

export interface SubscriptionTier {
  name: string;
  displayName: string;
  description: string;
  basePrice: number;
  currency: string;
  billingCycles: BillingCycle[];
  
  // 기능 제한
  features: TierFeature[];
  limits: TierLimits;
  
  // 타겟 사용자
  targetAudience: string[];
  
  // 마케팅 정보
  popularityRank: number;
  recommendedFor: string[];
  competitiveAdvantage: string[];
  
  // 업그레이드 경로
  upgradeIncentives: UpgradeIncentive[];
  downgradeProtections: DowngradeProtection[];
}

export interface TierFeature {
  featureId: string;
  name: string;
  description: string;
  included: boolean;
  limited?: boolean;
  limit?: number;
  overage?: OveragePolicy;
}

export interface TierLimits {
  questionsPerMonth: number;
  tutoringSessions: number;
  voiceMinutes: number;
  aiInteractions: number;
  storageGB: number;
  apiCallsPerDay: number;
  concurrentSessions: number;
  customization: 'none' | 'basic' | 'advanced' | 'unlimited';
}

export interface OveragePolicy {
  enabled: boolean;
  pricePerUnit: number;
  hardLimit?: number;
  warningThreshold: number; // percentage of limit
  gracePeriod?: number; // days
}

export interface UpgradeIncentive {
  triggerCondition: string;
  incentiveType: 'discount' | 'bonus_features' | 'extended_trial' | 'priority_support';
  value: number | string;
  validityPeriod: number; // days
  description: string;
}

export interface DowngradeProtection {
  protectionType: 'grandfathering' | 'temporary_retention' | 'feature_migration';
  duration: number; // days
  conditions: string[];
  migrationPath?: string;
}

export type BillingCycle = 'monthly' | 'quarterly' | 'annually' | 'lifetime';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer' | 'cryptocurrency';
  displayName: string;
  supportedRegions: string[];
  processingFee: number; // percentage
  processingTime: string; // e.g., "instant", "1-3 days"
  supportedCurrencies: string[];
  minimumAmount?: number;
  maximumAmount?: number;
}

export interface UsageMetrics {
  questionsGenerated: number;
  tutoringSessions: number;
  voiceInteractions: number;
  apiCalls: number;
  storageUsed: number; // GB
  lastActivity: string;
  
  // 세부 사용량
  detailed: {
    dailyUsage: DailyUsage[];
    featureUsage: FeatureUsage[];
    peakUsageTimes: number[]; // hours
    deviceBreakdown: DeviceUsage[];
    locationPatterns: LocationUsage[];
  };
  
  // 예측 사용량
  predicted: {
    nextMonthProjection: number;
    seasonalPatterns: SeasonalPattern[];
    growthTrend: 'increasing' | 'stable' | 'decreasing';
  };
}

export interface DailyUsage {
  date: string;
  questionsGenerated: number;
  sessionsCount: number;
  timeSpent: number; // minutes
  features: string[];
}

export interface FeatureUsage {
  featureId: string;
  usageCount: number;
  timeSpent: number;
  userSatisfaction: number;
  lastUsed: string;
}

export interface DeviceUsage {
  deviceType: string;
  usagePercentage: number;
  averageSessionDuration: number;
  preferredFeatures: string[];
}

export interface LocationUsage {
  location: string;
  usagePercentage: number;
  typicalActivities: string[];
  contextualPreferences: string[];
}

export interface SeasonalPattern {
  period: string;
  usageMultiplier: number;
  typicalFeatures: string[];
  adjustmentRecommendations: string[];
}

export interface PricingStrategy {
  type: 'value_based' | 'cost_plus' | 'competitive' | 'dynamic' | 'freemium';
  objectives: PricingObjective[];
  constraints: PricingConstraint[];
  optimization: PricingOptimization;
  
  // 시장 기반 요소
  marketFactors: MarketFactor[];
  competitorBenchmarks: CompetitorBenchmark[];
  
  // 고객 세분화
  customerSegments: CustomerSegment[];
  
  // 실험 및 조정
  experimentationFramework: ExperimentationConfig;
}

export interface PricingObjective {
  type: 'revenue_maximization' | 'market_penetration' | 'profit_maximization' | 'customer_acquisition';
  weight: number; // 0-1
  targetMetric: string;
  targetValue: number;
}

export interface PricingConstraint {
  type: 'minimum_price' | 'maximum_price' | 'competitor_parity' | 'cost_coverage';
  value: number;
  description: string;
  flexibility: number; // 0-1
}

export interface PricingOptimization {
  algorithm: 'genetic' | 'gradient_descent' | 'reinforcement_learning' | 'bayesian';
  updateFrequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
  learningRate: number;
  explorationRate: number; // for A/B testing
}

export interface MarketFactor {
  factor: string;
  impact: number; // -1 to 1
  confidence: number; // 0-1
  lastUpdated: string;
}

export interface CompetitorBenchmark {
  competitorName: string;
  similarTier: string;
  price: number;
  features: string[];
  marketPosition: string;
  lastUpdated: string;
}

export interface CustomerSegment {
  segmentId: string;
  name: string;
  characteristics: string[];
  size: number; // number of customers
  avgRevenue: number;
  churnRate: number;
  priceElasticity: number;
  preferredFeatures: string[];
}

export interface ExperimentationConfig {
  enableABTesting: boolean;
  testDuration: number; // days
  minimumSampleSize: number;
  significanceLevel: number; // e.g., 0.05
  conversionMetrics: string[];
}

// 이탈 예측 및 방지 타입들
export interface ChurnPrediction {
  userId: string;
  predictionDate: string;
  churnProbability: number; // 0-1
  churnTimeframe: string; // e.g., "within_30_days"
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // 이탈 요인
  riskFactors: ChurnRiskFactor[];
  
  // 보호 요인
  retentionFactors: RetentionFactor[];
  
  // 권장 조치
  recommendedActions: ChurnPreventionAction[];
  
  // 예측 신뢰도
  confidence: number;
  modelVersion: string;
}

export interface ChurnRiskFactor {
  factor: string;
  impact: number; // 0-1
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
  urgency: 'immediate' | 'soon' | 'monitor';
}

export interface RetentionFactor {
  factor: string;
  strength: number; // 0-1
  stability: 'very_stable' | 'stable' | 'somewhat_stable' | 'unstable';
  leverageOpportunity: string;
}

export interface ChurnPreventionAction {
  actionType: 'discount_offer' | 'feature_unlock' | 'personal_outreach' | 'usage_coaching' | 'plan_modification';
  priority: number; // 1-10
  description: string;
  expectedImpact: number; // 0-1
  cost: number;
  timeline: string;
  successCriteria: string[];
}

// 수익 최적화 타입들
export interface RevenueOptimization {
  currentMRR: number;
  targetMRR: number;
  optimizationAreas: OptimizationArea[];
  quickWins: QuickWin[];
  strategicInitiatives: StrategicInitiative[];
  riskFactors: RevenueRisk[];
}

export interface OptimizationArea {
  area: string;
  currentPerformance: number;
  targetPerformance: number;
  impactPotential: number; // expected revenue impact
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  timeToResult: number; // days
  requiredResources: string[];
}

export interface QuickWin {
  initiative: string;
  expectedRevenue: number;
  implementationTime: number; // days
  requiredEffort: 'low' | 'medium' | 'high';
  probability: number; // 0-1
  dependencies: string[];
}

export interface StrategicInitiative {
  name: string;
  description: string;
  expectedROI: number;
  timeframe: string;
  investmentRequired: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyMilestones: Milestone[];
}

export interface Milestone {
  name: string;
  targetDate: string;
  successCriteria: string[];
  dependencies: string[];
  riskMitigation: string[];
}

export interface RevenueRisk {
  risk: string;
  probability: number;
  impact: number; // revenue impact
  mitigation: string[];
  monitoring: string[];
}

// 고객 생애 가치 타입들
export interface CustomerLifetimeValue {
  userId: string;
  calculatedAt: string;
  currentCLV: number;
  projectedCLV: number;
  timeframe: string; // e.g., "36_months"
  
  // 구성 요소
  components: CLVComponent[];
  
  // 개선 기회
  improvementOpportunities: CLVImprovement[];
  
  // 비교 분석
  segmentComparison: SegmentCLVComparison;
}

export interface CLVComponent {
  component: 'base_subscription' | 'upgrades' | 'add_ons' | 'referrals' | 'partnership_revenue';
  currentValue: number;
  projectedValue: number;
  growthPotential: number;
}

export interface CLVImprovement {
  opportunity: string;
  potentialIncrease: number;
  probability: number;
  timeToRealize: number; // days
  requiredActions: string[];
}

export interface SegmentCLVComparison {
  userSegment: string;
  segmentAverageCLV: number;
  userRankInSegment: number; // percentile
  topPerformerCLV: number;
  improvementToTop: number;
}

console.log('💰 Subscription Types v1.0.0 로드 완료 - 완전한 수익화 타입 시스템');