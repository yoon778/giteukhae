# 앱인토스 등록·연동·출품

기준일: 2026-08-26

## 1. 콘솔 등록

1. 앱인토스 콘솔 가입
2. 토스 비즈니스 기반 개인 계정으로 워크스페이스 생성
3. `앱` → `+등록하기`
4. 앱 이름 `기특해`, 앱 유형 `비게임` 입력
5. `appName` 결정 후 등록

`appName`은 등록 후 변경할 수 없음. 현재 코드의 임시값은 `giteukhae`. 콘솔에서 사용 가능 여부를 확인한 뒤 `apps-in-toss.config.ts`와 정확히 일치시켜야 함

비사업자 개인도 등록 가능. 이 앱은 로그인·결제·광고가 없어 사업자 기능 불필요

공식 문서: https://developers-apps-in-toss.toss.im/prepare/console-workspace.html

## 2. 프로젝트 연동

- 공식 `create-ait-app` React TypeScript 템플릿 사용
- `@apps-in-toss/web-framework` 3.x 사용
- `apps-in-toss.config.ts`의 `appName`, 브랜드 색상, 내비게이션 설정 확인
- 권한 요청 없음
- 기록은 `Storage` API로 기기에 저장

개발:

```bash
npm run dev
```

샌드박스 앱에서 `intoss://<appName>`으로 접속해 확인

공식 문서: https://developers-apps-in-toss.toss.im/development/test/sandbox.html

## 3. 빌드와 토스앱 테스트

```bash
npm test
npm run lint
npm run build
```

프로젝트 루트에 생성된 `.ait` 파일을 콘솔 `앱 출시`에 업로드

1. 업로드 후 `테스트하기` 선택
2. QR 또는 `intoss-private://` 테스트 스킴으로 토스앱 실행
3. 최소 1회 테스트 완료
4. 기록 작성, AI 한마디, 칭찬 다시 받기, 재실행 후 저장 유지, 이전 달 이동, 지난 기록 열람 확인

공식 문서: https://developers-apps-in-toss.toss.im/development/test/toss.html

## 4. 검수와 출시

1. 앱 정보, 아이콘, 설명, 고객문의 정보, 공개 HTTPS 개인정보처리방침 URL 입력
2. 비게임 출시 체크리스트 확인
3. 운영·기능·디자인·보안 검토 요청
4. 승인 이메일 수신 후 콘솔 `출시하기`

일반 검수 안내는 평균 2~3일. 챌린지는 앱 정보 승인 전에도 첫 번들 등록 가능

공식 문서: https://developers-apps-in-toss.toss.im/development/deploy.html

## 5. 챌린지 출품

마감: 2026-08-26

1. 공식 챌린지 신청폼 제출
2. 한국어 앱 이름 `기특해` 입력
3. 콘솔과 동일한 `appName` 입력
4. `docs/PRODUCT.md`의 한 줄 소개와 주제 연관성 사용
5. 8월 26일까지 첫 `.ait` 번들 등록

앱 정보 승인이 끝나지 않아도 번들 등록 가능. 단순 리워드 앱은 심사 제외 대상

공식 안내: https://toss.im/apps-in-toss/blog/2608_vibecoding_challenge

## 출시 전 직접 필요한 작업

- 콘솔 계정·워크스페이스 생성
- `appName` `giteukhae` 등록 완료
- `assets/app-icon-light.png`, `assets/app-icon-dark.png` 등록
- `assets/screenshots`에 최신 프로덕션 화면으로 생성한 636×1048px 스크린샷 6장 준비 완료
- 고객문의 이메일과 앱 정보 입력
- `docs/PRIVACY.md`를 검토해 공개 HTTPS 개인정보처리방침으로 게시
- OpenAI 프로젝트 예산 알림과 Vercel WAF 요청 제한 설정
- 실제 토스앱 QR 테스트
- 챌린지 신청폼 제출
