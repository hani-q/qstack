---
name: qstack-slalom
description: >
  Run a small task from the conversation as a fan-out of parallel subagents,
  with the expensive model reserved for orchestration and a cheaper named
  model doing the work. Takes the orchestrator model and the worker models as
  arguments, splits the task into independent units, dispatches one subagent
  per unit on a worker model, then integrates and verifies the result itself.
  No plan folder, no board, no execution record. Use as
  /qstack-slalom <orchestrator> <workers> [task] after talking a task through
  and deciding not to plan it.
disable-model-invocation: true
license: MIT
---

# /qstack-slalom

One player carries the ball through the whole defence while the rest of the
team stays behind the line. Here the expensive model carries the task: it
reads, splits, dispatches, integrates, and verifies. Cheaper models do the
running.

Use this for a chunk of work you talked through and do not want to plan. It
writes no plan, no board, and no execution record. For work that needs those,
use `/qstack-plan-to-html` and a loop.

## Invocation

```
/qstack-slalom <orchestrator> <workers> [task]
```

- `<orchestrator>` is the model this session must be running on, such as
  `fable-5.1` or `astra-6`.
- `<workers>` is one model or a comma-separated list, such as `opus-5` or
  `gpt-5.6-sol,opus-5`. Every subagent runs on one of these.
- `[task]` is free text. When absent, the task is the one settled in the
  conversation so far.

Examples:

```
/qstack-slalom fable-5.1 opus-5
/qstack-slalom astra-6 gpt-5.6-sol rename the config loader and update its callers
/qstack-slalom fable-5.1 opus-5,sonnet-5 add the retry helper we discussed
```

Both model arguments are required. With fewer than two, stop and show the
usage line.

## Two rules that never bend

1. **No subagent runs on the orchestrator model.** Pin every launch to a
   worker model explicitly. Never rely on inheritance, because an inherited
   model is the session model, which is the orchestrator.
2. **The orchestrator does not implement.** It may read any file and run any
   check. It edits only to integrate results, and only when a conflict or a
   one-line fix at the seam is cheaper than another dispatch. It never takes a
   unit for itself because the unit looked small.

## Preflight

Do all of this before launching anything.

1. **Confirm the session model is the orchestrator.** Read the model this
   session reports it is running as. The two spellings differ: a user types
   `fable-5.1`, a Claude Code session reports `claude-fable-5-1[1m]`. Lower
   both, strip spaces and punctuation, and treat them as the same model when
   one contains the other. Anything else is a mismatch: stop and say which
   model the session is on and how to switch, such as `/model` in Claude
   Code. Do not run the task on the wrong orchestrator, and do not swap the
   roles around to make the arguments fit.
2. **Resolve each worker model to an identifier the harness accepts.** In
   Claude Code the `Agent` tool takes `model` and the `Workflow` script's
   `agent()` takes `opts.model`; in Codex the subagent launcher takes a model
   in its own form. Map the user's spelling to that form with the same
   normalized containment match as step 1. A name that matches nothing, such
   as `opsu-5`, is not guessed at: ask, through the host's structured question
   tool when it has one and in plain text otherwise, with the models the
   harness accepts as the options and the closest spelling first. One
   question per unresolved name. If a worker model cannot be expressed in
   this harness, or the harness has no per-agent model setting at all, stop
   and say so. A launch that cannot be pinned would run on the orchestrator,
   and rule 1 forbids that.
3. **State the task in one to three lines**, from the arguments or the
   conversation, not from the code. If it cannot be stated, ask.
4. **Read the repository's instruction files** and the files the task names.
   You need to know the ground before you can split it.
5. **Ask how hard the workers should think.** The arguments name the models,
   never the reasoning effort, so ask for it every run through the host's
   structured question tool, in plain text when the host has none. Ask once,
   after the task is stated and before the split, so the question can say what
   the work is. Do not carry an answer over from an earlier run or infer one
   from the task; a cheap model thinking hard and an expensive one thinking
   little are different bills, and the choice is the user's.

   Ask it in the shape the loops use: the question, a product-manager
   rephrasing, an ELI10 version, then the options with the recommended one
   first and its one-sentence reason.

   > How hard should the worker models think on this task?
   >
   > For a product manager: this sets how much thinking time each worker
   > spends before it writes anything. More thinking catches more edge cases
   > and costs more time and tokens.
   >
   > ELI10: you can ask someone to answer straight away, to think it over
   > first, or to sit with it for a while. All three give an answer; the slow
   > one is usually better and always costs more.
   >
   > - Medium (recommended): the default for ordinary work, and the right
   >   answer unless the task is mechanical or genuinely hard.
   > - Low: for a mechanical task such as a rename or a mass edit, where
   >   thinking buys nothing.
   > - High: for a task with real design choices inside a unit.
   > - Maximum: for the hardest units only; slowest and most expensive.
   >
   > Recommend from the task you just stated, and say in one line why.

   Carry the answer to every launch: `effort` on each `agent()` call in Claude
   Code, and the harness's equivalent elsewhere. A unit you relaunch keeps the
   same effort unless the relaunch is what raises it, and then say so in the
   report.

