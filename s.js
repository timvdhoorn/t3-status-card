// Task status card for T3 Code html_render frames.
// Usage: <script src=".../s.js"></script><script>S({y,t,i,p,d,s,w,k,x,v,l})</script>
//   y type: feature | fix | infra | review | release (sets phase and delivery labels)
//   t task title, i issue/PR ref such as "#1353", v release version such as "1.131.2"
//   p work phase 1-4 (0 = no work track), d delivery step 1-n (0 = not started)
//   s state: a agent busy | u your turn | c waiting on CI/system | b blocked | d done
//   w what is awaited or blocking, shown next to the state
//   k next step: c command (default) | q decision | 0 nothing; x its text
//   l optional [label, https-url]
// Run card for multi-item runs: R({t,m,v,s,w,q,a,o,n,y,d,k,x,l})
//   t title, m meta line, v version, s/w state as in S
//   q items: [[ref, label, status]], status "" open | r running | u your turn | b blocked | ok accepted
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
  const STATES = { a: "bezig", u: "jouw beurt", c: "wacht op systeem", b: "geblokkeerd", d: "afgerond" };
  const CSS = `body{margin:0;font:13px/1.5 var(--font-sans);color:var(--foreground)}
.s{display:grid;gap:8px;padding:4px 0}
.r{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}
.t{font-weight:600}.m{color:var(--muted-foreground)}
.p{font-size:11px;padding:0 7px;border-radius:99px;background:var(--muted)}
.p.a{background:var(--accent-surface);color:var(--accent-surface-foreground)}
.p.u{background:var(--warning-surface);color:var(--warning-foreground)}
.p.b{background:var(--destructive-surface);color:var(--destructive-foreground)}
.p.d{background:var(--success);color:#fff}
.tr{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;width:100%;max-width:560px}
.st{display:grid;gap:3px;font-size:11px;color:var(--muted-foreground);min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st i{height:5px;border-radius:3px;background:var(--muted)}
.st.done{color:var(--foreground)}.st.done i{background:var(--primary);opacity:.5}
.st.cur{color:var(--foreground);font-weight:600}.st.cur i{background:var(--primary)}
.st.cur.b{color:var(--destructive-foreground)}.st.cur.b i{background:var(--destructive)}
.st.cur.u i{background:var(--warning)}
.lab{font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted-foreground);width:64px;flex:none}
button{all:unset;cursor:pointer;display:flex;gap:8px;align-items:center;max-width:100%;box-sizing:border-box;font:12px var(--font-mono);background:var(--code-background);color:var(--code-foreground);padding:4px 8px;border-radius:6px;border:1px solid var(--border)}
button:hover,button:focus-visible{border-color:var(--ring)}
button code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
button span{font:11px var(--font-sans);color:var(--muted-foreground);flex:none}
button.l{font-family:var(--font-sans)}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px}
.it{display:flex;gap:6px;align-items:center;font-size:12px;padding:3px 8px;border-radius:6px;background:var(--card);border:1px solid var(--border);min-width:0}
.it b{font-weight:600;font-variant-numeric:tabular-nums;flex:none}.it span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted-foreground)}
.dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--muted-foreground);opacity:.4}
.dot.ok{background:var(--success);opacity:1}.dot.r{background:var(--primary);opacity:1;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 30%,transparent)}
.dot.u{background:var(--warning);opacity:1}.dot.b{background:var(--destructive);opacity:1}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:4px 16px}
.cols ul{margin:0;padding-left:18px}.cols li{margin:1px 0}`;

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

  // A track row: steps before `at` are done; `at` is current unless the task is done.
  function track(label, steps, at, state) {
    const row = el("div", "r");
    const bar = el("div", "tr");
    steps.forEach((name, n) => {
      const step = n + 1;
      let cls = "st";
      if (step < at || (step === at && state === "d")) cls += " done";
      else if (step === at) cls += " cur " + state;
      const s = el("div", cls);
      s.append(el("i"), name);
      s.title = name;
      bar.append(s);
    });
    row.append(el("span", "lab", label), bar);
    return row;
  }

  function header(d, state, extra) {
    const head = el("div", "r");
    head.append(el("span", "t", d.t));
    for (const x of extra) if (x) head.append(el("span", "m", x));
    if (d.v) head.append(el("span", "p", "v" + d.v));
    head.append(el("span", "p " + state, STATES[state] + (d.w ? ": " + d.w : "")));
    return head;
  }

  function nextStep(d) {
    const k = d.k || "c";
    const next = el("div", "r");
    if (k === "c" && d.x) {
      const b = el("button");
      const code = el("code", null, d.x);
      const hint = el("span", null, "kopieer");
      b.title = d.x;
      b.append(code, hint);
      b.onclick = async () => (hint.textContent = await copy(d.x, code));
      next.append(b);
    } else {
      next.append(el("span", k === "q" ? "" : "m", k === "q" ? "Beslissing: " + d.x : "Niets meer te doen"));
    }
    if (d.l && /^https?:\/\//.test(d.l[1])) {
      const a = el("button", "l", d.l[0] + " ↗");
      a.onclick = () => openLink(d.l[1]);
      next.append(a);
    }
    return next;
  }

  function list(title, items) {
    const box = el("div");
    const ul = el("ul");
    for (const x of items) ul.append(el("li", null, x));
    box.append(el("div", "lab", title), ul);
    box.firstChild.style.width = "auto";
    return box;
  }

  function mount(root) {
    if (!document.getElementById("t3sc")) {
      const style = el("style", null, CSS);
      style.id = "t3sc";
      document.head.append(style);
    }
    document.body.append(root);
  }

  function task(d) {
    const [work, delivery] = TYPES[d.y] || TYPES.feature;
    const state = d.s || "a";
    const p = d.p || 0;
    const step = d.d || 0;
    const root = el("div", "s");
    root.append(header(d, state, [d.i]));
    // Once delivery has started the work track is done and only adds noise.
    if (work.length && !step) root.append(track("Werk", work, p, state));
    if (delivery.length && (step || p >= work.length)) root.append(track("Levering", delivery, step, state));
    root.append(nextStep(d));
    mount(root);
  }

  function run(d) {
    const state = d.s || "a";
    const items = d.q || [];
    const accepted = items.filter((q) => q[2] === "ok").length;
    const root = el("div", "s");
    root.append(header(d, state, [items.length ? `${accepted}/${items.length} geaccepteerd` : "", d.m]));
    if (items.length) {
      const grid = el("div", "g");
      for (const [ref, label, status] of items) {
        const it = el("div", "it");
        it.title = `${ref} ${label || ""}`.trim();
        it.append(el("i", "dot " + (status || "")), el("b", null, ref), el("span", null, label || ""));
        grid.append(it);
      }
      root.append(grid);
    }
    const lists = [["Acceptatie", d.a], ["Buiten scope / stoppunten", d.o], ["Nog open", d.n]].filter((x) => x[1]?.length);
    if (lists.length) {
      const cols = el("div", "cols");
      for (const [title, xs] of lists) cols.append(list(title, xs));
      root.append(cols);
    }
    if (d.y && d.d) root.append(track("Levering", (TYPES[d.y] || TYPES.feature)[1], d.d, state));
    root.append(nextStep(d));
    mount(root);
  }

  const ready = (fn) => (d) =>
    document.body ? fn(d) : addEventListener("DOMContentLoaded", () => fn(d));
  window.S = ready(task);
  window.R = ready(run);
})();
