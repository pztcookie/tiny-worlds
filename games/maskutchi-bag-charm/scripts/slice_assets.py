"""Cut assets/source/*.png into the transparent sprites the game loads.

Build-time tool, not something the game runs. The fifteen source files are per-layer
exports of one 791x1024 composition: every file is the same size, every sprite sits at
its own offset, and the background only looks transparent — it is solid black with a
fully opaque alpha channel.

Two things make this more than a threshold:

* A global brightness key punches holes through anything with black inside it. The
  parfait glass and the donut ring both have large enclosed near-black regions. So the
  background is found by flooding inward from the border over near-black pixels and only
  that border-connected region becomes transparent. Enclosed dark stays opaque.
* The pouch is the exception, because the parts of it that read as glass are all painted
  dark in the source and turn into smears on a pastel sky. Three separate things:
  its interior, which is the one big enclosed black region and becomes a faint blue
  tint; the holes through the keyring and the charms, which are the smaller enclosed
  black regions and become actual holes; and the shine strokes along its edge, which are
  not black at all but islands of one flat dark navy — luminance around 31, nothing else
  in the file is between 45 and 76 — and become pale highlights. Together those three are
  what make the pouch read as clear vinyl with things inside it.

Keying that black leaves some of it behind, in the soft band where the paint was blended
into it and in the folds the artist painted near-black because the background was going to
be black too. Two steps afterwards move that dark toward the palette's lilac instead of
trying to remove it — see lilac_rim and lilac_paint. Neither touches coverage, and neither
goes anywhere near the navy line work: recovering these edges by arithmetic was tried, and
it brightened the outlines away.

The pouch's interior doubles as the playable area. It is drawn slightly rotated, so no
rectangle matches it; the region found here is written out as a low-resolution bitmask in
assets/pouch-inside.json and the game samples that to decide whether a point is inside.

    python3 -m venv .venv && .venv/bin/pip install Pillow
    .venv/bin/python games/maskutchi-bag-charm/scripts/slice_assets.py --report
    .venv/bin/python games/maskutchi-bag-charm/scripts/slice_assets.py
"""

import json
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent.parent
SRC = HERE / "assets" / "source"
OUT = HERE / "assets"

DARK = 18  # luminance at or below this is a candidate for background
FEATHER = 0.8  # blur radius on the alpha edge; the line work glows and should not look cut

LILAC = (220, 206, 255)  # the bunny's ears: a thousand pixels of it, so it is the art's own
RIM = 0.9  # how far the darkest residue moves toward it, and never all the way
RIM_LUM = 45  # residue is near-black, and the line work in this art starts at 76
RIM_HOLD = 0.55  # an opaque edge pixel moves less far, so the rim stays a gradient
RIM_BLEED = 3  # and the cleared pixels this close carry it too, for the resampler to find

# Three spots in this set are dark paint and not matte residue: the candy's left wrapper fin,
# the cookie packet's bottom corner and the shadow behind the yakult's cap. Against the dark
# background the art was drawn on they were folds, and on the pastel sky they read as bites out
# of the sticker. They are named here rather than found, because nothing in the pixels separates
# them from the soda's navy cap or the dark beads on the pouch, which are shading on dark paint
# and have to stay. The number is how many of a sprite's near-black shapes to lift, largest
# first.
PAINT_SPOTS = {"item-candy": 2, "item-cookie": 1, "item-yakult": 1}
PAINT = 0.7  # a lift and not a repaint: the fold keeps its shape and its gradient
PAINT_CORE = 45  # the near-black part of the fold, which is what can be found by colour
PAINT_LUM = 110  # the rest of it is dark paint in the same range as the line work, so it is
PAINT_GROW = 3  # grown out from that core a few pixels instead of being selected
PAINT_MIN = 10  # and a core smaller than this is a speck, not a fold
PAINT_SOLID = 240  # solid enough: the feather nibbles the outermost ring of every shape

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


def scan(px, w, h):
    """Two flat masks: what is near-black, and what is a shine stroke."""
    dark = bytearray(w * h)
    shine = bytearray(w * h)
    for y in range(h):
        row = y * w
        for x in range(w):
            r, g, b = px[x, y][:3]
            value = (r * 299 + g * 587 + b * 114) // 1000
            if value <= DARK:
                dark[row + x] = 1
            elif value <= SHINE_LUM and max(r, g, b) - min(r, g, b) <= SHINE_GREY:
                shine[row + x] = 1
    return dark, shine


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


