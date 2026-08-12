# The Tiny Worlds Framework

> **Creative Principle:** Build a tiny interactive world, not just a functional website.
>
> The experience should let the user:
> **Enter a world → want something → experiment → discover how the world works → leave traces → change the world → take something away.**
>
> The product should feel playful, slightly mysterious, emotionally meaningful, and easy to
> understand without feeling overly explained.

---

## 0. PERSONAL LENS — The moral behind the whole game

What am I exploring?

We don't necessarily need to explicitly tell the user which lens they are experiencing.
**The experience should embody it.**

## 1. WORLD — Create a tiny world

Start with:

- 1 environment
- 1 emotional premise
- 1 main object / character / system
- 1 distinctive visual language

Think: **One room in a universe, not an entire universe.**

- **Vibe:** the world can be strange, cozy, whimsical, nostalgic, surreal, emotional, or slightly glitchy.
- **Interface:** avoid building too many pages, features, or systems.

## 2. QUEST — Give the user something to want

Give the user one simple goal at the beginning. Examples:

- Make the creature trust you.
- Find something hidden.
- Make the room feel like home.
- Wake up the sleeping object.
- Discover what the world is trying to tell you.
- Create something that feels like you.

**Important rule: show the goal, but hide the solution.** The user should know what they are
trying to achieve, but not exactly how. This creates curiosity and encourages experimentation.

## 3. PLAY — Create one simple interaction loop

The core loop should be: **ACTION → WORLD RESPONSE → NOTICE → ADAPT → TRY AGAIN**

Give the user only **3–5 obvious actions**: click, drag, touch, give, combine, move, inspect,
talk, decorate, upload, choose.

Every meaningful action should create a visible consequence — animation, sound, text, visual
transformation, object movement, creature behavior, environmental change, unexpected reaction.

**Core principle:** the user should feel like they are interacting WITH a world, not operating a UI.

## 4. PERSONALITY — Make the system slightly unpredictable

The world should be responsive, partially predictable, slightly surprising, influenceable,
**not completely controllable**.

- Avoid: button → exact expected result.
- Prefer: user does something → the world reacts according to its own personality.

The system should sometimes make the user think *"Huh?"* or *"Why did it do that?"* or
*"What happens if I try this?"*

**Important:** the system should not feel randomly broken. Its behavior should be discoverable,
even if it is not immediately obvious.

## 5. MYSTERY — Hide ONE secret

Every 1-hour demo should contain at least one hidden rule, interaction, combination, or outcome:
a secret interaction, a hidden combination, a special sequence, an unusual response, a hidden
object, a rare transformation, an alternative ending.

The user should eventually experience: *"Ohhh. THAT'S how this works."*

Do not explain the secret immediately. Give subtle hints through visual cues, system reactions,
environmental changes, tiny text, repeated patterns, sound, or creature behavior.

**Rule: one good secret is better than five unfinished mechanics.**

## 6. REWARD — Reward curiosity

Reward users not only for completing the goal, but also for exploring, experimenting, trying
unusual actions, discovering patterns, interacting repeatedly, and finding the hidden rule.

Rewards can be tiny: animation, sound, new object, visual effect, dialogue, collectible,
transformation, badge, secret screen.

The reward does not need to be useful. It needs to make the user think: *"I'm glad I tried that."*

## 7. TRACE — Remember what the user did

The system should remember a small number of meaningful interactions. Track only around
**3–5 pieces of state**: `favoriteObject`, `explorationLevel`, `trustLevel`, `interactionStyle`,
`secretDiscovered`, `finalChoice`.

Do NOT build complicated backend infrastructure unless absolutely necessary. Simple local state
is enough. The purpose is: **the world should remember that the user was here.**

## 8. REFLECTION — Let the world become a mirror

Use the user's behavior to create a reflection. Do not immediately tell the user
*"You are an introvert."* Instead, let the experience show them something through:

- **Behavioral:** "You kept exploring even after you found the answer."
- **Environmental:** "The room became quieter because of your choices."
- **Character:** "The creature evolved according to how you treated it."
- **Artifact:** "You received a creature that reflects your journey."
- **Pattern:** "You repeatedly chose familiar objects over unknown ones."

The reflection should feel **discovered, not diagnosed**.

## 9. TRANSFORMATION — Let the user's behavior change the world

By the end, something should be visibly different from the beginning: empty room →
personalized room, sleeping creature → awakened creature, blank canvas → personal world,
unknown object → meaningful artifact, chaotic environment → environment shaped by the user.

The transformation should communicate: **"My actions mattered here."**

