/* The Fitting Room.
 *
 * Everything above the ENGINE line is this world. Below it is the scaffolding every
 * game in this repo shares: traces, the shy idle hints, the reveal, the take-home card.
 */

const CONFIG = {
  slug: "the-fitting-room",
  title: "The Fitting Room",
  quest: "get dressed for somewhere you haven't been yet",
  settled: "you can stay in here as long as you like",
};

/* ============================== WORLD ============================== */

const GRID = {
  mirror: { w: 72, h: 96, s: 4 },
  cubicle: { w: 120, h: 140, s: 3 },
  sprite: { w: 22, h: 30, s: 2 },
};

/** A garment is a silhouette, a palette, an era, and the room it used to fit. */
const GARMENTS = {
  pinafore: {
    label: "the pinafore",
    era: "old",
    room: "bedroom",
    body: "#5d6f96",
    shade: "#3f4d6d",
    light: "#8798b8",
    cut: { top: 7, len: 20, w0: 10, w1: 15, straps: true },
  },
  party: {
    label: "the party dress",
    era: "old",
    room: "kitchen",
    body: "#8a5d80",
    shade: "#5f3d59",
    light: "#b083a4",
    cut: { top: 7, len: 22, w0: 9, w1: 20, ease: true },
  },
  blazer: {
    label: "the blazer",
    era: "old",
    room: "office",
    body: "#5b6660",
    shade: "#3d4642",
    light: "#828d86",
    cut: { top: 6, len: 15, w0: 14, w1: 14, sleeve: 2, open: true },
  },
  shift: {
    label: "the linen shift",
    era: "new",
    room: "flat",
    body: "#c9bda6",
    shade: "#9c9280",
    light: "#e6dcc6",
    cut: { top: 6, len: 19, w0: 12, w1: 14, sleeve: 1 },
  },
  coat: {
    label: "the long coat",
    era: "new",
    room: "hotel",
    body: "#b98f63",
    shade: "#8a6846",
    light: "#d8b189",
    cut: { top: 5, len: 24, w0: 15, w1: 17, sleeve: 2, open: true },
  },
  slip: {
    label: "the silk slip",
    era: "new",
    room: "wrapped",
    body: "#aab2b8",
    shade: "#7d858c",
    light: "#d2d8dc",
    cut: { top: 7, len: 21, w0: 8, w1: 11, straps: true },
  },
};

const RAIL = ["pinafore", "shift", "party", "blazer", "coat", "slip"];

