#!/usr/bin/env bash
set -euo pipefail

LAST_FAILED_FILE=".last-failed-patch"

start_after=""
if [[ -f "${LAST_FAILED_FILE}" ]]; then
  last_failed_patch=$(cat "${LAST_FAILED_FILE}")
  echo "Detected previous conflict on: ${last_failed_patch}"
  echo "Regenerating that patch from the working tree."
  
  mapfile -t patch_files < <(
    ./list-patch-files.sh "${last_failed_patch}"
  )

  if [[ ${#patch_files[@]} -eq 0 ]]; then
    echo "No files found in patch: ${last_failed_patch}"
    exit 1
  fi

  git diff --binary -- "${patch_files[@]}" > "${last_failed_patch}"
  start_after="${last_failed_patch}"
  echo "Resuming after: ${start_after}"
  rm -f "${LAST_FAILED_FILE}"
fi

skip=true
for patch in ./*.patch; do
  if [[ -z "${start_after}" ]]; then
    skip=false
  elif [[ "${patch}" == "${start_after}" ]]; then
    skip=false
    continue
  fi
  if [[ "${skip}" == true ]]; then
    continue
  fi

  echo "Applying ${patch}"
  if ! git apply --3way "${patch}"; then
    echo "Patch failed: ${patch}"
    echo "Resolve conflicts in the working tree."
    echo "After resolving, rerun this script to proceed with remaining patches."
    echo "${patch}" > "${LAST_FAILED_FILE}"
    exit 1
  fi
done

echo "All patches applied."
