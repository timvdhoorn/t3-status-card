# Agent setup

Instructions for a coding agent asked to install the T3 status card. Do the steps in order and report what you changed.

1. Find the user's global instructions file: `~/.claude/CLAUDE.md` for Claude Code, `~/.codex/AGENTS.md` for Codex, otherwise the file your harness loads for every project. If that file imports a shared rules file (such as an `@path` line), edit the shared file. If it already loads `t3-status-card`, only update the version tag and stop.
2. If it already has a section about final task status or end-of-task summaries, show it to the user and ask whether the card replaces it. Yes: replace that section. No: stop.
3. Append the section inside the code block below at the end of the file. If the user writes in Dutch, change the script URL to `s.js?lang=nl`. Keep `@v7`; never use `@latest` or `@main`, because a pinned tag is what keeps every card stable.
4. Render a test card with `html_render`, for example `S({y:"infra",t:"Install T3 status card",p:4,s:"d",k:"0"})`, and tell the user which file you changed. Without `html_render` (outside T3), show the html you would render instead.

```markdown
## Final task status
After substantive work on a bounded task (feature, fix, review, research, plan or blocked work), end with a status card instead of a closing summary. Skip it for quick questions and small edits.

In T3 Code, after all other tool calls, call `html_render` (title `Task status`, height 200) with only `<script src="https://cdn.jsdelivr.net/gh/timvdhoorn/t3-status-card@v7/s.js"></script><script>S({...})</script>`, then write the full reply as the final message. T3 folds text written before a tool call under "Worked for", so never put the reply before the card, and do not repeat the card in the reply. Outside T3, or if the render fails, end with one line: task, phase, next step. Fields:
- `y` feature, fix, infra, review or release; `t` title; `i` issue/PR ref when known; `v` release version.
- `p` work phase 1-4 (feature: Scope, Plan, Build, Verify; fix: Diagnose, Plan, Fix, Verify; infra: Measure, Plan, Execute, Verify; review: Scope, Research, Findings, Report). Release has no work phases.
- `d` delivery step, which replaces `p` once started (feature/fix: PR, CI, Merge, Deploy, Production, Sign-off; infra: PR, CI, Merge; release: Bundle, Version, CI, Deploy, Production, Sign-off). Review has no delivery.
- `s` state: `a` agent busy, `u` user's turn, `c` waiting on CI or another thread, `b` blocked, `d` done; `w` names what is awaited or blocking.
- `k` next step: `c` command, `q` decision, `0` nothing; `x` its text; optional `l: [label, https-url]` for the PR or issue.
Only `t` is required. Example: `S({y:"fix",t:"Login fails after reset",i:"#87",p:3,s:"a",w:"Writing the regression test",x:"bun test auth"})`.
Delivery waits (CI, merge, deploy approval) move `d`, not `p`. Use `s:"d"` only after the last step that applies. When work goes back (failed CI, review fixes), lower `p` or `d` and say why in `w`.
```

For runs that handle several issues at once, `R({...})` renders a run card instead; its fields are in the header of `s.js`.