/** Old rooms are furnished and warm. New rooms are places nobody has lived in yet. */
const ROOMS = {
  bedroom: {
    name: "a bedroom with a bed too small for you now",
    wall: "#493653",
    floor: "#523640",
    light: "#ffd08a",
    signature: { w: 16, h: 12, c: "#7a5a3c" },
    objects: [
      { x: 1, y: 14, w: 9, h: 48, c: "#3a2b44" },
      { x: 2, y: 22, w: 7, h: 15, c: "#9c7fb5" },
      { x: 2, y: 37, w: 7, h: 3, c: "#cbb3dd" }, // a hem under a hem
      { x: 12, y: 44, w: 28, h: 18, c: "#8a5f56" },
      { x: 12, y: 41, w: 28, h: 4, c: "#c9b39a" },
      { x: 15, y: 37, w: 11, h: 5, c: "#e8dcc8" },
      { x: 46, y: 16, w: 20, h: 22, c: "#2b3a52" },
      { x: 55, y: 16, w: 2, h: 22, c: "#8a7f92" },
      { x: 46, y: 26, w: 20, h: 2, c: "#8a7f92" },
      { x: 43, y: 47, w: 18, h: 3, c: "#93714f" },
      { x: 44, y: 50, w: 16, h: 12, c: "#7a5a3c" },
    ],
  },
  kitchen: {
    name: "someone's kitchen at two in the morning",
    wall: "#3d3a2e",
    floor: "#55483a",
    light: "#ffdca0",
    signature: { w: 4, h: 10, c: "#a8887f" },
    objects: [
      { x: 0, y: 12, w: 72, h: 1, c: "#4a4438" },
      { x: 8, y: 13, w: 3, h: 3, c: "#ffd98a" },
      { x: 22, y: 13, w: 3, h: 3, c: "#ffd98a" },
      { x: 36, y: 13, w: 3, h: 3, c: "#ffd98a" },
      { x: 50, y: 13, w: 3, h: 3, c: "#ffd98a" },
      { x: 64, y: 13, w: 3, h: 3, c: "#ffd98a" },
      { x: 4, y: 46, w: 50, h: 4, c: "#b9a184" },
      { x: 4, y: 50, w: 50, h: 12, c: "#6d5a44" },
      { x: 10, y: 38, w: 4, h: 8, c: "#7fa88a" },
      { x: 16, y: 36, w: 4, h: 10, c: "#a8887f" },
      { x: 22, y: 39, w: 3, h: 7, c: "#8a9fb5" },
      { x: 58, y: 52, w: 10, h: 3, c: "#8a7259" },
      { x: 59, y: 55, w: 2, h: 7, c: "#6d5a44" },
      { x: 65, y: 55, w: 2, h: 7, c: "#6d5a44" },
    ],
  },
  office: {
    name: "an office where you were early every day",
    wall: "#33384a",
    floor: "#3e4252",
    light: "#cfe0ea",
    signature: { w: 10, h: 14, c: "#2e3240" },
    objects: [
      { x: 14, y: 8, w: 44, h: 3, c: "#e8f2f7" },
      { x: 8, y: 44, w: 44, h: 4, c: "#8a8272" },
      { x: 10, y: 48, w: 40, h: 14, c: "#5c5648" },
      { x: 20, y: 30, w: 20, h: 14, c: "#22252e" },
      { x: 28, y: 44, w: 4, h: 2, c: "#4a4e58" },
      { x: 54, y: 38, w: 10, h: 14, c: "#2e3240" },
      { x: 52, y: 52, w: 14, h: 4, c: "#3a3f4e" },
    ],
  },
  flat: {
    name: "a flat with the light still bare",
    wall: "#2a2c34",
    floor: "#3a3a40",
    light: "#b9c4cc",
    signature: { w: 14, h: 12, c: "#7a6a52" },
    objects: [
      { x: 36, y: 6, w: 1, h: 12, c: "#4a4e56" },
      { x: 34, y: 18, w: 5, h: 5, c: "#fff4d8" },
      { x: 26, y: 50, w: 14, h: 12, c: "#7a6a52" },
      { x: 26, y: 55, w: 14, h: 2, c: "#a89670" },
    ],
  },
  hotel: {
    name: "a hotel room exactly like every hotel room",
    wall: "#2f2a33",
    floor: "#453b3e",
    light: "#d8c9b5",
    signature: { w: 12, h: 8, c: "#e0d2b8" },
    objects: [
      { x: 22, y: 20, w: 16, h: 12, c: "#3d363c" },
      { x: 24, y: 22, w: 12, h: 8, c: "#4a424a" },
      { x: 12, y: 46, w: 34, h: 16, c: "#5a4e52" },
      { x: 12, y: 43, w: 34, h: 4, c: "#cfc4bb" },
      { x: 52, y: 52, w: 4, h: 10, c: "#6a5f5a" },
      { x: 48, y: 44, w: 12, h: 8, c: "#e0d2b8" },
    ],
  },
  wrapped: {
    name: "a room with the furniture still under sheets",
    wall: "#2c2f31",
    floor: "#3c3f41",
    light: "#c8d2d4",
    signature: { w: 12, h: 10, c: "#b2b6b1" },
    objects: [
      { x: 8, y: 42, w: 22, h: 20, c: "#c6c9c4" },
      { x: 8, y: 52, w: 22, h: 2, c: "#a8ada8" },
      { x: 36, y: 48, w: 16, h: 14, c: "#bcc0bb" },
      { x: 54, y: 52, w: 12, h: 10, c: "#b2b6b1" },
    ],
  },
};

