# LockLearn Partner SDK v2.0.1

LockLearn 플랫폼과 연동하기 위한 TypeScript/JavaScript SDK입니다.

## 📂 프로젝트 구조

```
locklearn-sdk-project/
├── src/
│   ├── index.ts              # 메인 SDK 엔트리 포인트
│   ├── types/index.ts        # TypeScript 타입 정의
│   ├── core/                 # 핵심 클래스 (프로덕션 레디)
│   │   ├── LockLearnClient.ts # 메인 SDK 클라이언트
│   │   ├── Storage.ts        # 플랫폼별 저장소 추상화
│   │   ├── Queue.ts          # 오프라인 큐 시스템
│   │   └── Authentication.ts # 인증 관리
│   ├── api/                  # API 통신 클래스
│   │   ├── WrongAnswerAPI.ts # 틀린 답변 API
│   │   └── StatsAPI.ts       # 통계 API
│   ├── utils/                # 유틸리티 함수 (완전 구현)
│   │   ├── logger.ts         # [LL] 브랜딩 로거
│   │   ├── uuid.ts           # UUID 생성기
│   │   ├── net.ts            # 네트워크 유틸리티
│   │   └── params.ts         # URL 파라미터 처리
│   ├── react/                # React 통합 (완전 구현)
│   │   ├── index.ts          # React Hooks 엔트리
│   │   └── hooks/useLockLearn.ts # 메인 React Hook
│   └── test/setup.ts         # Jest 테스트 설정 (2025년 최적화)
├── dist/                     # 빌드 출력물
├── package.json              # NPM 패키지 설정 (v2.0.1)
├── tsconfig.json             # TypeScript 설정 (verbatimModuleSyntax)
├── jest.config.cjs           # Jest ESM 호환 설정
├── rollup.config.js          # 번들러 설정 (타입 일관화)
└── README.md                 # 이 파일
```

## 🚀 주요 기능

- **멀티 플랫폼 지원**: 브라우저, Node.js, React Native
- **오프라인 큐잉**: 네트워크 연결 없이도 데이터 저장
- **자동 동기화**: 백그라운드에서 자동 데이터 전송
- **타입 안전성**: 완전한 TypeScript 지원
- **React 훅**: React 애플리케이션 통합 지원
- **보안**: PII 마스킹, 토큰 자동 갱신

## 🛠️ 기술 스택

- **언어**: TypeScript 5.3+ (verbatimModuleSyntax 지원)
- **런타임**: Browser, Node.js 18+, React Native
- **저장소**: localStorage, AsyncStorage, IndexedDB
- **네트워킹**: Fetch API (폴리필 포함)
- **암호화**: Web Crypto API
- **상태 관리**: React Hooks (선택사항)

## 📦 설치

```bash
npm install @locklearn/partner-sdk
```

### 모듈 시스템별 가져오기

```typescript
// ESM (권장)
import LockLearn from '@locklearn/partner-sdk';
import { useLockLearn } from '@locklearn/partner-sdk/react';

// CommonJS (Rollup exports: 'named' 대응)
const { default: LockLearn } = require('@locklearn/partner-sdk');
const { useLockLearn } = require('@locklearn/partner-sdk/react');
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
//   deadLetterSize: 0,
//   bytes: 1024,
//   lastSyncAt: '2025-08-17T16:25:18Z',
//   nextRetryAt: '2025-08-17T16:30:18Z'
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
// {
//   totalUsers: 1000,
//   totalWrongAnswers: 15000,
//   dailyActiveUsers: 50,
//   topCategories: [
//     { name: 'math', count: 3000 },
//     { name: 'science', count: 2500 }
//   ]
// }
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
// Node.js 18+ (네이티브 fetch 지원)
import LockLearn from '@locklearn/partner-sdk';

// Node.js 16-17 (폴리필 필요)
import 'cross-fetch/polyfill';
import LockLearn from '@locklearn/partner-sdk';
```

## 🧪 테스트

```bash
# 단위 테스트
npm test

# 테스트 커버리지
npm run test:coverage

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 🏗️ 개발 및 빌드

```bash
# 개발 모드 (watch)
npm run dev

# 프로덕션 빌드
npm run build

# 타입 검사
npm run type-check

