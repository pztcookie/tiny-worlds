/* The Fitting Room.
 *
 * Everything above the ENGINE line is this world. Below it is the scaffolding every
 * game in this repo shares: traces, the shy idle hints, the reveal, the take-home card.
 *
 * The art is a set of static pixel-art PNGs in assets/, cut from one generated sheet by
 * scripts/slice_assets.py. Nothing is fetched from the network.
 */

const CONFIG = {
  slug: "the-fitting-room",
  title: "The Fitting Room",
  quest: "get dressed for somewhere you haven't been yet",
  settled: "you can stay in here as long as you like",
};

/* ============================== WORLD ============================== */

/** Canvas sizes match the artwork one to one, so nothing is resampled twice. */
const CUB = { w: 318, h: 420 };
const MIR = 384;

/** Where the body stands in the cubicle, and where clothes sit on it.
 *
 * The garment art is drawn flat, so it is wider relative to its length than the same
 * garment would be on a body. Width and height therefore scale differently: without
 * that, a blazer sized to hang correctly is wide enough to fall off her shoulders. */
const STANCE = { cx: 164, feet: 398, height: 272, shoulder: 194, scaleX: 0.6, scaleY: 0.78 };
const BENCH = { x: 248, y: 296 };

const GARMENTS = {
  pinafore: { label: "the pinafore", era: "old", room: "bedroom" },
  party: { label: "the party dress", era: "old", room: "kitchen" },
  blazer: { label: "the blazer", era: "old", room: "office" },
  shift: { label: "the linen shift", era: "new", room: "flat" },
  coat: { label: "the long coat", era: "new", room: "hotel" },
  slip: { label: "the silk slip", era: "new", room: "wrapped" },
};

const RAIL = ["pinafore", "shift", "party", "blazer", "coat", "slip"];

/** Old rooms are furnished and warm. New rooms are places nobody has lived in yet. */
const ROOMS = {
  bedroom: { name: "a bedroom with a bed too small for you now", era: "old", tint: "#e6b9c4" },
  kitchen: { name: "someone's kitchen at two in the morning", era: "old", tint: "#c9b391" },
  office: { name: "an office where you were early every day", era: "old", tint: "#a9c4c0" },
  flat: { name: "a flat with the light still bare", era: "new", tint: "#a9bce0" },
  hotel: { name: "a hotel room exactly like every hotel room", era: "new", tint: "#c4b8b0" },
  wrapped: { name: "a room with the furniture still under sheets", era: "new", tint: "#b8c4c8" },
};

/* ---------- the art ---------- */

