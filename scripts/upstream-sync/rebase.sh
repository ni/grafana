#!/usr/bin/env bash
# Usage: rebase.sh <upstream-tag>
#
# Checks out a fresh conflict/ni-<tag> branch from origin/main and rebases
# NI commits onto the upstream tag.
#
# On success: exits 0. Run finalize.sh <tag> next.
# On conflict: exits 1 leaving the working tree mid-rebase so conflicts can be
#              resolved interactively. Run finalize.sh <tag> after completing
#              all `git rebase --continue` iterations.
#
# In CI, wrap with:
#   if bash scripts/upstream-sync/rebase.sh "$TAG"; then
#     bash scripts/upstream-sync/finalize.sh "$TAG"
#   else
#     git rebase --abort
#     ...push conflict branch, open PR...
#   fi

set -euo pipefail

TAG="${1:?Usage: $0 <upstream-tag>}"

git config rerere.enabled true
git config rerere.autoupdate true

# Find the boundary between upstream history and NI-specific commits.
# CONTRIBUTING_NI.md is added only in the NI fork. The parent of the commit
# that first introduced it is the last pure-upstream commit in origin/main —
# everything after it is an NI-specific commit to replay.
# NI_BRANCH: the branch whose tip is the current NI head. Defaults to
# origin/main but can be overridden for testing (e.g. origin/grafana-upgrade-v12).
NI_BRANCH="${NI_BRANCH:-origin/main}"

NI_BASE=$(git log --format="%P" --diff-filter=A -- CONTRIBUTING_NI.md "$NI_BRANCH" | tail -1)
if [ -z "$NI_BASE" ]; then
  echo "Error: could not determine NI fork start (CONTRIBUTING_NI.md not found in history of $NI_BRANCH)"
  exit 1
fi

git checkout -B "conflict/ni-$TAG" "$NI_BRANCH"

# ─── Rebase loop ─────────────────────────────────────────────────────────────
# git rebase exits 1 on any conflict, even when rerere has staged all resolutions.
# Loop: if rerere resolved everything → git rebase --continue; else exit 1 so
# CI can push the conflict branch for manual resolution.
MAX_ITERS=100
ITERS=0
REBASE_STATUS=0

git rebase --onto "$TAG" "$NI_BASE" || REBASE_STATUS=$?

while [ "$REBASE_STATUS" -ne 0 ]; do
  # Guard: if there is no rebase in progress the initial git rebase hit a hard
  # error (e.g. unstaged changes, bad ref).  Don't loop — propagate the failure.
  if [ ! -d .git/rebase-merge ] && [ ! -d .git/rebase-apply ]; then
    echo "Error: rebase failed (exit $REBASE_STATUS) and no rebase is in progress"
    exit "$REBASE_STATUS"
  fi

  ITERS=$((ITERS + 1))
  if [ "$ITERS" -gt "$MAX_ITERS" ]; then
    echo "Error: rebase loop exceeded $MAX_ITERS --continue iterations"
    exit 1
  fi

  # Handle modify/delete conflicts: rerere stages the deletion but git still
  # marks the file as unresolved. Explicit git rm is needed to close them.
  git diff --name-only --diff-filter=U | while IFS= read -r f; do
    if git diff --cached --name-only | grep -qxF "$f"; then
      git rm -f "$f" || true
    fi
  done

  # After modify/delete cleanup, check for genuinely unresolved conflicts.
  UNRESOLVED=$(git diff --name-only --diff-filter=U)
  if [ -n "$UNRESOLVED" ]; then
    echo "Unresolved conflicts remain — manual intervention required:"
    echo "$UNRESOLVED"
    exit 1
  fi

  # All conflicts resolved by rerere; continue to the next commit.
  REBASE_STATUS=0
  GIT_EDITOR=true git rebase --continue || REBASE_STATUS=$?
done
