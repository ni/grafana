#!/usr/bin/env bash
# Usage: finalize.sh <upstream-tag>
#
# Run after a successful rebase onto <upstream-tag> to:
#   - Restore NI fork workflows (idempotent)
#   - Create and push the ni-<tag> git tag
#
# Used by both CI workflows. Safe to run multiple times.

set -euo pipefail

TAG="${1:?Usage: $0 <upstream-tag>}"

git checkout origin/main -- .github/workflows/
git diff --quiet --cached || git commit -m "chore: restore NI fork workflows for $TAG"

git tag -f "ni-$TAG"
git push origin "ni-$TAG" --force
echo "Created ni-$TAG"
