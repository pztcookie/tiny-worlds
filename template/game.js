/* A tiny world.
 *
 * Everything above the ENGINE line is the game and is meant to be replaced.
 * Everything below it is scaffolding that every game in this repo needs:
 * traces, the shy idle hints, the reveal, and the take-home card.
 */

const CONFIG = {
  slug: "template",
  title: "A Tiny World",
  quest: "make the room feel like it knows you",
};

/* ============================== WORLD ==============================
 * Replace this whole section. It is a demonstration of each slot of the
 * framework at the smallest size that still works.
 */

const THINGS = {
  lamp: { name: "the lamp", wakes: "the lamp remembers being on" },
  jar: { name: "the jar", wakes: "something in the jar shifts, politely" },
  plant: { name: "the plant", wakes: "the plant leans, then pretends it didn't" },
  rug: { name: "the rug", wakes: "the rug is warmer on one side now" },
  window: { name: "the window", wakes: "the window shows a season it isn't" },
};

const life = {}; // how awake each thing is, 0 → 1

/** PLAY — one action, one visible consequence. */
function touch(id, { fromMischief = false } = {}) {
  const el = document.querySelector(`[data-thing="${id}"]`);
  if (!el) return;

  // PERSONALITY — the world does not simply obey.
  if (!fromMischief) {
    const mischief = misbehave(id);
    if (mischief) return mischief();
  }

  life[id] = Math.min(1, (life[id] ?? 0) + 0.34);
  el.style.setProperty("--life", life[id].toFixed(2));
  el.classList.remove("stirred");
  void el.offsetWidth;
  el.classList.add("stirred");

  if (life[id] <= 0.34) whisper(THINGS[id].wakes);

  Trace.touched(id);
  checkSecret(id);
  warmTheRoom();
}

/** PERSONALITY — three ways the room has opinions. Returns an action, or null. */
function misbehave(id) {
  const roll = Math.random();

  // It hesitates, and answers a beat later.
  if (roll < 0.1) {
    return () => {
      whisper("…");
      setTimeout(() => touch(id, { fromMischief: true }), 620);
    };
  }

  // It wakes a neighbour instead, as if it misheard.
  if (roll < 0.2 && Trace.state.touches > 3) {
    const other = Object.keys(THINGS).filter((k) => k !== id);
    const pick = other[Math.floor(Math.random() * other.length)];
    return () => {
      whisper(`you reached for ${THINGS[id].name}. ${THINGS[pick].name} answered.`);
      touch(pick, { fromMischief: true });
    };
  }

  // It drifts, so the room is never quite the same room.
  if (roll < 0.27 && Trace.state.touches > 6) {
    return () => {
      const el = document.querySelector(`[data-thing="${id}"]`);
      el.style.setProperty("--x", `${18 + Math.random() * 64}%`);
      el.style.setProperty("--y", `${26 + Math.random() * 52}%`);
      whisper(`${THINGS[id].name} would rather be over here`);
      touch(id, { fromMischief: true });
    };
  }

  return null;
}

/** MYSTERY — one secret: wake everything, then go back to where you started. */
function checkSecret(id) {
  const allAwake = Object.keys(THINGS).every((k) => (life[k] ?? 0) > 0);
  if (!allAwake || Trace.state.secretFound || id !== Trace.state.firstTouched) return;

  Trace.state.secretFound = true;
  Trace.save();
  document.querySelector(`[data-thing="${id}"]`).classList.add("blooming");
  whisper("oh — you came back to the first one");
  Hints.retire("secret");
}

/** TRANSFORMATION — the room at the end is not the room at the start. */
function warmTheRoom() {
  const warmth = Math.min(1, Trace.state.touches / 22);
  document.documentElement.style.setProperty("--warmth", warmth.toFixed(3));
  if (Trace.state.touches >= 8) document.getElementById("finish").hidden = false;
}

