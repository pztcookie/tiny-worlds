/* Maskutchi Bag Charm.
 *
 * Everything above the ENGINE line is this world. Below it is the scaffolding every game
 * in this repo shares: traces, the shy idle hints, the reveal, the take-home card.
 *
 * The art is a set of static PNGs in assets/, cut from fifteen supplied layer exports by
 * scripts/slice_assets.py. Nothing is fetched from the network and there is no API key.
 * The pouch is drawn with a transparent interior, so the miniatures render underneath it
 * and show through the vinyl, and assets/pouch-inside.json is the same interior as a
 * bitmask — the pouch hangs at an angle, so no rectangle would do.
 */

const CONFIG = {
  slug: "maskutchi-bag-charm",
  title: "Maskutchi Bag Charm",
  quest: "fit your world in here before you get there",
};

/* ============================== WORLD ============================== */

/** Game space. The canvas is drawn at this size and scaled to whatever the frame is. */
const W = 900;
const H = 600;

/** The strap runs across the sky and everything hangs off it. */
const STRAP = { x0: -30, y0: 152, x1: 930, y1: 18, band: 30 };
const strapY = (x) => STRAP.y0 + ((x - STRAP.x0) * (STRAP.y1 - STRAP.y0)) / (STRAP.x1 - STRAP.x0);

/** The pouch, and where its keyring sits inside its own artwork. */
const POUCH = { x: 515, y: 40, w: 340, h: 475, sway: 0 };
const RING = { dx: 85, dy: 28 };

const BUNNY_HOME = { x: 170, y: 85 };

/** How long the world gives you, and how often it decides things. No numbers on screen:
 *  the charm you pick is the only thing that says it, and the strap's shadow is the clock. */
const PACE = {
  moon: { ms: 180000, beat: 1500, mischief: 0.72 },
  star: { ms: 105000, beat: 1150, mischief: 1 },
  spark: { ms: 60000, beat: 850, mischief: 1.4 },
};

/** Three families, because colour is the most legible thing in this art and a family
 *  needs no legend. The bunny is a family of one, which is the whole secret. */
const KINDS = {
  soda: { art: "item-soda", family: "grape", w: 54 },
  "grape-candy": { art: "item-grape-candy", family: "grape", w: 56 },
  tart: { art: "item-tart", family: "grape", w: 50 },
  parfait: { art: "item-parfait", family: "grape", w: 46 },
  candy: { art: "item-candy", family: "milk", w: 46 },
  yakult: { art: "item-yakult", family: "milk", w: 34 },
  pudding: { art: "item-pudding", family: "milk", w: 48 },
  star: { art: "item-star", family: "milk", w: 30 },
  cookie: { art: "item-cookie", family: "cream", w: 62 },
  peanut: { art: "item-peanut", family: "cream", w: 46 },
  choco: { art: "item-choco", family: "cream", w: 74 },
  blindbag: { art: "item-blindbag", family: "cream", w: 66 },
  bunny: { art: "bunny", family: "lilac", w: 62 },
};

/** Where the twelve land when the bag is tipped out. Placed by hand rather than
 *  scattered, so nothing lands on the tag, the charms or another miniature. */
const SPILL = [
  ["choco", 112, 322, -0.14],
  ["cookie", 262, 316, 0.1],
  ["soda", 392, 330, -0.06],
  ["blindbag", 92, 412, 0.18],
  ["parfait", 212, 420, -0.09],
  ["tart", 320, 424, 0.13],
  ["candy", 432, 410, -0.2],
  ["peanut", 108, 508, 0.07],
  ["grape-candy", 246, 512, -0.16],
  ["pudding", 366, 516, 0.2],
  ["yakult", 60, 574, -0.1],
  ["star", 450, 540, 0.24],
];

/* ---------- the art ---------- */

