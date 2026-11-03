// 서버 두 개를 한 프로세스에서 띄운다.
//   :3000  학교 수강신청 사이트 (site/)   고객사. 수강신청 API, /live WebSocket (서버 시간, 잔여석, AI)
//   :4000  NEXT Queue 대기열 서비스        우리. SDK 스크립트, 대기 화면 iframe, 운영 콘솔, /ws WebSocket
// 포트가 다르면 origin 이 다르다. 노트북 하나로도 실제와 같은 cross-origin 상황이 생긴다.
// 메시지 규칙은 docs/PROTOCOL.md 에 표로 정리돼 있다.
import http from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { loadEnv } from './env.js';
import { sendFile, sendJson } from './http.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
loadEnv(join(ROOT, '.env'));

// ai.js 가 .env 를 읽은 뒤에 불려야 해서 동적으로 가져온다
const { createSchool } = await import('./school.js');
const { createQueue } = await import('./queue.js');
const { createSim } = await import('./sim.js');

const SITE_PORT = 3000;
const QUEUE_PORT = 4000;
const SITE_ORIGIN = `http://localhost:${SITE_PORT}`;
const QUEUE_ORIGIN = `http://localhost:${QUEUE_PORT}`;

// 대기열 서버와 학교 서버만 아는 비밀키. 브라우저로 내려가는 파일에는 절대 쓰지 않는다 (L4)
const QUEUE_SECRET = process.env.QUEUE_SECRET || 'dev-only-secret-change-me';

const school = createSchool({ secret: QUEUE_SECRET });
const queue = createQueue({ secret: QUEUE_SECRET });
const sim = createSim({ school, queue });
queue.hooks.onBot = () => sim.spawn();
queue.hooks.onSim = (p) => sim.command(p);
queue.hooks.info = () => sim.info();

// ---------------------------------------------------------------------------
// :3000 학교 수강신청 사이트
// ---------------------------------------------------------------------------
const siteServer = http.createServer(async (req, res) => {
  const url = new URL(req.url, SITE_ORIGIN);
  try {
    if (url.pathname.startsWith('/api/')) return await school.handle(req, res, url);
    return sendFile(res, join(ROOT, 'site'), url.pathname);
  } catch (err) {
    console.error(err);
    sendJson(res, err.status || 500, { error: err.message || 'server_error' });
  }
});
const liveWss = new WebSocketServer({ noServer: true });
siteServer.on('upgrade', (req, socket, head) => {
  // 다른 사이트가 우리 학생의 쿠키를 들고 WebSocket 을 열지 못하게 Origin 을 확인한다
  if (new URL(req.url, SITE_ORIGIN).pathname !== '/live' || req.headers.origin !== SITE_ORIGIN) return socket.destroy();
  liveWss.handleUpgrade(req, socket, head, (ws) => school.onLive(ws, req));
});
siteServer.listen(SITE_PORT, () => console.log(`> 수강신청 사이트  ${SITE_ORIGIN}`));

// ---------------------------------------------------------------------------
// :4000 NEXT Queue
// ---------------------------------------------------------------------------
const queueServer = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, QUEUE_ORIGIN);
  if (pathname === '/') {
    res.writeHead(302, { Location: '/console/' });
    return res.end();
  }
  if (pathname.startsWith('/sdk/')) return sendFile(res, join(ROOT, 'sdk'), pathname.slice(4));
  if (pathname.startsWith('/shared/')) return sendFile(res, join(ROOT, 'shared'), pathname.slice(7));
  if (pathname.startsWith('/widget/')) {
    // frame-ancestors: 대기 화면을 iframe 으로 띄워도 되는 사이트를 서버가 정한다. 목록 밖이면 브라우저가 거부한다
    return sendFile(res, join(ROOT, 'widget'), pathname.slice(7), {
      'Content-Security-Policy': `frame-ancestors ${SITE_ORIGIN}`,
    });
  }
  if (pathname.startsWith('/console/')) return sendFile(res, join(ROOT, 'console'), pathname.slice(8));
  sendJson(res, 404, { error: 'not_found' });
});
const queueWss = new WebSocketServer({ noServer: true });
queueServer.on('upgrade', (req, socket, head) => {
  // 위젯(iframe)과 콘솔은 둘 다 :4000 에서 열린다. 브라우저가 붙여 주는 Origin 으로 남의 페이지를 거른다
  if (new URL(req.url, QUEUE_ORIGIN).pathname !== '/ws' || req.headers.origin !== QUEUE_ORIGIN) return socket.destroy();
  queueWss.handleUpgrade(req, socket, head, (ws) => queue.onConnection(ws, req));
});
queueServer.listen(QUEUE_PORT, () => {
  console.log(`> NEXT Queue       ${QUEUE_ORIGIN}  (콘솔 ${QUEUE_ORIGIN}/console/)`);
  console.log(`> AI 시간표        ${process.env.ANTHROPIC_API_KEY || process.env.AI_MODE === 'live' ? `모델 ${process.env.AI_MODEL || 'claude-opus-5-5'}` : '모의 AI (키 없음)'}`);
});
