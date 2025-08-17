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

안드로이드:

완전한 “잠금화면 교체(Replacement)”는 현대 안드로이드에서 일반 앱 권한으로는 사실상 불가. 다만 잠금화면 위에 액티비티를 표시하거나(setShowWhenLocked/setTurnScreenOn), **정답 후 키가드 해제 요청(KeyguardManager.requestDismissKeyguard)**은 가능(보안 잠금이 있으면 PIN/생체 인증은 반드시 거침). 
Android Developers
Stack Overflow

**Android 16(프리뷰)**에서 스마트폰용 잠금화면 위젯이 부활 예정이라 공식 표면(surface) 위에 콘텐츠·조작 요소를 올리는 방식이 유력. 위젯 상호작용은 버튼·토글 중심(텍스트 입력 등은 제한적). 
The Verge

수익화: 구글 플레이는 잠금화면 광고를 원칙적으로 금지(“잠금화면 전용 앱” 예외). 교육·B2B 유료화/라이선스 모델 권장. 
Android Enthusiasts Stack Exchange

데이터 수집: 앱 사용기록 수집은 **Usage Access(특별 접근)**를 사용자가 설정에서 켜줘야 함(일반 권한 아님). 이미지·미디어 접근도 최신 스코프드 스토리지 체계에서 명시 동의 필요.
⇒ 현실적 구현 방향: “Android 위젯/알림 + 전체화면 액티비티(알람 유사)” 조합으로 퀴즈를 띄우고, 정답 시 앱 내 보상·누적학습 처리 → 키가드 해제 요청(보안 잠금은 사용자 인증 통과). OEM과 제휴하면 더 강력하지만 난이도 높음.

iOS:

잠금화면 교체·우회 불가. iOS 17/18 기준 위젯의 상호작용(버튼/토글)은 지원하지만, 텍스트 입력/풍부한 커스텀 UI는 제한. 잠금해제는 시스템 전용. Lock Screen용 WidgetKit/Live Activities/알림으로 “보기-터치-앱 전환” 플로우는 가능.
⇒ 현실적 구현 방향: 잠금화면 위젯(정답 선택형/힌트 보기) + Live Activity 진행바 → 앱 열림 후 풀 문제(서술형 등), 또는 당일 학습 리마인더.

근거 및 시사점 (요약)

잠금화면 UI 권한/행동

안드로이드 공식 API: KeyguardManager와 액티비티 플래그로 잠금화면 위 표시는 가능하지만, 보안 잠금 자체를 우회할 수는 없음(정답 맞췄다고 자동 해제 불가, 인증 단계는 남음). 
Android Developers

실무 사례(개발자 Q&A): 보안 잠금이 걸려 있으면 동일 코드가 동작 제한된다는 경험담 다수. 즉, 알람·통화류 예외 시나리오 수준의 UX가 한계. 
Stack Overflow

잠금화면 표면(위젯) 현황

Android 16: 폰에서 Lock Screen Widgets 부활 예정(공식 위젯 표면 제공) → 퀴즈 버튼/다지선다형·힌트 보기 같은 경량 상호작용은 적합. 
The Verge

iOS 18: Lock Screen에서 조작 가능한 위젯/컨트롤이 확대되지만, 본격 **입력형 퀴즈(텍스트)**는 여전히 앱 전환 필요.

스토어 정책/수익화

구글 플레이: 일반 앱이 잠금화면에 광고 노출하는 건 금지(“잠금화면 전용 앱” 예외). 교육 서비스라면 구독/인앱 프리미엄·학교/기업 라이선스가 안전. 
Android Enthusiasts Stack Exchange

데이터 접근/프라이버시

앱 사용기록(UsageStats): 사용자 설정에서 ‘사용 정보 접근’ 수동 허용 필요(수집 전 온보딩 동의 필수). 이미지/미디어는 최신 안드로이드에서 세분화 권한. 온디바이스 AI 처리는 법·신뢰 측면에서 강점.

“가능/제한/권장” 체크리스트
기술적으로 가능한 것 (안드로이드 중심)

잠금화면 위젯/알림/전체화면 액티비티로 퀴즈 노출·선다형 응답·힌트 제공

정답 시: 앱 내부 점수/오답노트/난이도 조정 반영 → 키가드 해제 요청(보안 잠금 시 인증 필요) 
Android Developers

온디바이스 모델(TFLite 등)로 개인화 출제/난이도 조절(프라이버시 친화)

