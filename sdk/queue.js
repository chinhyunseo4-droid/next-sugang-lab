// NEXT Queue SDK 로더
// 고객사 페이지(학교 수강신청, :3000)의 DOM 안에서 실행된다. 하는 일은 셋뿐이다.
//   1) NextQueue('enter') 가 불리면 대기 화면 iframe 을 페이지 위에 띄운다                    [L1]
//   2) iframe 과 편지(postMessage)를 주고받는다. 통과하면 토큰을 고객사 콜백에 넘긴다          [L2]
//   3) 줄 서기, 순번, 토큰 발급은 전부 iframe 안(우리 origin)과 우리 서버가 한다. 로더는 작게 둔다
// 고객사 CSS 와 섞이지 않게 클래스 이름은 nq- 로 시작하고, 스타일은 여기서 직접 넣는다.
// 편지 형식: { source: 'next-queue', type, payload }   자세히는 docs/PROTOCOL.md

(function () {
  if (window.NextQueue && window.NextQueue.loaded) return;

  // 이 스크립트를 내려준 서버 = 대기열 서버. 하드코딩하지 않고 script src 에서 읽는다
  var QUEUE_ORIGIN = new URL(document.currentScript.src).origin;
  var WIDGET_URL = QUEUE_ORIGIN + '/widget/';

  var queued = (window.NextQueue && window.NextQueue.q) || [];
  var config = { key: '' };
  var frame = null;
  var pending = null; // 지금 줄 서고 있는 요청 { opts, cb }

  function injectStyle() {
    if (document.querySelector('style[data-next-queue]')) return;
    var style = document.createElement('style');
    style.setAttribute('data-next-queue', '');
    style.textContent =
      '.nq-frame{position:fixed;inset:0;z-index:2147483647;width:100%;height:100%;border:0;background:transparent;color-scheme:normal}';
    document.head.appendChild(style);
  }

  function post(type, payload) {
    if (!frame || !frame.contentWindow) return;
    // 받는 쪽 origin 을 꼭 적는다. '*' 를 쓰면 iframe 이 다른 곳으로 바뀌었을 때 편지가 엉뚱한 데로 간다
    frame.contentWindow.postMessage({ source: 'next-queue', type: type, payload: payload }, QUEUE_ORIGIN);
  }

  function close() {
    if (frame) frame.remove();
    frame = null;
  }

  function finish(token, reason) {
    var done = pending;
    pending = null;
    close();
    if (done && done.cb) done.cb(token, reason);
  }

  // 줄 서기 시작. opts = { action: 'enroll', studentId }, cb(token, reason)
  function enter(opts, cb) {
    if (pending) return; // 이미 줄 서는 중이면 무시 (버튼 연타 방지)
    // TODO [L1] 대기 화면 iframe 띄우기
    //   - injectStyle() 한 번, document.createElement('iframe') 에 class 'nq-frame', src WIDGET_URL
    //   - iframe.title 은 '접속 대기', sandbox 는 'allow-scripts allow-same-origin'
    //   - document.body 에 붙이고 frame 변수에 기억, pending = { opts: opts, cb: cb }
    //   - L1 전에는 아래 stub 처럼 줄을 안 서고 바로 통과시킨다 (토큰 없이). 대기열이 죽으면 그냥 통과시키는 사이트가 실제로 많았다
    if (cb) cb(null, 'no-queue');
  }

  // TODO [L2] iframe 의 편지 받기
  //   - window 에 message 리스너를 단다
  //   - e.origin 이 QUEUE_ORIGIN 이 아니거나 e.source 가 frame.contentWindow 가 아니면 무시한다 (남이 보낸 가짜 '통과' 편지 차단)
  //   - data.source 가 'next-queue' 인 것만 본다
  //   - type 'ready'  -> post('start', { key, studentId, action }) 로 누가 무엇을 하려는지 알려 준다
  //   - type 'pass'   -> finish(payload.token)
  //   - type 'cancel' -> finish(null, 'cancel')

  // 고객사가 부르는 하나뿐인 함수. NextQueue('init', {...}) / NextQueue('enter', {...}, cb)
  function api(command, a, b) {
    if (command === 'init') config = Object.assign(config, a || {});
    else if (command === 'enter') enter(a, b);
    else if (command === 'cancel') finish(null, 'cancel');
  }
  api.loaded = true;
  window.NextQueue = api;

  // 로더가 오기 전에 쌓인 호출을 순서대로 처리한다
  for (var i = 0; i < queued.length; i++) api.apply(null, queued[i]);
})();
