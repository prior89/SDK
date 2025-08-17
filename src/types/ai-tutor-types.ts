/**
 * 🤖 AI 개인교사 타입 정의
 * PersonalTutorEngine을 위한 완전한 타입 시스템
 */

export interface LearningContext {
  timeOfDay: number;
  dayOfWeek: number;
  estimatedAvailableTime: number;
  learningEnvironment: 'home' | 'school' | 'office' | 'commute' | 'outdoor';
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'smart_speaker' | 'ar_glasses';
  previousActivity: string;
  moodIndicator: 'excited' | 'neutral' | 'tired' | 'stressed' | 'focused';
  energyLevel: 'high' | 'medium' | 'low';
  distractionLevel: 'none' | 'low' | 'medium' | 'high';
  suggestedDifficulty: number;
  preferredSubjects: string[];
  learningGoals: string[];
}

export interface TutorPersonality {
  name: string;
  communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional' | 'playful';
  teachingApproach: 'socratic' | 'direct' | 'discovery' | 'collaborative' | 'adaptive';
  emotionalTone: 'encouraging' | 'challenging' | 'supportive' | 'neutral' | 'enthusiastic';
  personalizationLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  expertise: string[];
  languageStyle: 'simple' | 'moderate' | 'advanced' | 'academic';
  patienceLevel: number; // 1-10
  humorUsage: boolean;
  strictnessLevel: number; // 1-10
}

export interface LearningSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  learningContext: LearningContext;
  learningPlan: PersonalizedLearningPlan;
  tutorPersonality: TutorPersonality;
  progress: SessionProgress;
  conversation: ConversationTurn[];
  currentQuestion?: AdaptiveQuestion;
  status: 'active' | 'paused' | 'completed' | 'interrupted';
  achievements: SessionAchievement[];
  feedback: SessionFeedback[];
}

export interface PersonalizedLearningPlan {
  sessionId: string;
  sessionDuration: number;
  focusAreas: FocusArea[];
  questionSequence: QuestionPlan[];
  breakPoints: BreakPoint[];
  difficultyProgression: DifficultyProgression[];
  personalizedGoals: LearningGoal[];
  adaptationPoints: AdaptationPoint[];
  successCriteria: SuccessCriteria;
}

export interface SessionProgress {
  totalQuestions: number;
  correctAnswers: number;
  partiallyCorrectAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  longestStreak: number;
  difficultyLevel: number;
  masteryLevel: number;
  engagementScore: number;
  timeSpent: number;
  conceptsLearned: string[];
  skillsImproved: string[];
}

export interface AdaptiveQuestion {
  id: string;
  text: string;
  correctAnswer: string;
  alternativeAnswers?: string[];
  hints: string[];
  explanation: string;
  category: string;
  subcategory: string;
  difficulty: number;
  estimatedTime: number;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  multimedia?: MultimediaContent;
  startTime: number;
  adaptationReason: string;
  personalizedElements: PersonalizationElement[];
}

export interface ConversationTurn {
  id: string;
  type: 'user_input' | 'tutor_response' | 'system_message' | 'question' | 'answer' | 'feedback';
  content: string;
  timestamp: string;
  metadata: {
    inputMethod: 'text' | 'voice' | 'gesture' | 'image';
    emotionalTone?: string;
    confidence?: number;
    processingTime?: number;
  };
  relatedQuestionId?: string;
  followUpActions?: string[];
}

export interface FocusArea {
  subject: string;
  topic: string;
  priority: number; // 1-10
  currentMasteryLevel: number; // 0-1
  targetMasteryLevel: number; // 0-1
  estimatedTimeToTarget: number; // minutes
  weaknessIndicators: string[];
  strengthIndicators: string[];
}

