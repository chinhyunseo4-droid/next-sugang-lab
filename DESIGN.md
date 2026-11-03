---
version: alpha
name: NEXT Queue
description: 고객사 페이지 위에 뜨는 접속 대기 화면과 대기열 운영 콘솔. 애플식 중립 캔버스(Apple DESIGN.md)를 바탕으로, 화면 안의 색은 회색 계열만 쓰고 주황(NEXT) 하나만 행동 색으로 쓴다. 구성은 "숫자가 주인공, 장식은 거의 없음" 원칙을 따른다. 깊이는 테두리가 아니라 면의 높이(그림자)와 명도 차로 만든다.

colors:
  bg: { light: "#f5f5f5", dark: "#0a0a0a" }
  surface: { light: "#ffffff", dark: "#171717" }
  surface-2: { light: "#f0f0f0", dark: "#1f1f1f" }
  surface-3: { light: "#e6e6e6", dark: "#262626" }
  ink: { light: "#0a0a0a", dark: "#f5f5f5" }
  ink-2: { light: "#3d3d3d", dark: "#d4d4d4" }
  ink-3: { light: "#6b6b6b", dark: "#a3a3a3" }
  ink-4: { light: "#9a9a9a", dark: "#737373" }
  hairline: { light: "rgba(0,0,0,.08)", dark: "rgba(255,255,255,.08)" }
  accent: "#ef7c10"
  on-accent: "#0a0a0a"
  accent-text: { light: "#a3520a", dark: "#f39a45" }
  danger: { light: "#b42318", dark: "#ff6b5e" }

typography:
  family-sans: "Pretendard Variable, -apple-system, Apple SD Gothic Neo, system-ui"
  family-mono: "SF Mono, ui-monospace, Menlo"
  title-lg: { fontSize: 22px, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.03em }
  title-md: { fontSize: 18px, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.03em }
  body: { fontSize: 15px, fontWeight: 400, lineHeight: 1.5, letterSpacing: -0.01em }
  count: { fontSize: 44px, fontWeight: 800, lineHeight: 1, letterSpacing: -0.04em, numeric: tabular }
  caption: { fontSize: 12.5px, fontWeight: 400, lineHeight: 1.4 }
  label: { fontSize: 13px, fontWeight: 600, lineHeight: 1.3 }

rounded:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 22px
  xl: 28px
  pill: 999px
  corner-shape: squircle

spacing:
  unit: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 48]

motion:
  ease-out: "cubic-bezier(.22,1,.36,1)"
  ease-spring: "cubic-bezier(.32,.72,0,1)"
  duration: { fast: 120ms, base: 200ms, slow: 320ms, sheet: 460ms }

components:
  waiting-card: { width: 380px, rounded: xl, shadow: shadow-3, scrim: "--scrim", enter: "translateY(16px) scale(.96) -> none, 460ms spring" }
  progress: { height: 8px, track: surface-2, fill: accent, move: "width 600ms ease-out" }
  meta-tile: { background: surface-2, rounded: md, label: caption ink-3, value: 15px 700 tabular }
  console-stat: { background: surface, rounded: lg, shadow: shadow-1, value: "30~44px 800 tabular" }
  line-chip: { background: surface-2, me: "accent + on-accent" }
  button: { background: surface-2, rounded: pill, press: "scale .97" }
---

# NEXT Queue 디자인 시스템

## 1. 기준

- 바탕은 Apple DESIGN.md (awesome-design-md) 의 원칙을 가져왔다. 크롬(틀)은 물러나고 내용이 앞에 선다. 행동 색은 하나뿐이다.
- 장식은 거의 없다. 강조색은 진행 막대, 콘솔 줄에서 "나", 포커스 링에만 쓴다.
- 두 기준에서 바꾼 것: 애플의 회색은 살짝 푸르다. 여기서는 모든 중립색을 R=G=B 로 맞췄다. 행동 색은 애플 파랑 대신 NEXT 주황 #EF7C10.

## 2. 색

