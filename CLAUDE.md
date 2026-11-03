# CLAUDE.md

이 저장소의 규칙은 모두 AGENTS.md 에 있습니다. Codex 는 AGENTS.md 를 바로 읽고, Claude Code 는 아래 줄로 같은 파일을 불러옵니다.

@AGENTS.md

## Claude Code 에서만

- L3, L4, L5, L6 처럼 파일 여러 개를 고치는 레벨은 plan mode 로 계획을 먼저 보여 주고, 학생이 승인하면 고칩니다.
- `npm run dev` 는 백그라운드로 켭니다. :3000 이 이미 떠 있으면 새로 켜지 않습니다.
- 브라우저에서 봐야 하는 확인(iframe, 편지, WS 프레임)은 학생에게 어느 탭에서 무엇을 보면 되는지 알려 줍니다.
