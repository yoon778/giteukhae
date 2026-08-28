# 기특해

오늘 잘한 일을 한 줄 남기고 칭찬 도장을 받는 앱인토스 미니앱

## 실행

```bash
npm install
npm run dev
```

AI 서버를 연결할 때 로컬 개발은 `.env.local`, 배포 빌드는 `.env.production`에 엔드포인트를 설정

```bash
VITE_PRAISE_API_URL=https://your-api.example.com/api/praise
```

OpenAI 키는 미니앱에 넣지 않고 서버 환경변수 `OPENAI_API_KEY`로만 관리

Vercel 배포용 서버 함수는 `api/praise.js`에 있음

1. Vercel 프로젝트 생성 후 이 저장소 연결
2. Vercel 환경변수에 `OPENAI_API_KEY`, `SAFETY_ID_SALT` 등록
3. 배포 주소를 `.env.production`의 `VITE_PRAISE_API_URL`에 입력
4. `npm run build`로 새 AIT 생성

## 검증

```bash
npm test
npm run lint
npm run build
```

기획은 [`docs/PRODUCT.md`](docs/PRODUCT.md), AI 연동 규격은 [`docs/AI_API.md`](docs/AI_API.md), 개인정보 처리 초안은 [`docs/PRIVACY.md`](docs/PRIVACY.md), 동물 추가 규격은 [`docs/ANIMAL_GUIDE.md`](docs/ANIMAL_GUIDE.md), 등록·출품 절차는 [`docs/RELEASE.md`](docs/RELEASE.md) 참고