const ART = {
  images: {},
  missing: new Set(),

  keys() {
    return ["figure", "cubicle", ...RAIL.map((id) => `garment-${id}`), ...Object.keys(ROOMS).map((id) => `room-${id}`), "room-furnished"];
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

/** A missing file should cost you that one picture, not the whole room. */
function placeholder(g, x, y, w, h, colour) {
  g.fillStyle = colour;
  g.fillRect(x, y, w, h);
}

function paste(g, key, x, y, w, h, fallback = "#5b4763") {
  const img = ART.get(key);
  if (!img) return placeholder(g, x, y, w, h, fallback);
  g.drawImage(img, x, y, w, h);
}

/* ---------- the cubicle you are standing in ---------- */

let worn = [];
const pile = []; // garments taken off, left on the bench
const hue = {}; // degrees of colour drift per garment
const refused = {};
const wornCount = {};
const warmed = new Set();
let nudging = false;

function garmentBox(id) {
  const img = ART.get(`garment-${id}`);
  const w = (img ? img.width : 100) * STANCE.scaleX;
  const h = (img ? img.height : 180) * STANCE.scaleY;
  return { w, h, x: STANCE.cx - w / 2, y: STANCE.shoulder };
}

function tinted(g, id, draw) {
  const deg = hue[id] ?? 0;
  if (deg && "filter" in g) {
    g.filter = `hue-rotate(${deg}deg)`;
    draw();
    g.filter = "none";
  } else {
    draw();
  }
}

function drawWorn(g) {
  if (!worn.length) return;

  const outer = worn[worn.length - 1];
  const outerBox = garmentBox(outer);

  // The one underneath sits a little lower, so it reads as a second layer.
  if (worn.length === 2) {
    const inner = worn[0];
    const box = garmentBox(inner);
    tinted(g, inner, () => paste(g, `garment-${inner}`, box.x, box.y + 5, box.w, box.h));
  }

  tinted(g, outer, () => paste(g, `garment-${outer}`, outerBox.x, outerBox.y, outerBox.w, outerBox.h));

  // A hem under a hem: whichever is longer, the garment underneath still shows below.
  if (worn.length === 2) {
    const inner = worn[0];
    const img = ART.get(`garment-${inner}`);
    const box = garmentBox(inner);
    const bottom = outerBox.y + outerBox.h;
    if (img && bottom > box.y + box.h - 10) {
      const strip = 16;
      tinted(g, inner, () =>
        g.drawImage(img, 0, img.height - strip, img.width, strip, box.x, bottom - 4, box.w, strip * STANCE.scaleY),
      );
    }
  }
}

/** TRANSFORMATION — what you take off stays in the room with you. */
function drawPile(g) {
  pile.slice(-4).forEach((id, i) => {
    const img = ART.get(`garment-${id}`);
    if (!img) return;
    const h = img.height * 0.3;
    const w = img.width * 0.3;
    tinted(g, id, () => g.drawImage(img, BENCH.x - w * 0.1 + i * 6, BENCH.y - i * 5, w, h));
  });
}

function renderCubicle() {
  const canvas = document.getElementById("cubicle");
  const g = canvas.getContext("2d");
  const warm = lingeredRooms();

  g.clearRect(0, 0, CUB.w, CUB.h);
  paste(g, "cubicle", 0, 0, CUB.w, CUB.h, "#4a3f52");
  drawPile(g);

  const fig = ART.get("figure");
  const fw = fig ? fig.width * (STANCE.height / fig.height) : 96;
  paste(g, "figure", STANCE.cx - fw / 2, STANCE.feet - STANCE.height, fw, STANCE.height, "#c4a897");
  drawWorn(g);

  // The rooms you stayed in warm the light in here, without moving anything into it.
  if (warm.length) {
    g.globalAlpha = Math.min(0.3, 0.1 * warm.length);
    g.fillStyle = ROOMS[warm[0]].tint;
    g.fillRect(0, 0, CUB.w, CUB.h);
    g.globalAlpha = 1;
  }
}

/* ---------- the mirror, which is always a beat late ---------- */

let mirror = { mode: "empty" };
let mirrorTimer = null;
let showing = { room: null, since: 0 };
const dwell = {};
const seen = new Set();

function renderMirror() {
  const canvas = document.getElementById("mirror");
  const g = canvas.getContext("2d");

  g.clearRect(0, 0, MIR, MIR);

  if (mirror.mode === "empty") {
    const wash = g.createLinearGradient(0, 0, 0, MIR);
    wash.addColorStop(0, "#4d4058");
    wash.addColorStop(1, "#332b3c");
    g.fillStyle = wash;
    g.fillRect(0, 0, MIR, MIR);
    // A diagonal sheen, so unused glass reads as glass and not as a hole.
    const sheen = g.createLinearGradient(0, MIR, MIR, 0);
    sheen.addColorStop(0.34, "transparent");
    sheen.addColorStop(0.5, "rgba(255,246,234,0.09)");
    sheen.addColorStop(0.66, "transparent");
    g.fillStyle = sheen;
    g.fillRect(0, 0, MIR, MIR);
    return;
  }

  if (mirror.mode === "cubicle") return paste(g, "room-furnished", 0, 0, MIR, MIR);

  if (mirror.mode === "double") {
    paste(g, `room-${mirror.a}`, 0, 0, MIR, MIR);
    g.globalAlpha = 0.55;
    paste(g, `room-${mirror.b}`, 26, -16, MIR, MIR);
    g.globalAlpha = 1;
    return;
  }

  if (mirror.mode === "displaced") {
    const img = ART.get(`room-${mirror.a}`);
    if (!img) return placeholder(g, 0, 0, MIR, MIR, "#43384c");
    const shove = 30;
    const half = img.width / 2;
    // Stretch the left edge across the middle so the gap still has wall above floor,
    // then slide both halves outward — everything ends up against the walls.
    g.drawImage(img, 0, 0, 4, img.height, 0, 0, MIR, MIR);
    g.drawImage(img, 0, 0, half, img.height, -shove, 0, MIR / 2, MIR);
    g.drawImage(img, half, 0, half, img.height, MIR / 2 + shove, 0, MIR / 2, MIR);
    return;
  }

  paste(g, `room-${mirror.a}`, 0, 0, MIR, MIR);

  // One thing in the room that was never in it.
  if (mirror.mode === "intruder" && mirror.intruder) {
    const img = ART.get(`garment-${mirror.intruder}`);
    if (img) {
      const h = MIR * 0.34;
      const w = img.width * (h / img.height);
      g.drawImage(img, MIR * 0.62, MIR - h - 24, w, h);
    }
  }
}

/** Nothing in this mirror is prompt, except once. */
function showMirror(next, { instant = false } = {}) {
  clearTimeout(mirrorTimer);
  const el = document.getElementById("mirror");

  const settle = () => {
    if (showing.room) dwell[showing.room] = (dwell[showing.room] ?? 0) + (performance.now() - showing.since);
    mirror = next;
    showing = { room: next.a ?? null, since: performance.now() };
    if (next.a) seen.add(next.a);
    renderMirror();
    renderCubicle();
  };

  if (instant) {
    el.classList.remove("settling");
    el.classList.add("insync");
    settle();
    return;
  }

  el.classList.remove("insync");
  el.classList.add("settling");
  mirrorTimer = setTimeout(() => {
    settle();
    el.classList.remove("settling");
  }, 620 + Math.random() * 360);
}

function lingeredRooms() {
  return Object.entries(dwell)
    .filter(([, ms]) => ms > 5500)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id]) => id);
}

