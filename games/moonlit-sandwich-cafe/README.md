# Moonlit Sandwich Cafe

A small, playful browser game about **self-authorship** — you compose a sandwich where
different parts of you get to coexist on one plate.

## Play

**[Play it in your browser →](https://pztcookie.github.io/tiny-worlds/games/moonlit-sandwich-cafe/)**

No build step, no API key, no backend. To run it locally instead:

```bash
cd games/moonlit-sandwich-cafe
python3 -m http.server 8765   # then open http://localhost:8765
```

## The loop

1. Start with bread. Every bread has a quantity, so you can stack bread on bread — a sandwich with no fillings at all is a valid, and separately rewarded, choice.
2. Stack up to 10 layers from a limited pantry. Duplicates are allowed while stock lasts, and bread can go back on top as a lid.
3. Poke around the cafe. The jar, the memory box and the star key can be **stacked into the sandwich**, not just looked at.
4. Serve it. The card shows the sandwich you actually built, the traits you displayed while building it, and the room those traits add up to.
5. Put it in the oven to melt your exact recipe together into a single generated pixel sandwich.

## Things the world does on its own

The kitchen is not a vending machine. While you build, it may:

- hesitate and refuse a layer for a moment
- hand you a second one for free ("the tomato brought a friend")
- swap hummus and onion into a different order
- give you something other than what you picked, once the stack is tall enough
- restock whatever you have reached for three times
- sway when you build a bread tower

And the sandwich itself is pokeable. Clicking it resettles every layer, and occasionally
knocks the top one back onto the shelf.

## Mischief signals

Nothing in the game explains itself with a tooltip. Instead, when you go quiet for a few
seconds, the room starts hinting. A ring pulses around the jar. A small gold spark and a
line of text drift up beside whatever you have not tried yet — the sandwich, the bread
tray, your unused curios, the oven.

The hints have a personality of their own:

- they escalate only if ignored, starting at a coy `…` and ending at *"poke it. nothing bad happens."*
- roughly a quarter of them flicker out after half a second, as if they had second thoughts
- moving your cursor toward one scares it off — it darts away and fades
- the sandwich twitches by itself while the poke hint is up, so poking feels like a reply
- each hint retires for good once you do the thing, and never nags again

## The take-home

The ending reads your behaviour, not your answers. It tracks bread-versus-filling ratio,
repeats, variety, undos, clears, pokes, curios used, hesitation between choices, and whether
you found the secret — then names up to three traits (Bread Purist, Room Emptier, Second
Guesser, Lid Keeper, Ritualist, Shape Shifter…) and turns the strongest one into a place:
*"your inner room looks like a desk with seven drafts of the same short letter."*

## What each part of the framework became

| Framework | Implementation |
|---|---|
| World | One cafe room where day and night share a window |
| Quest | "Make a sandwich that feels like home" |
| Play | Stack bread and fillings → poke it → serve |
| Personality | Hesitations, free duplicates, self-reordering ingredients, items that become something else, restocks for loyalty |
| Secret | Galaxy Sauce + Moon Crystals, **or** jar → box → star key stacked into the Secret Pocket bread |
| Trace | repeats, variety, undos, clears, pokes, curios, pacing, bread ratio, secret |
| Transformation | The cafe brightens, the pantry depletes, and the sandwich is baked into one image |
| Take-home | A downloadable card with your sandwich, your traits and your inner room (also kept in `localStorage`) |

## The oven (image generation)

The "Put it in the oven" button builds a prompt from the exact stack — vessel, ingredients,
counts and bottom-to-top order — and generates an image with **Flux via Pollinations**, which
needs no API key. The result is routed through an image proxy, pixelated and colour-quantised
so it matches the game's pixel-art world, then composited into a downloadable card.

Fallbacks, in order:

1. Proxied generation → pixelated, downloadable card.
2. Direct generation → displayed, saved by opening the image.
3. Offline → the real stack is melted together locally on canvas.

If you later get a Pollinations token for higher rate limits, set it once in the console:

```js
localStorage.setItem("moonlit-flux-token", "YOUR_TOKEN");
```

## Assets

- Story art: `assets/01`–`10` (cafe, breads, curios, rare sandwich)
- Ingredient sprites: cut from `assets/stackable_layers_visuals.png` into `assets/ingredients/`

Re-cut the sprites at any time. This is the one place in the repo that needs a dependency, and
it is a build-time tool rather than something the game loads:

```bash
python3 -m venv .venv && .venv/bin/pip install Pillow
.venv/bin/python scripts/crop_ingredients.py
```

## Brief

Built from [`briefs/moonlit-sandwich-cafe.md`](../../briefs/moonlit-sandwich-cafe.md) under the
house framework in [`framework/PRODUCT_FRAMEWORK.md`](../../framework/PRODUCT_FRAMEWORK.md).
