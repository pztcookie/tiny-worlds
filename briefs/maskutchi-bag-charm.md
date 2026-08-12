# Brief: Maskutchi Bag Charm

## 1. Personal lens

*The moral behind the game. What am I exploring? The game should embody it without ever
stating it.*

> Self-authorship: who gets to decide what belongs in my world? The game does not ask the player
> to discover a true identity. It hands them a messy assortment — familiar, repetitive, strange,
> tiny, mismatched — and makes them decide what to make room for. Instead of finding one true
> self, build a world where different parts of ourselves can coexist. And even in chaos, part of
> ourselves still comes through.

## 2. Object / theme

*One environment, one main object or character or system. One room in a universe.*

- **Environment:** a clear vinyl zip pouch charm swinging from a bag strap, seen close up against
  a pastel blue sky full of small shining stars. It starts completely empty.
- **Main object / character / system:** twelve miniature food toys, plus the bunny — Maskutchi
  itself — who begins sitting on the strap outside the pouch, watching. The bunny can be put
  inside like anything else.
- **Emotional premise:** you did not choose what you were handed, but you choose what stays.

## 3. Framework

- [ ] `framework/PRODUCT_FRAMEWORK.md` (default — the 0–10 structure)
- [x] Custom / modified — described below

> `framework/VIBE_CODING_FRAMEWORK.md`, the 1-Hour Vibe Coding framework, used for this game
> only. The three existing games keep the house framework. Two notes on applying it:
>
> - It separates HOOK from PERSONALITY, but here they are one machine. The pouch that duplicates
>   and dissolves is both the "what just happened?" and the world's own will. The strangeness has
>   to land in the first ten seconds rather than being saved for later.
> - It ships no product test, so the ten questions at the end of the house framework still decide
>   when this is done, plus the framework's own final read: Action → Surprise → Curiosity →
>   Reflection → "This feels like mine."

## 4. Desired feeling

`cute-but-uneasy` `mischievous` **dominant** · `nostalgic` `whimsical` `cozy` **accents**

> The pouch is adorable and does not do as it is told. Control against chaos is the whole
> atmosphere: the player is always tidying something that is quietly rearranging itself.

## 5. References

- **Image folder:** `games/maskutchi-bag-charm/assets/`, sliced by `scripts/slice_assets.py` from
  fifteen supplied 791×1024 PNGs. They are per-layer exports of one composition on an opaque
  black background, not transparency.
- **What to take from it:** Y2K Japanese kawaii. Sticker-flat line work, grape and blueberry
  purples against milk blue, cream and lilac. The sky behind everything is pastel blue with small
  shining stars drifting in it, and the pouch is genuinely see-through against it.
- **What the art needs before it works on pastel:** the pouch's interior is a filled black shape
  in the source file, not transparency, and so are the six shine strokes along its edge. Both are
  invisible on black and read as smears on pastel blue, so both have to become pale translucent
  tint — that is what makes the pouch look like clear vinyl. This applies to the pouch sprite
  only. Every other sprite keeps its enclosed dark regions, or the parfait and the donut ring get
  holes punched through them.
- **Games / sites to feel like:** gashapon capsule toys, blind-bag food miniatures, the clear
  pencil case a keyring collection lives in.
- **What NOT to imitate:** inventory grids, Tetris packing, scores, stars out of three, a
  correct solution, a fail state.

## 6. Time limit

- [x] 1 hour — one mechanic, one secret, ship it

## 7. Constraints

- [x] Browser-based, opens with a static file server, no build step
- [x] Dependencies minimal — vanilla HTML / CSS / JS
- [ ] LLM / image API available — **no.** Scripted and emergent intelligence only, fully offline
- [x] Must work on mobile / touch
- [x] Other: the player picks a length of time at the start, diegetically, as the world's pace
      rather than as a difficulty menu. Running out of time is never a loss — the zip simply
      closes. There is no correct pouch.

