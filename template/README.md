# Starter kit

Copied into `games/<slug>/` by `scripts/new-game.sh`. It runs as-is — a room with five things
that wake up when you touch them — so you can see every slot of the framework working before
you replace any of it.

```bash
python3 -m http.server 8765
```

## What is already built

| Slot | Where |
|---|---|
| Quest | `CONFIG.quest`, rendered into `#quest` |
| Play | `touch()` — one action, one visible consequence |
| Personality | `misbehave()` — hesitates, mishears, drifts |
| Mystery | `checkSecret()` — wake everything, then return to the first thing |
| Trace | `Trace` — touches, distinct, longestRepeat, medianGap, secretFound |
| Transformation | `warmTheRoom()` drives `--warmth`, which the whole palette reads from |
| Reflection | `reflect()` — traits, then a room made from the strongest one |
| Take home | `drawCard()` — a PNG drawn from the actual final state |

## What to replace

Everything above the `ENGINE` line in `game.js`, the `.thing` elements in `index.html`, and the
palette variables at the top of `styles.css`. Keep `Trace`, `whisper`, `Hints`, `drawCard` and
the wiring — every game in this repo needs them and they are the same each time.

## The hint system

`Hints` is the reason no game here needs a tutorial. It waits for the player to go quiet, then
points at something they have not tried. Read `Hints.candidates()` first: it returns the things
still worth pointing at, and it is the only part you have to rewrite per game.

Its manners are deliberate. Hints escalate through `Hints.ladder` only when ignored, retire for
good once the player does the thing, lose their nerve a quarter of the time, and dart away when
the cursor comes near.
