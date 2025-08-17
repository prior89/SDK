/**
 * 🎧 음성 상호작용 매니저 - Phase 1 차별화 기능
 * AI 개인교사와 자연스러운 음성 대화 지원
 * 
 * 특허 기반: 멀티모달 학습 인터페이스 + 실시간 피드백
 */

import type { 
  VoiceConfig, 
  SpeechRecognitionResult, 
  VoiceSynthesisOptions,
  ConversationContext,
  EmotionalTone 
} from '../types/voice-types';

export interface VoiceInteractionConfig {
  // 음성 인식 설정
  speechRecognition: {
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    enableVoiceActivityDetection: boolean;
  };
  
  // 음성 합성 설정
  speechSynthesis: {
    voice: string;
    rate: number;          // 0.1 - 10 (말하기 속도)
    pitch: number;         // 0 - 2 (음성 높이)
    volume: number;        // 0 - 1 (볼륨)
    emotionalModulation: boolean;
  };
  
  // 대화 설정
  conversation: {
    maxTurnLength: number;
    contextMemorySize: number;
    enableSmallTalk: boolean;
    personalityConsistency: boolean;
  };
  
  // 학습 최적화
  learningOptimization: {
    pauseDetection: boolean;        // 사용자 말 끝 감지
    pronunciationCorrection: boolean; // 발음 교정
    grammarCorrection: boolean;     // 문법 교정
    vocabularyEnhancement: boolean; // 어휘 향상
  };
}

export class VoiceInteractionManager {
  private config: VoiceInteractionConfig;
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private conversationHistory: ConversationTurn[] = [];
  private currentEmotionalTone: EmotionalTone = 'neutral';
  
  // 웹 기반 API 지원
  private webSpeechSupported: boolean = false;
  private audioContext: AudioContext | null = null;
  
  constructor(config: VoiceInteractionConfig) {
    this.config = config;
    this.initializeVoiceAPIs();
    
    console.log('[VoiceManager] 음성 상호작용 매니저 초기화됨', {
      language: config.speechRecognition.language,
      voice: config.speechSynthesis.voice,
      emotionalModulation: config.speechSynthesis.emotionalModulation
    });
  }

  /**
   * 🎤 음성 인식 시작
   * 사용자의 음성을 실시간으로 인식하고 텍스트로 변환
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('[VoiceManager] 이미 음성 인식 중입니다');
      return;
    }

    try {
      if (this.webSpeechSupported && this.speechRecognition) {
        // 웹 브라우저 환경
        await this.startWebSpeechRecognition();
      } else {
        // Node.js 또는 React Native 환경
        await this.startNativeSpeechRecognition();
      }
      
      this.isListening = true;
      console.log('[VoiceManager] 음성 인식 시작됨');
      
    } catch (error) {
      console.error('[VoiceManager] 음성 인식 시작 실패:', error);
      throw new Error(`음성 인식을 시작할 수 없습니다: ${error.message}`);
    }
  }

  /**
   * 🔇 음성 인식 중지
   */
  async stopListening(): Promise<SpeechRecognitionResult | null> {
    if (!this.isListening) {
      return null;
    }

    try {
      let result: SpeechRecognitionResult | null = null;
      
      if (this.speechRecognition) {
        result = await this.stopWebSpeechRecognition();
      } else {
        result = await this.stopNativeSpeechRecognition();
      }
      
      this.isListening = false;
      console.log('[VoiceManager] 음성 인식 중지됨', {
        recognizedText: result?.transcript?.substring(0, 50) + '...',
        confidence: result?.confidence
      });
      
      return result;
      
    } catch (error) {
      console.error('[VoiceManager] 음성 인식 중지 실패:', error);
      this.isListening = false;
      return null;
    }
  }

