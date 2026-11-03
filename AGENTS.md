# AGENTS.md

코딩 에이전트(Codex, Claude Code, Cursor 등)가 이 저장소에서 일할 때 지키는 규칙입니다. 학생도 같이 읽어 두면 에이전트에게 무엇을 시키면 되는지 알 수 있습니다.

이 저장소는 NEXT 학회 실습입니다. **학생이 배우는 것이 목적입니다.** 에이전트는 대신 끝내 주는 도구가 아니라 옆자리 사수처럼 일합니다. 한 번에 한 레벨씩, 계획을 먼저 말하고, 끝나면 학생이 직접 확인하고 설명할 수 있게 돕습니다.

## 1. 저장소 한눈에

한 프로세스가 서버 두 개를 띄웁니다. 포트가 다르면 origin 이 다르므로, 노트북 한 대에서 실제 서비스와 같은 cross-origin 구조가 생깁니다.

| 포트 | 누구 | 하는 일 |
|------|------|--------|
| :3000 | 학교(고객사) | 수강신청 화면(`site/`)과 API, `/live` WebSocket(서버 시간, 잔여석, AI 중계) |
| :4000 | 우리(NEXT Queue) | SDK 로더(`sdk/`), 대기 화면 iframe(`widget/`), 운영 콘솔(`console/`), `/ws` WebSocket(줄 세우기) |

| 경로 | 누구의 코드 | 내용 |
|------|------------|------|
| `site/` | 학교 | 수강신청 화면. head 에 대기열 스니펫이 붙어 있습니다 |
| `server/school.js` | 학교 | 수강신청 API, 세션, 정원, `/live`, AI 에게 빌려주는 도구 |
| `server/ai.js`, `server/providers.js` | 학교 | AI 에이전트 루프, Claude·OpenAI·Gemini 연결부 |
| `sdk/queue.js` | 우리 | 학교 페이지에서 도는 로더. iframe 을 띄우고 편지를 중계합니다 |
| `widget/` | 우리 | iframe 안의 대기 화면. `/ws` 로 대기열 서버와 이야기합니다 |
| `server/queue.js`, `server/token.js` | 우리 | 줄 세우기, 입장, 통과 토큰 서명 |
| `server/index.js`, `server/sim.js` | 실습 틀 | 두 서버, Origin 검사, CSP, 가상 학생. 고치지 않습니다 |
| `docs/MISSIONS.md` | 문서 | 레벨별 할 일과 확인 항목. **작업 전에 해당 절을 꼭 읽습니다** |
| `docs/PROTOCOL.md` | 문서 | postMessage, WebSocket, HTTP 메시지 형식의 기준 |

학생이 받는 main 브랜치는 빈칸이 있는 시작 코드입니다. 빈칸은 이렇게 생겼습니다.

```js
// TODO [L1] 대기 화면 iframe 띄우기
//   - 힌트 줄들 ...
if (cb) cb(null, 'no-queue');   // 임시 코드. 빈칸을 채우면 지웁니다
```

정답 브랜치는 공개하지 않습니다. 인터넷에서 정답을 찾아 붙이지 말고, 이 저장소의 힌트와 문서로 풉니다.

## 2. 레벨 지도

H 는 사람이 개발자도구나 프롬프트로 직접 뚫어 보는 단계이고, L 은 코드로 만들고 막는 단계입니다. 앞 레벨이 끝나야 뒤 레벨이 동작합니다. L5 와 L7 은 따로 해도 됩니다.

