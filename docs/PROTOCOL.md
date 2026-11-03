# 메시지 규칙

위젯, 로더, 두 서버, 학교 화면이 이 표 하나를 같이 지킵니다. 새 type 이 필요하면 먼저 여기에 추가합니다.
모든 메시지는 `{ type, payload }` 모양입니다. postMessage 에는 여기에 `source: 'next-queue'` 가 붙습니다.

## 1. postMessage: 로더(학교 페이지, :3000) <-> 대기 화면(iframe, :4000)

| 방향 | type | payload | 뜻 |
|------|------|---------|----|
| 위젯 -> 로더 | `ready` | `{}` | 대기 화면이 떴고 편지를 받을 준비가 됐습니다 |
| 로더 -> 위젯 | `start` | `{ key, studentId, action }` | 누가 무엇을 하려고 줄을 서는지 알려 줍니다 |
| 위젯 -> 로더 | `pass` | `{ token }` | 차례가 왔습니다. 토큰은 학교 서버에 그대로 전달합니다 |
| 위젯 -> 로더 | `cancel` | `{}` | 사용자가 대기를 취소했습니다 |

- 보낼 때 targetOrigin 을 꼭 적습니다. 로더는 `http://localhost:4000`, 위젯은 부모 origin(`document.referrer`)입니다
- 받을 때 `e.origin` 과 `e.source` 를 둘 다 확인합니다. 로더는 `e.source === frame.contentWindow`, 위젯은 `e.source === parent` 인지 봅니다
- 서버가 대기 화면에 `Content-Security-Policy: frame-ancestors http://localhost:3000` 을 붙여서, 대기 화면은 학교 사이트 안에서만 뜹니다

## 2. WebSocket: 대기 화면 <-> 대기열 서버 (`ws://localhost:4000/ws`)

서버는 연결 요청의 Origin 이 `http://localhost:4000` 이 아니면 끊습니다.

| 방향 | type | payload | 뜻 | 레벨 |
|------|------|---------|----|------|
| 위젯 -> 서버 | `join` | `{ key, studentId, action: 'enroll' }` | 줄 끝에 섭니다 | L3 |
| 서버 -> 위젯 | `joined` | `{ ticketId, ahead, resumed? }` | 번호표와 내 앞 인원을 알려 줍니다 | L3 |
| 서버 -> 위젯 | `wait` | `{ ahead, behind, eta }` | 순번이 바뀌었습니다. 같은 내용이면 보내지 않습니다 | L3 |
| 서버 -> 위젯 | `pass` | `{ token }` | 차례가 왔습니다. L4 전에는 `token: null` 입니다 | L3, L4 |
| 위젯 -> 서버 | `leave` | `{}` | 줄에서 빠집니다 | L3 |
| 서버 -> 위젯 | `error` | `{ code }` | `bad_action`, `expired` 중 하나입니다 | L3, L5 |
| 위젯 -> 서버 | `resume` | `{ ticketId }` | 다시 붙었으니 원래 순번으로 돌려 달라는 요청입니다 (15초까지) | L5 |
| 서버 -> 모두 | `ping` | `{ t }` | 10초마다 살아 있는지 묻습니다 | L5 |
| 모두 -> 서버 | `pong` | `{ t }` | ping 에 대한 답입니다. 오지 않으면 서버가 연결을 끊습니다 | L5 |

### 운영 콘솔 (같은 `/ws`)

| 방향 | type | payload | 뜻 |
|------|------|---------|----|
| 콘솔 -> 서버 | `console` | `{}` | 콘솔이라고 알립니다. 이후 `stats` 를 받습니다 |
| 서버 -> 콘솔 | `stats` | `{ waiting, humans, bots, rate, passedTotal, passedLastMinute, openAt, rushSize, line[] }` | 0.5초마다 옵니다 |
| 콘솔 -> 서버 | `set_rate` | `{ rate }` | 초당 입장 인원을 바꿉니다 (1~50) |
| 콘솔 -> 서버 | `add_bots` | `{ count }` | 가상 대기자를 줄에 넣습니다 |
| 콘솔 -> 서버 | `sim` | `{ action: 'open_in', sec }` / `{ action: 'rush_size', count }` / `{ action: 'reset' }` | 수강신청 시작 시각, 몰려오는 인원을 바꾸거나 신청 내역을 비웁니다 (실습 진행용) |

## 3. WebSocket: 학교 화면 <-> 학교 서버 (`ws://localhost:3000/live`)

같은 origin 이라 연결 요청에 세션 쿠키가 같이 갑니다. 서버는 그것으로 학생을 알아보고, 로그인하지 않았으면 `4401` 로 닫습니다.