  /**
   * 🗣️ 음성 합성 및 재생
   * AI 개인교사의 응답을 자연스러운 음성으로 변환
   */
  async speak(text: string, options?: VoiceSynthesisOptions): Promise<void> {
    if (this.isSpeaking) {
      await this.stopSpeaking(); // 기존 음성 중지
    }

    try {
      // 감정적 톤 적용
      const emotionallyModulatedText = this.applyEmotionalModulation(text);
      
      // 음성 합성 옵션 적용
      const synthesisOptions: VoiceSynthesisOptions = {
        voice: this.config.speechSynthesis.voice,
        rate: this.config.speechSynthesis.rate,
        pitch: this.config.speechSynthesis.pitch,
        volume: this.config.speechSynthesis.volume,
        emotionalTone: this.currentEmotionalTone,
        ...options
      };

      this.isSpeaking = true;
      
      if (typeof SpeechSynthesisUtterance !== 'undefined') {
        // 웹 브라우저 환경
        await this.speakWithWebAPI(emotionallyModulatedText, synthesisOptions);
      } else {
        // Node.js 또는 React Native 환경
        await this.speakWithNativeAPI(emotionallyModulatedText, synthesisOptions);
      }
      
      console.log('[VoiceManager] 음성 재생 완료', {
        textLength: text.length,
        emotionalTone: this.currentEmotionalTone,
        duration: synthesisOptions.rate ? text.length / synthesisOptions.rate * 100 : 'unknown'
      });
      
    } catch (error) {
      console.error('[VoiceManager] 음성 합성 실패:', error);
      throw new Error(`음성 합성을 할 수 없습니다: ${error.message}`);
    } finally {
      this.isSpeaking = false;
    }
  }

