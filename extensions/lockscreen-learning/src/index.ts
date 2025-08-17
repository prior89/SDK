/**
 * LockLearn LockScreen Learning Extension
 * 특허 청구항 직접 구현: 잠금화면 학습 인터페이스 및 동적 문제 생성
 */

import type { LockLearnClient, WrongAnswer } from '@locklearn/partner-sdk';

// 플랫폼별 타입 정의
export interface LockScreenConfig {
  enabled: boolean;
  platform: 'android' | 'ios' | 'web';
  widgetEnabled: boolean;
  notificationEnabled: boolean;
  microSessionDuration: number; // seconds
  dailyQuestionLimit: number;
  keyguardDismissOnCorrect: boolean; // 특허 핵심 기능
}

export interface QuizWidget {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  estimatedTime: number; // seconds
  context: LearningContext;
}

export interface LearningContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userState: 'unlock-attempt' | 'notification-check' | 'idle';
  previousAnswers: Array<{
    questionId: string;
    correct: boolean;
    timestamp: string;
  }>;
}

export interface DynamicQuestionGenerator {
  generateQuiz(context: LearningContext): Promise<QuizWidget>;
  adjustDifficulty(userId: string, performance: number): Promise<void>;
  getPersonalizedContent(userId: string): Promise<QuizWidget[]>;
}

// Android 16 위젯 인터페이스
export interface AndroidWidgetProvider {
  createLockScreenWidget(quiz: QuizWidget): Promise<AndroidWidget>;
  updateWidget(widgetId: string, content: any): Promise<void>;
  removeWidget(widgetId: string): Promise<void>;
}

export interface AndroidWidget {
  id: string;
  size: { width: number; height: number };
  content: {
    question: string;
    buttons: Array<{ text: string; action: string }>;
  };
}

// iOS Live Activities 인터페이스  
export interface iOSLiveActivity {
  activityId: string;
  contentState: {
    question: string;
    options: string[];
    progress: number;
  };
  dismissalPolicy: 'automatic' | 'manual';
}

// 메인 플러그인 클래스
export class LockScreenLearningPlugin {
  public readonly name = 'lockscreen-learning';
  public readonly version = '1.0.0';
  
  private client!: LockLearnClient;
  private config: LockScreenConfig;
  private questionGenerator: DynamicQuestionGenerator;
  private platformProvider: AndroidWidgetProvider | null = null;
  private activeWidgets = new Map<string, QuizWidget>();

  constructor(config: Partial<LockScreenConfig> = {}) {
    this.config = {
      enabled: true,
      platform: this.detectPlatform(),
      widgetEnabled: true,
      notificationEnabled: true,
      microSessionDuration: 30,
      dailyQuestionLimit: 50,
      keyguardDismissOnCorrect: true, // 특허 구현
      ...config
    };
    
    this.questionGenerator = new SmartQuestionGenerator();
    this.initializePlatformProvider();
  }

  public install(client: LockLearnClient): void {
    this.client = client;
    
    // SDK에 잠금화면 학습 메서드 추가
    (client as any).startLockScreenLearning = this.startLockScreenLearning.bind(this);
    (client as any).stopLockScreenLearning = this.stopLockScreenLearning.bind(this);
    (client as any).showQuizWidget = this.showQuizWidget.bind(this);
    (client as any).handleWidgetAnswer = this.handleWidgetAnswer.bind(this);
    
    console.log('[LL LockScreen] Extension installed');
    
    if (this.config.enabled) {
      this.startLockScreenLearning();
    }
  }

  public uninstall?(client: LockLearnClient): void {
    this.stopLockScreenLearning();
    console.log('[LL LockScreen] Extension uninstalled');
  }

  /**
   * 특허 청구항 1: 잠금화면에서 학습 문제 제시 시작
   */
  public async startLockScreenLearning(): Promise<void> {
    if (!this.config.enabled) return;
    
    console.log('[LL LockScreen] Starting lockscreen learning');
    
    // 플랫폼별 초기화
    if (this.config.platform === 'android') {
      await this.initializeAndroidWidgets();
    } else if (this.config.platform === 'ios') {
      await this.initializeiOSLiveActivities();
    }
    
    // 잠금 이벤트 리스너 등록
    this.registerLockScreenEvents();
    
    // 첫 번째 퀴즈 표시
    await this.showNextQuiz();
  }

