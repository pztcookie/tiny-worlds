#!/usr/bin/env bash
# Create a new game from the starter kit.
#   ./scripts/new-game.sh moonlit-cafe "Moonlit Cafe"
set -euo pipefail

slug="${1:-}"
title="${2:-}"

if [[ -z "$slug" ]]; then
  echo "usage: ./scripts/new-game.sh <slug> [\"Game Title\"]" >&2
  exit 1
fi

if [[ ! "$slug" =~ ^[a-z0-9-]+$ ]]; then
  echo "slug must be lowercase letters, numbers and hyphens: $slug" >&2
  exit 1
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dest="$root/games/$slug"

if [[ -e "$dest" ]]; then
  echo "games/$slug already exists" >&2
  exit 1
fi

# Title-case the slug when no title is given: moonlit-cafe -> Moonlit Cafe
if [[ -z "$title" ]]; then
  title="$(echo "$slug" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')"
fi

cp -R "$root/template" "$dest"
mkdir -p "$dest/assets"

# Point the starter kit at the new game.
sed -i '' \
  -e "s/slug: \"template\"/slug: \"$slug\"/" \
  -e "s/title: \"A Tiny World\"/title: \"$title\"/" \
  "$dest/game.js"

printf '# %s\n\nA tiny world. Not written yet.\n\n```bash\npython3 -m http.server 8765\n```\n' \
  "$title" > "$dest/README.md"

brief="$root/briefs/$slug.md"
if [[ ! -f "$brief" ]]; then
  sed "s/<game name>/$title/" "$root/briefs/TEMPLATE.md" > "$brief"
  echo "brief    briefs/$slug.md"
fi

echo "game     games/$slug/"
echo
echo "next     fill in briefs/$slug.md, then:"
echo "         cd games/$slug && python3 -m http.server 8765"
