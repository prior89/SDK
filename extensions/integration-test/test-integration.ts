/**
 * LockLearn SDK Extensions Integration Test
 * 기존 SDK와 새로 개발한 확장 모듈들의 통합 테스트
 */

import LockLearn from '../src/index.js';
import RealisticAnalyticsPlugin from './realistic-analytics/src/index.js';
import NotificationLearningPlugin from './notification-learning/src/index.js';
import SimpleAIPlugin from './simple-ai/src/index.js';

// 통합 테스트 클래스
class LockLearnIntegrationTest {
  private testResults: Array<{ test: string; passed: boolean; message: string }> = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 LockLearn SDK Extensions Integration Test 시작\n');

    // 1. 기본 SDK 테스트
    await this.testBasicSDK();

    // 2. Analytics Extension 테스트
    await this.testAnalyticsExtension();

    // 3. Notification Learning Extension 테스트  
    await this.testNotificationExtension();

    // 4. Simple AI Extension 테스트
    await this.testSimpleAIExtension();

    // 5. 모든 확장 모듈 동시 사용 테스트
    await this.testAllExtensionsTogether();

    // 결과 출력
    this.printResults();
  }

  // 1. 기본 SDK 기능 테스트
  async testBasicSDK(): Promise<void> {
    console.log('📦 기본 SDK 기능 테스트...');

    try {
      // SDK 초기화
      await LockLearn.initialize({
        partnerId: 'test-partner-001',
        apiKey: 'test-api-key-123',
        baseURL: 'https://api.locklearn.com/v1',
        autoSync: false, // 테스트용으로 비활성화
        debug: true
      });

      this.addResult('SDK 초기화', true, 'SDK가 정상적으로 초기화됨');

      // 사용자 인증 테스트
      const profile = await LockLearn.authenticateUser('test-user-001', 'test-token');
      this.addResult('사용자 인증', !!profile, '사용자 인증 완료');

      // 틀린 답변 추가 테스트
      await LockLearn.addWrongAnswer({
        questionId: 'test-q-001',
        question: 'TypeScript에서 never 타입의 용도는?',
        correctAnswer: '함수가 절대 반환하지 않음을 나타냄',
        userAnswer: '빈 객체를 나타냄',
        category: 'programming',
        difficulty: 'medium',
        timestamp: new Date().toISOString()
      });

      this.addResult('틀린 답변 추가', true, '틀린 답변이 정상적으로 기록됨');

      // 큐 상태 확인
      const queueStatus = await LockLearn.getQueueStatus();
      this.addResult('큐 상태 조회', !!queueStatus, `큐 크기: ${queueStatus.size}`);

    } catch (error) {
      this.addResult('기본 SDK 테스트', false, `에러: ${error.message}`);
    }
  }

  // 2. Analytics Extension 테스트
  async testAnalyticsExtension(): Promise<void> {
    console.log('📊 Analytics Extension 테스트...');

    try {
      // Analytics 플러그인 설치
      const analyticsPlugin = new RealisticAnalyticsPlugin({
        enabled: true,
        trackingInterval: 1, // 1분 (테스트용)
        retentionDays: 30,
        enableExport: true,
        debugMode: true
      });

      LockLearn.use(analyticsPlugin);
      this.addResult('Analytics 플러그인 설치', true, 'Analytics 확장 모듈이 정상적으로 설치됨');

      // 학습 세션 추적 테스트
      const sessionId = await (LockLearn as any).trackLearningSession({
        userId: 'test-user-001',
        questionsAnswered: 5,
        correctAnswers: 3,
        categories: ['programming', 'typescript'],
        deviceType: 'desktop',
        duration: 300 // 5분
      });

      this.addResult('학습 세션 추적', !!sessionId, `세션 ID: ${sessionId}`);

      // 사용자 진도 조회 테스트
      const userProgress = await (LockLearn as any).getUserProgress('test-user-001');
      this.addResult('사용자 진도 조회', !!userProgress, `정확도: ${userProgress.accuracy}%`);

      // 부서별 요약 조회 테스트
      const deptSummary = await (LockLearn as any).getDepartmentSummary('dev');
      this.addResult('부서별 요약 조회', !!deptSummary, `활성 사용자: ${deptSummary.activeUsers}명`);

      // 분석 리포트 생성 테스트
      const report = await (LockLearn as any).generateAnalyticsReport({
        dateRange: {
          from: '2025-01-01',
          to: '2025-01-31'
        },
        includeUserDetails: true
      });

      this.addResult('분석 리포트 생성', !!report, `리포트 ID: ${report.reportId}`);

      // 참여도 메트릭스 조회 테스트
      const engagement = await (LockLearn as any).getEngagementMetrics();
      this.addResult('참여도 메트릭스', !!engagement, `일일 활성 사용자: ${engagement.dailyActiveUsers}명`);

    } catch (error) {
      this.addResult('Analytics Extension 테스트', false, `에러: ${error.message}`);
    }
  }

  // 3. Notification Learning Extension 테스트
  async testNotificationExtension(): Promise<void> {
    console.log('🔔 Notification Learning Extension 테스트...');

    try {
      // Notification 플러그인 설치
      const notificationPlugin = new NotificationLearningPlugin({
        enabled: true,
        notificationsPerDay: 3,
        quietHours: { start: '22:00', end: '08:00' },
        sessionDuration: 30,
        maxDailyQuestions: 10,
        adaptiveScheduling: true,
        platforms: {
          web: true,
          mobile: false, // 테스트 환경
          desktop: true
        }
      });

      LockLearn.use(notificationPlugin);
      this.addResult('Notification 플러그인 설치', true, 'Notification 확장 모듈이 정상적으로 설치됨');

      // 알림 학습 시작 테스트
      await (LockLearn as any).startNotificationLearning('test-user-001', {
        preferredTimes: ['09:00', '14:00', '19:00'],
        frequency: 'medium',
        categories: ['programming', 'language'],
        difficulty: 'adaptive'
      });

      this.addResult('알림 학습 시작', true, '사용자 알림 학습 스케줄이 설정됨');

      // 학습 일정 업데이트 테스트
      await (LockLearn as any).updateLearningSchedule('test-user-001', {
        frequency: 'high',
        categories: ['programming', 'language', 'general']
      });

      this.addResult('학습 일정 업데이트', true, '학습 일정이 성공적으로 업데이트됨');

      // 퀴즈 알림 응답 시뮬레이션
      const mockResponse = {
        notificationId: 'notif-test-001',
        responseTime: new Date().toISOString(),
        answer: 0,
        confidence: 4
      };

      // 실제 알림이 없으므로 에러 예상 (정상적인 동작)
      try {
        await (LockLearn as any).respondToQuizNotification(mockResponse);
        this.addResult('퀴즈 응답 처리', false, '예상된 에러 없음 (알림이 존재하지 않음)');
      } catch (error) {
        this.addResult('퀴즈 응답 처리', true, '예상된 에러 발생: 알림을 찾을 수 없음');
      }

      // 알림 히스토리 조회 테스트
      const history = await (LockLearn as any).getNotificationHistory('test-user-001', 7);
      this.addResult('알림 히스토리 조회', !!history, `총 알림: ${history.totalNotifications}개`);

      // 알림 빈도 조정 테스트
      await (LockLearn as any).adjustNotificationFrequency('test-user-001', 'decrease');
      this.addResult('알림 빈도 조정', true, '알림 빈도가 성공적으로 조정됨');

    } catch (error) {
      this.addResult('Notification Extension 테스트', false, `에러: ${error.message}`);
    }
  }

  // 4. Simple AI Extension 테스트
  async testSimpleAIExtension(): Promise<void> {
    console.log('🤖 Simple AI Extension 테스트...');

    try {
      // Simple AI 플러그인 설치
      const aiPlugin = new SimpleAIPlugin({
        enabled: true,
        serverEndpoint: 'https://api.locklearn.com/ai/v1',
        cacheEnabled: true,
        cacheDuration: 30,
        fallbackToRules: true,
        debugMode: true
      });

      LockLearn.use(aiPlugin);
      this.addResult('Simple AI 플러그인 설치', true, 'AI 확장 모듈이 정상적으로 설치됨');

      // 학습자 프로필 조회 테스트
      const learnerProfile = await (LockLearn as any).getLearnerProfile('test-user-001');
      this.addResult('학습자 프로필 조회', !!learnerProfile, `학습 스타일: ${learnerProfile.learningStyle}`);

      // 학습 이벤트 기반 프로필 업데이트 테스트
      const updatedProfile = await (LockLearn as any).updateLearnerProfile('test-user-001', {
        questionId: 'test-q-002',
        category: 'programming',
        difficulty: 0.6,
        correct: true,
        timeSpent: 15,
        confidence: 0.8
      });

      this.addResult('프로필 업데이트', !!updatedProfile, `선호 난이도: ${updatedProfile.preferredDifficulty}`);

      // 개인화된 추천 생성 테스트
      const recommendations = await (LockLearn as any).getPersonalizedRecommendations('test-user-001', {
        currentTime: new Date(),
        availableTime: 30,
        sessionGoal: 'review'
      });

      this.addResult('개인화 추천 생성', Array.isArray(recommendations), `추천 개수: ${recommendations.length}`);

      // 적응형 학습 경로 조회 테스트
      const learningPath = await (LockLearn as any).getAdaptiveLearningPath('test-user-001');
      this.addResult('적응형 학습 경로', !!learningPath, `현재 레벨: ${learningPath.currentLevel}`);

      // 난이도 적응 테스트
      const difficultyResult = await (LockLearn as any).adaptDifficulty('test-user-001', 0.5, [
        { correct: true, timeSpent: 10 },
        { correct: true, timeSpent: 8 },
        { correct: false, timeSpent: 25 }
      ]);

      this.addResult('난이도 적응', !!difficultyResult, `새 난이도: ${difficultyResult.newDifficulty}`);

      // 최적 학습 시간 예측 테스트
      const optimalTime = await (LockLearn as any).predictOptimalStudyTime('test-user-001');
      this.addResult('최적 학습 시간 예측', !!optimalTime, `추천 시간 개수: ${optimalTime.recommendedTimes.length}`);

    } catch (error) {
      this.addResult('Simple AI Extension 테스트', false, `에러: ${error.message}`);
    }
  }

  // 5. 모든 확장 모듈 동시 사용 테스트
  async testAllExtensionsTogether(): Promise<void> {
    console.log('🔄 모든 확장 모듈 통합 테스트...');

    try {
      // 실제 학습 시나리오 시뮬레이션
      console.log('   📚 학습 시나리오 시뮬레이션 시작...');

      // 1. 학습 세션 시작
      const sessionId = await (LockLearn as any).trackLearningSession({
        userId: 'integration-test-user',
        questionsAnswered: 8,
        correctAnswers: 6,
        categories: ['programming', 'typescript', 'ai'],
        deviceType: 'desktop',
        duration: 480 // 8분
      });

      // 2. AI 프로필 업데이트
      await (LockLearn as any).updateLearnerProfile('integration-test-user', {
        questionId: 'integration-q-001',
        category: 'programming',
        difficulty: 0.7,
        correct: true,
        timeSpent: 20
      });

      // 3. 틀린 답변 기록
      await LockLearn.addWrongAnswer({
        userId: 'integration-test-user',
        questionId: 'integration-q-002',
        question: 'React에서 useEffect의 의존성 배열이 빈 배열일 때의 동작은?',
        correctAnswer: '컴포넌트가 마운트될 때만 실행',
        userAnswer: '렌더링될 때마다 실행',
        category: 'programming',
        difficulty: 'medium'
      });

      // 4. 개인화 추천 받기
      const recommendations = await (LockLearn as any).getPersonalizedRecommendations('integration-test-user');

      // 5. 알림 학습 설정
      await (LockLearn as any).startNotificationLearning('integration-test-user', {
        preferredTimes: ['10:00', '15:00'],
        frequency: 'medium',
        categories: ['programming']
      });

      // 6. 분석 리포트 생성
      const report = await (LockLearn as any).generateAnalyticsReport({
        dateRange: {
          from: '2025-01-01',
          to: '2025-01-31'
        }
      });

      this.addResult('통합 시나리오 실행', true, '모든 확장 모듈이 정상적으로 연동됨');

      // 7. 데이터 일관성 확인
      const userProgress = await (LockLearn as any).getUserProgress('integration-test-user');
      const learnerProfile = await (LockLearn as any).getLearnerProfile('integration-test-user');

      const isDataConsistent = userProgress.userId === learnerProfile.userId;
      this.addResult('데이터 일관성 확인', isDataConsistent, '모든 모듈에서 일관된 사용자 데이터 확인');

      // 8. 성능 메트릭스 확인
      const engagement = await (LockLearn as any).getEngagementMetrics();
      this.addResult('성능 메트릭스', !!engagement, `참여도 트렌드: ${engagement.engagementTrend}`);

    } catch (error) {
      this.addResult('통합 테스트', false, `에러: ${error.message}`);
    }
  }

  // 테스트 결과 기록
  private addResult(test: string, passed: boolean, message: string): void {
    this.testResults.push({ test, passed, message });
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${test}: ${message}`);
  }

  // 최종 결과 출력
  private printResults(): void {
    console.log('\n📋 테스트 결과 요약');
    console.log('='.repeat(50));

    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;

    console.log(`총 테스트: ${total}`);
    console.log(`성공: ${passed} ✅`);
    console.log(`실패: ${failed} ❌`);
    console.log(`성공률: ${Math.round((passed / total) * 100)}%`);

    if (failed > 0) {
      console.log('\n❌ 실패한 테스트:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
    }

    console.log('\n🎯 통합 테스트 완료!');
    
    if (passed / total >= 0.8) {
      console.log('✨ SDK와 확장 모듈들이 성공적으로 통합되었습니다!');
    } else {
      console.log('⚠️  일부 기능에 문제가 있습니다. 로그를 확인해주세요.');
    }
  }
}

// 메인 실행부
export async function runIntegrationTests(): Promise<void> {
  const tester = new LockLearnIntegrationTest();
  await tester.runAllTests();
}

// 브라우저/Node.js 환경에서 직접 실행 가능
if (typeof window !== 'undefined') {
  // 브라우저 환경
  (window as any).runLockLearnTests = runIntegrationTests;
  console.log('💡 브라우저 콘솔에서 runLockLearnTests() 를 실행하여 테스트를 시작할 수 있습니다.');
} else {
  // Node.js 환경
  runIntegrationTests().catch(console.error);
}

export default LockLearnIntegrationTest;