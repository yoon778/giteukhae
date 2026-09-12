# 기특해 AI API 규격

## 원칙

- AI는 기록 가능 여부를 결정하지 않음
- 공백이 아닌 모든 입력은 저장하고 도장을 제공
- AI는 반응 종류·주제·동물 말투의 한마디만 선택
- 6초 초과, 네트워크 오류, 잘못된 응답은 로컬 코멘트로 대체
- `OPENAI_API_KEY`는 서버 환경변수로만 관리

## 요청

`POST /api/praise`

```json
{
  "text": "오늘 그냥 버텼다",
  "animalId": "rabbit",
  "revision": 0
}
```

## 응답

```json
{
  "kind": "emotion",
  "topic": "selfCare",
  "comment": "오늘을 버틴 마음에도 토끼 도장 꾹 찍어줄게요"
}
```

허용값

- `kind`: `praise`, `emotion`, `unclear`, `playful`
- `topic`: `movement`, `chores`, `learning`, `kindness`, `selfCare`, `default`
- `comment`: 공백 제외 1~120자

## 앱 설정

로컬 개발은 `.env.local`, AIT 배포 빌드는 `.env.production`

```bash
VITE_PRAISE_API_URL=https://your-api.example.com/api/praise
VITE_DRAWING_API_URL=https://your-api.example.com/api/drawing
```

이 값은 빌드 시 AIT 내부에 고정됨. 서버 URL 변경 후 반드시 `npm run build`로 새 번들 생성

## Vercel 배포

프로젝트 루트의 `api/praise.js`, `vercel.json` 사용

Vercel 환경변수:

```text
OPENAI_API_KEY=<OpenAI 프로젝트 키>
OPENAI_MODEL=gpt-5-nano
ALLOWED_ORIGINS=https://giteukhae.apps.tossmini.com,https://giteukhae.private-apps.tossmini.com
RATE_LIMIT_PER_MINUTE=20
DRAWING_RATE_LIMIT_PER_MINUTE=2
OPENAI_IMAGE_MODEL=gpt-image-2.5-flare
SAFETY_ID_SALT=<충분히 긴 임의 문자열>
UPSTASH_REDIS_REST_URL=<Upstash Redis REST URL>
UPSTASH_REDIS_REST_TOKEN=<Upstash Redis REST Token>
```

배포 후 확인:

```bash
curl -X POST https://<vercel-project>.vercel.app/api/praise \
  -H "Origin: https://giteukhae.apps.tossmini.com" \
  -H "Content-Type: application/json" \
  -d '{"text":"물을 잘 마셨다","animalId":"bear","revision":0}'
```

정상 응답의 `kind`, `topic`, `comment` 확인 후 AIT 빌드용 `.env.production` 작성:

```text
VITE_PRAISE_API_URL=https://<vercel-project>.vercel.app/api/praise
VITE_DRAWING_API_URL=https://<vercel-project>.vercel.app/api/drawing
```

토스 환경을 호출 서버 CORS 허용 목록에 추가

```text
https://<appName>.apps.tossmini.com
https://<appName>.private-apps.tossmini.com
```

## 서버 필수 보호

- 요청 본문 최대 길이 제한
- 분당 요청 횟수 제한
- 허용 Origin 검사
- Origin 없는 호출과 Production의 localhost Origin 거부
- Vercel WAF에서 `/api/praise` IP 기준 고정 윈도우 제한 권장
- 원문·API 키 로그 금지
- OpenAI 출력 JSON 스키마 검증
- OpenAI 프로젝트 예산 알림 설정

## 오늘의 그림 API

`POST /api/drawing`

```json
{
  "text": "친구와 그네를 탔다",
  "animalIds": ["rabbit", "dog"],
  "clientKey": "앱에서 일방향 해시한 익명 사용자 키"
}
```

해금된 동물 참고 이미지를 사용해 1024×1024 저품질 WebP 파스텔 그림을 생성한다. 성공 결과의 `imageDataUrl`은 앱 저장소에만 보관한다. 내용이 이미지 안전 정책을 통과하지 못하면 `422 drawing_not_available`을 반환한다.

- 사용자별 하루 1회만 성공 가능
- `clientKey` 원문은 저장하지 않고 서버에서 다시 해시
- Upstash 환경변수가 있으면 서버리스 인스턴스 전체에 일일 제한 적용
- Upstash가 없거나 일시적으로 실패하면 현재 서버 인스턴스의 메모리 제한으로 대체
