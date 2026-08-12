---
name: build-a-game
description: Builds a browser mini game in this repo from a brief containing a personal lens, object/theme, framework, desired feeling, references, time limit and constraints. Use when the user asks to build a new mini game, start a new tiny world, fill in a brief, or turn a lens and an object into a playable demo.
---

# Build a game

Turn a brief into a self-contained browser game under `games/<slug>/`.

Read `framework/PRODUCT_FRAMEWORK.md` in full before designing. It is the spec. This skill is
only the process for applying it.

## Progress checklist

Copy this and keep it updated:

```
- [ ] 1. Collect the brief
- [ ] 2. Fill the decision table and get approval
- [ ] 3. Scaffold from template/
- [ ] 4. Build the world and the loop
- [ ] 5. Add personality, the secret, traces
- [ ] 6. Add transformation, reflection, take-home
- [ ] 7. Run the product test and write the README
```

## 1. Collect the brief

Seven inputs, in `briefs/TEMPLATE.md`:

| Input | Required | If missing |
|---|---|---|
| Personal lens | yes | ask — nothing else can be decided without it |
| Object / theme | yes | ask, or offer three options drawn from the lens |
| Framework | no | default to `framework/PRODUCT_FRAMEWORK.md` |
| Desired feeling | no | infer from the lens, then state your reading in one line |
| References | no | build with canvas and CSS art in the house style |
| Time limit | no | assume 1 hour, which means 1 mechanic and 1 secret |
| Constraints | no | assume browser-only, no build step, no API key |

Ask at most **one** round of questions, and only for the required inputs. If the user gives the
brief in chat rather than a file, write it into `briefs/<slug>.md` yourself before building.

**When reference images are provided:** look at them before designing. Take palette, sprite
scale, and visual language from them; do not copy their UI layout. List in the brief what you
took from each one.

## 2. Fill the decision table and get approval

Complete the "Agent fills this in" table at the bottom of the brief — world, quest, core loop,
personality, the one secret, traces, reflection, transformation, take-home — and show it to the
user before writing code. This is a nine-line proposal, not a document.

Pressure-test it against the three that most often go wrong:

- **Quest:** the goal is visible and the solution is hidden. If the player can be told how to
  win in one sentence, it is a task, not a quest.
- **Personality:** name at least three specific ways the world disobeys. "It's responsive" is
  not personality. "It hands you a second tomato for free" is.
- **Secret:** exactly one, discoverable without instructions, hinted at by the world.

## 3. Scaffold

```bash
./scripts/new-game.sh <slug> "<Game Title>"
```

This copies `template/` into `games/<slug>/` and creates `briefs/<slug>.md` if it is missing.
Then serve it and keep it open while you work:

```bash
cd games/<slug> && python3 -m http.server 8765
```

## 4–6. Build

`template/game.js` ships the scaffolding — trace state, `localStorage` persistence, the idle
hint system, the mischief hook, the reveal screen and the downloadable card. Replace the
`WORLD` section, keep the rest.

Build in this order, and get it playable before it is pretty:

1. **World + quest.** One screen. The goal is on it. No tutorial.
2. **The loop.** 3–5 actions, every one with a visible consequence.
3. **Personality.** Wire the mischief hook so the world sometimes answers differently.
4. **The secret.** Plus the subtle hints that lead to it.
5. **Traces.** 3–5 variables, no more. Behavioural, not preferences.
6. **Transformation.** The last screen must not look like the first.
7. **Reflection + take-home.** A card the player can download.

Budget by time limit: at one hour, spend roughly 15 minutes on world and loop, 15 on
personality and secret, 15 on traces and reflection, 15 on the card and polish. When time is
short, cut mechanics, never the secret and never the take-home.

## 7. Finish

- Run all ten questions of the product test at the end of the framework. Fix by simplifying.
- Write `games/<slug>/README.md`: the loop, what the world does on its own, the secret (in a
  `<details>` block), the traces, and the take-home.
- Add the game to the arcade list in the root `index.html`.
- Fill in the "What was learned" section of the brief with what actually worked at the desk.

## House constraints

Restated because they are load-bearing, and detailed in `AGENTS.md`:

- Vanilla HTML / CSS / JS, no build step, no dependencies.
- The game must be complete with the network off. Generative features are an upgrade layer with
  a local fallback; keys come from `localStorage` and are never committed.
- `localStorage` keys are namespaced `tiny-worlds:<slug>:*`.
- Never state the personal lens inside the game.
