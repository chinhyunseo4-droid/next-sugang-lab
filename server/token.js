// 통과 토큰. 대기열 서버(:4000)가 만들고, 학교 서버(:3000)가 검증한다.
// 둘 다 같은 비밀키(QUEUE_SECRET)를 안다. 브라우저는 토큰을 "전달"만 하고 내용을 바꿀 수 없다.
//
//   토큰 = base64url(내용) + '.' + base64url(HMAC-SHA256(비밀키, base64url(내용)))
//   내용 = { t: 티켓 id, s: 학번, a: 'enroll', exp: 만료 시각(ms) }
import crypto from 'node:crypto';

const b64 = (buf) => Buffer.from(buf).toString('base64url');

export function signToken(secret, payload) {
  // TODO [L4] 통과 토큰 만들기
  //   - body = b64(JSON.stringify(payload))
  //   - mac = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  //   - body + '.' + mac 을 돌려준다
  return null;
}

// 맞으면 내용을, 틀리면 null 을 돌려준다
export function verifyToken(secret, token) {
  // TODO [L4] 통과 토큰 검증하기
  //   - '.' 으로 body 와 mac 을 나누고, 같은 비밀키로 mac 을 다시 계산해 비교한다
  //   - 비교는 crypto.timingSafeEqual 로 한다 (글자 하나씩 비교하면 시간 차이로 정답이 새어 나간다)
  //   - 내용을 JSON 으로 풀고, exp 가 지났으면 null
  return null;
}