/** REFLECTION — name what the player did, never what they are. */
function reflect() {
  const s = Trace.state;
  const traits = [];

  if (s.longestRepeat >= 4) traits.push(["Repeater", "you asked the same thing four times, patiently"]);
  if (s.distinct >= 5) traits.push(["Completionist", "you did not leave until everything was awake"]);
  if (s.distinct <= 2 && s.touches > 8) traits.push(["Loyalist", "you found one thing you liked and stayed"]);
  if (s.medianGap > 2600) traits.push(["Slow Looker", "you left long pauses between choices"]);
  if (s.medianGap < 700) traits.push(["Quick Hand", "you moved before the room finished answering"]);
  if (s.secretFound) traits.push(["Returner", "you went back to where you started"]);
  if (!traits.length) traits.push(["Visitor", "you touched a few things and let the rest be"]);

  const rooms = {
    Repeater: "a light switch worn smooth in one spot",
    Completionist: "a room where every lamp is on and nobody is home",
    Loyalist: "one chair, pulled close to one window",
    "Slow Looker": "a long hallway with a bench halfway down",
    "Quick Hand": "a kitchen with three drawers left open",
    Returner: "a door you opened twice to check it was the same door",
    Visitor: "a room with the coat still on",
  };

  const top = traits.slice(0, 3);
  return { traits: top, room: rooms[top[0][0]] };
}

/* ============================== ENGINE ==============================
 * Below here is reusable. Adjust the copy, keep the shape.
 */

const KEY = (k) => `tiny-worlds:${CONFIG.slug}:${k}`;

/** TRACE — a handful of behavioural state. Resist adding a sixth. */
const Trace = {
  state: {
    touches: 0,
    distinct: 0,
    longestRepeat: 0,
    medianGap: 0,
    secretFound: false,
    firstTouched: null,
  },
  _seen: new Set(),
  _gaps: [],
  _last: 0,
  _run: { id: null, n: 0 },

  touched(id) {
    const now = performance.now();
    if (this._last) this._gaps.push(now - this._last);
    this._last = now;

    this.state.touches += 1;
    this.state.firstTouched ??= id;
    this._seen.add(id);
    this.state.distinct = this._seen.size;

    this._run = id === this._run.id ? { id, n: this._run.n + 1 } : { id, n: 1 };
    this.state.longestRepeat = Math.max(this.state.longestRepeat, this._run.n);

    const sorted = [...this._gaps].sort((a, b) => a - b);
    this.state.medianGap = Math.round(sorted[sorted.length >> 1] ?? 0);

    Hints.wake();
    this.save();
  },

  save() {
    try {
      localStorage.setItem(KEY("trace"), JSON.stringify(this.state));
    } catch {
      /* private browsing — the world simply forgets */
    }
  },
};

/** The world speaking. Not a tooltip: it fades, and it does not wait to be dismissed. */
let whisperTimer;
function whisper(text) {
  const el = document.getElementById("whisper");
  el.textContent = text;
  el.classList.add("showing");
  clearTimeout(whisperTimer);
  whisperTimer = setTimeout(() => el.classList.remove("showing"), 2600);
}

/**
 * HINTS — the world nudges only when the player goes quiet, escalates only if ignored,
 * retires each hint for good once the thing is done, and is shy: move toward one and it
 * darts away. Some of them lose their nerve on their own.
 */
const Hints = {
  idleMs: 6500,
  _timer: null,
  _retired: new Set(),
  _level: {},

  ladder: ["…", "something here is awake", "touch it. nothing bad happens."],

  /** Each candidate: what to point at, and whether it is still worth pointing at. */
  candidates() {
    const untouched = Object.keys(THINGS).filter((k) => !(life[k] > 0));
    const out = untouched.map((k) => ({ id: k, target: `[data-thing="${k}"]` }));
    if (!untouched.length && !Trace.state.secretFound) {
      out.push({
        id: "secret",
        target: `[data-thing="${Trace.state.firstTouched}"]`,
        lines: ["…", "this one was first", "the room likes being asked twice"],
      });
    }
    return out.filter((c) => !this._retired.has(c.id));
  },

  wake() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.offer(), this.idleMs);
  },

  offer() {
    const pool = this.candidates();
    if (!pool.length) return;

    const pick = pool[Math.floor(Math.random() * pool.length)];
    const anchor = document.querySelector(pick.target);
    if (!anchor) return this.wake();

    const level = (this._level[pick.id] = Math.min(2, (this._level[pick.id] ?? -1) + 1));
    const lines = pick.lines ?? this.ladder;

    const world = document.getElementById("world");
    const box = anchor.getBoundingClientRect();
    const frame = world.getBoundingClientRect();

    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = lines[level];
    hint.style.left = `${box.left - frame.left + box.width / 2}px`;
    hint.style.top = `${box.top - frame.top}px`;
    world.appendChild(hint);

    // A quarter of them think better of it.
    const cowardly = Math.random() < 0.25;
    const life_ms = cowardly ? 520 : 3400;

    const spook = (e) => {
      const d = Math.hypot(e.clientX - box.left - box.width / 2, e.clientY - box.top);
      if (d < 110) hint.classList.add("spooked");
    };
    window.addEventListener("mousemove", spook);

    setTimeout(() => {
      hint.classList.add("spooked");
      window.removeEventListener("mousemove", spook);
      setTimeout(() => hint.remove(), 400);
    }, life_ms);

    this.wake();
  },

  retire(id) {
    this._retired.add(id);
  },
};

