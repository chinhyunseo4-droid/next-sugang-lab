# next-sugang-lab

NEXT 학회 실습 저장소. 수강신청 사이트 클론에 **대기열 SDK**(넷퍼넬 같은 "접속 대기" 서비스)를 직접 만들어 붙인다.
먼저 개발자도구로 사이트를 뚫어 보고, 직접 만들면서 하나씩 막고, 마지막에 AI 에이전트를 붙인다.

```
학교 수강신청 사이트 (localhost:3000)                    NEXT Queue 대기열 서비스 (localhost:4000)
┌────────────────────────────────────────┐            ┌──────────────────────────────────────┐
│ <script> 스니펫 한 줄                     │ ─ queue.js ─│ /sdk/queue.js   로더                   │
│                                        │            │                                      │
│ [신청] -> NextQueue('enter')            │            │ /widget/   대기 화면 (iframe)           │
│   ┌ iframe (4000 origin) ───────────┐  │ postMessage │                                      │
│   │  접속 대기 중. 내 앞에 118명      │◄─┼───────────►│ ws://4000/ws   줄 서기, 순번, 통과 토큰  │
│   └─────────────────────────────────┘  │            │ /console/  운영 콘솔 (입장 속도)         │
│                                        │            └──────────────────────────────────────┘
│ POST /api/enroll { key, token } ───────┼──► 학교 서버(:3000)가 토큰을 검증하고 정원을 확인한다
│ ws://3000/live  서버 시간, 잔여석, AI ◄──┤
└────────────────────────────────────────┘
```

포트가 다르면 origin 이 다르다. 3000 과 4000 은 브라우저 입장에서 서로 남이다. 그래서 실제 서비스와 같은 cross-origin 상황이 노트북 하나에서 그대로 생긴다.

## 시작

```bash
npm install
npm run dev
```

- 수강신청 사이트: http://localhost:3000 (오른쪽 위에서 샘플 학생을 고르고 Login)
- 대기열 운영 콘솔: http://localhost:4000/console/ (수강신청 시작 시각, 입장 속도, 가상 대기자)

`.env` 는 없어도 된다. 키가 없으면 AI 는 모의 AI 로 같은 흐름이 돈다.

AI 를 진짜 모델로 돌리려면 `cp .env.example .env` 후 Claude, OpenAI, Gemini 중 **쓰고 싶은 회사 하나의 키**를 넣는다. 키는 각자 발급한다.

| 회사 | 키 발급 | `.env` | 기본 모델 |
|------|--------|--------|----------|
| Claude | https://console.anthropic.com | `ANTHROPIC_API_KEY` | claude-opus-5-5 |
| OpenAI | https://platform.openai.com | `OPENAI_API_KEY` | gpt-6-luna |
| Gemini | https://aistudio.google.com (무료 사용량 있음) | `GEMINI_API_KEY` | gemini-3.6-flash |

`AI_PROVIDER` 로 회사를(비우면 키가 있는 첫 회사), `AI_MODEL` 로 모델을 바꾼다. 서버를 켜면 터미널에 `> AI 시간표  Claude claude-opus-5-5` 처럼 지금 쓰는 모델이 찍힌다.

## 구성

| 부 | 내용 | 끝나면 할 수 있는 것 |
|----|------|------------------|
| 0부 뚫어 보기 | H1~H4. 개발자도구(Network, Console, Elements, Application)로 사이트의 구멍 찾기 | 버튼 뒤에 API 가 있고, 화면이 막는 것과 서버가 막는 것은 다르다는 걸 설명한다 |
| 1부 만들기 | L1 스크립트 한 줄 · L2 postMessage · L3 WebSocket 대기열 · H5 대기열 뚫기 · L4 통과 토큰 | 남의 사이트에 심는 SDK 가 iframe, postMessage, WebSocket, 서명 토큰으로 어떻게 맞물리는지 설명한다 |
| 2부 더 깊게 | L5 재연결과 서버 시간 · L6 실시간 잔여석과 매크로 방지 · L7 AI 시간표 에이전트 | 끊겨도 사는 실시간 서비스, 동시성, AI 에이전트가 서버 도구를 부르는 구조를 설명한다 |

자세한 할 일과 확인 항목은 [docs/MISSIONS.md](docs/MISSIONS.md), 메시지 형식은 [docs/PROTOCOL.md](docs/PROTOCOL.md).

## 폴더

| 폴더 | 누구의 코드인가 | 하는 일 |
|------|----------------|--------|
| `site/` | 학교(고객사) | 수강신청 화면. head 에 대기열 스니펫 한 줄이 붙어 있다 |
| `server/school.js` | 학교(고객사) | 수강신청 API, 세션, 정원, `/live` WebSocket |
| `server/ai.js` | 학교(고객사) | AI 시간표 에이전트. 학교 서버의 도구를 빌려 쓴다 |
| `server/providers.js` | 학교(고객사) | Claude, OpenAI, Gemini 연결부. 회사마다 다른 메시지 모양을 맞춘다 |
| `sdk/queue.js` | 우리 | 학교 페이지에서 실행되는 로더. iframe 을 띄우고 편지를 중계한다 |
| `widget/` | 우리 | iframe 안의 대기 화면. 대기열 서버와 WebSocket 으로 이야기한다 |
| `console/` | 우리 | 대기열 운영 콘솔 |
| `server/queue.js`, `server/token.js` | 우리 | 줄 세우기, 입장, 통과 토큰 서명 |
| `server/sim.js` | 실습용 | 가상 학생. 수강신청이 열리면 몰려와 줄을 서고 인기 과목을 신청한다 |
| `shared/tokens.css`, `DESIGN.md` | 우리 | 우리 서비스의 디자인 토큰과 규칙 |

## AI 에이전트와 같이 하기

`AGENTS.md` (Claude Code 는 `CLAUDE.md` 를 거쳐) 에 이 저장소의 규칙이 있다. 레벨 하나씩 시키고, 끝날 때마다 직접 확인한다.

```
docs/MISSIONS.md 의 L1 만 해 줘. sdk/queue.js 의 TODO [L1] 만 채우고 다른 파일은 건드리지 마.
끝나면 무엇을 바꿨는지, 왜 그렇게 했는지 3줄로 설명해 줘.
```

끝나고 직접 설명할 수 있어야 하는 것

1. 신청 버튼을 누른 뒤 토큰 하나가 대기열 서버에서 학교 서버까지 가는 길
2. postMessage 에서 origin 을 확인하는 이유와, 그걸로도 못 막는 것
3. 브라우저에 있는 스위치(`QUEUE.enabled`)로는 아무것도 지킬 수 없는 이유

## 주의

- 이 사이트는 실습용 클론이다. 실제 고려대학교 수강신청과 무관하고, 학교 로고나 자산은 쓰지 않았다.
- 0부와 H5 는 **이 저장소의 로컬 서버에서만** 한다. 실제 학교 사이트를 상대로 매크로를 만들거나 돌리지 않는다.
- 비밀값(`QUEUE_SECRET`, AI 키)은 `.env` 에만 둔다. `site/`, `sdk/`, `widget/`, `console/` 은 브라우저로 내려가는 파일이라 비밀값을 쓰면 안 된다.
