import { LockLearnClient } from './LockLearnClient';

describe('LockLearnClient', () => {
  let client: LockLearnClient;

  beforeEach(() => {
    client = LockLearnClient.getInstance();
  });

  test('should create singleton instance', () => {
    const instance1 = LockLearnClient.getInstance();
    const instance2 = LockLearnClient.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should initialize with config', async () => {
    const config = {
      partnerId: 'test-partner',
      apiKey: 'test-key',
      debug: true
    };

    await expect(client.initialize(config)).resolves.toBeUndefined();
  });

  test('should authenticate user', async () => {
    await client.initialize({ partnerId: 'test', apiKey: 'test' });
    
    const profile = await client.authenticateUser('user-123', 'token-456');
    
    expect(profile).toBeDefined();
    expect(profile.id).toBe('user-123');
    expect(profile.partnerId).toBe('mock');
  });

  test('should handle wrong answers', async () => {
    await client.initialize({ partnerId: 'test', apiKey: 'test' });
    
    const wrongAnswer = {
      question: '수도는?',
      correctAnswer: '서울',
      userAnswer: '부산',
      category: 'geography'
    };

    await expect(client.addWrongAnswer(wrongAnswer)).resolves.toBeUndefined();
  });

  test('should get queue status', async () => {
    const status = await client.getQueueStatus();
    
    expect(status).toBeDefined();
    expect(typeof status.size).toBe('number');
    expect(typeof status.deadLetterSize).toBe('number');
  });

  test('should sync data', async () => {
    const result = await client.syncNow();
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('number');
    expect(typeof result.failed).toBe('number');
  });
});