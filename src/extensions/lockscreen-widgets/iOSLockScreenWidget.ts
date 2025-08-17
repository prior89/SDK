/**
 * 🍎 iOS 잠금화면 위젯 - 특허 실시예 1 구현
 * 
 * iOS Live Activity + 위젯을 통한 잠금화면 학습 시스템
 * 특허 핵심: "안드로이드/아이폰 OS 제약을 고려한 알림, 위젯, Live Activity 방식 구현"
 */

export interface iOSWidgetConfig {
  widgetFamily: 'systemSmall' | 'systemMedium' | 'systemLarge';
  liveActivityEnabled: boolean;
  dynamicIslandEnabled: boolean;
  notificationEnabled: boolean;
  updateFrequency: number;     // minutes
  interactionTimeout: number;  // seconds
  accessibility: boolean;
  reducedMotion: boolean;
}

export class iOSLockScreenWidget {
  private config: iOSWidgetConfig;
  private widgetKit: iOSWidgetKit;
  private activityKit: iOSActivityKit;
  private notificationCenter: iOSNotificationCenter;
  private userDefaults: iOSUserDefaults;
  
  constructor(config: iOSWidgetConfig) {
    this.config = config;
    this.widgetKit = new iOSWidgetKit();
    this.activityKit = new iOSActivityKit();
    this.notificationCenter = new iOSNotificationCenter();
    this.userDefaults = new iOSUserDefaults();
    
    console.log('[iOSWidget] iOS 잠금화면 위젯 초기화됨', {
      widgetFamily: config.widgetFamily,
      liveActivityEnabled: config.liveActivityEnabled,
      dynamicIslandEnabled: config.dynamicIslandEnabled
    });
  }

  /**
   * 🍎 iOS 위젯 및 Live Activity 설정
   */
  async setupiOSWidgetSystem(): Promise<iOSWidgetSetupResult> {
    console.log('[iOSWidget] iOS 위젯 시스템 설정 시작');

    const setupResult: iOSWidgetSetupResult = {
      timestamp: new Date().toISOString(),
      components: {
        homeScreenWidget: false,
        lockScreenWidget: false,
        liveActivity: false,
        dynamicIsland: false,
        notifications: false
      },
      permissions: {},
      errors: []
    };

    try {
      // 1. 권한 확인 및 요청
      const permissions = await this.requestiOSPermissions();
      setupResult.permissions = permissions;

      // 2. 홈 화면 위젯 설정
      if (permissions.widgetPermission) {
        await this.setupHomeScreenWidget();
        setupResult.components.homeScreenWidget = true;
      }

      // 3. 잠금화면 위젯 설정 (iOS 16+)
      if (permissions.lockScreenPermission && this.isiOS16OrLater()) {
        await this.setupLockScreenWidget();
        setupResult.components.lockScreenWidget = true;
      }

      // 4. Live Activity 설정 (iOS 16.1+)
      if (this.config.liveActivityEnabled && permissions.liveActivityPermission) {
        await this.setupLiveActivity();
        setupResult.components.liveActivity = true;
      }

      // 5. Dynamic Island 설정 (iPhone 14 Pro+)
      if (this.config.dynamicIslandEnabled && this.supportsDynamicIsland()) {
        await this.setupDynamicIsland();
        setupResult.components.dynamicIsland = true;
      }

      // 6. 알림 설정
      if (this.config.notificationEnabled && permissions.notificationPermission) {
        await this.setupNotifications();
        setupResult.components.notifications = true;
      }

      console.log('[iOSWidget] iOS 위젯 시스템 설정 완료', setupResult.components);
      return setupResult;

    } catch (error) {
      console.error('[iOSWidget] iOS 위젯 설정 실패:', error);
      setupResult.errors.push(error.message);
      return setupResult;
    }
  }

