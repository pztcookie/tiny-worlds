/* Maskutchi Bag Charm.
 *
 * Everything above the ENGINE line is this world. Below it is the scaffolding every game
 * in this repo shares: traces, the shy idle hints, the reveal, the take-home card.
 *
 * The art is a set of static PNGs in assets/, cut from fifteen supplied layer exports by
 * scripts/slice_assets.py. Nothing is fetched from the network and there is no API key.
 * The pouch's interior is a faint translucent tint rather than a hole, so the miniatures
 * are drawn underneath it and genuinely show through the vinyl, and assets/pouch-inside.json
 * is that same interior as a bitmask — the pouch hangs at an angle, so no rectangle would do.
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
  soda: { art: "item-soda", family: "grape", w: 54, name: "the soda bottle", gesture: "upright" },
  "grape-candy": { art: "item-grape-candy", family: "grape", w: 56, name: "the grape candy", gesture: "shake" },
  tart: { art: "item-tart", family: "grape", w: 50, name: "the grape tart", gesture: "spin" },
  parfait: { art: "item-parfait", family: "grape", w: 46, name: "the parfait", gesture: "upright" },
  candy: { art: "item-candy", family: "milk", w: 46, name: "the blue candy", gesture: "shake" },
  yakult: { art: "item-yakult", family: "milk", w: 34, name: "the little bottle", gesture: "hold", wrap: true },
  pudding: { art: "item-pudding", family: "milk", w: 48, name: "the blue pudding", gesture: "slow" },
  star: { art: "item-star", family: "milk", w: 30, name: "the tiny star", gesture: "shake", wrap: true },
  cookie: { art: "item-cookie", family: "cream", w: 62, name: "the cookie packet", gesture: "spin", wrap: true },
  peanut: { art: "item-peanut", family: "cream", w: 46, name: "the peanut butter", gesture: "tap-twice" },
  choco: { art: "item-choco", family: "cream", w: 74, name: "the choco box", gesture: "slow" },
  blindbag: { art: "item-blindbag", family: "cream", w: 66, name: "the blind bag", gesture: "tap-twice" },
  bunny: { art: "bunny", family: "lilac", w: 62, name: "the bunny", gesture: "slow" },
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
  corners: null,

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

  /** The corners, found rather than measured: the interior is a rectangle at an angle, so
   *  its topmost, leftmost, lowest and rightmost cells are its four corners. The zip runs
   *  along the edge from the top corner to whichever of its neighbours is higher. */
  findZip() {
    let top = null;
    let left = null;
    let right = null;
    let low = null;
    for (let j = 0; j < this.h; j += 1) {
      for (let i = 0; i < this.w; i += 1) {
        if (this.rows[j][i] !== "1") continue;
        if (!top) top = { i, j };
        low = { i, j };
        if (!left || i < left.i) left = { i, j };
        if (!right || i > right.i) right = { i, j };
      }
    }
    if (!top) return;
    const frac = (c) => ({ x: (c.i + 0.5) / this.w, y: (c.j + 0.5) / this.h });
    this.corners = [top, right, low, left].map(frac);
    this.zip = [frac(top), frac(left.j - top.j <= right.j - top.j ? left : right)];
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
    gesture: K.gesture,
    wrapped: extra.wrapped ?? !!K.wrap,
    unlocked: extra.unlocked ?? false,
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
  // Everything here is a function of elapsed time rather than of frames, so a slow
  // machine gets the same weather as a fast one.
  if (now - weather.moved > 260) weather.target *= Math.exp(-dt / 340);
  weather.tempo += (weather.target - weather.tempo) * (1 - Math.exp(-dt / 240));
  weather.warm += weather.tempo < 0.22 ? dt / 14000 : -dt / 2600;
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
    if (el.dataset.pace === name) return el.classList.add("chosen");
    el.classList.add("spent");
    el.disabled = true;
    // Gone rather than merely transparent: the two you did not pick have no further part
    // in this, and a keyboard should not be able to find them.
    setTimeout(() => el.remove(), 1000);
  });
  document.getElementById("charms").classList.remove("flare");
  beatSoon();
  Hints.wake();
}

/* ---------- PLAY — take one, drop it in, take it back out ---------- */

let held = null;
let grab = { x: 0, y: 0 };
let lastTap = { id: 0, t: 0 };
let glowingNow = null;

function hit(it, x, y) {
  const wrapped = it.wrapped && !it.unwrap;
  const size = wrapped ? parcelSize(it, it.w, it.h) : { w: it.w, h: it.h };
  return Math.abs(x - it.x) <= size.w / 2 + 6 && Math.abs(y - it.y) <= size.h / 2 + 6;
}

/** Whatever is on top, which is the reverse of the order things are drawn in. */
function pick(x, y) {
  const out = items.filter((it) => !it.inside);
  const inn = items.filter((it) => it.inside);
  for (let i = out.length - 1; i >= 0; i -= 1) if (!out[i].flee && hit(out[i], x, y)) return out[i];
  for (let i = inn.length - 1; i >= 0; i -= 1) if (!inn[i].flee && hit(inn[i], x, y)) return inn[i];
  return null;
}

function toFront(it) {
  items = items.filter((other) => other !== it);
  items.push(it);
}

/* ---------- how each miniature wants to be carried ----------
 *
 * Six gestures, reused. Until one is found the pouch will not keep the miniature —
 * it wriggles out, never a silent no. After that the old multiply/fade rules take over.
 * Three start wrapped; unwrapping is the same gesture, with the wrap splitting first.
 */

const TEACH = { hold: 0, slow: 1, "tap-twice": 2, shake: 3, upright: 4, spin: 5 };

const WANT = {
  slow: {
    murmur: "this one likes a still hand",
    explicit: "this one likes a still hand",
    refuse: "too quick — slower",
    almost: "slower",
  },
  shake: {
    murmur: "give it a little shake",
    explicit: "give it a little shake",
    refuse: "it wanted a jiggle",
    almost: "that's the shake",
  },
  spin: {
    murmur: "turn it over",
    explicit: "turn it over once",
    refuse: "it didn't get to turn",
    almost: "that's the turn",
  },
  "tap-twice": {
    murmur: "tap it twice",
    explicit: "tap it twice, then pick it up",
    refuse: "one tap wasn't enough",
    almost: "once more",
  },
  hold: {
    murmur: "hold still a beat",
    explicit: "hold still a beat before you move",
    refuse: "it wanted a moment first",
    almost: "that's it — stay",
  },
  upright: {
    murmur: "don't tip it",
    explicit: "don't tip it — keep it standing",
    refuse: "it nearly spilled",
    almost: "keep it standing",
  },
};

