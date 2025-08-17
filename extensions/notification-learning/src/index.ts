/**
 * LockLearn Notification Learning Extension
 * 안정적이고 현실적인 알림 기반 마이크로러닝 시스템
 */

import type { LockLearnClient, WrongAnswer } from '@locklearn/partner-sdk';
import { CronJob } from 'cron';
import { format, addMinutes, addHours } from 'date-fns';

// 현실적 알림 학습 설정
export interface NotificationLearningConfig {
  enabled: boolean;
  notificationsPerDay: number;
  quietHours: { start: string; end: string }; // 예: "22:00", "08:00"
  sessionDuration: number; // seconds
  maxDailyQuestions: number;
  adaptiveScheduling: boolean;
  platforms: {
    web: boolean;
    mobile: boolean;
    desktop: boolean;
  };
}

export interface MicroQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // seconds
  explanation?: string;
  hints?: string[];
}

export interface NotificationQuiz {
  notificationId: string;
  quiz: MicroQuiz;
  scheduledTime: string;
  sentTime?: string;
  respondedTime?: string;
  userAnswer?: number;
  isCorrect?: boolean;
  status: 'scheduled' | 'sent' | 'responded' | 'expired';
}

export interface LearningSchedule {
  userId: string;
  preferredTimes: string[]; // 예: ["09:00", "14:00", "19:00"]
  timezone: string;
  frequency: 'low' | 'medium' | 'high'; // 1-3회/일, 3-6회/일, 6-10회/일
  categories: string[];
  difficulty: 'adaptive' | 'easy' | 'medium' | 'hard';
}

export interface NotificationResponse {
  notificationId: string;
  responseTime: string;
  answer: number;
  confidence?: number; // 1-5
  feedback?: 'too_easy' | 'too_hard' | 'just_right';
}

// 알림 기반 학습 플러그인
export class NotificationLearningPlugin {
  public readonly name = 'notification-learning';
  public readonly version = '0.1.0';
  
  private client!: LockLearnClient;
  private config: NotificationLearningConfig;
  private notificationManager: NotificationManager;
  private quizScheduler: QuizScheduler;
  private responseHandler: ResponseHandler;
  private activeSchedules = new Map<string, LearningSchedule>();

  constructor(config: Partial<NotificationLearningConfig> = {}) {
    this.config = {
      enabled: true,
      notificationsPerDay: 5,
      quietHours: { start: '22:00', end: '08:00' },
      sessionDuration: 30,
      maxDailyQuestions: 10,
      adaptiveScheduling: true,
      platforms: {
        web: true,
        mobile: true,
        desktop: true
      },
      ...config
    };
    
    this.notificationManager = new NotificationManager(this.config);
    this.quizScheduler = new QuizScheduler(this.config);
    this.responseHandler = new ResponseHandler();
  }

  public install(client: LockLearnClient): void {
    this.client = client;
    
    // SDK에 알림 학습 메서드 추가
    (client as any).startNotificationLearning = this.startNotificationLearning.bind(this);
    (client as any).stopNotificationLearning = this.stopNotificationLearning.bind(this);
    (client as any).updateLearningSchedule = this.updateLearningSchedule.bind(this);
    (client as any).respondToQuizNotification = this.respondToQuizNotification.bind(this);
    (client as any).getNotificationHistory = this.getNotificationHistory.bind(this);
    (client as any).adjustNotificationFrequency = this.adjustNotificationFrequency.bind(this);
    
    // 알림 권한 요청 (웹 환경)
    this.requestNotificationPermission();
    
    console.log('[LL Notification] Notification learning plugin installed');
  }

  public uninstall?(client: LockLearnClient): void {
    this.quizScheduler.stopAllSchedules();
    console.log('[LL Notification] Notification learning plugin uninstalled');
  }

  /**
   * 알림 기반 학습 시작
   */
  public async startNotificationLearning(
    userId: string,
    schedule?: Partial<LearningSchedule>
  ): Promise<void> {
    if (!this.config.enabled) return;

    const learningSchedule: LearningSchedule = {
      userId,
      preferredTimes: schedule?.preferredTimes || ['09:00', '14:00', '19:00'],
      timezone: schedule?.timezone || 'Asia/Seoul',
      frequency: schedule?.frequency || 'medium',
      categories: schedule?.categories || ['general', 'programming', 'language'],
      difficulty: schedule?.difficulty || 'adaptive'
    };

    this.activeSchedules.set(userId, learningSchedule);
    
    // 퀴즈 스케줄링 시작
    await this.quizScheduler.scheduleQuizzes(learningSchedule);
    
    console.log(`[LL Notification] Started learning for user: ${userId}`);
  }

