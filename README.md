# sai · 한일 실시간 통역

한국어와 일본어를 자동 감지해 실시간 음성 또는 문자로 통역하는 Vinext/Cloudflare Sites 앱입니다.

## GitHub에 올리기

1. 이 폴더의 모든 파일을 새 GitHub 저장소에 업로드합니다.
2. Node.js 22.13 이상에서 `npm ci`를 실행합니다.
3. `npm run build`로 배포 빌드를 확인합니다.
4. Cloudflare Sites 환경변수에 아래 두 값을 Secret으로 등록합니다.

```text
OPENAI_API_KEY=your-openai-api-key
INTERPRETER_PIN=your-pin
```

비밀값은 브라우저 코드나 GitHub 저장소에 넣지 마세요. 현재 배포 환경의 비밀값은 `OPENAI_API_KEY`와 `INTERPRETER_PIN`으로 관리됩니다.

## 실행

```bash
npm ci
npm run dev
```

통역 시작 후 PIN을 입력하면 마이크 통역과 문자 통역을 사용할 수 있습니다. 문자 통역은 `/api/translate`, WebRTC 음성 세션은 `/api/session`을 사용합니다.

## 주요 구조

- `app/page.tsx`: 반응형 DM 스타일 UI, 음성 연결, 한국어·日本語·English UI
- `app/api/unlock/route.ts`: PIN 검증 및 세션 발급
- `app/api/session/route.ts`: OpenAI Realtime WebRTC 세션 생성
- `app/api/translate/route.ts`: 인증된 문자 통역 요청
- `db/schema.ts`, `drizzle/`: PIN 시도와 세션 티켓을 위한 D1 스키마 및 마이그레이션
- `.openai/hosting.json`: Sites 프로젝트 연결 설정

`.env.example`는 필요한 변수 이름만 보여주는 예시 파일입니다. 실제 키와 PIN은 입력하지 마세요.