const ART = {
  images: {},
  missing: new Set(),

  keys() {
    return ["pouch", "donut", ...new Set(Object.values(KINDS).map((k) => k.art))];
  },

  load() {
    return Promise.all(
      this.keys().map(
        (key) =>
          new Promise((done) => {
            const img = new Image();
            img.onload = () => {
              this.images[key] = img;
              done();
            };
            img.onerror = () => {
              this.missing.add(key);
              done();
            };
            img.src = `assets/${key}.png`;
          }),
      ),
    );
  },

  get(key) {
    return this.images[key];
  },
};

/** The pouch's interior, as a bitmask in the pouch sprite's own space. A rectangle would
 *  not do: the pouch is drawn at an angle. If the file is missing the world still works,
 *  on a rectangle inset far enough to stay inside the outline at the corners. */
const Inside = {
  w: 64,
  h: 96,
  rows: null,
  zip: null, // the two ends of the top edge, in fractions of the sprite

  async load() {
    try {
      const res = await fetch("assets/pouch-inside.json");
      const data = await res.json();
      this.w = data.w;
      this.h = data.h;
      this.rows = data.rows;
      this.findZip();
    } catch {
      /* no mask — the pouch becomes a plain box, and nothing else changes */
    }
  },

  /** The mouth, found rather than measured: the interior is a rectangle at an angle, so
   *  its topmost cell and its leftmost cell are two of its corners, and the edge between
   *  them is where the zip runs. */
  findZip() {
    let top = null;
    let left = null;
    let right = null;
    for (let j = 0; j < this.h; j += 1) {
      for (let i = 0; i < this.w; i += 1) {
        if (this.rows[j][i] !== "1") continue;
        if (!top) top = { i, j };
        if (!left || i < left.i) left = { i, j };
        if (!right || i > right.i) right = { i, j };
      }
    }
    if (!top) return;
    const near = left.j - top.j <= right.j - top.j ? left : right;
    this.zip = [
      { x: (top.i + 0.5) / this.w, y: (top.j + 0.5) / this.h },
      { x: (near.i + 0.5) / this.w, y: (near.j + 0.5) / this.h },
    ];
  },

  /** Is this point in the world inside the vinyl? */
  holds(x, y) {
    const fx = (x - POUCH.x - POUCH.sway) / POUCH.w;
    const fy = (y - POUCH.y) / POUCH.h;
    if (fx < 0 || fx >= 1 || fy < 0 || fy >= 1) return false;
    if (!this.rows) return fx > 0.14 && fx < 0.86 && fy > 0.2 && fy < 0.94;
    return this.rows[(fy * this.h) | 0][(fx * this.w) | 0] === "1";
  },

  /** Fractions of the sprite to somewhere in the world. */
  at(fx, fy) {
    return { x: POUCH.x + POUCH.sway + fx * POUCH.w, y: POUCH.y + fy * POUCH.h };
  },

  centre() {
    return this.at(0.5, 0.55);
  },
};

/* ---------- the things in it ---------- */

let items = [];
let seq = 0;

function makeItem(kind, x, y, rot, extra = {}) {
  const K = KINDS[kind];
  const img = ART.get(K.art);
  return {
    id: (seq += 1),
    kind,
    family: K.family,
    x,
    y,
    w: K.w,
    h: img ? (K.w * img.height) / img.width : K.w,
    rot,
    inside: false,
    fade: 0,
    faded: false,
    copy: false,
    ...extra,
  };
}

function spill() {
  items = SPILL.map(([kind, x, y, rot]) => makeItem(kind, x, y, rot));
  items.push(makeItem("bunny", BUNNY_HOME.x, BUNNY_HOME.y, 0));
}

const bunny = () => items.find((it) => it.kind === "bunny");
const packed = () => items.filter((it) => it.inside);

/* ---------- the weather ---------- */

/** The hand drives everything. tempo is how fast it is moving now; warm is how long it
 *  has been slow, which is what turns the sky cream. */
const weather = {
  tempo: 0,
  target: 0,
  warm: 0,
  moved: 0,
  sum: 0,
  ms: 0,
  last: null,
  written: 0,
};

