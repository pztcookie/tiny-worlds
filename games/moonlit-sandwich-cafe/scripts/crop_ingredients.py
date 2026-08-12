"""Cut individual ingredient sprites out of the stackable spritesheet.

Run from the project root with Pillow installed:
    python3 -m venv .venv && .venv/bin/pip install Pillow
    .venv/bin/python scripts/crop_ingredients.py
"""

from collections import deque
from pathlib import Path

from PIL import Image

SHEET = Path("assets/stackable_layers_visuals.png")
OUT_DIR = Path("assets/ingredients")

# Component index (reading order) -> sprite name.
NAMES = {
    12: "lettuce", 13: "tomato", 14: "cucumber", 15: "avocado", 16: "onion",
    17: "radish", 18: "pepper", 19: "cabbage", 20: "shiso", 21: "nori",
    22: "tofu-fried", 23: "tofu", 24: "beans", 25: "egg", 26: "cheese",
    33: "mayo", 34: "mustard", 35: "pesto", 36: "herb-cream", 37: "hummus",
    38: "galaxy", 42: "chili", 43: "spicy",
    6: "bread-white", 8: "baguette", 9: "pita", 11: "bao",
    46: "finished-classic", 47: "finished-sub", 48: "finished-magic",
}

# The crystal cluster is a loose group of shards, so it is cropped by hand.
CRYSTALS_BOX = (1325, 525, 1525, 715)

MIN_COMPONENT_PIXELS = 120
BLACK = 22


def find_components(im):
    pixels = im.load()
    w, h = im.size
    seen = [[False] * h for _ in range(w)]
    boxes = []

    def is_fg(x, y):
        r, g, b, a = pixels[x, y]
        return a >= 20 and not (r < BLACK and g < BLACK and b < BLACK)

    for y in range(h):
        for x in range(w):
            if seen[x][y]:
                continue
            if not is_fg(x, y):
                seen[x][y] = True
                continue
            queue = deque([(x, y)])
            seen[x][y] = True
            minx = maxx = x
            miny = maxy = y
            count = 0
            while queue:
                cx, cy = queue.popleft()
                count += 1
                minx, maxx = min(minx, cx), max(maxx, cx)
                miny, maxy = min(miny, cy), max(maxy, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny]:
                        seen[nx][ny] = True
                        if is_fg(nx, ny):
                            queue.append((nx, ny))
            if count >= MIN_COMPONENT_PIXELS:
                boxes.append((minx, miny, maxx + 1, maxy + 1))

    boxes.sort(key=lambda b: (b[1] // 25, b[0]))
    return boxes


def save_crop(im, box, name, pad=4):
    x0, y0, x1, y1 = box
    w, h = im.size
    crop = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
    px = crop.load()
    for y in range(crop.size[1]):
        for x in range(crop.size[0]):
            r, g, b, a = px[x, y]
            if r < 28 and g < 28 and b < 28:
                px[x, y] = (0, 0, 0, 0)
    crop.save(OUT_DIR / f"{name}.png")
    print(f"{name}: {crop.size[0]}x{crop.size[1]}")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    im = Image.open(SHEET).convert("RGBA")
    boxes = find_components(im)
    for index, name in NAMES.items():
        save_crop(im, boxes[index], name)
    save_crop(im, CRYSTALS_BOX, "crystals", pad=0)


if __name__ == "__main__":
    main()