  public async stopLockScreenLearning(): Promise<void> {
    console.log('[LL LockScreen] Stopping lockscreen learning');
    
    // 모든 위젯 제거
    for (const [widgetId] of this.activeWidgets) {
      await this.removeWidget(widgetId);
    }
    
    this.activeWidgets.clear();
  }

  /**
   * 특허 핵심: 동적 문제 생성 및 잠금화면 표시
   */
  public async showQuizWidget(context?: Partial<LearningContext>): Promise<string> {
    const learningContext: LearningContext = {
      timeOfDay: this.getCurrentTimeOfDay(),
      userState: 'unlock-attempt',
      previousAnswers: await this.getPreviousAnswers(),
      ...context
    };
    
    // AI 기반 동적 문제 생성
    const quiz = await this.questionGenerator.generateQuiz(learningContext);
    
    // 플랫폼별 위젯 생성
    const widgetId = await this.createPlatformWidget(quiz);
    this.activeWidgets.set(widgetId, quiz);
    
    return widgetId;
  }

  /**
   * 특허 청구항 4: 실시간 난이도 조정 및 정답 처리
   */
  public async handleWidgetAnswer(
    widgetId: string, 
    selectedOption: number
  ): Promise<{ correct: boolean; shouldDismissKeyguard: boolean }> {
    const quiz = this.activeWidgets.get(widgetId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    const isCorrect = selectedOption === quiz.correctAnswer;
    const timestamp = new Date().toISOString();
    
    // 답변 기록
    const wrongAnswer: WrongAnswer = {
      questionId: quiz.id,
      question: quiz.question,
      correctAnswer: quiz.options[quiz.correctAnswer],
      userAnswer: quiz.options[selectedOption],
      category: quiz.category,
      difficulty: quiz.difficulty,
      timestamp
    };
    
    if (!isCorrect) {
      // 틀린 답변을 SDK에 기록 (특허 청구항 3: 개인화 오답노트)
      await this.client.addWrongAnswer(wrongAnswer);
    }
    
    // 실시간 난이도 조정 (특허 청구항 4)
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      const performance = isCorrect ? 1 : 0;
      await this.questionGenerator.adjustDifficulty(currentUser.id, performance);
    }
    
    // 위젯 업데이트 (결과 표시)
    await this.showQuizResult(widgetId, isCorrect);
    
    // 특허 핵심: 정답 시 키가드 해제 요청
    const shouldDismissKeyguard = isCorrect && this.config.keyguardDismissOnCorrect;
    if (shouldDismissKeyguard) {
      await this.requestKeyguardDismiss();
    }
    
    // 다음 퀴즈 준비
    setTimeout(() => this.showNextQuiz(), 3000);
    
    return { 
      correct: isCorrect, 
      shouldDismissKeyguard 
    };
  }

