# Model routing

How a board says which model should work a card, and how a loop decides which
model actually does. Read by `/qstack-plan-to-html` at breakdown and by both
execution loops at dispatch.

## Two layers, one precedence

A card carries a **hint**. An invocation carries a **tier**. The tier wins.

- The hint is written once, at breakdown, by the pass that has just read the
  whole plan and knows which cards need judgment and which need typing. It is
  advice about difficulty.
- The tier is the set of worker models this run is allowed to spend, named on
  the command line the same way `/qstack-slalom` names them. It is a budget.

A hint outside the tier is not an error. The loop falls back and says so on the
`claimed` event, so a stale hint can never hold a board.

## The two fields on `created`

Both optional. Both strings. Absent means "whatever the tier gives".

| Field | Values | Meaning |
| --- | --- | --- |
| `model` | a model slug as `/qstack-slalom` spells it: `opus-5`, `codex-5.6-seoul`, `sonnet-5` | the worker this card wants |
| `reasoning` | `low`, `medium`, `high` | how hard that worker should think before writing |

Points size the card; these two fields size the brain. They diverge on
purpose. A 2-point card that touches a live router wants a strong worker
thinking hard. An 8-point rename across twelve files wants the cheapest worker
thinking little. Folding difficulty into points would lose that.

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"2026-08-22T09:41:00Z","event":"created","actor":"planner","card":"T-01","epic":"board-file","title":"Fold board-events.js into cards","points":3,"refs":["4.2"],"files":["skills/qstack-plan-to-html/template/v1/board.js"],"depends_on":[],"model":"opus-5","reasoning":"high"});' >> board-events.js
```

`board.js` renders both on the card and in the card dialog. Unknown values
render as written and raise no flag: a model slug the board has never seen is
still a hint, and the loop decides what to do with it.

## Setting the hint at breakdown

Set `model` and `reasoning` when the plan gives a reason. Leave both out when it
does not; a hint with no reason is noise the loop has to read past.

Reasons that earn a strong worker or `high`:

- the card's `files` include a live target, a migration, a security boundary,
  or anything the plan marks as a gate blocker;
- the card is 5 points with an integration seam, so rework is expected;
- the plan says the card's output is judged by hand afterwards.

Reasons that earn a cheap worker or `low`:

- the card is mechanical: a rename, a move, a generated file, a copy of a
  contract already written elsewhere in the plan;
- the acceptance is a test that already exists.

Everything else stays unset. Do not set a hint on the gate card; the final
review runs on the orchestrator's own judgment, and the loop's review mode owns
that choice.

## Resolving at dispatch

The loop takes two required arguments and one optional alongside the ones it already has:

```
--orchestrator <model>            the model this session runs on
--workers <model>[,<model>...]    the models a subagent may run on
--reasoning low|medium|high       default effort for cards with no hint; medium when absent
```

`--orchestrator` and `--workers` are required for a run that dispatches subagents. With neither, the loop
runs as it did before these arguments existed: every subagent inherits the
session model, and the report says so. With one but not the other, stop and
show the usage line.

For each card the loop is about to dispatch:

1. If the card's `model` is in `--workers`, use it.
2. Otherwise use the first model in `--workers`, and put
   `"model":"<used>","fallback_from":"<hint>"` on the `claimed` event.
3. If the card has no `model`, use the first in `--workers` and record
   `"model":"<used>"` on the `claimed` event.
4. `reasoning` passes straight through to the launch as the effort setting.
   Unset means the run's default effort: `--reasoning low|medium|high` on the
   invocation, or `medium` when absent. No question is asked. The loop writes
   `Worker effort: <value>` and `Workers: <list>` into `execution.md` beside
   `Review mode` on the first run, and a resumed run reads them back the way
   it reads the review mode: a flag that disagrees with the recorded value
   stops preflight, and no flag means reuse.

Record the resolved `model` on every `claimed` event, whether or not it came
from a hint. The execution record and `/qstack-plan-adherence-review` then know
which model did which card without reading the transcript.

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"claimed","card":"T-29","actor":"adelaide","reason":"unblocks both executors","model":"opus-5","reasoning":"high"});' >> board-events.js
```

## Two rules from slalom that never bend

Both bind the subagents that implement cards. The reviewer agents a loop
launches from its own `agents/` directory run on the session model on purpose,
as `--review` already says, and neither rule fires on them.

1. **No subagent runs on the orchestrator model.** `--orchestrator` may not
   appear in `--workers`; refuse the invocation if it does. Pin every launch to
   the resolved worker explicitly. An inherited model is the session model,
   which is the orchestrator.
2. **The orchestrator does not implement.** It reads, dispatches, integrates,
   verifies, and writes the board and `execution.md`. The two places a loop
   already lets it write code by hand (a one-line seam fix at integration, and
   the cards the protocol says subagents never write) stay exactly as they are
   and grow by nothing.

## What this does not change

The ready set, the claim race, `files` ownership, the wave, review modes, and
the completion gate are untouched. A card with a hint is claimed, moved and
closed like any other. The hint changes who is briefed, never whether.
