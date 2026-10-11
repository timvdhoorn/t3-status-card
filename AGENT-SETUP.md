# Agent setup

Instructions for a coding agent asked to install the T3 status card. Do the steps in order and report what you changed.

1. Find the user's global instructions file: `~/.claude/CLAUDE.md` for Claude Code, `~/.codex/AGENTS.md` for Codex, otherwise the file your harness loads for every project. If the user keeps shared rules in a file that one imports, edit that file.
2. If it already has a section about final task status or end-of-task summaries, show it to the user and ask whether the card replaces it.
3. Append the section below. If the user writes in Dutch, change the script URL to `s.js?lang=nl`. Keep the version tag pinned.
4. Render one test card with `html_render` that describes this setup task, and tell the user which file you changed.

```markdown
## Final task status
After substantive work on a bounded task (feature, fix, review, research, plan or blocked work), end with a status card instead of a closing summary. Skip it for quick questions and small edits.

In T3 Code, after all other tool calls, call `html_render` (title `Task status`, height 200) with only `<script src="https://cdn.jsdelivr.net/gh/timvdhoorn/t3-status-card@v7/s.js"></script><script>S({...})</script>`, then write the full reply as the final message. T3 folds text written before a tool call under "Worked for", so never put the reply before the card, and do not repeat the card in the reply. Outside T3, or if the render fails, end with one line: task, phase, next step. Fields:
- `y` feature, fix, infra, review or release; `t` title; `i` issue/PR ref when known; `v` release version.
- `p` work phase 1-4 (feature: Scope, Plan, Build, Verify; fix: Diagnose, Plan, Fix, Verify; infra: Measure, Plan, Execute, Verify; review: Scope, Research, Findings, Report). Release has no work phases.
- `d` delivery step, which replaces `p` once started (feature/fix: PR, CI, Merge, Deploy, Production, Sign-off; infra: PR, CI, Merge; release: Bundle, Version, CI, Deploy, Production, Sign-off). Review has no delivery.
- `s` a agent busy, u user's turn, c waiting on CI or another thread, b blocked, d done; `w` names what is awaited or blocking.
- `k` c command, q decision, 0 nothing; `x` its text; optional `l: [label, https-url]` for the PR or issue.
Delivery waits (CI, merge, deploy approval) move `d`, not `p`. Use `s:"d"` only after the last step that applies. When work goes back (failed CI, review fixes), lower `p` or `d` and say why in `w`.
```

For runs that handle several issues at once, `R({...})` renders a run card instead; its fields are in the header of `s.js`.
