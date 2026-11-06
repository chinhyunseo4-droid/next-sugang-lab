// 통과 토큰. 대기열 서버(:4000)가 만들고, 학교 서버(:3000)가 검증한다.
// 둘 다 같은 비밀키(QUEUE_SECRET)를 안다. 브라우저는 토큰을 "전달"만 하고 내용을 바꿀 수 없다.
//
//   토큰 = base64url(내용) + '.' + base64url(HMAC-SHA256(비밀키, base64url(내용)))
//   내용 = { t: 티켓 id, s: 학번, a: 'enroll', exp: 만료 시각(ms) }
import crypto from 'node:crypto';

const b64 = (buf) => Buffer.from(buf).toString('base64url');

export function signToken(secret, payload) {
  const body = b64(JSON.stringify(payload));
  const mac = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${mac}`;
}

// 맞으면 내용을, 틀리면 null 을 돌려준다
export function verifyToken(secret, token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const [body, mac] = parts;
  const expected = crypto.createHmac('sha256', secret).update(body).digest();
  const received = Buffer.from(mac, 'base64url');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || typeof payload !== 'object' || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
