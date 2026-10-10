# t3-status-card

Task status card for T3 Code `html_render` frames. Loaded from jsDelivr so each render only sends data.

```html
<script src="https://cdn.jsdelivr.net/gh/timvdhoorn/t3-status-card@v2/s.js"></script>
<script>S({y:"fix",t:"Task",i:"#12",p:3,x:"bun test"})</script>
```

See the header of `s.js` for fields.

## Where it is used

`~/.agents/AGENTS.md`, section "Final task status", tells agents in T3 Code to render this card instead of the three text status lines.

## Releasing a change

Edit `s.js`, commit, push, tag the next version (`v3`) and update the `@v2` reference in `AGENTS.md`. Don't move an existing tag: jsDelivr caches tagged versions for a long time. To preview before tagging, load `@<commit-sha>` in `html_preview`.

## Constraints

- The `html_render` frame is sandboxed (`allow-scripts allow-forms`). The only host bridge is `ui/open-link` for http(s) URLs, so there is no way to start a thread or send a prompt from the card.
- Copy uses `navigator.clipboard`, falls back to `execCommand("copy")`, and finally selects the text.
- Token cost per card is about 100 output tokens plus about 130 for the tool result, against about 50 for the text lines.

## History

- **v1:** one five-cell phase bar, release text, copy button, optional link.
- **v2:** separate work and delivery tracks with fixed labels per task type (feature, fix, infra, review, release), and states for agent busy, your turn, waiting on system, blocked and done. Based on 164 LMManagementSystem sessions: 132 of 323 bars were stuck on phase 5 "Opleveren" while merge, deploy or acceptance was still pending, "afgerond" was used before production checks, phase names varied, and 177 bars had no issue or PR reference.
