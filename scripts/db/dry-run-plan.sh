#!/usr/bin/env bash
set -euo pipefail

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Please install psql and ensure it's on PATH." >&2
  exit 1
fi

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"

TS_UTC=$(date -u +%Y-%m-%dT%H%M%SZ)
LOG_DIR="docs/db/logs/${TS_UTC}"
mkdir -p "$LOG_DIR"

# Note: all SQL files default to DRY-RUN/preview modes by design
# - 2025-08-26-rls-rewrite-auth-select.sql: apply_changes := false
# - 2025-08-26-archive-sessions-fk-safe.sql: do_drop := false
# - 2025-08-26-archival-and-drops.sql: do_drop := false

run_sql() {
  local file="$1"
  echo "--- Running ${file} (dry-run mode expected) ---" | tee -a "$LOG_DIR/summary.log"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$file" 2>&1 | tee "$LOG_DIR/$(basename "$file").log"
}

run_sql docs/db/migrations/2025-08-26-rls-rewrite-auth-select.sql
run_sql docs/db/migrations/2025-08-26-archive-sessions-fk-safe.sql
run_sql docs/db/migrations/2025-08-26-archival-and-drops.sql

echo "Logs written to: $LOG_DIR" | tee -a "$LOG_DIR/summary.log"
