"""Cut assets/source/*.png into the transparent sprites the game loads.

Build-time tool, not something the game runs. The fifteen source files are per-layer
exports of one 791x1024 composition: every file is the same size, every sprite sits at
its own offset, and the background only looks transparent — it is solid black with a
fully opaque alpha channel.

That black background is the whole difficulty, and it is worth stating exactly. An
anti-aliased edge pixel that is covered a fraction A by paint of colour C was written to
the file as A x C, because the rest of it is black and black adds nothing. In other words
**every pixel in these files is already premultiplied by its own coverage.** Three
consequences run through everything below:

* Coverage can be read straight back off the file. A boundary pixel's luminance over the
  luminance of the solid paint next to it is A, which is a truer edge than any blur of a
  threshold, because it is the coverage the artist's renderer actually used.
* Nothing may be divided back out until the very end. Premultiplied colour is the form
  that survives resampling — it is why the format exists — so the sprite stays
  premultiplied through the crop and the downscale, and is divided out once, last.
* Skipping that division is the black-matte fringe: the edge keeps a colour that has
  black mixed into it, and on a pale sky it reads as a dark rim nobody drew.

Two more things are specific to this art:

* A global brightness key punches holes through anything with black inside it. The
  parfait glass and the donut ring both have large enclosed near-black regions. So the
  background is found by flooding inward from the border, and the enclosed regions are
  found separately — but they are holes too, every one of them: the middle of the donut,
  the links of the ball chain, the gap under the parfait's foot. In this composition a
  sealed-off black region is always the background showing through.
* The pouch is the exception, and the reason for the whole game reading as clear vinyl.
  Its largest enclosed region is not a hole but the inside of the bag, and becomes a
  faint blue tint; the smaller ones are the holes through the keyring and the charms; and
  the shine strokes along its edge are not black at all but islands of one flat dark navy
  — luminance around 31, nothing else in the file is between 45 and 76 — and become pale
  highlights.

The pouch's interior doubles as the playable area. It is drawn slightly rotated, so no
rectangle matches it; the region found here is written out as a low-resolution bitmask in
assets/pouch-inside.json and the game samples that to decide whether a point is inside.

    python3 -m venv .venv && .venv/bin/pip install Pillow
    .venv/bin/python games/maskutchi-bag-charm/scripts/slice_assets.py --report  # inspect
    .venv/bin/python games/maskutchi-bag-charm/scripts/slice_assets.py           # write
    .venv/bin/python games/maskutchi-bag-charm/scripts/slice_assets.py --halo    # check
"""

import json
import sys
from collections import deque
from pathlib import Path
from statistics import median

from PIL import Image

HERE = Path(__file__).resolve().parent.parent
SRC = HERE / "assets" / "source"
OUT = HERE / "assets"

DARK = 18  # luminance at or below this is a candidate for background

# How far in from the background an edge is allowed to reach. The ramps in this art run
# three or four pixels; past that a dark pixel is dark paint and must keep its alpha.
BAND = 4
OUTER = 3  # and how far out, for the pixels the ramp spends on the background's side
FAINT = 38  # alpha below 15%: too little to divide by without inventing white speckle
REACH = 8  # how far a colour is carried to stand in for one too faint to divide

VINYL = (214, 238, 255, 51)  # the pouch interior: clear blue, barely there
SHINE = (255, 255, 255, 95)  # the strokes along its edge
SHINE_LUM = 45  # the strokes are one flat colour, (34, 31, 38); the line work is 76 and up
SHINE_GREY = 14  # and it is neutral, where the halo around a glowing line is strongly blue
SHINE_MIN = 60  # below this it is a stray pixel rather than a stroke

MASK_W, MASK_H = 64, 96  # the interior bitmask the game samples

# source index, sprite name, on-screen width in the game's 900x600 space.
# Nothing is stored above twice its on-screen size, and nothing is ever upscaled.
PLAN = [
    (1, "pouch", 340),
    (12, "bunny", 62),
    (14, "donut", 46),
    (2, "item-star", 30),
    (3, "item-candy", 46),
    (4, "item-soda", 54),
    (5, "item-cookie", 62),
    (6, "item-peanut", 46),
    (7, "item-grape-candy", 56),
    (8, "item-tart", 50),
    (9, "item-parfait", 46),
    (10, "item-yakult", 34),
    (11, "item-choco", 74),
    (13, "item-pudding", 48),
    (15, "item-blindbag", 66),
]


