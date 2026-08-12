# Brief: The Fitting Room

## 1. Personal lens

*The moral behind the game. What am I exploring? The game should embody it without ever
stating it.*

> Constant switching creates liminality. Old identities no longer fully fit, the new one doesn't
> completely feel like home, and the familiar reference points are gone.

## 2. Object / theme

*One environment, one main object or character or system. One room in a universe.*

- **Environment:** one fitting-room cubicle — curtain, rail, mirror. A threshold you are neither
  in nor out of.
- **Main object / character / system:** dresses and clothes, pixel art drawn in canvas and CSS.
  The mirror reflects not the cubicle but a room where the garment fit.
- **Emotional premise:** nothing fits the way it used to, and that's information, not failure.

## 3. Framework

- [x] `framework/PRODUCT_FRAMEWORK.md` (default — the 0–10 structure)
- [ ] Custom / modified

> Checked against the framework supplied at intake: the same document, section for section.

## 4. Desired feeling

`melancholy` `dreamlike` **dominant** · `surreal` `mischievous` `cozy` `whimsical` **accents**

> Ranked rather than cut. Melancholy and dreamlike carry the room. Surreal lives only in what the
> mirror shows. Mischievous is how the garments resist. Cozy is warmth that stays just out of
> reach — never warmth the player is given.

## 5. References

- **Image folder:** none supplied. Pixel art drawn in code, house style.
- **What to take from it:** —
- **Games / sites to feel like:** —
- **What NOT to imitate:** dressing-up games. No scores, no timers, no correct outfit, no
  approving audience.

## 6. Time limit

- [x] 1 hour — one mechanic, one secret, ship it

## 7. Constraints

- [x] Browser-based, opens with a static file server, no build step
- [x] Dependencies minimal — vanilla HTML / CSS / JS
- [ ] LLM / image API available — **no.** Scripted and emergent intelligence only, fully offline
- [ ] Must work on mobile / touch
- [x] Other: garments must read as old or new without a legend. Old ones are faded and creased
      and stay warm after they come off; new ones are crisp with the tag still on.

---

## Agent fills this in

| Slot | Decision |
|---|---|
| World | One cubicle — curtain, rail, mirror. The mirror never shows the cubicle; it shows a small pixel room where the garment on the player's body used to fit |
| Quest (visible goal) | Printed on the curtain: *"get dressed for somewhere you haven't been yet."* Visible, and unsolvable by finding a garment that fits |
| Core loop (3–5 actions) | Take a garment off the rail → put it on → read what the mirror shows → keep it, layer it, or hang it back |
| Personality (how the world misbehaves) | The reflection always arrives a beat late; the same garment doesn't always show the same room; sleeves sometimes refuse and the fit shifts between attempts; a garment hung back may return to the rail in a slightly different colour; the double-loaded hanger drifts to the front of the rail on its own |
| The one secret | **Old under new.** The mirror shows *this* cubicle, furnished with objects lifted from whichever rooms the player lingered in longest — and for the first time the reflection is in sync instead of a beat late |
| Traces (3–5 state variables) | `garmentsWorn`, `longestLinger` (which room held them), `oldNewRatio`, `layerAttempts`, `secretFound` |
| Reflection | Names what the player reached for, never who they are — Tag Keeper, Returner, Room Sitter, Quick Changer, Layerer — and turns the strongest into a place, the way the cafe turns traits into an inner room |
| Transformation | The cubicle starts bare under blue light. Wallpaper, light and one object from each lingered-in room leak into it. After the secret, the curtain line softens to *"you can stay in here as long as you like"* |
| Take-home artifact | A downloadable card: a pixel strip of the garments the player kept returning to, or the furnished cubicle if the secret was found, plus one line about what they kept reaching for rather than what they chose |

### The four pairings

Order matters, and that is itself a discovery. One machinery — drag a second garment onto a
dressed body — four legible outcomes.

| Pairing | What the mirror does |
|---|---|
| **Old under new** | *The secret.* This cubicle, furnished, reflection in sync |
| **Old over new** | The old room, with one object in it that doesn't belong there |
| **New over new** | Two rooms at once, overlaid and misregistered — a double exposure, neither legible |
| **Old over old** | One room, furniture pushed against the walls, as if being moved out of |

New over new is the near-miss and must never be silent: silence reads as *that isn't a thing you
can do*, a response reads as *not those two*. Old over old is the closest this game comes to
saying the lens out loud, so it stays wordless.

### Anti-stuck rules

There is no wrong move here — no fail state, no score, no correct garment — so "stuck" is the
only failure, and it comes in two kinds.

1. **Near-misses answer.** New over new returns the double exposure, which rewards the gesture,
   says the problem is *which* layer rather than *whether* to layer, and hints without text.
2. **Circling is detected.** `template/game.js` only hints on an idle timer that every action
   resets, so a player happily working through the rail without ever layering is never idle and
   never hinted. After several garments with no layering attempt, the room begins hinting while
   the player is still active — wordlessly first: the double-loaded hanger comes forward, the
   warm garment gets warmer.
3. **The ladder ends nearly explicit.** Wordless cues first — two garments sharing one hanger, a
   hem visible under a hem in one of the mirror rooms, a garment still warm after it comes off.
   Then, only on a stall: "…" → *"the hanger is holding two"* → *"one of these goes underneath."*
   The last rung disambiguates order. Each rung retires for good once the player layers.

The ending never depends on the secret. `finish` unlocks on activity alone, so a player who never
layers still gets the transformed cubicle, a reflection and a card — the secret only changes what
is on it. A game about things not fitting must not withhold its ending until something fits.

## What was learned

*Filled in after the build, with what actually worked at the desk.*
