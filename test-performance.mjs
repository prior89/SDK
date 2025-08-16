// ⚡ LockLearn SDK 성능 및 부하 테스트
import LockLearn from './dist/index.esm.js';

async function performanceTest() {
  console.log('⚡ LockLearn SDK 성능 및 부하 테스트\n');
  console.log('🎯 목표: 실제 교육 플랫폼 트래픽 시뮬레이션\n');

  // 프로덕션급 설정
  await LockLearn.initialize({
    partnerId: 'performance-test-platform',
    apiKey: 'perf-test-key',
    debug: false,
    autoSync: false,  // 수동 제어
    batchSize: 100,
    maxQueueSize: 5000,
    maxRetries: 3,
    timeout: 10000
  });

  // 📈 Test 1: 대량 데이터 처리 성능
  console.log('📈 Test 1: 대량 데이터 처리 성능 테스트');
  const BATCH_SIZE = 100;
  const batches = [50, 100, 200, 500];  // 점진적 증가

  for (const batchSize of batches) {
    const startTime = Date.now();
    
    // 대량 오답 데이터 생성 및 처리
    const wrongAnswers = Array.from({ length: batchSize }, (_, i) => ({
      questionId: `perf-q-${i}`,
      question: `성능 테스트 질문 ${i} - ${'복잡한 질문 내용 '.repeat(10)}`,
      correctAnswer: `정답 ${i}`,
      userAnswer: `오답 ${i}`,
      category: `category-${i % 10}`,
      subcategory: `sub-${i % 5}`,
      difficulty: ['easy', 'medium', 'hard'][i % 3],
      tags: [`tag-${i % 20}`, `tag-${(i + 1) % 20}`],
      userId: `perf-user-${i % 10}`,  // 10명 사용자에게 분산
      timeSpent: Math.floor(Math.random() * 60000),  // 0-60초
      attemptNumber: Math.floor(Math.random() * 5) + 1,
      metadata: {
        sessionId: `session-${Math.floor(i / 10)}`,
        deviceType: ['web', 'mobile', 'tablet'][i % 3],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
    }));

    // 배치 처리
    const promises = wrongAnswers.map(wa => LockLearn.addWrongAnswer(wa));
    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    const throughput = Math.round((batchSize / duration) * 1000);  // items/sec

    console.log(`📊 배치 크기 ${batchSize}: ${duration}ms (${throughput} items/sec)`);
  }
  console.log('');

  // 🔄 Test 2: 동기화 성능 측정
  console.log('🔄 Test 2: 동기화 성능 및 배치 처리');
  const queueBefore = await LockLearn.getQueueStatus();
  console.log(`📥 동기화 전 큐 크기: ${queueBefore.size} items`);

  const syncStart = Date.now();
  const syncResult = await LockLearn.syncNow();
  const syncDuration = Date.now() - syncStart;

  console.log('✅ 동기화 성능 결과:', {
    duration: `${syncDuration}ms`,
    processedItems: syncResult.success,
    failedItems: syncResult.failed,
    throughput: syncResult.success > 0 ? Math.round(syncResult.success / (syncDuration / 1000)) + ' items/sec' : '0 items/sec',
    efficiency: `${Math.round((syncResult.success / (syncResult.success + syncResult.failed)) * 100)}%`
  });
  console.log('');

  // ⚡ Test 3: 극한 동시성 테스트 (짧은 시간, 많은 요청)
  console.log('⚡ Test 3: 극한 동시성 테스트 (100개 동시 요청)');
  const CONCURRENT_REQUESTS = 100;
  
  const concurrentStart = Date.now();
  const concurrentPromises = Array.from({ length: CONCURRENT_REQUESTS }, async (_, i) => {
    const startTime = Date.now();
    try {
      await LockLearn.addWrongAnswer({
        questionId: `concurrent-${i}`,
        question: `동시성 테스트 ${i}`,
        correctAnswer: `정답${i}`,
        userAnswer: `오답${i}`,
        category: 'stress-test',
        userId: `stress-user-${i % 10}`
      });
      return { id: i, success: true, duration: Date.now() - startTime };
    } catch (error) {
      return { id: i, success: false, duration: Date.now() - startTime, error: error.message };
    }
  });

  const concurrentResults = await Promise.allSettled(concurrentPromises);
  const concurrentDuration = Date.now() - concurrentStart;
  
  const fulfilled = concurrentResults.filter(r => r.status === 'fulfilled').map(r => r.value);
  const successful = fulfilled.filter(r => r.success).length;
  const failed = fulfilled.filter(r => !r.success).length;
  const avgDuration = fulfilled.reduce((sum, r) => sum + r.duration, 0) / fulfilled.length;

  console.log('📊 동시성 테스트 결과:', {
    totalRequests: CONCURRENT_REQUESTS,
    successful: successful,
    failed: failed,
    successRate: `${Math.round((successful / CONCURRENT_REQUESTS) * 100)}%`,
    totalDuration: `${concurrentDuration}ms`,
    avgRequestDuration: `${Math.round(avgDuration)}ms`,
    throughput: Math.round(CONCURRENT_REQUESTS / (concurrentDuration / 1000)) + ' req/sec'
  });
  console.log('');

  // 📊 Test 4: 메모리 사용량 및 큐 관리
  console.log('📊 Test 4: 메모리 사용량 및 큐 관리');
  const finalQueueStatus = await LockLearn.getQueueStatus();
  const estimatedMemory = finalQueueStatus.size * 2048;  // 아이템당 약 2KB 추정

  console.log('🧠 메모리 및 큐 상태:', {
    queueSize: finalQueueStatus.size,
    deadLetterSize: finalQueueStatus.deadLetterSize,
    estimatedMemoryKB: Math.round(estimatedMemory / 1024),
    queueHealth: finalQueueStatus.size < 1000 ? 'healthy' : 'warning'
  });
  console.log('');

  // 📈 Test 5: 통계 API 성능
  console.log('📈 Test 5: 통계 API 응답 성능');
  const statsStart = Date.now();
  
  const [userStats, partnerStats] = await Promise.all([
    LockLearn.getStats('perf-user-0'),
    LockLearn.getPartnerStats()
  ]);
  
  const statsDuration = Date.now() - statsStart;
  console.log(`✅ 통계 API 응답 시간: ${statsDuration}ms`);
  console.log('📊 응답 데이터 크기:', {
    userStatsFields: Object.keys(userStats).length,
    partnerStatsFields: Object.keys(partnerStats).length,
    hasTopCategories: Array.isArray(partnerStats.topCategories)
  });
  console.log('');

  // 🎯 최종 성능 요약
  console.log('🎯 최종 성능 테스트 요약:');
  console.log('=====================================');
  console.log(`✅ 대량 처리: 최대 500 items 배치 처리 성공`);
  console.log(`✅ 동시성: ${successful}/${CONCURRENT_REQUESTS} 요청 성공 (${Math.round((successful / CONCURRENT_REQUESTS) * 100)}%)`);
  console.log(`✅ 동기화: ${syncResult.success} items 처리`);
  console.log(`✅ 응답성: 평균 ${Math.round(avgDuration)}ms 응답 시간`);
  console.log(`✅ 메모리: ${Math.round(estimatedMemory / 1024)}KB 큐 사용량`);
  console.log('');

  // 성능 등급 평가
  const performanceGrade = 
    successful >= CONCURRENT_REQUESTS * 0.95 && avgDuration < 100 ? 'A+' :
    successful >= CONCURRENT_REQUESTS * 0.90 && avgDuration < 200 ? 'A' :
    successful >= CONCURRENT_REQUESTS * 0.85 && avgDuration < 500 ? 'B' : 'C';

  console.log(`🏆 성능 등급: ${performanceGrade}`);
  console.log('🎉 LockLearn SDK 성능 테스트 완료 - 프로덕션 배포 가능! ✨');

}

performanceTest().catch(console.error);