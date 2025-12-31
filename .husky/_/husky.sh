#!/bin/sh
# Minimal helper to source Husky's script from node_modules when hooks are run.
# This mimics what `husky install` would create and avoids needing manual `husky install` first.
root_dir() { git rev-parse --show-toplevel; }
ROOT_DIR="$(root_dir)"

if [ -f "$ROOT_DIR/node_modules/husky/husky.sh" ]; then
  . "$ROOT_DIR/node_modules/husky/husky.sh"
else
  echo "husky not installed yet. Run 'pnpm install' to install and set up hooks."
fi
