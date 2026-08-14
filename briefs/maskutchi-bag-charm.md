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
| World | One clear zip pouch on a bag strap, empty, hanging against a pastel blue sky of shining stars. Twelve miniatures spill beside it — three of them sealed as pastel parcels — and the bunny sits outside on the strap |
| Quest (visible goal) | On the paper tag: *"fit your world in here before you get there."* Visible, and impossible to do tidily, because the pouch keeps editing itself |
| Core loop (3–5 actions) | Find how a miniature wants to be carried → drop it in → watch the pouch agree or disagree → rearrange, or pull one back out → zip it shut when it looks like yours |
| Personality (how the world misbehaves) | **Matching neighbours multiply, lone strangers fade** — unchanged. On top of that, each miniature has one way it wants to be carried, and until that gesture is found it wriggles out of the pouch. The faster your hand moves the deeper and jumpier the sky gets; at full speed the pouch spits things out and the bunny tells you to ease off. Move slowly and the blue warms, a star sometimes falls and protects whatever it lands on |
| The one secret | **The bunny can go in.** Nothing says so — it starts outside on the strap. Anything resting near the bunny is exempt from both rules: it never duplicates and never fades. The hint is that the bunny is the only thing in the world that is alone and unafraid. Mystery parcels are a playful layer on top of this, not a second secret |
| Traces | Original five: `madeRoomFor`, `pulledBackOut`, `tempo`, `copiesKept`, `bunnyInside`. Beside them, for the shop name only: `packagesOpened`, `gesturesFound`, `rushCount` |
| Reflection | Counts what they actually did, never what they are — how many times they went back for the same fading thing, how many copies they let stand, how many they evicted, how they carried things. Closes on what the pouch kept because they decided it should. The craftsman name is a shop title built from those traces, not a diagnosis |
| Transformation | Empty glowing outline → a closed pouch full of one specific arrangement, swinging on the strap, in the weather the player's own tempo produced, stamped with a shop name the session earned |
| Take-home artifact | A downloadable PNG of the zipped pouch plus the craftsman name. Share uses the Web Share API with that PNG when the phone allows it; otherwise keep-it still downloads, and copy-link puts the public game URL on the clipboard |

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
- Open the parcels, or never touch them — both pouches still get a shop name

### How each miniature wants to be carried

One small set of gestures, reused, so they are learnable rather than twelve minigames. Until the
gesture is found, dropping the miniature in the pouch fails out loud — it wriggles, glows, the
bunny comments. After that it settles, and the pouch's old rules take over.

| Miniature | Gesture | Why |
|---|---|---|
| parfait | upright | a tall glass, would spill |
| soda | upright | a bottle, same |
| tiny star | shake | it wants to be woken |
| blue candy | shake | flick the wrapper |
| grape candy | shake | sticky, same flick |
| cookie packet | spin | turn the packet over |
| grape tart | spin | round, it wants a turn |
| yakult | hold | sit with the little bottle a beat |
| peanut butter | tap-twice | tap the lid |
| blind bag | tap-twice | tap the bag |
| blue pudding | slow | jelly, a quiet hand |
| choco box | slow | a fancy box, carried gently |
| the bunny | slow | the one that is not in a hurry |

**Wrapped (blind-box), three only:** the star, the cookie packet, the yakult. A sealed pastel
parcel using the existing cream/lilac language — canvas, not a new sprite sheet. Unwrapping is
the "ohhh": the gesture splits the wrap, the miniature appears, then it can go in. The other
nine (and the bunny) show their personality by how they refuse. The existing cream-family
`blindbag` miniature is already a toy of a bag; it is not wrapped, so the two ideas do not collide.

Glow is one-at-a-time, lilac `(220, 206, 255)`, on the next mystery — a just-refused item if
there is one, otherwise the next sealed parcel. It retires when that one unlocks.

### Anti-stuck rules

There is no fail state, so being stuck is the only failure, and the timer means it has to be
caught fast.

1. **Fading is never silent.** An item about to go pops with a sparkle and leaves a faint ring
   where it was, so the player sees the world acting rather than a bug.
2. **The bunny points.** It leans toward the glowing mystery, or toward the nearest fading item,
   and on a stall hops toward the pouch mouth.
3. **The bunny-secret ladder ends nearly explicit.** Wordless first, then on the tag: "…" →
   *"the bunny isn't worried"* → *"nothing next to the bunny has ever disappeared."* Each rung
   retires once the player puts the bunny in.
