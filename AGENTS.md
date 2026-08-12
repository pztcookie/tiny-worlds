# Working in this repo

This repo is a workshop for one-sitting browser games. Each game is a tiny world built from a
brief and the house framework in `framework/PRODUCT_FRAMEWORK.md`.

**Read `framework/PRODUCT_FRAMEWORK.md` before writing any game code.** It is the spec, not
background reading. The build process itself lives in `.cursor/skills/build-a-game/SKILL.md`.

## Layout

```
briefs/<slug>.md          the inputs for one game (copy briefs/TEMPLATE.md)
games/<slug>/             the game itself, self-contained and independently servable
template/                 starter kit copied into a new game
framework/                the house framework and the visual house style
scripts/new-game.sh       creates games/<slug>/ from template/ and a brief from TEMPLATE.md
index.html                the arcade — lists every game in games/
```

## House rules for game code

- **Vanilla HTML / CSS / JS.** No build step, no bundler, no framework, no `npm install`.
  A game must run from `python3 -m http.server` and nothing else. Adding a dependency requires
  a reason written into the game's README.
- **Every game is self-contained.** `games/<slug>/` holds its own `index.html`, `styles.css`,
  `game.js`, `assets/` and `README.md`. Games never import from each other or from `template/`.
- **No API key may be required.** Generative features are an upgrade layer: the game must be
  fully playable and complete with the network off. Every generative call needs a local
  fallback, and the key — if any — is read from `localStorage`, never committed.
- **State lives in `localStorage`,** namespaced `tiny-worlds:<slug>:*`. No backend, no accounts.
- **All paths are relative and all network calls are `https://`.** Games are published by
  GitHub Pages from a subfolder, so a leading slash resolves to the wrong place and an `http://`
  call is blocked as mixed content — both work on localhost and fail only once shared.
- **Assets stay small.** Prefer generated canvas art and CSS over large files. A megabyte per
  image is the ceiling, with source sheets that get cut into sprites as the one exception.
  No video.
- **Touch and mouse both work,** and the game is playable at 900×600.

## Writing rules

- Nothing in the game explains itself with a tutorial or a tooltip wall. If the player looks
  stuck, the *world* hints — see the idle-hint pattern in `template/game.js`.
- Never name the personal lens inside the game. The player should feel it, not read it.
- Reflection text describes what the player *did*, never what they *are*.

## Definition of done

A game is finished when the ten questions in the product test at the end of
`framework/PRODUCT_FRAMEWORK.md` all pass, its brief's decision table is filled in, and its
`README.md` documents the loop, the secret and the traces.