const Carry = {
  it: null,
  born: 0,
  last: null,
  dist: 0,
  speedSum: 0,
  speedN: 0,
  maxSpeed: 0,
  still: true,
  rushedHold: false,
  wind: 0,
  lastAng: null,
  samples: [],
  reversals: 0,
  lastVx: 0,
  lastVy: 0,
  tilt: 0,
  maxTilt: 0,
  nearShiver: 0,

  begin(it, p, now) {
    this.it = it;
    this.born = now;
    this.last = { x: p.x, y: p.y, t: now };
    this.dist = 0;
    this.speedSum = 0;
    this.speedN = 0;
    this.maxSpeed = 0;
    this.still = true;
    this.rushedHold = false;
    this.wind = 0;
    this.lastAng = null;
    this.samples = [{ x: p.x, y: p.y }];
    this.reversals = 0;
    this.lastVx = 0;
    this.lastVy = 0;
    this.tilt = it.kind === "parfait" || it.kind === "soda" ? it.rot : 0;
    this.maxTilt = Math.abs(this.tilt);
    this.nearShiver = 0;
  },

  move(p, now) {
    if (!this.it || !this.last) return;
    const dt = Math.max(16, now - this.last.t);
    const dx = p.x - this.last.x;
    const dy = p.y - this.last.y;
    const dist = Math.hypot(dx, dy);
    const speed = (dist / dt) * 1000;

    this.dist += dist;
    this.speedSum += speed;
    this.speedN += 1;
    this.maxSpeed = Math.max(this.maxSpeed, speed);

    if (dist > 14) {
      this.still = false;
      if (now - this.born < 400) this.rushedHold = true;
    }

    const vx = dx / dt;
    const vy = dy / dt;
    if (this.lastVx && vx * this.lastVx < 0 && Math.abs(dx) > 10) this.reversals += 1;
    if (this.lastVy && vy * this.lastVy < 0 && Math.abs(dy) > 10) this.reversals += 1;
    this.lastVx = vx;
    this.lastVy = vy;

    this.samples.push({ x: p.x, y: p.y });
    if (this.samples.length > 28) this.samples.shift();
    if (this.samples.length > 4) {
      let cx = 0;
      let cy = 0;
      for (const s of this.samples) {
        cx += s.x;
        cy += s.y;
      }
      cx /= this.samples.length;
      cy /= this.samples.length;
      const ang = Math.atan2(p.y - cy, p.x - cx);
      if (this.lastAng != null) {
        let d = ang - this.lastAng;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        this.wind += d;
      }
      this.lastAng = ang;
    }

    // Tall things tip when the hand jerks sideways; a steady carry keeps them standing.
    this.tilt += vx * 0.06;
    this.tilt = Math.max(-1.1, Math.min(1.1, this.tilt));
    this.tilt *= 0.88;
    this.maxTilt = Math.max(this.maxTilt, Math.abs(this.tilt));
    if (this.it.gesture === "upright") this.it.rot = this.tilt;

    this.last = { x: p.x, y: p.y, t: now };
    this.feel();
  },

  avg() {
    return this.speedN ? this.speedSum / this.speedN : 0;
  },

  spinRadius() {
    if (this.samples.length < 6) return 0;
    let cx = 0;
    let cy = 0;
    for (const s of this.samples) {
      cx += s.x;
      cy += s.y;
    }
    cx /= this.samples.length;
    cy /= this.samples.length;
    let r = 0;
    for (const s of this.samples) r += Math.hypot(s.x - cx, s.y - cy);
    return r / this.samples.length;
  },

  ready() {
    const it = this.it;
    if (!it || it.unlocked) return false;
    const g = it.gesture;
    if (g === "tap-twice") return !!it.primed;
    if (g === "hold") return this.still && clock - this.born > 400 && !this.rushedHold;
    if (g === "slow") return this.dist > 40 && this.avg() < 340 && this.maxSpeed < 620;
    if (g === "shake") return this.reversals >= 3 && this.dist > 28;
    if (g === "spin") return Math.abs(this.wind) > 3.4 && this.spinRadius() > 18;
    if (g === "upright") return this.dist > 50 && this.maxTilt < 0.32;
    return false;
  },

  almost() {
    const it = this.it;
    if (!it || it.unlocked) return false;
    const g = it.gesture;
    if (g === "slow") return this.dist > 28 && this.avg() < 480;
    if (g === "shake") return this.reversals >= 1;
    if (g === "spin") return Math.abs(this.wind) > 1.8 && this.spinRadius() > 12;
    if (g === "upright") return this.dist > 36 && this.maxTilt < 0.5;
    if (g === "hold") return this.still && clock - this.born > 240 && !this.rushedHold;
    return false;
  },

  feel() {
    const it = this.it;
    if (!it || it.unlocked) return;
    if (this.ready()) {
      unlock(it);
      return;
    }
    if (this.almost() && clock - this.nearShiver > 520) {
      this.nearShiver = clock;
      it.shiver = clock;
      const want = WANT[it.gesture];
      if (want && clock - (this.nearSaid || 0) > 1800) {
        this.nearSaid = clock;
        whisper(want.almost);
      }
    }
  },

  tick() {
    if (!this.it || this.it.unlocked) return;
    if (this.it.gesture === "hold") this.feel();
    if (this.it.gesture === "upright") this.it.rot = this.tilt;
  },

  end() {
    this.it = null;
    this.last = null;
  },
};

let rushSaid = 0;
function maybeRush(now) {
  if (!held || game.over || game.zipped) return;
  if (weather.tempo < 0.62 || now - rushSaid < 7000) return;
  rushSaid = now;
  Trace.state.rushCount += 1;
  document.documentElement.classList.add("rushing");
  setTimeout(() => document.documentElement.classList.remove("rushing"), 1600);
  const lines = ["easy — the stars are streaking", "not so fast", "slow down a little"];
  whisper(lines[Trace.state.rushCount % lines.length]);
}

function glowTarget() {
  if (!game.pace || game.zipped) return null;
  const locked = items.filter((it) => !it.unlocked && !it.copy);
  if (!locked.length) return null;
  const failed = locked.find((it) => it.failed && clock - it.failed < 5000);
  if (failed) return failed;
  const wrapped = locked
    .filter((it) => it.wrapped)
    .sort((a, b) => (TEACH[a.gesture] ?? 9) - (TEACH[b.gesture] ?? 9));
  if (wrapped.length) return wrapped[0];
  const near = locked
    .filter((it) => !it.inside)
    .sort((a, b) => Math.hypot(a.x - 560, a.y - 280) - Math.hypot(b.x - 560, b.y - 280))[0];
  return near ?? locked[0];
}

function unlock(it) {
  if (it.unlocked) return;
  const wasWrapped = it.wrapped;
  it.unlocked = true;
  it.primed = false;
  it.failed = 0;
  Trace.gestured(it, wasWrapped);
  if (wasWrapped) {
    it.wrapped = false;
    it.unwrap = clock;
    sparkle(it.x, it.y, "#dcc9ff", 18);
    once("unwrap", "oh — that's what was in it");
  } else {
    sparkle(it.x, it.y, "#efe6ff", 10);
    once("gesture", "it settled");
  }
}

function refuse(it) {
  it.fails = (it.fails || 0) + 1;
  it.failed = clock;
  it.shiver = clock;
  it.named = true;
  Trace.refused += 1;

  const want = WANT[it.gesture];

  // After the bunny has named this one's gesture, two more characterful refusals
  // and it comes around — a stuck player is never trapped. Still counts as found.
  if (it.fails >= 3) {
    sparkle(it.x, it.y, "#dcc9ff", 12);
    unlock(it);
    whisper("alright — in you go");
    return false;
  }

  sparkle(it.x, it.y, "#e4d6ff", 9);
  whisper(want ? want.murmur : "it wriggled out");
  Hints.gestureNudge();

  it.inside = false;
  if (it.kind === "bunny") {
    const x = hop.to || BUNNY_HOME.x;
    it.flee = { x0: it.x, y0: it.y, x1: x, y1: perch(x), born: clock };
  } else {
    const spot = spillSpot(it);
    it.flee = { x0: it.x, y0: it.y, x1: spot.x, y1: spot.y, born: clock };
  }
  return true;
}

function takeUp(it, p) {
  held = it;
  it.held = true;
  it.came = it.inside;
  it.flee = null;
  toFront(it);
  Carry.begin(it, p, clock);
  if (it.gesture === "tap-twice" && it.primed && !it.unlocked) unlock(it);
}

function putDown() {
  if (!held) return;
  const it = held;
  held = null;
  it.held = false;

  const wasTap = Carry.dist < 18 && clock - Carry.born < 320;
  if (wasTap) lastTap = { id: it.id, t: clock };

  // Last chance: a slow or upright carry is judged on the whole trip, not a mid-drag spike.
  if (!it.unlocked) Carry.feel();

  const inPouch = Inside.holds(it.x, it.y);
  if (inPouch && !it.unlocked) {
    Carry.end();
    if (refuse(it)) return;
    // Mercy unlock: the drop stands.
  }

  it.inside = inPouch;
  if (it.came && !it.inside) Trace.pulledOut(it);
  if (!it.came && it.inside) Trace.putIn(it);

  // Anything in the pouch settles rather than staying at the angle it was carried at.
  if (it.gesture !== "upright" || it.inside) it.rot *= 0.35;
  Carry.end();
}

/* ---------- PERSONALITY — the pouch has opinions about what belongs together ----------
 *
 * Two rules, one machine: a miniature with a relative of its own colour beside it may be
 * copied, and one with nobody beside it fades in steps and is pushed back out. The hand's
 * speed decides how often the pouch gets to decide anything, and a slow hand brings a star
 * down out of the sky that makes whatever it lands on exempt.
 */

const NEAR = 96; // close enough to count as a relative
const BUNNY_NEAR = 122; // close enough to the bunny to be left alone
const ROOM = 16; // what the pouch will hold before it stops making copies

const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function relatives(it, inside) {
  return inside.filter((other) => other !== it && other.family === it.family && gap(other, it) < NEAR);
}

/** MYSTERY — the bunny is the one thing that is never dissolved, and it lends that to
 *  whatever is resting near it. Nothing says so. */