function handAt(x, y, now) {
  if (weather.last) {
    const dt = Math.max(16, now - weather.last.t);
    const speed = (Math.hypot(x - weather.last.x, y - weather.last.y) / dt) * 1000;
    weather.target = Math.min(1, speed / 1100);
    weather.moved = now;
  }
  weather.last = { x, y, t: now };
}

function blow(dt, now) {
  if (now - weather.moved > 260) weather.target *= 0.9;
  weather.tempo += (weather.target - weather.tempo) * 0.07;
  weather.warm += weather.tempo < 0.22 ? dt / 9000 : -dt / 2600;
  weather.warm = Math.max(0, Math.min(1, weather.warm));

  if (game.pace && !game.over) {
    weather.sum += weather.tempo * dt;
    weather.ms += dt;
  }

  // Written to CSS a few times a second rather than every frame: the sky is a gradient
  // and a couple of animation durations, and none of it needs 60 changes a second.
  if (now - weather.written > 140) {
    weather.written = now;
    const root = document.documentElement.style;
    root.setProperty("--tempo", weather.tempo.toFixed(3));
    root.setProperty("--warm", weather.warm.toFixed(3));
  }
}

/* ---------- the clock, which is a shadow ---------- */

const game = { pace: null, started: 0, ends: 0, zipped: 0, over: false };

const progress = () => (game.pace ? Math.min(1, (clock - game.started) / (game.ends - game.started)) : 0);

function begin(name) {
  if (game.pace) return;
  game.pace = PACE[name];
  game.started = clock;
  game.ends = clock + game.pace.ms;

  document.querySelectorAll(".charm").forEach((el) => {
    el.classList.add(el.dataset.pace === name ? "chosen" : "spent");
    if (el.dataset.pace !== name) el.disabled = true;
  });
  document.getElementById("charms").classList.remove("flare");
  Hints.wake();
}

/* ---------- PLAY — take one, drop it in, take it back out ---------- */

let held = null;
let grab = { x: 0, y: 0 };

function hit(it, x, y) {
  return Math.abs(x - it.x) <= it.w / 2 + 4 && Math.abs(y - it.y) <= it.h / 2 + 4;
}

/** Whatever is on top, which is the reverse of the order things are drawn in. */
function pick(x, y) {
  const out = items.filter((it) => !it.inside);
  const inn = items.filter((it) => it.inside);
  for (let i = out.length - 1; i >= 0; i -= 1) if (hit(out[i], x, y)) return out[i];
  for (let i = inn.length - 1; i >= 0; i -= 1) if (hit(inn[i], x, y)) return inn[i];
  return null;
}

function toFront(it) {
  items = items.filter((other) => other !== it);
  items.push(it);
}

function takeUp(it) {
  held = it;
  it.held = true;
  it.came = it.inside;
  toFront(it);
}

function putDown() {
  if (!held) return;
  const it = held;
  held = null;
  it.held = false;

  it.inside = Inside.holds(it.x, it.y);
  if (it.came && !it.inside) Trace.pulledOut(it);
  if (!it.came && it.inside) Trace.putIn(it);

  // Anything in the pouch settles rather than staying at the angle it was carried at.
  it.rot *= 0.35;
}

/* ---------- the zip, which is the ending ---------- */

function closeZip() {
  if (game.zipped || game.over) return;
  game.zipped = clock;
  putDown();
  document.getElementById("finish").hidden = true;
  setTimeout(finish, 1500);
}

const zipping = () => (game.zipped ? Math.min(1, (clock - game.zipped) / 1100) : 0);

/* ---------- drawing ---------- */

const stage = document.getElementById("stage");
const g = stage.getContext("2d");
let scale = 1;

function fit() {
  const rect = stage.getBoundingClientRect();
  scale = Math.min(2, window.devicePixelRatio || 1) * (rect.width / W || 1);
  stage.width = Math.round(W * scale);
  stage.height = Math.round(H * scale);
  g.setTransform(scale, 0, 0, scale, 0, 0);
}

