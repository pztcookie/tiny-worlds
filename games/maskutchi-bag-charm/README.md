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
2. Three of the miniatures are sealed pastel parcels. The rest look like themselves, but each
   one wants to be carried a certain way — slowly, shaken, spun, tapped twice, held still a
   beat, or kept upright.
3. Until that way is found, the pouch will not keep it. It wriggles out. The bunny comments.
   A lilac glow marks the next mystery, one at a time.
4. Once it settles, watch the pouch agree or disagree with it — matching neighbours multiply,
   lone strangers fade.
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

Each miniature also has a way it wants to be carried. The gestures are a small set, reused, so
finding one teaches the others. A rushed hand gets a bunny line, not a warning banner.

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

The parcels are a playful layer on top of this, not a second secret. Three start wrapped —
the tiny star, the cookie packet, the yakult. Unwrapping is the same gesture that lets them
settle, and the wrap splits. The other nine (and the bunny) show their personality by how they
refuse. You do not have to open every parcel; a pouch that never unwraps still gets a shop
name, a card, and a share.

How each one wants to be carried:

| Gesture | Who |
|---|---|
| slow | pudding, choco box, bunny |
| shake | tiny star, blue candy, grape candy |
| spin | cookie packet, grape tart |
| tap-twice | peanut butter, blind bag |
| hold | yakult |
| upright | parfait, soda |

</details>

## If you get stuck

There is no fail state, so stuck is the only failure, and the timer means it has to be caught
fast. The world nudges when you go quiet for seven seconds, and also when the beat notices its
own rules emptying the pouch out from under you. Wordless first — the charms flare, a glowing
parcel hops, the bunny leans toward the mystery (or toward whatever is fading) and then hops
toward the pouch mouth — and only then does the bunny murmur, then the paper tag, climbing to
nearly explicit for *one* gesture so the rest can be generalised. Every bunny-secret rung
retires once the bunny is inside.

The ending never depends on the secret, and it never depends on opening every parcel. A pouch
without the bunny still gets a zip, a shop name, a reflection and a card.

## Ways to play, none of them correct

- Let it duplicate and end up with a pouch you cannot see the far side of
- Keep one of each and spend the whole minute fighting the fade
- Move slowly, keep the sky warm, and arrange something deliberate
- Put the bunny in and let the strangers stay
- Open the parcels, or never touch them

## The take-home

The ending counts what you did, never what you are: how many already-fading things you went
back for, how many copies you let stand, how many you took out again, how fast your hand was,
whether the bunny went in, how many parcels you opened, how many ways of carrying you found,
and how often the bunny had to ask you to ease off.

From those traces it also mints a **craftsman name** — a two- or three-word shop title like
*Moonfold Packer*, *Rush Ribbon Binder*, *Slow Star Keeper*. Invented shop-name energy, not a
personality quiz. The word does not appear until the card.

The card is a downloadable 600×800 PNG drawn from the same numbers as the world: your
arrangement, zipped, in the weather your own hand produced, stamped with that shop name.

**Share it.** On a phone that supports the Web Share API, *share it* sends the PNG plus a line
that includes the shop name. Elsewhere, *keep it* still downloads the picture, and *copy the
link* (or the share button's fallback) puts
`https://pztcookie.github.io/tiny-worlds/games/maskutchi-bag-charm/` on the clipboard so a
friend can play. No backend, no accounts, no API key; copy-link is just the clipboard.

The trace is kept in `localStorage` under `tiny-worlds:maskutchi-bag-charm:trace`.

## What each part of the framework became

| Framework | Implementation |
|---|---|
| World | One clear zip pouch on a bag strap against a pastel sky of shining stars, empty, with twelve miniatures spilled beside it — three of them sealed as parcels — and the bunny outside on the strap |
| Quest | On the paper tag: *"fit your world in here before you get there"* — visible, and impossible to do tidily |
| Play | Find how one wants to be carried → drop it in → watch the pouch agree or disagree → rearrange, or pull it back out → zip it shut |
| Personality | Matching neighbours multiply, lone strangers fade, the sky reads your hand, and each miniature refuses until its gesture is found |
| Secret | The bunny can go in, and nothing resting near it duplicates or fades. Three parcels are a playful layer on top, not a second secret |
| Trace | `madeRoomFor`, `pulledBackOut`, `tempo`, `copiesKept`, `bunnyInside`, plus `packagesOpened`, `gesturesFound`, `rushCount` for the shop name |
| Transformation | Empty outline → a zipped pouch holding one specific arrangement, swinging in the weather the player's own tempo produced, stamped with a shop name |
| Take-home | A PNG of that pouch with exactly their contents, the craftsman name, a share action, and one line about what they made room for |

## Assets

Fifteen supplied 791×1024 PNGs in `assets/source/`, per-layer exports of one composition on an
opaque black background rather than on transparency, cut by `scripts/slice_assets.py` into
fourteen sprites and one bitmask. 489 KiB of sliced art, 251 KiB of which is the pouch, plus
237 KiB of sources that ship for re-cutting but are never loaded — 726 KiB of `assets/` in
total, of which the game loads 489 KiB. Nothing is fetched at
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

Four things the script has to do, all of them consequences of the black background:

- **Flood the black field inward from the border** and key it out, then crop to what is left.
- **Punch out the enclosed black regions**, because in this art every one of them is a hole
  the background is showing through — the donut's centre, the links of a ball chain, the gap
  under the parfait's glass foot — rather than something painted dark.
- **Except in the pouch**, where the enclosed interior is the vinyl itself and becomes a faint
  `(214, 238, 255)` tint at 20% alpha, and the shine strokes along its edge become white at
  35%. That tint is what makes the pouch read as clear plastic instead of as a hole, and the
  miniatures are drawn under it so they genuinely show through.
- **Move the leftover black toward the lilac.** Keying cannot take back the black that the edges
  were blended into, so instead of removing it the script blends it toward `(220, 206, 255)` —
  the lilac the bunny's ears are painted with — and stops well below the luminance of the navy
  line work, which is the character of this art and is never touched. Three folds the artist
  painted near-black are lifted the same way and by name: the candy's wrapper fin, the cookie
  packet's corner and the shadow behind the yakult's cap, each of which read as a hole punched
  in the sticker once the sky went pastel.

The interior is also written out as `assets/pouch-inside.json`, a 64×96 bitmask, so the game
can tell whether a dropped miniature landed in the pouch. The pouch hangs at an angle, so no
rectangle would have done.

## Brief

Built from [`briefs/maskutchi-bag-charm.md`](../../briefs/maskutchi-bag-charm.md) under
[`framework/VIBE_CODING_FRAMEWORK.md`](../../framework/VIBE_CODING_FRAMEWORK.md), the one game
in this repo that uses it, tested against the ten questions at the end of
[`framework/PRODUCT_FRAMEWORK.md`](../../framework/PRODUCT_FRAMEWORK.md).
