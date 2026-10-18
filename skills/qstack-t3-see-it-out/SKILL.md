---
name: qstack-t3-see-it-out
description: >
  Take the finished work in a T3 Code thread all the way to merged: simplify
  it, open its pull requests, have another model review each one under the
  /qstack-review contract round after round while this thread fixes what it
  confirms, and merge each pull request once a round scores 5/5 at its
  current head. Defaults to gpt-6.1-sol as the reviewer, merges unless told
  not to, and stops to ask after five rounds. Use as /qstack-t3-see-it-out
  [PR...] inside a T3 Code thread.
disable-model-invocation: true
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-t3-see-it-out

Seeing it out: the team is ahead and closes the game without giving anything
away. Here the work is written and the job is to finish it, with no shortcut
past the review.

This is the run the user otherwise types as four prompts: `/simplify`, "open
PRs", `/qstack-review using gpt-6.1-sol and make it 5/5`, "and merge". This
thread writes every fix. The reviewer is a `delegate_task` child that reads
and reports, and nothing else.

## Invocation

```
/qstack-t3-see-it-out [PR...] [--reviewer sol|astra|both|<model-id>] [--no-merge] [--skip-simplify]
```

- `PR...`: pull request numbers or URLs. When absent, the scope is resolved
  below.
- `--reviewer`: `sol` is `gpt-6.1-sol` and is the default. `astra` is
  `gpt-6-astra`. `both` runs one of each per round, and a round passes only
  when both score 5/5. Any other value is a model id from the catalogue.
- `--no-merge`: stop each pull request at 5/5 and leave the merge to the
  user.
- `--skip-simplify`: open pull requests without the simplify pass.

Words after the flags that restate them, such as "and I will merge", count as
the flag.

## Preflight

In one parallel block: call `orchestrator_capabilities`, call
`t3_thread_configuration` for this thread, call `list_thread_pull_requests`,
run `gh auth status`, and read the instruction files of every repository in
scope. If `orchestrator_capabilities` is absent after one bounded attempt,
stop: this skill needs T3 Code's `delegate_task`.

Resolve each reviewer model in the catalogue. It must sit on a provider
instance with `canRunChildTask` true, and `canRunCrossProviderChildTask` true
when it is not this thread's instance. Take its select-type reasoning option
and use `high`, or the nearest level the entry lists. When the model is
missing, or is this thread's own model, ask through the question tool which
catalogue model reviews instead, recommending one from a different vendor
family. A model reviewing its own code misses what another family finds.

Read `../qstack-review/SKILL.md`, resolved from this file's own path after
following any symlink, and keep its absolute path for the review brief. When
it is missing, stop: the 5/5 bar is that skill's score.

Pick a run id once, the current UTC time as `YYYYMMDDHHMMSS`. It keeps this
run's request ids and snapshot paths apart from any earlier run's.

## Resolve the scope

In this order:

1. The pull requests named in the arguments.
2. Otherwise every branch this thread committed to or was asked to finish,
   in every repository it touched, together with the open pull requests from
   `list_thread_pull_requests`. A Git submodule is its own repository with
   its own branch.
3. Otherwise the current branch of this checkout.

Ask when two readings are equally plausible. Name each repository, branch,
base, and head commit before starting.

Order the scope so each item lands after what it depends on: a stacked
branch after the branch it is based on, and a repository that pins another
repository's commit, such as a submodule gitlink, after the repository it
pins.

## 1. Simplify

For each branch without an open pull request, unless `--skip-simplify` was
passed or simplify already ran in this thread with no commit since:

- Run the `simplify` skill over the branch's changes against its base, with
  the Skill tool. When the host has no such skill, say so and continue.
- Run the repository's tests, then commit the fixes on their own with a
  message such as `refactor: simplify`.

Uncommitted work that belongs to the task is committed first, with a message
saying what it is. Work that does not belong to the task stays uncommitted:
name it and leave it alone.

## 2. Open the pull requests

For each branch without an open pull request, follow `/qstack-pr` steps 1 to
4, read from `../qstack-pr/SKILL.md` the same way as `/qstack-review`. Two
differences apply:

- A landing rule that the instruction files settle with a named command,
  such as a version claim through a script or a generated file through its
  generator, is met by running that command and committing the result. Any
  other unmet rule stops this branch and is reported.
- Invoking this skill is the user's word to publish. Push the branch and run
  `gh pr create` without the final question. A stacked branch takes its
  parent's branch as base.

Call `link_pull_request` with each URL as soon as it exists.

## 3. Review rounds

Run every pull request's rounds at the same time. Rounds for one pull
request are strictly in sequence.

**Pin the snapshot.** A reviewer never reads the checkout this thread edits,
because a fix for one pull request would change files under another's
review. Before each round, record the pull request's base branch, its head
commit, and the merge base `git merge-base origin/<base> <head>` after a
fetch. Then create a detached worktree at the head:
`git -C <repo> worktree add --detach /tmp/see-it-out-<run-id>/<repo>-<pr>-r<round> <head>`.
Remove it with `git worktree remove --force` once the round is triaged.

**Launch a round** with a new `delegate_task` per reviewer:

- `target`: the reviewer's provider instance, model, and effort option.
- `role: "review"`, `interactionMode: "plan"`, `mode: "async"`.
- No `runtimeMode`, so T3 falls back to a mode the reviewer's provider
  supports.
- `clientRequestId`: `see-it-out-<run-id>-<repo>-<pr>-r<round>-<reviewer>`,
  reused only to retry that same launch.