  /**
   * 알림 학습 중단
   */
  public async stopNotificationLearning(userId: string): Promise<void> {
    this.activeSchedules.delete(userId);
    await this.quizScheduler.clearUserSchedules(userId);
    
    console.log(`[LL Notification] Stopped learning for user: ${userId}`);
  }

  /**
   * 학습 일정 업데이트
   */
  public async updateLearningSchedule(
    userId: string,
    updates: Partial<LearningSchedule>
  ): Promise<void> {
    const current = this.activeSchedules.get(userId);
    if (!current) {
      throw new Error('No active learning schedule found');
    }

    const updated = { ...current, ...updates };
    this.activeSchedules.set(userId, updated);
    
    // 기존 스케줄 클리어 후 새로 생성
    await this.quizScheduler.clearUserSchedules(userId);
    await this.quizScheduler.scheduleQuizzes(updated);
    
    console.log(`[LL Notification] Updated schedule for user: ${userId}`);
  }

  /**
   * 퀴즈 알림에 대한 응답 처리
   */
  public async respondToQuizNotification(
    response: NotificationResponse
  ): Promise<{ 
    correct: boolean; 
    explanation?: string; 
    nextQuizIn?: number; // minutes
  }> {
    const notification = await this.getNotificationById(response.notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    const isCorrect = response.answer === notification.quiz.correctAnswer;
    
    // 응답 기록
    await this.responseHandler.recordResponse(response, isCorrect);
    
    // 틀린 답변이면 SDK에 기록
    if (!isCorrect) {
      const wrongAnswer: WrongAnswer = {
        questionId: notification.quiz.id,
        question: notification.quiz.question,
        correctAnswer: notification.quiz.options[notification.quiz.correctAnswer],
        userAnswer: notification.quiz.options[response.answer],
        category: notification.quiz.category,
        difficulty: notification.quiz.difficulty,
        timestamp: new Date().toISOString()
      };
      
      await this.client.addWrongAnswer(wrongAnswer);
    }

    // 적응형 스케줄링
    let nextQuizIn = 60; // 기본 1시간 후
    if (this.config.adaptiveScheduling) {
      nextQuizIn = this.calculateNextQuizDelay(response, isCorrect);
    }

    return {
      correct: isCorrect,
      explanation: notification.quiz.explanation,
      nextQuizIn
    };
  }

  /**
   * 알림 히스토리 조회
   */
  public async getNotificationHistory(
    userId: string,
    days: number = 7
  ): Promise<{
    totalNotifications: number;
    responded: number;
    accuracy: number;
    averageResponseTime: number; // seconds
    categoryPerformance: Array<{ category: string; accuracy: number }>;
  }> {
    return this.responseHandler.getHistory(userId, days);
  }

  /**
   * 알림 빈도 조정
   */
  public async adjustNotificationFrequency(
    userId: string,
    feedback: 'increase' | 'decrease' | 'pause'
  ): Promise<void> {
    const schedule = this.activeSchedules.get(userId);
    if (!schedule) return;

    switch (feedback) {
      case 'increase':
        if (schedule.frequency === 'low') schedule.frequency = 'medium';
        else if (schedule.frequency === 'medium') schedule.frequency = 'high';
        break;
      case 'decrease':
        if (schedule.frequency === 'high') schedule.frequency = 'medium';
        else if (schedule.frequency === 'medium') schedule.frequency = 'low';
        break;
      case 'pause':
        await this.stopNotificationLearning(userId);
        return;
    }

    await this.updateLearningSchedule(userId, { frequency: schedule.frequency });
  }

  // 헬퍼 메서드들
  private async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  private async getNotificationById(notificationId: string): Promise<NotificationQuiz | null> {
    // 실제 구현에서는 데이터베이스에서 조회
    return this.notificationManager.getNotification(notificationId);
  }

  private calculateNextQuizDelay(response: NotificationResponse, isCorrect: boolean): number {
    // 적응형 지연 시간 계산
    let baseDelay = 60; // 1시간

    if (isCorrect) {
      baseDelay *= 1.5; // 정답이면 조금 더 늦게
    } else {
      baseDelay *= 0.7; // 틀리면 조금 더 빨리
    }

    // 응답 시간이 빠르면 쉬운 문제였을 가능성
    const responseTimeMs = Date.now() - new Date(response.responseTime).getTime();
    if (responseTimeMs < 5000) { // 5초 미만
      baseDelay *= 1.2;
    }

    return Math.round(baseDelay);
  }
}

// 알림 관리자
class NotificationManager {
  private config: NotificationLearningConfig;
  private notifications = new Map<string, NotificationQuiz>();

