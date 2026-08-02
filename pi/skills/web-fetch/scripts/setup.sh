#!/usr/bin/env bash
set -e

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SKILL_DIR"

echo "==> Setting up web-fetch skill dependencies in $SKILL_DIR"

if [ ! -f package.json ]; then
    echo "==> Creating package.json"
    npm init -y > /dev/null 2>&1
fi

echo "==> Installing @mozilla/readability and jsdom..."
npm install @mozilla/readability jsdom

echo "==> Done! extract.js is ready to use."
