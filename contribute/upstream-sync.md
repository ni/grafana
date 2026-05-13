# Upstream sync process

This document describes how the NI fork of Grafana stays in sync with upstream [grafana/grafana](https://github.com/grafana/grafana) releases.

## Overview

The NI fork does not track upstream `main` on a commit-by-commit basis. Instead, the fork moves forward by rebasing NI-specific commits onto each new upstream stable release tag. This approach:

- Keeps NI commits clearly separated from upstream commits.
- Eliminates the need for manual cherry-picking or reset workflows.
- Resolves conflicts incrementally as releases come out, rather than in one large batch.
- Produces a clean `ni-<version>` tag for each upstream release, ready to build and deploy from.

## Branches and tags

| Name | Description |
|---|---|
| `main` | The current active release. Points to the tip of the last promoted `ni-<version>` tag. |
| `ni-<version>` | Git tag pointing to the NI-rebased commit for that upstream release. This is the primary artifact — no long-lived branch is created on success. Example: `ni-v12.4.0`. |
| `conflict/ni-<version>` | Temporary branch created only when a rebase conflict occurs. Used to open a conflict PR so the diff is visible on GitHub. Deleted after resolution. Example: `conflict/ni-v12.4.0`. |

## How the CI job works

The workflow at [.github/workflows/sync-upstream-to-main.yml](../.github/workflows/sync-upstream-to-main.yml) runs daily at 06:00 UTC.

For each new upstream stable release tag (format `vX.Y.Z`) that does not yet have a corresponding `ni-<version>` tag, the job:

1. Identifies the NI base — the parent of the first commit on `main` whose tree contains `CONTRIBUTING_NI.md` (a file unique to the NI fork). That parent is the last pure-upstream commit before NI changes begin.
2. Rebases all NI-specific commits (everything from the NI base to `main` tip) onto the new upstream tag. On success, no persistent branch is created.
3. Restores the NI fork's `.github/workflows/` directory on top, since upstream may overwrite fork-specific workflow files.
4. Creates the `ni-<version>` git tag and pushes it. The tag is the artifact.

`git rerere` is enabled during every rebase. Conflict resolutions are stored in the `rerere-cache` orphan branch and restored at the start of each CI run. When the same conflict appears again (e.g. same NI commit rebased onto a newer patch tag), it is resolved automatically. New resolutions recorded during manual conflict resolution are saved back to `rerere-cache` automatically when the resolved branch is pushed.

## Promoting `main` to a new release

When the team is ready to move `main` forward to a new upstream release:

```sh
git fetch origin --tags
git checkout main
git reset --hard ni-v12.4.0
git push --force
```

This is a force push. Notify the team so they can rebase any open feature branches onto the new `main`.

## Releasing from an NI tag

To build or release from a specific NI version:

```sh
git fetch origin --tags
git checkout ni-v12.4.0
```

The `ni-<version>` tag always points to the exact rebased commit, including the workflow restore commit.

## Triggering for a specific tag manually

Go to **Actions** → **Sync upstream tags to NI branches** → **Run workflow** and enter the upstream tag (for example `v12.4.0`) in the input field. The job will run the rebase and, if successful, create the `ni-v12.4.0` tag.

## When a conflict occurs

If the rebase fails on a tag, the CI job:

1. Pushes a `conflict/ni-<version>` branch pointing at the upstream tag, then lays the partial rebase work on top via a dedicated script — this makes the diff visible on GitHub.
2. Opens a PR from `conflict/ni-<version>` into `main` with the title `conflict: rebase onto <version> needs manual resolution`.
3. Fails the workflow run, triggering a GitHub notification.

### What you see

- A failing CI run in **Actions**.
- An open PR titled `conflict: rebase onto <version> needs manual resolution` from a `conflict/ni-<version>` branch.
- The PR diff shows the full upstream tag content vs `main` — use this to understand what changed upstream.

### How to resolve

The PR body contains the exact commands. In summary:

```sh
git fetch origin && git fetch upstream --tags

git checkout conflict/ni-<version>

# For each conflicted file: edit, then:
git add <file> && git rebase --continue

# Repeat until: Successfully rebased

git push origin conflict/ni-<version> --force
```

Once pushed, `complete-upstream-sync.yml` runs automatically: it verifies the branch is rebased onto the upstream tag, creates the `ni-<version>` tag, saves any new rerere resolutions to `rerere-cache`, and closes the PR.

## The NI base commit

The NI base is determined dynamically by scanning the history of `main` for the first commit whose tree contains `CONTRIBUTING_NI.md` (a file unique to the NI fork), then taking its parent. That parent is the last pure-upstream commit before NI changes begin.

This works correctly across promotions — after `main` is force-updated to a new rebased state, the detection automatically finds the new fork boundary without any configuration change.

## Required permissions

The workflow uses the standard `GITHUB_TOKEN` — no additional secrets are required. The workflow-level `permissions` block grants `contents: write` and `pull-requests: write`, which covers all push and PR operations.

The only operations performed are pushing `conflict/ni-*` branches, `rerere-cache`, and `ni-*` tags — none of which require bypassing branch protection on `main`.
