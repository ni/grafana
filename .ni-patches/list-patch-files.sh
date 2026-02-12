#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: list-patch-files.sh <PATCH_FILE>

Prints the list of files referenced by a patch.
EOF
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

PATCH_FILE="$1"

if [[ ! -f "${PATCH_FILE}" ]]; then
  echo "Patch file not found: ${PATCH_FILE}"
  exit 1
fi

awk '/^diff --git a\// {print substr($3, 3)}' "${PATCH_FILE}" | sort -u