/** A missing file should cost you that one picture, not the whole world. */
function paste(key, cx, cy, w, h, rot = 0, alpha = 1) {
  const img = ART.get(key);
  g.save();
  g.globalAlpha = alpha;
  g.translate(cx, cy);
  if (rot) g.rotate(rot);
  if (img) g.drawImage(img, -w / 2, -h / 2, w, h);
  else {
    g.fillStyle = "rgba(111, 79, 176, 0.4)";
    g.beginPath();
    g.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

function strapLine(offset, lift) {
  g.beginPath();
  g.moveTo(STRAP.x0, STRAP.y0 + offset + lift);
  g.lineTo(STRAP.x1, STRAP.y1 + offset + lift);
  g.stroke();
}

function drawStrap() {
  const lift = Math.sin(clock * 0.0011) * 2.5 * (0.35 + weather.tempo);

  g.save();
  g.lineCap = "butt";

  g.strokeStyle = "#4a5a9e";
  g.lineWidth = STRAP.band;
  strapLine(0, lift);

  // A lit top edge and two rows of stitching, so it reads as webbing and not as a bar.
  g.strokeStyle = "rgba(219, 230, 255, 0.5)";
  g.lineWidth = 2;
  strapLine(-STRAP.band / 2 + 1, lift);

  g.strokeStyle = "rgba(206, 220, 255, 0.45)";
  g.lineWidth = 1.4;
  g.setLineDash([7, 6]);
  strapLine(-9, lift);
  strapLine(9, lift);
  g.setLineDash([]);

  // Whatever is sitting on the band casts onto it, or it reads as floating in front.
  const sitter = bunny();
  if (sitter && !sitter.inside && !sitter.held) {
    const foot = sitter.y + sitter.h / 2;
    const seat = strapY(sitter.x) + lift;
    if (Math.abs(foot - seat) < 34) {
      g.fillStyle = "rgba(28, 38, 84, 0.28)";
      g.beginPath();
      g.ellipse(sitter.x + 3, seat + 1, sitter.w * 0.34, 4.5, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.restore();
}

/** TRANSFORMATION, of a sort: the strap's shadow creeps across the sky, and when it has
 *  crossed the pouch the time is up. No numbers, and nothing to read. */
function drawShadow() {
  const p = progress();
  if (!p) return;

  const edge = STRAP.x0 + p * (STRAP.x1 - STRAP.x0);
  const span = edge - STRAP.x0;
  const tail = Math.max(0, 1 - 150 / span);

  const wash = g.createLinearGradient(STRAP.x0, 0, edge, 0);
  wash.addColorStop(0, "rgba(60, 78, 150, 0.15)");
  wash.addColorStop(tail, "rgba(60, 78, 150, 0.15)");
  wash.addColorStop(1, "rgba(60, 78, 150, 0)");

  g.save();
  g.fillStyle = wash;
  g.beginPath();
  g.moveTo(STRAP.x0, strapY(STRAP.x0) + 18);
  g.lineTo(edge, strapY(edge) + 18);
  g.lineTo(edge, strapY(edge) + 112);
  g.lineTo(STRAP.x0, strapY(STRAP.x0) + 112);
  g.closePath();
  g.fill();
  g.restore();
}

function drawZip() {
  const z = zipping();
  if (!z || !Inside.zip) return;

  const a = Inside.at(Inside.zip[0].x, Inside.zip[0].y);
  const b = Inside.at(Inside.zip[1].x, Inside.zip[1].y);
  const x = a.x + (b.x - a.x) * z;
  const y = a.y + (b.y - a.y) * z;

  g.save();
  g.lineCap = "round";
  g.strokeStyle = "#5b6cb4";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(a.x, a.y);
  g.lineTo(x, y);
  g.stroke();

  g.strokeStyle = "rgba(255, 255, 255, 0.85)";
  g.lineWidth = 1.6;
  g.setLineDash([3, 4]);
  g.beginPath();
  g.moveTo(a.x, a.y);
  g.lineTo(x, y);
  g.stroke();
  g.setLineDash([]);

  // The pull, on the end of the run.
  g.fillStyle = "#dfe8ff";
  g.strokeStyle = "#4a5a9e";
  g.lineWidth = 1.4;
  g.beginPath();
  g.ellipse(x, y, 6, 4.5, Math.atan2(b.y - a.y, b.x - a.x), 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.restore();
}

function drawItem(it) {
  let y = it.y;
  // Nothing moves until a charm is picked, so a miniature that is reached for early
  // hops in place instead. The charms flare at the same moment.
  if (it.nudge) {
    const t = (clock - it.nudge) / 420;
    if (t >= 1) it.nudge = 0;
    else y -= Math.sin(t * Math.PI) * 9;
  }
  const alpha = 1 - it.fade * 0.62;
  if (it.held) {
    g.save();
    g.shadowColor = "rgba(56, 71, 122, 0.35)";
    g.shadowBlur = 12;
    g.shadowOffsetY = 6;
  }
  paste(KINDS[it.kind].art, it.x, y, it.w, it.h, it.rot, alpha);
  if (it.held) g.restore();
}

function render() {
  g.clearRect(0, 0, W, H);
  drawShadow();
  drawStrap();

  for (const it of items) if (it.inside && !it.held) drawItem(it);
  paste("pouch", POUCH.x + POUCH.sway + POUCH.w / 2, POUCH.y + POUCH.h / 2, POUCH.w, POUCH.h);
  drawZip();
  for (const it of items) if (!it.inside && !it.held) drawItem(it);
  if (held) drawItem(held);
}

let clock = 0;
let lastFrame = 0;

function frame(now) {
  const dt = Math.min(64, now - lastFrame || 16);
  lastFrame = now;
  clock = now;

  const sway = Math.sin(now * 0.0011) * 7 * (0.25 + weather.tempo);
  // Everything in the pouch swings with the pouch, so the vinyl is a place and not a hole.
  const drift = sway - POUCH.sway;
  POUCH.sway = sway;
  for (const it of items) if (it.inside && !it.held) it.x += drift;

  blow(dt, now);
  if (game.pace && !game.zipped && !game.over && progress() >= 1) closeZip();

  render();
  requestAnimationFrame(frame);
}

/* ---------- REFLECTION — what they did, never what they are ---------- */

function reflect() {
  const s = Trace.state;
  const traits = [];

  if (s.bunnyInside) traits.push(["Room For The Odd One", "you put in the one thing nobody handed you"]);
  if (s.copiesKept >= 4) traits.push(["Crowd", `you let ${s.copiesKept} near-identical things stand`]);
  if (s.madeRoomFor >= 2) traits.push(["You Went Back", `you went back for ${s.madeRoomFor} things that were already going`]);
  if (s.pulledBackOut >= 4) traits.push(["Editor", `you took ${s.pulledBackOut} things out again`]);
  if (s.tempo < 0.22) traits.push(["Slow Hand", "you moved slowly enough that the sky went cream"]);
  if (s.tempo > 0.55) traits.push(["Quick Hand", "you moved faster than the pouch could keep up with"]);
  if (!traits.length) traits.push(["Packed", `you put ${packed().length} things in and left the rest in the spill`]);

  const pouches = {
    "Room For The Odd One": "a pouch with the mascot inside it, facing out",
    Crowd: "a pouch you can't see the far side of",
    "You Went Back": "a pouch with the same thing in it twice, on purpose",
    Editor: "a pouch with room left in it",
    "Slow Hand": "a pouch arranged in cream light",
    "Quick Hand": "a pouch packed at a run",
    Packed: "a pouch with a few things in it and the rest left out",
  };

  const top = traits.slice(0, 3);
  return { traits: top, pouch: pouches[top[0][0]] };
}

/* ============================== ENGINE ============================== */

const KEY = (k) => `tiny-worlds:${CONFIG.slug}:${k}`;

/** TRACE — five pieces of behavioural state. Resist adding a sixth. */
const Trace = {
  state: {
    madeRoomFor: 0,
    pulledBackOut: 0,
    tempo: 0,
    copiesKept: 0,
    bunnyInside: false,
  },
  acts: 0,

  putIn(it) {
    if (it.kind === "bunny") this.state.bunnyInside = true;
    this.act();
  },

  pulledOut(it) {
    this.state.pulledBackOut += 1;
    if (it.kind === "bunny") this.state.bunnyInside = false;
    this.act();
  },

  act() {
    this.acts += 1;
    if (this.acts === 1) document.getElementById("finish").hidden = false;
    Hints.wake();
    this.save();
  },

  /** Counted at the end, because both of these are about what is still in there. */
  settle() {
    const inside = packed();
    this.state.madeRoomFor = inside.filter((it) => it.faded).length;
    this.state.copiesKept = inside.filter((it) => it.copy).length;
    this.state.bunnyInside = inside.some((it) => it.kind === "bunny");
    this.state.tempo = +(weather.ms ? weather.sum / weather.ms : 0).toFixed(3);
    this.save();
  },

  save() {
    try {
      localStorage.setItem(KEY("trace"), JSON.stringify(this.state));
    } catch {
      /* private browsing — the pouch simply forgets */
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

/** HINTS — filled in with the rest of the ladder. */
const Hints = {
  idleMs: 7000,
  _timer: null,
  _retired: new Set(),

  wake() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.offer(), this.idleMs);
  },

  offer() {
    if (!game.pace) {
      document.getElementById("charms").classList.add("flare");
      setTimeout(() => document.getElementById("charms").classList.remove("flare"), 4600);
    }
    this.wake();
  },

  retire(id) {
    this._retired.add(id);
  },
};

function drawCard() {
  return reflect();
}

function finish() {
  game.over = true;
  Trace.settle();
  const { traits, pouch } = drawCard();
  document.getElementById("reveal-title").textContent = traits[0][0];
  document.getElementById("reveal-body").textContent = `${traits[0][1]} — so you have ${pouch}.`;
  document.getElementById("world").hidden = true;
  document.getElementById("reveal").hidden = false;
  clearTimeout(Hints._timer);
}

/* ---------- wiring ---------- */

document.getElementById("quest").textContent = CONFIG.quest;
document.title = CONFIG.title;

const point = (e) => {
  const rect = stage.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * W) / rect.width,
    y: ((e.clientY - rect.top) * H) / rect.height,
  };
};

stage.addEventListener("pointerdown", (e) => {
  if (game.over || game.zipped) return;
  const p = point(e);
  handAt(p.x, p.y, clock);

  const it = pick(p.x, p.y);
  if (!it) return;

  // Nothing may be moved until the world has been given a length.
  if (!game.pace) {
    it.nudge = clock;
    Hints.offer();
    return;
  }

  grab = { x: it.x - p.x, y: it.y - p.y };
  takeUp(it);
  stage.setPointerCapture(e.pointerId);
});

stage.addEventListener("pointermove", (e) => {
  const p = point(e);
  handAt(p.x, p.y, clock);
  if (!held) return;
  held.x = Math.max(20, Math.min(W - 20, p.x + grab.x));
  held.y = Math.max(20, Math.min(H - 20, p.y + grab.y));
});

for (const kind of ["pointerup", "pointercancel"]) stage.addEventListener(kind, putDown);

document.getElementById("charms").addEventListener("click", (e) => {
  const el = e.target.closest(".charm");
  if (el && !el.disabled) begin(el.dataset.pace);
});

document.getElementById("finish").addEventListener("click", closeZip);

document.getElementById("download").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = `${CONFIG.slug}.png`;
  a.href = document.getElementById("card").toDataURL("image/png");
  a.click();
});

document.getElementById("again").addEventListener("click", () => {
  location.reload();
});

window.addEventListener("resize", fit);

Promise.all([ART.load(), Inside.load()]).then(() => {
  const img = ART.get("pouch");
  if (img) POUCH.h = (POUCH.w * img.height) / img.width;
  POUCH.x = 600 - RING.dx;
  POUCH.y = strapY(600) + 4 - RING.dy;
  spill();
  fit();
  Hints.wake();
  requestAnimationFrame(frame);
});
