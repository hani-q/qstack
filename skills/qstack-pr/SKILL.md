---
name: qstack-pr
description: >
  Get a finished branch ready for a human reviewer and then, only on the
  user's word, open the pull request. Checks the branch is shippable, reads
  the repository's own landing rules, and writes a handoff the reviewer reads
  before the diff: reading order, a change map in pseudocode, a diagram only
  where flow changed, test evidence taken from git history and a real run, and
  plan links when the work had a plan. Nothing in it is claimed; every line
  comes from the diff, the log, or a command run in this session. Use as
  /qstack-pr when the code is done and the next step is a pull request.
disable-model-invocation: true
license: MIT
---

# /qstack-pr

An agent writes a forty-file change in ten minutes and a person then spends an
hour reading raw diffs to work out what happened and whether to trust it. This
skill spends the agent's time instead of the reviewer's: it writes the
explanation a careful author would have written, from evidence, and then asks
whether to open the pull request.

Two rules govern everything below.

- **Nothing is claimed.** Every sentence in the handoff traces to the diff, the
  git log, a file read in full, or a command run in this session. A test that
  was not run is not "passing". A commit order that was not read is not
  "test-first". A section with no evidence says so or is left out.
- **Opening a pull request is publishing.** It happens once, at the end, after
  the user has seen the exact title and body and answered the question. It
  never happens on the way.

## 1. Resolve the scope

Take the scope the way `/qstack-review` does. A named pull request, otherwise
this branch against the merge base with its base branch, otherwise the working
tree. Use the remote copy of the base branch when one exists, fetched first; a
local `main` can sit behind the branch's own history and give a merge base
that is wrong. Name the base branch and the head commit before reading
anything and put both in the handoff. Ask when two bases are equally
plausible.

When the branch already has an open pull request, the job is to rewrite its
body, not to open a second one. Say so in the final question.

## 2. Check the branch is shippable

Stop and report, instead of writing a handoff over a broken branch, when any
of these hold:

- No commits above the base. There is nothing a reviewer could see, so say
  that rather than describing work that has not been committed.
- Uncommitted or untracked files inside the scope. A handoff describes
  commits; work that is not committed is not part of what a reviewer will see.
  Name the files, so the author can tell a forgotten `git add` from work that
  is genuinely unfinished.
- A QStack plan folder for this work with cards still `claimed` or
  `in_progress`, or a `review` epic gate card that has not closed. The loop is
  not finished.
- The repository's own landing rules are unmet. Read `AGENTS.md`,
  `CLAUDE.md`, `CONTRIBUTING.md`, and any pull request template under
  `.github/` for what a branch must carry before it lands: a changelog entry,
  a version bump, a generated file kept in sync, a check script that must
  pass. Run the ones that can be run. Name each unmet rule and the line it came
  from.

Report what is unmet and stop. Do not fix it. The fix may be one line or may
be the reason the branch is not ready, and that is the author's call.

## 3. Gather the evidence

Read every changed file in full, plus the code around each change that the
change depends on. Then collect, in this order:

1. **The log.** `git log` over the scope, with the files each commit touched.
   This is where commit order, test-first evidence, and the story of the
   branch come from.
2. **Tests in the diff.** Every test file added or changed, and what each one
   asserts. Read the assertion, not the test name.
3. **A real run.** Run the repository's test command, or the narrowest command
   that exercises the changed tests, and keep the output. When nothing can be
   run here, say so; do not describe a run that did not happen.
4. **The plan**, when one exists. The clause numbers the change satisfies,
   `execution.md`, `outcome.md`, and the adherence score if
   `/qstack-plan-adherence-review` has run. Do not run it; report whether it
   ran.
5. **Flow changes.** Where the change alters a sequence across a boundary, an
   ownership relation, or a state machine. These are the only candidates for
   a diagram.

## 4. Write the handoff

The body a reviewer reads before the diff. Sections in this order, each
present only when the evidence supports it:

1. **Summary.** Two or three sentences: what the change does and why. From the
   conversation, the plan, or the commit messages, and say which.
2. **Read in this order.** The files a reviewer should open first and one
   line each on why. The entry point of the change comes first; renames,
   generated files, and lockfiles come last or are named as skippable.
3. **What changed.** One entry per meaningful path: what it did before and
   what it does after, in plain steps. Pseudocode is welcome when it is shorter
   than prose. This is not a paraphrase of the diff; a reviewer who reads it
   should know what to expect before they see the hunks.
4. **Flow.** A Mermaid diagram, only where step 3.5 found a real change in
   sequence, ownership, or state. A rename, a config change, and a new helper
   do not earn one. One diagram at most unless two boundaries changed
   independently.
5. **Tests.** What the tests assert, the commit each landed in and whether
   that commit came before, with, or after the implementation it covers, and
   the run: the command, the counts, and the outcome. With no tests in the
   diff, write "No tests in this change" rather than dropping the section.
   With tests but no run, write which command was not run and why.
6. **Plan.** When there is a plan: the clauses satisfied by `§` number, a link
   to `plan.html`, and the adherence score or the fact that no review ran.
   Absent when there is no plan.
7. **Landing rules.** Each rule from step 2 and how the branch meets it, in
   one line each.
8. **Scope line.** Base branch, head commit, and any file read only in part,
   at the bottom.

Write in the repository's voice when a pull request template or earlier pull
requests show one. Write plainly otherwise. No section headers that restate
their own line, no praise of the change, no severity theatre.

## 5. Ask, then act

Show the title and the whole body in the response, then ask one question
through the host's structured question tool, in plain text when the host has
none. Ask it in the shape the loops use:

> Open the pull request with this title and body?
>
> For a product manager: the description is written and checked; this step
> publishes it where the team can see it.
>
> ELI10: the letter is written. Do you want it posted, or kept in a drawer for
> now?
>
> - Open it (recommended when the branch passed every check above): run the
>   host's pull request command with this title and body against the base
>   branch named in the scope line.
> - Save the body only: write it to a file the user names, or
>   `pr-body.md` beside the plan when there is one, and open nothing.
> - Change it first: take the edit and show the body again.

Title in Conventional Commit form when the repository uses it, otherwise in
the form the repository's history shows. Recommend "Open it" only when step 2
found nothing unmet; otherwise recommend "Save the body only" and say why.

On "Open it": create the pull request, then register it with the host when the
host has a tool for that, and report the URL. When the branch already had a
pull request, update its body instead of creating one. On any other answer,
do that and stop. Never push, rebase, merge, or enable auto-merge; those are
separate decisions.

## Boundaries

This skill reads, runs tests, writes one body, and at most creates or updates
one pull request on the user's answer. It edits no source file, commits
nothing, and fixes nothing it finds unmet. It writes no board event; inside an
active QStack execution the durable record stays that plan's `execution.md`.

Inspired by the question Matt Pocock asked on 6 September 2026 about making
AI-authored pull requests easier to review, and by Dex Horthy's `/show-me`.
