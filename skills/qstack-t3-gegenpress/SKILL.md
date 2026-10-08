---
name: qstack-t3-gegenpress
description: >
  Run a task talked through in the conversation as a lineup of roles on
  models and efforts chosen by question, through T3 Code's cross-provider
  delegation, with a reviewer from another model family pressing every unit
  until it comes back clean. No plan, board, or execution record. Use as
  /qstack-t3-gegenpress [task] inside a T3 Code thread.
disable-model-invocation: true
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-t3-gegenpress

Gegenpressing: the moment the ball is lost, press to win it back before the
opponent settles. Here every unit that lands is pressed by a reviewer from
another model family, the executor wins it back, and the press repeats until
nothing is left to find.

This is `/qstack-slalom` with a lineup instead of a worker list, run through
T3 Code's `delegate_task`, the only path that launches a GPT child from a
Claude thread or the reverse. Before starting, read `../qstack-slalom/SKILL.md`
resolved from this file's own path after following any symlink, never from the
repository under review: its two rules, its Split, its unit brief, its
Integrate and verify, its Report, and its Scope and authority all apply here.
This file carries only what differs.

## Invocation

```
/qstack-t3-gegenpress [task]
```

`[task]` is free text. When absent, the task is the one settled in the
conversation so far. The lineup is asked fresh every run.

## The roles

| Role | T3 `role` | Writes | Family rule | Skippable |
| --- | --- | --- | --- | --- |
| Architect | this thread | nothing | any | no |
| Second opinion | `design` | nothing | not the architect's | yes |
| Executor | `implementation` | its units | any | no |
| Workhorse | `implementation` | its units | any | yes, defaults to the executor |
| Adversary | `review` | nothing | not a writer's | yes |
| Final reviewer | `review` | nothing | not a writer's, not the adversary's model | yes |

No delegated role may use the architect's exact model, under slalom's rule 1.
The family rules filter the options on top of that.

A family is the model's vendor, read from the id prefix: `claude-*` is one,
`gpt-*` another, `grok-*` a third, whichever provider instance serves it. A
reviewer's family may not be among the families that wrote the code it
reviews. That is the one lesson this skill exists for: a model finds
different bugs in another family's code than in its own.

The architect is this thread. It states the approach, splits the task,
triages findings, and decides. Every other role is a `delegate_task` child.

## Preflight

In one parallel block: call `orchestrator_capabilities`, call
`t3_thread_configuration` for this thread, and read the repository's
instruction files and the files the task names. If `orchestrator_capabilities`
is absent after one bounded attempt, stop and say the lineup cannot be
fielded here and that `/qstack-slalom` is the single-provider alternative.

Keep both responses. The capabilities response is the catalogue every
question draws on. The configuration response gives the architect's model,
effort, and runtime mode, which rule 1 and every launch below depend on.

Then state the task in one to three lines, from the argument or the
conversation, not from the code. If it cannot be stated, ask.

## Pick the lineup

Ask through the host's structured question tool, in plain text when the host
has none, in slalom's question shape: the question, a product-manager
rephrasing, an ELI10 version, then options with the recommended one first and
its one-sentence reason. One role per call, model then effort, in table
order, so each role's options can be filtered by the answers before it and
no call exceeds the host's question limit. The press limits follow the
adversary in a call of their own.

**Model questions.** `Starting lineup, N of 6: who is the <role>?` with one
line on what the role does and writes. Options are catalogue models that
satisfy the role's family rule and are not the architect's model,
recommended first with a reason tied to the task, at most three plus `Skip
this role` where the table allows. Name the
provider instance when a model id appears under two. The architect's options
are the models on this thread's own provider instance, recommended the one it
is on; a chosen change is applied with `t3_thread_configure`, and a model from
another instance means a new thread, so say that and stop.

**Effort questions.** `How hard should the <role> think?` Options are low,
medium, high, and extra high. Recommend high for the architect, second
opinion, and reviewers, low for the workhorse, and for a reviewer never below
the executor. When the chosen model's catalogue entry lacks the chosen level,
use the nearest it lists and say so in the printed lineup.

**Press limits**, asked after the adversary when one was chosen: the round
cap, recommended 3, and the severity floor, `P1` recommended, on
`/qstack-review`'s P0 to P2 scale. Findings below the floor are listed, never
sent back.