- 화면의 99% 는 회색이다. 주황은 진행 막대, 콘솔 줄의 사람(나), 포커스 링에만 쓴다.
- 주황 면 위의 글자는 항상 검정(--on-accent). 흰 글자는 대비 2.8:1 이라 쓰지 않는다.
- 주황 글자가 꼭 필요하면 --accent-text 를 쓴다 (라이트 5.1:1, 다크 8.1:1).
- 어두운 모드는 #0a0a0a / #171717 / #1f1f1f / #262626 네 단계. 남색 기가 도는 다크는 쓰지 않는다.
- 색을 hex 로 직접 쓰지 않는다. 항상 shared/tokens.css 의 변수로 쓴다. 변수 하나가 라이트와 다크 두 값을 다 가진다.

## 3. 깊이와 면

- 구분은 테두리가 아니라 면의 높이로 한다. 대기 카드와 콘솔 패널만 그림자를 가진 면으로 띄운다.
- 테두리는 입력칸처럼 경계가 꼭 필요한 곳에 hairline(8% 투명) 한 줄만.
- 유리 효과(backdrop-filter blur)는 콘솔 상단 바 한 곳뿐이다. 아래로 다른 내용이 지나가는 자리다.
- 색 있는 반투명 배경 + 같은 색 테두리 조합, 색 동그라미 안의 같은 색 아이콘, 항목 왼쪽의 색 세로 막대는 쓰지 않는다. 선택된 항목은 면을 한 단 올려서 보여 준다.

## 4. 모서리

- 모든 둥근 모서리는 애플식 연속 곡률(squircle)이다. `@supports (corner-shape: squircle)` 안에서 켜고, 지원하지 않는 브라우저는 같은 반경의 border-radius 로 보인다.
- squircle 은 같은 반경이면 더 각져 보여서, 켤 때 반경을 약 1.3배 키운다 (tokens.css 참고).
- 아이콘은 24 격자, 선 1.8, 끝과 꺾임은 둥글게. 대기 화면과 콘솔이 같은 규칙을 쓴다.

## 5. 글자

- Pretendard 가변 폰트, 없으면 Apple SD Gothic Neo. 숫자는 tabular-nums.
- 제목은 굵기 700, 자간 -0.03em. 큰 숫자(내 앞 인원)는 800, 자간 -0.04em.
- 한국어 줄바꿈은 word-break: keep-all. 단어 중간에서 끊지 않는다.
- 작은 영어 대문자 라벨(eyebrow)을 제목 위에 얹지 않는다.

## 6. 움직임

- 대기 카드: 아래에서 16px, 0.96 배에서 제자리로 460ms spring. 뒤 배경(scrim)은 투명도만.
- 진행 막대와 숫자는 서버가 보낸 값으로만 바뀐다. 가짜로 차오르는 애니메이션을 만들지 않는다.
- prefers-reduced-motion 이면 모든 움직임을 끄고 투명도만 바꾼다.
- 상태를 알리려고 깜빡이는 점이나 LIVE 배지는 쓰지 않는다. 연결 상태는 글자로 쓴다.

## 7. 학교 페이지(site/)

- 학교 수강신청 사이트는 남의 회사(고객사) 화면이다. 실제 학교 사이트의 구성과 색(크림슨 상단 바, 왼쪽 메뉴, 표)을 따라 만든 실습용 클론이고, 이 문서의 규칙은 site/ 에 적용하지 않는다.
- 학교 로고와 자산은 쓰지 않는다. 로고 자리는 글자 마크("수강신청 실습").
- 대기 화면(iframe)은 우리 디자인이라, 학교 화면 위에 다른 회사 것처럼 보이는 게 맞다.

## 8. 에이전트에게

- 새 화면이나 요소를 만들 때 이 문서와 shared/tokens.css 만 쓴다. 새 색, 새 그림자, 새 반경을 만들지 않는다.
- 필요한 토큰이 없으면 먼저 이 문서에 추가하고, 그다음 tokens.css, 마지막으로 코드.
