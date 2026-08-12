# Maskutchi Bag Charm

A small browser game about **self-authorship** — you did not choose what you were handed, but
you choose what stays. A clear vinyl zip pouch hangs from a bag strap against a pastel sky. It
is empty. Twelve miniature food toys are spilled beside it, and a bunny sits outside on the
strap, watching.

## Play

**[Play it in your browser →](https://pztcookie.github.io/tiny-worlds/games/maskutchi-bag-charm/)**

No build step, no dependencies, no API key, no backend. To run it locally instead:

```bash
cd games/maskutchi-bag-charm
python3 -m http.server 8765   # then open http://127.0.0.1:8765
```

## The loop

1. Pick one of the three charms on the keyring. That starts the world and sets how long it
   gives you — three minutes, one and three quarters, or one. Nothing on screen says so; the
   strap's shadow creeping across the sky is the only clock.
2. Drag a miniature into the pouch.
3. Watch the pouch agree or disagree with it.
4. Move things next to each other, or pull one back out.
5. Zip it shut when it looks like yours, or let the time run out — which is the same thing,
   not a loss.

## What the pouch does about it

**Matching neighbours multiply, lone strangers fade.** Four colour families — grape, milk,
cream, and the bunny alone — and no legend, because colour is the most legible thing in this
art. A miniature resting near another of its own family may be copied, up to four of a kind. A
miniature with no relative near it fades in steps, then pops and leaves a faint ring behind.

Fading is never silent, so what happens reads as the world having a view rather than as a bug.

On top of that, the sky answers your hand:

| Your hand | The sky |
|---|---|
| Fast | The blue deepens and goes jumpy, the stars streak, the strap swings harder, and the pouch decides more often. At full speed it occasionally spits something back out |
| Slow | The blue warms toward cream, the stars settle into a slow twinkle, and one of them sometimes falls — whatever it lands on is protected while its sparkle lasts |

The falling star is the only protection the world hands out unasked. The other one you have to
find.

## The secret

<details>
<summary>Spoiler</summary>

**The bunny can go in.** Nothing says so. It starts outside on the strap, and it is the only
thing in the world that is alone and never fades — every other lone stranger dissolves.

Anything resting near the bunny is exempt from both rules: it never duplicates and it never
fades. So the pouch that keeps its mismatched things is the pouch with the mascot in it, and
the way you learn that is by noticing what the bunny is not afraid of.

No fanfare, no win screen. The exemption showing up on whatever is resting nearby is the
reward.

</details>

## If you get stuck

There is no fail state, so stuck is the only failure, and the timer means it has to be caught
fast. The world nudges when you go quiet for seven seconds, and also when the beat notices its
own rules emptying the pouch out from under you. Wordless first — the charms flare, the
miniature nearest the pouch hops, the bunny leans toward whatever is fading and then hops
toward the pouch mouth — and only then does the paper tag speak, climbing `…` → *"the bunny
isn't worried"* → *"nothing next to the bunny has ever disappeared."* Every rung retires for
good once the bunny is inside.

The ending never depends on the secret. A pouch without the bunny still gets a zip, a
reflection and a card; the bunny only changes what is on them.

## Ways to play, none of them correct

- Let it duplicate and end up with a pouch you cannot see the far side of
- Keep one of each and spend the whole minute fighting the fade
- Move slowly, keep the sky warm, and arrange something deliberate
- Put the bunny in and let the strangers stay

## The take-home

The ending counts what you did, never what you are: how many already-fading things you went
back for, how many copies you let stand, how many you took out again, how fast your hand was,
and whether the bunny went in. It names up to three of those and then says what is hanging
there now — *a pouch with the mascot inside it, facing out* — and exactly what it kept.

The card is a downloadable 600×800 PNG drawn from the same numbers as the world: your
arrangement, zipped, in the weather your own hand produced. The trace is kept in
`localStorage` under `tiny-worlds:maskutchi-bag-charm:trace`.

## What each part of the framework became

| Framework | Implementation |
|---|---|
| World | One clear zip pouch on a bag strap against a pastel sky of shining stars, empty, with twelve miniatures spilled beside it and the bunny outside on the strap |
| Quest | On the paper tag: *"fit your world in here before you get there"* — visible, and impossible to do tidily |
| Play | Drag one in → watch the pouch agree or disagree → rearrange, or pull it back out → zip it shut |
| Personality | Matching neighbours multiply, lone strangers fade, and the sky reads your hand speed — jumpy and streaking when fast, warm with falling stars when slow |
| Secret | The bunny can go in, and nothing resting near it duplicates or fades |
| Trace | `madeRoomFor`, `pulledBackOut`, `tempo`, `copiesKept`, `bunnyInside` |
| Transformation | Empty outline → a zipped pouch holding one specific arrangement, swinging in the weather the player's own tempo produced |
| Take-home | A PNG of that pouch with exactly their contents, and one line about what they made room for |

## Assets

Fifteen supplied 791×1024 PNGs in `assets/source/`, per-layer exports of one composition on an
opaque black background rather than on transparency, cut by `scripts/slice_assets.py` into
fourteen sprites and one bitmask. 479 KiB of sliced art, 252 KiB of which is the pouch, plus
268 KiB of sources that ship for re-cutting but are never loaded. Nothing is fetched at
runtime and there is no API key; a missing file costs you that one picture rather than the
room.

The sky is not an asset. It is a CSS gradient with three fixed layers of radial-gradient stars
twinkling on separate clocks, driven by two custom properties the game writes as the hand
moves, and it stops under `prefers-reduced-motion`.

Re-cut the sprites any time. This needs a dependency, but it is a build-time tool rather than
something the game loads:

```bash
python3 -m venv .venv && .venv/bin/pip install Pillow
.venv/bin/python games/maskutchi-bag-charm/scripts/slice_assets.py --report   # check
.venv/bin/python games/maskutchi-bag-charm/scripts/slice_assets.py            # write
```

Three things the script has to do, all of them consequences of the black background:

- **Flood the black field inward from the border** and key it out, then crop to what is left.
- **Punch out the enclosed black regions**, because in this art every one of them is a hole
  the background is showing through — the donut's centre, the links of a ball chain, the gap
  under the parfait's glass foot — rather than something painted dark.
- **Except in the pouch**, where the enclosed interior is the vinyl itself and becomes a faint
  `(214, 238, 255)` tint at 20% alpha, and the shine strokes along its edge become white at
  35%. That tint is what makes the pouch read as clear plastic instead of as a hole, and the
  miniatures are drawn under it so they genuinely show through.

The interior is also written out as `assets/pouch-inside.json`, a 64×96 bitmask, so the game
can tell whether a dropped miniature landed in the pouch. The pouch hangs at an angle, so no
rectangle would have done.

## Brief

Built from [`briefs/maskutchi-bag-charm.md`](../../briefs/maskutchi-bag-charm.md) under
[`framework/VIBE_CODING_FRAMEWORK.md`](../../framework/VIBE_CODING_FRAMEWORK.md), the one game
in this repo that uses it, tested against the ten questions at the end of
[`framework/PRODUCT_FRAMEWORK.md`](../../framework/PRODUCT_FRAMEWORK.md).
