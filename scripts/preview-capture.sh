#!/usr/bin/env bash
# Rebuild, (re)start wrangler dev on :8787, and capture local screenshots.
# Usage: scripts/preview-capture.sh [--only /en,/en/about]
set -euo pipefail
cd "$(dirname "$0")/.."
pkill -f "wrangler dev --port 8787" 2>/dev/null || true
npm run build >/dev/null
(npx wrangler dev --port 8787 >/dev/null 2>&1 &)
for _ in $(seq 1 40); do curl -s -o /dev/null http://localhost:8787/en && break; sleep 1; done
node scripts/capture.mjs local "$@" | tail -1
