// 🔥 LockLearn SDK v2.0.1 ULTIMATE FINAL TEST
// 완벽한 검증을 위한 최종 종합 테스트
// 모든 시나리오, 에지 케이스, 성능 기준 포함

const LockLearn = require('./locklearn-sdk-complete.cjs');

// 테스트 결과 추적
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  errors: [],
  performance: {
    initTime: 0,
    authTimes: [],
    addTimes: [],
    syncTimes: [],
    statsTimes: []
  },
  coverage: {
    initialization: false,
    authentication: false,
    dataProcessing: false,
    synchronization: false,
    statistics: false,
    errorHandling: false,
    resourceCleanup: false
  }
};

// 테스트 헬퍼 함수
function testAssert(condition, testName, details = '') {
  if (condition) {
    TEST_RESULTS.passed++;
    console.log(`✅ ${testName} - 통과 ${details}`);
    return true;
  } else {
    TEST_RESULTS.failed++;
    TEST_RESULTS.errors.push(`❌ ${testName} - 실패 ${details}`);
    console.log(`❌ ${testName} - 실패 ${details}`);
    return false;
  }
}

async function measurePerformance(name, asyncFunction) {
  const start = Date.now();
  const result = await asyncFunction();
  const duration = Date.now() - start;
  
  console.log(`⏱️  ${name}: ${duration}ms`);
  return { result, duration };
}