/** TAKE HOME — a card drawn from the actual final state, not a template image. */
function drawCard() {
  const canvas = document.getElementById("card");
  const g = canvas.getContext("2d");
  const { width: W, height: H } = canvas;
  const { traits, room } = reflect();
  const warmth = Math.min(1, Trace.state.touches / 22);

  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, `rgb(${20 + warmth * 40}, ${18 + warmth * 26}, ${27 + warmth * 30})`);
  sky.addColorStop(1, "rgb(14, 12, 20)");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);

  // The room as you left it: every thing at the size you woke it to.
  document.querySelectorAll(".thing").forEach((el) => {
    const id = el.dataset.thing;
    const x = (parseFloat(el.style.getPropertyValue("--x")) / 100) * W;
    const y = (parseFloat(el.style.getPropertyValue("--y")) / 100) * (H * 0.55) + H * 0.06;
    const r = 12 + (life[id] ?? 0) * 26;
    const halo = g.createRadialGradient(x, y, 0, x, y, r * 2.6);
    halo.addColorStop(0, `rgba(255, 217, 138, ${0.16 + (life[id] ?? 0) * 0.5})`);
    halo.addColorStop(1, "rgba(255, 217, 138, 0)");
    g.fillStyle = halo;
    g.beginPath();
    g.arc(x, y, r * 2.6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = Trace.state.secretFound && id === Trace.state.firstTouched ? "#d9c2ff" : "#ffe9bd";
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });

  g.textAlign = "center";
  g.fillStyle = "#f3ece2";
  g.font = "500 26px ui-monospace, Menlo, monospace";
  g.fillText(CONFIG.title, W / 2, H * 0.63);

  g.font = "15px ui-monospace, Menlo, monospace";
  traits.forEach(([name, line], i) => {
    g.fillStyle = "#ffd98a";
    g.fillText(name, W / 2, H * 0.7 + i * 46);
    g.fillStyle = "#9c9384";
    g.fillText(line, W / 2, H * 0.7 + i * 46 + 20);
  });

  g.fillStyle = "#f3ece2";
  g.font = "italic 15px ui-monospace, Menlo, monospace";
  wrap(g, `your room looks like ${room}`, W / 2, H * 0.9, W - 80, 22);

  g.fillStyle = "#5d5648";
  g.font = "12px ui-monospace, Menlo, monospace";
  g.fillText(new Date().toLocaleDateString(), W / 2, H - 28);

  return { traits, room };
}

function wrap(g, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let row = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxWidth && line) {
      g.fillText(line, x, y + row++ * lineHeight);
      line = word;
    } else {
      line = test;
    }
  }
  g.fillText(line, x, y + row * lineHeight);
}

function finish() {
  const { traits, room } = drawCard();
  document.getElementById("reveal-title").textContent = traits[0][0];
  document.getElementById("reveal-body").textContent = `${traits[0][1]} — so your room looks like ${room}.`;
  document.getElementById("world").hidden = true;
  document.getElementById("reveal").hidden = false;
  clearTimeout(Hints._timer);
  try {
    localStorage.setItem(KEY("card"), document.getElementById("card").toDataURL("image/png"));
  } catch {
    /* the card is still on screen; only the memory of it is lost */
  }
}

/* ---------- wiring ---------- */

document.getElementById("quest").textContent = CONFIG.quest;
document.title = CONFIG.title;

document.getElementById("stage").addEventListener("click", (e) => {
  const el = e.target.closest(".thing");
  if (el) touch(el.dataset.thing);
});

document.getElementById("finish").addEventListener("click", finish);

document.getElementById("again").addEventListener("click", () => {
  document.getElementById("reveal").hidden = true;
  document.getElementById("world").hidden = false;
  Hints.wake();
});

document.getElementById("download").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = `${CONFIG.slug}.png`;
  a.href = document.getElementById("card").toDataURL("image/png");
  a.click();
});

Hints.wake();