| 방향 | type | payload | 뜻 | 레벨 |
|------|------|---------|----|------|
| 서버 -> 화면 | `hello` | `{ openAt, seats: [{ key, count, cap }] }` | 처음 붙었을 때 옵니다 | - |
| 서버 -> 화면 | `schedule` | `{ openAt }` | 수강신청 시작 시각이 바뀌었습니다 | - |
| 화면 -> 서버 | `time` | `{ t0 }` | 내 시계로 잰 보낸 시각입니다 | L5 |
| 서버 -> 화면 | `time` | `{ t0, server }` | 서버 시계입니다. `offset = server + (t1 - t0) / 2 - t1` | L5 |
| 서버 -> 모두 | `seats` | `{ key, count, cap }` | 누군가 신청하거나 취소했습니다 | L6 |
| 화면 -> 서버 | `ai_plan` | `{ prompt }` | AI 에게 시간표를 부탁합니다 (300자까지) | L7 |
| 서버 -> 화면 | `ai_start` | `{ id, live, provider, model }` | 시작합니다. `live: false` 면 모의 AI 입니다. provider 는 Claude, OpenAI, Gemini, mock 중 하나입니다 | L7 |
| 서버 -> 화면 | `ai_tool` | `{ id, name, input }` | AI 가 도구를 불렀습니다 | L7 |
| 서버 -> 화면 | `ai_tool_result` | `{ id, name, summary }` | 도구 결과 요약입니다 | L7 |
| 서버 -> 화면 | `ai_delta` | `{ id, text }` | AI 가 쓰는 글자입니다 (스트리밍) | L7 |
| 서버 -> 화면 | `ai_plan` | `{ id, keys, summary }` | 최종 제안입니다 | L7 |
| 서버 -> 화면 | `ai_error` | `{ id, message }` | 실패했습니다 | L7 |
| 서버 -> 화면 | `ai_done` | `{ id }` | 끝났습니다 | L7 |

## 4. 통과 토큰 (L4)

```
token   = base64url(body) + '.' + base64url(HMAC-SHA256(QUEUE_SECRET, base64url(body)))
body    = { t: ticketId, s: 학번, a: 'enroll', exp: 만료 시각(ms, 30초 뒤) }
```

- 대기열 서버가 만들고 학교 서버가 검증합니다. 두 서버만 `QUEUE_SECRET` 을 압니다
- 학교 서버는 서명, 만료, `a === 'enroll'`, `s === 세션의 학번` 을 확인하고, 쓴 `t` 를 기억해 두 번 쓰지 못하게 합니다
- 내용은 암호화가 아니라 서명입니다. 누구나 base64 를 풀어 읽을 수 있지만, 내용을 바꾸면 서명이 맞지 않습니다

## 5. 학교 HTTP API (:3000)

| 메서드 | 경로 | 본문 | 응답 |
|--------|------|------|------|
| GET | `/api/schedule` | - | `{ semester, openAt, serverNow }` |
| GET | `/api/students` | - | `{ items: [{ id, name, dept, year }] }` |
| POST | `/api/login` | `{ studentId }` | 내 정보. `Set-Cookie: sid=...; HttpOnly` |
| POST | `/api/logout` | - | `{ ok }` |
| GET | `/api/me` | - | `{ student, semester, enrolled[], wish[], credits, maxCredits, openAt, serverNow }` |
| GET | `/api/courses?q=&type=&day=` | - | `{ items: [과목] }` |
| POST | `/api/enroll` | `{ key, token }` 또는 `{ code, section, token }` | 내 정보 |
| POST | `/api/drop` | `{ key }` | 내 정보 |
| GET | `/api/captcha` | - | 보안문자 SVG (걸려 있을 때만 옵니다) |
| POST | `/api/captcha` | `{ answer }` | `{ ok }` |

실패는 `{ error, message }` 와 상태 코드로 옵니다.

| 상태 | error | 뜻 |
|------|-------|----|
| 401 | `login_required` | 세션이 없습니다 |
| 403 | `not_open` | 수강신청 시작 전입니다 |
| 403 | `queue_required` | 토큰이 없거나 틀렸습니다 (L4) |
| 403 | `token_used` | 같은 토큰을 다시 썼습니다 (L4) |
| 404 | `no_course` | 없는 학수번호·분반입니다 |
| 409 | `duplicate` / `conflict` / `credit_limit` / `full` | 중복, 시간 겹침, 학점 초과, 정원 초과입니다 |
| 429 | `captcha_required` | 매크로 방지에 걸렸습니다 (L6) |