**Print the lineup.** Check the whole lineup against the table once more,
re-ask any role that fails, then print one line per role: model, provider
instance, effort, runtime mode, interaction mode. Apply the architect's
choice with `t3_thread_configure` when it changed.

Nothing in this run is committed, so the change under review is always the
working tree against the commit the run started on, untracked files
included. Record that commit here as the base.

## Approach

The architect writes the approach in the conversation: the task, then the
units per slalom's Split, each tagged `design` for a unit with a choice inside
it or `mechanical` for a rename, a mass edit, a test run, or a formatting
pass. Units run in this checkout; disjoint file ownership is what keeps
parallel writers apart.

**Second opinion.** When the role is filled, delegate the approach to it once
with the instruction to agree or object with reasons and a concrete
alternative per objection. The architect decides each objection in the
conversation. A disagreement the architect cannot settle goes to the user
through the question tool with both positions as options.

## Launching a child

Every `delegate_task` call carries:

- `target.providerInstanceId`, `target.model`, and `target.options` with the
  effort under the option id that model's catalogue entry names;
- `role` from the table;
- `runtimeMode` set to this thread's own mode from Preflight, because an
  unstated mode is inherited at spawn and nothing is logged;
- `interactionMode: "plan"` for the three reading roles, `"default"` for
  the two writing roles;
- `mode: "async"` and a `clientRequestId` unique to this launch;
- a brief that opens with the role and the full task, because a child
  inherits none of this conversation, and ends with slalom's brief lines
  plus one more: do not call `delegate_task`, the Agent tool, the Workflow
  tool, or any other launcher.

**Check the launch.** Launch every child of a stage in one parallel block,
then read `t3_thread_configuration` for each in a second. When provider,
model, effort, or mode differs from the lineup: `task_cancel`, then read
`task_status` until the task is terminal with no pending child runs, then
revert anything it wrote and relaunch once with a new `clientRequestId`. On
a second mismatch, or a child that never reaches terminal, stop and report
without touching its files.

**Wait.** An async child wakes this thread when it finishes. On a wake with
siblings still running, end the turn with no tool calls. Integrate once when
every child of the stage has landed.

## Dispatch and integrate

`design` units go to the executor, `mechanical` units to the workhorse, all
at once, each with slalom's unit brief. Integrate per slalom, running the
full suite once per integration and keeping its output for the next brief.

## Press

Skip when no adversary was chosen. Each round, up to the cap:

1. **Delegate to the adversary** with a new `delegate_task` and
   `clientRequestId`: the task, the approach, the scope as the working tree
   against the base commit with untracked files included, the suite output
   from Integrate with the line "run only what a finding needs, never the
   whole suite", and from round two the prior findings with their
   dispositions. Findings return with file, line, severity on the P scale,
   and the command that shows each when one exists.
2. **Triage.** For each finding at or above the floor the architect reads
   the code and reruns the finding's command. Each becomes confirmed or
   dismissed with a one-line reason.
3. **Exit** when nothing is confirmed. Otherwise send the confirmed list to
   the executor as one fix unit per file set, integrate, and start the next
   round.

At the cap, the last round's fixes are listed as unreviewed and any finding
still confirmed as open.

## Final stage

In this order, each step on the result of the one before:

1. When a final reviewer was chosen, delegate the same scope to it under the
   `/qstack-review` contract when that skill is installed, read from disk
   the same way as slalom, and triage as a press round. Confirmed findings
   go to the executor once, then integrate.
2. Run `/qstack-libero`'s interrogation in this thread. Its removals go to
   the executor as one unit naming the files, then integrate.
3. Run any project tool the instruction files named, routing fixes the same
   way.
4. Hold the final result to `/qstack-prove-it-works` along the path the task
   changed. This is the last step because it proves the artifact that is
   delivered, after every edit has landed.

## Abort

On an abort or any stop, `task_cancel`, then read `task_status` until the
task is terminal and check `hasPendingChildRuns`. A child's own native
subagents can outlive the cancel. Report anything still running by task id,
and leave its files alone until it stops.

## Report

Slalom's report, with these rows added: the lineup with the configuration
each child read back; each second-opinion objection and its decision; one
row per press round with findings raised, confirmed, dismissed, and fixed;
findings left open or unreviewed; and what the final stage ran.