function guarded(it) {
  if (it.kind === "bunny" || it.starred) return true;
  const b = bunny();
  return !!b && b.inside && gap(b, it) < BUNNY_NEAR;
}

const told = new Set();
function once(id, line) {
  if (told.has(id)) return;
  told.add(id);
  whisper(line);
}

/* the marks the world leaves behind */

const rings = [];
const sparks = [];
const falling = [];

function ring(x, y, r) {
  rings.push({ x, y, r, born: clock });
}

function sparkle(x, y, colour, n = 9) {
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 + Math.random();
    const speed = 0.02 + Math.random() * 0.05;
    sparks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 0.01, born: clock, life: 620, colour });
  }
}

/** Somewhere in the spill with elbow room, for whatever the pouch has pushed out. */
function spillSpot(it) {
  let best = null;
  for (let i = 0; i < 26; i += 1) {
    const x = 52 + Math.random() * 420;
    const y = 302 + Math.random() * 262;
    const near = items
      .filter((other) => other !== it && !other.inside)
      .reduce((min, other) => Math.min(min, Math.hypot(other.x - x, other.y - y)), 9999);
    if (!best || near > best.near) best = { x, y, near };
    if (near > 76) break;
  }
  return best;
}

function copyOf(it) {
  const inside = packed();
  if (inside.length >= ROOM) return false;
  // Copies are relatives of each other, so without a ceiling per kind the first pair the
  // pouch likes crowds everything else out. Four of anything is already a crowd.
  if (inside.filter((other) => other.kind === it.kind).length >= 4) return false;
  for (let i = 0; i < 14; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const d = it.w * 0.6 + 12 + Math.random() * 28;
    const x = it.x + Math.cos(a) * d;
    const y = it.y + Math.sin(a) * d;
    if (!Inside.holds(x, y)) continue;
    const twin = makeItem(it.kind, x, y, it.rot + (Math.random() - 0.5) * 0.5, {
      inside: true,
      copy: true,
      born: clock,
      unlocked: true,
      wrapped: false,
    });
    items.push(twin);
    sparkle(x, y, "#fff4c9", 7);
    once("copy", "two of those now");
    return true;
  }
  return false;
}

/** Pushed back out. A copy is simply un-made, because it was never one of the twelve you
 *  were handed; a real one lands in the spill, so going back for it is always possible and
 *  nothing is ever lost for good. */
function pushOut(it, { quietly = false } = {}) {
  if (!quietly) ring(it.x, it.y, it.w * 0.6);
  sparkle(it.x, it.y, "#e4d6ff", 11);
  Trace.pushedOut += 1;

  if (it.copy) {
    items = items.filter((other) => other !== it);
    return;
  }

  const spot = spillSpot(it);
  it.inside = false;
  it.fade = 0;
  it.starred = false;
  it.x = spot.x;
  it.y = spot.y;
  it.rot = (Math.random() - 0.5) * 0.7;
}

function beat() {
  if (!game.pace || game.zipped || game.over) return;
  const inside = packed().filter((it) => !it.held);
  const mischief = game.pace.mischief;

  // Anything exempt is not only spared but recovers, which is how the exemption shows.
  for (const it of inside) if (guarded(it) && it.fade) it.fade = Math.max(0, it.fade - 0.5);

  const loose = inside.filter((it) => !guarded(it));

  // At most one copy and one eviction a beat, so the pouch reads as deciding rather than
  // as churning. Shuffled, so it is not always the same miniature's turn.
  const shuffled = loose.slice().sort(() => Math.random() - 0.5);

  const twin = shuffled.find((it) => relatives(it, inside).length);
  if (twin && Math.random() < (0.2 + 0.28 * weather.tempo) * mischief) copyOf(twin);

  const lonely = shuffled.find((it) => !relatives(it, inside).length);
  if (lonely && Math.random() < (0.44 + 0.3 * weather.tempo) * mischief) {
    lonely.fade = Math.min(1, lonely.fade + 0.34);
    lonely.faded = true;
    if (lonely.fade >= 1) {
      pushOut(lonely);
      once("gone", "nothing was next to it");
    }
  }

  // A fast hand and the pouch stops being careful about it.
  if (weather.tempo > 0.72 && loose.length && Math.random() < 0.12 * mischief) {
    const unlucky = loose[Math.floor(Math.random() * loose.length)];
    pushOut(unlucky, { quietly: true });
    once("spat", "that one came back out");
  }

  // A slow hand, a warm sky, and one of the stars comes down.
  if (weather.tempo < 0.3 && weather.warm > 0.45 && falling.length < 2 && Math.random() < 0.16) {
    const targets = inside.filter((it) => !it.starred && it.kind !== "bunny");
    falling.push({
      x: 120 + Math.random() * 700,
      y: -24,
      to: targets[Math.floor(Math.random() * targets.length)] ?? null,
    });
  }

  Hints.notice();
}

/* ---------- the bunny, which is the only thing that points ---------- */

/** It sits on the strap, so anywhere it hops to is on the strap too. */
const perch = (x) => strapY(x) - 37;

const hop = { from: 0, to: BUNNY_HOME.x, born: 0 };

function hopNearer() {
  const b = bunny();
  if (!b || b.inside || b.held || hop.to >= 460) return;
  hop.from = hop.to;
  hop.to = Math.min(460, hop.to + 97);
  hop.born = clock;
}

/** ANTI-STUCK, wordlessly: it leans at the glowing mystery, or at whatever is fading, and
 *  on a stall it moves towards the mouth of the pouch. It never gets in by itself. */
function watchOver(dt) {
  const b = bunny();
  if (!b || b.inside || b.held || b.flee) return;

  if (hop.born) {
    const t = (clock - hop.born) / 620;
    if (t >= 1) {
      hop.born = 0;
      b.x = hop.to;
    } else {
      b.x = hop.from + (hop.to - hop.from) * t;
      b.y = perch(b.x) - Math.sin(t * Math.PI) * 26;
    }
  }
  if (!hop.born) b.y = perch(b.x) + Math.sin(clock * 0.0016) * 1.6;

  const glowing = glowTarget();
  const going = packed()
    .filter((it) => it.fade > 0)
    .sort((a, b2) => b2.fade - a.fade)[0];
  const focus = glowing && !glowing.held ? glowing : going;
  const want = focus ? Math.max(-0.3, Math.min(0.3, (focus.x - b.x) * 0.0016)) : 0;
  b.rot += (want - b.rot) * (1 - Math.exp(-dt / 260));
}

let beatTimer = null;
function beatSoon() {
  clearTimeout(beatTimer);
  const ms = game.pace.beat * (1 - 0.34 * weather.tempo);
  beatTimer = setTimeout(() => {
    beat();
    if (!game.over && !game.zipped) beatSoon();
  }, ms);
}

/** The marks and the weather advance on the frame clock, not on the beat. */
function drift(dt) {
  for (let i = rings.length - 1; i >= 0; i -= 1) if (clock - rings[i].born > 9000) rings.splice(i, 1);

  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const s = sparks[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 0.00012 * dt;
    if (clock - s.born > s.life) sparks.splice(i, 1);
  }

  for (let i = falling.length - 1; i >= 0; i -= 1) {
    const f = falling[i];
    const aim = f.to && f.to.inside ? f.to : null;
    f.y += 0.19 * dt;
    if (aim) f.x += (aim.x - f.x) * 0.035;
    if (aim && f.y >= aim.y) {
      aim.starred = true;
      sparkle(aim.x, aim.y, "#fff2b8", 12);
      once("star", "a star came down on it");
      falling.splice(i, 1);
    } else if (f.y > H + 30) {
      falling.splice(i, 1);
    }
  }

  for (const it of items) {
    if (!it.flee) continue;
    const t = (clock - it.flee.born) / 440;
    if (t >= 1) {
      it.x = it.flee.x1;
      it.y = it.flee.y1;
      it.rot *= 0.2;
      it.flee = null;
    } else {
      const e = 1 - (1 - t) * (1 - t);
      it.x = it.flee.x0 + (it.flee.x1 - it.flee.x0) * e;
      it.y = it.flee.y0 + (it.flee.y1 - it.flee.y0) * e - Math.sin(t * Math.PI) * 22;
      it.rot += 0.14;
    }
  }
}

/* ---------- the zip, which is the ending ---------- */