def source(index):
    hits = sorted(SRC.glob(f"Maskutchi_Bag-{index}-*.png"))
    if not hits:
        sys.exit(f"no source file for layer {index} in {SRC}")
    return hits[0]


def around(i, w, n):
    """The eight neighbours of a pixel, minus whatever falls off the edge."""
    x = i % w
    left = x > 0
    right = x < w - 1
    up = i >= w
    down = i < n - w
    if left:
        yield i - 1
        if up:
            yield i - w - 1
        if down:
            yield i + w - 1
    if right:
        yield i + 1
        if up:
            yield i - w + 1
        if down:
            yield i + w + 1
    if up:
        yield i - w
    if down:
        yield i + w


def scan(px, w, h):
    """Luminance, the strongest channel, and two flat masks: what is near-black, and what
    is a shine stroke."""
    lum = bytearray(w * h)
    peak = bytearray(w * h)
    dark = bytearray(w * h)
    shine = bytearray(w * h)
    for y in range(h):
        row = y * w
        for x in range(w):
            r, g, b = px[x, y][:3]
            value = (r * 299 + g * 587 + b * 114) // 1000
            lum[row + x] = value
            peak[row + x] = max(r, g, b)
            if value <= DARK:
                dark[row + x] = 1
            elif value <= SHINE_LUM and max(r, g, b) - min(r, g, b) <= SHINE_GREY:
                shine[row + x] = 1
    return lum, peak, dark, shine


def flood_background(dark, w, h):
    """The near-black region reachable from the border. Enclosed dark is not in it."""
    bg = bytearray(w * h)
    queue = deque()

    def push(i):
        if dark[i] and not bg[i]:
            bg[i] = 1
            queue.append(i)

    for x in range(w):
        push(x)
        push((h - 1) * w + x)
    for y in range(h):
        push(y * w)
        push(y * w + w - 1)

    while queue:
        i = queue.popleft()
        x = i % w
        if x > 0:
            push(i - 1)
        if x < w - 1:
            push(i + 1)
        if i >= w:
            push(i - w)
        if i < (h - 1) * w:
            push(i + w)
    return bg


def regions(inside, w, h):
    """Connected regions of a flat mask, largest first."""
    seen = bytearray(w * h)
    found = []
    for start in range(w * h):
        if not inside[start] or seen[start]:
            continue
        seen[start] = 1
        queue = deque([start])
        cells = []
        while queue:
            i = queue.popleft()
            cells.append(i)
            x = i % w
            for j in (i - 1 if x > 0 else -1, i + 1 if x < w - 1 else -1, i - w, i + w):
                if 0 <= j < w * h and inside[j] and not seen[j]:
                    seen[j] = 1
                    queue.append(j)
        found.append(cells)
    found.sort(key=len, reverse=True)
    return found


def spread(seeds, blocked, steps, w, n):
    """Distance out from a set of pixels, walking only over pixels the mask allows."""
    out = bytearray(n)
    frontier = seeds
    for step in range(1, steps + 1):
        nxt = []
        for i in frontier:
            for j in around(i, w, n):
                if not out[j] and blocked[j] == 0:
                    out[j] = step
                    nxt.append(j)
        frontier = nxt
    return out


