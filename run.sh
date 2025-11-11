#!/bin/bash
# ================================================================================
# Midnight Fetcher Bot - macOS/Linux Quick Start
# ================================================================================
# Starts the Rust hash server and Next.js dev server on port 3001
# ================================================================================
set -euo pipefail

HASH_SERVER_BIN="hashengine/target/release/hash-server"

echo ""
echo "================================================================================"
echo "                    Midnight Fetcher Bot - Starting..."
echo "================================================================================"
echo ""

# Ensure required directories exist
mkdir -p logs
mkdir -p secure
mkdir -p storage

# Ensure hash server exists; build if missing
if [ ! -f "$HASH_SERVER_BIN" ]; then
  echo "Hash server binary not found. Building..."
  if ! command -v cargo >/dev/null 2>&1; then
    echo "ERROR: Rust (cargo) is required to build the hash server."
    echo "Install from https://rustup.rs/ and re-run."
    exit 1
  fi
  (cd hashengine && cargo build --release --bin hash-server)
fi

echo "[1/3] Starting hash server on port 9001..."
export RUST_LOG=hash_server=info,actix_web=warn
export HOST=127.0.0.1
export PORT=9001
export WORKERS=4

nohup "$HASH_SERVER_BIN" > logs/hash-server.log 2>&1 &
HASH_PID=$!
echo "  - Hash server started (PID: $HASH_PID)"
echo ""

echo "[2/3] Waiting for hash server to be ready..."
READY=0
for i in {1..20}; do
  if curl -s http://127.0.0.1:9001/health >/dev/null 2>&1; then
    echo "  - Hash server ready!"
    READY=1
    break
  fi
  echo "  - Waiting..."
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo ""
  echo "ERROR: Hash server did not become ready in time."
  echo "Recent logs from logs/hash-server.log:"
  echo "-------------------------------------------------------------------------------"
  tail -n 200 logs/hash-server.log || true
  echo "-------------------------------------------------------------------------------"
  echo "Please review the error above, then fix and re-run."
  kill "$HASH_PID" 2>/dev/null || true
  exit 1
fi

echo ""
echo "[3/3] Starting Next.js development server on http://localhost:3001 ..."
echo ""
echo "================================================================================"
echo "                         Ready to Mine!"
echo "================================================================================"
echo ""
echo "Hash Service: http://127.0.0.1:9001/health"
echo "Web Interface: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop Next.js (hash server continues in background)"
echo "To stop hash server: kill $HASH_PID"
echo "================================================================================"
echo ""

# Open browser (macOS prefer 'open', Linux fallback to xdg-open)
if command -v open >/dev/null 2>&1; then
  (sleep 2 && open "http://localhost:3001") >/dev/null 2>&1 &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 2 && xdg-open "http://localhost:3001") >/dev/null 2>&1 &
fi

npx --yes next dev -p 3001

echo ""
echo "Next.js stopped."
echo "Hash server still running (PID: $HASH_PID). To stop it: kill $HASH_PID"


