#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
npm install @mozilla/readability jsdom
echo "==> Done! fetch.js is ready to use."
