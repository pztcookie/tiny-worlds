# Brief: Moonlit Sandwich Cafe

*A worked example. This is the brief that produced `games/moonlit-sandwich-cafe/` — read it
alongside that game to see how each slot became code.*

## 1. Personal lens

> Self-authorship. Build our own rituals, aesthetics, relationships, values, and worlds —
> instead of finding one "true self", create a world where different parts of ourselves can
> coexist.

## 2. Object / theme

- **Environment:** a cozy, whimsical cafe where day and night share the same window
- **Main object / character / system:** a sandwich you stack, layer by layer
- **Emotional premise:** everything you are is allowed on one plate

## 3. Framework

- [x] `framework/PRODUCT_FRAMEWORK.md`

## 4. Desired feeling

`cozy` `whimsical` `mischievous` `dreamlike`

> Warm pixel light, a kitchen that has opinions. Playful above all, and as imaginative as
> possible in the time available.

## 5. References

- **Image folder:** a set of pixel illustrations — cafe interior, five breads, three curios, one rare sandwich
- **What to take from it:** palette, sprite scale, the day/night window motif
- **Games / sites to feel like:** cozy pixel cafe sims, but with one screen instead of a map
- **What NOT to imitate:** timers, scores, customer queues, anything that makes it a job

## 6. Time limit

- [x] 1 hour — one mechanic, one secret, ship it

## 7. Constraints

- [x] Browser-based, static file server, no build step
- [x] Dependencies minimal — vanilla HTML / CSS / JS
- [x] **No API key.** Image generation, if any, must use a keyless service and degrade to a
      local canvas composite when offline.

---

## Agent fills this in

| Slot | Decision |
|---|---|
| World | One cafe room where day and night share a window |
| Quest (visible goal) | "Make a sandwich that feels like home" |
| Core loop (3–5 actions) | Pick bread → stack up to 10 layers → poke the sandwich → serve |
| Personality (how the world misbehaves) | Hesitates and refuses a layer; hands you a free duplicate; reorders hummus and onion behind your back; swaps in something else once the stack is tall; restocks whatever you reached for three times; sways during a bread tower |
| The one secret | Galaxy Sauce + Moon Crystals, **or** jar → memory box → star key stacked into the Secret Pocket bread |
| Traces (3–5 state variables) | repeats, variety, undos/clears, pokes, curios used, pacing, bread-to-filling ratio, secret found |
| Reflection | Names up to three behavioural traits (Bread Purist, Second Guesser, Lid Keeper…) and turns the strongest into a place: *"your inner room looks like a desk with seven drafts of the same short letter"* |
| Transformation | The cafe brightens, the pantry visibly depletes, the sandwich is baked into a single image |
| Take-home artifact | A downloadable card with the sandwich, the traits and the inner room, also kept in `localStorage` |

## What was learned

- **Idle hints beat tutorials.** Nothing explains itself; when the player goes quiet for a few
  seconds the room starts hinting, escalating only if ignored, and each hint retires for good
  once the player does the thing.
- **Hints with cold feet are funnier than reliable hints.** Roughly a quarter flicker out after
  half a second, and moving the cursor toward one scares it away.
- **Make the goal object pokeable.** Clicking the sandwich resettles every layer and sometimes
  knocks the top one back onto the shelf — the single cheapest source of "huh?".
- **Let the null choice win something.** A sandwich of nothing but bread is a valid and
  separately rewarded answer, which is the personal lens doing its job silently.
