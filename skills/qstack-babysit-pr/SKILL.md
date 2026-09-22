---
name: qstack-babysit-pr
description: Use when the user asks to monitor, watch, babysit, or shepherd an existing pull request through review and CI.
metadata:
  author: hani
  stack: qstack
---

# Babysit a PR

Keep one existing pull request current until its required checks and review bots
finish on the latest head commit. The user's original goal remains the scope.

## Start with the current PR

Resolve the PR from the request or current branch. Record its URL, base branch,
head commit, latest push time, required checks, and review state. Confirm the
local checkout matches its head before editing. If several PRs fit, ask which
one to watch.

## Watch and respond

Use an available PR event monitor; otherwise poll for new comments, reviews,
checks, and base-branch changes at a reasonable interval while this session is
active. After each push, update the head commit and event boundary. Process new
events after that push, and confirm earlier actionable threads were actually
addressed. A pending check or bot review is still pending, even if other checks
are green. Stay quiet when nothing has changed.

For each new finding, read the cited code and surrounding behavior before
editing. Fix a real defect within the PR's original goal and verify the fix.
Investigate failed checks far enough to distinguish a repository failure from
an infrastructure flake; rerun a flake when the host supports it. For an
incorrect or out-of-scope finding, reply with the concrete reason and resolve
the thread when appropriate. Identify an agent-authored reply as such when it
is posted through a person's account. Use the host's comment skill if one is
available. Add screenshots or video only when they clarify a specific finding
and an upload path is available.

Follow the repository's rules for committing and pushing fixes. Run relevant
checks before updating the PR, then watch the new head. Keep up with changes to
the base branch; rebase when needed and permitted by the repository workflow.
Get explicit authorization before a history rewrite or force push. If another
PR makes this one obsolete, stop and explain the overlap. Close it only when
the user has authorized closure.

## Finish

Stop when every required check and expected bot review is complete and green
on the latest head, with no actionable feedback left. If a required reviewer
or check cannot finish, report the blocker and current state instead of calling
the PR ready. Report the PR URL, head commit, checks, review state, and any
changes or replies made. Merge only when the user explicitly requested it.
Never claim to keep watching after the session ends unless a real persistent
monitor has been started.

Adapted from Theo Browne's "Babysit PR" skill shown in
["I made Claude smarter by writing it a letter"](https://www.youtube.com/watch?v=e1snsuY4lTI&t=607s).