function closeZip() {
  if (game.zipped || game.over) return;
  game.zipped = clock;
  putDown();
  clearTimeout(beatTimer);
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
  const lift = calm ? 0 : Math.sin(clock * 0.0011) * 2.5 * (0.35 + weather.tempo);

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

/** A four-point sparkle, the one shape this world draws for itself. */
function spark(x, y, r, colour, alpha = 1) {
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = colour;
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
  g.restore();
}

/** TRANSFORMATION, first half: an empty pouch is an outline waiting to be filled. It stops
 *  the moment anything is in there, and by the end the same shape is a closed pouch with
 *  one particular arrangement in it. */
function drawWaiting() {
  if (!Inside.corners || packed().length || game.zipped) return;
  const at = Inside.corners.map((c) => Inside.at(c.x, c.y));
  const pulse = 0.3 + Math.sin(clock * 0.0024) * 0.16;

  g.save();
  g.beginPath();
  at.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
  g.closePath();

  const middle = Inside.at(0.5, 0.5);
  const glow = g.createRadialGradient(middle.x, middle.y, 0, middle.x, middle.y, POUCH.w * 0.6);
  glow.addColorStop(0, `rgba(190, 168, 255, ${pulse * 0.4})`);
  glow.addColorStop(1, "rgba(190, 168, 255, 0)");
  g.fillStyle = glow;
  g.fill();

  g.globalAlpha = pulse;
  g.strokeStyle = "#b3a0f5";
  g.lineWidth = 2.5;
  g.setLineDash([10, 10]);
  g.stroke();
  g.restore();
}

function drawMarks() {
  for (const r of rings) {
    const t = (clock - r.born) / 9000;
    g.save();
    g.globalAlpha = 0.4 * (1 - t);
    g.strokeStyle = "#8f7ecb";
    g.lineWidth = 1.4;
    g.setLineDash([4, 5]);
    g.beginPath();
    g.arc(r.x, r.y, r.r * (1 + t * 0.12), 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
}

function drawSparks() {
  for (const s of sparks) {
    const t = (clock - s.born) / s.life;
    spark(s.x, s.y, 4.5 * (1 - t) + 1, s.colour, 1 - t);
  }
  for (const f of falling) {
    g.save();
    g.globalAlpha = 0.5;
    g.strokeStyle = "#fff2b8";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(f.x, f.y - 26);
    g.lineTo(f.x, f.y);
    g.stroke();
    g.restore();
    spark(f.x, f.y, 7, "#fff6d0");
  }
}

function roundBox(x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function parcelSize(it, w, h) {
  if (it.kind === "star") return { w: 46, h: 46 };
  if (it.kind === "yakult") return { w: 38, h: Math.max(h, 60) };
  return { w: Math.max(w, 54), h: Math.max(h * 0.92, 50) };
}

/** A sealed pastel parcel, cream paper and a lilac ribbon, so the wrap belongs to this
 *  sky rather than to a new sprite sheet. */
function drawParcel(it, cx, cy, w, h, rot, alpha, split = 0) {
  const size = parcelSize(it, w, h);
  const pw = size.w;
  const ph = size.h;
  const halves = [
    { x: -split * 18, a: -split * 0.4 },
    { x: split * 18, a: split * 0.4 },
  ];

  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  g.globalAlpha = alpha * (1 - split * 0.55);

  for (const half of split ? halves : [{ x: 0, a: 0 }]) {
    g.save();
    g.translate(half.x, 0);
    g.rotate(half.a);
    const paper = g.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
    paper.addColorStop(0, "#f7efe0");
    paper.addColorStop(0.55, "#ead6f4");
    paper.addColorStop(1, "#dcc8ff");
    g.fillStyle = paper;
    g.strokeStyle = "rgba(111, 79, 176, 0.35)";
    g.lineWidth = 1.4;
    roundBox(-pw / 2, -ph / 2, pw, ph, 7);
    g.fill();
    g.stroke();

    g.strokeStyle = "rgba(168, 124, 255, 0.85)";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, -ph / 2);
    g.lineTo(0, ph / 2);
    g.moveTo(-pw / 2, 0);
    g.lineTo(pw / 2, 0);
    g.stroke();

    g.fillStyle = "#b9a0f5";
    g.beginPath();
    g.moveTo(0, -6);
    g.quadraticCurveTo(7, -1, 0, 5);
    g.quadraticCurveTo(-7, -1, 0, -6);
    g.fill();
    spark(0, 0, 4.5, "#fff6d0", 0.9);
    g.restore();
    if (!split) break;
  }
  g.restore();
}

function drawMysteryGlow(it, y) {
  const rush = weather.tempo > 0.55;
  const pulse = 0.55 + Math.sin(clock * (rush ? 0.014 : 0.005) + it.id) * 0.28;
  const r = Math.max(it.w, it.h) * (0.95 + pulse * 0.2);
  const glow = g.createRadialGradient(it.x, y, 0, it.x, y, r);
  const inner = rush ? `rgba(186, 140, 255, ${0.7 * pulse})` : `rgba(220, 206, 255, ${0.55 * pulse})`;
  glow.addColorStop(0, inner);
  glow.addColorStop(0.5, `rgba(186, 160, 255, ${0.28 * pulse})`);
  glow.addColorStop(1, "rgba(220, 206, 255, 0)");
  g.fillStyle = glow;
  g.beginPath();
  g.arc(it.x, y, r, 0, Math.PI * 2);
  g.fill();
  if ((clock + it.id * 80) % 900 < 120) spark(it.x + r * 0.35, y - r * 0.4, 5, "#efe6ff", pulse);
}

/** The cue IS the gesture, drawn on the glowing (or held-locked) miniature. */
function drawGestureCue(it, x, y, w, h) {
  const kind = it.gesture;
  g.save();
  g.translate(x, y);

  if (kind === "spin") {
    const a = clock * 0.0032;
    const r = Math.max(w, h) * 0.72;
    for (let i = 0; i < 5; i += 1) {
      const ang = a + (i / 5) * Math.PI * 2;
      spark(Math.cos(ang) * r, Math.sin(ang) * r, 4.2, "#efe6ff", 0.85);
    }
  }

  if (kind === "hold") {
    const wait = it.held && Carry.it === it && Carry.still ? Math.min(1, (clock - Carry.born) / 400) : 0.18 + 0.08 * Math.sin(clock * 0.004);
    const r = Math.max(w, h) * 0.7;
    g.strokeStyle = "rgba(168, 124, 255, 0.55)";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = "rgba(111, 79, 176, 0.95)";
    g.lineWidth = 3.2;
    g.beginPath();
    g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + wait * Math.PI * 2);
    g.stroke();
  }

  if (kind === "upright") {
    const sway = Math.sin(clock * 0.003) * 1.2;
    g.strokeStyle = "rgba(111, 79, 176, 0.85)";
    g.lineWidth = 2.2;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(sway, -h / 2 - 16);
    g.lineTo(0, -h / 2 - 4);
    g.stroke();
    g.fillStyle = "rgba(111, 79, 176, 0.9)";
    g.beginPath();
    g.arc(sway, -h / 2 - 18, 2.4, 0, Math.PI * 2);
    g.fill();
  }

  g.restore();
}

function drawItem(it) {
  let x = it.x;
  let y = it.y;
  let rot = it.rot;
  let w = it.w;
  let h = it.h;
  const cueing = !it.unlocked && (glowingNow === it || it.held);

  // Nothing moves until a charm is picked, so a miniature that is reached for early
  // hops in place instead. The charms flare at the same moment.
  if (it.nudge) {
    const t = (clock - it.nudge) / 420;
    if (t >= 1) it.nudge = 0;
    else y -= Math.sin(t * Math.PI) * 9;
  }

  if (it.shiver) {
    const t = (clock - it.shiver) / 520;
    if (t >= 1) it.shiver = 0;
    else {
      const damp = (1 - t) * (1 - t);
      y += Math.sin(t * Math.PI * 5) * 3.2 * damp;
      rot += Math.sin(t * Math.PI * 6) * 0.1 * damp;
    }
  }

  if (cueing && it.gesture === "slow") {
    const breathe = 1 + Math.sin(clock * 0.0032 + it.id) * 0.07;
    w *= breathe;
    h *= breathe;
  }
  if (cueing && it.gesture === "shake" && !it.held) {
    x += Math.sin(clock * 0.022 + it.id) * 3.4;
    rot += Math.sin(clock * 0.028 + it.id) * 0.08;
  }
  if (cueing && it.gesture === "tap-twice" && !it.held) {
    const cycle = (clock + it.id * 40) % 1100;
    const blink = (cycle > 80 && cycle < 200) || (cycle > 280 && cycle < 400);
    if (blink) {
      w *= 1.12;
      h *= 1.12;
    }
  }

  if (it.held && it.gesture === "hold" && Carry.it === it && Carry.still && !it.unlocked) {
    const wait = Math.min(1, (clock - Carry.born) / 400);
    w *= 1 + wait * 0.06;
    h *= 1 + wait * 0.06;
  }

  // A copy arrives with a pop, so it is never mistaken for something that was always there.
  if (it.born) {
    const t = (clock - it.born) / 340;
    if (t >= 1) it.born = 0;
    else {
      const pop = 1 + Math.sin(t * Math.PI) * 0.3;
      w *= pop;
      h *= pop;
    }
  }

  // Going: dimmer, and less and less steady on its feet.
  if (it.fade) rot += Math.sin(clock * 0.017 + it.id) * 0.075 * it.fade;

  // Exempt, and it has to be visible or the secret has nothing to show for itself. It
  // breathes, because a still glow on a pale sky is easy to miss.
  if (it.inside && it.kind !== "bunny" && guarded(it)) {
    const r = it.w * (0.92 + Math.sin(clock * 0.0022 + it.id) * 0.1);
    const glow = g.createRadialGradient(it.x, it.y, 0, it.x, it.y, r);
    glow.addColorStop(0, it.starred ? "rgba(255, 226, 122, 0.72)" : "rgba(168, 124, 255, 0.6)");
    glow.addColorStop(0.55, it.starred ? "rgba(255, 226, 122, 0.28)" : "rgba(168, 124, 255, 0.22)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(it.x, it.y, r, 0, Math.PI * 2);
    g.fill();
  }

  const mystery = glowingNow;
  if (mystery === it && !it.unlocked) drawMysteryGlow(it, y);

  const unwrapping = it.unwrap ? Math.min(1, (clock - it.unwrap) / 520) : 0;
  if (it.unwrap && unwrapping >= 1) it.unwrap = 0;

  if (it.held) {
    g.save();
    g.shadowColor = "rgba(56, 71, 122, 0.35)";
    g.shadowBlur = 12;
    g.shadowOffsetY = 6;
  }

  if (it.wrapped && !unwrapping) {
    drawParcel(it, x, y, w, h, rot, 1);
  } else if (unwrapping && unwrapping < 1) {
    drawParcel(it, x, y, w, h, rot, 1, unwrapping);
    paste(KINDS[it.kind].art, x, y, w, h, rot, unwrapping);
  } else {
    paste(KINDS[it.kind].art, x, y, w, h, rot, 1 - it.fade * 0.62);
  }

  if (it.held) g.restore();

  if (cueing) drawGestureCue(it, x, y, w, h);

  if (it.starred) spark(it.x + it.w * 0.4, y - it.h * 0.38, 5, "#ffe89a");
}

function render() {
  g.clearRect(0, 0, W, H);
  drawShadow();
  drawStrap();

  drawWaiting();
  drawMarks();
  glowingNow = glowTarget();
  for (const it of items) if (it.inside && !it.held) drawItem(it);
  paste("pouch", POUCH.x + POUCH.sway + POUCH.w / 2, POUCH.y + POUCH.h / 2, POUCH.w, POUCH.h);
  drawZip();
  for (const it of items) if (!it.inside && !it.held) drawItem(it);
  if (held) drawItem(held);
  drawSparks();
}

// Started from the real clock rather than from zero, so anything that stamps itself with
// the time before the first frame still reads as having happened.
let clock = performance.now();
let lastFrame = 0;

/** Asked once: someone who does not want the world swinging gets a still one. */
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function frame(now) {
  const dt = Math.min(64, now - lastFrame || 16);
  lastFrame = now;
  clock = now;

  const sway = calm ? 0 : Math.sin(now * 0.0011) * 7 * (0.25 + weather.tempo);
  // Everything in the pouch swings with the pouch, so the vinyl is a place and not a hole.
  const swing = sway - POUCH.sway;
  POUCH.sway = sway;
  for (const it of items) if (it.inside && !it.held) it.x += swing;

  blow(dt, now);
  drift(dt);
  watchOver(dt);
  Carry.tick();
  maybeRush(now);
  if (game.pace && !game.zipped && !game.over && progress() >= 1) closeZip();

  render();
  requestAnimationFrame(frame);
}

/* ---------- REFLECTION — what they did, never what they are ---------- */

/** What is actually in there, in words, grouped so four copies read as four copies. */
function contents() {
  const inside = packed();
  if (!inside.length) return "nothing at all";

  const seen = new Map();
  for (const it of inside) seen.set(it.kind, (seen.get(it.kind) ?? 0) + 1);

  // The odd one out is named first when it is in there, rather than being swallowed by
  // the count at the end of the list.
  const kinds = [...seen].sort(([a], [b]) => (a === "bunny" ? -1 : b === "bunny" ? 1 : 0));
  const said = kinds.map(([kind, n]) => (n > 1 ? `${KINDS[kind].name} ×${n}` : KINDS[kind].name));
  const shown = said.slice(0, 3);
  if (said.length === 4) shown.push(said[3]);
  else if (said.length > 4) shown.push(`${said.length - 3} more`);
  if (shown.length === 1) return shown[0];
  return `${shown.slice(0, -1).join(", ")} and ${shown.at(-1)}`;
}

function reflect() {
  const s = Trace.state;
  const traits = [];

  if (s.bunnyInside) traits.push(["Room For The Odd One", "you put in the one thing nobody handed you"]);
  if (s.copiesKept >= 3) traits.push(["Crowd", `you let ${s.copiesKept} near-identical things stand`]);
  if (s.madeRoomFor >= 2) traits.push(["You Went Back", `you went back for ${s.madeRoomFor} things that were already going`]);
  if (s.pulledBackOut >= 3) traits.push(["Editor", `you took ${s.pulledBackOut} things out again`]);
  if (s.tempo < 0.2) traits.push(["Slow Hand", "you moved slowly enough to turn the sky warm"]);
  if (s.tempo > 0.5) traits.push(["Quick Hand", "you moved faster than the pouch could keep up with"]);
  if (s.packagesOpened >= 1) {
    traits.push([
      "Opened",
      s.packagesOpened === 1 ? "you opened one sealed parcel" : `you opened ${s.packagesOpened} sealed parcels`,
    ]);
  }
  if (s.gesturesFound >= 4) traits.push(["Found Their Ways", `you found how ${s.gesturesFound} things wanted to be carried`]);
  if (!traits.length) {
    traits.push(["Packed", `you put ${packed().length} things in and left the rest in the spill`]);
  }

  const pouches = {
    "Room For The Odd One": "a pouch with the mascot inside it, facing out",
    Crowd: "a pouch you cannot see the far side of",
    "You Went Back": "a pouch holding things that had already started to go",
    Editor: "a pouch with room left in it",
    "Slow Hand": "a pouch arranged in warm light",
    "Quick Hand": "a pouch packed at a run",
    Opened: "a pouch that started as parcels",
    "Found Their Ways": "a pouch of things that were asked how they wanted to go in",
    Packed: "a pouch with a few things in it and the rest left outside",
  };

  const top = traits.slice(0, 3);
  return {
    traits: top,
    pouch: pouches[top[0][0]],
    kept: contents(),
    shop: craftsmanName(),
  };
}

/** A shop title from what they did — tempo, parcels, copies, the bunny — never who they are. */
function craftsmanName() {
  const s = Trace.state;
  const first = [];
  if (s.rushCount >= 2 || s.tempo > 0.5) first.push("Rush");
  else if (s.tempo < 0.2) first.push(s.pulledBackOut >= 2 || s.gesturesFound >= 3 ? "Moonfold" : "Slow");
  if (s.packagesOpened >= 2) first.push("Parcel");
  else if (s.packagesOpened === 1) first.push("Ribbon");
  if (s.bunnyInside) first.push("Star");
  if (!first.length) first.push("Tiny");

  const last = [];
  if (s.copiesKept >= 3) last.push("Binder");
  if (s.madeRoomFor >= 2) last.push("Keeper");
  if (s.pulledBackOut >= 3) last.push("Folder");
  if (s.packagesOpened >= 2) last.push("Unpacker");
  if (s.gesturesFound >= 4) last.push("Packer");
  if (!last.length) last.push(s.gesturesFound ? "Packer" : "Folder");

  const a = first[0];
  const b = last.find((word) => word !== a) || last[0];
  if (first.length > 1 && first[1] !== b && a !== "Moonfold") return `${a} ${first[1]} ${b}`;
  return `${a} ${b}`;
}

/* ============================== ENGINE ============================== */

const KEY = (k) => `tiny-worlds:${CONFIG.slug}:${k}`;

/** TRACE — the original five, plus three the shop name reads. */
const Trace = {
  state: {
    madeRoomFor: 0,
    pulledBackOut: 0,
    tempo: 0,
    copiesKept: 0,
    bunnyInside: false,
    packagesOpened: 0,
    gesturesFound: 0,
    rushCount: 0,
  },
  acts: 0,
  pushedOut: 0,
  refused: 0,

  putIn(it) {
    if (it.kind === "bunny") {
      this.state.bunnyInside = true;
      // REWARD — no fanfare and no win screen. The exemption showing up on whatever is
      // resting nearby is the actual reward; this is only the world noticing.
      Hints.retire("bunny");
      sparkle(it.x, it.y, "#dcc9ff", 16);
      once("bunny", "it doesn't mind being in there");
    }
    this.act();
  },

  pulledOut(it) {
    this.state.pulledBackOut += 1;
    if (it.kind === "bunny") this.state.bunnyInside = false;
    this.act();
  },

  gestured(it, wasWrapped) {
    this.state.gesturesFound += 1;
    if (wasWrapped) this.state.packagesOpened += 1;
    Hints.retire("gesture");
    this.save();
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

/**
 * HINTS — there is no fail state here, so being stuck is the only failure, and the timer
 * means it has to be caught fast. The world nudges when the player goes quiet and when the
 * beat notices its own rules emptying the pouch. Wordless first: the charms flare, a
 * miniature hops, a parcel glows, the bunny leans. Only then does the bunny murmur, and
 * the tag climbs to nearly explicit rather than staying coy.
 */
const Hints = {
  idleMs: 3800,
  _timer: null,
  _retired: new Set(),
  _level: {},
  _restore: null,
  _gestureAt: 0,

  ladder: ["…", "the bunny isn't worried", "nothing next to the bunny has ever disappeared."],

  wake() {
    clearTimeout(this._timer);
    const ms = !game.pace ? 7000 : game.pace.beat < 1000 ? 2400 : 3800;
    this._timer = setTimeout(() => this.offer(), ms);
  },

  teachMs() {
    return game.pace ? Math.min(8000, game.pace.beat * 7) : 8000;
  },

  candidates() {
    const out = [];
    if (!game.pace) out.push("charms");
    else if (!packed().length && Trace.refused === 0 && (this._level.packing ?? 0) < 2) out.push("packing");
    else if (Trace.state.gesturesFound === 0 && items.some((it) => !it.unlocked && !it.copy)) out.push("gesture");
    else if (items.some((it) => it.wrapped)) out.push("parcel");
    else if (Trace.pushedOut >= 1 && !packed().some((it) => it.kind === "bunny")) out.push("bunny");
    return out.filter((id) => !this._retired.has(id));
  },

  offer() {
    this.wake();
    const pick = this.candidates()[0];
    if (!pick) return;

    if (pick === "charms") {
      const charms = document.getElementById("charms");
      charms.classList.add("flare");
      setTimeout(() => charms.classList.remove("flare"), 4600);
      return;
    }

    // The nearest thing to the pouch lifts, which is the only cue the packing needs.
    if (pick === "packing") {
      const glowing = glowTarget();
      const near =
        glowing ||
        items
          .filter((it) => !it.inside && it.kind !== "bunny")
          .sort((a, b) => Math.abs(a.x - 480) - Math.abs(b.x - 480))[0];
      if (near) {
        near.nudge = clock;
        this._level.packing = (this._level.packing ?? 0) + 1;
      }
      return;
    }

    if (pick === "gesture") {
      this.gestureHint();
      return;
    }

    if (pick === "parcel") {
      const it = glowTarget();
      if (it) it.nudge = clock;
      return;
    }

    hopNearer();
    const level = (this._level.bunny = Math.min(2, (this._level.bunny ?? -1) + 1));
    this.say(this.ladder[level]);
  },

  gestureNudge() {
    const it = glowTarget();
    if (it) it.nudge = clock;
    if (it && WANT[it.gesture] && (this._level.gesture ?? -1) < 1) {
      this._level.gesture = 1;
      this.say(WANT[it.gesture].explicit);
    }
  },

  gestureHint() {
    const it = glowTarget();
    if (!it) return;
    this._lastGestureHint = clock;
    it.nudge = clock;
    const want = WANT[it.gesture];
    if (!want) return;
    const level = (this._level.gesture = Math.min(1, (this._level.gesture ?? -1) + 1));
    if (level === 0) whisper(want.murmur);
    else this.say(want.explicit);
  },

  /** Called every beat, so the world can watch what its own rules are doing. Busy is not
   *  the same as unstuck: the pouch emptying itself is a stall even if the hand is moving. */
  notice() {
    if (Trace.state.gesturesFound === 0 && game.started && clock - game.started > this.teachMs() * 0.45) {
      if ((this._level.gesture ?? -1) < 1 && clock - (this._lastGestureHint || 0) > 2200) {
        this._lastGestureHint = clock;
        this.gestureHint();
      }
    }
    if (Trace.pushedOut >= 3 && this.candidates().includes("bunny") && (this._level.bunny ?? -1) < 1) {
      this.offer();
    }
  },

  say(line) {
    const tag = document.getElementById("tag");
    const quest = document.getElementById("quest");
    clearTimeout(this._restore);
    tag.classList.add("hinting");
    quest.textContent = line;
    this._restore = setTimeout(() => {
      tag.classList.remove("hinting");
      quest.textContent = CONFIG.quest;
    }, 5200);
  },

  retire(id) {
    this._retired.add(id);
    clearTimeout(this._restore);
    document.getElementById("tag").classList.remove("hinting");
    document.getElementById("quest").textContent = CONFIG.quest;
  },
};

/** TAKE HOME — the pouch they ended up with, zipped, in the weather their own hand made,
 *  with exactly their arrangement in it. Drawn from the same numbers as the world, so it is
 *  a picture of what happened rather than a stock image. */
function drawCard(said) {
  const c = document.getElementById("card");
  const k = c.getContext("2d");
  const CW = c.width;
  const CH = c.height;

  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (v) => `rgb(${v[0]}, ${v[1]}, ${v[2]})`;
  const heat = Math.min(1, Trace.state.tempo * 1.4);
  const hi = mix(mix([166, 203, 242], [255, 199, 180], weather.warm * 0.52), [81, 131, 201], heat * 0.48);
  const lo = mix(mix([220, 237, 255], [255, 240, 226], weather.warm * 0.52), [143, 186, 234], heat * 0.48);

  const sky = k.createLinearGradient(0, 0, 0, CH);
  sky.addColorStop(0, rgb(hi));
  sky.addColorStop(1, rgb(lo));
  k.fillStyle = sky;
  k.fillRect(0, 0, CW, CH);

  // The stars, from a fixed seed so the same pouch always prints the same sky.
  let seed = 20260812;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let i = 0; i < 34; i += 1) {
    const x = rnd() * CW;
    const y = rnd() * CH;
    const r = 1.6 + rnd() * 3.4;
    k.save();
    k.globalAlpha = 0.4 + rnd() * 0.5;
    k.fillStyle = rnd() > 0.7 ? "#fff0bd" : "#ffffff";
    k.beginPath();
    k.moveTo(x, y - r);
    k.quadraticCurveTo(x, y, x + r, y);
    k.quadraticCurveTo(x, y, x, y + r);
    k.quadraticCurveTo(x, y, x - r, y);
    k.quadraticCurveTo(x, y, x, y - r);
    k.fill();
    k.restore();
  }

  const pw = 380;
  const ph = (pw * POUCH.h) / POUCH.w;
  const px = 110;
  const py = 120;
  const zoom = pw / POUCH.w;

  // The strap it is still hanging from.
  k.save();
  k.lineCap = "butt";
  k.strokeStyle = "#4a5a9e";
  k.lineWidth = 34;
  k.beginPath();
  k.moveTo(-10, 185);
  k.lineTo(CW + 10, 95);
  k.stroke();
  k.strokeStyle = "rgba(206, 220, 255, 0.45)";
  k.lineWidth = 1.4;
  k.setLineDash([7, 6]);
  for (const off of [-9, 9]) {
    k.beginPath();
    k.moveTo(-10, 185 + off);
    k.lineTo(CW + 10, 95 + off);
    k.stroke();
  }
  k.restore();

  const put = (key, fx, fy, w, h, rot) => {
    const img = ART.get(key);
    if (!img) return;
    k.save();
    k.translate(px + fx * pw, py + fy * ph);
    if (rot) k.rotate(rot);
    k.drawImage(img, (-w / 2) * zoom, (-h / 2) * zoom, w * zoom, h * zoom);
    k.restore();
  };

  for (const it of packed()) {
    put(
      KINDS[it.kind].art,
      (it.x - POUCH.x - POUCH.sway) / POUCH.w,
      (it.y - POUCH.y) / POUCH.h,
      it.w,
      it.h,
      it.rot,
    );
    if (it.starred) {
      const sx = px + ((it.x - POUCH.x - POUCH.sway) / POUCH.w) * pw + it.w * 0.4 * zoom;
      const sy = py + ((it.y - POUCH.y) / POUCH.h) * ph - it.h * 0.38 * zoom;
      k.fillStyle = "#ffe89a";
      k.beginPath();
      k.arc(sx, sy, 4, 0, Math.PI * 2);
      k.fill();
    }
  }

  const pouchArt = ART.get("pouch");
  if (pouchArt) k.drawImage(pouchArt, px, py, pw, ph);

  // Shut, which is the whole point of a closed pouch.
  if (Inside.zip) {
    const a = { x: px + Inside.zip[0].x * pw, y: py + Inside.zip[0].y * ph };
    const b = { x: px + Inside.zip[1].x * pw, y: py + Inside.zip[1].y * ph };
    k.save();
    k.lineCap = "round";
    k.strokeStyle = "#5b6cb4";
    k.lineWidth = 5;
    k.beginPath();
    k.moveTo(a.x, a.y);
    k.lineTo(b.x, b.y);
    k.stroke();
    k.strokeStyle = "rgba(255, 255, 255, 0.85)";
    k.lineWidth = 1.6;
    k.setLineDash([3, 4]);
    k.beginPath();
    k.moveTo(a.x, a.y);
    k.lineTo(b.x, b.y);
    k.stroke();
    k.restore();
  }

  const donut = ART.get("donut");
  if (donut) k.drawImage(donut, CW - 92, 34, 52, (52 * donut.height) / donut.width);

  k.fillStyle = "#38477a";
  k.font = "13px ui-monospace, Menlo, monospace";
  k.textAlign = "left";
  k.save();
  k.globalAlpha = 0.7;
  k.fillText("maskutchi bag charm", 36, 58);
  k.restore();

  k.textAlign = "center";
  k.font = "11px ui-monospace, Menlo, monospace";
  k.fillStyle = "#7a6aa8";
  k.fillText("packed by", CW / 2, CH - 128);
  k.font = "20px ui-monospace, Menlo, monospace";
  k.fillStyle = "#38477a";
  k.fillText(said.shop, CW / 2, CH - 104);

  k.font = "14px ui-monospace, Menlo, monospace";
  k.fillStyle = "#5b6ba6";
  k.fillText(said.traits[0][0].toLowerCase(), CW / 2, CH - 78);

  k.font = "13px ui-monospace, Menlo, monospace";
  const words = `${said.traits[0][1]}, and kept ${said.kept}.`.split(" ");
  const lines = [""];
  for (const word of words) {
    const line = lines.at(-1);
    if (k.measureText(`${line} ${word}`).width > CW - 110) lines.push(word);
    else lines[lines.length - 1] = line ? `${line} ${word}` : word;
  }
  lines.slice(0, 3).forEach((line, i) => k.fillText(line, CW / 2, CH - 52 + i * 18));
}

function finish() {
  game.over = true;
  Trace.settle();
  const said = reflect();
  drawCard(said);

  document.getElementById("reveal-title").textContent = said.shop;
  document.getElementById("reveal-shop").textContent = said.traits[0][0];
  document.getElementById("reveal-body").textContent = `${said.traits
    .map(([, line]) => line)
    .join(". ")}. What is hanging there now is ${said.pouch}, and it kept ${
    said.kept
  }, because you decided it should.`;
  document.getElementById("world").hidden = true;
  document.getElementById("reveal").hidden = false;
  clearTimeout(Hints._timer);
  lastSaid = said;
  cardKind = "pouch";
  dessertBusy = false;
  const dessertBtn = document.getElementById("dessert");
  dessertBtn.textContent = "turn it into a dessert";
  dessertBtn.disabled = false;
  document.getElementById("studio-open").textContent = fluxKey() ? "studio key saved here" : "use a studio key";
  readyShare(said);
}

const SHARE_URL = "https://pztcookie.github.io/tiny-worlds/games/maskutchi-bag-charm/";

function downloadCard() {
  const a = document.createElement("a");
  a.download = cardKind === "dessert" ? `${CONFIG.slug}-dessert.png` : `${CONFIG.slug}.png`;
  a.href = document.getElementById("card").toDataURL("image/png");
  a.click();
}

function copyLink() {
  const btn = document.getElementById("share");
  const prev = btn.textContent;
  const done = () => {
    btn.textContent = "copied";
    setTimeout(() => {
      btn.textContent = prev;
    }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(SHARE_URL).then(done, () => fallbackCopy(done));
  } else fallbackCopy(done);
}

function fallbackCopy(done) {
  const el = document.createElement("textarea");
  el.value = SHARE_URL;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand("copy");
    done();
  } catch {
    btnLabel("share the picture");
  }
  el.remove();
}

function btnLabel(text) {
  const btn = document.getElementById("share");
  const prev = btn.textContent;
  btn.textContent = text;
  setTimeout(() => {
    btn.textContent = prev;
  }, 1600);
}

function cardFile() {
  const canvas = document.getElementById("card");
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

function readyShare(said) {
  const btn = document.getElementById("share");
  btn.dataset.shop = said.shop;
  btn.textContent = navigator.share ? "share it" : "copy the link";
}

async function shareCard() {
  const shop = document.getElementById("share").dataset.shop || craftsmanName();
  const text = `packed by ${shop} — maskutchi bag charm`;
  try {
    const blob = await cardFile();
    if (!blob) {
      copyLink();
      return;
    }
    const file = new File([blob], `${CONFIG.slug}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: CONFIG.title, text });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: CONFIG.title, text, url: SHARE_URL });
      return;
    }
  } catch (err) {
    if (err && err.name === "AbortError") return;
  }
  copyLink();
}

let lastSaid = null;
let cardKind = "pouch";
let dessertBusy = false;

function fluxKey() {
  try {
    return (
      localStorage.getItem(KEY("flux-key")) || localStorage.getItem("tiny-worlds:flux-key") || ""
    ).trim();
  } catch {
    return "";
  }
}

function saveFluxKey(value) {
  const key = value.trim();
  try {
    if (key) {
      localStorage.setItem(KEY("flux-key"), key);
      localStorage.setItem("tiny-worlds:flux-key", key);
    } else {
      localStorage.removeItem(KEY("flux-key"));
    }
  } catch {
    /* private browsing */
  }
}

function dessertPrompt(said) {
  const inside = packed();
  const names = [];
  const seen = new Set();
  for (const it of inside) {
    if (seen.has(it.kind)) continue;
    seen.add(it.kind);
    names.push(KINDS[it.kind].name.replace(/^the /, ""));
  }
  const filling = names.length ? names.slice(0, 8).join(", ") : "an empty cream tart, waiting";
  return [
    "Hand-drawn pastel dessert sticker, collectable bag-charm quality.",
    "Soft colored pencil and marker, sticker-flat line work, Y2K Japanese kawaii.",
    "Grape and blueberry purples against milk blue, cream paper, lilac.",
    `A cute plated tart or parfait made of: ${filling}.`,
    `Tiny shop stamp reading "${said.shop}".`,
    "No other text, no watermark, no logo, no UI.",
    "White margin like a die-cut charm, portrait collectable card.",
  ].join(" ");
}

/** Local fallback: their miniatures become toppings on a hand-drawn pastel tart. */
function drawDessertCard(said) {
  const c = document.getElementById("card");
  const k = c.getContext("2d");
  const CW = c.width;
  const CH = c.height;

  k.fillStyle = "#f7efe0";
  k.fillRect(0, 0, CW, CH);

  const paper = k.createLinearGradient(0, 40, 0, CH - 80);
  paper.addColorStop(0, "#dceeff");
  paper.addColorStop(0.45, "#f3e4ff");
  paper.addColorStop(1, "#ffe8d6");
  k.fillStyle = paper;
  k.beginPath();
  k.roundRect ? k.roundRect(28, 48, CW - 56, CH - 160, 28) : k.rect(28, 48, CW - 56, CH - 160);
  k.fill();

  let seed = 20260812 + packed().length * 17;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let i = 0; i < 18; i += 1) {
    const x = 50 + rnd() * (CW - 100);
    const y = 70 + rnd() * 220;
    const r = 2 + rnd() * 4;
    k.fillStyle = rnd() > 0.6 ? "#fff0bd" : "#ffffff";
    k.globalAlpha = 0.55;
    k.beginPath();
    k.moveTo(x, y - r);
    k.quadraticCurveTo(x, y, x + r, y);
    k.quadraticCurveTo(x, y, x, y + r);
    k.quadraticCurveTo(x, y, x - r, y);
    k.quadraticCurveTo(x, y, x, y - r);
    k.fill();
  }
  k.globalAlpha = 1;

  const cx = CW / 2;
  const cy = 390;
  k.fillStyle = "rgba(56, 71, 122, 0.12)";
  k.beginPath();
  k.ellipse(cx + 8, cy + 86, 168, 28, 0, 0, Math.PI * 2);
  k.fill();

  k.fillStyle = "#f4d9b0";
  k.strokeStyle = "#c9a57a";
  k.lineWidth = 3;
  k.beginPath();
  k.ellipse(cx, cy + 38, 170, 58, 0, 0, Math.PI * 2);
  k.fill();
  k.stroke();

  k.fillStyle = "#fff6ea";
  k.beginPath();
  k.ellipse(cx, cy + 18, 148, 46, 0, 0, Math.PI * 2);
  k.fill();

  k.fillStyle = "#e8d4f5";
  k.beginPath();
  k.ellipse(cx, cy - 8, 132, 78, 0, 0, Math.PI * 2);
  k.fill();
  k.strokeStyle = "rgba(111, 79, 176, 0.35)";
  k.lineWidth = 2;
  k.stroke();

  k.fillStyle = "#fff8f0";
  k.beginPath();
  k.ellipse(cx, cy - 36, 108, 36, 0, 0, Math.PI * 2);
  k.fill();

  const toppings = packed().filter((it, i, all) => all.findIndex((o) => o.kind === it.kind) === i).slice(0, 8);
  toppings.forEach((it, i) => {
    const n = Math.max(toppings.length, 1);
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const rad = 42 + (n > 4 ? 18 : 8);
    const img = ART.get(KINDS[it.kind].art);
    if (!img) return;
    const tw = Math.min(72, it.w * 1.15);
    const th = (tw * img.height) / img.width;
    k.save();
    k.translate(cx + Math.cos(ang) * rad, cy - 28 + Math.sin(ang) * rad * 0.55);
    k.rotate(ang * 0.15);
    k.drawImage(img, -tw / 2, -th / 2, tw, th);
    k.restore();
  });

  k.fillStyle = "#7a6aa8";
  k.font = "11px ui-monospace, Menlo, monospace";
  k.textAlign = "center";
  k.fillText("a dessert from this pouch", CW / 2, 92);

  k.fillStyle = "#38477a";
  k.font = "13px ui-monospace, Menlo, monospace";
  k.fillText("packed by", CW / 2, CH - 78);
  k.font = "20px ui-monospace, Menlo, monospace";
  k.fillText(said.shop, CW / 2, CH - 52);
}

function stampShop(k, CW, CH, said) {
  k.fillStyle = "rgba(247, 239, 224, 0.92)";
  k.fillRect(0, CH - 110, CW, 110);
  k.fillStyle = "#38477a";
  k.textAlign = "center";
  k.font = "13px ui-monospace, Menlo, monospace";
  k.fillText("packed by", CW / 2, CH - 68);
  k.font = "20px ui-monospace, Menlo, monospace";
  k.fillText(said.shop, CW / 2, CH - 42);
}

async function paintRemoteDessert(url, said) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("image fetch failed");
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob);
  const c = document.getElementById("card");
  const k = c.getContext("2d");
  k.drawImage(bmp, 0, 0, c.width, c.height);
  stampShop(k, c.width, c.height, said);
}

async function pollFlux(pollingUrl, key, id) {
  const started = Date.now();
  let delay = 800;
  while (Date.now() - started < 90000) {
    await new Promise((r) => setTimeout(r, delay));
    const url = pollingUrl || `https://api.bfl.ai/v1/get_result?id=${encodeURIComponent(id)}`;
    const res = await fetch(url, { headers: { accept: "application/json", "x-key": key } });
    if (!res.ok) throw new Error("poll failed");
    const data = await res.json();
    if (data.status === "Ready" && data.result && data.result.sample) return data.result.sample;
    if (data.status === "Error" || data.status === "Failed" || data.status === "Request Moderated") {
      throw new Error(data.error || data.status);
    }
    delay = Math.min(delay * 1.4, 4000);
  }
  throw new Error("timed out");
}

async function requestFlux(said) {
  const key = fluxKey();
  if (!key) return null;
  const body = JSON.stringify({
    prompt: dessertPrompt(said),
    width: 768,
    height: 1024,
    output_format: "png",
  });
  const headers = { accept: "application/json", "Content-Type": "application/json", "x-key": key };
  const posts = [
    "https://api.bfl.ai/v1/flux-schnell",
    "https://api.bfl.ai/v1/flux-2-klein-4b",
    "https://api.bfl.ai/v1/flux-pro-1.1",
  ];
  let lastErr = null;
  for (const url of posts) {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      if (res.status === 404) continue;
      if (!res.ok) {
        lastErr = new Error(`http ${res.status}`);
        continue;
      }
      const data = await res.json();
      const sample = await pollFlux(data.polling_url, key, data.id);
      return sample;
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
  return null;
}

async function turnIntoDessert() {
  if (dessertBusy || !lastSaid) return;
  dessertBusy = true;
  const btn = document.getElementById("dessert");
  const prev = btn.textContent;
  btn.textContent = "drawing…";
  btn.disabled = true;
  let usedStudio = false;
  try {
    const sample = await requestFlux(lastSaid);
    if (sample) {
      await paintRemoteDessert(sample, lastSaid);
      usedStudio = true;
    } else {
      drawDessertCard(lastSaid);
    }
  } catch {
    drawDessertCard(lastSaid);
  }
  cardKind = "dessert";
  btn.textContent = usedStudio ? "a dessert from the studio" : "a dessert, drawn here";
  btn.disabled = false;
  dessertBusy = false;
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
  if (it.gesture === "tap-twice" && lastTap.id === it.id && clock - lastTap.t < 450) it.primed = true;
  takeUp(it, p);
  stage.setPointerCapture(e.pointerId);
});

stage.addEventListener("pointermove", (e) => {
  const p = point(e);
  handAt(p.x, p.y, clock);
  if (!held) return;
  held.x = Math.max(20, Math.min(W - 20, p.x + grab.x));
  held.y = Math.max(20, Math.min(H - 20, p.y + grab.y));
  Carry.move(p, clock);
});

for (const kind of ["pointerup", "pointercancel"]) stage.addEventListener(kind, putDown);

document.getElementById("charms").addEventListener("click", (e) => {
  const el = e.target.closest(".charm");
  if (el && !el.disabled) begin(el.dataset.pace);
});

document.getElementById("finish").addEventListener("click", closeZip);

document.getElementById("download").addEventListener("click", downloadCard);

document.getElementById("share").addEventListener("click", () => {
  shareCard();
});

document.getElementById("dessert").addEventListener("click", () => {
  turnIntoDessert();
});

document.getElementById("studio-open").addEventListener("click", () => {
  document.getElementById("studio-panel").hidden = false;
  document.getElementById("studio-open").hidden = true;
  const input = document.getElementById("flux-key");
  input.value = fluxKey();
  input.focus();
});

document.getElementById("studio-save").addEventListener("click", () => {
  saveFluxKey(document.getElementById("flux-key").value);
  document.getElementById("studio-panel").hidden = true;
  document.getElementById("studio-open").hidden = false;
  document.getElementById("studio-open").textContent = fluxKey() ? "studio key saved here" : "use a studio key";
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
