---
name: build-a-game
description: Builds a browser mini game in this repo from a brief containing a personal lens, object/theme, framework, desired feeling, references, time limit and constraints. Use when the user asks to build a new mini game, start a new tiny world, fill in a brief, or turn a lens and an object into a playable demo.
---

# Build a game

Turn a brief into a self-contained browser game under `games/<slug>/`.

Read `framework/PRODUCT_FRAMEWORK.md` in full before designing. It is the spec. This skill is
only the process for applying it.

## Approval gates

Three points where you stop and wait for an explicit yes:

1. **The brief** — after the intake round, before designing.
2. **The design** — after the decision table, before writing any game code.
3. **Publishing** — after the product test passes, before anything leaves the machine.

A yes at one gate is never a yes at the next. Between gates, work continuously and do not ask
permission for individual edits — the gates exist so the middle can be uninterrupted.

## Progress checklist

Copy this and keep it updated:

```
- [ ] 1. Collect the brief, then get it approved
- [ ] 2. Fill the decision table and get it approved
- [ ] 3. Branch, scaffold, and put a live preview on screen
- [ ] 4. Build the world and the loop
- [ ] 5. Add personality, the secret, traces
- [ ] 6. Add transformation, reflection, take-home
- [ ] 7. Run the product test and write the README
- [ ] 8. Open a pull request, once publishing is approved
```

## 1. Collect the brief

Seven inputs, in `briefs/TEMPLATE.md`:

| Input | Required | If left to you |
|---|---|---|
| Personal lens | yes | ask — nothing else can be decided without it |
| Object / theme | yes | ask, or offer three options drawn from the lens |
| Framework | no | default to `framework/PRODUCT_FRAMEWORK.md` |
| Desired feeling | no | infer from the lens, then state your reading in one line |
| References | no | build with canvas and CSS art in the house style |
| Time limit | no | assume 1 hour, which means 1 mechanic and 1 secret |
| Constraints | no | assume browser-only, no build step, no API key |

Ask about **all seven in one round**, not only the two required ones. The defaults in the right
column exist so the round never blocks, not so the questions can be skipped. Put the lens and
the object as open questions; offer desired feeling, time limit and constraints as choices the
user can wave through, and framework and references as a yes-or-name. Say plainly which inputs
you will decide yourself if they answer nothing.

One round, though — if an answer is thin, take your best reading of it and show that reading at
the gate rather than opening a second interview.

Then stop. Repeat the seven filled-in inputs back as a short table and wait for a yes. This is
the first gate. If one answer forces a different game than an earlier answer implied, say so
here instead of resolving it silently.

**Reference images.** Ask for them as chat attachments or a folder path, and look at them before
designing. Take palette, sprite scale, and visual language from them; do not copy their UI
layout. Copy them into `games/<slug>/assets/` once the slug exists, and list in the brief what
you took from each one.

## 2. Fill the decision table and get approval

Write the brief to `briefs/<slug>.md` first, even when it arrived in chat, then complete the
"Agent fills this in" table at the bottom — world, quest, core loop, personality, the one
secret, traces, reflection, transformation, take-home. Open that file in the editor so the plan
sits beside the conversation and can be read while you discuss it.

Keep the brief the single source of truth for the whole session: when a slot changes mid-build,
edit the file, don't only mention it in chat.

Nine lines, not a document. Show it and wait — the second gate. No game code before the yes.

Pressure-test it against the three that most often go wrong:

- **Quest:** the goal is visible and the solution is hidden. If the player can be told how to
  win in one sentence, it is a task, not a quest.
- **Personality:** name at least three specific ways the world disobeys. "It's responsive" is
  not personality. "It hands you a second tomato for free" is.
- **Secret:** exactly one, discoverable without instructions, hinted at by the world.

## 3. Branch, scaffold, preview

Never build a game on `main`. GitHub Pages publishes `main`, so a commit there is a release:

```bash
git switch -c game/<slug>
./scripts/new-game.sh <slug> "<Game Title>"
```

`new-game.sh` copies `template/` into `games/<slug>/` and creates `briefs/<slug>.md` if it is
missing. Then start a server and leave it running for the rest of the session:

```bash
cd games/<slug> && python3 -m http.server 8765
```

Open `http://localhost:8765` in the browser preview and keep it on screen. This is the point of
the step, not a footnote to it — the game is meant to be watched as it appears. Reload it at the
end of every stage below, say in one line what changed, and attach a screenshot when the change
is visual.

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

Reload the preview and commit to the branch at the end of each of the seven. The commits are the
undo history for a session that goes sideways, and they publish nothing while the branch is not
`main`.

## 7. Finish

- Run all ten questions of the product test at the end of the framework. Fix by simplifying.
- Write `games/<slug>/README.md`: the loop, what the world does on its own, the secret (in a
  `<details>` block), the traces, and the take-home.
- Add the game to the arcade list in the root `index.html`.
- Fill in the "What was learned" section of the brief with what actually worked at the desk.

## 8. Publish

The third gate, and the strict one. Pushing is publishing: the repo is served straight from
`main`, so a merge puts the game on the open internet at
`https://pztcookie.github.io/tiny-worlds/games/<slug>/`.

Stop after step 7 and ask. Nothing is pushed until the user says yes to that question. When they
do:

```bash
git push -u origin game/<slug>
gh pr create --title "Add <Game Title>" --body "<loop, secret, traces, take-home>"
```

Then hand back the pull request URL and stop. **Never push to `main`, never merge the pull
request, never enable auto-merge.** The merge is the user's, because the merge is the moment the
game goes live.

If `gh` is missing or not signed in, push the branch anyway and pass along the compare URL that
`git push` prints. If the user declines to publish, leave the work committed on the branch and
tell them plainly what is unpushed.

## House constraints

Restated because they are load-bearing, and detailed in `AGENTS.md`:

- Vanilla HTML / CSS / JS, no build step, no dependencies.
- The game must be complete with the network off. Generative features are an upgrade layer with
  a local fallback; keys come from `localStorage` and are never committed.
- `localStorage` keys are namespaced `tiny-worlds:<slug>:*`.
- Never state the personal lens inside the game.
