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
const STRAP = { x0: -30, y0: 152, x1: 930, y1: 18, band: 44 };
const strapY = (x) => STRAP.y0 + ((x - STRAP.x0) * (STRAP.y1 - STRAP.y0)) / (STRAP.x1 - STRAP.x0);

/** The pouch, and where its keyring sits inside its own artwork. */
const POUCH = { x: 515, y: 40, w: 340, h: 475, sway: 0 };
const RING = { dx: 85, dy: 28 };

const BUNNY_HOME = { x: 170, y: 75, w: 62 };

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
  mouth: { y: 0.1, x0: 0.2, x1: 0.8 },

  async load() {
    try {
      const res = await fetch("assets/pouch-inside.json");
      const data = await res.json();
      this.w = data.w;
      this.h = data.h;
      this.rows = data.rows;
      this.findMouth();
    } catch {
      /* no mask — the pouch becomes a plain box, and nothing else changes */
    }
  },

  /** The top of the interior, which is where the zip is and where things are dropped in. */
  findMouth() {
    for (let j = 0; j < this.h; j += 1) {
      const first = this.rows[j].indexOf("1");
      if (first < 0) continue;
      this.mouth = {
        y: (j + 1) / this.h,
        x0: first / this.w,
        x1: (this.rows[j].lastIndexOf("1") + 1) / this.w,
      };
      return;
    }
  },

  /** Is this point in the world inside the vinyl? */
  holds(x, y) {
    const fx = (x - POUCH.x - POUCH.sway) / POUCH.w;
    const fy = (y - POUCH.y) / POUCH.h;
    if (fx < 0 || fx >= 1 || fy < 0 || fy >= 1) return false;
    if (!this.rows) return fx > 0.14 && fx < 0.86 && fy > 0.2 && fy < 0.94;
    return this.rows[(fy * this.h) | 0][(fx * this.w) | 0] === "1";
  },

  /** A point that is definitely inside, in world space, for the hints to aim at. */
  centre() {
    return { x: POUCH.x + POUCH.sway + POUCH.w * 0.5, y: POUCH.y + POUCH.h * 0.55 };
  },
};

/* ---------- the things in it ---------- */

let items = [];
let seq = 0;

function makeItem(kind, x, y, rot, extra = {}) {
  const K = KINDS[kind];
  const img = ART.get(K.art);
  const w = K.w;
  return {
    id: (seq += 1),
    kind,
    family: K.family,
    x,
    y,
    w,
    h: img ? (w * img.height) / img.width : w,
    rot,
    inside: false,
    fade: 0,
    faded: false,
    copy: false,
    kept: false,
    ...extra,
  };
}

function spill() {
  items = SPILL.map(([kind, x, y, rot]) => makeItem(kind, x, y, rot));
  items.push(makeItem("bunny", BUNNY_HOME.x, BUNNY_HOME.y, 0));
}

const bunny = () => items.find((it) => it.kind === "bunny");

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
    g.fillStyle = "rgba(111, 79, 176, 0.45)";
    g.beginPath();
    g.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

function drawStrap() {
  const lift = Math.sin(clock * 0.0011) * 2 * (0.35 + weather.tempo);

  g.save();
  g.translate(0, lift);
  g.lineCap = "butt";

  g.strokeStyle = "#33417c";
  g.lineWidth = STRAP.band;
  g.beginPath();
  g.moveTo(STRAP.x0, STRAP.y0);
  g.lineTo(STRAP.x1, STRAP.y1);
  g.stroke();

  // Two rows of stitching, so the band reads as webbing rather than as a bar.
  g.strokeStyle = "rgba(197, 214, 255, 0.55)";
  g.lineWidth = 1.5;
  g.setLineDash([7, 6]);
  for (const off of [-13, 13]) {
    g.beginPath();
    g.moveTo(STRAP.x0, STRAP.y0 + off);
    g.lineTo(STRAP.x1, STRAP.y1 + off);
    g.stroke();
  }
  g.setLineDash([]);
  g.restore();
}

function drawItem(it) {
  const alpha = 1 - it.fade * 0.62;
  paste(KINDS[it.kind].art, it.x, it.y, it.w, it.h, it.rot, alpha);
}

function render() {
  g.clearRect(0, 0, W, H);
  drawStrap();

  const held = items.filter((it) => it.held);
  for (const it of items) if (it.inside && !it.held) drawItem(it);
  paste("pouch", POUCH.x + POUCH.sway + POUCH.w / 2, POUCH.y + POUCH.h / 2, POUCH.w, POUCH.h);
  for (const it of items) if (!it.inside && !it.held) drawItem(it);
  for (const it of held) drawItem(it);
}

/* ---------- the weather, for now only a clock ---------- */

const weather = { tempo: 0 };
let clock = 0;

function frame(now) {
  clock = now;
  POUCH.sway = Math.sin(now * 0.0011) * 7 * (0.25 + weather.tempo);
  render();
  requestAnimationFrame(frame);
}

/* ============================== ENGINE ============================== */

const KEY = (k) => `tiny-worlds:${CONFIG.slug}:${k}`;

/** The world speaking. Not a tooltip: it fades, and it does not wait to be dismissed. */
let whisperTimer;
function whisper(text) {
  const el = document.getElementById("whisper");
  el.textContent = text;
  el.classList.add("showing");
  clearTimeout(whisperTimer);
  whisperTimer = setTimeout(() => el.classList.remove("showing"), 2600);
}

/* ---------- wiring ---------- */

document.getElementById("quest").textContent = CONFIG.quest;
document.title = CONFIG.title;

window.addEventListener("resize", fit);

Promise.all([ART.load(), Inside.load()]).then(() => {
  const img = ART.get("pouch");
  if (img) POUCH.h = (POUCH.w * img.height) / img.width;
  POUCH.x = 600 - RING.dx;
  POUCH.y = strapY(600) + 4 - RING.dy;
  spill();
  fit();
  requestAnimationFrame(frame);
});