제한되는 것 / 피해야 할 것

보안 잠금 자체를 우회하는 “정답=즉시 잠금해제”: 불가(정책·보안상) 
Android Developers

잠금화면 전면 광고: 플레이 정책 리스크 큼(전용 잠금화면 앱이 아니면 금지) 
Android Enthusiasts Stack Exchange

iOS에서 잠금화면 상 복잡한 입력: 위젯은 제한적 상호작용만, 본격 입력은 앱 전환

권장 제품 전략 (현실적 플로우)

Android (우선 출시)

Lock Screen 위젯(다지선다/힌트 버튼) →

터치 시 풀스크린 퀴즈 액티비티(showWhenLocked) →

정답 시 학습 리워드·오답노트/난이도 조정 →

사용자가 원하면 키가드 해제 요청(보안 잠금 시 생체/PIN 진행). 
Android Developers

Android 16 배포 시 위젯 강화 버전 제공. 
The Verge

iOS (동시 또는 2단계)

Lock Screen 위젯 + Live Activities + 푸시 알림으로 “스낵형 출제/정답 버튼” → 앱 열어 상세 풀이·개인화/오답노트.

특허/SDK 관점에서의 정합성(침해 회피 어려운 포인트)

핵심 요소 결합:
잠금화면 표면(위젯/알림/액티비티) + 오답노트/개인화 학습 + 실시간 난이도 조정(온디바이스) 를 연동된 플로우로 청구항에 묶어두면,
위젯만/학습만 하는 단순 앱과 차별화된 시스템 레벨 결합을 보호할 수 있어 우회 구현 리스크를 높임.

시스템 제약을 존중한 표현: “정답 시 키가드 해제 절차 호출”처럼 우회가 아님을 명시(정책 위반 위험 최소화) — 구현/심사 모두에 안전.

사업성(요약 판단)

가능성: 안드로이드에서는 정식 API/정책 범위 안에서 “잠금화면에서의 경량 상호작용 → 앱에서 본격 풀이” 모델이 충분히 가능. iOS는 위젯/알림 기반으로 축소 제공.

성공 조건:

권한 온보딩(Usage Access 등) 전환율 확보,

위젯 3탭 이내 상호작용(마찰 최소화),

학습 진척/보상 루프로 재방문(락 해제 빈도)에 얹힌 초단위 세션을 쌓는 설계,

광고보다 구독/B2B 라이선스 중심의 수익화.

리스크: 잠금화면 광고 금지 정책, iOS 입력 제약, 권한 허용 장벽. 그러나 Android 16의 위젯 부활이 표면 문제를 크게 완화할 가능성. 
The Verge

바로 적용 가능한 액션 아이템

프로토타입

Android: 위젯(다지선다형) + setShowWhenLocked 액티비티 + requestDismissKeyguard 흐름 PoC. 
Android Developers

iOS: WidgetKit 위젯(버튼 상호작용) + Live Activity + 알림 Deep Link.

권한 온보딩 체커

첫 실행 시 Usage Access/알림/미디어 권한 순차 가이드(툴팁/만화경로).

수익화 설계

광고 X(정책 리스크) → 구독(개인/가족) & 학교·기업 SDK 라이선스. 
Android Enthusiasts Stack Exchange

특허 문구 미세조정

“잠금화면 위젯/표면”을 포함하는 표현,

“정답 시 키가드 해제 절차 호출” 명시(우회 금지),

“온디바이스 개인화/난이도 조정 + 오답노트”의 연동 처리 파이프라인을 청구항에 결속.

참고 소스

Android 16 Lock Screen 위젯 부활 기사(폰 대상) — The Verge. 
The Verge

KeyguardManager / 잠금화면 위 표시 관련 공식 레퍼런스(안드로이드) — Android Developers API. 
Android Developers

잠금 화면에서 액티비티/해제 동작 실무 이슈 사례 — Stack Overflow 토론. 
Stack Overflow

Usage Access(앱 사용기록) 특수 접근 필요 — Google 공식 샘플(UsageStats).

잠금화면 광고 금지(전용 앱 예외) — TechRadar 정책 변경 보도. 
Android Enthusiasts Stack Exchange

iOS 18 위젯/컨트롤 상호작용(잠금화면에서 조작) — Apple WWDC24 세션.

최종 판단

