(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const screenOrder = ["welcome", "setup", "hiding", "explore", "story-gate", "ending", "friend-intro", "friend-quiz", "friend-complete"];
  const screenLabels = {
    welcome: "Invitation",
    setup: "Photographs",
    hiding: "The hiding",
    explore: "Memory hunt",
    "story-gate": "Story unlocked",
    ending: "Fantasy keepsake",
    "friend-intro": "Chapter Two",
    "friend-quiz": "Restore memories",
    "friend-complete": "Keepsake"
  };

  const discoveries = [
    {
      object: "The clothing rack found this",
      prompt: "What was happening in this moment?",
      help: "You might remember a decision, an outfit, a joke, or what happened five seconds later.",
      angles: ["What happened just before?", "What were you deciding?", "What made you laugh?"],
      whisper: "The mirror has been practicing its innocent face. Look there next."
    },
    {
      object: "The living mirror kept this",
      prompt: "What detail did you notice that day?",
      help: "A color, expression, sound, or tiny background detail is enough.",
      angles: ["What did the room look like?", "Who noticed it first?", "What still stands out?"],
      whisper: "The coffee cup is pretending not to know anything. Suspicious."
    },
    {
      object: "The tiny coffee cup remembers this",
      prompt: "What did somebody say around this moment?",
      help: "An exact quote is optional. The general spirit of the sentence counts.",
      angles: ["Was there an inside joke?", "What did you order?", "What was the mood?"],
      whisper: "The denim jacket has been glowing for several minutes now."
    },
    {
      object: "The denim jacket was hiding this",
      prompt: "What happened immediately before or after?",
      help: "Think of the five minutes outside the photograph rather than the instant inside it.",
      angles: ["Where did you go next?", "What almost happened?", "Did the plan change?"],
      whisper: "The puff-sleeve dress is rustling like it has something to add."
    },
    {
      object: "The puff-sleeve dress chose this",
      prompt: "Why does this photograph feel like the two of you?",
      help: "It can be affectionate, ridiculous, ordinary, or difficult to explain.",
      angles: ["Who was most themselves?", "What feels familiar?", "Why keep this one?"],
      whisper: "One last photograph. The curtain has been sitting on it the whole time."
    },
    {
      object: "The curtain finally surrendered this",
      prompt: "What part is still funny or mysterious?",
      help: "Leave room for uncertainty. The fitting room is allowed to wonder with you.",
      angles: ["What do you still debate?", "What did you forget?", "What would your friend add?"],
      whisper: "Every photograph has found a memory. The memory box is opening."
    }
  ];

  const demoPhotos = [
    "assets/backgrounds/10-photo-wall.svg",
    "assets/characters/07-heart-shaped-stool.svg",
    "assets/characters/13-tiny-coffee-cup.svg",
    "assets/clothing/y2k/03-pastel-denim-jacket.svg",
    "assets/clothing/cottagecore/05-puff-sleeve-dress.svg",
    "assets/characters/02-magical-fitting-room-curtain.svg"
  ];
  const demoMemories = [
    "We promised to browse for ten minutes and somehow began judging every jacket like a royal council.",
    "The heart stool became our official headquarters while neither of us made a decision.",
    "The tiny coffee arrived after we had already forgotten which shop we meant to visit next.",
    "We called the denim jacket both brilliant and ridiculous, sometimes in the same sentence.",
    "The dramatic sleeves made us laugh because they took up more room than either of us did.",
    "We left without the thing we came for, but kept talking about the day all the way home."
  ];

  const quizObjects = [
    { name: "Clothing rack", className: "quiz-object-rack", image: "assets/objects/04-clothing-rack.svg" },
    { name: "Living mirror", className: "quiz-object-mirror", image: "assets/characters/03-magical-mirror.svg" },
    { name: "Coffee cup", className: "quiz-object-coffee", image: "assets/characters/13-tiny-coffee-cup.svg" },
    { name: "Denim jacket", className: "quiz-object-jacket", image: "assets/clothing/y2k/03-pastel-denim-jacket.svg" },
    { name: "Puff-sleeve dress", className: "quiz-object-dress", image: "assets/clothing/cottagecore/05-puff-sleeve-dress.svg" },
    { name: "Fitting-room curtain", className: "quiz-object-curtain", image: "assets/characters/02-magical-fitting-room-curtain.svg" }
  ];

  const castings = [
    {
      costume: "assets/clothing/y2k/03-pastel-denim-jacket.svg",
      role: "Wardrobe Whisperer",
      power: "Makes every questionable outfit look entirely intentional.",
      flaw: "Cannot ignore one dramatic sleeve.",
      prop: "The Hanger of Second Opinions",
      propImage: "assets/objects/11-magic-clothing-hanger.svg"
    },
    {
      costume: "assets/clothing/cottagecore/05-puff-sleeve-dress.svg",
      role: "Keeper of the Bottomless Cup",
      power: "Rewinds the five minutes before every photograph.",
      flaw: "Gets distracted by snacks and excellent gossip.",
      prop: "The Cup That Remembers After",
      propImage: "assets/characters/13-tiny-coffee-cup.svg"
    },
    {
      costume: "assets/clothing/cottagecore/04-embroidered-cardigan.svg",
      role: "Archivist of Almost-Plans",
      power: "Finds the story hiding behind every changed itinerary.",
      flaw: "Adds one unnecessary but delightful detour.",
      prop: "The Box of Useful Tangents",
      propImage: "assets/objects/08-memory-box.svg"
    },
    {
      costume: "assets/clothing/y2k/05-glittery-camisole.svg",
      role: "Minister of Tiny Dramas",
      power: "Turns awkward pauses into legendary entrances.",
      flaw: "Treats every mirror as a witness.",
      prop: "The Mirror of Selective Evidence",
      propImage: "assets/characters/03-magical-mirror.svg"
    }
  ];

  const state = {
    photos: Array(6).fill(""),
    memories: Array(6).fill(""),
    creatorName: "",
    friendName: "",
    seedMemory: "",
    currentDiscovery: 0,
    activeDiscovery: 0,
    story: null,
    castOffset: 0,
    friendQuizIndex: 0,
    selectedQuizPhoto: null,
    photoLocations: [],
    matchedPhotos: [],
    quizTimer: null,
    generatedImage: ""
  };

  function showScreen(name) {
    $$(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === name));
    const step = Math.max(0, screenOrder.indexOf(name));
    $("#stepLabel").textContent = screenLabels[name] || "The fitting room";
    $("#stepDots").innerHTML = screenOrder.slice(0, 6).map((_, index) => `<i class="${index <= Math.min(step, 5) ? "is-on" : ""}"></i>`).join("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    $("#mainContent").focus({ preventScroll: true });
  }

  function announce(message) {
    $("#liveRegion").textContent = "";
    window.setTimeout(() => { $("#liveRegion").textContent = message; }, 20);
  }

  function safeDialogOpen(dialog) {
    if (!dialog.open) dialog.showModal();
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  function renderPhotoGrid() {
    $("#photoGrid").innerHTML = state.photos.map((photo, index) => `
      <div class="photo-slot ${photo ? "has-photo" : ""}">
        ${photo ? `<img src="${photo}" alt="Uploaded photograph ${index + 1}">` : ""}
        <input id="photoInput${index}" type="file" accept="image/*" data-photo-input="${index}">
        <label for="photoInput${index}">${photo ? "Replace" : `Add photo ${String(index + 1).padStart(2, "0")}`}</label>
      </div>`).join("");
    updateSetupProgress();
  }

  function updateSetupProgress() {
    const count = state.photos.filter(Boolean).length;
    $("#setupCompletion").textContent = `${count} of 6 photographs ready`;
    $("#progressFill").style.width = `${count / 6 * 100}%`;
    $('[data-action="hide-photos"]').disabled = count !== 6;
  }

  function readPhoto(file, index) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.photos[index] = reader.result;
      renderPhotoGrid();
      announce(`Photograph ${index + 1} is ready.`);
    });
    reader.readAsDataURL(file);
  }

  function loadDemo() {
    state.photos = demoPhotos.slice();
    state.memories = demoMemories.slice();
    state.creatorName = "Cookie";
    state.friendName = "June";
    state.seedMemory = "A supposedly quick shopping trip that developed its own mythology.";
    $("#creatorName").value = state.creatorName;
    $("#friendName").value = state.friendName;
    $("#seedMemory").value = state.seedMemory;
    renderPhotoGrid();
    announce("The fictional demo is ready. You can replace any photograph.");
  }

  function enterRoom() {
    document.body.classList.add("curtain-opening");
    window.setTimeout(() => {
      document.body.classList.remove("curtain-opening");
      showScreen("setup");
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 650);
  }

  function beginHiding() {
    if (state.photos.filter(Boolean).length !== 6) {
      announce("Add all six photographs before the room hides them.");
      return;
    }
    state.creatorName = $("#creatorName").value.trim() || "You";
    state.friendName = $("#friendName").value.trim() || "Your friend";
    state.seedMemory = $("#seedMemory").value.trim() || "A day with more story than anyone expected.";
    state.currentDiscovery = 0;
    showScreen("hiding");
  }

  function renderExplore() {
    $$("[data-discovery]").forEach((marker) => {
      const index = Number(marker.dataset.discovery);
      marker.classList.toggle("is-current", index === state.currentDiscovery);
      marker.classList.toggle("is-found", Boolean(state.memories[index]));
      marker.disabled = index > state.currentDiscovery;
    });
    const found = state.memories.filter(Boolean).length;
    $("#foundCount").textContent = `${found} / 6`;
    $("#foundPhotos").innerHTML = state.photos.map((photo, index) => state.memories[index] ? `<img src="${photo}" alt="Discovered photograph ${index + 1}">` : "").join("");
    if (found < 6) $("#exploreTitle").textContent = `“${found ? discoveries[found - 1].whisper : "The rack is humming. Start there."}”`;
  }

  function openDiscovery(index) {
    if (index > state.currentDiscovery) {
      announce(`The room wants you to follow the current glow first.`);
      return;
    }
    state.activeDiscovery = index;
    const item = discoveries[index];
    $("#discoveryPhoto").src = state.photos[index];
    $("#discoveryNumber").textContent = `PHOTO ${String(index + 1).padStart(2, "0")}`;
    $("#discoveryObject").textContent = item.object;
    $("#discoveryPrompt").textContent = item.prompt;
    $("#promptHelp").textContent = item.help;
    $("#promptAngles").innerHTML = item.angles.map((angle) => `<button type="button" data-prompt-angle="${angle}">${angle}</button>`).join("");
    $("#discoveryMemory").value = state.memories[index] || "";
    updateMemoryField();
    safeDialogOpen($("#discoveryDialog"));
    window.setTimeout(() => $("#discoveryMemory").focus(), 80);
  }

  function updateMemoryField() {
    const value = $("#discoveryMemory").value;
    $("#discoveryCount").textContent = value.length;
    $('[data-action="save-discovery"]').disabled = value.trim().length < 2;
  }

  function saveDiscovery(fallback) {
    const index = state.activeDiscovery;
    const value = fallback || $("#discoveryMemory").value.trim();
    state.memories[index] = value;
    state.currentDiscovery = Math.max(state.currentDiscovery, index + 1);
    closeDialog($("#discoveryDialog"));
    renderExplore();
    if (state.currentDiscovery >= 6) {
      window.setTimeout(() => showScreen("story-gate"), 500);
    } else {
      announce(discoveries[index].whisper);
    }
  }

  function textSignal() {
    return `${state.seedMemory} ${state.memories.join(" ")}`.toLowerCase();
  }

  function chooseCastings() {
    const signal = textSignal();
    let start = 0;
    if (/coffee|drink|cup|tea/.test(signal)) start = 1;
    else if (/plan|trip|went|next|after/.test(signal)) start = 2;
    else if (/mirror|photo|look|laugh/.test(signal)) start = 3;
    start = (start + state.castOffset) % castings.length;
    return [castings[start], castings[(start + 1) % castings.length]];
  }

  function buildStory() {
    const creator = state.creatorName || "You";
    const friend = state.friendName || "Your friend";
    const [one, two] = chooseCastings();
    const detail = state.memories.find((memory) => memory.length > 20) || state.seedMemory;
    const last = state.memories.slice().reverse().find(Boolean) || "the detail the curtain refuses to explain";
    const titleObject = /coffee|cup|tea/.test(textSignal()) ? "Cup" : /dress|sleeve/.test(textSignal()) ? "Sleeve" : "Jacket";
    const title = `The Case of the ${titleObject} That Remembered Too Much`;
    const paragraphs = [
      `${creator} and ${friend} entered the fitting room on what they both insisted was an ordinary day. The room disagreed immediately. It had overheard something about ${state.seedMemory.toLowerCase()} and considered this sufficient evidence of an approaching legend.`,
      `It cast ${creator} as the ${one.role}, armed with ${one.prop}, and ${friend} as the ${two.role}, guardian of ${two.prop}. Their first clue was not a map but a photograph that seemed to say: “${detail}”`,
      `The rack hummed. The mirror offered several unhelpful opinions. Every object remembered a slightly different version, and none of them claimed to be the truth. Together, the two friends followed the details that felt most like them: the small decisions, the changed plans, and the parts that became funnier each time they were retold.`,
      `At last, the curtain admitted its final piece of evidence: “${last}” The room declared the mystery beautifully unresolved, which was its favorite kind of solved. It returned all six photographs with one official finding: the day had become important because they kept adding to it together.`
    ];
    state.story = { title, paragraphs, one, two, caption: "Official witnesses to a day that became more legendary in the remembering." };
    renderStory();
  }

  function setText(id, value) { const node = $(id); if (node) node.textContent = value; }
  function setImage(id, value) { const node = $(id); if (node) node.src = value; }

  function renderStory() {
    const story = state.story;
    if (!story) return;
    setText("#storyTitle", story.title);
    $("#storyCopy").innerHTML = story.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    setText("#sceneNameOne", state.creatorName || "You");
    setText("#sceneNameTwo", state.friendName || "Your friend");
    setText("#sceneRoleOne", story.one.role);
    setText("#sceneRoleTwo", story.two.role);
    setText("#sceneCaption", story.caption);
    setImage("#characterOne", story.one.costume);
    setImage("#characterTwo", story.two.costume);
    setImage("#characterPropOne", story.one.propImage);
    setImage("#characterPropTwo", story.two.propImage);
    renderProfile("One", state.creatorName || "You", story.one);
    renderProfile("Two", state.friendName || "Your friend", story.two);
    $("#scenePhotos").innerHTML = state.photos.map((photo, index) => `<img src="${photo}" alt="Photograph ${index + 1}">`).join("");
    updateFriendPreview();
  }

  function renderProfile(suffix, name, casting) {
    setText(`#profile${suffix}Name`, name);
    setText(`#profile${suffix}Role`, casting.role);
    setText(`#profile${suffix}Power`, casting.power);
    setText(`#profile${suffix}Flaw`, casting.flaw);
    setText(`#profile${suffix}Prop`, casting.prop);
    setImage(`#profile${suffix}Image`, casting.costume);
  }

  function updateFriendPreview() {
    if (!state.story) return;
    const friend = state.story.two;
    ["#friendAvatar", "#friendCompleteAvatar", "#shareCharacterPreview"].forEach((id) => setImage(id, friend.costume));
    setImage("#friendProp", friend.propImage);
    ["#friendCharacterName", "#shareFriendName"].forEach((id) => setText(id, state.friendName || "Your friend"));
    ["#friendCharacterRole", "#shareFriendRole"].forEach((id) => setText(id, friend.role));
    setText("#friendStoryTitle", state.story.title);
    $("#friendSavedStory").innerHTML = state.story.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    setText("#friendInvitationCopy", `${state.creatorName || "A friend"} left six photographs and six memories inside the fitting room. You have been cast as ${friend.role}, the character who must pair them back together.`);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function startFriendQuiz() {
    state.friendQuizIndex = 0;
    state.selectedQuizPhoto = null;
    state.photoLocations = shuffledPhotoLocations();
    state.matchedPhotos = [];
    showScreen("friend-quiz");
    renderFriendQuiz();
  }

  function shuffledPhotoLocations() {
    const original = [0, 1, 2, 3, 4, 5];
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const shuffled = original.slice();
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
      }
      if (shuffled.every((photoIndex, objectIndex) => photoIndex !== objectIndex)) return shuffled;
    }
    return [2, 3, 4, 5, 0, 1];
  }

  function renderFriendQuiz() {
    const index = state.friendQuizIndex;
    if (index >= 6) {
      renderFriendComplete();
      showScreen("friend-complete");
      return;
    }
    setText("#quizProgress", `${index} / 6`);
    setText("#quizMemory", `“${state.memories[index] || "A memory the room is still holding quietly."}”`);
    setText("#quizGuidance", "Search a glowing object. Each one is hiding a different photograph.");
    $("#quizIconTrail").innerHTML = Array.from({ length: 6 }, (_, i) => `<span class="${i < index ? "is-done" : ""}" title="Memory ${i + 1}"></span>`).join("");
    $("#quizCards").innerHTML = quizObjects.map((object, objectIndex) => {
      const photoIndex = state.photoLocations[objectIndex];
      const matched = state.matchedPhotos.includes(photoIndex);
      return `
      <button class="quiz-object ${object.className} ${matched ? "is-matched" : ""}" type="button" data-quiz-object="${objectIndex}" aria-label="Search the ${object.name}${matched ? ", memory restored" : ""}">
        <span class="object-magic" aria-hidden="true"></span>
        <img src="${object.image}" alt="">
        <span class="object-name">${object.name}</span>
      </button>`;
    }).join("");
    $("#quizChoicePanel").classList.add("is-hidden");
  }

  function searchQuizObject(objectIndex) {
    const index = state.photoLocations[objectIndex];
    if (state.matchedPhotos.includes(index)) return;
    window.clearTimeout(state.quizTimer);
    state.selectedQuizPhoto = index;
    $("#quizFlashPhoto").src = state.photos[index];
    const panel = $("#quizChoicePanel");
    panel.classList.remove("is-hidden");
    const progress = $(".flash-progress", panel);
    progress.style.animation = "none";
    void progress.offsetHeight;
    progress.style.animation = "";
    state.quizTimer = window.setTimeout(() => {
      if (state.selectedQuizPhoto === index) keepLooking();
    }, 2000);
  }

  function keepLooking() {
    window.clearTimeout(state.quizTimer);
    state.selectedQuizPhoto = null;
    $("#quizChoicePanel").classList.add("is-hidden");
  }

  function chooseQuizPhoto() {
    const picked = state.selectedQuizPhoto;
    if (picked === null) return;
    window.clearTimeout(state.quizTimer);
    if (picked === state.friendQuizIndex) {
      state.matchedPhotos.push(picked);
      state.friendQuizIndex += 1;
      setText("#quizGuidance", "That pairing made the room glow warmer.");
      state.selectedQuizPhoto = null;
      window.setTimeout(renderFriendQuiz, 350);
    } else {
      setText("#quizGuidance", discoveries[state.friendQuizIndex].whisper);
      keepLooking();
    }
  }

  function renderFriendComplete() {
    setText("#friendCompleteMessage", `The room accepts your work and officially recognizes ${state.friendName || "you"} as ${state.story ? state.story.two.role : "a fantasy character of excellent judgment"}.`);
    $("#friendMatches").innerHTML = state.photos.map((photo, index) => `<figure><img src="${photo}" alt="Restored photograph ${index + 1}"><figcaption>${escapeHtml(state.memories[index])}</figcaption></figure>`).join("");
  }

  async function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = String(text).split(/\s+/);
    let line = "";
    let row = 0;
    for (const word of words) {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), x, y + row * lineHeight);
        row += 1;
        line = `${word} `;
        if (row >= maxLines - 1) break;
      } else line = test;
    }
    if (row < maxLines) ctx.fillText(line.trim(), x, y + row * lineHeight);
  }

  async function makeKeepsake(mode) {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = mode === "collage" ? 1500 : 1100;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#d9f0f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    try {
      const room = await loadImage("assets/backgrounds/01-main-fitting-room.svg");
      ctx.globalAlpha = .28;
      ctx.drawImage(room, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    } catch (_) { /* The color field remains a valid fallback. */ }
    ctx.fillStyle = "rgba(255,253,248,.94)";
    ctx.fillRect(70, 65, 1460, canvas.height - 130);
    ctx.fillStyle = "#3e4565";
    ctx.textAlign = "center";
    ctx.font = "700 58px Georgia";
    wrapText(ctx, state.story ? state.story.title : "The Fitting Room That Remembers Us", 800, 145, 1300, 64, 2);
    ctx.font = "600 25px Arial";
    ctx.fillStyle = "#656b8d";
    ctx.fillText(mode === "collage" ? "SIX RESTORED MEMORIES" : `${state.creatorName || "You"} & ${state.friendName || "Your friend"}`, 800, 250);

    const cardWidth = 360;
    const cardHeight = mode === "collage" ? 480 : 330;
    const gap = 40;
    for (let index = 0; index < 6; index += 1) {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 180 + col * (cardWidth + gap);
      const y = 305 + row * (cardHeight + 38);
      ctx.save();
      ctx.translate(x + cardWidth / 2, y + cardHeight / 2);
      ctx.rotate((index % 2 ? 1 : -1) * Math.PI / 180);
      ctx.translate(-(x + cardWidth / 2), -(y + cardHeight / 2));
      ctx.fillStyle = "#fffdf8";
      ctx.shadowColor = "rgba(62,69,101,.18)";
      ctx.shadowBlur = 18;
      ctx.fillRect(x, y, cardWidth, cardHeight);
      ctx.shadowBlur = 0;
      try {
        const photo = await loadImage(state.photos[index]);
        const imageHeight = mode === "collage" ? 300 : 265;
        const scale = Math.max(cardWidth / photo.width, imageHeight / photo.height);
        const sw = cardWidth / scale;
        const sh = imageHeight / scale;
        ctx.drawImage(photo, (photo.width - sw) / 2, (photo.height - sh) / 2, sw, sh, x, y, cardWidth, imageHeight);
      } catch (_) {
        ctx.fillStyle = "#ffd9e6";
        ctx.fillRect(x, y, cardWidth, 265);
      }
      if (mode === "collage") {
        ctx.fillStyle = "#3e4565";
        ctx.textAlign = "left";
        ctx.font = "21px Georgia";
        wrapText(ctx, state.memories[index], x + 18, y + 332, cardWidth - 36, 27, 5);
      }
      ctx.restore();
    }
    ctx.fillStyle = "#3e4565";
    ctx.textAlign = "center";
    ctx.font = "700 20px Arial";
    ctx.fillText("THE ROOM KNOWS ONLY WHAT WE TOLD IT.", 800, canvas.height - 86);
    return canvas.toDataURL("image/png");
  }

  async function prepareImage(mode) {
    const dialog = $("#exportDialog");
    setText("#exportDialogTitle", mode === "collage" ? "The memory collage is ready." : "The PNG is ready to keep.");
    setText("#exportStatus", "The room is arranging the photographs...");
    safeDialogOpen(dialog);
    try {
      const dataUrl = await makeKeepsake(mode);
      state.generatedImage = dataUrl;
      $("#exportPreview").src = dataUrl;
      $("#fullscreenExportPreview").src = dataUrl;
      const link = $("#sceneSaveLink");
      link.href = dataUrl;
      link.download = mode === "collage" ? "fitting-room-memory-collage.png" : "fitting-room-fantasy.png";
      link.setAttribute("aria-disabled", "false");
      setText("#exportStatus", "Preview the keepsake, then save or share it below.");
    } catch (error) {
      setText("#exportStatus", "The image could not be prepared in this browser. Try the full-screen preview instead.");
      console.error(error);
    }
  }

  async function shareImage() {
    if (!state.generatedImage) return;
    const blob = await (await fetch(state.generatedImage)).blob();
    const file = new File([blob], "fitting-room-keepsake.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "The Fitting Room That Remembers Us", files: [file] });
    } else {
      $("#sceneSaveLink").click();
      announce("The image was saved so you can attach it manually.");
    }
  }

  function chapterPayload() {
    return {
      photos: state.photos,
      memories: state.memories,
      creatorName: state.creatorName,
      friendName: state.friendName,
      seedMemory: state.seedMemory,
      story: state.story,
      castOffset: state.castOffset
    };
  }

  async function assetAsDataUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not package ${url}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function buildStandaloneChapter() {
    const [htmlResponse, cssResponse, jsResponse] = await Promise.all([fetch("index.html"), fetch("styles.css"), fetch("app.js")]);
    let html = await htmlResponse.text();
    const css = await cssResponse.text();
    let embeddedJs = await jsResponse.text();
    let data = JSON.stringify(chapterPayload()).replace(/</g, "\\u003c");
    const assetPaths = Array.from(new Set((html.match(/assets\/[A-Za-z0-9_./-]+\.svg/g) || []).concat(embeddedJs.match(/assets\/[A-Za-z0-9_./-]+\.svg/g) || [])));
    const replacements = await Promise.all(assetPaths.map(async (path) => [path, await assetAsDataUrl(path)]));
    replacements.forEach(([path, assetData]) => {
      html = html.split(path).join(assetData);
      embeddedJs = embeddedJs.split(path).join(assetData);
      data = data.split(path).join(assetData);
    });
    html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${css}</style>`);
    html = html.replace(/<script id="sharedChapterData">[\s\S]*?<\/script>/, () => `<script id="sharedChapterData">window.__SHARED_CHAPTER__ = ${data};<\/script>`);
    html = html.replace('<script src="app.js"><\/script>', () => `<script>${embeddedJs.replace(/<\/script>/gi, "<\\/script>")}<\/script>`);
    return new Blob([html], { type: "text/html" });
  }

  async function downloadFriendChapter(share) {
    if (!$("#shareConsent").checked) return;
    const buttons = $$(".share-gated");
    buttons.forEach((button) => { button.disabled = true; });
    announce("The room is packaging the private chapter.");
    try {
      const blob = await buildStandaloneChapter();
      const file = new File([blob], "fitting-room-chapter-two.html", { type: "text/html" });
      if (share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: state.story.title, text: "The fitting room left you a private memory mystery.", files: [file] });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
    } catch (error) {
      console.error(error);
      announce("The chapter could not be packaged. Keep this tab open and try again.");
    } finally {
      buttons.forEach((button) => { button.disabled = !$("#shareConsent").checked; });
    }
  }

  function applySharedChapter(payload) {
    if (!payload || !Array.isArray(payload.photos) || payload.photos.length !== 6) return false;
    state.photos = payload.photos;
    state.memories = payload.memories;
    state.creatorName = payload.creatorName;
    state.friendName = payload.friendName;
    state.seedMemory = payload.seedMemory;
    state.story = payload.story;
    state.castOffset = payload.castOffset || 0;
    updateFriendPreview();
    showScreen("friend-intro");
    return true;
  }

  function handleAction(action) {
    const actions = {
      "enter-room": enterRoom,
      "load-demo": loadDemo,
      "hide-photos": beginHiding,
      "begin-search": () => { showScreen("explore"); renderExplore(); },
      "close-discovery": () => closeDialog($("#discoveryDialog")),
      "save-discovery": () => saveDiscovery(),
      "skip-memory": () => saveDiscovery("I remember the feeling of this moment more clearly than the details."),
      "generate-story": () => { buildStory(); showScreen("ending"); },
      "shuffle-fantasy": () => { state.castOffset += 1; buildStory(); },
      "prepare-share": () => { updateFriendPreview(); safeDialogOpen($("#shareDialog")); },
      "close-share": () => closeDialog($("#shareDialog")),
      "preview-friend-chapter": () => { closeDialog($("#shareDialog")); updateFriendPreview(); showScreen("friend-intro"); },
      "begin-friend-quiz": startFriendQuiz,
      "keep-looking": keepLooking,
      "choose-photo": chooseQuizPhoto,
      "replay-friend-quiz": startFriendQuiz,
      "download-scene": () => prepareImage("scene"),
      "download-memory-collage": () => prepareImage("collage"),
      "close-export": () => closeDialog($("#exportDialog")),
      "view-export": () => { closeDialog($("#exportDialog")); safeDialogOpen($("#imageViewerDialog")); },
      "close-viewer": () => closeDialog($("#imageViewerDialog")),
      "share-export": shareImage,
      "download-friend-chapter": () => downloadFriendChapter(false),
      "share-friend-chapter": () => downloadFriendChapter(true),
      privacy: () => safeDialogOpen($("#privacyDialog")),
      "close-privacy": () => closeDialog($("#privacyDialog")),
      home: () => showScreen("welcome"),
      restart: () => window.location.reload()
    };
    if (actions[action]) actions[action]();
  }

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      event.preventDefault();
      if (!actionTarget.disabled) handleAction(actionTarget.dataset.action);
      return;
    }
    const discovery = event.target.closest("[data-discovery]");
    if (discovery) { openDiscovery(Number(discovery.dataset.discovery)); return; }
    const quizObject = event.target.closest("[data-quiz-object]");
    if (quizObject) { searchQuizObject(Number(quizObject.dataset.quizObject)); return; }
    const prompt = event.target.closest("[data-prompt-angle]");
    if (prompt) {
      $("#discoveryPrompt").textContent = prompt.dataset.promptAngle;
      $("#discoveryMemory").focus();
      return;
    }
    const seed = event.target.closest("[data-seed-prompt]");
    if (seed) {
      $("#seedMemory").value = seed.dataset.seedPrompt;
      $("#seedMemory").focus();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-photo-input]")) readPhoto(event.target.files[0], Number(event.target.dataset.photoInput));
    if (event.target.id === "shareConsent") {
      $$(".share-gated").forEach((button) => { button.disabled = !event.target.checked; });
    }
  });
  $("#discoveryMemory").addEventListener("input", updateMemoryField);

  ["#discoveryDialog", "#privacyDialog", "#exportDialog", "#imageViewerDialog", "#shareDialog"].forEach((id) => {
    $(id).addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeDialog(event.currentTarget);
    });
  });

  renderPhotoGrid();
  showScreen("welcome");
  if (!applySharedChapter(window.__SHARED_CHAPTER__)) showScreen("welcome");
})();