| 단계 | 레벨 | 누가 | 고칠 곳 (`TODO [Ln]` 개수) | 끝나면 |
|------|------|------|---------------------------|--------|
| 뚫어 보기 | H1~H4 | 학생만 | 없음 | 버튼 없이 API 로 신청되고, 화면 잠금과 서버 검사의 차이가 보입니다 |
| 만들며 막기 | L1 | 에이전트 가능 | sdk/queue.js (1) | 신청을 누르면 대기 화면 iframe 이 뜹니다 |
| | L2 | 에이전트 가능 | sdk/queue.js (1), widget/widget.js (2) | 3초 뒤 대기 화면이 닫히고 신청됩니다 |
| | L3 | 에이전트 가능 | server/queue.js (2), widget/widget.js (3) | "내 앞에 N명" 이 실시간으로 줄어듭니다 |
| | H5 | 학생만 | 없음 | `QUEUE.enabled = false` 로 줄 없이 신청됩니다 |
| | L4 | 에이전트 가능 | server/token.js (2), server/queue.js (1), server/school.js (1) | H2, H5 우회가 `403 queue_required` 로 막힙니다 |
| AI 붙이기 | L5 | 에이전트 가능 | server/school.js (1), server/ai.js (1) | AI 가 도구를 불러 가며 시간표를 짜는 과정이 실시간으로 보입니다 |
| | H6 | 학생만 | 없음 | 프롬프트로 규칙을 깨려 해도 서버가 지키는 것이 보입니다 |
| 도전 | L6 | 에이전트 가능 | server/queue.js (4), widget/widget.js (3), server/school.js (1), site/app.js (1) | 새로고침해도 순번이 유지되고, 시계가 서버 시간으로 바뀝니다 |
| | L7 | 에이전트 가능 | server/school.js (2), site/app.js (1) | 잔여석이 실시간으로 줄고, 연타하면 보안문자가 뜹니다 |

빈칸 찾기: `grep -rn "TODO \[L3\]" server sdk widget site`

## 3. 한 레벨을 하는 순서

1. **레벨을 정합니다.** 학생이 레벨을 말하지 않았으면 먼저 묻습니다. "다 해 줘" 라고 하면 한 레벨씩 하자고 제안하고, 남은 레벨 중 가장 앞의 것부터 시작합니다.
2. **읽습니다.** `docs/MISSIONS.md` 의 해당 절, 그 레벨의 `TODO` 와 힌트, `docs/PROTOCOL.md` 의 관련 표를 읽습니다.
3. **계획을 말합니다.** 코드를 쓰기 전에 무엇을, 왜, 어느 파일에서 바꿀지 2~3줄로 말합니다. 학생이 "바로 해" 라고 했으면 이 단계는 줄여도 됩니다.
4. **그 레벨의 빈칸만 채웁니다.** `// TODO [Ln] 제목` 줄은 `// [Ln] 제목` 으로 바꿔 남기고, 임시 코드는 지웁니다. 힌트 주석은 지워도 됩니다.
5. **확인합니다.** 터미널로 확인할 수 있는 것은 직접 해 보고, 브라우저에서 봐야 하는 것은 학생에게 어디를 보면 되는지 알려 줍니다(5절).
6. **보고합니다.** 짧게 네 가지를 말합니다.
   - 바꾼 파일과 함수
   - 왜 그렇게 했는지 (3줄 이내)
   - 학생이 직접 확인할 것 (MISSIONS 의 체크 항목)
   - 학생에게 던지는 질문 하나 (MISSIONS 의 "생각해 볼 것" 등)

학생이 처음 보는 개념(origin, sandbox, postMessage, WebSocket upgrade, HMAC, timingSafeEqual, tool use 등)이 나오면 한 줄로 풀어 줍니다.

## 4. 지키는 것

### 범위
- 한 번에 레벨 하나만 합니다. 다른 레벨의 `TODO` 는 건드리지 않습니다.
- **H1~H6 은 학생이 직접 합니다.** 에이전트가 대신 fetch 를 돌리거나 프롬프트를 보내지 않습니다. 물으면 어느 탭에서 무엇을 보면 되는지만 알려 줍니다.
- 일부러 남겨 둔 구멍은 해당 레벨 전에 막지 않습니다. `site/app.js` 의 `QUEUE.enabled` 스위치는 지우지 않고(H5 에서 씁니다), 토큰 검사는 L4 에서만 넣습니다.
- `site/` 와 `server/school.js` 는 학교 코드입니다. 해당 레벨의 `TODO` 말고는 고치지 않습니다.
- `server/index.js`(Origin 검사, CSP `frame-ancestors`), `server/sim.js`, `shared/`, `package.json` 은 고치지 않습니다. 새 패키지를 설치하지 않고, 포트와 파일 이름을 바꾸지 않습니다.
- 대상은 이 저장소의 로컬 서버(:3000, :4000)뿐입니다. 실제 학교 사이트나 남의 서비스를 겨냥한 매크로, 우회, 자동 신청 코드는 어떤 경우에도 만들지 않습니다.