def coverage(lum, peak, void, w, h):
    """Alpha, read off the black matte rather than guessed at.

    Nothing here is a blur of a threshold. Paint away from the boundary is solid and keeps
    its alpha; the boundary itself holds coverage x colour, so a pixel's luminance over the
    luminance of the paint it belongs to is its coverage.

    Which paint it belongs to is the whole question, and the answer is: the brightest paint
    reachable by walking *inwards*, never outwards. Walking inwards finds the body behind
    an anti-aliased edge, which is what a soft edge should be measured against. Refusing to
    walk outwards is what saves a thin bright detail with nothing behind it — the wire foot
    of the parfait glass, a highlight one pixel wide — because the deepest thing it can see
    is itself, so it comes out solid instead of dissolving into whatever brighter thing
    happens to be nearby.
    """
    n = w * h
    paint = bytearray(1 - v for v in void)

    # The edge is the climb out of the background, and it ends where the climbing does.
    # Following the rise rather than counting pixels is what leaves a dark outline alone:
    # an outline is a plateau, or a step down from the pale border in front of it, so the
    # walk stops at its first pixel and the rest of it stays solid paint. BAND is only a
    # backstop for art that ramps further than this art does.
    inward = bytearray(n)
    frontier = [i for i in range(n) if void[i]]
    for step in range(1, BAND + 1):
        nxt = []
        for i in frontier:
            here = lum[i]
            for j in around(i, w, n):
                if not inward[j] and paint[j] and lum[j] > here:
                    inward[j] = step
                    nxt.append(j)
        frontier = nxt

    outward = spread([i for i in range(n) if paint[i]], paint, OUTER, w, n)

    # One ordering, deepest first, so "reachable inwards" is a single pass. Depth 0 is
    # the background proper, which is nowhere near the paint and stays background.
    solid = OUTER + BAND + 1
    depth = bytearray(n)
    layers = [[] for _ in range(solid)]
    for i in range(n):
        if void[i]:
            if not outward[i]:
                continue
            d = OUTER - outward[i] + 1
        elif inward[i]:
            d = OUTER + inward[i]
        else:
            depth[i] = solid
            continue
        depth[i] = d
        layers[d].append(i)

    best = bytearray(n)
    for i in range(n):
        if depth[i] == solid:
            best[i] = lum[i]
    for d in range(solid - 1, 0, -1):
        for i in layers[d]:
            top = lum[i]
            for j in around(i, w, n):
                if depth[j] > d and best[j] > top:
                    top = best[j]
            best[i] = top

    # Coverage cannot be lower than the strongest channel, whatever the luminance says: a
    # pixel storing (0, 3, 37) is 15% of a saturated blue, not 2% of anything, and reading
    # it off the luminance would ask for a colour brighter than blue on the way back.
    alpha = bytearray(n)
    for i in range(n):
        if depth[i] == solid:
            alpha[i] = 255
        elif best[i]:
            a = lum[i] * 255 // best[i]
            floor = peak[i]
            alpha[i] = 255 if a > 255 else (floor if floor > a else a)
    return alpha


