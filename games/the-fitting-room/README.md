# The Fitting Room

A small browser game about **liminality** — old clothes no longer fit, the new ones don't feel
like home yet, and the mirror is showing you somewhere you used to be.

## Play

**[Play it in your browser →](https://pztcookie.github.io/tiny-worlds/games/the-fitting-room/)**

No build step, no dependencies, no API key, no backend. To run it locally instead:

```bash
cd games/the-fitting-room
python3 -m http.server 8765   # then open http://localhost:8765
```

## The loop

1. Take a garment off the rail. Three are old — faded, creased, and warm once you've worn them.
   Three are new, crisp, with the tag still on.
2. It goes on the body. The mirror doesn't show the cubicle; it shows a small room where that
   garment used to fit.
3. Lean into the mirror and it tells you where you are, and nothing else.
4. Layer a second garment over the first, or click yourself to take the outer one off and hang
   it back.

Two garments is all that will fit, and **which one is outermost changes everything.**

## The four pairings

| Pairing | What the mirror does |
|---|---|
| Old under new | *the secret* — see below |
| Old over new | The old room, with a garment you haven't worn yet standing in it |
| New over new | Two rooms at once, overlaid and misregistered, neither legible |
| Old over old | The room split down the middle and slid apart, everything shoved against the walls |

New over new is the near-miss, and it is never silent — silence would read as *that isn't a
thing you can do*, where a response reads as *not those two*.

## The secret

<details>
<summary>Spoiler</summary>

Wear an **old garment underneath a new one**. The mirror stops showing somewhere else and shows
*this* cubicle — the same pink curtain, the same proportions — except furnished and warmly lit,
as though it had been a room all along. Two details carry it: every other reflection arrives a
beat late, and this one is instant and in sync, the only time the mirror actually reflects you.
And the line above the curtain softens from *get dressed for somewhere you haven't been yet* to
*you can stay in here as long as you like*.

There is no fanfare and no win screen. The ending never required it.

</details>

## Things the world does on its own

The cubicle is not a dressing app. While you're in it:

- the reflection always arrives a beat late, except once
- an old garment does not always remember the same room
- a sleeve sometimes refuses, and the fit shifts between attempts
- anything you hang back may come back a slightly different colour
- the hanger holding two drifts to the front of the rail by itself

## If you get stuck

There is nothing to get wrong here — no score, no timer, no correct outfit — so stuck is the
only failure, and it comes in two kinds. Go quiet and the shy idle hints start climbing a
three-rung ladder from `…` to *"one of these goes underneath."* Stay busy but circle — four
garments tried with no layering attempt — and the room starts hinting anyway, wordlessly first:
the double-loaded hanger comes forward, the warm garment gets warmer. Each hint retires for good
once you layer.

The ending never depends on the secret. A player who never layers still gets the transformed
cubicle, a reflection and a card; the secret only changes what's on it.

## The take-home

The ending reads behaviour, not answers: how many garments you wore, which reflection held you
longest, your ratio of old to new, how often you layered, and whether you found the secret. It
names up to three traits — Threshold Keeper, Layerer, Returner, Room Sitter, Keeper, Tag Keeper,
Quick Changer — and turns the strongest into a place: *"the room you kept reaching for looks like
a chair pulled up to a mirror."* The card is downloadable, and kept in `localStorage`.

## What each part of the framework became

| Framework | Implementation |
|---|---|
| World | One cubicle — curtain, rail, mirror — where the mirror never shows the cubicle |
| Quest | "Get dressed for somewhere you haven't been yet," which no garment satisfies |
| Play | Take a garment → wear it → read the mirror → keep it, layer it, or hang it back |
| Personality | Late reflections, misremembered rooms, refusing sleeves, colours that drift, a hanger that moves itself |
| Secret | Old under new: this cubicle, furnished, reflected in sync for the only time |
| Trace | `garmentsWorn`, `longestLinger`, `oldNewRatio`, `layerAttempts`, `secretFound` |
| Transformation | The light warms with the rooms you stayed in, and everything you take off stays on the bench |
| Take-home | A card with the garments you returned to — or the furnished cubicle — and what you kept reaching for |

## Assets

90s-anime pastel pixel art, generated as one 1024px sheet and cut into fifteen pieces —
`figure`, `cubicle`, six garments, six rooms and the furnished cubicle. Nothing is fetched at
runtime and there is no API key; the game loads local PNGs and a missing file costs you that one
picture rather than the room.

Re-cut them any time. This needs a dependency, but it is a build-time tool rather than something
the game loads:

```bash
python3 -m venv .venv && .venv/bin/pip install Pillow
.venv/bin/python games/the-fitting-room/scripts/slice_assets.py --report   # check the tiles
.venv/bin/python games/the-fitting-room/scripts/slice_assets.py            # write them
```

The script finds tiles by detecting the black gutters rather than by hardcoded coordinates, so a
regenerated sheet with different spacing still cuts. It keys the black field to transparency for
the figure and the garments, squares off the rooms — the generated warm rooms came out landscape
and the cold ones portrait, and the mirror needs one shape — and scales garments by height in
proportion to each one's length in the game, so a coat still reads as longer than a pinafore.

## Brief

Built from [`briefs/the-fitting-room.md`](../../briefs/the-fitting-room.md) under the house
framework in [`framework/PRODUCT_FRAMEWORK.md`](../../framework/PRODUCT_FRAMEWORK.md).