- A brief with:
  - the snapshot path as the only checkout to read and run commands in, the
    pull request URL, the branch, the base branch, the merge base, and the
    exact head commit;
  - the instruction to follow the `/qstack-review` file at its absolute path
    exactly, with the scope `git diff <merge-base>..<head>`, reading every
    changed file in full;
  - the latest test run: the command, the counts, and any test that could
    not run here and why;
  - from round 2 on, every earlier finding with its disposition and, for a
    dismissed one, the evidence;
  - the closing lines: read-only; do not edit, commit, push, or comment
    anywhere; do not call `delegate_task`, the Agent tool, the Workflow
    tool, or any other launcher; return the report as the final message.

End the turn after launching. A finished child wakes this thread. On a wake
with other children still running, handle the one that landed and end the
turn again.

**Triage the report.** For each P0 and P1, read the code, and rerun the
finding's command when it has one. Mark each one confirmed or dismissed, with
a one-line reason. List P2s and leave them, unless the fix is one line in a
file already being edited.

**Pass or fix.**

- **Pass**: the round scored 5/5 from every reviewer. Record the pass as its
  base branch, merge base, and head, and go to Merge.
- **Fix**: fix every confirmed finding, run the tests, commit with
  `fix: review round <n> findings`, push, and launch the next round on the
  new head.
- **Dismissed only**: the round scored below 5/5 and every P0 and P1 was
  dismissed. Launch the next round on the same head with the dismissal
  evidence, with nothing to commit or push.
- **Disagree**: a reviewer raises again a finding this thread dismissed with
  evidence. Ask the user through the question tool, with both positions as
  options.

After every round, post one line per pull request: the round, the score, and
the findings confirmed, dismissed, and fixed.

**Cap.** After round 5 without a pass, ask through the question tool with
the open findings: five more rounds (recommended when the findings are
shrinking), merge as it is, or stop here.

**Base moved.** When the base branch moves and the pull request conflicts,
merge the base into the branch with a merge commit, never a rebase. Run the
tests and push. The next round reviews the new head.

**A pass covers one diff.** A pass holds only while the pull request's base
branch, merge base, and head all still match what it recorded. Any change,
including a retarget with no conflict, ends it, and the next round reviews
the new scope.

## 4. Merge

Skip with `--no-merge`, or when the user said they will merge.

Merge a pull request only when all of these hold:

- Its pass still holds. Check that `gh pr view <pr> --json
  headRefOid,baseRefName` and a fresh `git merge-base origin/<base> <head>`
  match the recorded pass.
- Every required check is green. Wait on `gh pr checks <pr> --required
  --watch`, or on every check when the repository requires none, and treat
  a failure as a confirmed finding for one more fix round.
- It is mergeable, and every pull request it depends on shows state
  `MERGED`.

Check whether the base branch uses a merge queue: `gh api
repos/<owner>/<repo>/rules/branches/<base> --jq '.[].type'` lists
`merge_queue`, or `gh pr merge` refuses the merge because the branch
requires one.

- Without a queue, merge with `gh pr merge <pr> --match-head-commit <sha>
  --delete-branch` and the method the repository allows, `--merge` when it
  allows several.
- With a queue, run `gh pr merge <pr> --match-head-commit <sha>` with no
  method flag and no `--delete-branch`, which `gh` rejects for a queue. Then
  read `gh pr view <pr> --json state` once a minute for up to an hour until
  it is `MERGED`, and delete the branch with `git push origin --delete
  <branch>`. A pull request that leaves the queue unmerged gets one fix
  round for the reason, and one still queued after the hour is reported.

Confirm the merge commit with `gh pr view` before releasing anything that
depends on it.

After a dependency merges:

- A stacked child is retargeted to the parent's base, which ends its pass.
  Handle a conflict as Base moved, then review the new scope.
- A pin, such as a submodule gitlink, moves to the dependency's merged commit
  on its main branch. That commit goes through a review round before the
  pinning pull request merges.

Never force-push, never merge with admin rights or past a failing required
check, and never commit to a base branch directly.

## Abort

When the user stops the run, or a step stops it, `task_cancel` every child
still running. Then read `task_status` up to five times, one minute apart,
until each is terminal with `hasPendingChildRuns` false. Report anything
still running by task id.

A merge this run handed to GitHub outlives the run, so keep a list of every
pull request it queued or set to auto-merge. For each one not yet `MERGED`:

- Run `gh pr merge <pr> --disable-auto`.
- Remove it from the queue with `gh api graphql -f query='mutation($id:
  ID!){dequeuePullRequest(input:{id:$id}){clientMutationId}}' -f id=<node
  id>`, the node id from `gh pr view <pr> --json id`.
- Confirm with `gh api graphql` that `pullRequest.isInMergeQueue` is false
  and `autoMergeRequest` is null.

Report any pull request still queued, still set to merge, or merged in the
meantime.

## Report

Lead with the outcome: merged, waiting on the user, or stopped and why.
Then:

- One row per pull request: repository, number, rounds, final score, and
  merge commit or state.
- One row per round: findings raised, confirmed, dismissed, and fixed.
- P2s left open, findings left open at a cap, and checks that could not run
  here.
- What is left before the worktree can be pruned: unmerged pull requests,
  unpushed commits, uncommitted files. When nothing is left, say it can be
  pruned. Ask before deleting a worktree, a branch the run did not merge, or
  a build cache.

## Scope and authority

Invoking this skill authorizes, for the branches in scope: committing,
pushing without force, opening pull requests, and merging them under Merge
unless `--no-merge`. It does not authorize force-pushing, merging with admin
rights, posting review comments, committing to a base branch, or deleting
anything outside a merged pull request's own branch.
