// Task status card for T3 Code html_render frames.
// Usage: <script src=".../s.js"></script><script>S({y,t,i,p,d,s,w,k,x,v,l})</script>
//   y type: feature | fix | infra | review | release (sets phase and delivery labels)
//   t task title, i issue/PR ref such as "#1353", v release version such as "1.131.2"
//   p work phase 1-4 (0 = no work track), d delivery step 1-n (0 = not started)
//   s state: a agent busy | u your turn | c waiting on CI/system | b blocked | d done
//   w what is awaited or blocking, shown under the title
//   k next step: c command (default) | q decision | 0 nothing; x its text
//   l optional [label, https-url]
// Run card for multi-item runs: R({t,m,v,s,w,q,a,o,n,y,d,k,x,l})
//   t title, m meta line, v version, s/w state as in S
//   q items: [[ref, label, status, count]], status "" open | r running | u your turn | b blocked | ok accepted;
//     count is how many issues a grouped item such as "#1423–27" covers (default 1)
//   a acceptance criteria, o out of scope or stop points, n open points (string lists)
//   y with d: show the delivery track of that type at step d
//   k/x/l next step as in S
(() => {
  const TYPES = {
    feature: [["Scope", "Plan", "Bouwen", "Verifiëren"], ["PR", "CI", "Merge", "Deploy", "Productie", "Akkoord"]],
    fix: [["Diagnose", "Plan", "Fixen", "Verifiëren"], ["PR", "CI", "Merge", "Deploy", "Productie", "Akkoord"]],
    infra: [["Meten", "Plan", "Uitvoeren", "Verifiëren"], ["PR", "CI", "Merge"]],
    review: [["Afbakenen", "Onderzoek", "Bevindingen", "Rapport"], []],
    release: [[], ["Bundelen", "Versie", "CI", "Deploy", "Productie", "Akkoord"]],
  };
  const STATES = { a: "Bezig", u: "Jouw beurt", c: "Wacht", b: "Geblokkeerd", d: "Afgerond" };
  const CSS = `body{margin:0;font:14px/1.45 var(--font-sans);color:var(--foreground)}
.card{display:grid;gap:6px;padding:12px 16px;border:1px solid var(--border);border-radius:calc(var(--radius) * 1.6)}
.card+.card{margin-top:10px}
.row{display:flex;gap:8px;align-items:center;min-width:0}
.wrap{flex-wrap:wrap}
.dot{width:9px;height:9px;border-radius:50%;flex:none;background:var(--muted-foreground)}
.dot.a{background:var(--primary)}.dot.u{background:var(--warning)}.dot.b{background:var(--destructive)}.dot.d{background:var(--success)}
.title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.state{flex:none;white-space:nowrap}.state::before{content:"· ";color:var(--muted-foreground)}
.state.a{color:var(--primary)}.state.u{color:var(--warning-foreground)}.state.c{color:var(--muted-foreground)}
.state.b{color:var(--destructive-foreground)}.state.d{color:var(--success-foreground)}
.side{margin-left:auto;flex:none;color:var(--muted-foreground);font-size:13px;font-variant-numeric:tabular-nums}
.sub{color:var(--muted-foreground);font-size:13px;padding-left:17px}
.prog{display:flex;gap:8px;align-items:center;padding-left:17px;font-size:13px;color:var(--muted-foreground);min-width:0}
.seg{display:flex;gap:3px;flex:none}.seg i{width:14px;height:4px;border-radius:2px;background:var(--muted)}
.seg i.done{background:var(--primary);opacity:.45}.seg i.cur{background:var(--primary)}
.seg i.cur.u{background:var(--warning)}.seg i.cur.b{background:var(--destructive)}
.prog b{color:var(--foreground);font-weight:600}
.next{display:flex;gap:6px;flex-wrap:wrap;padding-left:17px;margin-top:2px;min-width:0}
button{all:unset;cursor:pointer;display:flex;gap:8px;align-items:center;max-width:100%;min-width:0;box-sizing:border-box;font:12px var(--font-mono);background:var(--code-background);color:var(--code-foreground);padding:4px 8px;border-radius:6px;border:1px solid var(--border)}
button:hover,button:focus-visible{border-color:var(--ring)}
button code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
button span{font:11px var(--font-sans);color:var(--muted-foreground);flex:none}
button.l{font-family:var(--font-sans)}
.q{font-size:13px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:4px;padding-left:17px}
.it{display:flex;gap:6px;align-items:center;font-size:12px;padding:3px 8px;border-radius:6px;background:var(--muted);min-width:0}
.it b{font-weight:600;font-variant-numeric:tabular-nums;flex:none}.it span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted-foreground)}
.it .dot{width:7px;height:7px;opacity:.5}.it .dot.ok{background:var(--success);opacity:1}.it .dot.r{background:var(--primary);opacity:1}
.it .dot.u{opacity:1}.it .dot.b{opacity:1}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2px 16px;padding-left:17px;font-size:13px}
.lab{font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted-foreground)}
.cols ul{margin:0;padding-left:16px}.cols li{margin:1px 0}`;

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

  // Title row: status dot, title, coloured state word, refs on the right.
  function header(d, state, side) {
    const row = el("div", "row");
    row.append(el("i", "dot " + state), el("span", "title", d.t), el("span", "state " + state, STATES[state]));
    const refs = side.filter(Boolean).join(" · ");
    if (refs) row.append(el("span", "side", refs));
    return row;
  }

  // Compact progress line: mini segments plus "Track: Step (n/total)".
  function progress(label, steps, at, state) {
    const row = el("div", "prog");
    const seg = el("span", "seg");
    steps.forEach((_, n) => {
      const step = n + 1;
      let cls = "";
      if (step < at || (step === at && state === "d")) cls = "done";
      else if (step === at) cls = "cur " + state;
      seg.append(el("i", cls));
    });
    const text = el("span");
    if (at > 0) text.append(label + ": ", el("b", null, steps[at - 1]), ` (${at}/${steps.length})`);
    else text.append(label + ": nog niet gestart");
    row.append(seg, text);
    return row;
  }

  function nextStep(d) {
    const k = d.k || "c";
    const next = el("div", "next");
    if (k === "c" && d.x) {
      const b = el("button");
      const code = el("code", null, d.x);
      const hint = el("span", null, "kopieer");
      b.title = d.x;
      b.append(code, hint);
      b.onclick = async () => (hint.textContent = await copy(d.x, code));
      next.append(b);
    } else if (k === "q" && d.x) {
      next.append(el("span", "q", "Beslissing: " + d.x));
    }
    if (d.l && /^https?:\/\//.test(d.l[1])) {
      const a = el("button", "l", d.l[0] + " ↗");
      a.onclick = () => openLink(d.l[1]);
      next.append(a);
    }
    return next.childElementCount ? next : null;
  }

  function list(title, items) {
    const box = el("div");
    const ul = el("ul");
    for (const x of items) ul.append(el("li", null, x));
    box.append(el("div", "lab", title), ul);
    return box;
  }

  function mount(card) {
    if (!document.getElementById("t3sc")) {
      const style = el("style", null, CSS);
      style.id = "t3sc";
      document.head.append(style);
    }
    document.body.append(card);
  }

  function task(d) {
    const [work, delivery] = TYPES[d.y] || TYPES.feature;
    const state = d.s || "a";
    const p = d.p || 0;
    const step = d.d || 0;
    const card = el("div", "card");
    card.append(header(d, state, [d.i, d.v && "v" + d.v]));
    if (d.w) card.append(el("div", "sub", d.w));
    // Delivery replaces the work line once it has started.
    if (delivery.length && (step || !work.length))
      card.append(progress("Levering", delivery, step, state));
    else if (work.length) card.append(progress("Werk", work, p, state));
    const next = nextStep(d);
    if (next) card.append(next);
    mount(card);
  }

  function run(d) {
    const state = d.s || "a";
    const items = d.q || [];
    const size = (q) => q[3] || 1;
    const total = items.reduce((sum, q) => sum + size(q), 0);
    const accepted = items.reduce((sum, q) => sum + (q[2] === "ok" ? size(q) : 0), 0);
    const card = el("div", "card");
    card.append(header(d, state, [items.length && `${accepted}/${total}`, d.v && "v" + d.v]));
    const sub = [d.w, d.m].filter(Boolean).join(" · ");
    if (sub) card.append(el("div", "sub", sub));
    if (items.length) {
      const grid = el("div", "g");
      for (const [ref, label, status] of items) {
        const it = el("div", "it");
        it.title = `${ref} ${label || ""}`.trim();
        it.append(el("i", "dot " + (status || "")), el("b", null, ref), el("span", null, label || ""));
        grid.append(it);
      }
      card.append(grid);
    }
    const lists = [["Acceptatie", d.a], ["Buiten scope / stoppunten", d.o], ["Nog open", d.n]].filter((x) => x[1]?.length);
    if (lists.length) {
      const cols = el("div", "cols");
      for (const [title, xs] of lists) cols.append(list(title, xs));
      card.append(cols);
    }
    if (d.y && d.d) card.append(progress("Levering", (TYPES[d.y] || TYPES.feature)[1], d.d, state));
    const next = nextStep(d);
    if (next) card.append(next);
    mount(card);
  }

  const ready = (fn) => (d) =>
    document.body ? fn(d) : addEventListener("DOMContentLoaded", () => fn(d));
  window.S = ready(task);
  window.R = ready(run);
})();