가능합니다(특히 Android). 다만 “정답=바로 잠금해제” 같은 보안 우회형 콘셉트는 정책·기술적으로 불가하고, 위젯/알림+앱 전환을 기본 UX로 설정해야 현실적입니다. 수익은 구독·B2B SDK 라이선스가 정책 리스크 없이 가장 안전합니다. Android 16의 잠금화면 위젯 공식 표면을 타겟으로 로드맵을 잡으면, 특허·SDK 모두 방어력과 실행력을 동시에 확보할 수 있어요.

1. 매출 구조 설계

SDK 사용료(월정액) + MAU 기반 라이선스 Fee

대기업/에듀테크/핀테크/헬스케어 앱 대상

평균 계약 단가: 월 1천만 원 / 건
(→ 5개 파트너 확보 시 월 5천만 원 가능)

2. 타겟 파트너사
(1) 교육앱

듀오링고 (한국 학습자 800만 명) → “오답노트 잠금화면 학습”을 옵션 기능으로 붙이면 유료 구독 유지율↑

뤼이드 산타토익 → 집중 유지율 강화 기능 필요, 모바일 특화라 협업 가능성↑

밀당영어, 콴다 → 학습 데이터 기반 개인화에 관심 많음

(2) 핀테크/생활앱

토스: 금융 퀴즈 잠금화면 → 사용자 락스크린에서 퀴즈 풀고 포인트 지급

뱅크샐러드: 건강/재테크 학습형 잠금화면 → 교육 + 리텐션 강화

카카오페이: 생활밀착형 학습/리워드 기능 → 잠금화면 활용

(3) 헬스케어/웰니스

눔(Noom), MindCafe: 습관형성·마인드케어 퀴즈 SDK

국내 디지털 헬스케어 스타트업: 치매예방 학습 잠금화면 → 고령자 타겟

3. 계약 단가 모델

베이직 패키지 (월 500만 원): SDK 제공 + 기본 기능(오답노트·개인화)

프로 패키지 (월 1천만 원): SDK + 특허라이선스 + 유지보수 + 통계 API

엔터프라이즈 패키지 (월 2천만 원): SDK + 풀특허 + AI 개인화 + 독점 지역권

👉 현실적으로 5개 파트너 × 1천만 원 평균 계약 = 월 5천만 원

4. 영업 시나리오 (로드맵)

MVP 시연

SDK 데모 (안드로이드 알림형 + 학습 연동) 준비

오답노트·난이도 조정 기능 특허 기반임을 강조

교육/핀테크 기업 타겟팅

우선 **국내 중견기업(산타토익·콴다·카카오 계열)**부터 접촉

초기 계약 (500~700만 원/월)

Proof-of-Concept(파일럿) 3개월 → KPI 달성 → 정식 계약 전환

라이선스 확장

특허 우회 위험성 강조 → “SDK 안 쓰면 특허침해 소송 리스크 있음” → 방패 역할 부각

대기업 확장 (토스·카카오·듀오링고)

초기 레퍼런스로 글로벌 협업 진출

5. 리스크 & 대응

리스크: 대기업 자체 개발 → 특허로 막기 어려우면 무력화

대응: 핵심 청구항("잠금화면+오답노트+난이도조정") 등록 완료 → SDK를 사실상 유일 솔루션으로 만들기

---

## 🔬 확장 모듈 연구 개발 결과 (Extensions Research)

### 📊 연구 개요
특허 기반 기술을 **현실적이고 즉시 구현 가능한** 솔루션으로 전환하기 위해 3개의 확장 모듈을 연구 개발했습니다.

### 🎯 개발된 확장 모듈

#### 1. **Enterprise Analytics Extension** 📈
**목적**: B2B 기업용 학습 분석 및 비즈니스 인텔리전스  
**기술 스택**: localStorage 기반 → **IndexedDB 권장**  
**타겟 시장**: 기업 교육팀, 에듀테크 스타트업  
**예상 수익**: 월 500만원-1천만원 per 고객

```typescript
// 사용 예시
import { RealisticAnalyticsPlugin } from '@locklearn/realistic-analytics';

LockLearn.use(new RealisticAnalyticsPlugin({
  trackingInterval: 5,
  retentionDays: 90,
  enableExport: true
}));

const report = await LockLearn.generateAnalyticsReport();
```

