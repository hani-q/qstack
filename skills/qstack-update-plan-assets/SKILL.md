---
name: qstack-update-plan-assets
description: >
  Refresh a repository's shared QStack plan template from the installed
  qstack-plan-to-html template without rewriting any plan or execution record.
  Use when plan board styles or scripts are stale, when
  qstack/compound_engineering/plans/.template/v1 differs from the installed
  skill, or automatically from /qstack-plan-to-html after it finds an older
  shared template. Requires qstack-plan-to-html, which owns the source.
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-update-plan-assets

Use the update workflow owned by `qstack-plan-to-html`, the package that also
owns the source template and deterministic update script.

Resolve this skill's directory through its real path. Then resolve the sibling
`qstack-plan-to-html/references/update-plan-assets.md`, read it completely, and
follow it. Do not assume either skill was installed under a fixed home
directory.

If that reference, its script, or its source template is unavailable, report
that the updater installation is incomplete and stop without editing the
target.