/* ---------- PLAY — take a garment down, wear it, read the mirror ---------- */

function take(id, { fromMischief = false } = {}) {
  if (worn.includes(id)) return whisper("you're already in it");
  if (worn.length >= 2) return whisper("two is all that will fit");

  // PERSONALITY — sometimes it simply won't go.
  if (!fromMischief && !refused[id] && Math.random() < 0.14) {
    refused[id] = true;
    return whisper(`${GARMENTS[id].label} won't go — the sleeve, or the shoulder`);
  }

  worn.push(id);
  wornCount[id] = (wornCount[id] ?? 0) + 1;
  Trace.wore(id);

  const layered = worn.length === 2;
  if (layered) {
    Trace.state.layerAttempts += 1;
    nudging = false; // they found it on their own; stop pointing
  }
  paintRail();

  if (layered) readPairing();
  else showMirror({ mode: "single", a: roomFor(id) });

  renderCubicle();
  settleRoom();
  circling();
}

/** PERSONALITY — an old garment does not always remember the same room. */
function roomFor(id) {
  const G = GARMENTS[id];
  if (G.era === "old" && Math.random() < 0.22) {
    const others = Object.keys(ROOMS).filter((r) => ROOMS[r].era === "old" && r !== G.room);
    const pick = others[Math.floor(Math.random() * others.length)];
    if (pick) {
      whisper("you remember it somewhere else");
      return pick;
    }
  }
  return G.room;
}

/** MYSTERY — four pairings, one of them the secret. Order is the whole trick. */
function readPairing() {
  const [inner, outer] = worn.map((id) => GARMENTS[id]);

  if (inner.era === "old" && outer.era === "new") {
    if (!Trace.state.secretFound) {
      Trace.state.secretFound = true;
      Trace.save();
      Hints.retire("layer");
      Hints.retire("secret");
      document.getElementById("quest").textContent = CONFIG.settled;
      document.getElementById("quest").classList.add("softened");
    }
    whisper("oh — this one's furnished");
    showMirror({ mode: "cubicle" }, { instant: true });
    return;
  }

  if (inner.era === "new" && outer.era === "old") {
    const unworn = RAIL.filter((id) => !wornCount[id]);
    const strange = unworn[Math.floor(Math.random() * unworn.length)] ?? "slip";
    whisper("that wasn't in there before");
    showMirror({ mode: "intruder", a: outer.room, intruder: strange });
    return;
  }

  if (inner.era === "new" && outer.era === "new") {
    whisper("both at once. neither of them settles.");
    showMirror({ mode: "double", a: inner.room, b: outer.room });
    return;
  }

  whisper("everything's against the walls");
  showMirror({ mode: "displaced", a: outer.room });
}

/** Take the outer layer off. It stays in the room, on the bench. */
function hangBack() {
  if (!worn.length) return whisper("you're not wearing anything yet");

  const id = worn.pop();
  const G = GARMENTS[id];
  Trace.act();

  if (Math.random() < 0.26) hue[id] = ((hue[id] ?? 0) + 20 + Math.random() * 50) % 360;
  if (G.era === "old") warmed.add(id);
  pile.push(id);
  paintRail();

  if (worn.length === 1) showMirror({ mode: "single", a: roomFor(worn[0]) });
  else showMirror({ mode: "empty" });

  renderCubicle();
  settleRoom();
}

/** Lean in. The room says what it is, and that is all it says. */
function peer() {
  Trace.act();
  if (mirror.mode === "empty") return whisper("just the cubicle, waiting");
  if (mirror.mode === "cubicle") return whisper("this one. the one you're in.");
  whisper(ROOMS[mirror.a].name);
  settleRoom();
}

