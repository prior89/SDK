/**
 * 🎧 음성 상호작용 타입 정의
 * VoiceInteractionManager를 위한 완전한 음성 처리 타입 시스템
 */

export interface VoiceConfig {
  language: string;
  dialect?: string;
  voiceId?: string;
  quality: 'standard' | 'premium' | 'neural';
  streamingEnabled: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives?: AlternativeTranscript[];
  isFinal: boolean;
  speechDuration: number;
  processingTime: number;
  languageDetected?: string;
  noiseLevel?: number;
}

export interface AlternativeTranscript {
  transcript: string;
  confidence: number;
}

export interface VoiceSynthesisOptions {
  voice?: string;
  rate?: number;          // 0.1 - 3.0
  pitch?: number;         // 0.0 - 2.0  
  volume?: number;        // 0.0 - 1.0
  emotionalTone?: EmotionalTone;
  emphasis?: EmphasisPattern[];
  pausePattern?: PausePattern[];
  pronunciation?: PronunciationGuide[];
}

export type EmotionalTone = 
  | 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' 
  | 'calm' | 'urgent' | 'mysterious' | 'confident' 
  | 'encouraging' | 'sympathetic' | 'professional';

export interface EmphasisPattern {
  startIndex: number;
  endIndex: number;
  type: 'stress' | 'volume' | 'pitch' | 'duration';
  intensity: number; // 0-1
}

export interface PausePattern {
  afterWordIndex: number;
  duration: number; // milliseconds
  type: 'breath' | 'dramatic' | 'thinking' | 'emphasis';
}

export interface PronunciationGuide {
  word: string;
  phonetic: string; // IPA notation
  alternativePronunciations?: string[];
  emphasis?: 'primary' | 'secondary';
}

export interface ConversationContext {
  topic: string;
  startTime: string;
  participantProfile: UserProfile;
  learningObjectives: string[];
  conversationStyle: ConversationStyle;
  emotionalBaseline: EmotionalBaseline;
  contextualCues: ContextualCue[];
  conversationHistory: ConversationSummary[];
}

export interface ConversationStyle {
  formality: 'very_formal' | 'formal' | 'neutral' | 'casual' | 'very_casual';
  interactivity: 'lecture' | 'guided' | 'socratic' | 'collaborative' | 'free_form';
  pacing: 'slow' | 'moderate' | 'fast' | 'user_controlled';
  feedback_frequency: 'immediate' | 'after_question' | 'periodic' | 'on_demand';
}

export interface EmotionalBaseline {
  dominantEmotion: EmotionalTone;
  emotionalStability: number; // 0-1
  responsiveness: number; // 0-1
  preferredTone: EmotionalTone;
  triggerWords: string[]; // words that affect emotion
  avoidanceWords: string[]; // words to avoid
}

export interface ContextualCue {
  type: 'environmental' | 'temporal' | 'social' | 'technical';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  adaptationSuggestion: string;
}

export interface ConversationSummary {
  date: string;
  topic: string;
  duration: number;
  outcomes: string[];
  userSatisfaction: number;
  tutorEffectiveness: number;
}

// 음성 학습 게임 타입들
export interface VoiceGameConfig {
  gameType: VoiceLearningGameType;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  playerCount: 1 | 2 | number; // multiplayer support
  competitiveMode: boolean;
  realTimeScoring: boolean;
}

export type VoiceLearningGameType = 
  | 'pronunciation_race' 
  | 'vocabulary_battle' 
  | 'grammar_quest' 
  | 'story_telling'
  | 'accent_challenge'
  | 'speed_reading'
  | 'listening_comprehension'
  | 'conversation_flow';

export interface VoiceGameSession {
  id: string;
  config: VoiceGameConfig;
  players: GamePlayer[];
  currentRound: number;
  totalRounds: number;
  startTime: string;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';
  scoring: GameScoring;
  leaderboard: PlayerScore[];
  gameEvents: GameEvent[];
}

export interface GamePlayer {
  userId: string;
  displayName: string;
  avatar?: string;
  currentScore: number;
  streak: number;
  powerUps: PowerUp[];
  achievements: GameAchievement[];
}

export interface GameScoring {
  scoreType: 'accuracy' | 'speed' | 'creativity' | 'comprehensive';
  maxPointsPerQuestion: number;
  bonusMultipliers: BonusMultiplier[];
  penaltyRules: PenaltyRule[];
}

export interface PlayerScore {
  userId: string;
  score: number;
  rank: number;
  breakdown: ScoreBreakdown;
  badges: string[];
}

export interface ScoreBreakdown {
  basePoints: number;
  accuracyBonus: number;
  speedBonus: number;
  creativityBonus: number;
  streakBonus: number;
  penalties: number;
}

