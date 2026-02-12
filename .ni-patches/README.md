# NI patch workflow

Before you begin, ensure you have the following:

- A clean working tree in the Grafana repository.
- The upstream base commit or tag you want to apply these patches onto.

## Patch set overview

This folder contains the current patch set:

- 01-NI-setup.patch
- 02-NI-iframe-customization.patch
- 03-NI-transforms.patch
- 04-NI-plugins.patch

These patches reproduce the state of the branch at the time they were generated. They are built from diffs with binary support, so they include image and SVG changes.

## Apply the patches

Apply the patches with the helper script:

```sh
cd .ni-patches
./apply-upgrade.sh
```

The script uses `git apply --3way` and stops on conflicts. If a patch fails, resolve the conflicts and rerun the script to continue.

## Handle conflicts

Patches can fail to apply when upstream changes overlap with the patch hunks.

- Resolve the conflicts.
- Rerun the script to continue with the remaining patches.

The script also regenerates the last failed patch from the so your updated conflict resolution is captured in the patch file.

## Add new logic

Make changes, then regenerate the patches. Avoid editing patch files by hand. Use `.ni-patches/regenerate-patch.sh` to regenerate an existing patch from a base commit and a tip commit.

Avoid listing the same file in multiple patches. When you touch a file that belongs to a patch, regenerate that patch and remove the file from any other patch lists.

## Verify the result

For validation steps, refer to [Validating a Grafana upgrade](https://dev.azure.com/ni/DevCentral/_git/Skyline?path=/Grafana/README.MD&_a=preview&anchor=validating-a-grafana-upgrade).
