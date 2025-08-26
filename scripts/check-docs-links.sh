#!/usr/bin/env bash
set -euo pipefail

echo "Scanning for legacy '.windsurf/rules/' path usage..."
matches=$(grep -R -n '\.windsurf/rules/' . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=.husky \
  --exclude-dir=.windsurf/rules || true)

if [[ -n "$matches" ]]; then
  echo "Found legacy '.windsurf/rules/' references. Use '../rules/' instead."
  echo "$matches"
  exit 1
fi

echo "No legacy references found."