  constructor(config: NotificationLearningConfig) {
    this.config = config;
  }

  async sendQuizNotification(quiz: MicroQuiz, userId: string): Promise<string> {
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notificationQuiz: NotificationQuiz = {
      notificationId,
      quiz,
      scheduledTime: new Date().toISOString(),
      sentTime: new Date().toISOString(),
      status: 'sent'
    };

    this.notifications.set(notificationId, notificationQuiz);

    // 플랫폼별 알림 발송
    if (this.config.platforms.web && typeof window !== 'undefined' && 'Notification' in window) {
      this.sendWebNotification(quiz, notificationId);
    }

    // 모바일 푸시 알림 (실제 구현에서는 FCM/APNS 사용)
    if (this.config.platforms.mobile) {
      this.sendMobileNotification(quiz, notificationId, userId);
    }

    console.log(`[LL Notification] Sent quiz notification: ${notificationId}`);
    return notificationId;
  }

  getNotification(notificationId: string): NotificationQuiz | null {
    return this.notifications.get(notificationId) || null;
  }

  private sendWebNotification(quiz: MicroQuiz, notificationId: string): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification('🧠 LockLearn 퀴즈', {
        body: quiz.question,
        icon: '/locklearn-icon.png',
        badge: '/locklearn-badge.png',
        tag: notificationId,
        data: { notificationId, quizId: quiz.id },
        actions: quiz.options.slice(0, 2).map((option, index) => ({
          action: `answer-${index}`,
          title: option
        })),
        requireInteraction: true
      });

      notification.onclick = () => {
        // 앱으로 이동하여 퀴즈 풀기
        window.focus();
        this.openQuizPage(notificationId);
        notification.close();
      };
    }
  }

  private async sendMobileNotification(quiz: MicroQuiz, notificationId: string, userId: string): Promise<void> {
    // 실제 구현에서는 FCM/APNS를 통한 푸시 알림
    console.log(`[LL Notification] Mobile push would be sent to user: ${userId}`);
    
    // 모의 모바일 알림 (실제로는 서버에서 처리)
    const pushPayload = {
      title: '🧠 LockLearn 퀴즈',
      body: quiz.question,
      data: {
        notificationId,
        quizId: quiz.id,
        type: 'quiz'
      },
      actions: [
        { action: 'answer', title: '답변하기' },
        { action: 'later', title: '나중에' }
      ]
    };

    // 서버 API 호출 (실제 구현)
    // await this.callPushAPI(userId, pushPayload);
  }

  private openQuizPage(notificationId: string): void {
    // SPA라면 라우터를 통해 퀴즈 페이지로 이동
    const quizUrl = `/quiz?notification=${notificationId}`;
    
    if (window.location.pathname !== '/quiz') {
      window.location.href = quizUrl;
    }
  }
}

// 퀴즈 스케줄러
class QuizScheduler {
  private config: NotificationLearningConfig;
  private cronJobs = new Map<string, CronJob>();
  private notificationManager: NotificationManager;

  constructor(config: NotificationLearningConfig) {
    this.config = config;
    this.notificationManager = new NotificationManager(config);
  }

  async scheduleQuizzes(schedule: LearningSchedule): Promise<void> {
    // 기존 스케줄 정리
    await this.clearUserSchedules(schedule.userId);

    const timesPerDay = this.getTimesPerDay(schedule.frequency);
    const intervals = this.calculateIntervals(schedule.preferredTimes, timesPerDay);

    intervals.forEach((time, index) => {
      const cronExpression = this.timeToCron(time);
      const jobId = `${schedule.userId}-${index}`;

      const job = new CronJob(cronExpression, async () => {
        await this.sendScheduledQuiz(schedule);
      }, null, false, schedule.timezone);

      this.cronJobs.set(jobId, job);
      job.start();
    });

    console.log(`[LL Scheduler] Scheduled ${intervals.length} quizzes for user: ${schedule.userId}`);
  }

  async clearUserSchedules(userId: string): Promise<void> {
    const userJobs = Array.from(this.cronJobs.keys()).filter(key => key.startsWith(userId));
    
    userJobs.forEach(jobId => {
      const job = this.cronJobs.get(jobId);
      if (job) {
        job.stop();
        job.destroy();
        this.cronJobs.delete(jobId);
      }
    });
  }

  stopAllSchedules(): void {
    this.cronJobs.forEach(job => {
      job.stop();
      job.destroy();
    });
    this.cronJobs.clear();
  }