  /**
   * 🗣️ 음성 재생 중지
   */
  async stopSpeaking(): Promise<void> {
    if (!this.isSpeaking) {
      return;
    }

    try {
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      } else {
        // Native API 중지 로직
        await this.stopNativeSpeechSynthesis();
      }
      
      this.isSpeaking = false;
      console.log('[VoiceManager] 음성 재생 중지됨');
      
    } catch (error) {
      console.error('[VoiceManager] 음성 중지 실패:', error);
    }
  }

  /**
   * 💬 대화형 학습 세션
   * 음성 기반의 자연스러운 대화형 학습 진행
   */
  async startConversationalLearning(topic: string): Promise<ConversationSession> {
    console.log('[VoiceManager] 대화형 학습 세션 시작', { topic });

    // 대화 컨텍스트 초기화
    const conversationContext: ConversationContext = {
      topic,
      startTime: new Date().toISOString(),
      participantProfile: this.getCurrentUserProfile(),
      learningObjectives: await this.generateLearningObjectives(topic),
      conversationStyle: this.determineConversationStyle(),
      emotionalBaseline: await this.establishEmotionalBaseline()
    };

    // 개방형 질문으로 시작
    const openingQuestion = await this.generateOpeningQuestion(conversationContext);
    
    // 음성으로 질문 제시
    await this.speak(openingQuestion.text, {
      emotionalTone: 'encouraging',
      rate: 0.9, // 약간 느리게 (이해도 향상)
      pitch: 1.1 // 약간 높게 (친근함)
    });

    const session: ConversationSession = {
      id: this.generateConversationId(),
      context: conversationContext,
      currentQuestion: openingQuestion,
      turns: [],
      status: 'active',
      startTime: new Date().toISOString()
    };

    // 음성 인식 시작
    await this.startListening();

    return session;
  }

  /**
   * 🎯 실시간 발음 교정
   * 사용자의 발음을 실시간으로 분석하고 교정 제안
   */
  async providePronunciationCorrection(
    targetText: string, 
    userAudio: AudioData
  ): Promise<PronunciationFeedback> {
    
    if (!this.config.learningOptimization.pronunciationCorrection) {
      return { needsCorrection: false, score: 1.0 };
    }

    try {
      // 음성 데이터 전처리
      const processedAudio = await this.preprocessAudioData(userAudio);
      
      // 발음 분석 (음성학적 특징 추출)
      const phoneticAnalysis = await this.analyzePhoneticFeatures(processedAudio, targetText);
      
      // 발음 정확도 계산
      const pronunciationScore = this.calculatePronunciationScore(phoneticAnalysis);
      
      // 개별 음소 분석
      const phonemeAnalysis = await this.analyzeIndividualPhonemes(phoneticAnalysis, targetText);
      
      // 교정 제안 생성
      const correctionSuggestions = this.generateCorrectionSuggestions(phonemeAnalysis);
      
      // 연습 문장 생성
      const practiceSentences = await this.generatePracticeSentences(phonemeAnalysis.weakPhonemes);

      const feedback: PronunciationFeedback = {
        needsCorrection: pronunciationScore < 0.8,
        score: pronunciationScore,
        overallFeedback: this.generateOverallFeedback(pronunciationScore),
        
        // 상세 분석
        phoneticAnalysis: {
          accuracy: phoneticAnalysis.accuracy,
          clarity: phoneticAnalysis.clarity,
          fluency: phoneticAnalysis.fluency,
          intonation: phoneticAnalysis.intonation
        },
        
        // 개별 음소 피드백
        phonemeResults: phonemeAnalysis.results,
        
        // 개선 제안
        correctionSuggestions,
        practiceSentences,
        
        // 시각적 피드백
        visualFeedback: {
          waveformComparison: this.generateWaveformComparison(processedAudio, targetText),
          spectrogramAnalysis: this.generateSpectrogramAnalysis(processedAudio),
          articulationGuide: this.generateArticulationGuide(correctionSuggestions)
        }
      };

      console.log('[VoiceManager] 발음 교정 분석 완료', {
        score: pronunciationScore,
        needsCorrection: feedback.needsCorrection,
        weakPhonemes: phonemeAnalysis.weakPhonemes?.length || 0
      });

      return feedback;
      
    } catch (error) {
      console.error('[VoiceManager] 발음 분석 실패:', error);
      
      // 기본 피드백 반환
      return {
        needsCorrection: false,
        score: 0.5,
        overallFeedback: '발음 분석 중 문제가 발생했습니다. 다시 시도해 주세요.',
        error: error.message
      };
    }
  }

  /**
   * 🎭 감정 기반 음성 조정
   * 사용자의 감정 상태에 따라 AI 교사의 음성 톤 조정
   */
  async adjustVoiceForEmotion(detectedEmotion: EmotionalTone): Promise<VoiceAdjustment> {
    this.currentEmotionalTone = detectedEmotion;
    
    const voiceAdjustment: VoiceAdjustment = {
      originalTone: this.currentEmotionalTone,
      adjustedTone: detectedEmotion,
      adjustmentReason: this.explainAdjustmentReason(detectedEmotion),
      
      // 음성 파라미터 조정
      voiceParameters: this.calculateVoiceParameters(detectedEmotion),
      
      // 대화 스타일 조정
      conversationStyleAdjustment: this.adjustConversationStyle(detectedEmotion),
      
      // 학습 접근법 조정
      teachingApproachModification: this.modifyTeachingApproach(detectedEmotion)
    };

    console.log('[VoiceManager] 감정 기반 음성 조정', {
      from: voiceAdjustment.originalTone,
      to: voiceAdjustment.adjustedTone,
      reason: voiceAdjustment.adjustmentReason
    });

    return voiceAdjustment;
  }

  /**
   * 🎵 실시간 대화 흐름 관리
   * 자연스러운 대화 흐름을 위한 턴 테이킹 관리
   */
  async manageConversationFlow(): Promise<ConversationFlowState> {
    const flowState: ConversationFlowState = {
      currentTurn: this.determineTurnTaker(),
      waitingForResponse: this.isWaitingForUserResponse(),
      conversationPace: this.calculateConversationPace(),
      
      // 대화 품질 지표
      engagement: this.measureEngagementLevel(),
      understanding: this.assessMutualUnderstanding(),
      progress: this.trackLearningProgress(),
      
      // 다음 액션 제안
      suggestedActions: this.suggestNextActions(),
      
      // 대화 조정 필요성
      needsAdjustment: this.needsConversationAdjustment(),
      adjustmentSuggestions: this.generateAdjustmentSuggestions()
    };

    // 필요시 대화 흐름 자동 조정
    if (flowState.needsAdjustment) {
      await this.implementFlowAdjustments(flowState.adjustmentSuggestions);
    }

    return flowState;
  }

  /**
   * 📚 음성 기반 오답 분석
   * 음성으로 답변한 내용을 분석하여 오답 패턴 도출
   */
  async analyzeVoiceAnswerPatterns(voiceAnswers: VoiceAnswer[]): Promise<VoiceAnswerAnalysis> {
    const analysis: VoiceAnswerAnalysis = {
      // 언어적 패턴
      linguisticPatterns: {
        vocabularyLevel: this.assessVocabularyLevel(voiceAnswers),
        grammarComplexity: this.analyzeGrammarComplexity(voiceAnswers),
        speechFluency: this.measureSpeechFluency(voiceAnswers),
        hesitationPatterns: this.detectHesitationPatterns(voiceAnswers)
      },
      
      // 음성학적 특성
      phoneticCharacteristics: {
        articulationClarity: this.analyzeArticulationClarity(voiceAnswers),
        pronunciationConsistency: this.measurePronunciationConsistency(voiceAnswers),
        accentAnalysis: await this.analyzeAccentPattern(voiceAnswers),
        speechRhythm: this.analyzeSpeechRhythm(voiceAnswers)
      },
      
      // 학습 패턴
      learningPatterns: {
        conceptualUnderstanding: this.assessConceptualUnderstanding(voiceAnswers),
        problemSolvingApproach: this.analyzeProblemSolvingApproach(voiceAnswers),
        metacognitiveAwareness: this.assessMetacognitiveAwareness(voiceAnswers),
        learningStrategies: this.identifyLearningStrategies(voiceAnswers)
      },
      
      // 개선 권장사항
      improvementAreas: this.identifyImprovementAreas(voiceAnswers),
      personalizedExercises: await this.generatePersonalizedExercises(voiceAnswers),
      
      // 진행 상황
      progressMetrics: {
        improvementRate: this.calculateImprovementRate(voiceAnswers),
        consistencyScore: this.calculateConsistencyScore(voiceAnswers),
        confidenceLevel: this.assessConfidenceLevel(voiceAnswers)
      }
    };

    console.log('[VoiceManager] 음성 답변 패턴 분석 완료', {
      totalAnswers: voiceAnswers.length,
      vocabularyLevel: analysis.linguisticPatterns.vocabularyLevel,
      improvementAreas: analysis.improvementAreas.length
    });

    return analysis;
  }

  /**
   * 🎪 인터랙티브 음성 학습 게임
   * 게이미피케이션과 음성을 결합한 재미있는 학습 경험
   */
  async launchVoiceLearningGame(gameType: VoiceLearningGameType): Promise<VoiceGameSession> {
    const gameSession: VoiceGameSession = {
      id: this.generateGameSessionId(),
      type: gameType,
      startTime: new Date().toISOString(),
      rules: this.getGameRules(gameType),
      scoring: this.initializeScoring(gameType),
      currentRound: 1,
      totalRounds: this.config.conversation.maxTurnLength || 10,
      playerProgress: {
        score: 0,
        streak: 0,
        achievements: []
      }
    };

    // 게임 타입별 특별 설정
    switch (gameType) {
      case 'pronunciation-race':
        gameSession.specialFeatures = await this.setupPronunciationRace();
        break;
        
      case 'vocabulary-battle':
        gameSession.specialFeatures = await this.setupVocabularyBattle();
        break;
        
      case 'grammar-quest':
        gameSession.specialFeatures = await this.setupGrammarQuest();
        break;
        
      case 'story-telling':
        gameSession.specialFeatures = await this.setupStoryTelling();
        break;
    }

    // 게임 시작 안내 음성
    const gameIntro = this.generateGameIntroduction(gameSession);
    await this.speak(gameIntro, {
      emotionalTone: 'exciting',
      rate: 1.2,
      pitch: 1.3
    });

    console.log('[VoiceManager] 음성 학습 게임 시작', {
      gameType,
      sessionId: gameSession.id,
      totalRounds: gameSession.totalRounds
    });

    return gameSession;
  }

  /**
   * 🧠 음성 기반 학습 효과 측정
   * 음성 학습의 효과를 다차원으로 분석
   */
  async measureVoiceLearningEffectiveness(): Promise<VoiceLearningEffectiveness> {
    const recentSessions = this.getRecentVoiceSessions();
    
    if (recentSessions.length === 0) {
      throw new Error('분석할 음성 학습 세션이 없습니다.');
    }

    const effectiveness: VoiceLearningEffectiveness = {
      // 학습 성과 지표
      learningOutcomes: {
        knowledgeRetention: await this.measureKnowledgeRetention(recentSessions),
        skillImprovement: this.measureSkillImprovement(recentSessions),
        conceptualUnderstanding: this.assessConceptualGrowth(recentSessions),
        applicationAbility: this.evaluateApplicationSkills(recentSessions)
      },
      
      // 참여도 지표
      engagementMetrics: {
        sessionDuration: this.calculateAverageSessionDuration(recentSessions),
        interactionFrequency: this.measureInteractionFrequency(recentSessions),
        voluntaryParticipation: this.assessVoluntaryParticipation(recentSessions),
        emotionalEngagement: this.measureEmotionalEngagement(recentSessions)
      },
      
      // 음성 특화 지표
      voiceSpecificMetrics: {
        pronunciationImprovement: this.trackPronunciationProgress(recentSessions),
        speechConfidence: this.measureSpeechConfidence(recentSessions),
        listeningComprehension: this.assessListeningSkills(recentSessions),
        conversationalFluency: this.evaluateConversationalFluency(recentSessions)
      },
      
      // 개인화 효과
      personalizationEffectiveness: {
        adaptationAccuracy: this.measureAdaptationAccuracy(recentSessions),
        userSatisfaction: this.estimateUserSatisfaction(recentSessions),
        learningPreferenceAlignment: this.assessPreferenceAlignment(recentSessions)
      },
      
      // 비교 분석 (음성 vs 텍스트)
      comparativeAnalysis: {
        voiceVsTextRetention: await this.compareVoiceVsTextRetention(),
        engagementDifference: this.compareEngagementLevels(),
        learningSpeedComparison: this.compareLearningSpeed()
      }
    };

    console.log('[VoiceManager] 음성 학습 효과 분석 완료', {
      sessionsAnalyzed: recentSessions.length,
      overallEffectiveness: this.calculateOverallEffectiveness(effectiveness),
      recommendsContinuation: effectiveness.learningOutcomes.knowledgeRetention > 0.7
    });

    return effectiveness;
  }

  // ==========================================
  // 내부 구현 메서드들 (실제 구현에서는 상세화 필요)
  // ==========================================

  private initializeVoiceAPIs(): void {
    // 브라우저 환경 체크
    if (typeof window !== 'undefined') {
      this.webSpeechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      
      if (this.webSpeechSupported) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.speechRecognition = new SpeechRecognition();
        this.setupSpeechRecognition();
      }
      
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
      }
    }
    
    // 오디오 컨텍스트 초기화
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  }

  private setupSpeechRecognition(): void {
    if (!this.speechRecognition) return;

    this.speechRecognition.continuous = this.config.speechRecognition.continuous;
    this.speechRecognition.interimResults = this.config.speechRecognition.interimResults;
    this.speechRecognition.lang = this.config.speechRecognition.language;
    this.speechRecognition.maxAlternatives = this.config.speechRecognition.maxAlternatives;

    // 이벤트 핸들러 설정
    this.speechRecognition.onresult = this.handleSpeechRecognitionResult.bind(this);
    this.speechRecognition.onerror = this.handleSpeechRecognitionError.bind(this);
    this.speechRecognition.onend = this.handleSpeechRecognitionEnd.bind(this);
  }

  private handleSpeechRecognitionResult(event: SpeechRecognitionEvent): void {
    // 음성 인식 결과 처리
    const results = Array.from(event.results);
    const transcript = results.map(result => result[0].transcript).join(' ');
    const confidence = results.reduce((acc, result) => acc + result[0].confidence, 0) / results.length;

    console.log('[VoiceManager] 음성 인식됨', {
      transcript: transcript.substring(0, 100) + '...',
      confidence: Math.round(confidence * 100) + '%'
    });

    // 결과를 대화 히스토리에 추가
    this.conversationHistory.push({
      type: 'user_speech',
      transcript,
      confidence,
      timestamp: new Date().toISOString()
    });
  }

  private handleSpeechRecognitionError(event: SpeechRecognitionErrorEvent): void {
    console.error('[VoiceManager] 음성 인식 오류:', event.error);
    this.isListening = false;
  }

  private handleSpeechRecognitionEnd(): void {
    console.log('[VoiceManager] 음성 인식 종료됨');
    this.isListening = false;
  }

  // 플랫폼별 구현 메서드들 (스텁)
  private async startWebSpeechRecognition(): Promise<void> { /* Web API 구현 */ }
  private async startNativeSpeechRecognition(): Promise<void> { /* Native API 구현 */ }
  private async stopWebSpeechRecognition(): Promise<SpeechRecognitionResult | null> { return null; }
  private async stopNativeSpeechRecognition(): Promise<SpeechRecognitionResult | null> { return null; }
  private async speakWithWebAPI(text: string, options: VoiceSynthesisOptions): Promise<void> { /* 구현 */ }
  private async speakWithNativeAPI(text: string, options: VoiceSynthesisOptions): Promise<void> { /* 구현 */ }
  private async stopNativeSpeechSynthesis(): Promise<void> { /* 구현 */ }

  // 기타 헬퍼 메서드들 (스텁 - 실제 구현에서 상세화)
  private applyEmotionalModulation(text: string): string { return text; }
  private getCurrentUserProfile(): any { return {}; }
  private async generateLearningObjectives(topic: string): Promise<string[]> { return []; }
  private determineConversationStyle(): string { return 'friendly'; }
  private async establishEmotionalBaseline(): Promise<any> { return {}; }
  private async generateOpeningQuestion(context: ConversationContext): Promise<any> { return { text: 'Hello!' }; }
  private generateConversationId(): string { return `conv_${Date.now()}`; }
  private generateGameSessionId(): string { return `game_${Date.now()}`; }
  private getGameRules(gameType: VoiceLearningGameType): any { return {}; }
  private initializeScoring(gameType: VoiceLearningGameType): any { return {}; }
  private async setupPronunciationRace(): Promise<any> { return {}; }
  private async setupVocabularyBattle(): Promise<any> { return {}; }
  private async setupGrammarQuest(): Promise<any> { return {}; }
  private async setupStoryTelling(): Promise<any> { return {}; }
  private generateGameIntroduction(session: VoiceGameSession): string { return 'Let\'s play!'; }
  private getRecentVoiceSessions(): any[] { return []; }
  private async measureKnowledgeRetention(sessions: any[]): Promise<number> { return 0.8; }
  private calculateOverallEffectiveness(effectiveness: VoiceLearningEffectiveness): number { return 0.85; }
  
  // 더 많은 헬퍼 메서드들...
}

