// 대기열 운영 콘솔 (:4000). 대기열 서버와 같은 WebSocket(/ws)에 { type: 'console' } 로 붙어 숫자를 받는다.
// 실서비스라면 운영자 로그인이 있어야 한다. 실습에서는 생략했다 (같은 origin 만 붙을 수 있게 서버가 Origin 을 본다)
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ws = null;
  var openAt = 0;

  function send(type, payload) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: type, payload: payload || {} }));
  }

  function connect() {
    ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
    ws.onopen = function () {
      $('conn').textContent = '연결됨';
      $('conn').classList.add('on');
      send('console');
    };
    ws.onclose = function () {
      $('conn').textContent = '끊김, 다시 붙는 중';
      $('conn').classList.remove('on');
      setTimeout(connect, 1500);
    };
    ws.onmessage = function (e) {
      var msg = JSON.parse(e.data);
      if (msg.type === 'ping') return send('pong', msg.payload);
      if (msg.type === 'stats') render(msg.payload);
    };
  }

  var fmt = function (n) { return Number(n).toLocaleString('ko-KR'); };
  function render(s) {
    $('s-waiting').textContent = fmt(s.waiting);
    $('s-split').textContent = '사람 ' + s.humans + ' · 가상 ' + s.bots;
    $('s-rate').textContent = s.rate;
    $('s-minute').textContent = fmt(s.passedLastMinute);
    $('s-total').textContent = fmt(s.passedTotal);
    if (document.activeElement !== $('rate')) {
      $('rate').value = s.rate;
      $('rate-out').textContent = s.rate;
    }
    if (document.activeElement !== $('rush') && s.rushSize !== undefined) $('rush').value = s.rushSize;
    if (s.openAt) openAt = s.openAt;
    $('line').innerHTML = s.line.length
      ? s.line.map(function (t) {
        return '<li class="' + (t.bot ? '' : 'human') + '"><b>' + t.n + '</b><span>' + (t.bot ? '가상 학생' : t.who || '학생') + '</span><span>' + t.sec + '초</span></li>';
      }).join('')
      : '<li class="line-empty">줄 선 사람이 없습니다.</li>';
  }

  var pad = function (n) { return String(n).padStart(2, '0'); };
  setInterval(function () {
    if (!openAt) return;
    var d = new Date(openAt);
    $('open-at').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }, 500);

  $('rate').addEventListener('input', function () {
    $('rate-out').textContent = this.value;
    send('set_rate', { rate: Number(this.value) });
  });
  document.querySelectorAll('[data-bots]').forEach(function (b) {
    b.addEventListener('click', function () { send('add_bots', { count: Number(b.dataset.bots) }); });
  });
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { send('sim', { action: 'open_in', sec: Number(b.dataset.open) }); });
  });
  $('rush-set').addEventListener('click', function () {
    send('sim', { action: 'rush_size', count: Number($('rush').value) });
  });
  $('reset').addEventListener('click', function () {
    if (confirm('모든 학생의 신청 내역을 비울까요?')) send('sim', { action: 'reset' });
  });

  connect();
})();