  private async sendScheduledQuiz(schedule: LearningSchedule): Promise<void> {
    // 조용한 시간 체크
    if (this.isQuietHour()) {
      console.log('[LL Scheduler] Skipping quiz - quiet hours');
      return;
    }

    // 일일 한도 체크
    if (await this.hasReachedDailyLimit(schedule.userId)) {
      console.log('[LL Scheduler] Skipping quiz - daily limit reached');
      return;
    }

    // 퀴즈 생성
    const quiz = await this.generateQuiz(schedule);
    
    // 알림 발송
    await this.notificationManager.sendQuizNotification(quiz, schedule.userId);
  }

  private getTimesPerDay(frequency: string): number {
    switch (frequency) {
      case 'low': return 2;
      case 'medium': return 4;
      case 'high': return 6;
      default: return 3;
    }
  }

  private calculateIntervals(preferredTimes: string[], count: number): string[] {
    if (preferredTimes.length >= count) {
      return preferredTimes.slice(0, count);
    }

    // 선호 시간을 기준으로 간격 계산
    const intervals: string[] = [...preferredTimes];
    const hoursToAdd = Math.floor(12 / (count - preferredTimes.length));

    for (let i = preferredTimes.length; i < count; i++) {
      const baseTime = preferredTimes[i % preferredTimes.length];
      const [hour, minute] = baseTime.split(':').map(Number);
      const newTime = addHours(new Date(2023, 0, 1, hour, minute), hoursToAdd * (i - preferredTimes.length + 1));
      intervals.push(format(newTime, 'HH:mm'));
    }

    return intervals;
  }

  private timeToCron(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} * * *`; // 매일 해당 시간
  }

  private isQuietHour(): boolean {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const { start, end } = this.config.quietHours;

    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // 밤을 넘어가는 경우 (예: 22:00 - 08:00)
      return currentTime >= start || currentTime <= end;
    }
  }

  private async hasReachedDailyLimit(userId: string): Promise<boolean> {
    // 오늘 발송된 알림 수 확인 (실제 구현에서는 DB 조회)
    return false; // 임시로 false 반환
  }

  private async generateQuiz(schedule: LearningSchedule): Promise<MicroQuiz> {
    // 실제 구현에서는 사용자 프로필과 학습 히스토리를 기반으로 퀴즈 생성
    const categories = schedule.categories;
    const category = categories[Math.floor(Math.random() * categories.length)];

    const sampleQuizzes: MicroQuiz[] = [
      {
        id: `quiz-${Date.now()}`,
        question: 'TypeScript에서 "never" 타입의 용도는?',
        options: [
          '함수가 절대 반환하지 않음을 나타냄',
          '빈 객체를 나타냄',
          'null과 undefined를 나타냄',
          '모든 타입을 받을 수 있음을 나타냄'
        ],
        correctAnswer: 0,
        category: 'programming',
        difficulty: 'medium',
        estimatedTime: 15,
        explanation: 'never 타입은 절대 발생할 수 없는 타입을 나타내며, 함수가 예외를 던지거나 무한 루프일 때 사용됩니다.',
        hints: ['함수의 반환값과 관련이 있습니다', '절대 도달할 수 없는 코드와 관련이 있습니다']
      },
      {
        id: `quiz-${Date.now()}-2`,
        question: '다음 중 올바른 한국어 맞춤법은?',
        options: [
          '안녕하세요',
          '안녕하세용',
          '안녕하세여',
          '안녕하셰요'
        ],
        correctAnswer: 0,
        category: 'language',
        difficulty: 'easy',
        estimatedTime: 10,
        explanation: '"안녕하세요"가 표준 맞춤법입니다.'
      }
    ];

    return sampleQuizzes[Math.floor(Math.random() * sampleQuizzes.length)];
  }
}

// 응답 핸들러
class ResponseHandler {
  private responses: NotificationResponse[] = [];

  async recordResponse(response: NotificationResponse, isCorrect: boolean): Promise<void> {
    this.responses.push(response);
    
    // 로컬 스토리지에 저장 (실제 구현에서는 서버에 전송)
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('locklearn-responses') || '[]';
      const responses = JSON.parse(stored);
      responses.push({ ...response, isCorrect });
      localStorage.setItem('locklearn-responses', JSON.stringify(responses));
    }

    console.log(`[LL Response] Recorded response: ${response.notificationId}, correct: ${isCorrect}`);
  }

  async getHistory(userId: string, days: number): Promise<any> {
    // 실제 구현에서는 서버에서 데이터 조회
    const mockHistory = {
      totalNotifications: 25,
      responded: 20,
      accuracy: 75,
      averageResponseTime: 12,
      categoryPerformance: [
        { category: 'programming', accuracy: 80 },
        { category: 'language', accuracy: 70 },
        { category: 'general', accuracy: 75 }
      ]
    };

    return mockHistory;
  }
}

export default NotificationLearningPlugin;