---

## Agent fills this in

| Slot | Decision |
|---|---|
| World | One clear zip pouch on a bag strap, empty, hanging against a pastel blue sky of shining stars. Twelve miniatures spill beside it and the bunny sits outside on the strap |
| Quest (visible goal) | On the paper tag: *"fit your world in here before you get there."* Visible, and impossible to do tidily, because the pouch keeps editing itself |
| Core loop (3–5 actions) | Drag a miniature in → watch the pouch agree or disagree with it → move things next to each other, or pull one back out → zip it shut when it looks like yours |
| Personality (how the world misbehaves) | **Matching neighbours multiply, lone strangers fade.** A miniature sitting near another of its own colour family may be copied; one with no relative nearby fades in steps and then pops. On top of that: the faster your hand moves the deeper and jumpier the sky gets — stars streak, the strap swings, the pouch decides more often; move slowly and the blue warms toward cream, the stars settle into a slow twinkle, and one of them sometimes falls and protects whatever it lands on; at full speed the pouch occasionally spits something back out |
| The one secret | **The bunny can go in.** Nothing says so — it starts outside on the strap. Anything resting near the bunny is exempt from both rules: it never duplicates and never fades. The hint is that the bunny is the only thing in the world that is alone and unafraid |
| Traces (3–5 state variables) | `madeRoomFor` (items that faded at least once and were still there at the end), `pulledBackOut`, `tempo` (average hand speed), `copiesKept`, `bunnyInside` |
| Reflection | Counts what they actually did, never what they are — how many times they went back for the same fading thing, how many copies they let stand, how many they evicted. Closes on what the pouch kept because they decided it should |
| Transformation | Empty glowing outline → a closed pouch full of one specific arrangement, swinging on the strap, in the weather the player's own tempo produced |
| Take-home artifact | A downloadable PNG: the zipped pouch with exactly their contents, plus one line about what they made room for |

### The pace charms

Three charms hang on the keyring at the start. Clicking one begins the game and sets how long the
world gives you. No numbers on screen — the strap's shadow creeps as time goes.

| Charm | Time | What it feels like |
|---|---|---|
| Moon | 3:00 | Enough time to arrange. The rules are slow and legible |
| Star | 1:45 | The pouch edits about as fast as you can tidy |
| Spark | 1:00 | You cannot win the tidying. You can only choose |

### Colour families

Duplication and fading both key off four families, because colour is the most legible attribute
in this art and needs no legend:

- **Grape** — soda bottle, grape candy, grape tart, parfait
- **Milk** — blue candy, yakult bottle, blue pudding, tiny star
- **Cream** — cookie packet, peanut butter jar, choco assort box, blind bag with bear
- **Lilac** — the bunny, alone, and never dissolved. That exception is the hint

### Ways to play, none of them correct

One mechanic, four legible styles, and the ending names the style rather than scoring it:

- Let it duplicate and end up with a pouch crammed full of near-identical things
- Keep one of each and spend the whole time fighting the fade
- Move slowly, keep the weather warm, and arrange something deliberate
- Put the bunny in and let the strangers stay

### Anti-stuck rules

There is no fail state, so being stuck is the only failure, and the timer means it has to be
caught fast.

1. **Fading is never silent.** An item about to go pops with a sparkle and leaves a faint ring
   where it was, so the player sees the world acting rather than a bug.
2. **The bunny points.** It leans toward the nearest fading item from outside the pouch, and on a
   stall hops toward the pouch mouth.
3. **The ladder ends nearly explicit.** Wordless first, then on the tag: "…" → *"the bunny isn't
   worried"* → *"nothing next to the bunny has ever disappeared."* Each rung retires once the
   player puts the bunny in.
4. **The ending never depends on the secret.** The zip closes on time or on demand either way,
   and every pouch gets a reflection and a card. The bunny only changes what is on it.

## What was learned

*Filled in at the end of the build.*
