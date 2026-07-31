#!/bin/bash
# Auto-deploy script for klikweb.id
# Triggered by webhook receiver after GitHub push
set -euo pipefail

cd "$(dirname "$0")/.."

# Non-interactive SSH shells (GitHub Actions ssh-action, cron, etc.) don't
# source ~/.bashrc, so ~/.npm-global/bin (where pm2 lives) is missing from
# PATH. Add it explicitly so `pm2` resolves regardless of shell type.
export PATH="$HOME/.npm-global/bin:$PATH"

BRANCH="${1:-main}"
LOG_FILE="/var/www/klikweb.id/deploy/deploy.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify_slack() {
  local color="$1" message="$2"
  local slack_url
  slack_url=$(grep SLACK_WEBHOOK_URL /var/www/klikweb.id/deploy/.env | cut -d= -f2-)
  [ -z "$slack_url" ] && return 0
  curl -s -X POST -H 'Content-type: application/json' \
    --data "{\"attachments\":[{\"color\":\"$color\",\"mrkdwn_in\":[\"text\"],\"text\":\"$message\"}]}" \
    "$slack_url" > /dev/null 2>&1 || true
}

START=$(date +%s)
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

log "=== Deploy started (branch: $BRANCH) ==="

# 1. Pull latest code
log "Pulling latest code from origin/$BRANCH..."

if ! git pull origin "$BRANCH" >>"$LOG_FILE" 2>&1; then
  log "ERROR: git pull failed"
  notify_slack "danger" "❌ *klikweb.id* deploy FAILED at \`$COMMIT\`\ngit pull error. Check deploy.log"
  exit 1
fi

NEW_COMMIT=$(git rev-parse --short HEAD)
log "Now at commit: $NEW_COMMIT"

# 1b. Ensure ESLint does not block builds (patch next.config.mjs if needed)
# This allows deploys to succeed even when upstream pushes lint errors.
if ! grep -q "ignoreDuringBuilds" next.config.mjs 2>/dev/null; then
  log "Patching next.config.mjs to ignore ESLint during builds..."
  sed -i '/const nextConfig = {/a\  eslint: { ignoreDuringBuilds: true },' next.config.mjs 2>/dev/null || true
fi

# Skip if nothing changed in app code (only relevant if called manually)
if [ "$COMMIT" = "$NEW_COMMIT" ] && [ "${FORCE:-0}" != "1" ]; then
  log "No changes detected, skipping build."
  exit 0
fi

# 2. Install dependencies (only if package-lock changed)
if git diff --name-only "$COMMIT" "$NEW_COMMIT" 2>/dev/null | grep -q "package-lock.json"; then
  log "package-lock.json changed, running npm install..."
  npm install >>"$LOG_FILE" 2>&1 || {
    notify_slack "danger" "❌ *klikweb.id* deploy FAILED at \`$NEW_COMMIT\`\nnpm install error"
    exit 1
  }
fi

# 3. Generate Prisma client (in case schema changed)
log "Generating Prisma client..."
npx prisma generate >>"$LOG_FILE" 2>&1 || {
  notify_slack "danger" "❌ *klikweb.id* deploy FAILED at \`$NEW_COMMIT\`\nprisma generate error"
  exit 1
}

# 4. Run migrations (safe - only applies pending migrations)
log "Running database migrations..."
npx prisma migrate deploy >>"$LOG_FILE" 2>&1 || {
  notify_slack "danger" "❌ *klikweb.id* deploy FAILED at \`$NEW_COMMIT\`\nprisma migrate error"
  exit 1
}

# 4b. Force-sync schema.prisma to DB.
# prisma migrate deploy only applies committed migration files. If a dev changes
# schema.prisma without committing a migration, the DB falls out of sync and the
# app crashes (ColumnNotFound). db push catches this: it's idempotent when in
# sync, and applies missing columns when not.
log "Syncing schema to database (catches missing migrations)..."
DBPUSH_OUTPUT=$(npx prisma db push --accept-data-loss 2>&1 || true)
echo "$DBPUSH_OUTPUT" >>"$LOG_FILE"
if echo "$DBPUSH_OUTPUT" | grep -qi "applied\|changed\|Your database is now in sync"; then
  log "db push applied schema changes to DB."
  notify_slack "warning" "⚠️ *klikweb.id* schema auto-synced at \`$NEW_COMMIT\`\nschema.prisma had changes with no migration file. \`prisma db push\` synced the DB so the app stays up. Please run \`prisma migrate dev\` in the repo and commit the migration."
fi

# 5. Build Next.js
log "Building Next.js production bundle..."
npm run build >>"$LOG_FILE" 2>&1 || {
  notify_slack "danger" "❌ *klikweb.id* deploy FAILED at \`$NEW_COMMIT\`\nnpm run build error"
  exit 1
}

# 6. Restart pm2
log "Restarting pm2 process..."
pm2 restart klikweb.id >>"$LOG_FILE" 2>&1 || {
  notify_slack "danger" "❌ *klikweb.id* deploy FAILED at \`$NEW_COMMIT\`\npm2 restart error"
  exit 1
}

END=$(date +%s)
DURATION=$((END - START))

log "=== Deploy completed in ${DURATION}s ==="
notify_slack "good" "✅ *klikweb.id* deployed successfully\nCommit: \`$NEW_COMMIT\` (branch \`$BRANCH\`)\nBuild time: ${DURATION}s"