## Split

Break the task into units a single subagent can finish without talking to
another. A good unit has a clear input, a clear done state, and a set of
files no other unit writes. Two units that would edit the same file are one
unit, or one unit plus a follow-up that runs after it. Verification that
depends on every unit landing is yours, not a unit.

Prefer few large units over many tiny ones. A unit that takes a subagent
under a minute was not worth a launch; fold it into a neighbour. A task that
splits into one unit is still run through one subagent on a worker model; the
rules above still apply.

When the worker list has more than one model, spread units across the list in
order, first unit to the first model, and continue round-robin. If a unit
plainly wants a particular model in the list, such as a stronger one for the
hardest unit, say so on its dispatch line and take it out of the rotation.

Print the split before launching: one line per unit with a short id, the
files it owns, and the worker model it goes to. Do not ask for approval; the
user chose to run without a plan. Stop and ask only when the split itself
raises a question the conversation did not settle.

## Dispatch

Run the units as a dynamic workflow, not as a handful of separate agent
launches. A workflow is a script the orchestrator writes: it holds the unit
list, fans the units out, pipes each result into whatever follow-up that unit
needs, and returns the collected reports. The script is where the split
lives, so a reader can see every launch and the model it was pinned to in
one place.

In Claude Code that is the `Workflow` tool. Invoking this skill is the
opt-in that tool requires. Write the script with one `agent()` call per unit,
`model` set on every call to the unit's worker model, `effort` set to the
answer from Preflight 5, and `pipeline()` for units that have a follow-up
stage such as a test run or a narrower relaunch.
When every unit in a phase runs the same model, set `model` on that
`meta.phases` entry too, so the progress view shows it; with mixed models in a
phase, leave the entry unset. Do not leave any `agent()` call without `model`; the
default inherits the session model, and rule 1 forbids that.

In Codex, or any harness without a workflow tool, build the same shape with
whatever it has: launch the units through its subagent tool with the worker
model set on each launch, all at once, and chain follow-ups off each result
as it lands. The user asked for a dynamic workflow; make one out of the parts
available.

Each unit's brief contains:

- the task in the words from Preflight, and this unit's share of it;
- the files the unit owns, and a line saying it edits nothing else;
- the done state and how the subagent proves it, such as the test command
  to run;
- an instruction to return raw results, not a message to a human: what
  changed, what it ran, what it saw, and any decision it did not feel
  entitled to take;
- an instruction to begin its report with the model it is running as.

That last line is the check on rule 1. When a report comes back naming the
orchestrator model, or no model, treat the unit as not done: discard its
result if it has not touched disk, revert it if it has, and relaunch with the
model pinned. Say what happened in the final report.

Subagents report material decisions back rather than taking them. You decide,
and you may relaunch the unit with the decision in its brief.

## Integrate and verify

Read every result yourself. Inspect the diff each unit made against the files
it owns; a write outside them is reverted and the unit relaunched with a
narrower brief. Then run the repository's tests, linters, type checks, and
builds across the whole result, not per unit. A failure at the seam between
two units is yours to fix, by hand when one line does it and by a fresh
dispatch otherwise.

Before calling the task done, hold it to `/qstack-prove-it-works` when that
skill is installed: run the real artifact along the path the task changed. A
subagent's summary is not proof.

## Report

One block, in this order:

- the task, in the words from Preflight;
- a table with one row per unit: id, files, worker model, model it reported,
  result;
- the reasoning effort the run used, and any unit that differed;
- what was verified and how, with the commands;
- anything reverted, relaunched, or left undone, and why;
- the orchestrator model, confirmed by this session's own report of itself.

## Scope and authority

Invocation authorizes reading the repository, launching subagents on the
named worker models, and edits to the files the task covers. It never
authorizes a commit, push, publication, deployment, or external message.
Nothing is written under `qstack/`.
