// Task status card for T3 Code html_render frames.
// Usage: <script src=".../s.js"></script><script>S({t,r,p,n,s,k,x,l})</script>
//   t task, r release state, p phase 1-5, n phase name,
//   s state: a(ctive) | b(locked) | w(aiting) | d(one), default a
//   k kind of next step: c(ommand) | q (decision) | 0 (nothing), default c
//   x next command or decision, l optional [label, https-url]
(() => {
  const CSS = `body{margin:0;font:13px/1.5 var(--font-sans);color:var(--foreground)}
.s{display:grid;gap:8px;padding:10px 0 4px;border-top:1px solid var(--border)}
.r{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}
.t{font-weight:600}.m{color:var(--muted-foreground)}
.p{font-size:11px;padding:0 7px;border-radius:99px;background:var(--muted)}
.p.b{background:var(--destructive-surface);color:var(--destructive-foreground)}
.p.w{background:var(--warning-surface);color:var(--warning-foreground)}
.p.d{background:var(--success);color:#fff}
.bar{display:flex;gap:3px}.bar i{width:20px;height:6px;border-radius:3px;background:var(--muted)}.bar i.on{background:var(--primary)}
button{all:unset;cursor:pointer;display:flex;gap:8px;align-items:center;max-width:100%;box-sizing:border-box;font:12px var(--font-mono);background:var(--code-background);color:var(--code-foreground);padding:4px 8px;border-radius:6px;border:1px solid var(--border)}
button:hover,button:focus-visible{border-color:var(--ring)}
button code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
button span{font:11px var(--font-sans);color:var(--muted-foreground);flex:none}
button.l{font-family:var(--font-sans)}`;
  const STATES = { a: "bezig", b: "geblokkeerd", w: "wacht op jou", d: "afgerond" };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  async function copy(text, node) {
    try {
      await navigator.clipboard.writeText(text);
      return "gekopieerd ✓";
    } catch {}
    const range = document.createRange();
    range.selectNodeContents(node);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    try {
      if (document.execCommand("copy")) return "gekopieerd ✓";
    } catch {}
    return "geselecteerd, ⌘/Ctrl+C";
  }

  function openLink(url) {
    parent.postMessage({ jsonrpc: "2.0", id: Date.now(), method: "ui/open-link", params: { url } }, "*");
  }

  function render(d) {
    const s = d.s || "a";
    const k = d.k || "c";
    document.head.append(el("style", null, CSS));
    const root = el("div", "s");

    const head = el("div", "r");
    head.append(el("span", "t", d.t), el("span", "m", d.r), el("span", "p " + s, STATES[s]));

    const phase = el("div", "r");
    const bar = el("span", "bar");
    for (let i = 1; i <= 5; i++) bar.append(el("i", i <= d.p ? "on" : ""));
    phase.append(bar, el("span", "m", `${d.n} · fase ${d.p}/5`));

    const next = el("div", "r");
    if (k === "c") {
      const b = el("button");
      const code = el("code", null, d.x);
      const hint = el("span", null, "kopieer");
      b.title = d.x;
      b.append(code, hint);
      b.onclick = async () => (hint.textContent = await copy(d.x, code));
      next.append(b);
    } else {
      next.append(el("span", k === "0" ? "m" : "", k === "0" ? "Niets meer te doen" : "Beslissing: " + d.x));
    }
    if (d.l && /^https?:\/\//.test(d.l[1])) {
      const a = el("button", "l", d.l[0] + " ↗");
      a.onclick = () => openLink(d.l[1]);
      next.append(a);
    }

    root.append(head, phase, next);
    document.body.append(root);
  }

  window.S = (d) =>
    document.body ? render(d) : addEventListener("DOMContentLoaded", () => render(d));
})();
