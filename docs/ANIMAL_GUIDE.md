# 기특해 동물 추가 가이드

새 동물의 그림·말투·해금 조건을 같은 규격으로 반복 제작하기 위한 기준

## 단일 등록 위치

모든 동물 정보는 `src/animals.ts`의 `ANIMAL_CATALOG`에서 관리

- 항목을 빠뜨리면 TypeScript 빌드 실패
- 주제별 칭찬이 4개보다 적으면 단위 테스트 실패
- 화면에서는 카탈로그를 자동으로 읽으므로 별도 컴포넌트 수정 불필요

## 필수 데이터

| 필드 | 규칙 |
|---|---|
| ID | 영문 소문자 한 단어, 예: `capybara` |
| 이름 | 화면에 표시할 한국어 이름 |
| `unlockAt` | 누적 기특한 날짜 수 |
| 캐릭터 이미지 | `/characters/{id}-v1.png` |
| 도장 이미지 | `/stamps/{id}-held-v1.png` |
| 색상 | 잉크색, 옅은 도장 배경색, 히어로 배경색 |
| 첫인사 | 캐릭터 특징을 살린 2~8자 문장 |
| 외형 특징 | 다른 동물과 구분되는 특징 최소 2개 |
| 말투 | 한 줄 설명과 반복적으로 쓸 말버릇 |
| 이해 못 한 반응 | 의미 없는 입력에 사용할 캐릭터별 문장 3개 이상 |
| 칭찬 | 6개 주제마다 4~6문장 |

## 그림 제작 규격

공통 스타일

- 1024×1024 투명 PNG
- 그림판에서 마우스로 그린 듯한 삐뚤한 단선
- 일정하지 않은 짙은 회갈색 외곽선
- 단순한 파스텔 단색 면
- 작은 눈, 동물마다 다른 코와 입
- 과한 광택, 3D, 사실적 털, 그림자, 글자 금지
- 축소했을 때도 귀·코·부리·꼬리 중 대표 특징이 보이게 제작

기본 캐릭터

- 전신 또는 몸통 중심
- 캔버스 가장자리 12% 이상 여백
- 정면을 기본으로 하되 살짝 어설픈 자세

도장 캐릭터

- 아래쪽 사람 손 하나가 동물을 들어 올리는 포즈
- 동물이 엄지척 또는 짧은 앞발을 드는 동작
- 원형 도장 테두리와 문구 없음
- 76px 크기에서도 얼굴과 손의 구분이 명확해야 함

### 이미지 생성 프롬프트 틀

```text
1024x1024 transparent PNG, intentionally clumsy cute MS Paint mouse drawing.
Animal: {동물명}.
Signature traits: {대표 특징 2~3개}.
Uneven dark brown single-line outline, flat pastel colors, tiny simple eyes,
species-specific nose and mouth, awkward charming proportions, no text,
no realistic fur, no 3D, no glossy shading, generous transparent margin.
Pose: {기본 캐릭터 포즈 또는 손에 들린 도장 포즈}.
Keep the silhouette readable at 76px.
```

## 말투 제작 규격

- 한 문장 원칙, 34자 권장, 최대 2줄
- 결과를 평가하기보다 사용자가 한 행동을 구체적으로 인정
- 실패·연속 출석·비교·훈계 표현 금지
- 동물 말버릇은 문장마다 최대 1회
- 같은 주제 안에서 시작어와 문장 끝을 반복하지 않기

칭찬 주제

- `movement`: 걷기, 달리기, 운동
- `chores`: 설거지, 청소, 정리
- `learning`: 공부, 독서, 업무
- `kindness`: 배려, 연락, 도움
- `selfCare`: 식사, 물, 수면, 휴식
- `default`: 어느 주제에도 속하지 않는 일

## 카피바라 추가 예시

카탈로그 방향

```ts
capybara: {
  name: '카피바라',
  unlockAt: 14,
  assets: {
    character: '/characters/capybara-v1.png',
    stamp: '/stamps/capybara-held-v1.png',
  },
  colors: { ink: '#8a5b3d', tint: '#fff1df', heroTint: '#e8f5e8' },
  greeting: '왔어?',
  visualTraits: ['네모난 주둥이', '작은 둥근 귀', '느긋한 반쯤 감긴 눈'],
  voice: {
    tone: '웬만한 일에는 놀라지 않고 느긋하게 인정하는 친구',
    habits: ['그럴 수 있지', '천천히', '온천 박수'],
  },
  confused: ['응? 다시 말해줄래?', '천천히 적어도 괜찮아', '무슨 뜻인지 모르겠어'],
  praise: {
    // movement, chores, learning, kindness, selfCare, default마다 4~6문장
  },
}
```

## 추가 순서

1. 기본 캐릭터와 도장 이미지 제작
2. 정해진 경로와 파일명으로 저장
3. `ANIMAL_CATALOG`에 한 항목 추가
4. 말투에 맞춘 주제별 칭찬 4~6개와 이해 못 한 반응 3개 작성
5. `npm test`, `npm run lint`, `npm run build` 실행
6. 76px 도장, 히어로, 첫인사, 달력, 상세 팝업 직접 확인