def toward_lilac(px, x, y, pull, ceiling):
    """Blend one pixel toward the lilac, the darker the further, and never past `pull`."""
    r, g, b, a = px[x, y]
    value = (r * 299 + g * 587 + b * 114) // 1000
    if value >= ceiling:
        return 0
    k = pull * (1 - value / ceiling)
    px[x, y] = (
        round(r + (LILAC[0] - r) * k),
        round(g + (LILAC[1] - g) * k),
        round(b + (LILAC[2] - b) * k),
        a,
    )
    return 1


def lilac_rim(sprite, w, h):
    """Move the black the keying leaves behind toward the palette's lilac.

    Keying an edge that was anti-aliased against black gives it a partial alpha and leaves
    the black in the colour, and on a pale sky that is a grey rim. This does not try to
    work out what colour was under it — that way lies brightening the artist's navy
    outlines out of existence. It just makes the residue belong to the palette: a rim that
    steps from outline to lilac to sky reads as a soft glow rather than as a dark cut.

    Three sets of pixels, and only these three:

    * The soft band, which is where the residue is. Darkest moves most, and RIM_LUM keeps
      the reach below the line work, which starts far above it.
    * Opaque pixels that are near-black *and* touching the band, which is matte residue the
      threshold happened to round up to solid. They move less far, so the rim keeps a ramp.
    * Cleared pixels near the sprite, which are invisible but not inert: the downscale
      resamples their colour into the edge, and it should find lilac there and not black.

    Nothing else. Coverage is not touched anywhere, and opaque paint above RIM_LUM comes
    through exactly as drawn.
    """
    px = sprite.load()
    n = w * h
    band = bytearray(n)
    clear = bytearray(n)
    for y in range(h):
        row = y * w
        for x in range(w):
            a = px[x, y][3]
            if not a:
                clear[row + x] = 1
            elif a < 255:
                band[row + x] = 1

    moved = 0
    for i in range(n):
        if band[i]:
            moved += toward_lilac(px, i % w, i // w, RIM, RIM_LUM)
    for i in range(n):
        if band[i] or clear[i]:
            continue
        x = i % w
        if not any(
            band[j]
            for j in (i - 1 if x else -1, i + 1 if x < w - 1 else -1, i - w, i + w)
            if 0 <= j < n
        ):
            continue
        moved += toward_lilac(px, x, i // w, RIM_HOLD, RIM_LUM)

    # The cleared ring last, and flat: there is no colour under a pixel that is not there,
    # so this is only about what the resample has to hand at the edge.
    frontier = [i for i in range(n) if not clear[i]]
    for _ in range(RIM_BLEED):
        nxt = []
        for i in frontier:
            x = i % w
            for j in (i - 1 if x else -1, i + 1 if x < w - 1 else -1, i - w, i + w):
                if 0 <= j < n and clear[j] == 1:
                    clear[j] = 2
                    px[j % w, j // w] = LILAC + (0,)
                    nxt.append(j)
        frontier = nxt
    return moved


def lilac_paint(sprite, name, w, h):
    """Lift a named fold of dark paint toward the same lilac, so it stops reading as a hole.

    The fold's near-black core is easy to find. The rest of it is not: the paint that shades
    into the core sits in the same luminance range as the navy outlines, and picking that range
    by colour would lift every outline in the sprite, which is exactly how the last attempt at
    these edges failed. So the core is grown outward a few pixels through dark paint instead,
    which reaches the whole fold and cannot reach across the sprite.
    """
    keep = PAINT_SPOTS.get(name)
    if not keep:
        return 0
    px = sprite.load()
    n = w * h
    core = bytearray(n)
    for i in range(n):
        r, g, b, a = px[i % w, i // w]
        if a >= PAINT_SOLID and (r * 299 + g * 587 + b * 114) // 1000 <= PAINT_CORE:
            core[i] = 1
    shapes = (c for c in regions(core, w, h) if len(c) >= PAINT_MIN)
    found = sorted(shapes, key=len, reverse=True)
    if len(found) < keep:
        sys.exit(f"{name}: wanted {keep} dark fold(s), found {len(found)} — has the art moved?")

    fold = set()
    for cells in found[:keep]:
        fold.update(cells)
    frontier = list(fold)
    for _ in range(PAINT_GROW):
        nxt = []
        for i in frontier:
            x = i % w
            for j in (i - 1 if x else -1, i + 1 if x < w - 1 else -1, i - w, i + w):
                if j < 0 or j >= n or j in fold:
                    continue
                r, g, b, a = px[j % w, j // w]
                if a >= PAINT_SOLID and (r * 299 + g * 587 + b * 114) // 1000 <= PAINT_LUM:
                    fold.add(j)
                    nxt.append(j)
        frontier = nxt

    moved = 0
    for i in fold:
        moved += toward_lilac(px, i % w, i // w, PAINT, PAINT_LUM)
    return moved


def build(index, name, screen_w, report):
    img = Image.open(source(index)).convert("RGB")
    w, h = img.size
    px = img.load()

    dark, shine = scan(px, w, h)
    bg = flood_background(dark, w, h)

    alpha = Image.new("L", (w, h))
    alpha.putdata([0 if bg[i] else 255 for i in range(w * h)])
    alpha = alpha.filter(ImageFilter.GaussianBlur(FEATHER))

    sprite = img.convert("RGBA")
    sprite.putalpha(alpha)

    # Every enclosed black region is background that the artwork happens to have sealed off:
    # the holes through the keyring, the ball chain on the blind bag, the glass foot of the
    # parfait and the middle of the brand ring. All of them are holes.
    enclosed = regions(bytearray(d and not b for d, b in zip(dark, bg)), w, h)
    data = sprite.load()
    interior = None

    if name == "pouch":
        if not enclosed:
            sys.exit("the pouch has no enclosed interior — has the source art changed?")
        # Except the largest one, which is the vinyl, and is tinted rather than opened.
        interior, *enclosed = enclosed
        for i in interior:
            data[i % w, i // w] = VINYL
        for stroke in (r for r in regions(shine, w, h) if len(r) >= SHINE_MIN):
            for i in stroke:
                data[i % w, i // w] = SHINE

    # Repainted after the feather, so the soft edge stays on the outline and everything
    # here keeps the exact alpha it was given.
    for hole in enclosed:
        for i in hole:
            data[i % w, i // w] = (0, 0, 0, 0)

    # The fold first: the rim pass lifts the outer pixels of a dark shape out of its own range
    # and would leave the middle of it black.
    lifted = lilac_paint(sprite, name, w, h)
    tinted = lilac_rim(sprite, w, h)

    if report:
        print(f"  {len(enclosed)} holes{f', interior {len(interior)} px' if interior else ''}")
        print(f"  {tinted} px of rim residue and {lifted} px of dark paint moved to the lilac")

    box = sprite.getbbox()
    if not box:
        sys.exit(f"{name}: nothing left after keying")
    if report:
        x0, y0, x1, y1 = box
        print(f"  content {x1 - x0}x{y1 - y0} at ({x0},{y0})")
        return

    if interior is not None:
        rows = bitmask(interior, w, box)
        path = OUT / "pouch-inside.json"
        path.write_text(json.dumps({"w": MASK_W, "h": MASK_H, "rows": rows}) + "\n")
        print(f"  wrote assets/pouch-inside.json ({path.stat().st_size // 1024} KB)")

    tile = sprite.crop(box)
    target = min(screen_w * 2, tile.width)
    height = max(1, round(tile.height * target / tile.width))
    # Smooth art, not pixel art: resample rather than point sample.
    tile = tile.resize((target, height), Image.LANCZOS)
    out = OUT / f"{name}.png"
    tile.save(out, optimize=True)
    print(f"  wrote assets/{name}.png {target}x{height} ({out.stat().st_size // 1024} KB)")


def main():
    report = "--report" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("-")]
    for index, name, screen_w in PLAN:
        if only and name not in only:
            continue
        print(f"{name} (layer {index})")
        build(index, name, screen_w, report)


if __name__ == "__main__":
    main()
