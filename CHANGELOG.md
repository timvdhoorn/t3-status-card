# Changelog

Each version is a git tag served by jsDelivr. Tags never move, because jsDelivr caches them; a change gets the next tag. To preview before tagging, load `@<commit-sha>` in `html_preview`.

- **v8:** the `l` link is a real `<a href>`, so T3 opens it like a chat link: a pull request from the thread's project opens in the right panel, Cmd/Ctrl-click goes to the system browser. The `i` ref in the title row links to `l` as well. Needs T3 Code with pingdotgg/t3code#18897.
- **v7:** English labels by default, Dutch with `s.js?lang=nl`. Empty progress segments are visible in the light theme. Public README, screenshots and agent setup instructions.
- **v6:** optional `g` step overview on `S()`: one character per playbook step (k ok, r running, u your turn, b blocked, s skipped, - open), rendered as numbered cells.
- **v5:** cards restyled after T3 subagent cards: bordered card, status dot with coloured state word, one compact progress line (work or delivery), refs on the right.
- **v4:** run card `R()` for multi-item runs (item grid with accepted count, acceptance criteria, out-of-scope and stop points, open points, optional delivery track). Based on an automated multi-issue build run where progress lived in long text blocks and a single phase bar sat on "execution 3/5" for hours.
- **v3:** removed the top border line.
- **v2:** separate work and delivery tracks with fixed labels per task type (feature, fix, infra, review, release), and states for agent busy, your turn, waiting, blocked and done. Based on 164 sessions: 132 of 323 bars were stuck on the last phase while merge, deploy or acceptance was still pending, "done" was used before production checks, phase names varied, and 177 bars had no issue or PR reference.
- **v1:** one five-cell phase bar, release text, copy button, optional link.