/* ---------- the circling detector ---------- */

/** Busy is not the same as unstuck. Hints only fire on idle, so watch for circling too. */
function circling() {
  if (Trace.state.secretFound || Trace.state.layerAttempts > 0) return;
  if (Trace.state.garmentsWorn < 4) return;

  nudging = true;
  paintRail();
  Hints.offer();
}

/* ---------- TRANSFORMATION ---------- */

function settleRoom() {
  const warmth = Math.min(1, Trace.acts / 22);
  document.documentElement.style.setProperty("--warmth", warmth.toFixed(3));
  renderCubicle();
  if (Trace.acts >= 8) document.getElementById("finish").hidden = false;
}

/* ---------- REFLECTION — what you did, never who you are ---------- */

function reflect() {
  const s = Trace.state;
  const traits = [];

  if (s.secretFound) traits.push(["Threshold Keeper", "you wore the old one underneath"]);
  if (s.layerAttempts >= 4) traits.push(["Layerer", "you kept putting one thing over another"]);
  if (Math.max(0, ...Object.values(wornCount)) >= 3) traits.push(["Returner", "you went back to the same garment three times"]);
  if (Math.max(0, ...Object.values(dwell)) > 12000) traits.push(["Room Sitter", "you stayed in one reflection longer than the rest"]);
  if (s.oldNewRatio > 1.5) traits.push(["Keeper", "you reached for the faded ones"]);
  if (s.oldNewRatio > 0 && s.oldNewRatio < 0.7) traits.push(["Tag Keeper", "you reached for the ones you hadn't worn yet"]);
  if (Trace._medianGap && Trace._medianGap < 900) traits.push(["Quick Changer", "you changed before the mirror had caught up"]);
  if (!traits.length) traits.push(["Visitor", "you tried a few things on and let the rail be"]);

  const rooms = {
    "Threshold Keeper": "a fitting room you furnished and stayed in",
    Layerer: "two coats on one hook",
    Returner: "one dress worn three nights running",
    "Room Sitter": "a chair pulled up to a mirror",
    Keeper: "a wardrobe that still smells of somewhere else",
    "Tag Keeper": "a rail of things with the tags still on",
    "Quick Changer": "a pile by the door, still warm",
    Visitor: "a curtain left half open",
  };

  const top = traits.slice(0, 3);
  return { traits: top, room: rooms[top[0][0]] };
}

/* ---------- the rail ---------- */

function paintRail() {
  const rail = document.getElementById("rail");
  rail.innerHTML = "";

  RAIL.forEach((id, i) => {
    const G = GARMENTS[id];
    const btn = document.createElement("button");
    btn.className = "garment";
    // The second hanger is holding two.
    if (i === 0) btn.classList.add("pair-lead");
    if (i === 1) btn.classList.add("paired");
    // Cues survive the rail being repainted, because they live in state, not the DOM.
    if (warmed.has(id) && !worn.includes(id)) btn.classList.add("warm");
    if (nudging && i < 2) btn.classList.add("forward");
    btn.dataset.id = id;
    btn.dataset.era = G.era;
    btn.dataset.worn = worn.includes(id);
    btn.setAttribute("aria-label", G.label);

    const img = document.createElement("img");
    img.src = `assets/garment-${id}.png`;
    img.alt = "";
    if (hue[id]) img.style.filter = `hue-rotate(${hue[id]}deg)`;
    btn.appendChild(img);
    rail.appendChild(btn);
  });
}

/* ============================== ENGINE ==============================
 * Below here is reusable. Adjust the copy, keep the shape.
 */

const KEY = (k) => `tiny-worlds:${CONFIG.slug}:${k}`;