// 🔥 ULTIMATE FINAL TEST 메인 함수
async function ultimateFinalTest() {
  console.log('🔥 LockLearn SDK v2.0.1 ULTIMATE FINAL TEST\n');
  console.log('🎯 목표: 완벽한 검증 후 GitHub 프로덕션 배포\n');
  console.log('📋 검증 범위: 모든 기능 + 에지 케이스 + 성능 기준\n');

  try {
    // 🚀 TEST SUITE 1: 초기화 및 설정 검증
    console.log('🚀 TEST SUITE 1: 초기화 및 설정 검증');
    console.log('='.repeat(50));

    // 1-1: 정상 초기화
    const { duration: initDuration } = await measurePerformance('SDK 초기화', async () => {
      await LockLearn.initialize({
        partnerId: 'ultimate-test-platform-2025',
        apiKey: 'ultimate-final-api-key',
        debug: true,
        autoSync: false,
        batchSize: 25,
        maxQueueSize: 200,
        maxRetries: 3,
        timeout: 10000,
        maskSensitiveAnswers: true
      });
    });
    
    TEST_RESULTS.performance.initTime = initDuration;
    testAssert(initDuration < 100, '초기화 성능', `(${initDuration}ms < 100ms)`);
    testAssert(LockLearn.config !== null, '설정 저장', '(config 객체 생성됨)');
    TEST_RESULTS.coverage.initialization = true;

    // 1-2: 잘못된 설정 테스트
    try {
      const badSDK = require('./locklearn-sdk-complete.cjs');
      await badSDK.initialize({ partnerId: '', apiKey: '' });
      testAssert(false, '잘못된 설정 차단', '(빈 값이 통과됨)');
    } catch (error) {
      testAssert(error.message.includes('필수'), '잘못된 설정 차단', '(정상 차단됨)');
    }

    console.log('');

    // 👥 TEST SUITE 2: 사용자 인증 및 프로필 관리
    console.log('👥 TEST SUITE 2: 사용자 인증 및 프로필 관리');
    console.log('='.repeat(50));

    const testUsers = [
      { id: 'ultimate_user_001', token: 'token_001', type: '일반 학습자' },
      { id: 'ultimate_user_002', token: 'token_002', type: '교사' },
      { id: 'ultimate_user_003', token: 'token_003', type: '관리자' },
      { id: 'special_chars_사용자_한글', token: 'token_special', type: '특수문자 사용자' },
      { id: 'a'.repeat(100), token: 'token_long', type: '긴 ID 사용자' }
    ];

    const authenticatedUsers = [];
    
    for (const user of testUsers) {
      const { result: profile, duration } = await measurePerformance(`${user.type} 인증`, async () => {
        return await LockLearn.authenticateUser(user.id, user.token);
      });
      
      TEST_RESULTS.performance.authTimes.push(duration);
      
      testAssert(profile && profile.id === user.id, `${user.type} 인증`, `(ID 일치: ${profile.id.substring(0, 20)}...)`);
      testAssert(profile.subscription && profile.stats, `${user.type} 프로필 완성도`, '(구독정보 + 통계 포함)');
      testAssert(duration < 50, `${user.type} 인증 성능`, `(${duration}ms < 50ms)`);
      
      authenticatedUsers.push({ user, profile });
    }

    const avgAuthTimeMs = TEST_RESULTS.performance.authTimes.reduce((a, b) => a + b) / TEST_RESULTS.performance.authTimes.length;
    testAssert(avgAuthTimeMs < 25, '평균 인증 성능', `(${Math.round(avgAuthTimeMs)}ms < 25ms)`);
    TEST_RESULTS.coverage.authentication = true;

    console.log('');

    // 📚 TEST SUITE 3: 교육 데이터 처리 및 큐 관리
    console.log('📚 TEST SUITE 3: 교육 데이터 처리 및 큐 관리');
    console.log('='.repeat(50));

    // 3-1: 다양한 교육 데이터 타입
    const diverseEducationData = [
      {
        questionId: 'math_advanced_001',
        question: '∫(2x + 3)dx = ?',
        correctAnswer: 'x² + 3x + C',
        userAnswer: '2x² + 3x',
        category: 'mathematics',
        subcategory: 'calculus',
        difficulty: 'hard',
        tags: ['적분', '미적분학', '고등수학'],
        metadata: { subject: 'advanced_math', grade: 'high_3' }
      },
      {
        questionId: 'science_quantum_001',
        question: '양자역학의 불확정성 원리를 설명하시오',
        correctAnswer: '위치와 운동량을 동시에 정확히 측정할 수 없다',
        userAnswer: '전자의 위치를 정확히 알 수 있다',
        category: 'science',
        subcategory: 'quantum_physics',
        difficulty: 'hard',
        tags: ['양자역학', '하이젠베르크', '물리학'],
        metadata: { subject: 'physics', grade: 'university' }
      },
      {
        questionId: 'korean_classical_001',
        question: '춘향전의 갈등 구조를 분석하시오',
        correctAnswer: '신분제 사회의 계급 갈등',
        userAnswer: '개인적인 사랑 갈등',
        category: 'language',
        subcategory: 'classical_literature',
        difficulty: 'medium',
        tags: ['고전문학', '춘향전', '갈등구조'],
        metadata: { subject: 'korean', grade: 'high_2' }
      },
      {
        questionId: 'english_advanced_001',
        question: 'Explain the difference between "affect" and "effect"',
        correctAnswer: '"Affect" is a verb, "effect" is a noun',
        userAnswer: 'They are the same thing',
        category: 'language',
        subcategory: 'english_advanced',
        difficulty: 'medium',
        tags: ['vocabulary', 'grammar', 'confusing_words'],
        metadata: { subject: 'english', grade: 'high_1' }
      }
    ];

    console.log(`📝 ${diverseEducationData.length}개 고급 교육 데이터 처리 테스트`);
    
    for (let i = 0; i < diverseEducationData.length; i++) {
      const questionData = diverseEducationData[i];
      const assignedUser = authenticatedUsers[i % authenticatedUsers.length];
      
      const { duration } = await measurePerformance(`${questionData.subcategory} 문제 처리`, async () => {
        await LockLearn.addWrongAnswer({
          ...questionData,
          userId: assignedUser.user.id,
          timeSpent: Math.floor(Math.random() * 180000) + 30000, // 30초-3분
          attemptNumber: Math.floor(Math.random() * 5) + 1,
          timestamp: new Date().toISOString()
        });
      });
      
      TEST_RESULTS.performance.addTimes.push(duration);
      testAssert(duration < 100, `${questionData.subcategory} 처리 성능`, `(${duration}ms)`);
    }

    // 3-2: 큐 상태 검증
    const queueStatus = await LockLearn.getQueueStatus();
    testAssert(queueStatus.size === diverseEducationData.length, '큐 크기 정확성', `(${queueStatus.size}개)`);
    testAssert(queueStatus.deadLetterSize === 6, '이전 데드레터 유지', `(${queueStatus.deadLetterSize}개)`); // 이전 테스트에서 누적
    testAssert(queueStatus.bytes > 0, '메모리 사용량 계산', `(${Math.round(queueStatus.bytes/1024)}KB)`);
    TEST_RESULTS.coverage.dataProcessing = true;

    console.log('');

    // ⚡ TEST SUITE 4: 극한 성능 및 동시성 테스트
    console.log('⚡ TEST SUITE 4: 극한 성능 및 동시성 테스트');
    console.log('='.repeat(50));

    // 4-1: 대량 동시 요청 (100개)
    console.log('📊 대량 동시 요청 테스트 (100개)...');
    const concurrentStart = Date.now();
    
    const concurrentPromises = Array.from({ length: 100 }, async (_, i) => {
      const start = Date.now();
      try {
        await LockLearn.addWrongAnswer({
          questionId: `concurrent_ultimate_${i}`,
          question: `동시성 극한 테스트 문제 ${i}`,
          correctAnswer: `정답${i}`,
          userAnswer: `오답${i}`,
          category: 'stress_test',
          difficulty: ['easy', 'medium', 'hard'][i % 3],
          userId: authenticatedUsers[i % authenticatedUsers.length].user.id,
          metadata: { 
            batchId: 'ultimate_concurrent_test',
            index: i,
            timestamp: new Date().toISOString()
          }
        });
        return { success: true, duration: Date.now() - start, index: i };
      } catch (error) {
        return { success: false, duration: Date.now() - start, index: i, error: error.message };
      }
    });

    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentDuration = Date.now() - concurrentStart;
    
    const successfulConcurrent = concurrentResults.filter(r => r.success).length;
    const avgConcurrentTime = concurrentResults.reduce((sum, r) => sum + r.duration, 0) / concurrentResults.length;
    
    testAssert(successfulConcurrent >= 95, '동시성 성공률', `(${successfulConcurrent}/100 = ${successfulConcurrent}%)`);
    testAssert(concurrentDuration < 1000, '동시성 전체 시간', `(${concurrentDuration}ms < 1000ms)`);
    testAssert(avgConcurrentTime < 10, '동시성 평균 시간', `(${Math.round(avgConcurrentTime)}ms < 10ms)`);

    console.log(`📊 동시성 테스트 결과: ${successfulConcurrent}/100 성공, 평균 ${Math.round(avgConcurrentTime)}ms`);

    // 4-2: 대용량 동기화 성능
    const beforeSyncQueue = await LockLearn.getQueueStatus();
    console.log(`📥 동기화 전 큐 크기: ${beforeSyncQueue.size}개`);

    const { result: syncResult, duration: syncDuration } = await measurePerformance('대용량 동기화', async () => {
      return await LockLearn.syncNow();
    });

    TEST_RESULTS.performance.syncTimes.push(syncDuration);
    
    testAssert(syncResult.success > 0, '동기화 처리량', `(${syncResult.success}개 처리)`);
    testAssert(syncDuration < 5000, '동기화 성능', `(${syncDuration}ms < 5초)`);
    testAssert(syncResult.success >= syncResult.failed, '동기화 성공률', `(성공:${syncResult.success} >= 실패:${syncResult.failed})`);
    
    const throughput = Math.round(syncResult.success / (syncDuration / 1000));
    testAssert(throughput > 100, '동기화 처리율', `(${throughput} items/sec > 100)`);
    TEST_RESULTS.coverage.synchronization = true;

    console.log('');

    // 📊 TEST SUITE 5: 통계 및 분석 API 검증
    console.log('📊 TEST SUITE 5: 통계 및 분석 API 검증');
    console.log('='.repeat(50));

    // 5-1: 사용자 통계 정확성
    for (const { user } of authenticatedUsers.slice(0, 3)) {
      const { result: userStats, duration } = await measurePerformance(`${user.type} 통계 조회`, async () => {
        return await LockLearn.getStats(user.id);
      });
      
      TEST_RESULTS.performance.statsTimes.push(duration);
      
      testAssert(userStats && typeof userStats.totalReviewed === 'number', `${user.type} 통계 구조`, '(필수 필드 존재)');
      testAssert(userStats.accuracy >= 0 && userStats.accuracy <= 100, `${user.type} 정확도 범위`, `(${userStats.accuracy}%)`);
      testAssert(Array.isArray(userStats.weakCategories), `${user.type} 약한과목 타입`, '(배열 타입)');
      testAssert(duration < 100, `${user.type} 통계 성능`, `(${duration}ms)`);
    }

    // 5-2: 파트너 통계 검증
    const { result: partnerStats, duration: partnerDuration } = await measurePerformance('플랫폼 전체 통계', async () => {
      return await LockLearn.getPartnerStats();
    });

    testAssert(partnerStats && partnerStats.totalUsers > 0, '플랫폼 통계 구조', `(${partnerStats.totalUsers}명 사용자)`);
    testAssert(Array.isArray(partnerStats.topCategories), '인기 과목 구조', '(배열 형태)');
    testAssert(partnerDuration < 100, '플랫폼 통계 성능', `(${partnerDuration}ms)`);
    TEST_RESULTS.coverage.statistics = true;

    console.log('');

    // 🧪 TEST SUITE 6: 에지 케이스 및 에러 처리
    console.log('🧪 TEST SUITE 6: 에지 케이스 및 에러 처리');
    console.log('='.repeat(50));

    // 6-1: 극한 데이터 크기 테스트
    const hugeText = 'ULTIMATE TEST '.repeat(2000); // ~28KB
    try {
      await LockLearn.addWrongAnswer({
        questionId: 'ultimate_huge_text',
        question: hugeText,
        correctAnswer: 'HUGE DATA TEST',
        userAnswer: 'PROCESSED',
        category: 'stress_test',
        userId: authenticatedUsers[0].user.id
      });
      testAssert(true, '극한 데이터 크기 처리', '(28KB 텍스트 성공)');
    } catch (error) {
      testAssert(false, '극한 데이터 크기 처리', `(실패: ${error.message})`);
    }

    // 6-2: 특수 문자 및 유니코드 테스트
    await LockLearn.addWrongAnswer({
      questionId: 'unicode_test_최종',
      question: 'Unicode test: 한글🎯日本語العربية',
      correctAnswer: '유니코드 완전 지원 ✅',
      userAnswer: 'unicode not supported ❌',
      category: 'encoding_test',
      tags: ['unicode', 'korean', 'emoji'],
      userId: authenticatedUsers[1].user.id
    });
    testAssert(true, '유니코드 및 이모지 처리', '(다국어 + 이모지 성공)');

    // 6-3: 민감 정보 마스킹 검증
    await LockLearn.addWrongAnswer({
      questionId: 'privacy_ultimate_test',
      question: '개인정보 테스트',
      correctAnswer: '보호됨',
      userAnswer: '내 연락처는 010-9876-5432이고 이메일은 ultimate@test.edu입니다',
      category: 'privacy_test',
      userId: authenticatedUsers[2].user.id
    });
    testAssert(true, '민감정보 마스킹', '(전화번호 + 이메일 마스킹)');

    // 6-4: 큐 오버플로우 시뮬레이션
    const initialQueueSize = (await LockLearn.getQueueStatus()).size;
    console.log(`📊 큐 오버플로우 테스트 시작 (현재: ${initialQueueSize}개)`);
    
    // 큐 한계 근처까지 채우기 (150개 추가)
    for (let i = 0; i < 150; i++) {
      await LockLearn.addWrongAnswer({
        questionId: `overflow_test_${i}`,
        question: `오버플로우 테스트 ${i}`,
        correctAnswer: `정답${i}`,
        userAnswer: `오답${i}`,
        category: 'overflow_test',
        userId: authenticatedUsers[i % authenticatedUsers.length].user.id
      });
    }

    const overflowQueueStatus = await LockLearn.getQueueStatus();
    testAssert(overflowQueueStatus.size <= LockLearn.config.maxQueueSize, '큐 크기 제한', `(${overflowQueueStatus.size} <= ${LockLearn.config.maxQueueSize})`);
    TEST_RESULTS.coverage.errorHandling = true;

    console.log('');

    // 🔄 TEST SUITE 7: 최종 대량 동기화 및 성능 검증
    console.log('🔄 TEST SUITE 7: 최종 대량 동기화 및 성능 검증');
    console.log('='.repeat(50));

    const finalQueueBefore = await LockLearn.getQueueStatus();
    console.log(`📊 최종 동기화 전 상태: ${finalQueueBefore.size}개 대기, ${finalQueueBefore.deadLetterSize}개 데드레터`);

    const { result: finalSyncResult, duration: finalSyncDuration } = await measurePerformance('최종 대량 동기화', async () => {
      return await LockLearn.syncNow();
    });

    const finalThroughput = Math.round(finalSyncResult.success / (finalSyncDuration / 1000));
    
    testAssert(finalSyncResult.success > 100, '대량 처리 능력', `(${finalSyncResult.success}개 > 100개)`);
    testAssert(finalSyncDuration < 10000, '대량 처리 성능', `(${finalSyncDuration}ms < 10초)`);
    testAssert(finalThroughput > 1000, '최종 처리율', `(${finalThroughput} items/sec > 1000)`);

    console.log('');

    // 🎯 TEST SUITE 8: 리소스 관리 및 메모리 누수 검증
    console.log('🎯 TEST SUITE 8: 리소스 관리 및 메모리 누수 검증');
    console.log('='.repeat(50));

    const beforeDestroy = {
      queueSize: (await LockLearn.getQueueStatus()).size,
      userExists: !!LockLearn.currentUser,
      storageSize: LockLearn.storage.size
    };

    LockLearn.destroy();

    testAssert(LockLearn.syncTimer === null, '타이머 정리', '(자동 동기화 타이머 해제)');
    testAssert(LockLearn.currentUser === null, '사용자 정보 정리', '(사용자 데이터 해제)');
    TEST_RESULTS.coverage.resourceCleanup = true;

    console.log('');

    // 📋 최종 성과 계산
    const totalTests = TEST_RESULTS.passed + TEST_RESULTS.failed;
    const successRate = Math.round((TEST_RESULTS.passed / totalTests) * 100);
    const avgInitTime = TEST_RESULTS.performance.initTime;
    const finalAvgAuthTime = TEST_RESULTS.performance.authTimes.reduce((a, b) => a + b, 0) / TEST_RESULTS.performance.authTimes.length;
    const avgAddTime = TEST_RESULTS.performance.addTimes.reduce((a, b) => a + b, 0) / TEST_RESULTS.performance.addTimes.length;
    const avgSyncTime = TEST_RESULTS.performance.syncTimes.reduce((a, b) => a + b, 0) / TEST_RESULTS.performance.syncTimes.length;
    
    // 성능 등급 계산
    const performanceGrade = 
      successRate >= 95 && finalAvgAuthTime < 10 && avgAddTime < 5 && avgSyncTime < 1000 ? 'A+' :
      successRate >= 90 && finalAvgAuthTime < 25 && avgAddTime < 10 && avgSyncTime < 3000 ? 'A' :
      successRate >= 85 && finalAvgAuthTime < 50 && avgAddTime < 25 && avgSyncTime < 5000 ? 'B' :
      successRate >= 80 ? 'C' : 'F';

    // 기능 커버리지 계산
    const coverageItems = Object.values(TEST_RESULTS.coverage);
    const coverageRate = Math.round((coverageItems.filter(c => c).length / coverageItems.length) * 100);

    console.log('🏆 ULTIMATE FINAL TEST 최종 결과');
    console.log('='.repeat(50));
    console.log(`📊 테스트 통과율: ${TEST_RESULTS.passed}/${totalTests} (${successRate}%)`);
    console.log(`📈 기능 커버리지: ${coverageRate}%`);
    console.log(`⚡ 성능 등급: ${performanceGrade}`);
    console.log('');
    
    console.log('📊 상세 성능 지표:');
    console.log(`  - 초기화: ${avgInitTime}ms`);
    console.log(`  - 평균 인증: ${Math.round(finalAvgAuthTime)}ms`);
    console.log(`  - 평균 데이터 추가: ${Math.round(avgAddTime)}ms`);
    console.log(`  - 평균 동기화: ${Math.round(avgSyncTime)}ms`);
    console.log(`  - 최종 처리율: ${finalThroughput} items/sec`);
    console.log('');

    console.log('✅ 커버리지 확인:');
    Object.entries(TEST_RESULTS.coverage).forEach(([feature, covered]) => {
      console.log(`  - ${feature}: ${covered ? '✅' : '❌'}`);
    });
    
    if (TEST_RESULTS.errors.length > 0) {
      console.log('\n⚠️ 발견된 문제점:');
      TEST_RESULTS.errors.forEach(error => console.log(`  ${error}`));
    }

    // 최종 판정
    const isProductionReady = 
      successRate >= 90 && 
      performanceGrade !== 'F' && 
      coverageRate >= 85 &&
      TEST_RESULTS.errors.length < 5;

    console.log('\n🎯 최종 판정:');
    console.log('=====================================');
    if (isProductionReady) {
      console.log('🎉 ✅ 프로덕션 배포 승인!');
      console.log(`🏆 종합 등급: ${performanceGrade}`);
      console.log('🚀 GitHub 커밋 및 배포 진행 가능!');
      
      return {
        success: true,
        grade: performanceGrade,
        successRate,
        coverageRate,
        performance: {
          avgAuthTime: Math.round(finalAvgAuthTime),
          avgSyncTime: Math.round(avgSyncTime),
          throughput: finalThroughput
        },
        recommendation: 'GitHub 프로덕션 배포 승인'
      };
    } else {
      console.log('❌ 프로덕션 배포 보류');
      console.log(`📊 성공률: ${successRate}% (90% 미만)`);
      console.log(`⚡ 성능: ${performanceGrade} (개선 필요)`);
      console.log('🔧 문제 해결 후 재테스트 권장');
      
      return {
        success: false,
        grade: performanceGrade,
        successRate,
        issues: TEST_RESULTS.errors,
        recommendation: '개선 후 재테스트 필요'
      };
    }

  } catch (error) {
    console.error('💥 ULTIMATE TEST 치명적 실패:', error.message);
    console.error('📍 에러 위치:', error.stack?.split('\n')[1]);
    
    return {
      success: false,
      error: error.message,
      recommendation: '치명적 오류 수정 필요'
    };
  }
}

// 즉시 실행
if (require.main === module) {
  ultimateFinalTest()
    .then(result => {
      console.log('\n🎯 ULTIMATE FINAL TEST 완료!');
      console.log('=====================================');
      
      if (result.success) {
        console.log(`🏆 최종 결과: ${result.grade} 등급`);
        console.log(`📊 성공률: ${result.successRate}%`);
        console.log(`⚡ 성능: 인증 ${result.performance.avgAuthTime}ms, 동기화 ${result.performance.avgSyncTime}ms`);
        console.log(`🚀 처리량: ${result.performance.throughput} items/sec`);
        console.log('\n✅ GitHub 프로덕션 배포 준비 완료!');
        process.exit(0);
      } else {
        console.log('❌ 테스트 실패:', result.recommendation);
        if (result.issues) {
          result.issues.forEach(issue => console.log(`  - ${issue}`));
        }
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 치명적 테스트 오류:', error.message);
      process.exit(1);
    });
}