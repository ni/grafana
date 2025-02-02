# Contributing to NI-maintained fork of Grafana

### Preface

Any changes made to this fork should be considered for upstreaming first. If the change in question can be made in a generic way, we should play our part as good open-source citizens and open a PR to the upstream repository before contributing directly to this fork.

This also means that every contribution to this fork will be highly scrutinized, as we are making a conscious effort to stay as close to the mainline as possible. Any new panels or related functionality should be implemented as plugins to avoid changing the first-class panels and further deviating from the mainline.

### Overview

The default branch of this repository is _main_, which contains both NI-specific changes and changes we intend to upstream. This branch is always based on a stable tagged commit from Grafana's upstream.

Changes that will be upstreamed will also live in separate topic branches prefixed with _ni/pub/_. These branches should be based on the same tag that _main_ is based on, rather than on _main_ itself. This approach has several benefits:

- PRs can be opened on [grafana/grafana](https://github.com/grafana/grafana) using these branches instead of having to cherry pick commits from _main_.
- Prevents us from accidentally making changes that will be upstreamed dependent on private changes.
- Makes it easier to remove changes that were accepted upstream from our mainline.

### How do I...

#### Make a private change to ni/grafana?

To make changes to the fork that are NI-specific, simply create a topic branch based on _main_, make your changes, and then open a pull request merging your topic branch back into _main_. After the changes are reviewed and accepted, the branch should be **squash merged** and then deleted.

#### Make a change that could be accepted upstream?

In an ideal world, we could make changes to [grafana/grafana](https://github.com/grafana/grafana) directly and then integrate them into our fork after they release a new stable version. However, this could take weeks or months. To keep our development cycles short, these changes need to also be merged into our fork in the meantime.

Create a branch prefixed with ni/pub based on the same tag that ni/grafana's main is based on. Example:

```
# Finds the most recent tag reachable from main
git describe --tags --abbrev=0 main
git checkout -b ni/pub/cool-new-feature <latest-tag>
```

Then make your changes on this branch and open a pull request merging it into _main_. If your changes on an ni/pub/_ branch result in merge conflicts with another ni/pub/_ branch, rebase your branch on the conflicting branch and force push. After the changes are reviewed and accepted, the branch should be **squash merged** and **not** deleted.

#### Integrate a new release of Grafana into the fork?

First, pull the latest tags from upstream:

```
git fetch upstream --tags
git push origin --tags
```

Backup the current main branch, so we can revert if necessary:

```
git checkout main && git pull
git checkout -b main-archive-9.0.5 # Version of last rebase
git push -u origin main-archive-9.0.5
```

Back on main, reset the branch to the desired Grafana release tag:

```
git checkout main
git reset --hard v9.0.5
```

Cherry-pick all of our NI-specific commits from the archive branch. The first commit should have the message:

_Add "iframeNavigate" postMessage calls_.

```
# git cherry-pick X^..Y where X is the first commit and Y is the latest on the archive branch you created above
git cherry-pick 095cea2^..d919979
```

Carefully resolve any merge conflicts. Run `git cherry-pick --skip` for any changes that were accepted upstream since the last version bump.
Once the cherry pick is completed, force push main (`git push -f`). If you are not an admin, ask one to do this step for you.
