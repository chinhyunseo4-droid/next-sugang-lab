// 가상 학생. 수강신청이 열리면 한꺼번에 몰려와 대기열에 줄을 서고, 차례가 오면 인기 과목을 신청한다.
// 사람과 똑같이 대기열(통과 토큰)과 학교 서버의 검사를 지난다. 지름길은 없다.
import { COURSES } from './data.js';

export function createSim({ school, queue }) {
  let seq = 0;
  let rushSize = 150; // 오픈 때 몰려오는 가상 학생 수
  let rushTimer = null;
  const weighted = COURSES.flatMap((c) => Array(c.pop * c.pop + 1).fill(c.key)); // 인기 과목일수록 많이 고른다

  function spawn() {
    const id = `bot-${++seq}`;
    queue.joinBot(id, (token) => {
      const key = weighted[Math.floor(Math.random() * weighted.length)];
      school.enroll(id, key, token);
    });
  }

  // 오픈 직후 3초 동안 rushSize 명이 나눠서 들어온다
  function scheduleRush() {
    clearTimeout(rushTimer);
    const delay = Math.max(0, school.openAt() - school.now());
    rushTimer = setTimeout(() => {
      let left = rushSize;
      const tick = setInterval(() => {
        for (let i = 0; i < Math.ceil(rushSize / 30) && left > 0; i++, left--) spawn();
        if (left <= 0) clearInterval(tick);
      }, 100);
    }, delay);
  }

  // 운영 콘솔에서 오는 명령
  function command(p) {
    if (p.action === 'open_in') {
      school.setOpenAt(school.now() + Math.max(0, Number(p.sec) || 0) * 1000);
      scheduleRush();
    } else if (p.action === 'rush_size') {
      rushSize = Math.max(0, Math.min(1000, Math.round(Number(p.count) || 0)));
    } else if (p.action === 'reset') {
      school.reset();
    }
  }

  scheduleRush();
  return { spawn, command, info: () => ({ rushSize, openAt: school.openAt() }) };
}