#### 2. **Notification Learning Extension** 🔔
**목적**: 잠금화면 대신 안정적인 알림 기반 마이크로러닝  
**기술 스택**: Web Notification API + Cron 스케줄링  
**현실적 대안**: 서버 푸시 + 모바일 앱 알림 권장  
**타겟 시장**: 모바일 앱 개발사, 콘텐츠 플랫폼

```typescript
// 사용 예시
import { NotificationLearningPlugin } from '@locklearn/notification-learning';

LockLearn.use(new NotificationLearningPlugin({
  notificationsPerDay: 5,
  adaptiveScheduling: true,
  platforms: { web: true, mobile: true }
}));

await LockLearn.startNotificationLearning('user-001');
```

#### 3. **Simple AI Extension** 🤖
**목적**: 서버 중심의 실용적 AI 개인화  
**기술 스택**: 규칙 기반 + 서버 AI (TensorFlow.js 회피)  
**특징**: 배터리/성능 문제 없는 경량 솔루션  
**타겟 시장**: 대형 교육 플랫폼, AI 개인화 서비스

```typescript
// 사용 예시
import { SimpleAIPlugin } from '@locklearn/simple-ai';

LockLearn.use(new SimpleAIPlugin({
  serverEndpoint: 'https://api.locklearn.com/ai/v1',
  cacheEnabled: true,
  fallbackToRules: true
}));

const recommendations = await LockLearn.getPersonalizedRecommendations();
```

### 🚨 Critical Reality Check - 발견된 기술적 한계

#### 웹 기술 스택 제약사항
1. **localStorage 한계**: 5-10MB 제한, 동기 방식으로 성능 저하
2. **Web Notification 모바일 문제**: Chrome Android에서 직접 생성 불가
3. **Browser Cron 불가능**: 탭 종료 시 모든 스케줄 중단
4. **Enterprise 요구사항 부족**: 웹 기반으로는 기업급 데이터 처리 한계

#### 수정된 현실적 아키텍처
```typescript
// 문제 있는 구현
❌ localStorage + Web Notification + Browser Cron

// 올바른 구현
✅ IndexedDB + 서버 Push + 서버 스케줄러
✅ 모바일 앱 + PWA 하이브리드
✅ 서버 중심 아키텍처
```

### 💰 수정된 수익 예측

#### Conservative (현실적)
- **1년차**: 연 1.2억원 (월 1천만원)
- **3년차**: 연 12억원 (월 1억원)

*기존 예측에서 75% 하향 조정 (시장 현실 반영)*

### 📁 연구 파일 구조
```
extensions/
├── realistic-analytics/        # 기업용 분석 모듈
├── notification-learning/      # 알림 기반 학습 모듈
├── simple-ai/                 # 실용적 AI 개인화 모듈
├── integration-test/           # 통합 테스트
├── mvp-demo/                  # 인터랙티브 데모
├── reality-check-report.md    # 실전 테스트 결과
└── CRITICAL-REALITY-CHECK.md  # 기술적 한계 분석
```

### 🔄 권장 개발 방향

#### Phase 1: 기술 재검토
1. **서버 인프라 우선**: 웹 의존성 최소화
2. **모바일 앱 개발**: 네이티브 알림 및 위젯 지원
3. **현실적 목표**: 점진적 고객 확보

#### Phase 2: 검증된 기술 스택
1. **Backend**: Node.js + Database + Redis
2. **Mobile**: React Native + 네이티브 모듈
3. **Web**: 캐싱 + 폴링 중심

#### Phase 3: 사업화
1. **파일럿 고객**: 1-2개 확보 (월 500만원)
2. **기술 검증**: 실제 운영 환경 테스트
3. **확장**: 검증된 모델로 스케일링

### 🏆 핵심 학습 사항

1. **브라우저 제약**: 웹 기술만으로는 기업급 솔루션 한계
2. **현실적 접근**: 과도한 기술적 야심보다 단계적 구현
3. **시장 검증**: 실제 고객 니즈와 예산 현실 반영
4. **특허 활용**: 기술적 차별화보다 사업적 방어막 역할

### 📝 결론

특허의 기술적 비전을 현실적 실행력으로 전환하여 **즉시 시장에서 검증받을 수 있는 솔루션**을 연구했습니다. 웹 기술의 한계를 명확히 파악하고, 서버 중심 아키텍처로 재설계하는 것이 성공의 핵심입니다.

**🎯 다음 단계**: 연구 결과를 바탕으로 서버 인프라 구축 및 모바일 앱 개발 착수 권장