  /**
   * 🔓 iOS Live Activity로 잠금화면 학습 표시
   */
  async displayQuestionViaLiveActivity(question: LockScreenQuestion): Promise<iOSDisplayResult> {
    console.log('[iOSWidget] Live Activity로 문제 표시', {
      questionId: question.id,
      liveActivityEnabled: this.config.liveActivityEnabled
    });

    if (!this.config.liveActivityEnabled) {
      return this.fallbackToNotification(question);
    }

    try {
      // 1. Live Activity 콘텐츠 생성
      const activityContent = await this.createLiveActivityContent(question);
      
      // 2. Live Activity 시작
      const activity = await this.activityKit.startActivity({
        content: activityContent,
        pushType: 'manual', // 수동 업데이트
        relevanceScore: 1.0, // 최고 우선순위
        staleDate: new Date(Date.now() + this.config.interactionTimeout * 1000)
      });

      // 3. Dynamic Island 콘텐츠 설정 (지원 기기)
      if (this.config.dynamicIslandEnabled && this.supportsDynamicIsland()) {
        await this.setupDynamicIslandContent(activity.id, question);
      }

      // 4. 사용자 상호작용 대기
      const interactionResult = await this.waitForLiveActivityInteraction(
        activity.id,
        this.config.interactionTimeout
      );

      return {
        success: true,
        activityId: activity.id,
        questionId: question.id,
        displayMethod: 'live_activity',
        startTime: new Date().toISOString(),
        interaction: interactionResult
      };

    } catch (error) {
      console.error('[iOSWidget] Live Activity 표시 실패:', error);
      
      // 실패 시 알림으로 폴백
      return await this.fallbackToNotification(question);
    }
  }

  /**
   * 🏝️ Dynamic Island 상호작용 (iPhone 14 Pro+)
   */
  async setupDynamicIslandContent(activityId: string, question: LockScreenQuestion): Promise<void> {
    console.log('[iOSWidget] Dynamic Island 콘텐츠 설정', {
      activityId,
      questionId: question.id
    });

    const dynamicIslandContent = {
      // Compact Leading (좌측 압축 표시)
      compactLeading: {
        content: {
          iconName: 'brain.head.profile',
          tintColor: '#6366f1'
        }
      },
      
      // Compact Trailing (우측 압축 표시)
      compactTrailing: {
        content: {
          text: question.subject,
          font: 'caption'
        }
      },
      
      // Minimal (최소 표시)
      minimal: {
        content: {
          iconName: 'questionmark.circle.fill',
          tintColor: '#6366f1'
        }
      },
      
      // Expanded (확장 표시)
      expanded: {
        content: {
          leading: {
            iconName: 'brain.head.profile.fill',
            tintColor: '#6366f1'
          },
          trailing: {
            text: `${question.options.length}개 선택지`,
            font: 'caption'
          },
          bottom: {
            text: question.text.length > 50 ? 
              question.text.substring(0, 47) + '...' : 
              question.text,
            font: 'body'
          }
        },
        
        // 상호작용 버튼
        actions: question.options.map((option, index) => ({
          id: `answer_${index}`,
          title: option,
          systemImage: `${index + 1}.circle.fill`,
          intent: 'AnswerQuestionIntent'
        }))
      }
    };

    await this.activityKit.updateDynamicIslandContent(activityId, dynamicIslandContent);
  }

