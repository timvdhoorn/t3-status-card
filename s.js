// Task status card for T3 Code html_render frames.
// Usage: <script src=".../s.js"></script><script>S({y,t,i,p,d,s,w,k,x,v,l})</script>
// Language: English by default; load ".../s.js?lang=nl" for Dutch labels.
//   y type: feature | fix | infra | review | release (sets phase and delivery labels)
//   t task title, i issue/PR ref such as "#1353", v release version such as "1.131.2"
//   p work phase 1-4 (0 = no work track), d delivery step 1-n (0 = not started)
//   s state: a agent busy | u your turn | c waiting on CI/system | b blocked | d done
//   w what is awaited or blocking, shown under the title
//   k next step: c command (default) | q decision | 0 nothing; x its text
//   l optional [label, https-url]
//   g optional step overview, one char per playbook step:
//     k ok | r running | u your turn | b blocked | s skipped | - open
// Run card for multi-item runs: R({t,m,v,s,w,q,a,o,n,y,d,k,x,l})
//   t title, m meta line, v version, s/w state as in S
//   q items: [[ref, label, status, count]], status "" open | r running | u your turn | b blocked | ok accepted;
//     count is how many issues a grouped item such as "#1423–27" covers (default 1)
//   a acceptance criteria, o out of scope or stop points, n open points (string lists)
//   y with d: show the delivery track of that type at step d
//   k/x/l next step as in S
(() => {
  const LANG = {
    en: {
      types: {
        feature: [["Scope", "Plan", "Build", "Verify"], ["PR", "CI", "Merge", "Deploy", "Production", "Sign-off"]],
        fix: [["Diagnose", "Plan", "Fix", "Verify"], ["PR", "CI", "Merge", "Deploy", "Production", "Sign-off"]],
        infra: [["Measure", "Plan", "Execute", "Verify"], ["PR", "CI", "Merge"]],
        review: [["Scope", "Research", "Findings", "Report"], []],
        release: [[], ["Bundle", "Version", "CI", "Deploy", "Production", "Sign-off"]],
      },
      states: { a: "Working", u: "Your turn", c: "Waiting", b: "Blocked", d: "Done" },
      steps: { k: "ok", r: "running", u: "your turn", b: "blocked", s: "skipped", "-": "open" },
      work: "Work", delivery: "Delivery", notStarted: "not started", step: "Step",
      copy: "copy", copied: "copied ✓", selected: "selected, ⌘/Ctrl+C", decision: "Decision: ",
      lists: ["Acceptance", "Out of scope / stop points", "Still open"],
    },
    nl: {
      types: {
        feature: [["Scope", "Plan", "Bouwen", "Verifiëren"], ["PR", "CI", "Merge", "Deploy", "Productie", "Akkoord"]],
        fix: [["Diagnose", "Plan", "Fixen", "Verifiëren"], ["PR", "CI", "Merge", "Deploy", "Productie", "Akkoord"]],
        infra: [["Meten", "Plan", "Uitvoeren", "Verifiëren"], ["PR", "CI", "Merge"]],
        review: [["Afbakenen", "Onderzoek", "Bevindingen", "Rapport"], []],
        release: [[], ["Bundelen", "Versie", "CI", "Deploy", "Productie", "Akkoord"]],
      },
      states: { a: "Bezig", u: "Jouw beurt", c: "Wacht", b: "Geblokkeerd", d: "Afgerond" },
      steps: { k: "ok", r: "bezig", u: "jouw beurt", b: "geblokkeerd", s: "overgeslagen", "-": "open" },
      work: "Werk", delivery: "Levering", notStarted: "nog niet gestart", step: "Stap",
      copy: "kopieer", copied: "gekopieerd ✓", selected: "geselecteerd, ⌘/Ctrl+C", decision: "Beslissing: ",
      lists: ["Acceptatie", "Buiten scope / stoppunten", "Nog open"],
    },
  };
  const src = document.currentScript && document.currentScript.src;
  const lang = (src && new URL(src).searchParams.get("lang")) || "en";
  const T = LANG[lang] || LANG.en;
  const TYPES = T.types;
  const STATES = T.states;
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
.seg{display:flex;gap:3px;flex:none}.seg i{width:14px;height:4px;border-radius:2px;background:var(--border)}
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
.cols ul{margin:0;padding-left:16px}.cols li{margin:1px 0}
.steps{display:flex;gap:3px;flex-wrap:wrap;padding-left:17px}
.steps i{font:600 10px/16px var(--font-sans);font-style:normal;width:18px;text-align:center;border-radius:4px;background:var(--muted);color:var(--muted-foreground)}
.steps i.k{background:var(--success);color:#fff}.steps i.r{background:var(--primary);color:#fff}
.steps i.u{background:var(--warning);color:#000}.steps i.b{background:var(--destructive);color:#fff}
.steps i.s{text-decoration:line-through;opacity:.6}`;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  async function copy(text, node) {
    try {
      await navigator.clipboard.writeText(text);
      return T.copied;
    } catch {}
    const range = document.createRange();
    range.selectNodeContents(node);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    try {
      if (document.execCommand("copy")) return T.copied;
    } catch {}
    return T.selected;
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
    else text.append(label + ": " + T.notStarted);
    row.append(seg, text);
    return row;
  }

  function nextStep(d) {
    const k = d.k || "c";
    const next = el("div", "next");
    if (k === "c" && d.x) {
      const b = el("button");
      const code = el("code", null, d.x);
      const hint = el("span", null, T.copy);
      b.title = d.x;
      b.append(code, hint);
      b.onclick = async () => (hint.textContent = await copy(d.x, code));
      next.append(b);
    } else if (k === "q" && d.x) {
      next.append(el("span", "q", T.decision + d.x));
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
      card.append(progress(T.delivery, delivery, step, state));
    else if (work.length) card.append(progress(T.work, work, p, state));
    if (d.g) {
      const row = el("div", "steps");
      [...d.g].forEach((c, n) => {
        const i = el("i", c === "-" ? "" : c, String(n + 1));
        i.title = `${T.step} ${n + 1}: ${T.steps[c] || T.steps["-"]}`;
        row.append(i);
      });
      card.append(row);
    }
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
    const lists = [[T.lists[0], d.a], [T.lists[1], d.o], [T.lists[2], d.n]].filter((x) => x[1]?.length);
    if (lists.length) {
      const cols = el("div", "cols");
      for (const [title, xs] of lists) cols.append(list(title, xs));
      card.append(cols);
    }
    if (d.y && d.d) card.append(progress(T.delivery, (TYPES[d.y] || TYPES.feature)[1], d.d, state));
    const next = nextStep(d);
    if (next) card.append(next);
    mount(card);
  }

  const ready = (fn) => (d) =>
    document.body ? fn(d) : addEventListener("DOMContentLoaded", () => fn(d));
  window.S = ready(task);
  window.R = ready(run);
})();
