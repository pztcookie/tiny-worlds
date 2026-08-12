"""Cut assets/source-sheet.png into the individual sprites the game loads.

Build-time tool, not something the game runs. The sheet is one image with every asset
on a black field; tiles are found by splitting on the black gutters rather than by
hardcoded coordinates, so a regenerated sheet with slightly different spacing still cuts.

    python3 -m venv .venv && .venv/bin/pip install Pillow
    .venv/bin/python games/the-fitting-room/scripts/slice_assets.py --report
    .venv/bin/python games/the-fitting-room/scripts/slice_assets.py
"""

import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent.parent
SHEET = HERE / "assets" / "source-sheet.png"
OUT = HERE / "assets"

INK = 80  # clearly content rather than gutter bleed
KEY = 30  # at or below this is background to be keyed out
GUTTER = 4  # a run of this many blank lines separates two tiles
MIN_SIDE = 40  # ignore slivers
# The black field is not perfectly black — generated sheets bleed a little light into
# the gutters — so a line counts as gutter while it holds only a handful of lit pixels.
TOL = 0.012

# Reading order of the detected tiles: bands top to bottom, tiles left to right,
# and within a column of garments, top then bottom.
#
# Only a target height is given, and width follows from the tile's own proportions —
# the generated tiles do not share an aspect ratio, and squashing them to a common box
# would distort the art. Garment heights are proportional to each garment's length in
# the game's grid, so a coat still reads as longer than a child's pinafore.
# The rooms are squared off, because the generated warm rooms came out landscape and the
# cold ones portrait, and the mirror needs one shape. The bias says which edge to keep
# when there is more to lose than a centre crop can spare.
#   name, target height, key the black field, square crop bias
PLAN = [
    ("figure", 240, True, None),
    ("cubicle", 420, False, None),
    ("garment-pinafore", 180, True, None),
    ("garment-shift", 171, True, None),
    ("garment-party", 198, True, None),
    ("garment-coat", 216, True, None),
    ("garment-blazer", 135, True, None),
    ("garment-slip", 189, True, None),
    ("room-bedroom", 384, False, "center"),
    ("room-kitchen", 384, False, "center"),
    ("room-office", 384, False, "center"),
    ("room-flat", 384, False, "top"),  # keep the bare bulb on its flex
    ("room-hotel", 384, False, "center"),
    ("room-wrapped", 384, False, "center"),
    ("room-furnished", 384, False, "top"),  # keep the hanging lamp
]


def blank_lines(mask, box, axis):
    """Which rows (axis=0) or columns (axis=1) inside box are gutter."""
    x0, y0, x1, y1 = box
    if axis == 0:
        span = x1 - x0
        allow = max(2, int(span * TOL))
        return [y for y in range(y0, y1) if sum(mask[y][x0:x1]) <= allow]
    span = y1 - y0
    allow = max(2, int(span * TOL))
    return [x for x in range(x0, x1) if sum(mask[y][x] for y in range(y0, y1)) <= allow]


def runs(values):
    """Group a sorted list of ints into consecutive runs."""
    out = []
    for v in values:
        if out and v == out[-1][-1] + 1:
            out[-1].append(v)
        else:
            out.append([v])
    return out


def split(mask, box, axis):
    """Split box on its gutters along axis, or return None when there is nothing to cut."""
    x0, y0, x1, y1 = box
    lo, hi = (y0, y1) if axis == 0 else (x0, x1)

    gutter = set()
    for run in runs(blank_lines(mask, box, axis)):
        if len(run) >= GUTTER:
            gutter.update(run)

    # The spans are the runs of lines that are not gutter. Deriving them this way
    # avoids assuming the box begins with content rather than a margin.
    spans = []
    start = None
    for i in range(lo, hi):
        if i in gutter:
            if start is not None:
                spans.append((start, i))
                start = None
        elif start is None:
            start = i
    if start is not None:
        spans.append((start, hi))

    spans = [s for s in spans if s[1] - s[0] >= MIN_SIDE]
    if len(spans) < 2:
        return None
    return [(x0, a, x1, b) if axis == 0 else (a, y0, b, y1) for a, b in spans]


def tiles(mask, box, axis=0, depth=0):
    """Alternate horizontal and vertical cuts until a box has no gutters left."""
    if depth > 4:
        return [box]
    parts = split(mask, box, axis)
    if not parts:
        parts = split(mask, box, 1 - axis)
        if not parts:
            return [box]
        axis = 1 - axis
    found = []
    for part in parts:
        found.extend(tiles(mask, part, 1 - axis, depth + 1))
    return found


def trim(mask, box):
    """Shrink a box to its content, so tiles are not padded with gutter."""
    x0, y0, x1, y1 = box
    gutter_rows = set(blank_lines(mask, box, 0))
    gutter_cols = set(blank_lines(mask, box, 1))
    rows = [y for y in range(y0, y1) if y not in gutter_rows]
    cols = [x for x in range(x0, x1) if x not in gutter_cols]
    if not rows or not cols:
        return box
    return (cols[0], rows[0], cols[-1] + 1, rows[-1] + 1)


def squared(tile, bias):
    """Crop to a square, taking from both edges unless one edge holds something."""
    w, h = tile.size
    side = min(w, h)
    if w > h:
        left = (w - side) // 2
        return tile.crop((left, 0, left + side, h))
    top = 0 if bias == "top" else (h - side) // 2
    return tile.crop((0, top, w, top + side))


def keyed(tile):
    """Black field to transparency, keeping soft edges from turning into fringe."""
    tile = tile.convert("RGBA")
    out = []
    for r, g, b, a in tile.getdata():
        peak = max(r, g, b)
        if peak <= KEY:
            out.append((r, g, b, 0))
        elif peak < 70:
            out.append((r, g, b, int(255 * (peak - KEY) / (70 - KEY))))
        else:
            out.append((r, g, b, a))
    tile.putdata(out)
    return tile


def main():
    if not SHEET.exists():
        sys.exit(f"missing {SHEET.relative_to(HERE.parent.parent)}")

    sheet = Image.open(SHEET).convert("RGB")
    w, h = sheet.size
    px = sheet.load()
    mask = [[max(px[x, y]) > INK for x in range(w)] for y in range(h)]

    found = [trim(mask, box) for box in tiles(mask, (0, 0, w, h))]
    report = "--report" in sys.argv

    print(f"sheet {w}x{h}, {len(found)} tiles, {len(PLAN)} planned")
    for i, box in enumerate(found):
        name = PLAN[i][0] if i < len(PLAN) else "UNPLANNED"
        x0, y0, x1, y1 = box
        print(f"  {i:2d} {name:18s} {x1 - x0:4d}x{y1 - y0:4d} at ({x0},{y0})")

    if report:
        return
    if len(found) != len(PLAN):
        sys.exit("tile count does not match the plan — run with --report and fix PLAN")

    for box, (name, height, transparent, bias) in zip(found, PLAN):
        tile = sheet.crop(box)
        tile = keyed(tile) if transparent else tile.convert("RGB")
        if bias:
            tile = squared(tile, bias)
        width = max(1, round(tile.width * height / tile.height))
        # Nearest neighbour on the way down, so pixel edges stay edges.
        tile = tile.resize((width, height), Image.NEAREST)
        path = OUT / f"{name}.png"
        tile.save(path, optimize=True)
        print(f"  wrote assets/{name}.png {width}x{height} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
