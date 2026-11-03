# 메시지 규칙

위젯, 로더, 두 서버, 학교 화면이 이 표 하나를 같이 지킨다. 새 type 이 필요하면 먼저 여기에 추가한다.
모든 메시지는 `{ type, payload }` 모양이다. postMessage 는 여기에 `source: 'next-queue'` 가 붙는다.

## 1. postMessage: 로더(학교 페이지, :3000) <-> 대기 화면(iframe, :4000)

| 방향 | type | payload | 뜻 |
|------|------|---------|----|
| 위젯 -> 로더 | `ready` | `{}` | 대기 화면이 떴고 편지를 받을 준비가 됐다 |
| 로더 -> 위젯 | `start` | `{ key, studentId, action }` | 누가 무엇을 하려고 줄을 서는지 |
| 위젯 -> 로더 | `pass` | `{ token }` | 차례가 왔다. 토큰을 학교 서버에 그대로 전달한다 |
| 위젯 -> 로더 | `cancel` | `{}` | 사용자가 대기를 취소했다 |

- 보낼 때 targetOrigin 을 꼭 적는다. 로더는 `http://localhost:4000`, 위젯은 부모 origin(`document.referrer`)
- 받을 때 `e.origin` 과 `e.source` 를 둘 다 확인한다. 로더는 `e.source === frame.contentWindow`, 위젯은 `e.source === parent`
- 대기 화면은 서버가 `Content-Security-Policy: frame-ancestors http://localhost:3000` 을 붙여 학교 사이트 안에서만 뜬다

## 2. WebSocket: 대기 화면 <-> 대기열 서버 (`ws://localhost:4000/ws`)

서버는 연결 요청의 Origin 이 `http://localhost:4000` 이 아니면 끊는다.

| 방향 | type | payload | 뜻 | 레벨 |
|------|------|---------|----|------|
| 위젯 -> 서버 | `join` | `{ key, studentId, action: 'enroll' }` | 줄 끝에 선다 | L3 |
| 서버 -> 위젯 | `joined` | `{ ticketId, ahead, resumed? }` | 번호표와 내 앞 인원 | L3 |
| 서버 -> 위젯 | `wait` | `{ ahead, behind, eta }` | 순번이 바뀌었다. 같은 내용이면 보내지 않는다 | L3 |
| 서버 -> 위젯 | `pass` | `{ token }` | 차례가 왔다. L4 전에는 `token: null` | L3, L4 |
| 위젯 -> 서버 | `leave` | `{}` | 줄에서 빠진다 | L3 |
| 서버 -> 위젯 | `error` | `{ code }` | `bad_action`, `expired` | L3, L5 |
| 위젯 -> 서버 | `resume` | `{ ticketId }` | 다시 붙었다. 원래 순번으로 돌려 달라 (15초까지) | L5 |
| 서버 -> 모두 | `ping` | `{ t }` | 10초마다. 살아 있는지 | L5 |
| 모두 -> 서버 | `pong` | `{ t }` | ping 에 대한 답. 안 오면 서버가 끊는다 | L5 |

### 운영 콘솔 (같은 `/ws`)

| 방향 | type | payload | 뜻 |
|------|------|---------|----|
| 콘솔 -> 서버 | `console` | `{}` | 나는 콘솔이다. 이후 `stats` 를 받는다 |
| 서버 -> 콘솔 | `stats` | `{ waiting, humans, bots, rate, passedTotal, passedLastMinute, openAt, rushSize, line[] }` | 0.5초마다 |
| 콘솔 -> 서버 | `set_rate` | `{ rate }` | 초당 입장 인원 (1~50) |
| 콘솔 -> 서버 | `add_bots` | `{ count }` | 가상 대기자 투입 |
| 콘솔 -> 서버 | `sim` | `{ action: 'open_in', sec }` / `{ action: 'rush_size', count }` / `{ action: 'reset' }` | 수강신청 시작 시각, 몰려오는 인원, 신청 내역 비우기 (실습 진행용) |

## 3. WebSocket: 학교 화면 <-> 학교 서버 (`ws://localhost:3000/live`)

같은 origin 이라 연결 요청에 세션 쿠키가 같이 간다. 서버는 그걸로 학생을 알아보고, 로그인하지 않았으면 `4401` 로 닫는다.

| 방향 | type | payload | 뜻 | 레벨 |
|------|------|---------|----|------|
| 서버 -> 화면 | `hello` | `{ openAt, seats: [{ key, count, cap }] }` | 처음 붙었을 때 | - |
| 서버 -> 화면 | `schedule` | `{ openAt }` | 수강신청 시작 시각이 바뀌었다 | - |
| 화면 -> 서버 | `time` | `{ t0 }` | 내 시계로 보낸 시각 | L5 |
| 서버 -> 화면 | `time` | `{ t0, server }` | 서버 시계. `offset = server + (t1 - t0) / 2 - t1` | L5 |
| 서버 -> 모두 | `seats` | `{ key, count, cap }` | 누가 신청하거나 취소했다 | L6 |
| 화면 -> 서버 | `ai_plan` | `{ prompt }` | AI 에게 시간표를 부탁한다 (300자까지) | L7 |
| 서버 -> 화면 | `ai_start` | `{ id, live, model }` | 시작. `live: false` 면 모의 AI | L7 |
| 서버 -> 화면 | `ai_tool` | `{ id, name, input }` | AI 가 도구를 불렀다 | L7 |
| 서버 -> 화면 | `ai_tool_result` | `{ id, name, summary }` | 도구 결과 요약 | L7 |
| 서버 -> 화면 | `ai_delta` | `{ id, text }` | AI 가 쓰는 글자 (스트리밍) | L7 |
| 서버 -> 화면 | `ai_plan` | `{ id, keys, summary }` | 최종 제안 | L7 |
| 서버 -> 화면 | `ai_error` | `{ id, message }` | 실패 | L7 |
| 서버 -> 화면 | `ai_done` | `{ id }` | 끝 | L7 |

## 4. 통과 토큰 (L4)

```
token   = base64url(body) + '.' + base64url(HMAC-SHA256(QUEUE_SECRET, base64url(body)))
body    = { t: ticketId, s: 학번, a: 'enroll', exp: 만료 시각(ms, 30초 뒤) }
```

- 대기열 서버가 만들고 학교 서버가 검증한다. 둘만 `QUEUE_SECRET` 을 안다
- 학교 서버는 서명, 만료, `a === 'enroll'`, `s === 세션의 학번` 을 확인하고, 쓴 `t` 를 기억해 두 번 못 쓰게 한다
- 내용은 암호화가 아니라 서명이다. 누구나 base64 를 풀어 읽을 수 있지만, 바꾸면 서명이 안 맞는다

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
| GET | `/api/captcha` | - | 보안문자 SVG (걸려 있을 때만) |
| POST | `/api/captcha` | `{ answer }` | `{ ok }` |

실패는 `{ error, message }` 와 상태 코드로 온다.

| 상태 | error | 뜻 |
|------|-------|----|
| 401 | `login_required` | 세션 없음 |
| 403 | `not_open` | 수강신청 시작 전 |
| 403 | `queue_required` | 토큰이 없거나 틀림 (L4) |
| 403 | `token_used` | 같은 토큰 재사용 (L4) |
| 404 | `no_course` | 없는 학수번호·분반 |
| 409 | `duplicate` / `conflict` / `credit_limit` / `full` | 중복, 시간 겹침, 학점 초과, 정원 초과 |
| 429 | `captcha_required` | 매크로 방지 (L6) |
