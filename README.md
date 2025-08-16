# LockLearn Partner SDK

LockLearn 플랫폼과 연동하기 위한 TypeScript/JavaScript SDK입니다.

## 📂 프로젝트 구조

```
locklearn-sdk-project/
├── sdk.txt                  # 완전한 SDK 구현 코드
├── sdk/                     # SDK 소스 코드 (모듈화 예정)
└── README.md               # 이 파일
```

## 🚀 주요 기능

- **멀티 플랫폼 지원**: 브라우저, Node.js, React Native
- **오프라인 큐잉**: 네트워크 연결 없이도 데이터 저장
- **자동 동기화**: 백그라운드에서 자동 데이터 전송
- **타입 안전성**: 완전한 TypeScript 지원
- **React 훅**: React 애플리케이션 통합 지원
- **보안**: PII 마스킹, 토큰 자동 갱신

## 🛠️ 기술 스택

- **언어**: TypeScript
- **런타임**: Browser, Node.js 18+, React Native
- **저장소**: localStorage, AsyncStorage, IndexedDB
- **네트워킹**: Fetch API (폴리필 포함)
- **암호화**: Web Crypto API
- **상태 관리**: React Hooks (선택사항)

## 📦 설치

```bash
npm install @locklearn/partner-sdk
```

## 🔧 사용법

### 기본 초기화

```typescript
import LockLearn from '@locklearn/partner-sdk';

await LockLearn.initialize({
  partnerId: 'your-partner-id',
  apiKey: 'your-api-key',
  baseURL: 'https://api.locklearn.com/v1',
  autoSync: true,
  debug: false
});
```

### 사용자 인증

```typescript
const profile = await LockLearn.authenticateUser('user-123', 'user-token');
console.log('사용자 인증됨:', profile);
```

### 틀린 답변 추가

```typescript
await LockLearn.addWrongAnswer({
  questionId: 'q-123',
  question: '수도는 어디인가요?',
  correctAnswer: '서울',
  userAnswer: '부산',
  category: 'geography',
  difficulty: 'easy'
});
```

### React Hook 사용

```typescript
import { useLockLearn } from '@locklearn/partner-sdk/react';

function MyComponent() {
  const {
    isInitialized,
    isConnected,
    authenticateUser,
    addWrongAnswer,
    syncNow,
    stats
  } = useLockLearn({
    config: {
      partnerId: 'your-partner-id',
      apiKey: 'your-api-key'
    },
    autoInit: true
  });

  // 컴포넌트 로직...
}
```

## ⚙️ 설정 옵션

```typescript
interface ConfigOptions {
  // 필수 설정
  partnerId: string;
  apiKey: string;
  baseURL?: string;
  
  // 동기화 설정
  autoSync?: boolean;
  immediateSync?: boolean;
  syncInterval?: number;
  batchSize?: number;
  
  // 보안 설정
  debug?: boolean;
  maskSensitiveAnswers?: boolean;
  tokenRefreshBufferMs?: number;
  
  // 큐 관리
  maxQueueSize?: number;
  maxQueueBytes?: number;
  queueOverflowStrategy?: 'drop-oldest' | 'drop-newest' | 'reject';
  
  // 콜백
  onSyncStart?: () => void;
  onSyncEnd?: (result: SyncResult) => void;
  onAuthStateChange?: (authenticated: boolean) => void;
}
```

## 🔒 보안 기능

- **토큰 자동 갱신**: 만료 전 자동 토큰 갱신
- **PII 마스킹**: 민감한 답변 내용 자동 마스킹
- **암호화 저장**: 로컬 데이터 암호화 지원
- **재시도 정책**: 네트워크 오류 시 지능적 재시도

## 📊 모니터링

### 큐 상태 확인

```typescript
const status = await LockLearn.getQueueStatus();
console.log('큐 상태:', status);
// {
//   size: 10,
//   pending: 8,
//   inProgress: 2,
//   deadLetter: 0,
//   bytes: 1024,
//   analytics: { ... }
// }
```

### 사용자 통계

```typescript
const stats = await LockLearn.getStats('user-123');
console.log('사용자 통계:', stats);
```

### 파트너 통계

```typescript
const partnerStats = await LockLearn.getPartnerStats();
console.log('파트너 통계:', partnerStats);
```

## 🛡️ 에러 처리

```typescript
try {
  await LockLearn.addWrongAnswer(wrongAnswer);
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // 레이트 리밋 처리
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else if (error.code === 'UNAUTHORIZED') {
    // 재인증 필요
    await LockLearn.authenticateUser(userId, newToken);
  }
}
```

## 🔄 오프라인 지원

SDK는 네트워크 연결이 없어도 데이터를 로컬에 저장하고, 연결이 복구되면 자동으로 동기화합니다.

```typescript
// 오프라인 상태에서도 작동
await LockLearn.addWrongAnswer(wrongAnswer);

// 연결 복구 시 자동 동기화
LockLearn.on('sync:complete', (result) => {
  console.log('동기화 완료:', result);
});
```

## 📱 플랫폼별 설정

### React Native

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = new Storage({
  reactNativeAsyncStorage: AsyncStorage
});
```

### Node.js

```typescript
// Node.js 21+ (네이티브 fetch 지원)
import LockLearn from '@locklearn/partner-sdk';

// Node.js 20 이하 (폴리필 필요)
import 'cross-fetch/polyfill';
import LockLearn from '@locklearn/partner-sdk';
```

## 🧪 테스트

```bash
# 단위 테스트
npm test

# 통합 테스트
npm run test:integration

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 📚 API 문서

자세한 API 문서는 [docs.locklearn.com](https://docs.locklearn.com)에서 확인할 수 있습니다.

## 🆕 업데이트 내역

### v2.0.0
- TypeScript 완전 지원
- React Hooks 추가
- 멀티 플랫폼 지원
- 개선된 오프라인 지원
- 보안 강화

### v1.x.x
- 기본 SDK 기능
- 큐 시스템
- 자동 동기화

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

MIT License