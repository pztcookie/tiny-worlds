(() => {
  "use strict";

  /* ---------------------------------------------------------------- data */

  const BREADS = [
    {
      id: "star-window",
      name: "Star Window",
      img: "assets/02-star-window-bread.png",
      kind: "bread",
      vibe: "curious",
      stock: 2,
      tags: ["bread", "night"],
      desc: "golden bread with star-shaped windows cut through the crust",
      whisper: "Little skies peek through the crust…",
    },
    {
      id: "spiral",
      name: "Impossible Spiral",
      img: "assets/03-impossible-spiral-bread.png",
      kind: "bread",
      vibe: "playful",
      stock: 2,
      tags: ["bread", "day"],
      desc: "an impossible spiral-twisted loaf",
      whisper: "It twists like a thought that won't stay linear.",
    },
    {
      id: "garden",
      name: "Garden Loaf",
      img: "assets/04-garden-bread.png",
      kind: "bread",
      vibe: "tender",
      stock: 2,
      tags: ["bread", "day"],
      desc: "a rustic loaf with tiny flowers and herbs growing from the crust",
      whisper: "Soft places wanting to grow something.",
    },
    {
      id: "pocket",
      name: "Secret Pocket",
      img: "assets/05-secret-pocket-bread.png",
      kind: "bread",
      vibe: "mysterious",
      stock: 2,
      tags: ["bread", "night"],
      desc: "a round loaf full of little hidden pockets and a small door",
      whisper: "Some pockets only open for the right key…",
    },
    {
      id: "constellation",
      name: "Constellation",
      img: "assets/06-constellation-bread.png",
      kind: "bread",
      vibe: "dreamy",
      stock: 2,
      tags: ["bread", "night"],
      desc: "a loaf with a starry night sky baked into the crust",
      whisper: "Night folded into dough. Bold.",
    },
  ];

  const PANTRY = [
    { id: "lettuce", name: "Lettuce", img: "assets/ingredients/lettuce.png", tags: ["earth", "soft"], stock: 3 },
    { id: "tomato", name: "Tomato", img: "assets/ingredients/tomato.png", tags: ["earth", "day"], stock: 3 },
    { id: "cucumber", name: "Cucumber", img: "assets/ingredients/cucumber.png", tags: ["earth", "cool"], stock: 3 },
    { id: "avocado", name: "Avocado", img: "assets/ingredients/avocado.png", tags: ["earth", "soft"], stock: 2 },
    { id: "onion", name: "Onion", img: "assets/ingredients/onion.png", tags: ["earth", "sharp"], stock: 2 },
    { id: "cabbage", name: "Cabbage", img: "assets/ingredients/cabbage.png", tags: ["earth", "sharp"], stock: 2 },
    { id: "nori", name: "Nori", img: "assets/ingredients/nori.png", tags: ["earth", "quiet"], stock: 2 },
    { id: "cheese", name: "Cheese", img: "assets/ingredients/cheese.png", tags: ["earth", "cozy"], stock: 3 },
    { id: "egg", name: "Fried Egg", img: "assets/ingredients/egg.png", tags: ["earth", "cozy"], stock: 2 },
    { id: "tofu", name: "Tofu", img: "assets/ingredients/tofu-fried.png", tags: ["earth", "quiet"], stock: 2 },
    { id: "pesto", name: "Pesto", img: "assets/ingredients/pesto.png", tags: ["soft", "day"], stock: 2 },
    { id: "hummus", name: "Hummus", img: "assets/ingredients/hummus.png", tags: ["soft", "cozy"], stock: 2 },
    { id: "galaxy", name: "Galaxy Sauce", img: "assets/ingredients/galaxy.png", tags: ["night", "magic"], stock: 2, magic: true },
    { id: "crystals", name: "Moon Crystals", img: "assets/ingredients/crystals.png", tags: ["night", "magic"], stock: 2, magic: true },
  ].map((i) => ({ ...i, kind: "pantry" }));

  const CURIOS = [
    {
      id: "jar",
      name: "World Jar",
      img: "assets/09-tiny-world-jar.png",
      tags: ["night", "magic", "curio"],
      stock: 1,
      kind: "curio",
      magic: true,
      line: "A whole tiny world settles between the layers. It keeps its weather.",
      promptBit: "a tiny glass jar holding a miniature starry world",
    },
    {
      id: "box",
      name: "Memory Box",
      img: "assets/07-tiny-memory-box.png",
      tags: ["soft", "magic", "curio"],
      stock: 1,
      kind: "curio",
      magic: true,
      line: "You tucked a memory in. The sandwich got heavier in a good way.",
      promptBit: "a small wooden keepsake box baked into the filling",
    },
    {
      id: "key",
      name: "Star Key",
      img: "assets/08-impossible-star-key.png",
      tags: ["night", "magic", "curio"],
      stock: 1,
      kind: "curio",
      magic: true,
      line: "The key melts into the crust. Something unlocks that wasn't a door.",
      promptBit: "a golden crescent-moon key melting into the crust",
    },
  ];

  const ALL = [...BREADS, ...PANTRY, ...CURIOS];
  const byId = (id) => ALL.find((i) => i.id === id);
  const MAX_LAYERS = 10;

  /* --------------------------------------------------------------- state */

  const state = {
    layers: [],
    stock: {},
    unlocked: { jar: false, box: false, key: false },
    // traces
    useCounts: {},
    undoCount: 0,
    clearCount: 0,
    pokeCount: 0,
    fallCount: 0,
    multiplyCount: 0,
    transformCount: 0,
    refuseCount: 0,
    bakeCount: 0,
    servedCount: 0,
    hotspots: new Set(),
    actionTimes: [],
    explorationLevel: 0,
    secretDiscovered: false,
    dayNightMix: 0,
    repeatStreak: 0,
    lastWhisper: "",
  };

  ALL.forEach((i) => (state.stock[i.id] = i.stock));

  /* ------------------------------------------------------------ elements */

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const els = {
    whisper: $("#cafe-whisper"),
    objectNote: $("#object-note"),
    breadTray: $("#bread-tray"),
    tray: $("#ingredient-tray"),
    curioTray: $("#curio-tray"),
    curioGroup: $("#curio-group"),
    layerCount: $("#layer-count"),
    board: $("#board"),
    boardEmpty: $("#board-empty"),
    canvas: $("#sandwich-canvas"),
    cafeScene: $("#cafe-scene"),
    sparkleLayer: $("#sparkle-layer"),
    hotJar: $("#hot-jar"),
    hotBox: $("#hot-box"),
    hotKey: $("#hot-key"),
    btnUndo: $("#btn-undo"),
    btnClear: $("#btn-clear"),
    btnServe: $("#btn-serve"),
    toast: $("#toast"),
    artifactImg: $("#artifact-img"),
    artifactTitle: $("#artifact-title"),
    artifactLayers: $("#artifact-layers"),
    artifactReflect: $("#artifact-reflect"),
    artifactSecret: $("#artifact-secret"),
    artifactTag: $("#artifact-tag"),
    traitRow: $("#trait-row"),
    innerWorld: $("#inner-world"),
    viewToggle: $("#view-toggle"),
    ovenNote: $("#oven-note"),
    blendLoading: $("#blend-loading"),
    btnBlend: $("#btn-blend"),
    btnDownload: $("#btn-download"),
  };

  const ctx = els.canvas.getContext("2d");
  let toastTimer = null;

  /* -------------------------------------------------------------- images */

  const imgCache = new Map();

  function getImage(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const img = new Image();
    img.src = src;
    img.addEventListener("load", requestPaint);
    imgCache.set(src, img);
    return img;
  }

  ALL.forEach((i) => getImage(i.img));

  /* -------------------------------------------------------------- canvas */

  const CW = 640;
  const CH = 640;
  const GROUND = 578;

  const WIDTHS = { bread: 380, pantry: 300, magic: 260, curio: 190 };
  const STEPS = { bread: 46, pantry: 32, magic: 30, curio: 26 };

  function metricsFor(item) {
    if (item.kind === "bread") return { w: WIDTHS.bread, step: STEPS.bread };
    if (item.kind === "curio") return { w: WIDTHS.curio, step: STEPS.curio };
    if (item.magic) return { w: WIDTHS.magic, step: STEPS.magic };
    return { w: WIDTHS.pantry, step: STEPS.pantry };
  }

  let painting = false;

  function requestPaint() {
    if (painting) return;
    painting = true;
    requestAnimationFrame(paintLoop);
  }

  function paintLoop(ts) {
    if (paintStack(ctx, ts)) requestAnimationFrame(paintLoop);
    else painting = false;
  }

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function paintStack(target, ts, opts = {}) {
    const now = ts ?? performance.now();
    target.clearRect(0, 0, CW, CH);
    target.imageSmoothingEnabled = false;

    if (!state.layers.length) return false;

    let moving = false;

    // The first bread is the base the whole tower sits on.
    const base = state.layers[0];
    const baseImg = getImage(base.item.img);
    let baseH = 280;
    if (baseImg.complete && baseImg.naturalWidth) {
      const bw = 440;
      baseH = (baseImg.naturalHeight / baseImg.naturalWidth) * bw;
      const t = opts.final ? 1 : Math.min(1, (now - base.born) / 380);
      if (t < 1) moving = true;
      const e = easeOut(t);
      target.save();
      target.globalAlpha = 0.25 + 0.75 * e;
      target.translate(CW / 2 + base.jitter, GROUND - baseH / 2 - (1 - e) * 90);
      target.rotate(base.rot * 0.5);
      target.drawImage(baseImg, -bw / 2, -baseH / 2, bw, baseH);
      target.restore();
    }

    let y = GROUND - baseH * 0.52;

    state.layers.slice(1).forEach((p) => {
      const img = getImage(p.item.img);
      const { w, step } = metricsFor(p.item);
      y -= step;
      if (!img.complete || !img.naturalWidth) return;

      const t = opts.final ? 1 : Math.min(1, (now - p.born) / 380);
      if (t < 1) moving = true;
      const e = easeOut(t);
      const h = (img.naturalHeight / img.naturalWidth) * w;

      target.save();
      target.globalAlpha = 0.25 + 0.75 * e;
      target.translate(CW / 2 + p.jitter, y - (1 - e) * 90);
      target.rotate(p.rot);
      if (p.item.magic) {
        target.shadowColor = "rgba(170, 120, 255, 0.75)";
        target.shadowBlur = 22;
      }
      target.drawImage(img, -w / 2, -h / 2, w, h);
      target.restore();
    });

    return moving;
  }

  /* --------------------------------------------------------------- utils */

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  function whisper(msg) {
    if (!msg || msg === state.lastWhisper) return;
    state.lastWhisper = msg;
    els.whisper.style.opacity = "0";
    setTimeout(() => {
      els.whisper.textContent = msg;
      els.whisper.style.opacity = "1";
    }, 170);
  }

  const pick = (list, seed) => list[Math.abs(seed) % list.length];
  const randomOf = (list) => list[Math.floor(Math.random() * list.length)];

  function showScreen(name) {
    $$(".screen").forEach((s) => s.classList.remove("active"));
    $(`#screen-${name}`).classList.add("active");
  }

  function spawnSparkles(n) {
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = `${10 + Math.random() * 80}%`;
      s.style.top = `${10 + Math.random() * 75}%`;
      s.style.animationDelay = `${Math.random() * 2}s`;
      els.sparkleLayer.appendChild(s);
    }
  }

  function markAction() {
    state.actionTimes.push(performance.now());
    lastActionAt = performance.now();
    dismissNudges();
  }

  function bumpExploration(n = 1) {
    state.explorationLevel += n;
    updateMix();
    maybeAwakenCafe();
  }

  function maybeAwakenCafe() {
    if (state.explorationLevel >= 3 || state.secretDiscovered || state.dayNightMix) {
      els.cafeScene.classList.add("awakened");
      if (els.sparkleLayer.childElementCount < 8) spawnSparkles(6);
    }
  }

  function fillings() {
    return state.layers.filter((p) => p.item.kind !== "bread");
  }

  function breadsIn() {
    return state.layers.filter((p) => p.item.kind === "bread");
  }

  function updateMix() {
    const items = fillings().map((p) => p.item);
    const day = items.filter((l) => l.tags.includes("day") || l.tags.includes("earth")).length;
    const night = items.filter((l) => l.tags.includes("night") || l.tags.includes("magic")).length;
    state.dayNightMix = day > 0 && night > 0 ? 1 : 0;
  }

  /* ------------------------------------------------------------ rendering */

  function itemButton(item) {
    const left = state.stock[item.id];
    const needsBread = item.kind !== "bread" && !state.layers.length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "ing" +
      (item.kind === "bread" ? " bread" : "") +
      (item.magic && item.kind === "pantry" ? " magic" : "") +
      (item.kind === "curio" ? " curio" : "");
    btn.disabled = left <= 0 || needsBread || state.layers.length >= MAX_LAYERS;
    btn.innerHTML = `
      <span class="stock${left <= 1 ? " low" : ""}">${left}</span>
      <img class="ing-art" src="${item.img}" alt="" />
      <span class="ing-label">${item.name}</span>
    `;
    btn.addEventListener("click", () => addLayer(item));
    return btn;
  }

  function renderTrays() {
    els.breadTray.innerHTML = "";
    BREADS.forEach((b) => els.breadTray.appendChild(itemButton(b)));

    els.tray.innerHTML = "";
    PANTRY.forEach((i) => els.tray.appendChild(itemButton(i)));

    const found = CURIOS.filter((c) => state.unlocked[c.id]);
    els.curioGroup.classList.toggle("hidden", found.length === 0);
    els.curioTray.innerHTML = "";
    found.forEach((c) => els.curioTray.appendChild(itemButton(c)));

    els.layerCount.textContent = `${state.layers.length} / ${MAX_LAYERS} layers`;
  }

  function renderBoard() {
    els.boardEmpty.classList.toggle("hidden", state.layers.length > 0);
    els.btnUndo.disabled = state.layers.length === 0;
    els.btnClear.disabled = state.layers.length === 0;
    els.btnServe.disabled = state.layers.length < 2;
    els.board.classList.toggle(
      "magical",
      state.layers.some((p) => p.item.magic) || state.secretDiscovered
    );
    requestPaint();
  }

  function renderAll() {
    renderTrays();
    renderBoard();
  }

  /* ------------------------------------------------------------ mechanics */

  function placement(item) {
    return {
      item,
      jitter: (Math.random() - 0.5) * (item.kind === "bread" ? 18 : 28),
      rot: (Math.random() - 0.5) * 0.1,
      born: performance.now(),
    };
  }

  function addLayer(item, free) {
    if (!free && state.stock[item.id] <= 0) return;
    if (item.kind !== "bread" && !state.layers.length) return;
    if (state.layers.length >= MAX_LAYERS) {
      toast("The stack is as tall as it wants to be.");
      return;
    }

    markAction();

    // The kitchen sometimes hesitates.
    if (!free && state.layers.length >= 2 && item.kind === "pantry" && Math.random() < 0.1) {
      state.refuseCount += 1;
      whisper(refuseLine(item));
      toast(`${item.name} hesitates… try a different rhythm?`);
      bumpExploration(1);
      renderTrays();
      return;
    }

    const prev = state.layers[state.layers.length - 1]?.item;
    let insertAt = state.layers.length;

    if (item.id === "onion" && prev?.id === "hummus") {
      insertAt = state.layers.length - 1;
      whisper("Hummus and onion argue, then make peace in a new order.");
    }

    let placed = item;

    // The pantry occasionally hands you something else entirely.
    if (
      !free &&
      item.kind === "pantry" &&
      !item.magic &&
      state.layers.length >= 3 &&
      Math.random() < 0.09
    ) {
      const others = fillings()
        .map((p) => p.item)
        .filter((i) => i.kind === "pantry" && i.id !== item.id);
      if (others.length) {
        placed = randomOf(others);
        state.transformCount += 1;
        whisper(`The ${item.name.toLowerCase()} remembered being ${placed.name.toLowerCase()}.`);
        toast("That is not what you picked. It is what it wanted to be.");
      }
    }

    if (!free) state.stock[item.id] -= 1;
    state.useCounts[placed.id] = (state.useCounts[placed.id] || 0) + 1;
    state.repeatStreak = prev && prev.id === placed.id ? state.repeatStreak + 1 : 0;

    state.layers.splice(insertAt, 0, placement(placed));
    bumpExploration(1);
    updateMix();

    if (placed.kind === "curio") onCurioStacked(placed);
    else if (placed.kind === "bread") onBreadStacked(placed);
    else if (state.repeatStreak >= 2) whisper(repeatLine(placed));
    else if (placed.magic) {
      whisper(magicLine(placed));
      spawnSparkles(3);
    } else if (state.dayNightMix) {
      whisper("Day flavours and night flavours… the window brightens.");
      maybeAwakenCafe();
    } else whisper(layerLine(placed));

    // The pantry is sometimes generous.
    if (
      !free &&
      placed.kind === "pantry" &&
      !placed.magic &&
      state.layers.length < MAX_LAYERS &&
      Math.random() < 0.12
    ) {
      state.multiplyCount += 1;
      toast(`The ${placed.name.toLowerCase()} brought a friend.`);
      state.layers.push(placement(placed));
      state.useCounts[placed.id] += 1;
    }

    // Loyalty gets rewarded.
    if (state.useCounts[placed.id] === 3 && placed.kind === "pantry") {
      state.stock[placed.id] += 2;
      toast(`The kitchen restocks what you love: ${placed.name.toLowerCase()}.`);
      spawnSparkles(4);
    }

    if (state.stock[placed.id] === 0 && placed.kind === "pantry") {
      toast(`The last ${placed.name.toLowerCase()} is gone.`);
    }

    checkSecret();
    renderAll();
  }

  function onBreadStacked(bread) {
    const breads = breadsIn().length;
    const withFillings = fillings().length;

    if (breads === 1) {
      whisper(bread.whisper);
      if (bread.id === "pocket" && !state.unlocked.key) {
        els.objectNote.textContent = "This bread keeps glancing toward something locked…";
      }
      return;
    }

    if (withFillings === 0) {
      if (breads === 2) whisper("Bread on bread. The cafe respects the restraint.");
      else if (breads === 3) {
        whisper("A tower of bread. It sways. It stays.");
        wobble();
        toast("The tower is holding. Somehow.");
      } else {
        whisper("This is not a sandwich any more. It is architecture.");
        wobble();
      }
    } else {
      whisper(
        randomOf([
          "Another lid. Everything underneath gets a little more private.",
          "Bread again — you are building rooms, not layers.",
          `${bread.name} closes over the middle like a held thought.`,
        ])
      );
    }
  }

  function onCurioStacked(item) {
    whisper(item.line);
    spawnSparkles(6);
    maybeAwakenCafe();

    const hotspot = { jar: els.hotJar, box: els.hotBox, key: els.hotKey }[item.id];
    if (hotspot) hotspot.classList.add("spent");

    const hasPocket = breadsIn().some((p) => p.item.id === "pocket");
    if (item.id === "key" && hasPocket) {
      unlockSecret("Click — the pocket bread opens from the inside.");
      whisper("So the secret wasn't a recipe. It was permission.");
    } else if (item.id === "key") {
      els.objectNote.textContent = "The key fit somewhere, but not here. Pockets remember.";
    }
  }

  function checkSecret() {
    const ids = state.layers.map((p) => p.item.id);
    if (ids.includes("galaxy") && ids.includes("crystals") && !state.secretDiscovered) {
      unlockSecret("A hidden recipe stirs…");
      whisper("Ohhh. Day and night weren't fighting — they were waiting.");
      els.objectNote.textContent = "You found the cafe's quiet rule.";
    }
  }

  function unlockSecret(message) {
    if (state.secretDiscovered) return;
    state.secretDiscovered = true;
    toast(message);
    spawnSparkles(12);
    maybeAwakenCafe();
    if (!state.unlocked.box) revealCurio("box", "A keepsake box slides out of the shadows.");
  }

  function wobble() {
    els.canvas.classList.remove("wobble");
    void els.canvas.offsetWidth;
    els.canvas.classList.add("wobble");
  }

  // Poking the sandwich is not a feature. It just happens to work.
  function pokeBoard() {
    if (!state.layers.length) return;
    state.pokeCount += 1;
    markAction();
    wobble();

    state.layers.forEach((p, i) => {
      if (i === 0) return;
      p.jitter = (p.jitter + (Math.random() - 0.5) * 22) * 0.8;
      p.rot = (Math.random() - 0.5) * 0.12;
      p.born = performance.now() - 250;
    });
    requestPaint();

    if (state.layers.length >= 3 && Math.random() < 0.18) {
      const lost = state.layers.pop();
      state.stock[lost.item.id] += 1;
      state.useCounts[lost.item.id] = Math.max(0, state.useCounts[lost.item.id] - 1);
      state.fallCount += 1;
      if (lost.item.kind === "curio") {
        const hotspot = { jar: els.hotJar, box: els.hotBox, key: els.hotKey }[lost.item.id];
        if (hotspot) hotspot.classList.remove("spent");
      }
      toast(`The ${lost.item.name.toLowerCase()} slid off. It is fine. It is back on the shelf.`);
      whisper("You poked it. It left. Things do that.");
      renderAll();
      return;
    }

    if (state.pokeCount === 3) {
      whisper("You keep touching it. The cafe finds this endearing.");
    } else if (state.pokeCount === 6) {
      toast("Okay. The kitchen is definitely watching you now.");
      spawnSparkles(5);
    } else {
      whisper(
        randomOf([
          "Everything resettles, slightly differently than before.",
          "The layers shuffle like they were waiting to be asked.",
          "It jiggles. Nothing important changes. Something does.",
        ])
      );
    }
  }

  function undoLayer() {
    const p = state.layers.pop();
    if (!p) return;
    markAction();
    state.undoCount += 1;
    state.stock[p.item.id] += 1;
    state.useCounts[p.item.id] = Math.max(0, (state.useCounts[p.item.id] || 1) - 1);
    if (p.item.kind === "curio") {
      const hotspot = { jar: els.hotJar, box: els.hotBox, key: els.hotKey }[p.item.id];
      if (hotspot) hotspot.classList.remove("spent");
    }
    state.repeatStreak = 0;
    updateMix();
    whisper(
      state.undoCount >= 4
        ? "Again. You are allowed to keep changing your mind."
        : "A layer lifts. The story rewrites."
    );
    renderAll();
  }

  function clearBoard() {
    if (!state.layers.length) return;
    markAction();
    state.clearCount += 1;
    state.layers.forEach((p) => {
      state.stock[p.item.id] += 1;
      state.useCounts[p.item.id] = Math.max(0, (state.useCounts[p.item.id] || 1) - 1);
      if (p.item.kind === "curio") {
        const hotspot = { jar: els.hotJar, box: els.hotBox, key: els.hotKey }[p.item.id];
        if (hotspot) hotspot.classList.remove("spent");
      }
    });
    state.layers = [];
    state.repeatStreak = 0;
    updateMix();
    whisper("Clean board. Clean slate. Still you.");
    renderAll();
  }

  /* --------------------------------------------------------------- lines */

  function refuseLine(ing) {
    return randomOf([
      `The cafe tilts. ${ing.name} wants a softer neighbour first.`,
      `${ing.name} slips off the board — not rude, just picky tonight.`,
      `Hmm. ${ing.name} isn't ready. The kitchen has moods.`,
    ]);
  }

  function repeatLine(ing) {
    return randomOf([
      `More ${ing.name.toLowerCase()}. The kitchen has noticed your loyalty.`,
      `You keep returning to ${ing.name.toLowerCase()}. That counts as a ritual.`,
      `${ing.name} again — the shelf makes room without asking.`,
    ]);
  }

  function magicLine(ing) {
    return randomOf([
      `${ing.name} hums like a pocket of sky.`,
      `Something in the shelves answers the ${ing.name}.`,
      "The lanterns lean closer. Magic was invited.",
    ]);
  }

  function layerLine(ing) {
    const map = {
      lettuce: "Crisp. Grounding.",
      tomato: "A little sunset on the board.",
      cucumber: "Cool quiet.",
      avocado: "Soft green patience.",
      onion: "Sharp honesty. Brave.",
      cabbage: "A purple crunch.",
      nori: "Ocean folded small.",
      cheese: "Comfort finds a seat.",
      egg: "Warmth, simply.",
      tofu: "Soft structure. Room for others.",
      pesto: "Herbs speaking up.",
      hummus: "A gentle base for whatever comes next.",
    };
    return map[ing.id] || "The board accepts it.";
  }

  /* ------------------------------------------------------------- the room */

  function revealCurio(id, message) {
    if (state.unlocked[id]) return;
    state.unlocked[id] = true;
    const hotspot = { jar: els.hotJar, box: els.hotBox, key: els.hotKey }[id];
    if (hotspot) {
      hotspot.classList.remove("hidden");
      hotspot.classList.add("found");
    }
    toast(message);
    renderTrays();
  }

  function onJar() {
    state.hotspots.add("jar");
    markAction();
    clearPings();
    bumpExploration(2);
    whisper("Inside the jar: a house that keeps both moon and path.");
    els.objectNote.textContent = "Behind the jar, a wooden corner catches the light…";
    if (!state.unlocked.jar) {
      state.unlocked.jar = true;
      toast("The jar can go in the sandwich. Obviously.");
      renderTrays();
    }
    revealCurio("box", "Something was tucked behind the world-jar.");
  }

  function onBox() {
    state.hotspots.add("box");
    markAction();
    bumpExploration(2);
    whisper("Letters, yarn, a gem — different selves, one box.");
    els.objectNote.textContent = "Self-authorship smells like cedar and old paper.";
    revealCurio("key", "A star key was lying under the yarn.");
  }

  function onKey() {
    state.hotspots.add("key");
    markAction();
    bumpExploration(1);
    whisper("Keys prefer people who look twice. This one wants to be an ingredient.");
    els.objectNote.textContent = "Stack the key into a bread with pockets.";
    renderTrays();
  }

  /* ------------------------------------------------------- inner reading */

  function stackSeed() {
    return hashString(state.layers.map((p) => p.item.id).join("-"));
  }

  function averageGap() {
    const t = state.actionTimes;
    if (t.length < 3) return 2000;
    let sum = 0;
    for (let i = 1; i < t.length; i++) sum += t[i] - t[i - 1];
    return sum / (t.length - 1);
  }

  const TRAITS = {
    purist: { label: "Bread Purist", place: "a quiet room with one chair and very good bread" },
    architect: { label: "Architect", place: "a house you keep adding rooms to, without moving in yet" },
    ritualist: { label: "Ritualist", place: "a kitchen where the same song plays every morning" },
    collector: { label: "Collector", place: "a market street where you never take the same turn twice" },
    nightMixer: { label: "Night Mixer", place: "a window that refuses to choose between sunset and moon" },
    roomEmptier: { label: "Room Emptier", place: "a suitcase packed with the entire room, just in case" },
    ruleBreaker: { label: "Rule Breaker", place: "a door in the pantry that wasn't there yesterday" },
    secondGuesser: { label: "Second Guesser", place: "a desk with seven drafts of the same short letter" },
    decisive: { label: "Quick Hands", place: "a kitchen at 2am where you cook without measuring" },
    lingerer: { label: "Lingerer", place: "a long afternoon where nothing needs to be decided" },
    poker: { label: "Poker of Things", place: "a world that giggles a little when you touch it" },
    shapeshifted: { label: "Shape Shifter", place: "a room where the furniture moves when you blink" },
    lucky: { label: "Fed Twice", place: "a pantry that quietly gives you more than you asked for" },
    restarter: { label: "Clean Slater", place: "a floor swept every night so morning can start over" },
    sealer: { label: "Lid Keeper", place: "a room where some things stay private, and that is allowed" },
    generous: { label: "Generous Hand", place: "a table where nobody is expected to leave hungry" },
    openFace: { label: "Open Face", place: "a room where you left the curtains open on purpose" },
    explorer: { label: "Room Reader", place: "a small cafe you walked around twice before sitting down" },
  };

  // Ordered by how much the behaviour stands out; the first one names the card.
  function readTraits() {
    const found = [];
    const items = state.layers.map((p) => p.item);
    const distinct = new Set(items.map((i) => i.id)).size;
    const breads = breadsIn().length;
    const fills = fillings().length;
    const gap = averageGap();
    const topIsBread = state.layers[state.layers.length - 1]?.item.kind === "bread";

    if (state.secretDiscovered) found.push("ruleBreaker");
    if (fills === 0 && breads >= 2) found.push("purist");
    if (items.filter((i) => i.kind === "curio").length >= 2) found.push("roomEmptier");
    if (breads >= 3) found.push("architect");
    if (Object.values(state.useCounts).some((n) => n >= 3)) found.push("ritualist");
    if (distinct >= 5) found.push("collector");
    if (state.transformCount >= 1) found.push("shapeshifted");
    if (state.multiplyCount >= 2) found.push("lucky");
    if (state.dayNightMix) found.push("nightMixer");
    if (state.undoCount >= 3) found.push("secondGuesser");
    if (state.clearCount >= 1) found.push("restarter");
    if (state.pokeCount >= 2) found.push("poker");
    if (fills > 0 && topIsBread) found.push("sealer");
    if (fills > 0 && breads === 1) found.push("openFace");
    if (state.layers.length >= 6) found.push("generous");
    if (state.hotspots.size >= 2) found.push("explorer");
    if (gap < 1400 && state.undoCount === 0) found.push("decisive");
    if (gap > 4500) found.push("lingerer");

    if (!found.length) found.push("decisive");
    return found;
  }

  const TITLES = {
    purist: ["Bread That Dreams of Being a Sandwich", "Plain, On Purpose", "Tower of Restraint"],
    architect: ["Sandwich With Too Many Floors", "The Bread Apartment", "Structural Optimism"],
    ruleBreaker: ["The Sandwich That Doesn't Follow Rules", "Authorized Contradiction", "Pocketful of Both Moons"],
    roomEmptier: ["Everything I Own, Toasted", "The Whole Room Sandwich"],
    ritualist: ["Ritual Stack", "The Same Thing, Lovingly", "Comfort, Repeated"],
    collector: ["One of Everything, Please", "The Indecisive Feast", "Sandwich of Many Selves"],
    nightMixer: ["Twilight Coexistence Melt", "Both Skies Sandwich", "Sunset With a Moon Filling"],
    secondGuesser: ["Draft Number Seven", "The Sandwich I Kept Rewriting"],
    poker: ["The Sandwich That Was Poked", "Nervous Architecture"],
    shapeshifted: ["It Became Something Else", "Sandwich, Revised by Itself"],
    lucky: ["Twice As Much As Asked For", "The Generous Mistake"],
    restarter: ["Second Morning Sandwich", "Made After Starting Over"],
    decisive: ["No Hesitation Melt", "Straight From the Gut"],
    lingerer: ["The Long Afternoon Stack", "Made Slowly, On Purpose"],
    sealer: ["Closed On Purpose", "The One With a Lid", "Private Middle"],
    openFace: ["Left Open", "Nothing to Hide Sandwich", "Curtains Up Melt"],
    generous: ["More Than Enough", "The Overflowing One"],
    explorer: ["Looked At Everything First", "The Slow Survey"],
  };

  function buildArtifact() {
    const traits = readTraits();
    const seed = stackSeed();
    const primary = traits[0];
    const pool = TITLES[primary] || TITLES.decisive;

    const counted = {};
    state.layers.forEach((p) => (counted[p.item.name] = (counted[p.item.name] || 0) + 1));
    const layerNames = Object.entries(counted)
      .map(([n, c]) => (c > 1 ? `${n} ×${c}` : n))
      .join(" · ");

    const tag = state.secretDiscovered
      ? "rare discovery"
      : traits.includes("purist") || traits.includes("roomEmptier")
      ? "unusual"
      : "your take-home";

    return {
      title: pick(pool, seed),
      tag,
      traits: traits.slice(0, 3),
      place: TRAITS[primary].place,
      layerNames,
      reflection: reflect(traits),
      secret: state.secretDiscovered,
    };
  }

  function reflect(traits) {
    const lines = {
      purist:
        "You were offered a whole pantry and chose bread, then more bread. Restraint is also a way of decorating a room.",
      architect:
        "You kept adding floors. Whatever you are building, it is not finished, and that seems to be the point.",
      ruleBreaker:
        "You looked twice, tried the odd combination, or turned a key that wasn't for a door. Curiosity left a visible trace.",
      roomEmptier:
        "You put the room itself into the sandwich. Nothing in this cafe was safe from becoming part of you.",
      ritualist:
        "You reached for the same thing again and again. Repetition is how a preference quietly becomes a ritual.",
      collector:
        "You wanted one of everything. Choosing less would have felt like leaving a part of yourself on the shelf.",
      nightMixer:
        "You kept stacking opposites until they stopped arguing. The window does the same thing every evening.",
      secondGuesser:
        "You built, unbuilt, and rebuilt. The final stack is only the last of many that were also true.",
      poker:
        "You touched things to see what they would do. That is a whole way of being in a room.",
      shapeshifted:
        "Something you chose turned into something else and you kept it. Not everything has to go to plan to belong to you.",
      lucky:
        "The pantry gave you extra and you didn't put it back. Abundance suits you more than you might admit.",
      restarter:
        "You cleared the board and began again. Starting over was cheaper than settling.",
      decisive:
        "You moved fast and didn't undo anything. You already knew what home tasted like.",
      lingerer:
        "You took your time between choices. The cafe stayed open the entire while.",
      sealer:
        "You closed the whole thing with bread. Whatever is in the middle is yours to know about.",
      openFace:
        "You never covered it up. Everything you chose is still visible from the outside.",
      generous:
        "You kept going past the point where it was already enough. Nobody here is going to stop you.",
      explorer:
        "You read the room before you built anything. The cafe noticed you noticing it.",
    };
    return lines[traits[0]] || lines.decisive;
  }

  /* ------------------------------------------------------------- artifact */

  let currentArtifact = null;
  let stackDataUrl = null;
  let blendDataUrl = null;
  let blendIsRemote = false;
  let blendRemoteUrl = null;
  let bakeAttempt = 0;
  let currentView = "stack";

  function serve() {
    if (state.layers.length < 2) return;
    state.servedCount += 1;
    currentArtifact = buildArtifact();
    stackDataUrl = renderArtifactCard();
    blendDataUrl = null;
    currentView = "stack";
    bakeAttempt = 0;

    els.viewToggle.classList.add("hidden");
    els.ovenNote.classList.add("hidden");
    els.btnBlend.textContent = "Put it in the oven";

    presentArtifact();
    saveTrace();
    showScreen("end");
  }

  function presentArtifact() {
    const a = currentArtifact;
    els.artifactImg.src = currentView === "blend" && blendDataUrl ? blendDataUrl : stackDataUrl;
    els.artifactImg.alt = a.title;
    els.artifactTitle.textContent = a.title;
    els.artifactTag.textContent = a.tag;
    els.artifactLayers.textContent = a.layerNames;
    els.artifactReflect.textContent = a.reflection;
    els.innerWorld.textContent = a.place;
    els.traitRow.innerHTML = a.traits
      .map((t) => `<span class="trait">${TRAITS[t].label}</span>`)
      .join("");
    els.artifactSecret.classList.toggle("hidden", !a.secret);
    if (a.secret) {
      els.artifactSecret.textContent =
        "Secret found: galaxy + crystals, or the star key stacked into the secret pocket.";
    }
  }

  function renderArtifactCard(blendImg) {
    const W = 900;
    const H = 1120;
    const card = document.createElement("canvas");
    card.width = W;
    card.height = H;
    const c = card.getContext("2d");

    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#2b1c3f");
    bg.addColorStop(0.55, "#3a2418");
    bg.addColorStop(1, "#170f26");
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    c.fillStyle = "rgba(240, 193, 75, 0.5)";
    for (let i = 0; i < 60; i++) c.fillRect(Math.random() * W, Math.random() * 760, 2, 2);

    const artTop = 50;
    const artSize = 760;
    c.imageSmoothingEnabled = false;
    if (blendImg) {
      c.drawImage(blendImg, (W - artSize) / 2, artTop, artSize, artSize);
    } else {
      const stack = document.createElement("canvas");
      stack.width = CW;
      stack.height = CH;
      paintStack(stack.getContext("2d"), performance.now(), { final: true });
      c.drawImage(stack, (W - artSize) / 2, artTop, artSize, artSize);
    }

    const a = currentArtifact;
    let y = artTop + artSize + 24;

    c.textAlign = "center";
    c.fillStyle = "#f0c14b";
    c.font = "600 20px 'Pixelify Sans', monospace";
    c.fillText(a.tag.toUpperCase(), W / 2, y);

    y += 50;
    c.fillStyle = "#ffe8c8";
    c.font = "600 40px 'Pixelify Sans', monospace";
    const titleLines = wrapText(c, a.title, W / 2, y, W - 120, 46);

    y += titleLines * 46 + 6;
    c.fillStyle = "rgba(243, 226, 196, 0.72)";
    c.font = "400 21px 'Outfit', sans-serif";
    const layerLines = wrapText(c, a.layerNames, W / 2, y, W - 150, 28);

    y += layerLines * 28 + 22;
    c.fillStyle = "#f0c14b";
    c.font = "600 19px 'Pixelify Sans', monospace";
    c.fillText(a.traits.map((t) => TRAITS[t].label).join("  ·  ").toUpperCase(), W / 2, y);

    y += 40;
    c.fillStyle = "rgba(255, 232, 200, 0.9)";
    c.font = "400 22px 'Outfit', sans-serif";
    wrapText(c, `your inner room looks like ${a.place}`, W / 2, y, W - 140, 30);

    c.fillStyle = "rgba(243, 226, 196, 0.4)";
    c.font = "400 18px 'Outfit', sans-serif";
    c.fillText("moonlit sandwich cafe", W / 2, H - 32);

    return card.toDataURL("image/png");
  }

  function wrapText(c, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(" ");
    let line = "";
    let cursorY = y;
    let count = 1;
    words.forEach((w, i) => {
      const test = line ? `${line} ${w}` : w;
      if (c.measureText(test).width > maxWidth && line) {
        c.fillText(line, x, cursorY);
        line = w;
        cursorY += lineHeight;
        count += 1;
      } else {
        line = test;
      }
      if (i === words.length - 1) c.fillText(line, x, cursorY);
    });
    return count;
  }

  /* ----------------------------------------------------------- the oven */

  function exactRecipe() {
    const counted = [];
    state.layers.forEach((p) => {
      const last = counted[counted.length - 1];
      if (last && last.id === p.item.id) last.n += 1;
      else counted.push({ id: p.item.id, name: p.item.name, n: 1 });
    });
    return counted;
  }

  function buildPrompt() {
    const totals = {};
    state.layers.forEach((p) => (totals[p.item.id] = (totals[p.item.id] || 0) + 1));

    const exact = Object.entries(totals)
      .map(([id, n]) => {
        const item = byId(id);
        const noun = item.kind === "bread" ? `slices of ${item.desc}` : item.promptBit || item.name.toLowerCase();
        return `${n} ${noun}`;
      })
      .join(", ");

    const order = state.layers
      .map((p) => (p.item.kind === "bread" ? `${p.item.name.toLowerCase()} bread` : p.item.name.toLowerCase()))
      .join(", then ");

    const secretBit = state.secretDiscovered
      ? ", impossible glowing filling that breaks the rules of physics"
      : "";
    const breadOnly = fillings().length === 0 ? ", no fillings at all, only bread stacked on bread" : "";

    return (
      "cozy pixel art game item icon, chunky visible pixels, bold dark outline, flat limited palette, " +
      "a single sandwich built from exactly these ingredients and nothing else: " +
      `${exact}${breadOnly}; stacked from bottom to top: ${order}; ` +
      "the ingredients melted and blended together inside the bread and oozing out of the crust" +
      `${secretBit}, warm gold and deep purple night colours, sparkles, ` +
      "centered on a solid dark background, no text, no watermark"
    );
  }

  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % 1000000;
  }

  async function blendInOven() {
    if (!currentArtifact) return;
    els.btnBlend.disabled = true;
    els.blendLoading.classList.remove("hidden");
    bakeAttempt += 1;
    state.bakeCount += 1;

    const prompt = buildPrompt();
    const seed = hashString(state.layers.map((p) => p.item.id).join("")) + bakeAttempt * 7;
    const token = localStorage.getItem("moonlit-flux-token");
    const url =
      "https://image.pollinations.ai/prompt/" +
      encodeURIComponent(prompt) +
      `?model=flux&width=768&height=768&nologo=true&seed=${seed}` +
      (token ? `&token=${encodeURIComponent(token)}` : "");

    blendRemoteUrl = url;
    const ovenSaw =
      "The oven read your stack exactly: " +
      exactRecipe()
        .map((e) => (e.n > 1 ? `${e.name.toLowerCase()} ×${e.n}` : e.name.toLowerCase()))
        .join(", ") +
      ".";

    try {
      const proxied =
        "https://images.weserv.nl/?url=" +
        encodeURIComponent(url.replace(/^https?:\/\//, "")) +
        `&w=${PIXEL_SIZE}&output=png`;
      const img = await loadRemoteImage(proxied, true);
      blendDataUrl = renderArtifactCard(pixelate(img));
      blendIsRemote = false;
      els.ovenNote.textContent = ovenSaw;
    } catch (proxyErr) {
      try {
        await loadRemoteImage(url, false);
        blendDataUrl = url;
        blendIsRemote = true;
        els.ovenNote.textContent = ovenSaw;
      } catch (err) {
        blendDataUrl = localMelt();
        blendIsRemote = false;
        blendRemoteUrl = null;
        els.ovenNote.textContent =
          "The oven lost its connection to the sky, so it melted your sandwich by hand.";
      }
    }

    currentView = "blend";
    els.blendLoading.classList.add("hidden");
    els.ovenNote.classList.remove("hidden");
    els.viewToggle.classList.remove("hidden");
    els.btnBlend.disabled = false;
    els.btnBlend.textContent = "Bake it again";
    syncToggle();
    presentArtifact();
    saveTrace();
  }

  // The generator rejects requests carrying an Origin header, so direct loads
  // must stay crossOrigin-free; the proxy is the one that can be read back.
  function loadRemoteImage(url, cors) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      const timer = setTimeout(() => reject(new Error("timeout")), 60000);
      img.onload = () => {
        clearTimeout(timer);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error("blocked"));
      };
      img.src = url;
    });
  }

  const PIXEL_SIZE = 176;

  function pixelate(img) {
    const small = document.createElement("canvas");
    small.width = PIXEL_SIZE;
    small.height = PIXEL_SIZE;
    const s = small.getContext("2d", { willReadFrequently: true });
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    s.drawImage(img, iw * 0.03, ih * 0.02, iw * 0.94, ih * 0.9, 0, 0, PIXEL_SIZE, PIXEL_SIZE);

    const data = s.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE);
    const step = 255 / 9;
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = Math.round(data.data[i] / step) * step;
      data.data[i + 1] = Math.round(data.data[i + 1] / step) * step;
      data.data[i + 2] = Math.round(data.data[i + 2] / step) * step;
    }
    s.putImageData(data, 0, 0);

    const big = document.createElement("canvas");
    big.width = 720;
    big.height = 720;
    const b = big.getContext("2d");
    b.imageSmoothingEnabled = false;
    b.drawImage(small, 0, 0, 720, 720);
    return big;
  }

  function localMelt() {
    const melted = document.createElement("canvas");
    melted.width = CW;
    melted.height = CH;
    const m = melted.getContext("2d");

    const stack = document.createElement("canvas");
    stack.width = CW;
    stack.height = CH;
    paintStack(stack.getContext("2d"), performance.now(), { final: true });

    m.filter = "blur(7px) saturate(1.35)";
    for (let i = 0; i < 3; i++) {
      m.globalAlpha = 0.55;
      m.drawImage(stack, -6 + i * 6, 10 - i * 8, CW + 12, CH - 6);
    }
    m.filter = "none";
    m.globalAlpha = 0.9;
    m.drawImage(stack, 0, 0);
    m.globalAlpha = 1;

    m.globalCompositeOperation = "overlay";
    const warm = m.createLinearGradient(0, 0, 0, CH);
    warm.addColorStop(0, "rgba(240, 193, 75, 0.35)");
    warm.addColorStop(1, "rgba(110, 74, 158, 0.35)");
    m.fillStyle = warm;
    m.fillRect(0, 0, CW, CH);
    m.globalCompositeOperation = "source-over";

    return renderArtifactCard(melted);
  }

  function syncToggle() {
    $$("#view-toggle .chip").forEach((chip) =>
      chip.classList.toggle("active", chip.dataset.view === currentView)
    );
  }

  /* --------------------------------------------------------------- trace */

  function saveTrace() {
    try {
      localStorage.setItem(
        "moonlit-cafe-last",
        JSON.stringify({
          title: currentArtifact?.title,
          traits: currentArtifact?.traits,
          place: currentArtifact?.place,
          layers: state.layers.map((p) => p.item.id),
          secret: state.secretDiscovered,
          served: state.servedCount,
          at: Date.now(),
        })
      );
    } catch (_) {
      /* private mode is fine */
    }
  }

  function download() {
    if (currentView === "blend" && blendIsRemote && blendRemoteUrl) {
      window.open(blendRemoteUrl, "_blank", "noopener");
      toast("Opened the oven's image in a new tab — save it from there.");
      return;
    }
    const data = currentView === "blend" && blendDataUrl ? blendDataUrl : stackDataUrl;
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = `${(currentArtifact?.title || "sandwich").replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
    toast("Saved to your downloads.");
  }

  function composeAnother() {
    state.layers = [];
    state.repeatStreak = 0;
    blendDataUrl = null;

    const breadLeft = BREADS.some((b) => state.stock[b.id] > 0);
    const pantryLeft = PANTRY.some((i) => state.stock[i.id] > 0);

    if (!breadLeft) {
      whisper("The bread shelf is empty. The cafe rests, holding what you made.");
      toast("No bread left — the night is closing.");
    } else if (!pantryLeft) {
      whisper("The pantry is bare. Whatever you build now is improvisation.");
    } else {
      whisper("Another sandwich. Same you, new arrangement.");
    }

    renderAll();
    showScreen("play");
  }

  /* ------------------------------------------------------------ mischief */

  // Hints behave like shy animals: they appear when you go quiet, flicker,
  // and leave the moment you reach for them.
  const nudgeLayer = $("#nudge-layer");
  let lastActionAt = performance.now();
  let nextHintAt = 0;
  let activeNudges = [];

  const HINTS = [
    {
      id: "explore",
      anchor: "#hot-jar",
      max: 3,
      when: () => onPlay() && state.hotspots.size === 0,
      texts: ["…", "something is looking at you", "the jar wants attention"],
    },
    {
      id: "poke",
      anchor: "#sandwich-canvas",
      max: 4,
      twitch: true,
      when: () => onPlay() && state.layers.length >= 2 && state.pokeCount === 0,
      texts: ["…", "it moved", "poke?", "poke it. nothing bad happens."],
    },
    {
      id: "bread",
      anchor: "#bread-tray",
      max: 2,
      when: () =>
        onPlay() &&
        state.servedCount === 0 &&
        state.layers.length >= 1 &&
        breadsIn().length === 1,
      texts: ["more bread?", "bread on bread is allowed, you know"],
    },
    {
      id: "curio",
      anchor: "#curio-tray",
      max: 2,
      when: () =>
        onPlay() &&
        CURIOS.some((c) => state.unlocked[c.id] && !state.useCounts[c.id]) &&
        state.layers.length >= 1,
      texts: ["it fits, you know", "a whole jar can go in a sandwich"],
    },
    {
      id: "bake",
      anchor: "#btn-blend",
      max: 2,
      when: () => onEnd() && state.bakeCount === 0,
      texts: ["it isn't finished", "the oven is awake"],
    },
    {
      id: "again",
      anchor: "#btn-again",
      max: 1,
      when: () => onEnd() && state.servedCount >= 1 && state.bakeCount >= 1,
      texts: ["there is more bread on the shelf"],
    },
  ];

  const onPlay = () => $("#screen-play").classList.contains("active");
  const onEnd = () => $("#screen-end").classList.contains("active");

  function dismissNudges() {
    activeNudges.forEach(({ el }) => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 320);
    });
    activeNudges = [];
  }

  function showNudge(hint) {
    const target = document.querySelector(hint.anchor);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (!rect.width) return;

    const el = document.createElement("div");
    el.className = "nudge";
    // Every so often it shows up and immediately regrets it.
    const flicker = Math.random() < 0.28;
    if (flicker) el.classList.add("flicker");
    el.innerHTML = `<span class="tick"></span><span>${hint.texts[hint.shown]}</span>`;
    nudgeLayer.appendChild(el);

    const x = rect.left + rect.width * (0.45 + Math.random() * 0.3);
    const y = rect.top + rect.height * 0.12 - 14 + (Math.random() - 0.5) * 16;
    el.style.left = `${Math.max(12, Math.min(window.innerWidth - 220, x))}px`;
    el.style.top = `${Math.max(12, y)}px`;

    const entry = { el, x, y };
    activeNudges.push(entry);

    const life = flicker ? 700 : 2200 + Math.random() * 1200;
    setTimeout(() => {
      if (!activeNudges.includes(entry)) return;
      el.classList.add("out");
      setTimeout(() => el.remove(), 320);
      activeNudges = activeNudges.filter((n) => n !== entry);
    }, life);

    if (hint.twitch) twitchStack();
  }

  // The sandwich shifts a little by itself, so poking feels like an answer.
  function twitchStack() {
    if (state.layers.length < 2) return;
    const top = state.layers[state.layers.length - 1];
    top.jitter += (Math.random() - 0.5) * 10;
    top.rot = (Math.random() - 0.5) * 0.09;
    top.born = performance.now() - 300;
    requestPaint();
  }

  function tickHints() {
    if (activeNudges.length) return;
    if (!onPlay() && !onEnd()) return;
    if (performance.now() < nextHintAt) return;
    if (performance.now() - lastActionAt < 7000) return;

    pingHotspot();

    const hint = HINTS.find((h) => {
      h.shown = h.shown || 0;
      return h.shown < h.max && h.when();
    });
    if (!hint) return;

    showNudge(hint);
    hint.shown += 1;
    nextHintAt = performance.now() + 11000 + Math.random() * 6000;
  }

  // Reaching for a hint scares it off.
  document.addEventListener("mousemove", (e) => {
    if (!activeNudges.length) return;
    activeNudges = activeNudges.filter((n) => {
      const dx = e.clientX - n.x;
      const dy = e.clientY - n.y;
      if (Math.hypot(dx, dy) > 110) return true;
      n.el.style.transform = `translate(${dx > 0 ? -14 : 14}px, -10px)`;
      n.el.classList.add("out");
      setTimeout(() => n.el.remove(), 320);
      return false;
    });
  });

  function pingHotspot() {
    if (state.hotspots.size > 0 || !onPlay()) return;
    if (els.hotJar.querySelector(".ping")) return;
    const ring = document.createElement("span");
    ring.className = "ping";
    els.hotJar.appendChild(ring);
  }

  function clearPings() {
    $$(".ping").forEach((p) => p.remove());
  }

  setInterval(tickHints, 2500);
  setTimeout(pingHotspot, 7000);

  /* ---------------------------------------------------------------- wire */

  $("#btn-enter").addEventListener("click", () => showScreen("quest"));
  $("#btn-start").addEventListener("click", () => {
    showScreen("play");
    whisper("Start with bread. Stack as much of it as you like.");
    markAction();
    requestPaint();
  });

  els.btnUndo.addEventListener("click", undoLayer);
  els.btnClear.addEventListener("click", clearBoard);
  els.btnServe.addEventListener("click", serve);
  els.canvas.addEventListener("click", pokeBoard);
  els.hotJar.addEventListener("click", onJar);
  els.hotBox.addEventListener("click", onBox);
  els.hotKey.addEventListener("click", onKey);
  els.btnBlend.addEventListener("click", blendInOven);
  els.btnDownload.addEventListener("click", download);
  $("#btn-again").addEventListener("click", composeAnother);

  els.viewToggle.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    if (chip.dataset.view === "blend" && !blendDataUrl) return;
    currentView = chip.dataset.view;
    syncToggle();
    presentArtifact();
  });

  renderAll();
})();