  // 플랫폼별 구현 메서드들
  private detectPlatform(): 'android' | 'ios' | 'web' {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      if (/Android/i.test(userAgent)) return 'android';
      if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    }
    return 'web';
  }

  private initializePlatformProvider(): void {
    if (this.config.platform === 'android') {
      this.platformProvider = new AndroidWidgetProviderImpl();
    }
    // iOS는 별도 구현 필요
  }

  private async initializeAndroidWidgets(): Promise<void> {
    if (!this.platformProvider) return;
    
    console.log('[LL LockScreen] Initializing Android 16 widgets');
    
    // Android 16 위젯 API 사용
    try {
      // 위젯 권한 확인
      await this.requestWidgetPermissions();
      
      // 잠금화면 위젯 슬롯 확보
      await this.reserveWidgetSlot();
      
    } catch (error) {
      console.error('[LL LockScreen] Android widget init failed:', error);
    }
  }

  private async initializeiOSLiveActivities(): Promise<void> {
    console.log('[LL LockScreen] Initializing iOS Live Activities');
    
    // iOS Live Activities API 사용
    // ActivityKit 프레임워크 필요
  }

  private registerLockScreenEvents(): void {
    if (this.config.platform === 'android') {
      // Android KeyguardManager 이벤트 리스닝
      this.registerAndroidKeyguardEvents();
    } else if (this.config.platform === 'ios') {
      // iOS 잠금/해제 이벤트 리스닝  
      this.registeriOSLockEvents();
    }
  }

  private registerAndroidKeyguardEvents(): void {
    // KeyguardManager.KeyguardLock 이벤트 처리
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 화면이 꺼질 때 (잠금 상태)
        this.onDeviceLocked();
      } else {
        // 화면이 켜질 때 (잠금 해제 시도)
        this.onDeviceUnlockAttempt();
      }
    });
  }

  private registeriOSLockEvents(): void {
    // iOS Screen Lock 이벤트 (제한적)
    document.addEventListener('pagehide', () => this.onDeviceLocked());
    document.addEventListener('pageshow', () => this.onDeviceUnlockAttempt());
  }

  private async onDeviceLocked(): void {
    console.log('[LL LockScreen] Device locked');
    // 잠금 시 위젯 상태 업데이트
  }

  private async onDeviceUnlockAttempt(): void {
    console.log('[LL LockScreen] Unlock attempt detected');
    
    // 잠금 해제 시도 시 퀴즈 표시
    if (this.config.widgetEnabled && this.activeWidgets.size === 0) {
      await this.showQuizWidget({
        userState: 'unlock-attempt'
      });
    }
  }

  private async createPlatformWidget(quiz: QuizWidget): Promise<string> {
    if (this.config.platform === 'android' && this.platformProvider) {
      const widget = await this.platformProvider.createLockScreenWidget(quiz);
      return widget.id;
    } else if (this.config.platform === 'ios') {
      return await this.createiOSLiveActivity(quiz);
    }
    
    // 웹 환경에서는 모의 위젯
    return `web-widget-${Date.now()}`;
  }

  private async createiOSLiveActivity(quiz: QuizWidget): Promise<string> {
    const activityId = `quiz-${Date.now()}`;
    
    // iOS ActivityKit API 호출
    const activity: iOSLiveActivity = {
      activityId,
      contentState: {
        question: quiz.question,
        options: quiz.options,
        progress: 0
      },
      dismissalPolicy: 'manual'
    };
    
    console.log('[LL LockScreen] Created iOS Live Activity:', activityId);
    return activityId;
  }

  private async showQuizResult(widgetId: string, isCorrect: boolean): Promise<void> {
    const quiz = this.activeWidgets.get(widgetId);
    if (!quiz) return;
    
    // 결과 표시 UI 업데이트
    const resultContent = {
      result: isCorrect ? 'correct' : 'incorrect',
      correctAnswer: quiz.options[quiz.correctAnswer],
      explanation: `정답: ${quiz.options[quiz.correctAnswer]}`
    };
    
    if (this.platformProvider) {
      await this.platformProvider.updateWidget(widgetId, resultContent);
    }
  }

  private async showNextQuiz(): Promise<void> {
    // 일일 한도 체크
    const todayCount = await this.getTodayQuizCount();
    if (todayCount >= this.config.dailyQuestionLimit) {
      return;
    }
    
    // 새로운 퀴즈 표시
    await this.showQuizWidget();
  }

  /**
   * 특허 핵심: 정답 시 키가드 해제 요청
   */
  private async requestKeyguardDismiss(): Promise<void> {
    if (this.config.platform === 'android') {
      try {
        // Android KeyguardManager.requestDismissKeyguard() 호출
        console.log('[LL LockScreen] Requesting keyguard dismiss');
        
        // 실제 구현에서는 네이티브 모듈 호출
        // const KeyguardManager = require('react-native-keyguard');
        // await KeyguardManager.requestDismiss();
        
      } catch (error) {
        console.error('[LL LockScreen] Keyguard dismiss failed:', error);
      }
    }
    // iOS는 시스템 제약으로 잠금 해제 불가
  }

  private async removeWidget(widgetId: string): Promise<void> {
    if (this.platformProvider) {
      await this.platformProvider.removeWidget(widgetId);
    }
    this.activeWidgets.delete(widgetId);
  }

  // 유틸리티 메서드들
  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private async getPreviousAnswers() {
    // 이전 답변 기록 조회
    return [];
  }

  private async getCurrentUser() {
    // 현재 사용자 정보 조회
    return { id: 'current-user' };
  }

  private async getTodayQuizCount(): Promise<number> {
    // 오늘 표시된 퀴즈 수 조회
    return 0;
  }

  private async requestWidgetPermissions(): Promise<void> {
    // Android 위젯 권한 요청
    console.log('[LL LockScreen] Requesting widget permissions');
  }

  private async reserveWidgetSlot(): Promise<void> {
    // 잠금화면 위젯 슬롯 예약
    console.log('[LL LockScreen] Reserving widget slot');
  }
}