4. **Gesture teaching, same ladder, on spark pace within ~15–20 seconds.** Wordless glow → bunny
   murmur → one nearly-explicit line for the *current* glowing item's gesture, then the player
   generalises. Near-misses shiver. A rushed hand gets a bunny line, not a UI warning.
5. **The ending never depends on the secret, nor on opening every parcel.** The zip closes on
   time or on demand either way. A player who never unwraps still gets a craftsman name, a card,
   and a share.

### Craftsman names

A two- or three-word shop title from what they did, never who they are. Tokens such as Slow,
Moonfold, Rush, Parcel, Star, Ribbon, Binder, Keeper, Folder, Packer. Shown on the card and in
the share line. The word "craftsman" does not appear until that card.

## What was learned

**The background decides whether the art works, and it decides it late.** Everything in the
supplied PNGs is drawn on opaque black, so on a dark sky the sprites looked finished while
hiding two whole categories of problem: the pouch's interior was a filled black rectangle
pretending to be transparency, and every "dark detail" inside a sprite — the donut's centre,
the links of the ball chain, the gap under the parfait's glass foot — was actually the
background showing through a hole. Moving to pastel blue made all of it visible at once. The
rule that came out of it is one line long: in this art every enclosed black region is a hole,
except the pouch's interior, which is the vinyl and becomes a faint tint. Guessing per sprite
was what produced black blobs; a single rule with one deliberate exception fixed all fourteen.

**Judge the art at the size it is drawn, not in a table.** The keyed edges do carry a measurable
dark fringe — the black they were anti-aliased against is still in them — and unmatting it,
which is arithmetic and provably faithful, was tried and reverted. On a black matte nothing
distinguishes the artist's own navy outline from the background it was blended with, so
recovering the edge brightened the outlines away: at 5x zoom and in the numbers the sprites were
cleaner, and at 22 to 62 pixels on screen they were hazy stickers with no line and the yakult
bottle nearly dissolved. The fringe is invisible at that size and the outlines are the whole
character of this art. Anything touching the edges has to be looked at over the pastel sky at
in-game size before it is believed.

**Recolouring the leftover black worked where removing it did not.** The residue cannot be
divided out, but it can be made to belong: it is blended toward `(220, 206, 255)`, the lilac the
bunny's ears are already painted with. Reaching only pixels below luminance 45 keeps it clear of
the line work, which starts at 76, so the outlines come through untouched — and the invisible
pixels just outside the sprite are painted lilac too, because the downscale mixes their colour
into the edge and it should find lilac there rather than black. That much is a small win, honest
but subtle. The visible win was elsewhere: three spots are dark *paint* rather than residue — the
candy's wrapper fin, the cookie packet's corner, the shadow behind the yakult's cap — folds the
artist made near-black because the background was going to be black too. On the pastel sky they
read as bites out of a sticker, and lifting them toward the same lilac turns each one back into a
shadow. Nothing in the pixels tells them apart from the soda's navy cap, which is shading on a
dark sprite and has to stay: brightness of the sprite, brightness around the spot and distance
from the edge all measured the same for both. So they are named in the slicer, one line, an art
call recorded rather than a heuristic guessed.

**A translucent tint is a better see-through than transparency.** Cutting the interior out
entirely made the pouch read as an empty outline. Twenty per cent of `(214, 238, 255)` over the
miniatures — drawn underneath — is what makes it read as plastic, because the things inside it
are very slightly veiled rather than simply framed.

**Personality needs a cap or it eats the pouch.** "Matching neighbours multiply" with no limit
ends every session the same way: fifteen of whatever the player happened to put down first. Four
of a kind is enough to feel like a crowd and leaves room for the other eleven miniatures to
matter.

**The weather is more legible than the rule it replaced.** The protective sparkle was invented
as a mechanic and read as arbitrary. The same mechanic motivated by the sky — move slowly, the
blue warms, a star falls and lands on something — is discovered rather than explained, and it
costs nothing extra: the tempo the sky is already reading is the tempo the star needs.

**Time-based decay, not per-frame lerp.** Both weather values were originally eased a fixed
fraction each frame, which quietly ties how fast the sky reacts to the frame rate. Exponential
decay against real elapsed time behaves the same on a good machine and correctly on a bad one —
and it is the only version that can be tested headlessly at all.

**Diegetic difficulty works, and it needs one honest clock.** Three charms on the keyring
instead of a difficulty menu was the right call, but with no numbers anywhere the player has
nothing to plan against. The strap's shadow creeping across the sky is the whole HUD.