### 메시지
- postMessage 와 WebSocket 메시지 형식은 `docs/PROTOCOL.md` 가 기준입니다. 새 type 을 지어내지 않습니다. 필요하면 먼저 PROTOCOL.md 에 추가하자고 제안합니다.
- postMessage 를 보낼 때 targetOrigin 에 `'*'` 를 쓰지 않습니다. 받을 때는 `e.origin` 과 `e.source` 를 둘 다 확인합니다.
- 서버는 클라이언트가 보낸 값을 믿지 않습니다. 학번은 세션에서, 줄 선 사람은 소켓에 기록된 티켓에서 정합니다.
- 에러를 조용히 삼키지 않습니다. 최소한 상태 글자나 콘솔에 이유를 남깁니다.

### 보안
- `QUEUE_SECRET` 과 AI 키(`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`)는 `.env` 에만 둡니다. 브라우저로 내려가는 파일(`site/`, `sdk/`, `widget/`, `console/`)에는 절대 쓰지 않습니다.
- 막힌 것을 풀어서 동작하게 만들지 않습니다. 토큰 검사 끄기, Origin 검사나 CSP 지우기, sandbox 풀기, targetOrigin 을 `'*'` 로 바꾸기는 해결이 아닙니다. 막힌 이유를 학생에게 설명합니다.
- 학생이 대화에 키를 붙여 넣으면 `.env` 에 넣으라고 안내하고, 코드나 커밋에는 쓰지 않습니다.

### AI (L5, H6)
- 모델은 데이터에 직접 닿지 않습니다. 학교 서버가 빌려준 도구로만 봅니다. 도구 입력은 서버에서 다시 검사합니다(`server/ai.js` 의 `validate`).
- 도구를 늘리지 않습니다. 특히 학번을 입력으로 받는 도구나 신청까지 해 버리는 도구는 만들지 않습니다. H6 에서 학생이 확인하는 것이 바로 이것입니다.
- 모델 호출 횟수와 답 길이에 상한을 둡니다(비용).
- 에이전트 루프(`server/ai.js`)는 회사와 상관없이 하나입니다. 회사별 차이는 `server/providers.js` 에만 넣습니다. Claude, OpenAI, Gemini 중 학생이 가진 키 하나로 동작해야 합니다.

### 디자인
- 우리 화면(`widget/`, `console/`)은 `DESIGN.md` 와 `shared/tokens.css` 를 따릅니다. 색은 변수로만 쓰고, 새 색이나 그림자를 만들지 않습니다.
- 학교 화면(`site/`)은 학교 사이트를 따라 만든 클론입니다. 학교 로고와 자산은 넣지 않습니다.

## 5. 확인 방법

```bash
npm install
npm run dev        # node --watch. 서버 파일을 저장하면 자동으로 다시 켜집니다
```

- 서버가 이미 켜져 있으면(:3000 사용 중) 새로 켜지 않습니다. 켤 수 있으면 백그라운드로 켭니다.
- 문법 확인: `node --check server/queue.js`
- 창 두 개: http://localhost:3000 (수강신청. 오른쪽 위에서 학생을 고르고 Login), http://localhost:4000/console/ (운영 콘솔. **지금 시작** 으로 수강신청을 엽니다)
- 브라우저에서 볼 곳: Elements(iframe), Console(편지, 에러), Network 의 Fetch/XHR(`/api/enroll`)과 WS(101 응답, 프레임)

터미널에서 L4 확인하기 (운영 콘솔에서 **지금 시작** 을 누른 뒤):

```bash
curl -s -c /tmp/sugang.txt -X POST localhost:3000/api/login -H 'Content-Type: application/json' -d '{"studentId":"2025320101"}' > /dev/null
curl -s -w ' %{http_code}\n' -b /tmp/sugang.txt -X POST localhost:3000/api/enroll -H 'Content-Type: application/json' -d '{"key":"COSE342-01"}'
# L4 전: 200 과 내 신청 내역   L4 후: 403 과 "queue_required"
```

AI 는 키가 없으면 모의 AI 로 돕니다. 서버를 켤 때 터미널에 `> AI 시간표  Claude claude-opus-5-5` 처럼 지금 쓰는 모델이 찍힙니다.

## 6. 말투

- 설명과 문서는 합니다체로, 짧게 씁니다.
- 답을 바로 알려 주기보다 어디를 보면 답이 나오는지 먼저 알려 줍니다. 레벨이 끝날 때마다 학생이 이해했는지 확인하는 질문을 하나 남깁니다.
