# tiny worlds

A workshop for small browser games. Each one is a tiny interactive world rather than a
functional website: you enter it, you want something, you experiment, you find out how it
works, you leave traces, the world changes, and you take something away.

**[Play them here →](https://pztcookie.github.io/tiny-worlds/)**

Every game here is vanilla HTML, CSS and JavaScript. No build step, no dependencies, no API
key, no backend. Open a folder, serve it, play it.

## The games

| Game | Lens | Play |
|---|---|---|
| **[Moonlit Sandwich Cafe](https://pztcookie.github.io/tiny-worlds/games/moonlit-sandwich-cafe/)** | Self-authorship | Stack a sandwich in a cafe where day and night share one window |
| **[The Little Monster in the Room](https://pztcookie.github.io/tiny-worlds/games/little-monster-room/)** | Want & undercurrent | Soothe a temperamental cookie, then frame your ideal room |

## Playing locally while you build

Serve the repo root and open the arcade, or serve a single game folder on its own — every game
is self-contained, so both work:

```bash
python3 -m http.server 8765   # then open http://localhost:8765
```

`localhost` is only your own machine. To share a game with someone else, push and let GitHub
Pages serve it — see **Publishing** below.

## How a game gets made

The point of this repo is that a new game needs only a brief. You fill in seven inputs, the
agent does the rest.

1. **Write the brief.** Copy [`briefs/TEMPLATE.md`](briefs/TEMPLATE.md) and fill in:

   | Input | What it decides |
   |---|---|
   | **Personal lens** | the moral behind the game — never stated, only embodied |
   | **Object / theme** | one environment, one main object, one emotional premise |
   | **Framework** | which orchestration to use (defaults to the house one) |
   | **Desired feeling** | cozy, surreal, mischievous, quiet… |
   | **References** | images to take palette and visual language from |
   | **Time limit** | one hour means one mechanic and one secret |
   | **Constraints** | browser-based, minimal dependencies, LLM access or not |

   Only the lens and the object are required. Anything left blank, the agent chooses and tells
   you what it chose. See [`briefs/moonlit-sandwich-cafe.md`](briefs/moonlit-sandwich-cafe.md)
   for a filled-in one.

2. **Ask the agent to build it.** In Cursor:

   > /build-a-game using briefs/late-night-laundromat.md

   It reads the framework, proposes a nine-line design — world, quest, loop, personality,
   secret, traces, reflection, transformation, take-home — and waits for your yes before
   writing code.

3. **Play it while it's built.** The game appears at `games/<slug>/`, served statically.

You can also scaffold by hand:

```bash
./scripts/new-game.sh late-night-laundromat "Late Night Laundromat"
```

## Publishing

The repo is served straight from `main` by GitHub Pages — either with Source set to *Deploy
from a branch* (branch `main`, folder `/ (root)`) or with the *Static HTML* workflow under
Source *GitHub Actions*. Both serve the files as they are; nothing is compiled. Pushing is
publishing, and a new game is live a minute later at

```
https://pztcookie.github.io/tiny-worlds/games/<slug>/
```

Because games are served from a subfolder, **all paths inside a game must be relative**
(`assets/thing.png`, never `/assets/thing.png`), and any network call must be `https://` or the
browser will block it on the live site while it worked fine on localhost.

## Layout

```
framework/PRODUCT_FRAMEWORK.md   the house framework — the 0–10 structure, read it first
briefs/TEMPLATE.md               the seven inputs
briefs/<slug>.md                 the inputs for one game
template/                        a running starter kit that demonstrates every slot
games/<slug>/                    a finished game, self-contained
index.html                       the arcade
AGENTS.md                        the rules any agent working here must follow
```

## The rules the games are held to

Ten of them, in full in [`framework/PRODUCT_FRAMEWORK.md`](framework/PRODUCT_FRAMEWORK.md). The
short version:

- Goal visible, solution hidden.
- The world has a personality — it does not simply obey.
- Don't explain everything; let interaction teach.
- Reward curiosity, and hide exactly one secret.
- Let the system remember, and let something visibly change.
- Always give something back at the end.

The philosophy underneath, which is the part worth keeping:

> Do not build a tool that tells people who they are. Build a small world that lets them play,
> experiment, make choices, and leave traces. Then let the world quietly show them something
> about themselves.
>
> The goal is not *"I discovered the real me."* The goal is *"I made something that feels like
> mine."*
