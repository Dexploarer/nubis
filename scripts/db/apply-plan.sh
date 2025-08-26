#!/usr/bin/env bash
set -euo pipefail

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Please install psql and ensure it's on PATH." >&2
  exit 1
fi

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"

# Manual trigger guard: require explicit confirmation
if [ "${OFFHOURS_CONFIRM:-}" != "YES" ]; then
  echo "Refusing to run: set OFFHOURS_CONFIRM=YES to manually trigger off-hours APPLY." >&2
  echo "Example: OFFHOURS_CONFIRM=YES bash scripts/db/apply-plan.sh" >&2
  exit 1
fi

TS_UTC=$(date -u +%Y-%m-%dT%H%M%SZ)
LOG_DIR="docs/db/logs/${TS_UTC}"
mkdir -p "$LOG_DIR"

# Files to run
RLS_FILE="docs/db/migrations/2025-08-26-rls-rewrite-auth-select.sql"
SESSIONS_FILE="docs/db/migrations/2025-08-26-archive-sessions-fk-safe.sql"
ARCHIVE_FILE="docs/db/migrations/2025-08-26-archival-and-drops.sql"

# Sanity checks: ensure flags are enabled before applying
require_flag_true() {
  local file="$1";
  local pattern="$2";
  if ! grep -Eq "$pattern" "$file"; then
    echo "Flag not enabled in $file. Expected pattern: $pattern" >&2
    exit 1
  fi
}

# Expect apply_changes := true in RLS file
require_flag_true "$RLS_FILE" "apply_changes[[:space:]]*:=[[:space:]]*true"
# Expect do_drop := true in child-first sessions archival
require_flag_true "$SESSIONS_FILE" "do_drop[[:space:]]*:=[[:space:]]*true"
# Expect do_drop := true in archival-and-drops
require_flag_true "$ARCHIVE_FILE" "do_drop[[:space:]]*:=[[:space:]]*true"

run_sql() {
  local file="$1"
  echo "--- Applying ${file} ---" | tee -a "$LOG_DIR/summary.log"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$file" 2>&1 | tee "$LOG_DIR/$(basename "$file").log"
}

# Apply in order: RLS rewrites first (non-destructive), then child-first sessions archival, then generic archival/drops
run_sql "$RLS_FILE"
run_sql "$SESSIONS_FILE"
run_sql "$ARCHIVE_FILE"

echo "Apply complete. Logs at: $LOG_DIR" | tee -a "$LOG_DIR/summary.log"