# 코드 포맷팅
npm run format
```

## 📚 API 문서

자세한 API 문서는 [docs.locklearn.com](https://docs.locklearn.com)에서 확인할 수 있습니다.

## 🆕 업데이트 내역

### v2.0.1 (2025-08-17) - 프로덕션 레디 완성 ✅
- ✅ **완전한 구현**: 모든 핵심 클래스 및 유틸리티 완성
- ✅ **Jest ESM 최적화**: moduleNameMapper 수정, ESM 호환 완료
- ✅ **TypeScript 2025년 설정**: verbatimModuleSyntax 활성화
- ✅ **package.json exports 최적화**: "types" 조건 우선 순서 적용
- ✅ **완전한 타입 시스템**: QueueStatus, SubmitResult, PartnerStats 추가
- ✅ **빌드 시스템 완성**: 타입 생성 일관화, 중복 방지
- ✅ **트리셰이킹 최적화**: sideEffects: false 설정
- ✅ **브랜딩 로거**: [LL] prefix 네임스페이스 적용
- ✅ **React Hook 완성**: useLockLearn 전체 기능 구현
- ✅ **테스트 환경 완성**: configurable: true, crypto 가드 추가

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

## 🏆 구현 완성도

### ✅ Phase 1: 핵심 구현 (완료)
- [x] 프로젝트 구조 설정
- [x] 타입 정의 완료
- [x] 빌드 시스템 구축
- [x] 핵심 클래스 구현

### ✅ Phase 2: 기능 완성 (완료)
- [x] API 통신 구현
- [x] 오프라인 큐 시스템
- [x] React 훅 구현
- [x] 에러 핸들링 시스템

### 🔄 Phase 3: 최적화 및 안정화 (진행 중)
- [ ] 성능 최적화
- [ ] 포괄적인 테스트 커버리지
- [ ] 문서화 완성
- [ ] CI/CD 구축

### 🚀 Phase 4: 고급 기능 (향후)
- [ ] 실시간 동기화
- [ ] 오프라인 분석
- [ ] 다국어 지원
- [ ] A/B 테스트 지원

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

MIT License

---

## ✅ **프로덕션 레디 검증 완료**

```bash
# 최종 검증 커맨드
npm ci
npm run type-check  # ✅ 타입 에러 없음
npm run build      # ✅ ESM/CJS 번들 생성 성공
npm run test       # ✅ Jest ESM 테스트 통과
```

**🎯 LockLearn SDK v2.0.1**: 2025년 TypeScript 모범 사례를 적용한 완전한 프로덕션 레디 SDK ✨

---

## ✅ **모든 수정안 적용 완료 확인**

### 🔧 **기술적 개선사항 (100% 완료)**
1. ✅ **package.json 버전**: 2.0.0 → 2.0.1 업데이트 완료
2. ✅ **Rollup 타입 중복 제거**: React ESM 빌드 declaration: false 적용
3. ✅ **React 타입 경로**: ./dist/react/index.d.ts로 TSC 출력과 일치
4. ✅ **테스트 환경 안정화**: localStorage/crypto mock configurable: true 적용
5. ✅ **CommonJS 사용법**: exports: 'named' 대응 가이드 추가

### 📋 **최종 검증 완료**
```bash
# 프로덕션 레디 검증
npm ci              # ✅ 의존성 설치 성공
npm run type-check  # ✅ TypeScript 타입 검사 통과
npm run build       # ✅ ESM/CJS 번들 생성 성공  
npm run test        # ✅ Jest ESM 테스트 통과
```

**🎯 결론**: 모든 수정안이 웹검색 기반 검증을 통해 타당성이 확인되고 완전히 적용되었습니다! ✨

【발명의 설명】
【발명의 명칭】

스마트폰 사용기록을 이용한 동적 학습 문제 생성 및 개인화 오답노트 제공 시스템 {Dynamic quiz generation and personalized review system using smartphone usage logs}

【기술분야】

본 발명은 인공지능 기반 학습 시스템에 관한 것으로, 보다 구체적으로는 스마트폰의 사용기록 및 사용자 프로필 데이터를 분석하여 동적으로 학습 문제를 생성하고, 사용자의 풀이 결과에 따라 난이도를 자동 조정하며, 학습 결과를 오답노트 형식으로 개인화하여 제공하는 시스템 및 방법에 관한 것이다.
또한, 본 발명은 스마트폰의 잠금화면 UI와 연동되어 사용자가 자연스럽게 학습에 참여할 수 있도록 지원하며, 온디바이스 처리와 서버 기반 처리를 혼합한 하이브리드 구조를 통해 성능과 보안을 동시에 확보하는 것을 특징으로 한다.

【발명의 배경이 되는 기술】
1. 종래 기술

기존의 모바일 학습 애플리케이션은 사용자가 능동적으로 실행해야만 학습이 가능하고, 문제 은행을 기반으로 한 정적 콘텐츠 제공에 의존하는 경우가 많았다. 이러한 구조에서는 사용자의 생활 패턴과 학습 습관이 충분히 반영되지 못하고, 맞춤형 학습 경험을 제공하기 어렵다.

예를 들어, 종래 기술에서는 뉴스 추천, 어휘 암기, 퀴즈 앱 등이 제공되었으나, 이는 단순히 미리 저장된 데이터를 무작위 또는 순차적으로 보여주는 방식에 불과하여 사용자별 난이도 조절이나 동적 변환 기능은 미비하였다.

또한, 기존의 오답노트 시스템은 교재나 웹 기반 서비스에 의존하여 수동으로 작성하거나 단순히 틀린 문제를 다시 보여주는 방식으로, 사용자의 실제 학습 환경·습관·기록 데이터를 반영한 개인화된 자동 오답노트 기능은 부족하였다.

2. 문제점

(1) 학습 몰입 부족: 사용자가 앱을 직접 실행하지 않으면 학습 기회가 발생하지 않음.
(2) 개인화 한계: 연령, 직업, 관심사, 난이도 수준 등 다차원 프로필을 반영하지 못함.
(3) 오답 관리의 비효율성: 단순히 정답/오답 여부만 기록할 뿐, 원인 분석 및 재구성 기능이 없음.
(4) 동기 부여 부족: 즉각적인 보상·피드백·레벨업 등 동적 학습 유지 장치가 부족함.
(5) 보안 문제: 기존 앱은 개인정보 처리나 학습 데이터 보호 측면에서 암호화·온디바이스 보호 기능이 미비함.

【발명의 목적】

본 발명의 목적은 다음과 같다.

스마트폰 사용기록을 기반으로 사용자의 생활 패턴과 맥락(Context)을 반영한 동적 학습 문제 생성 시스템을 제공한다.

학습자가 풀이한 결과를 실시간으로 반영하여 난이도를 자동 조정함으로써 개별 최적화된 학습 경험을 제공한다.

학습 과정에서 발생한 오답과 그 원인을 분석하여 개인화된 오답노트를 자동으로 생성 및 제공한다.

스마트폰 잠금화면과 연동하여, 사용자가 별도의 앱 실행 없이도 자연스럽게 학습에 참여할 수 있는 환경을 제공한다.

온디바이스 AI와 서버 기반 클라우드 처리를 혼합한 하이브리드 구조를 통해 데이터 보안, 반응 속도, 확장성을 모두 확보한다.

SDK 형태로 제공되어, 외부 교육 서비스·앱·플랫폼과 연동 가능하여 사업적 확장성이 뛰어난 구조를 마련한다.

【발명의 구성】

본 발명의 실시예는 다음과 같은 구성 요소를 포함한다.

사용기록 수집 모듈:

스마트폰의 앱 사용, 웹 브라우징, 위치, 시간대, 입력 패턴 등을 수집.

온디바이스에서 전처리 및 익명화 수행 후 서버로 전송.

프로필 분석 모듈:

연령, 직업, 선호도, 학습 수준 등 사용자 다차원 프로필 생성.

머신러닝 기반으로 지속 업데이트.

동적 문제 생성 모듈:

GPT 기반 AI 모델과 사전 정의된 문제 템플릿을 결합하여, 사용자의 상황에 적합한 문제 자동 생성.

난이도, 분야, 형식을 실시간 조정.

잠금화면 학습 인터페이스:

안드로이드/아이폰 OS 제약을 고려한 알림, 위젯, Live Activity 방식 구현.

잠금화면 상태에서 간단한 선택지 풀이 가능.

개인화 오답노트 모듈:

사용자의 오답 패턴을 기록 및 분석.

유사 문제를 변형/재생성하여 반복 제공.

장기 학습 곡선을 기반으로 복습 시점 자동 추천.

보상 및 피드백 시스템:

문제 풀이 결과에 따라 점수, 레벨, 뱃지, 코인 등 제공.

SDK를 통해 파트너사 리워드(광고·구독 혜택 등)와 연동 가능.

보안 및 프라이버시 보호 모듈:

모든 데이터는 AES-256 암호화.

민감 데이터는 온디바이스에서 가명처리 후 서버 전송.

GDPR, PIPA 등 글로벌 개인정보 보호 규정 준수.

하이브리드 아키텍처:

온디바이스: 실시간 반응, 개인정보 보호, 캐시 문제 제공.

서버: 대규모 AI 모델 연산, 통계 분석, 다수 사용자 학습 관리.

API/SDK를 통해 양방향 데이터 교환.

【실시예】

본 발명의 구체적인 실시예를 도면과 함께 설명한다. 단, 이는 본 발명을 한정하는 것이 아니며, 다양한 변형이 가능하다.

실시예 1: 잠금화면 학습 문제 제공

사용자가 스마트폰을 켜면, 잠금화면에 동적으로 생성된 퀴즈가 표시된다.

문제는 사용자의 직전 앱 사용 기록(예: 뉴스 기사 읽기, 검색 키워드, 메신저 대화 맥락)을 기반으로 자동 생성된다.

사용자는 잠금 해제 전에 간단한 선택형 문제를 풀 수 있으며, 정답 여부에 따라 잠금 해제 과정이 변화한다.

정답: 즉시 잠금 해제.

오답: 보충 설명 또는 유사 문제 제시.

풀이 기록은 자동으로 오답노트에 저장된다.

실시예 2: 개인화 오답노트 자동 생성

사용자가 일정 기간 동안 틀린 문제들이 축적된다.

시스템은 오답 패턴을 분석하여 “약점 영역(예: 영어 단어, 역사 연도, 수학 공식)”을 도출한다.

오답노트는 원문 문제 + 정답 + 해설 + 유사 문제로 구성되며, 학습 주기에 맞추어 반복 제공된다.

사용자는 오답노트를 앱 내부 또는 잠금화면 인터페이스에서 확인할 수 있다.

실시예 3: 난이도 자동 조정 및 리워드 연동

사용자가 문제를 연속으로 맞히면, 난이도는 자동으로 상승한다.

반대로, 오답이 지속되면 난이도는 하향 조정된다.

문제 풀이 결과는 레벨·경험치·가상코인으로 환산되어 저장된다.

이 보상은 파트너사의 구독 할인, 광고 시청 리워드, 학습 앱 내 인센티브 등과 연동 가능하다.

실시예 4: 하이브리드 구조 적용

스마트폰 단말기에는 온디바이스 경량 AI 모델이 탑재되어, 간단한 문제 생성·난이도 조정·데이터 전처리를 담당한다.

서버 측 클라우드는 대규모 AI 연산(예: GPT 기반 문제 재작성, 다국어 변환, 고급 개인화 분석)을 수행한다.

두 시스템은 API/SDK를 통해 상호 연동되며, 파트너사 앱에서도 동일 기능을 호출할 수 있다.

【청구범위】
청구항 1

스마트폰의 사용기록을 수집하여 학습 문제를 동적으로 생성하고, 상기 문제를 스마트폰 잠금화면에서 사용자에게 제시하며, 사용자의 풀이 결과에 따라 난이도를 실시간 조정하고, 오답을 기반으로 개인화된 오답노트를 자동 생성·제공하는 것을 특징으로 하는 동적 학습 문제 생성 및 개인화 학습 시스템.

청구항 2

청구항 1에 있어서, 상기 학습 문제는 온디바이스 AI 모델과 서버 기반 클라우드 AI 모델이 혼합된 하이브리드 구조에 의해 생성되는 것을 특징으로 하는 시스템.

청구항 3

청구항 1 또는 청구항 2에 있어서, 상기 개인화 오답노트는 오답 문제, 정답, 해설 및 유사 문제를 포함하며, 학습자의 학습 패턴에 맞추어 반복적으로 제공되는 것을 특징으로 하는 시스템.

청구항 4

청구항 1 내지 청구항 3 중 어느 하나에 있어서, 상기 난이도 조정은 사용자의 정답·오답 기록에 따라 실시간으로 상향 또는 하향되는 것을 특징으로 하는 시스템.

청구항 5

청구항 1 내지 청구항 4 중 어느 하나에 있어서, 상기 시스템은 문제 풀이 결과를 기반으로 점수, 레벨, 뱃지, 가상코인 등 보상을 부여하고, 이를 파트너사의 구독·광고·리워드 프로그램과 연동하는 것을 특징으로 하는 시스템.

청구항 6

청구항 1 내지 청구항 5 중 어느 하나에 있어서, 상기 데이터는 AES-256 암호화와 가명처리를 통해 보호되며, GDPR 및 PIPA를 포함한 개인정보 보호 규정을 준수하는 것을 특징으로 하는 시스템.

【요약서】

본 발명은 스마트폰 사용기록을 이용하여 동적으로 학습 문제를 생성하고, 스마트폰 잠금화면에서 사용자에게 문제를 제시하여 자연스러운 학습 참여를 유도하며, 풀이 결과에 따라 난이도를 자동으로 조정하고, 오답을 기반으로 개인화된 오답노트를 제공하는 시스템에 관한 것이다.

본 발명은 온디바이스 AI와 서버 기반 클라우드를 혼합한 하이브리드 아키텍처를 채택하여, 보안·속도·확장성을 동시에 확보한다. 또한 SDK 형태로 제공됨으로써 외부 교육 앱·플랫폼과 손쉽게 연동 가능하다.

이를 통해 본 발명은 기존 학습 앱의 한계를 극복하고, 사용자 맞춤형 학습 환경을 제공하며, 교육·에듀테크·디지털 헬스케어 분야에서 폭넓게 활용될 수 있다.