export interface QuestionPlan {
  questionType: 'concept_check' | 'application' | 'synthesis' | 'review';
  subject: string;
  difficulty: number;
  estimatedTime: number;
  order: number;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface BreakPoint {
  afterQuestionNumber: number;
  breakType: 'micro' | 'short' | 'medium' | 'long';
  suggestedDuration: number; // minutes
  activities: string[];
  refreshmentSuggestions: string[];
}

export interface DifficultyProgression {
  questionNumber: number;
  targetDifficulty: number;
  adjustmentReason: string;
  confidenceLevel: number;
}

export interface LearningGoal {
  id: string;
  description: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  measurableOutcome: string;
  progressMetrics: string[];
  motivationalFactors: string[];
}

export interface AdaptationPoint {
  trigger: string;
  adaptationType: 'difficulty' | 'style' | 'pace' | 'content';
  adjustmentMagnitude: number;
  reason: string;
}

export interface SuccessCriteria {
  minimumAccuracy: number;
  targetCompletionTime: number;
  requiredMasteryLevel: number;
  engagementThreshold: number;
  satisfactionTarget: number;
}

export interface SessionAchievement {
  id: string;
  type: 'streak' | 'mastery' | 'speed' | 'improvement' | 'consistency';
  title: string;
  description: string;
  earnedAt: string;
  points: number;
  badge?: string;
  shareableContent?: ShareableAchievement;
}

export interface SessionFeedback {
  id: string;
  type: 'immediate' | 'summary' | 'encouragement' | 'correction' | 'guidance';
  content: string;
  timestamp: string;
  targetedWeakness?: string;
  reinforcedStrength?: string;
  actionableAdvice: string[];
}

export interface MultimediaContent {
  type: 'image' | 'audio' | 'video' | 'interactive' | 'ar' | 'vr';
  url?: string;
  data?: any;
  description: string;
  accessibility: AccessibilityFeatures;
}

export interface PersonalizationElement {
  type: 'language_style' | 'cultural_reference' | 'interest_connection' | 'difficulty_adjustment';
  value: string;
  reason: string;
  effectiveness: number; // 0-1
}

export interface AccessibilityFeatures {
  altText?: string;
  audioDescription?: string;
  captions?: string;
  signLanguage?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
}

export interface ShareableAchievement {
  title: string;
  description: string;
  imageUrl: string;
  socialMediaText: string;
  hashtags: string[];
}

// 감정 및 인지 상태 타입들
export type EmotionalState = {
  primary: 'happy' | 'frustrated' | 'confused' | 'bored' | 'anxious' | 'confident' | 'curious' | 'overwhelmed';
  intensity: number; // 0-1
  secondary?: string[];
  confidence: number; // 0-1
  detectionMethod: 'voice_analysis' | 'text_analysis' | 'response_time' | 'user_reported';
  timestamp: string;
};

export type CognitiveState = {
  attentionLevel: number; // 0-1
  cognitiveLoad: number; // 0-1
  workingMemoryCapacity: number; // 0-1
  processingSpeed: number; // 0-1
  fatigue: number; // 0-1
  motivation: number; // 0-1
};

// 학습 분석 타입들
export interface LearningAnalysis {
  userId: string;
  analysisDate: string;
  overallPerformance: OverallPerformance;
  subjectBreakdown: SubjectPerformance[];
  learningPatterns: LearningPattern[];
  improvementAreas: ImprovementArea[];
  strengths: StrengthArea[];
  recommendations: LearningRecommendation[];
  predictedOutcomes: PredictedOutcome[];
}

export interface OverallPerformance {
  averageScore: number;
  consistencyScore: number;
  improvementRate: number;
  engagementLevel: number;
  retentionRate: number;
  masteryProgression: number;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  questionsAttempted: number;
  timeSpent: number;
  masteryLevel: number;
  difficultyProgression: number;
  commonMistakes: string[];
  breakthrough: BreakthroughMoment[];
}

export interface LearningPattern {
  patternType: 'temporal' | 'contextual' | 'cognitive' | 'behavioral';
  description: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

export interface ImprovementArea {
  area: string;
  currentLevel: number;
  targetLevel: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTimeToImprove: number; // days
  suggestedActions: string[];
  successProbability: number;
}

export interface StrengthArea {
  area: string;
  strengthLevel: number;
  consistency: number;
  leverageOpportunities: string[];
  advancementPath: string[];
}

export interface LearningRecommendation {
  type: 'immediate' | 'short_term' | 'long_term';
  priority: number;
  recommendation: string;
  expectedImpact: string;
  implementationSteps: string[];
  successMetrics: string[];
}

export interface PredictedOutcome {
  timeframe: '1_week' | '1_month' | '3_months' | '6_months' | '1_year';
  predictedScore: number;
  confidence: number;
  keyFactors: string[];
  assumptions: string[];
}

export interface BreakthroughMoment {
  timestamp: string;
  concept: string;
  description: string;
  impactLevel: 'minor' | 'moderate' | 'major' | 'transformative';
  followUpNeeded: boolean;
}

// 적응형 학습 타입들
export interface AdaptationStrategy {
  triggerConditions: AdaptationTrigger[];
  adaptationMethods: AdaptationMethod[];
  evaluationCriteria: EvaluationCriteria;
  rollbackConditions: RollbackCondition[];
}

export interface AdaptationTrigger {
  type: 'performance_drop' | 'boredom_detected' | 'mastery_achieved' | 'time_pressure' | 'confusion_level';
  threshold: number;
  consecutiveOccurrences: number;
}

export interface AdaptationMethod {
  method: 'difficulty_adjustment' | 'style_change' | 'pace_modification' | 'content_switch' | 'break_suggestion';
  parameters: Record<string, any>;
  expectedImpact: string;
}

export interface EvaluationCriteria {
  successMetrics: string[];
  improvementThreshold: number;
  evaluationPeriod: number; // minutes
  rollbackThreshold: number;
}

export interface RollbackCondition {
  condition: string;
  threshold: number;
  action: 'immediate_rollback' | 'gradual_adjustment' | 'user_confirmation';
}

console.log('🧠 AI Tutor Types v1.0.0 로드 완료 - 완전한 개인교사 타입 시스템');