def unpremultiply(tile):
    """The last step, and the one that keeps the matte out of the sky.

    Every colour up to here is coverage x colour, which is the form that crops and
    resamples correctly. Dividing the coverage back out is what turns a half-covered edge
    pixel from a dark smudge into the paint it was, at half opacity.
    """
    w, h = tile.size
    px = tile.load()
    n = w * h
    faint = []
    solid = bytearray(n)

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # Resampling can ring, and a premultiplied channel above its own alpha is not
            # a colour. Raise the alpha to meet it rather than divide and clamp to white.
            peak = max(r, g, b)
            if peak > a:
                a = peak
            if not a:
                px[x, y] = (0, 0, 0, 0)
            elif a >= FAINT:
                s = 255 / a
                px[x, y] = (min(255, round(r * s)), min(255, round(g * s)), min(255, round(b * s)), a)
                solid[y * w + x] = 1
            else:
                px[x, y] = (r, g, b, a)
                faint.append(y * w + x)

    # Under 15% there is not enough signal to divide by: rounding alone would swing the
    # result by ten levels a channel and any overshoot from the resample lands as white
    # speckle. Borrow the colour from the nearest pixel that had enough instead.
    frontier = [i for i in range(n) if solid[i]]
    taken = {}
    for _ in range(REACH):
        if not faint:
            break
        nxt = []
        for i in frontier:
            for j in around(i, w, n):
                if j not in taken and not solid[j] and px[j % w, j // w][3]:
                    taken[j] = px[i % w, i // w][:3]
                    nxt.append(j)
        frontier = nxt
    for i in faint:
        x, y = i % w, i // w
        a = px[x, y][3]
        if i in taken:
            r, g, b = taken[i]
        else:
            r, g, b, _ = px[x, y]
            s = 255 / a
            r, g, b = min(255, round(r * s)), min(255, round(g * s)), min(255, round(b * s))
        px[x, y] = (r, g, b, a)


def premultiplied(colour):
    r, g, b, a = colour
    return (round(r * a / 255), round(g * a / 255), round(b * a / 255), a)


def bitmask(cells, w, box):
    """The interior as a MASK_W x MASK_H grid of 0/1 rows, in cropped sprite space."""
    x0, y0, x1, y1 = box
    inside = set(cells)
    rows = []
    for j in range(MASK_H):
        row = []
        for i in range(MASK_W):
            # A cell counts as inside when the middle of it is, sampled 3x3 to be steady
            # about the rotated edges rather than about single pixels.
            hits = 0
            for sy in (0.3, 0.5, 0.7):
                for sx in (0.3, 0.5, 0.7):
                    px = int(x0 + (x1 - x0) * (i + sx) / MASK_W)
                    py = int(y0 + (y1 - y0) * (j + sy) / MASK_H)
                    if py * w + px in inside:
                        hits += 1
            row.append("1" if hits >= 5 else "0")
        rows.append("".join(row))
    return rows


def build(index, name, screen_w, report):
    img = Image.open(source(index)).convert("RGB")
    w, h = img.size
    px = img.load()

    lum, peak, dark, shine = scan(px, w, h)
    bg = flood_background(dark, w, h)
    enclosed = regions(bytearray(d and not b for d, b in zip(dark, bg)), w, h)

    interior = None
    if name == "pouch":
        if not enclosed:
            sys.exit("the pouch has no enclosed interior — has the source art changed?")
        # Its largest enclosed region is the vinyl, and is tinted rather than opened.
        interior, *enclosed = enclosed

    # Everything black is a way through, except the pouch's inside. The near-black
    # boundary of a hole ramps exactly like the outside boundary does, so both are handed
    # to the same edge maths rather than one being cut hard.
    void = bytearray(dark)
    if interior:
        for i in interior:
            void[i] = 0

    sprite = img.convert("RGBA")
    sprite.putalpha(Image.frombytes("L", (w, h), bytes(coverage(lum, peak, void, w, h))))

    if interior:
        data = sprite.load()
        for i in interior:
            data[i % w, i // w] = premultiplied(VINYL)
        for stroke in (r for r in regions(shine, w, h) if len(r) >= SHINE_MIN):
            for i in stroke:
                data[i % w, i // w] = premultiplied(SHINE)

    if report:
        print(f"  {len(enclosed)} holes{f', interior {len(interior)} px' if interior else ''}")

    box = sprite.getbbox()
    if not box:
        sys.exit(f"{name}: nothing left after keying")
    if report:
        x0, y0, x1, y1 = box
        print(f"  content {x1 - x0}x{y1 - y0} at ({x0},{y0})")
        return

    if interior:
        rows = bitmask(interior, w, box)
        path = OUT / "pouch-inside.json"
        path.write_text(json.dumps({"w": MASK_W, "h": MASK_H, "rows": rows}) + "\n")
        print(f"  wrote assets/pouch-inside.json ({path.stat().st_size // 1024} KB)")

    tile = sprite.crop(box)
    target = min(screen_w * 2, tile.width)
    height = max(1, round(tile.height * target / tile.width))
    # Smooth art, not pixel art: resample rather than point sample. Safe on all four
    # channels at once only because the colour is still premultiplied — and bilinear
    # rather than the sharper lanczos, whose negative lobes ring. Ringing on a
    # premultiplied edge is not a soft overshoot but a pixel whose colour has come loose
    # from its coverage, and it lands as coloured speckle all along the outline.
    tile = tile.resize((target, height), Image.BILINEAR)
    unpremultiply(tile)
    out = OUT / f"{name}.png"
    tile.save(out, optimize=True)
    print(f"  wrote assets/{name}.png {target}x{height} ({out.stat().st_size // 1024} KB)")


def halo():
    """Is there a black rim? An edge should be about as bright as the body it belongs to,
    so the two medians should sit close together and the delta near zero."""
    print(f"{'sprite':<22}{'semi-a px':>11}{'med lum semi':>15}{'med lum solid':>15}{'delta':>8}")
    for _, name, _ in PLAN:
        path = OUT / f"{name}.png"
        if not path.exists():
            continue
        semi, body = [], []
        for r, g, b, a in Image.open(path).convert("RGBA").getdata():
            if 60 <= a <= 200:
                semi.append((r * 299 + g * 587 + b * 114) // 1000)
            elif a > 240:
                body.append((r * 299 + g * 587 + b * 114) // 1000)
        if not semi or not body:
            continue
        lo, hi = round(median(semi)), round(median(body))
        print(f"{path.name:<22}{len(semi):>11}{lo:>15}{hi:>15}{lo - hi:>+8}")


def main():
    if "--halo" in sys.argv:
        halo()
        return
    report = "--report" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("-")]
    for index, name, screen_w in PLAN:
        if only and name not in only:
            continue
        print(f"{name} (layer {index})")
        build(index, name, screen_w, report)


if __name__ == "__main__":
    main()
