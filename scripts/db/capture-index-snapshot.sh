#!/usr/bin/env bash
set -euo pipefail

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Please install psql and ensure it's on PATH." >&2
  exit 1
fi

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"

TS_UTC=$(date -u +%Y-%m-%dT%H%M%SZ)
OUT_DIR="docs/db/index-usage"
mkdir -p "$OUT_DIR"

# Capture index usage snapshot in CSV
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 \
  -f scripts/db/index-usage.sql \
  -P pager=off -A -F "," -q \
  > "$OUT_DIR/${TS_UTC}-index-usage.csv"

echo "Saved: $OUT_DIR/${TS_UTC}-index-usage.csv"