export interface GameEvent {
  id: string;
  type: 'question_start' | 'answer_submitted' | 'score_update' | 'achievement_unlocked' | 'power_up_used';
  timestamp: string;
  playerId?: string;
  data: any;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  effect: string;
  duration?: number; // seconds
  cooldown?: number; // seconds
  usageCount: number;
  maxUsage?: number;
}

export interface GameAchievement {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  gameType: VoiceLearningGameType;
  criteria: string[];
}

export interface BonusMultiplier {
  condition: string;
  multiplier: number;
  description: string;
}

export interface PenaltyRule {
  violation: string;
  penalty: number;
  description: string;
}

// 발음 분석 타입들
export interface PronunciationAnalysis {
  overallScore: number; // 0-1
  phoneticAccuracy: number;
  fluency: number;
  clarity: number;
  intonation: number;
  rhythm: number;
  stress: number;
  weakPhonemes: WeakPhoneme[];
  improvementAreas: string[];
  nativeComparison: NativeComparison;
}

export interface WeakPhoneme {
  phoneme: string; // IPA notation
  accuracy: number;
  frequency: number; // how often it appears
  improvementPotential: number;
  practiceWords: string[];
  articulationTips: string[];
}

export interface NativeComparison {
  similarity: number; // 0-1
  accent: string;
  dialectVariation: string;
  characteristicFeatures: string[];
  deviationAreas: string[];
}

// 음성 감정 분석 타입들
export interface VoiceEmotionAnalysis {
  dominantEmotion: EmotionalTone;
  emotionConfidence: number;
  emotionIntensity: number;
  emotionalStability: number;
  voiceCharacteristics: VoiceCharacteristics;
  stressIndicators: StressIndicator[];
  energyLevel: number;
  engagementLevel: number;
}

export interface VoiceCharacteristics {
  fundamentalFrequency: number; // Hz
  pitch: number;
  volume: number;
  speechRate: number; // words per minute
  pauseFrequency: number;
  tremor: number;
  breathiness: number;
  hoarseness: number;
}

export interface StressIndicator {
  type: 'vocal_strain' | 'rapid_speech' | 'frequent_pauses' | 'volume_fluctuation';
  intensity: number;
  confidence: number;
  recommendations: string[];
}

// 대화 흐름 관리 타입들
export interface ConversationFlow {
  currentPhase: ConversationPhase;
  nextPhase: ConversationPhase;
  transitionTriggers: TransitionTrigger[];
  flowControl: FlowControl;
  adaptationHistory: FlowAdaptation[];
}

export type ConversationPhase = 
  | 'opening' | 'warming_up' | 'main_learning' 
  | 'deep_dive' | 'practice' | 'review' 
  | 'wrap_up' | 'closing' | 'emergency_support';

export interface TransitionTrigger {
  condition: string;
  threshold: number;
  targetPhase: ConversationPhase;
  priority: number;
}

export interface FlowControl {
  allowUserControl: boolean;
  automaticProgression: boolean;
  timeBasedTransitions: boolean;
  performanceBasedTransitions: boolean;
  emotionBasedTransitions: boolean;
}

export interface FlowAdaptation {
  timestamp: string;
  fromPhase: ConversationPhase;
  toPhase: ConversationPhase;
  reason: string;
  effectiveness: number;
}

// 사용자 프로필 확장 (음성 학습용)
export interface VoiceLearningProfile extends UserProfile {
  voicePreferences: VoicePreferences;
  speechPatterns: SpeechPattern;
  learningHistory: VoiceLearningHistory;
  accessibility: VoiceAccessibilityNeeds;
}

export interface VoicePreferences {
  preferredVoiceGender: 'male' | 'female' | 'neutral' | 'no_preference';
  preferredAccent: string;
  speechRate: 'slow' | 'normal' | 'fast';
  volumePreference: 'quiet' | 'normal' | 'loud';
  backgroundNoiseTolerance: number;
  multitaskingWhileLearning: boolean;
}

export interface SpeechPattern {
  averageResponseTime: number;
  speechClarity: number;
  vocabularyLevel: string;
  grammarComplexity: string;
  conversationStyle: string;
  preferredQuestionTypes: string[];
}

export interface VoiceLearningHistory {
  totalVoiceSessions: number;
  totalSpeechTime: number; // minutes
  averageSessionDuration: number;
  preferredSessionTimes: number[]; // hours of day
  mostEffectiveFormats: string[];
  improvementAreas: string[];
}

export interface VoiceAccessibilityNeeds {
  hearingImpairment: boolean;
  speechImpairment: boolean;
  visualCaptions: boolean;
  signLanguageSupport: boolean;
  slowSpeechMode: boolean;
  highContrastVisuals: boolean;
}

console.log('🎧 Voice Types v1.0.0 로드 완료 - 완전한 음성 학습 타입 시스템');