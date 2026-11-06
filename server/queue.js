// NEXT Queue 대기열 서버 (:4000). 넷퍼넬 같은 "접속 대기" 서비스를 작게 만든 것이다.
//   - 위젯(iframe)이 WebSocket 으로 줄을 선다 (join)
//   - 서버가 초당 rate 명씩 입장시키고, 줄에 남은 사람에게 순번을 계속 보낸다 (wait)
//   - 차례가 된 사람에게 통과 토큰을 준다 (pass). 학교 서버가 이 토큰을 검증한다 (L4)
//   - 운영 콘솔은 같은 WebSocket 으로 붙어 숫자를 보고, 입장 속도를 바꾼다
import crypto from 'node:crypto';
import { signToken } from './token.js';

const TOKEN_TTL = 30_000; // 통과 토큰 유효 시간
const GRACE = 15_000; // 끊긴 뒤 순번을 지켜 주는 시간 (L6)

export function createQueue({ secret }) {
  const line = []; // 줄. 앞에서부터 입장한다. 원소는 ticket
  const tickets = new Map(); // ticketId -> ticket
  const consoles = new Set();
  const passedAt = []; // 최근 입장 시각들 (콘솔의 분당 입장 수)
  let rate = 10; // 초당 입장 인원
  let budget = 0;
  let passedTotal = 0;

  // ticket = { id, studentId, action, ws, bot, onPass, joinedAt, lastSent, leftAt }
  function newTicket(fields) {
    const ticket = { id: crypto.randomUUID(), joinedAt: Date.now(), lastSent: '', ...fields };
    tickets.set(ticket.id, ticket);
    line.push(ticket);
    return ticket;
  }

  function remove(ticket) {
    const i = line.indexOf(ticket);
    if (i >= 0) line.splice(i, 1);
    tickets.delete(ticket.id);
  }

  function send(ws, msg) {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
  }

  // 차례가 온 사람을 입장시킨다. 토큰을 만들어 위젯(또는 가상 학생)에게 준다
  function admit(ticket) {
    remove(ticket);
    passedTotal += 1;
    passedAt.push(Date.now());
    // [L4] 통과 토큰을 서명해서 준다
    const token = signToken(secret, {
      t: ticket.id,
      s: ticket.studentId,
      a: ticket.action,
      exp: Date.now() + TOKEN_TTL,
    });
    if (ticket.bot) return ticket.onPass(token);
    send(ticket.ws, { type: 'pass', payload: { token } });
  }

  // 0.1초마다 입장 예산을 채우고, 예산만큼 앞사람을 입장시킨다
  setInterval(() => {
    budget = Math.min(budget + rate / 10, rate);
    while (budget >= 1 && line.length && !line[0].leftAt) {
      budget -= 1;
      admit(line[0]);
    }
  }, 100);

  // [L3] 줄 선 사람에게 순번 알려 주기
  setInterval(() => {
    line.forEach((ticket, ahead) => {
      if (!ticket.ws) return;
      const payload = { ahead, behind: line.length - ahead - 1, eta: Math.ceil(ahead / rate) };
      const snapshot = JSON.stringify(payload);
      if (snapshot === ticket.lastSent) return;
      ticket.lastSent = snapshot;
      send(ticket.ws, { type: 'wait', payload });
    });
  }, 250);

  // 콘솔에 숫자 보내기
  setInterval(() => {
    const now = Date.now();
    while (passedAt.length && passedAt[0] < now - 60_000) passedAt.shift();
    const humans = line.filter((t) => !t.bot);
    const stats = {
      waiting: line.length,
      humans: humans.length,
      bots: line.length - humans.length,
      rate,
      passedTotal,
      passedLastMinute: passedAt.length,
      ...(hooks.info ? hooks.info() : {}),
      line: line.slice(0, 40).map((t, i) => ({ n: i + 1, who: t.bot ? '가상 학생' : t.studentId, bot: !!t.bot, sec: Math.round((now - t.joinedAt) / 1000) })),
    };
    for (const ws of consoles) send(ws, { type: 'stats', payload: stats });
  }, 500);

  // [L6] 끊긴 사람 정리하기
  setInterval(() => {
    const now = Date.now();
    for (const ticket of line) {
      if (ticket.leftAt && now - ticket.leftAt > GRACE) remove(ticket);
    }
  }, 1000);

  // ---- WebSocket 한 연결 처리 ----------------------------------------------
  function onConnection(ws) {
    let ticket = null;
    let isConsole = false;
    let alive = true;
    let beat = null;

    // [L6] 하트비트: 10초마다 ping 을 보내고, pong 이 안 오면 끊는다
    beat = setInterval(() => {
      if (!alive) {
        ws.terminate();
        return;
      }
      alive = false;
      send(ws, { type: 'ping', payload: { t: Date.now() } });
    }, 10_000);

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      const p = msg.payload || {};

      if (msg.type === 'pong') {
        alive = true;
        return;
      }

      // 운영 콘솔. 실서비스라면 여기서 운영자 로그인을 확인해야 한다 (실습에서는 생략)
      if (msg.type === 'console') {
        isConsole = true;
        consoles.add(ws);
        return;
      }
      if (isConsole && msg.type === 'set_rate') {
        rate = Math.max(1, Math.min(50, Math.round(Number(p.rate) || 1)));
        return;
      }
      if (isConsole && msg.type === 'sim') {
        hooks.onSim?.(p);
        return;
      }
      if (isConsole && msg.type === 'add_bots') {
        const n = Math.max(1, Math.min(500, Math.round(Number(p.count) || 0)));
        for (let i = 0; i < n; i++) hooks.onBot?.();
        return;
      }

      // [L3] 줄 서기
      if (msg.type === 'join') {
        if (ticket) return;
        const studentId = String(p.studentId ?? '').slice(0, 40);
        if (!studentId || p.action !== 'enroll') {
          send(ws, { type: 'error', payload: { code: 'bad_action' } });
          return;
        }
        ticket = newTicket({ studentId, action: 'enroll', ws });
        send(ws, { type: 'joined', payload: { ticketId: ticket.id, ahead: line.length - 1 } });
        return;
      }
      if (msg.type === 'leave') {
        if (ticket) {
          remove(ticket);
          ticket = null;
        }
        return;
      }

      // [L6] 다시 붙기
      if (msg.type === 'resume') {
        const resumed = tickets.get(String(p.ticketId || ''));
        if (!resumed || !resumed.leftAt || Date.now() - resumed.leftAt > GRACE) {
          send(ws, { type: 'error', payload: { code: 'expired' } });
          return;
        }
        if (resumed.ws && resumed.ws !== ws && resumed.ws.readyState === 1) resumed.ws.close();
        resumed.ws = ws;
        resumed.leftAt = null;
        resumed.lastSent = '';
        ticket = resumed;
        send(ws, { type: 'joined', payload: { ticketId: resumed.id, ahead: line.indexOf(resumed), resumed: true } });
        return;
      }
    });

    ws.on('close', () => {
      clearInterval(beat);
      consoles.delete(ws);
      if (ticket && ticket.ws === ws) {
        // [L6] 끊겨도 바로 빼지 않는다
        ticket.leftAt = Date.now();
      }
    });
  }

  // 가상 학생이 줄을 서는 통로. sim.js 가 쓴다
  function joinBot(studentId, onPass) {
    newTicket({ studentId, action: 'enroll', bot: true, onPass });
  }

  const hooks = {};
  return { onConnection, joinBot, hooks, stats: () => ({ waiting: line.length, rate }) };
}
