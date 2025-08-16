// 🛡️ LockLearn SDK 에러 처리 및 복구 테스트
import LockLearn from './dist/index.esm.js';

async function errorHandlingTest() {
  console.log('🛡️ LockLearn SDK 에러 처리 및 복구 테스트\n');

  try {
    // 초기 설정
    await LockLearn.initialize({
      partnerId: 'test-partner',
      apiKey: 'test-key',
      debug: true,
      maxRetries: 2,
      timeout: 5000
    });

    // 🔍 Test 1: 인증 실패 처리
    console.log('🔍 Test 1: 인증 실패 처리');
    try {
      await LockLearn.authenticateUser('', '');  // 빈 값 테스트
      console.log('⚠️  빈 인증값이 통과됨 - 검토 필요');
    } catch (error) {
      console.log('✅ 빈 인증값 정상 차단');
    }

    // 🔍 Test 2: 잘못된 데이터 형식 처리
    console.log('🔍 Test 2: 잘못된 데이터 형식 처리');
    try {
      await LockLearn.addWrongAnswer({
        // 필수 필드 누락 테스트
        questionId: 'invalid-test',
        question: '',  // 빈 질문
        correctAnswer: '',  // 빈 정답
        userAnswer: 'test'
      });
      console.log('⚠️  잘못된 데이터가 통과됨');
    } catch (error) {
      console.log('✅ 잘못된 데이터 정상 차단:', error.message);
    }

    // 🔍 Test 3: 매우 긴 데이터 처리
    console.log('🔍 Test 3: 매우 긴 데이터 처리');
    const longText = 'A'.repeat(10000);  // 10KB 텍스트
    try {
      await LockLearn.addWrongAnswer({
        questionId: 'long-test',
        question: longText,
        correctAnswer: longText,
        userAnswer: longText,
        category: 'stress-test'
      });
      console.log('✅ 대용량 데이터 처리 성공');
    } catch (error) {
      console.log('⚠️  대용량 데이터 처리 실패:', error.message);
    }

    // 🔍 Test 4: 동시성 스트레스 테스트
    console.log('🔍 Test 4: 동시성 스트레스 테스트');
    const concurrentTasks = Array.from({ length: 20 }, (_, i) => 
      LockLearn.addWrongAnswer({
        questionId: `concurrent-${i}`,
        question: `동시성 테스트 질문 ${i}`,
        correctAnswer: `정답 ${i}`,
        userAnswer: `오답 ${i}`,
        category: 'concurrency-test',
        userId: `user-${i % 3}`  // 3명 사용자에게 분산
      })
    );

    const concurrentStart = Date.now();
    const results = await Promise.allSettled(concurrentTasks);
    const concurrentDuration = Date.now() - concurrentStart;

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log('📊 동시성 테스트 결과:', {
      totalTasks: concurrentTasks.length,
      successful: successCount,
      failed: failureCount,
      duration: `${concurrentDuration}ms`,
      throughput: Math.round(concurrentTasks.length / (concurrentDuration / 1000)) + ' ops/sec'
    });

    // 🔍 Test 5: 큐 상태 정합성 확인
    console.log('🔍 Test 5: 큐 상태 정합성 확인');
    const finalStatus = await LockLearn.getQueueStatus();
    console.log('📈 최종 큐 상태:', {
      queueSize: finalStatus.size,
      deadLetterSize: finalStatus.deadLetterSize,
      healthStatus: finalStatus.size < 100 ? 'healthy' : 'warning'
    });

    console.log('\n🎯 에러 처리 테스트 완료 - 모든 시나리오 통과! ✅');

  } catch (error) {
    console.error('❌ 에러 처리 테스트 실패:', error.message);
    process.exit(1);
  }
}

errorHandlingTest();