// ==========================================
// 타입 정의들
// ==========================================

interface ConversationTurn {
  type: 'user_speech' | 'tutor_response' | 'system_message';
  transcript?: string;
  confidence?: number;
  timestamp: string;
}

interface VoiceAdjustment {
  originalTone: EmotionalTone;
  adjustedTone: EmotionalTone;
  adjustmentReason: string;
  voiceParameters: any;
  conversationStyleAdjustment: any;
  teachingApproachModification: any;
}

interface ConversationFlowState {
  currentTurn: 'user' | 'tutor' | 'system';
  waitingForResponse: boolean;
  conversationPace: number;
  engagement: number;
  understanding: number;
  progress: number;
  suggestedActions: string[];
  needsAdjustment: boolean;
  adjustmentSuggestions: string[];
}

interface VoiceAnswer {
  questionId: string;
  audioData: AudioData;
  transcript: string;
  confidence: number;
  timestamp: string;
}

interface AudioData {
  buffer: ArrayBuffer;
  sampleRate: number;
  duration: number;
}

interface PronunciationFeedback {
  needsCorrection: boolean;
  score: number;
  overallFeedback: string;
  phoneticAnalysis?: any;
  phonemeResults?: any[];
  correctionSuggestions?: string[];
  practiceSentences?: string[];
  visualFeedback?: any;
  error?: string;
}

interface VoiceAnswerAnalysis {
  linguisticPatterns: any;
  phoneticCharacteristics: any;
  learningPatterns: any;
  improvementAreas: string[];
  personalizedExercises: any[];
  progressMetrics: any;
}

interface ConversationSession {
  id: string;
  context: ConversationContext;
  currentQuestion: any;
  turns: any[];
  status: string;
  startTime: string;
}

interface VoiceGameSession {
  id: string;
  type: VoiceLearningGameType;
  startTime: string;
  rules: any;
  scoring: any;
  currentRound: number;
  totalRounds: number;
  playerProgress: any;
  specialFeatures?: any;
}

interface VoiceLearningEffectiveness {
  learningOutcomes: any;
  engagementMetrics: any;
  voiceSpecificMetrics: any;
  personalizationEffectiveness: any;
  comparativeAnalysis: any;
}

type VoiceLearningGameType = 'pronunciation-race' | 'vocabulary-battle' | 'grammar-quest' | 'story-telling';

console.log('🎧 VoiceInteractionManager v1.0.0 로드 완료 - 차별화 음성 학습 시스템');