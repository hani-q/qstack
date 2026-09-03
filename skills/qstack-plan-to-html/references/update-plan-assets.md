# Update shared plan assets

Bring a repository's shared plan presentation up to the installed QStack
template. Existing plans load these files by reference, so their boards can gain
new controls and fixes without changing `plan.html`, `board-events.js`,
`execution.md`, or `outcome.md`.

## Boundary

Write only beneath `qstack/compound_engineering/plans/.template/v1/`. Copy
files from this skill's `template/v1/`, leave target-only files in place, and
never commit.

A shared asset change affects every plan that loads it. Name those plans in the
report and describe the presentation change. Plan content, decisions, clause
numbers, board events, and execution history stay untouched.

## Find the source and target

Resolve this reference through its real path. Its owning skill contains both
the source template and update script, so the workflow works when
`qstack-plan-to-html` is the only installed QStack skill.

```bash
REFERENCE=<path-of-this-reference>
PLAN_SKILL_DIR=$(cd "$(dirname "$REFERENCE")/.." && pwd -P)
UPDATE="$PLAN_SKILL_DIR/scripts/update-plan-assets"
REPO_ROOT=$(git rev-parse --show-toplevel)
"$UPDATE" status --repo "$REPO_ROOT"
```

If the script or source template is unavailable, report that the updater
installation is incomplete and stop without editing the target.

## Establish which copy is older

`different` means only that two files differ. It does not say which one should
win. Inspect every differing text file with a no-index diff before applying it.
For a binary file, compare its identity and provenance rather than its bytes in
prose.

Treat the repository copy as stale without another question only when the
difference has a clear direction. Clear evidence includes either of these:

- the target matches an earlier revision of the same QStack template; or
- the source adds or fixes named template behavior while removing no
  target-only behavior.

A direct user request to update from the installed QStack template authorizes
the same replacement after you inspect the diff. Missing source files are safe
to add. Target-only files are outside this operation and stay in place.

If a diff contains target-only behavior, mixes changes in both directions, or
has no provable direction, stop and ask which copy should win. State the files
and the concrete behavior at stake. Do not call a repo-owned customization
"stale" merely because it differs.

When `/qstack-plan-to-html` starts this workflow, the render request already
authorizes a clearly older shared template to be refreshed. Apply it and return
to rendering. Pause only for an ambiguous difference.

## Apply the proven files

Pass only the files established as missing or stale. Paths are relative to
`template/v1/`:

```bash
"$UPDATE" apply --repo "$REPO_ROOT" board.js plan.css README.md
```

Use `--all` only after every reported difference has passed the same direction
check. The script copies atomically and skips files that are already current,
so rerunning the operation converges.

## Verify and report

Run `status` again. Every applied file must disappear from its output. Inspect
the working-tree diff under `.template/v1/` and confirm no plan directory or
event stream changed.

Report:

- files added or updated;
- the behavior those changes add or fix;
- which existing plans load the shared assets; and
- any difference left unresolved.

Do not claim that plan content was updated. This operation updates its shared
presentation only.