/** TRACE — five pieces of behavioural state. Resist adding a sixth. */
const Trace = {
  state: {
    garmentsWorn: 0,
    longestLinger: null,
    oldNewRatio: 0,
    layerAttempts: 0,
    secretFound: false,
  },
  acts: 0,
  _seen: new Set(),
  _old: 0,
  _new: 0,
  _gaps: [],
  _last: 0,
  _medianGap: 0,

  wore(id) {
    const now = performance.now();
    if (this._last) this._gaps.push(now - this._last);
    this._last = now;

    this._seen.add(id);
    this.state.garmentsWorn = this._seen.size;
    GARMENTS[id].era === "old" ? (this._old += 1) : (this._new += 1);
    this.state.oldNewRatio = this._new ? +(this._old / this._new).toFixed(2) : this._old;

    const sorted = [...this._gaps].sort((a, b) => a - b);
    this._medianGap = Math.round(sorted[sorted.length >> 1] ?? 0);

    this.act();
  },

  act() {
    this.acts += 1;
    const top = Object.entries(dwell).sort((a, b) => b[1] - a[1])[0];
    this.state.longestLinger = top ? top[0] : null;
    Hints.wake();
    this.save();
  },

  save() {
    try {
      localStorage.setItem(KEY("trace"), JSON.stringify(this.state));
    } catch {
      /* private browsing — the room simply forgets */
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
 * HINTS — the world nudges when the player goes quiet, or when the circling detector
 * asks it to. It escalates only if ignored, retires each hint for good once the thing is
 * done, and is shy: move toward one and it darts away. Some lose their nerve unprompted.
 */
const Hints = {
  idleMs: 6500,
  _timer: null,
  _retired: new Set(),
  _level: {},

  ladder: ["…", "the rail is holding six", "take one down. nothing bad happens."],

  candidates() {
    const out = [];

    if (!worn.length) {
      out.push({ id: "take", target: ".garment:not([data-worn='true'])" });
    }

    if (worn.length === 1 && !Trace.state.layerAttempts) {
      out.push({
        id: "layer",
        target: ".garment.paired",
        lines: ["…", "the hanger is holding two", "one of these goes underneath."],
      });
    }

    // Nothing else signposts that the outer layer comes off, and two is the ceiling.
    if (worn.length === 2) {
      out.push({
        id: "undress",
        target: "#body",
        lines: ["…", "the outer one is only resting there", "take the top one off — click yourself."],
      });
    }

    if (Trace.state.layerAttempts > 0 && !Trace.state.secretFound) {
      out.push({
        id: "secret",
        target: ".garment[data-era='old']",
        lines: ["…", "the faded one is still warm", "one of these goes underneath."],
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
    const lifeMs = cowardly ? 520 : 3400;

    const spook = (e) => {
      const d = Math.hypot(e.clientX - box.left - box.width / 2, e.clientY - box.top);
      if (d < 110) hint.classList.add("spooked");
    };
    window.addEventListener("mousemove", spook);

    setTimeout(() => {
      hint.classList.add("spooked");
      window.removeEventListener("mousemove", spook);
      setTimeout(() => hint.remove(), 400);
    }, lifeMs);

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

  const wash = g.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, "#5b4763");
  wash.addColorStop(1, "#2f2738");
  g.fillStyle = wash;
  g.fillRect(0, 0, W, H);

  // The image is either the room you found, or the clothes you kept going back to.
  g.fillStyle = "#2a2333";
  g.fillRect(40, 36, W - 80, 300);

  if (Trace.state.secretFound) {
    paste(g, "room-furnished", 150, 36, 300, 300);
  } else {
    const top = Object.entries(wornCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
    const picks = top.length ? top : RAIL.slice(0, 3);
    g.fillStyle = "#8a7a94";
    g.fillRect(56, 58, W - 112, 5);
    picks.forEach((id, i) => {
      const img = ART.get(`garment-${id}`);
      const h = 250;
      const w = img ? img.width * (h / img.height) : 120;
      const slot = (W - 112) / picks.length;
      paste(g, `garment-${id}`, 56 + slot * i + (slot - w) / 2, 62, w, h);
    });
  }

  g.textAlign = "center";
  g.fillStyle = "#fff6ea";
  g.font = "500 26px ui-monospace, Menlo, monospace";
  g.fillText(CONFIG.title, W / 2, 390);

  g.font = "15px ui-monospace, Menlo, monospace";
  traits.forEach(([name, line], i) => {
    g.fillStyle = "#ffd9a8";
    g.fillText(name, W / 2, 442 + i * 52);
    g.fillStyle = "#cbb6c8";
    g.fillText(line, W / 2, 462 + i * 52);
  });

  g.fillStyle = "#fff6ea";
  g.font = "italic 15px ui-monospace, Menlo, monospace";
  // Sits below however many traits there were, rather than leaving a hole under one.
  wrap(g, `the room you kept reaching for looks like ${room}`, W / 2, 500 + traits.length * 56, W - 90, 24);

  g.fillStyle = "#8a7a94";
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
  document.getElementById("reveal-body").textContent = `${traits[0][1]} — so the room you kept reaching for looks like ${room}.`;
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

document.getElementById("rail").addEventListener("click", (e) => {
  const el = e.target.closest(".garment");
  if (el) take(el.dataset.id);
});

document.getElementById("body").addEventListener("click", hangBack);
document.getElementById("peer").addEventListener("click", peer);
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

paintRail();
ART.load().then(() => {
  renderCubicle();
  renderMirror();
  Hints.wake();
});
