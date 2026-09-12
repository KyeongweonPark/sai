# sai · 다국어 실시간 통역

한국어, 영어, 프랑스어, 독일어, 일본어, 중국어 중 선택한 두 언어를 자동 감지해 실시간 음성 또는 문자로 양방향 통역하는 Vinext/Cloudflare Sites 앱입니다.

상단 언어 선택은 화면 언어와 왼쪽 통역 언어를 설정합니다. 언어 표시줄 오른쪽에서 상대 언어를 선택합니다. 같은 언어는 선택할 수 없습니다. 통역 중 언어를 변경하면 현재 연결이 종료되며, 다시 통역 시작을 눌러 새 언어쌍을 적용합니다. 중국어는 표준 중국어 음성과 간체 문자 기준입니다.

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

- `app/page.tsx`: App Router 진입점. 통역 feature 화면만 연결합니다.
- `app/features/interpreter/screens`: 화면 단위 조립 계층입니다.
- `app/features/interpreter/components`: 헤더, 대화, 컨트롤, PIN 입력처럼 표현 책임을 분리합니다.
- `app/features/interpreter/hooks`: 연결 상태와 WebRTC 생명주기를 관리합니다.
- `app/features/interpreter/lib`: 다국어 문구와 브라우저용 API 클라이언트를 관리합니다.
- `app/features/interpreter/server`: Cloudflare 바인딩, 인증 세션, 번역 정책 등 서버 전용 로직입니다.
- `app/api`: HTTP 입력 검증과 응답만 담당하는 얇은 API 라우트입니다.
- `db/schema.ts`, `drizzle/`: PIN 시도와 세션 티켓을 위한 D1 스키마 및 마이그레이션
- `.openai/hosting.json`: Sites 프로젝트 연결 설정

### 통역 연결 흐름

1. `/api/unlock`이 PIN을 검증하고 음성용 일회성 티켓과 문자용 세션 토큰을 발급합니다.
2. 브라우저가 마이크와 WebRTC offer를 준비하고 `/api/session`에서 OpenAI Realtime answer를 받습니다.
3. 음성 전사와 번역 이벤트는 WebRTC data channel을 통해 대화 목록에 반영됩니다.
4. 문자 입력은 별도의 `/api/translate` 경로를 사용하므로 마이크를 지원하지 않는 브라우저에서도 동작합니다.

핵심 보안·수명주기 로직에는 구현 이유를 설명하는 주석을 두었습니다. 새 기능은 가능한 한 `features/interpreter` 내부의 같은 책임 계층에 추가하고, 라우트 파일에는 비즈니스 규칙을 직접 늘리지 않는 것을 권장합니다.

`.env.example`는 필요한 변수 이름만 보여주는 예시 파일입니다. 실제 키와 PIN은 입력하지 마세요.