/* ---------- pixels ---------- */

const penFor = (g, s) => (x, y, w, h, c) => {
  g.fillStyle = c;
  g.fillRect(Math.round(x * s), Math.round(y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
};

function mix(a, b, t) {
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const to = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${to(r1 + (r2 - r1) * t)}${to(g1 + (g2 - g1) * t)}${to(b1 + (b2 - b1) * t)}`;
}

/** A garment, drawn from its cut. Rows narrow or flare; the right side sits in shadow. */
function drawGarment(g, id, ox, topY, s, { creases = true } = {}) {
  const G = GARMENTS[id];
  const c = G.cut;
  const pen = penFor(g, s);
  const centre = ox + GRID.sprite.w / 2;

  if (c.straps) {
    pen(centre - 4, topY - 4, 2, 4, G.shade);
    pen(centre + 2, topY - 4, 2, 4, G.shade);
  }

  if (c.sleeve) {
    const len = c.sleeve === 2 ? 12 : 5;
    const x0 = centre - c.w0 / 2;
    for (let r = 0; r < len; r++) {
      pen(x0 - 3, topY + r, 3, 1, r < 2 ? G.body : G.shade);
      pen(x0 + c.w0, topY + r, 3, 1, G.shade);
    }
  }

  for (let r = 0; r < c.len; r++) {
    const t = c.len === 1 ? 0 : r / (c.len - 1);
    const w = Math.round(c.w0 + (c.w1 - c.w0) * (c.ease ? t * t : t));
    const x = centre - w / 2;
    const y = topY + r;
    pen(x, y, w, 1, G.body);
    pen(x + w - 2, y, 2, 1, G.shade);
    pen(x, y, 1, 1, G.light);
    if (c.open && r > 1) pen(centre - 1, y, 2, 1, G.shade);
  }

  if (G.era === "old" && creases) {
    // Worn in. The creases are always in the same places.
    pen(centre - 3, topY + Math.round(c.len * 0.4), 4, 1, G.shade);
    pen(centre + 1, topY + Math.round(c.len * 0.62), 3, 1, G.shade);
    pen(centre - 4, topY + Math.round(c.len * 0.8), 3, 1, G.shade);
  }

  if (G.era === "new") {
    // The tag is still on it.
    pen(centre + c.w0 / 2 - 1, topY + 1, 3, 4, "#f6f2e8");
    pen(centre + c.w0 / 2, topY + 2, 1, 1, "#8d8798");
  }
}

/** The body, and whatever is on it. Two layers at most, the inner one peeking. */
function drawBody(g, ox, oy, s, layers) {
  const pen = penFor(g, s);
  const skin = "#c4a897";
  const dim = "#a2887a";

  pen(ox + 9, oy, 6, 6, skin);
  pen(ox + 13, oy + 1, 2, 4, dim);
  pen(ox + 11, oy + 6, 2, 2, dim);
  pen(ox + 8, oy + 8, 8, 13, skin);
  pen(ox + 6, oy + 9, 2, 11, dim);
  pen(ox + 16, oy + 9, 2, 11, dim);
  pen(ox + 9, oy + 21, 2, 15, skin);
  pen(ox + 13, oy + 21, 2, 15, skin);
  pen(ox + 8, oy + 36, 4, 2, dim);
  pen(ox + 12, oy + 36, 4, 2, dim);

  const gox = ox + (24 - GRID.sprite.w) / 2;
  if (layers.length === 2) drawGarment(g, layers[0], gox, oy + 9, s);
  if (layers.length) drawGarment(g, layers[layers.length - 1], gox, oy + 7, s);

  // A hem under a hem. Whichever garment is longer, the one underneath still shows.
  if (layers.length === 2) {
    const inner = GARMENTS[layers[0]];
    const outer = GARMENTS[layers[1]];
    const hemY = oy + 7 + outer.cut.len;
    const wide = Math.max(inner.cut.w1, 6);
    const pen2 = penFor(g, s);
    pen2(ox + 12 - wide / 2, hemY, wide, 3, inner.body);
    pen2(ox + 12 - wide / 2, hemY + 2, wide, 1, inner.shade);
  }
}

/** A room, seen through the mirror. */
function drawRoom(g, id, ox, oy, s, opts = {}) {
  const R = ROOMS[id];
  const pen = penFor(g, s);
  const { w, h } = GRID.mirror;

  pen(ox, oy, w, 62, R.wall);
  pen(ox, oy + 62, w, h - 62, R.floor);
  pen(ox, oy + 61, w, 1, mix(R.wall, "#000000", 0.35));

  for (const o of R.objects) {
    const x = opts.pushToWalls ? (o.x < 36 ? Math.max(1, o.x - 13) : Math.min(w - o.w - 1, o.x + 13)) : o.x;
    solid(pen, ox + x, oy + o.y, o.w, o.h, o.c);
  }

  if (opts.intruder) {
    const o = opts.intruder;
    solid(pen, ox + 30, oy + 62 - o.h, o.w, o.h, o.c);
  }

  daylight(g, ox, oy, w, h, s, R.light, R.era === "new" ? 0.07 : 0.14);
}

/** Objects need a lit top and a shadowed base or they sink into the floor. */
function solid(pen, x, y, w, h, c) {
  pen(x, y, w, h, c);
  if (h > 2) {
    pen(x, y, w, 1, mix(c, "#ffffff", 0.14));
    pen(x, y + h - 1, w, 1, mix(c, "#000000", 0.34));
  }
}

/** Light falls off. A hard-edged overlay reads as a horizon that isn't there. */
function daylight(g, ox, oy, w, h, s, colour, strength) {
  const grad = g.createLinearGradient(0, oy * s, 0, (oy + h) * s);
  grad.addColorStop(0, colour);
  grad.addColorStop(1, "transparent");
  g.globalAlpha = strength;
  g.fillStyle = grad;
  g.fillRect(ox * s, oy * s, w * s, h * s);
  g.globalAlpha = 1;
}

/** The secret: this cubicle, furnished out of the rooms you stayed in longest. */
function drawFurnishedCubicle(g, ox, oy, s) {
  const pen = penFor(g, s);
  const { w, h } = GRID.mirror;
  const warm = furnishings();

  let wall = "#3a3340";
  let floor = "#5c4340";
  for (const id of warm) {
    wall = mix(wall, ROOMS[id].wall, 0.38);
    floor = mix(floor, ROOMS[id].floor, 0.3);
  }

  pen(ox, oy, w, 62, wall);
  pen(ox, oy + 62, w, h - 62, floor);
  pen(ox, oy + 61, w, 1, mix(wall, "#000000", 0.4));

  // The cubicle turns out to have been a room all along.
  pen(ox + 2, oy + 6, 7, 56, "#4a3f52"); // the curtain, from this side
  pen(ox + 8, oy + 74, 56, 8, mix(floor, "#8a5a4e", 0.55)); // a rug, lying flat
  pen(ox + 8, oy + 74, 56, 1, mix(floor, "#c08a72", 0.4));
  solid(pen, ox + 20, oy + 14, 16, 12, "#6d5a44"); // something framed
  pen(ox + 22, oy + 16, 12, 8, mix(wall, "#ffd08a", 0.3));
  pen(ox + 63, oy + 8, 1, 12, "#6a5f5a"); // a lamp on a flex
  solid(pen, ox + 57, oy + 20, 12, 7, "#e8d2a8");

  // One object from each room you stayed in, standing on the floor as if it lives here.
  let cx = 6;
  for (const id of warm) {
    const o = ROOMS[id].signature;
    if (cx + o.w > w - 4) break;
    solid(pen, ox + cx, oy + 62 - o.h, o.w, o.h, o.c);
    cx += o.w + 4;
  }

  daylight(g, ox, oy, w, h, s, "#ffd08a", 0.22);
}

/** What the cubicle is furnished with: where you lingered, or failing that, where you went. */
function furnishings() {
  const lingered = lingeredRooms();
  if (lingered.length) return lingered;
  return [...seen].slice(-3);
}

/* ---------- the cubicle you are standing in ---------- */

function renderCubicle() {
  const canvas = document.getElementById("cubicle");
  const g = canvas.getContext("2d");
  const s = GRID.cubicle.s;
  const pen = penFor(g, s);
  const { w, h } = GRID.cubicle;
  const warm = lingeredRooms();

  let wall = "#322c3c";
  let floor = "#3d3640";
  for (const id of warm) {
    wall = mix(wall, ROOMS[id].wall, 0.34);
    floor = mix(floor, ROOMS[id].floor, 0.3);
  }

  g.clearRect(0, 0, canvas.width, canvas.height);
  pen(0, 0, w, 116, wall);
  pen(0, 116, w, h - 116, floor);
  pen(0, 115, w, 1, mix(wall, "#000000", 0.4));

  // Partition seams, so it reads as a cubicle rather than a room.
  pen(30, 0, 1, 116, mix(wall, "#000000", 0.3));
  pen(96, 0, 1, 116, mix(wall, "#000000", 0.3));

  // The curtain, and its rail.
  pen(0, 4, 28, 3, "#6b6472");
  for (let x = 0; x < 28; x += 4) {
    pen(x, 7, 3, 128, x % 8 === 0 ? "#4a3f52" : "#57495e");
  }
  pen(0, 7, 28, 2, "#3a3142");

  // A hook, and the bench nobody sits on.
  pen(72, 26, 5, 3, "#8d8798");
  pen(74, 29, 2, 3, "#8d8798");
  solid(pen, 84, 96, 32, 5, "#8a7259");
  pen(86, 101, 3, 14, "#6d5a44");
  pen(111, 101, 3, 14, "#6d5a44");

  // What the rooms left behind, accumulating against the far wall.
  let cx = 34;
  for (const id of warm) {
    const o = ROOMS[id].signature;
    if (cx + o.w > 82) break;
    solid(pen, cx, 116 - o.h, o.w, o.h, o.c);
    cx += o.w + 4;
  }

  drawBody(g, 48, 76, s, worn);

  // The fluorescent tube overhead cools everything until the rooms warm it.
  daylight(g, 0, 0, w, h, s, "#dceaf2", Math.max(0.04, 0.16 - warm.length * 0.035));
}

/* ---------- the mirror, which is always a beat late ---------- */

let worn = [];
let mirror = { mode: "empty" };
let mirrorTimer = null;
let showing = { room: null, since: 0 };
const dwell = {};
const seen = new Set();
const refused = {};
const wornCount = {};
const warmed = new Set(); // old garments that have been worn and stay warm
let nudging = false; // the circling detector has asked the rail to draw attention

function renderMirror() {
  const canvas = document.getElementById("mirror");
  const g = canvas.getContext("2d");
  const s = GRID.mirror.s;
  const { w, h } = GRID.mirror;

  g.clearRect(0, 0, canvas.width, canvas.height);

  if (mirror.mode === "empty") {
    const pen = penFor(g, s);
    pen(0, 0, w, h, "#211d29");
    pen(0, 62, w, h - 62, "#282331");
    pen(0, 61, w, 1, "#1a1721");
    daylight(g, 0, 0, w, h, s, "#7fa8c0", 0.1);
    return;
  }

  if (mirror.mode === "cubicle") return drawFurnishedCubicle(g, 0, 0, s);

  if (mirror.mode === "double") {
    drawRoom(g, mirror.a, 0, 0, s);
    g.globalAlpha = 0.55;
    drawRoom(g, mirror.b, 5, -3, s);
    g.globalAlpha = 1;
    return;
  }

  drawRoom(g, mirror.a, 0, 0, s, {
    pushToWalls: mirror.mode === "displaced",
    intruder: mirror.mode === "intruder" ? mirror.intruder : null,
  });
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
    const others = Object.keys(ROOMS).filter((r) => ROOMS[r].era !== "new" && r !== G.room);
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
    const unseen = Object.keys(ROOMS).filter((r) => !seen.has(r));
    const from = unseen[Math.floor(Math.random() * unseen.length)] ?? "wrapped";
    whisper("that wasn't in there before");
    showMirror({ mode: "intruder", a: outer.room, intruder: ROOMS[from].signature });
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

/** Take the outer layer off and hang it back — sometimes a different colour. */
function hangBack() {
  if (!worn.length) return whisper("you're not wearing anything yet");

  const id = worn.pop();
  const G = GARMENTS[id];
  Trace.act();

  if (Math.random() < 0.26) {
    const drift = ["#8a7fb5", "#7f9c8a", "#b58a7f", "#7f8fb5"][Math.floor(Math.random() * 4)];
    G.body = mix(G.body, drift, 0.4);
    G.shade = mix(G.shade, drift, 0.3);
    G.light = mix(G.light, drift, 0.25);
  }

  if (G.era === "old") warmed.add(id);
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

    const canvas = document.createElement("canvas");
    canvas.width = GRID.sprite.w * GRID.sprite.s;
    canvas.height = GRID.sprite.h * GRID.sprite.s;
    drawGarment(canvas.getContext("2d"), id, 0, G.cut.top, GRID.sprite.s);
    btn.appendChild(canvas);
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
  wash.addColorStop(0, "#2b2438");
  wash.addColorStop(1, "#14121b");
  g.fillStyle = wash;
  g.fillRect(0, 0, W, H);

  // The image is either the room you found, or the clothes you kept going back to.
  g.fillStyle = "#1b1824";
  g.fillRect(40, 36, W - 80, 300);

  if (Trace.state.secretFound) {
    drawFurnishedCubicle(g, 64, 14, 3);
  } else {
    const top = Object.entries(wornCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
    const picks = top.length ? top : RAIL.slice(0, 3);
    g.fillStyle = "#6b6472";
    g.fillRect(56, 58, W - 112, 5);
    picks.forEach((id, i) => drawGarment(g, id, 4 + i * 22, 8, 8));
  }

  g.textAlign = "center";
  g.fillStyle = "#f3ece2";
  g.font = "500 26px ui-monospace, Menlo, monospace";
  g.fillText(CONFIG.title, W / 2, 390);

  g.font = "15px ui-monospace, Menlo, monospace";
  traits.forEach(([name, line], i) => {
    g.fillStyle = "#ffd98a";
    g.fillText(name, W / 2, 442 + i * 52);
    g.fillStyle = "#9c9384";
    g.fillText(line, W / 2, 462 + i * 52);
  });

  g.fillStyle = "#f3ece2";
  g.font = "italic 15px ui-monospace, Menlo, monospace";
  wrap(g, `the room you kept reaching for looks like ${room}`, W / 2, 660, W - 90, 24);

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

for (const id of Object.keys(ROOMS)) {
  ROOMS[id].era = ["flat", "hotel", "wrapped"].includes(id) ? "new" : "old";
}

document.getElementById("quest").textContent = CONFIG.quest;
document.title = CONFIG.title;

paintRail();
renderCubicle();
renderMirror();

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

Hints.wake();
