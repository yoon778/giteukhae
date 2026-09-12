# Codex handoff

## Project

- Product: 기특해:칭찬일기
- Workspace: C:\Users\cys04\orca\workspaces\appintoss\8월-앱인토스-챌린지
- GitHub: https://github.com/yoon778/giteukhae
- Apps in Toss: https://minion.toss.im/Bw9g6nEe
- Production API: https://giteukhae.vercel.app

## Current state

- Apps in Toss bundle giteukhae.ait registered
- Apps in Toss version 20260912-13 under review
- Vercel production deployment ready
- GitHub main latest implementation commit before this handoff: 3f95f2d
- OpenAI API key exists only in Vercel environment variables
- OpenAI spend alert configured at $5; account budget observed as $100

## Implemented features

- One-line praise diary with animal-specific comments
- AI input classification and contextual praise
- Clearly meaningless input handling with a question-mark reaction
- AI-generated childlike pastel drawing based on the diary entry
- Drawing loading animation and daily generation limit
- Stamp placed over the written diary area
- Calendar and stored-record count synchronization
- Full reset confirmation and complete data removal
- Animal unlock order and launch-time greeting
- Season 1 and Season 2 animals
- Incrementally filled family photos and monthly memory selection
- Startup bottom-sheet exposure fix
- Privacy-safe analytics and API origin validation
- Request validation, rate limiting, response schema validation, and secret protection

## Latest verification

- npm test: 49 passed
- npm run lint: passed
- npm run build:web: passed
- Production API: 오늘 숙제를 끝냈다 → praise/learning
- Production API: 아아아아아 → unclear/default
- Praise API timeout changed from 4.8s to 15s
- Vercel function duration for praise changed from 10s to 20s

## Release state

- Apps in Toss bundle version: 20260912-13
- Review state at handoff: 검토 중
- Release notes submitted:
  1. Startup bottom sheet no longer appears automatically
  2. Season 2 animals, day-based unlocks, and family photos added
  3. One-line AI drawing and dedicated loading screen added
  4. AI classification, error handling, storage/reset stability, and security improved

## Important files

- src/App.tsx: primary UI and app flow
- src/animals.ts: animal catalog, voices, and unlock metadata
- src/praise.ts: client praise flow and fallback logic
- src/drawing.ts: client drawing flow
- api/praise.js: OpenAI praise endpoint
- api/drawing.js: OpenAI drawing endpoint
- docs/ANIMAL_GUIDE.md: reusable character template
- docs/AI_API.md: AI API setup
- docs/RELEASE.md: release procedure
- vercel.json: deployment and security headers

## Secrets and deployment

- Never copy secrets into source files or this document
- Expected Vercel variables: OPENAI_API_KEY, OPENAI_MODEL, SAFETY_ID_SALT, RATE_LIMIT_PER_MINUTE, ALLOWED_ORIGINS
- Local .env.local and .env.production must remain uncommitted
- Vercel deployment: npx vercel --prod --yes
- Git push target: git push giteukhae HEAD:main

## Pending decisions

- Confirm the Apps in Toss review result and address reviewer feedback
- Test 20260912-13 in the real Toss mobile app
- Upstash Redis is not connected because its Marketplace plan is billable
- Decide whether to lower the OpenAI hard budget from $100
- Optional: connect GitHub to Vercel for automatic deployment; CLI deployment already works

## Recommended first prompt in standalone Codex

Read AGENTS.md and CODEX_HANDOFF.md completely. Inspect the current git status and recent commits. Continue the 기특해:칭찬일기 project without exposing secrets. First report the current state only; do not change billing or submit external releases unless I explicitly ask.
