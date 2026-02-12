#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: .ni-patches/regenerate-patch.sh <PATCH_FILE> <BASE_COMMIT> [TIP_COMMIT] [--add <FILE> ...]

Regenerates an existing patch by re-diffing the files already included
in that patch from BASE_COMMIT to TIP_COMMIT.

If TIP_COMMIT is omitted, the script uses HEAD.
Use --add to include new files that are not already in the patch.
EOF
}

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

PATCH_FILE="$1"
BASE_COMMIT="$2"
shift 2

TIP_COMMIT="HEAD"
tip_set=false
extra_files=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --add)
      shift
      if [[ $# -eq 0 ]]; then
        echo "Missing file after --add"
        exit 1
      fi
      extra_files+=("$1")
      ;;
    *)
      if [[ "${tip_set}" == false ]]; then
        TIP_COMMIT="$1"
        tip_set=true
      else
        echo "Unexpected argument: $1"
        exit 1
      fi
      ;;
  esac
  shift
done

if [[ ! -f "${PATCH_FILE}" ]]; then
  echo "Patch file not found: ${PATCH_FILE}"
  exit 1
fi

repo_root=$(git rev-parse --show-toplevel)
cd "${repo_root}"

mapfile -t patch_files < <(
  awk '/^diff --git a\// {print substr($3, 3)}' "${PATCH_FILE}" | sort -u
)

if [[ ${#extra_files[@]} -gt 0 ]]; then
  mapfile -t patch_files < <(
    printf "%s\n" "${patch_files[@]}" "${extra_files[@]}" | sort -u
  )
fi

if [[ ${#patch_files[@]} -eq 0 ]]; then
  echo "No files found in patch: ${PATCH_FILE}"
  exit 1
fi

git diff --binary "${BASE_COMMIT}".."${TIP_COMMIT}" -- "${patch_files[@]}" > "${PATCH_FILE}"

echo "Regenerated ${PATCH_FILE} using ${BASE_COMMIT}..${TIP_COMMIT}"