## 10. TAKE HOME — Give the user a tiny artifact

The experience should end with something the user can keep, screenshot, save, or share:
digital creature, pixel monster, personality card, mini room, digital collectible, generated
poem, image, badge, screenshot, personalized object, final environment state.

The artifact should connect the playful experience back to real life. The user should leave
thinking: *"I made this."* or *"This little thing feels strangely like me."*

---

## Playfulness rules

Apply these rules throughout the project.

1. **Goal visible, solution hidden.** Give the user something to achieve without telling them exactly how.
2. **The world has a personality.** The system should feel like it has its own logic and preferences.
3. **Don't explain everything.** Let interaction teach the user.
4. **Reward curiosity.** Trying something weird should sometimes produce something interesting.
5. **Include one secret.** Every demo needs one discoverable hidden rule.
6. **Let the system remember.** The user's choices should leave traces.
7. **Something must change.** The world should not look exactly the same at the end.
8. **Give something back.** Always end with a small artifact, transformation, or discovery.
9. **Slightly wrong can be interesting.** The system may occasionally respond differently from what the user expected, as long as the behavior feels intentional and discoverable.
10. **Confusion should become curiosity.** Never make the user think *"I have no idea what I'm supposed to do."* Instead, make them think *"I wonder what happens if I try this."*

---

## The 1-hour scope constraint

The entire experience should be possible to prototype within approximately one hour.

**Use:** 1 WORLD + 1 GOAL + 1 CORE MECHANIC + 1 SECRET + 3–5 STATE VARIABLES +
1 TRANSFORMATION + 1 TAKE-HOME ARTIFACT

**Avoid:** multiple complex pages, authentication, large databases, complex backend
architecture, complicated AI pipelines, many game mechanics, large content libraries, features
that do not contribute to the core experience.

**Prioritize:** one delightful interaction over ten functional features.

## Final experience structure

```
ENTER      ↓  Introduce the world
QUEST      ↓  Give the user something to want
PLAY       ↓  Let them experiment
MYSTERY    ↓  Hide something they can discover
TRACE      ↓  Remember their behavior
TRANSFORM  ↓  Let their actions change the world
REFLECT    ↓  Reveal a pattern through the experience
TAKE HOME  ↓  Give them something small to keep
```

## Product test

Before considering the demo finished, ask:

- [ ] Does the user know what they want to achieve?
- [ ] Can they understand how to start without a long tutorial?
- [ ] Does the world respond meaningfully to their actions?
- [ ] Is there at least one thing they need to figure out themselves?
- [ ] Does the system remember something they did?
- [ ] Does something visibly change because of them?
- [ ] Can the user discover something about their own behavior?
- [ ] Do they receive something at the end?
- [ ] Can the entire experience be understood in under a few minutes?
- [ ] Is there at least one moment where the user thinks *"Wait… what if I try this?"*

If not, **simplify the product and strengthen the interaction.**

---

## Core philosophy

Do not build a tool that tells people who they are. Build a small world that lets them play,
experiment, make choices, and leave traces. Then let the world quietly show them something
about themselves.

The goal is not: *"I discovered the real me."*
The goal is: *"I made something that feels like mine."*

**Reality as Material Principle:** any real-world object, photograph, sound, or memory can
become the world. The system does not need to understand it semantically; it only needs to give
the user something interesting to do with it.

---

## Intelligence definition

```
WORLD → RULES → USER BEHAVIOR → TRACES → EMERGENT REFLECTION
```

AI can be used when available, but it is **not** the requirement for the experience to work.

### 1. Scripted intelligence

The system already knows the rules.

```
if user clicks bird:          bird moves
if user gives bird flower:    bird stays longer
if user gives bird food + flower:  secret interaction
```

### 2. Emergent intelligence

The system doesn't "understand" the user. But because it remembers their behavior, the
experience feels personalized.

```
clickCount, favoriteObject, explorationStyle, chosenColor, interactionOrder

if explorationStyle == "explorer":  unlock rare creature
if favoriteObject == "flower":      final environment contains flowers
```

### 3. Generative intelligence

This is where you eventually add an LLM, image model, vision model, multimodal model,
AI-generated text, AI-generated creatures. **This becomes an upgrade layer, rather than
something the product depends on.**

### When there is no API key

You can build surprisingly rich experiences using: HTML / CSS / JavaScript, Canvas, SVG, image
upload, image cropping, filters, pixelation, overlays, coordinates, mouse / touch interaction,
simple animations, `localStorage`, deterministic rules, randomization, timers, Web Audio, and
pre-written text.