  /**
   * ⏰ Live Activity 상호작용 대기
   */
  private async waitForLiveActivityInteraction(
    activityId: string,
    timeoutSeconds: number
  ): Promise<iOSInteractionResult> {
    console.log('[iOSWidget] Live Activity 상호작용 대기', {
      activityId,
      timeout: timeoutSeconds + '초'
    });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          result: 'timeout',
          activityId,
          timestamp: new Date().toISOString()
        });
      }, timeoutSeconds * 1000);

      // iOS 앱 인텐트 기반 상호작용 리스너
      this.activityKit.onUserInteraction(activityId, (interaction) => {
        clearTimeout(timeout);
        
        console.log('[iOSWidget] 사용자 상호작용 감지:', interaction);

        resolve({
          result: 'interacted',
          activityId,
          interactionType: interaction.type,
          selectedAnswer: interaction.answer,
          responseTime: interaction.responseTime,
          sourceLocation: interaction.source, // 'dynamic_island' | 'lock_screen' | 'notification'
          timestamp: new Date().toISOString(),
          engagementScore: this.calculateiOSEngagement(interaction)
        });
      });
    });
  }

  /**
   * 🔓 iOS 잠금 해제 제어
   */
  async controliOSUnlockBehavior(
    interaction: iOSInteractionResult,
    question: LockScreenQuestion
  ): Promise<iOSUnlockResult> {
    console.log('[iOSWidget] iOS 잠금 해제 동작 제어');

    const isCorrect = interaction.selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      // 정답: Live Activity 성공 표시 + 자동 종료
      await this.activityKit.updateActivityContent(interaction.activityId, {
        state: 'success',
        content: {
          title: '정답입니다! 🎉',
          subtitle: '훌륭한 학습입니다',
          progressBar: 1.0
        }
      });

      // 2초 후 Activity 종료 (iOS는 자동 잠금 해제 불가)
      setTimeout(async () => {
        await this.activityKit.endActivity(interaction.activityId);
      }, 2000);

      return {
        type: 'success_feedback',
        success: true,
        feedbackDuration: 2000,
        activityEnded: true,
        message: '정답! 학습 기록이 저장되었습니다.'
      };

    } else {
      // 오답: 설명 표시 후 종료
      await this.activityKit.updateActivityContent(interaction.activityId, {
        state: 'explanation',
        content: {
          title: '정답: ' + question.correctAnswer,
          subtitle: question.explanation,
          tip: question.learningTip
        }
      });

      // 5초 후 Activity 종료
      setTimeout(async () => {
        await this.activityKit.endActivity(interaction.activityId);
      }, 5000);

      return {
        type: 'explanation_feedback',
        success: true,
        feedbackDuration: 5000,
        activityEnded: true,
        message: '오답입니다. 설명을 확인해보세요.'
      };
    }
  }

  /**
   * 📱 iOS 홈 화면 위젯 업데이트
   */
  async updateHomeScreenWidget(data: WidgetUpdateData): Promise<void> {
    console.log('[iOSWidget] 홈 화면 위젯 업데이트');

    const widgetContent = {
      header: {
        title: 'LockLearn',
        subtitle: `${data.todayQuestions}개 문제 완료`
      },
      
      body: {
        mainText: data.nextQuestion ? 
          '다음 문제가 준비되었습니다' : 
          '새로운 문제를 생성 중...',
        progressText: `${data.currentStreak}일 연속 학습`,
        difficultyText: `난이도 ${Math.round(data.currentDifficulty * 100)}%`
      },
      
      footer: {
        pointsText: `${data.totalPoints} 포인트`,
        levelText: `Level ${data.currentLevel}`
      },
      
      actionButton: data.nextQuestion ? {
        title: '학습 시작',
        deepLink: 'locklearn://start-learning'
      } : undefined
    };

    await this.widgetKit.updateWidgetContent(widgetContent);
  }

  /**
   * 📳 iOS 알림 기반 학습 (Live Activity 지원 안 될 때)
   */
  private async fallbackToNotification(question: LockScreenQuestion): Promise<iOSDisplayResult> {
    console.log('[iOSWidget] 알림 기반 학습으로 폴백');

    // Rich Notification 생성
    const notification = await this.notificationCenter.scheduleRichNotification({
      title: `LockLearn 문제: ${question.subject}`,
      body: question.text,
      
      // 인터랙티브 알림 (iOS 12+)
      categoryIdentifier: 'LOCKLEARN_QUESTION',
      actions: question.options.map((option, index) => ({
        identifier: `answer_${index}`,
        title: option,
        options: ['UNNotificationActionOptionForeground']
      })),
      
      // 멀티미디어 (필요시)
      attachments: question.imageUrl ? [{
        identifier: 'question_image',
        url: question.imageUrl,
        type: 'image'
      }] : [],
      
      // 배지 및 사운드
      badge: 1,
      sound: 'learning_notification.wav',
      
      // 스케줄링
      trigger: 'immediate',
      threadIdentifier: 'locklearn_questions'
    });

    return {
      success: true,
      displayMethod: 'rich_notification',
      notificationId: notification.id,
      questionId: question.id,
      startTime: new Date().toISOString(),
      fallbackReason: 'live_activity_unavailable'
    };
  }

  /**
   * 🎯 iOS 앱 인텐트 처리
   */
  async handleAppIntent(intent: iOSAppIntent): Promise<iOSIntentResult> {
    console.log('[iOSWidget] iOS 앱 인텐트 처리', {
      intentType: intent.type,
      sourceWidget: intent.sourceWidget
    });

    switch (intent.type) {
      case 'AnswerQuestionIntent':
        return await this.processAnswerIntent(intent);
        
      case 'StartLearningIntent':
        return await this.processStartLearningIntent(intent);
        
      case 'ViewProgressIntent':
        return await this.processViewProgressIntent(intent);
        
      case 'CustomizeWidgetIntent':
        return await this.processCustomizeIntent(intent);
        
      default:
        console.warn('[iOSWidget] 알 수 없는 인텐트:', intent.type);
        return {
          success: false,
          error: `지원하지 않는 인텐트: ${intent.type}`
        };
    }
  }

  /**
   * 📊 iOS 위젯 성능 분석
   */
  async getiOSWidgetAnalytics(): Promise<iOSWidgetAnalytics> {
    const analytics = await this.widgetKit.getWidgetAnalytics();
    const activityAnalytics = this.config.liveActivityEnabled ? 
      await this.activityKit.getActivityAnalytics() : null;

    return {
      homeScreenWidget: {
        totalViews: analytics.homeScreenViews,
        totalTaps: analytics.homeScreenTaps,
        averageViewDuration: analytics.averageViewTime,
        reloadFrequency: analytics.reloadCount,
        userRetention: analytics.retentionRate
      },
      
      lockScreenWidget: {
        totalDisplays: analytics.lockScreenDisplays,
        totalInteractions: analytics.lockScreenInteractions,
        averageResponseTime: analytics.averageResponseTime,
        correctAnswerRate: analytics.correctAnswerRate,
        dismissalRate: analytics.dismissalRate
      },
      
      liveActivity: activityAnalytics ? {
        totalActivities: activityAnalytics.totalStarted,
        averageDuration: activityAnalytics.averageDuration,
        completionRate: activityAnalytics.completionRate,
        dynamicIslandEngagement: activityAnalytics.dynamicIslandTaps,
        notificationFallbackRate: activityAnalytics.fallbackToNotificationRate
      } : null,
      
      overall: {
        batteryImpact: analytics.batteryUsage,
        memoryFootprint: analytics.memoryUsage,
        crashCount: analytics.crashCount,
        userSatisfaction: this.calculateUserSatisfaction(analytics)
      },
      
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 🔧 iOS 위젯 설정 커스터마이징
   */
  async customizeWidgetAppearance(customization: iOSWidgetCustomization): Promise<void> {
    console.log('[iOSWidget] 위젯 외관 커스터마이징', customization);

    // 1. 위젯 테마 업데이트
    if (customization.theme) {
      await this.updateWidgetTheme(customization.theme);
    }

    // 2. 위젯 크기 조정
    if (customization.size) {
      await this.resizeWidget(customization.size);
    }

    // 3. 상호작용 설정 업데이트
    if (customization.interactionSettings) {
      await this.updateInteractionSettings(customization.interactionSettings);
    }

    // 4. 접근성 설정 업데이트
    if (customization.accessibility) {
      await this.updateAccessibilitySettings(customization.accessibility);
    }

    // 5. 설정 저장
    await this.userDefaults.saveWidgetCustomization(customization);
  }

  // ==========================================
  // 내부 구현 메서드들
  // ==========================================

  private async requestiOSPermissions(): Promise<iOSPermissions> {
    console.log('[iOSWidget] iOS 권한 요청');

    return {
      widgetPermission: true,      // 위젯은 기본 허용
      lockScreenPermission: await this.checkLockScreenWidgetPermission(),
      liveActivityPermission: await this.checkLiveActivityPermission(),
      notificationPermission: await this.notificationCenter.requestPermission(),
      dynamicIslandPermission: this.supportsDynamicIsland()
    };
  }

  private async setupHomeScreenWidget(): Promise<void> {
    console.log('[iOSWidget] 홈 화면 위젯 설정');
    
    const widgetConfiguration = {
      kind: 'LockLearnWidget',
      displayName: 'LockLearn 학습',
      description: '개인화된 학습 문제와 진도를 확인하세요',
      supportedFamilies: [this.config.widgetFamily],
      configurationDisplayName: 'LockLearn 설정',
      intentRecommendationsContainer: 'LockLearnIntents'
    };

    await this.widgetKit.configureWidget(widgetConfiguration);
  }

  private async setupLockScreenWidget(): Promise<void> {
    console.log('[iOSWidget] 잠금화면 위젯 설정 (iOS 16+)');
    
    const lockScreenConfig = {
      kind: 'LockLearnLockScreenWidget',
      family: 'accessoryRectangular', // 잠금화면 직사각형 위젯
      displayName: '학습 문제',
      description: '잠금화면에서 바로 학습하세요'
    };

    await this.widgetKit.configureLockScreenWidget(lockScreenConfig);
  }

  private async setupLiveActivity(): Promise<void> {
    console.log('[iOSWidget] Live Activity 설정');
    
    const activityConfiguration = {
      kind: 'LockLearnLearningActivity',
      displayName: '학습 세션',
      description: '진행 중인 학습 활동',
      dynamicIslandEnabled: this.config.dynamicIslandEnabled,
      relevanceScore: 1.0
    };

    await this.activityKit.configureActivityType(activityConfiguration);
  }

  private async createLiveActivityContent(question: LockScreenQuestion): Promise<any> {
    return {
      state: 'question_active',
      content: {
        // 메인 콘텐츠
        title: `${question.subject} 문제`,
        subtitle: question.text,
        
        // 진행 상태
        progress: {
          current: question.questionNumber || 1,
          total: question.totalQuestions || 10,
          percentage: (question.questionNumber || 1) / (question.totalQuestions || 10)
        },
        
        // 시간 제한
        timer: {
          remaining: this.config.interactionTimeout,
          startTime: new Date().toISOString()
        },
        
        // 선택지 (Dynamic Island + 알림 센터)
        options: question.options,
        
        // 메타 정보
        metadata: {
          difficulty: Math.round(question.difficulty * 100) + '%',
          points: question.pointValue || 10,
          streak: question.currentStreak || 0
        }
      }
    };
  }

  private async processAnswerIntent(intent: iOSAppIntent): Promise<iOSIntentResult> {
    const answerIndex = parseInt(intent.parameters.answerIndex);
    const questionId = intent.parameters.questionId;
    
    console.log('[iOSWidget] 답변 인텐트 처리', {
      questionId,
      answerIndex
    });

    // 답변 처리 로직
    const result = await this.processAnswer(questionId, answerIndex);
    
    return {
      success: true,
      intentType: 'answer',
      result: result,
      timestamp: new Date().toISOString()
    };
  }

  private isiOS16OrLater(): boolean {
    // iOS 버전 체크 (실제로는 네이티브 코드에서)
    return true; // 시뮬레이션
  }

  private supportsDynamicIsland(): boolean {
    // Dynamic Island 지원 기기 체크
    return true; // 시뮬레이션
  }

  private calculateiOSEngagement(interaction: any): number {
    // iOS 특화 참여도 계산
    const baseEngagement = 0.7;
    
    if (interaction.source === 'dynamic_island') {
      return Math.min(1.0, baseEngagement + 0.2); // Dynamic Island는 높은 참여도
    } else if (interaction.source === 'lock_screen') {
      return Math.min(1.0, baseEngagement + 0.1);
    } else {
      return baseEngagement;
    }
  }

  private calculateUserSatisfaction(analytics: any): number {
    // 종합 만족도 계산
    const factors = [
      analytics.retentionRate,
      1 - analytics.dismissalRate,
      analytics.correctAnswerRate,
      Math.min(1, analytics.averageViewTime / 30) // 30초 이상 보면 만족
    ];
    
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  // 추가 헬퍼 메서드들 (스텁)
  private async checkLockScreenWidgetPermission(): Promise<boolean> { return true; }
  private async checkLiveActivityPermission(): Promise<boolean> { return true; }
  private async updateWidgetTheme(theme: string): Promise<void> {}
  private async resizeWidget(size: string): Promise<void> {}
  private async updateInteractionSettings(settings: any): Promise<void> {}
  private async updateAccessibilitySettings(settings: any): Promise<void> {}
  private async processAnswer(questionId: string, answerIndex: number): Promise<any> { return { correct: true }; }
}

// ==========================================
// iOS 네이티브 인터페이스 클래스들 (스텁)
// ==========================================

class iOSWidgetKit {
  async configureWidget(config: any): Promise<void> {}
  async configureLockScreenWidget(config: any): Promise<void> {}
  async updateWidgetContent(content: any): Promise<void> {}
  async getWidgetAnalytics(): Promise<any> {
    return {
      homeScreenViews: 1500,
      homeScreenTaps: 350,
      lockScreenDisplays: 800,
      lockScreenInteractions: 600,
      averageViewTime: 25, // seconds
      averageResponseTime: 16000, // ms
      correctAnswerRate: 0.76,
      dismissalRate: 0.15,
      retentionRate: 0.82,
      reloadCount: 50,
      batteryUsage: 'low',
      memoryUsage: 18, // MB
      crashCount: 0
    };
  }
}

class iOSActivityKit {
  async configureActivityType(config: any): Promise<void> {}
  
  async startActivity(config: any): Promise<any> {
    return {
      id: `activity_${Date.now()}`,
      startTime: new Date().toISOString()
    };
  }
  
  async updateActivityContent(activityId: string, content: any): Promise<void> {}
  async updateDynamicIslandContent(activityId: string, content: any): Promise<void> {}
  async endActivity(activityId: string): Promise<void> {}
  
  onUserInteraction(activityId: string, callback: (interaction: any) => void): void {
    // 시뮬레이션: 3초 후 상호작용 발생
    setTimeout(() => {
      callback({
        type: 'answer_selected',
        answer: 'A',
        responseTime: 18000,
        source: 'dynamic_island',
        timestamp: new Date().toISOString()
      });
    }, 3000);
  }
  
  async getActivityAnalytics(): Promise<any> {
    return {
      totalStarted: 120,
      averageDuration: 25000, // ms
      completionRate: 0.78,
      dynamicIslandTaps: 85,
      fallbackToNotificationRate: 0.12
    };
  }
}

class iOSNotificationCenter {
  async requestPermission(): Promise<boolean> {
    return true; // 시뮬레이션
  }
  
  async scheduleRichNotification(config: any): Promise<any> {
    return {
      id: `notification_${Date.now()}`,
      scheduled: true
    };
  }
}

class iOSUserDefaults {
  async saveWidgetCustomization(customization: any): Promise<void> {
    console.log('[iOSWidget] 위젯 커스터마이징 저장:', customization);
  }
}

// ==========================================
// 타입 정의들
// ==========================================

interface iOSWidgetSetupResult {
  timestamp: string;
  components: {
    homeScreenWidget: boolean;
    lockScreenWidget: boolean;
    liveActivity: boolean;
    dynamicIsland: boolean;
    notifications: boolean;
  };
  permissions: iOSPermissions;
  errors: string[];
}

interface iOSPermissions {
  widgetPermission: boolean;
  lockScreenPermission: boolean;
  liveActivityPermission: boolean;
  notificationPermission: boolean;
  dynamicIslandPermission: boolean;
}

interface iOSDisplayResult {
  success: boolean;
  activityId?: string;
  notificationId?: string;
  questionId: string;
  displayMethod: 'live_activity' | 'rich_notification';
  startTime: string;
  interaction?: iOSInteractionResult;
  fallbackReason?: string;
}

interface iOSInteractionResult {
  result: 'interacted' | 'timeout';
  activityId: string;
  interactionType?: string;
  selectedAnswer?: string;
  responseTime?: number;
  sourceLocation?: 'dynamic_island' | 'lock_screen' | 'notification';
  timestamp: string;
  engagementScore?: number;
}

interface iOSUnlockResult {
  type: 'success_feedback' | 'explanation_feedback';
  success: boolean;
  feedbackDuration: number;
  activityEnded: boolean;
  message: string;
}

interface WidgetUpdateData {
  todayQuestions: number;
  currentStreak: number;
  currentDifficulty: number;
  totalPoints: number;
  currentLevel: number;
  nextQuestion?: any;
}

interface iOSWidgetCustomization {
  theme?: 'light' | 'dark' | 'auto';
  size?: 'systemSmall' | 'systemMedium' | 'systemLarge';
  interactionSettings?: any;
  accessibility?: any;
}

interface iOSAppIntent {
  type: string;
  sourceWidget: string;
  parameters: Record<string, any>;
  timestamp: string;
}

interface iOSIntentResult {
  success: boolean;
  intentType?: string;
  result?: any;
  timestamp?: string;
  error?: string;
}

interface iOSWidgetAnalytics {
  homeScreenWidget: any;
  lockScreenWidget: any;
  liveActivity: any;
  overall: any;
  lastUpdated: string;
}

console.log('🍎 iOSLockScreenWidget v1.0.0 로드 완료 - iOS Live Activity + 위젯 구현');