// 스마트 문제 생성 엔진
class SmartQuestionGenerator implements DynamicQuestionGenerator {
  private difficultyMap = new Map<string, number>();

  async generateQuiz(context: LearningContext): Promise<QuizWidget> {
    // 컨텍스트 기반 동적 문제 생성
    const difficulty = this.selectDifficulty(context);
    const category = this.selectCategory(context);
    
    return {
      id: `quiz-${Date.now()}`,
      question: '다음 중 TypeScript의 장점이 아닌 것은?',
      options: [
        '정적 타입 검사',
        '자동 메모리 관리', 
        'IDE 지원 향상',
        '런타임 오류 감소'
      ],
      correctAnswer: 1,
      difficulty,
      category,
      estimatedTime: 15,
      context
    };
  }

  async adjustDifficulty(userId: string, performance: number): Promise<void> {
    const currentDifficulty = this.difficultyMap.get(userId) || 0.5;
    
    // 성과에 따른 난이도 조정 (특허 청구항 4)
    let newDifficulty = currentDifficulty;
    if (performance > 0.8) {
      newDifficulty = Math.min(1.0, currentDifficulty + 0.1);
    } else if (performance < 0.4) {
      newDifficulty = Math.max(0.1, currentDifficulty - 0.1);
    }
    
    this.difficultyMap.set(userId, newDifficulty);
    console.log(`[LL Generator] Difficulty adjusted for ${userId}: ${newDifficulty}`);
  }

  async getPersonalizedContent(userId: string): Promise<QuizWidget[]> {
    // 개인화된 문제 목록 반환
    return [];
  }

  private selectDifficulty(context: LearningContext): 'easy' | 'medium' | 'hard' {
    // 시간대와 이전 성과에 따른 난이도 선택
    if (context.timeOfDay === 'morning') return 'medium';
    if (context.timeOfDay === 'evening') return 'easy';
    return 'medium';
  }

  private selectCategory(context: LearningContext): string {
    // 컨텍스트 기반 카테고리 선택
    const categories = ['programming', 'language', 'general', 'science'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
}

// Android 위젯 구현
class AndroidWidgetProviderImpl implements AndroidWidgetProvider {
  async createLockScreenWidget(quiz: QuizWidget): Promise<AndroidWidget> {
    const widget: AndroidWidget = {
      id: `android-widget-${Date.now()}`,
      size: { width: 4, height: 3 }, // Android 16 표준 크기
      content: {
        question: quiz.question,
        buttons: quiz.options.map((option, index) => ({
          text: option,
          action: `answer_${index}`
        }))
      }
    };
    
    console.log('[LL Android] Created lockscreen widget:', widget.id);
    return widget;
  }

  async updateWidget(widgetId: string, content: any): Promise<void> {
    console.log(`[LL Android] Updating widget ${widgetId}:`, content);
    // Android RemoteViews 업데이트
  }

  async removeWidget(widgetId: string): Promise<void> {
    console.log(`[LL Android] Removing widget ${widgetId}`);
    // 위젯 제거
  }
}

export default LockScreenLearningPlugin;