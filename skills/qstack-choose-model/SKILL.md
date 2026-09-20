---
name: qstack-choose-model
description: >
  Pick the model and reasoning effort for one piece of work, from the models
  this machine can actually reach and the benchmark scores that exist for
  them. Discovers the catalogue from the CLI's own proxy configuration, scores
  it with the Artificial Analysis Data API when a key is present, maps it to
  strong / standard / cheap tiers minus the orchestrator, classifies the task
  from its metadata, and returns one tuple with the reason. Run standalone as
  /qstack-choose-model [task], or automatically by /qstack-plan-to-html at
  breakdown, by the execution loops at startup, and by /qstack-slalom to
  validate its workers.
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-choose-model

Which model should do this, and how hard should it think? Answer from what is
reachable and what is measured, never from a name typed into a skill.

## Invocation

```
/qstack-choose-model [task text] [--points N] [--files a,b] [--gate] [--live-target] [--orchestrator <model>]
```

With no task text, the task is the one settled in the conversation. Every
flag is optional metadata; when a board card is the task, its `points`,
`files` and `refs` are the metadata and the caller passes them.

Output, always the same shape, in the response and as JSON when a caller
asked for it:

```json
{"tier":"strong","model":"claude-opus-5","reasoning":"high",
 "why":"5-point card with an integration seam; strong = top coding index among reachable non-orchestrator models (Artificial Analysis, 2026-09-20)",
 "catalogue":"codex model_provider http://127.0.0.1:8317/v1","scores":"Artificial Analysis Data API, 2026-09-20"}
```

## The script

Everything mechanical lives in `scripts/qstack-models`, next to this file.
Resolve it relative to this SKILL.md's real path; never hardcode a home.

| Command | Prints |
| --- | --- |
| `discover` | the reachable model ids and which source produced them |
| `score` | the catalogue joined with coding index and price |
| `tier --orchestrator M` | the strong / standard / cheap map, M excluded |
| `resolve NAME` | the id NAME means, or the closest three when it means nothing |
| `probe-brief ID` | the one-line task that proves ID can be launched |
| `aliases` | what Claude Code's `fable`/`opus`/`sonnet`/`haiku` resolve to here, from `ANTHROPIC_DEFAULT_*_MODEL` |
| `codex-agents --orchestrator M [--reviewer R] [--dir D] [--dry-run]` | writes the tier map as custom agent files `qstack_strong`, `qstack_standard`, `qstack_cheap`, `qstack_reviewer` under `~/.codex/agents/` |

### Where the catalogue comes from

First hit wins, and the output names it:

1. `QSTACK_MODELS_URL`, an override nobody has to set.
2. The base URL the CLI already trusts: Codex's `model_providers.<current>.base_url` in `~/.codex/config.toml`, then `ANTHROPIC_BASE_URL`, then `OPENAI_BASE_URL`, each asked `GET /v1/models`. A CLIProxyAPI wired into either CLI is found here with no setup.
3. The harness's built-in list: Claude Code's Agent tool enum, detected from `CLAUDECODE` in the environment or `QSTACK_HARNESS=claude-code`. Codex has no fixed list of its own, so from Codex this step is empty.
4. Nothing usable: ask the user for the models that may work, one question, free text, then `resolve` each answer.

No address is hardwired, only where to look. A key is sent only to the host it was issued for: `QSTACK_MODELS_KEY` to the override URL, `OPENAI_API_KEY` to `OPENAI_BASE_URL`, the Anthropic token to `ANTHROPIC_BASE_URL`, and CLIProxyAPI's own key only to the local host and port its config names.

### Where the scores come from

Artificial Analysis Data API, free tier, when `ARTIFICIAL_ANALYSIS_API_KEY`
is set or `~/.config/qstack/artificial-analysis.key` exists. It gives a
Coding Index and price per model, including per-effort variants
(`claude-opus-5-high`, `-low`), cached one day under `~/.cache/qstack/`. The
free tier allows 100 requests a day and internal use with attribution, which
is why the `why` line and `execution.md` always name the source and date.
Register at https://artificialanalysis.ai/data-api; no card is needed. The
key is never written into a repository.

Without a key the script uses a static ordering shipped inside it and says
"static ordering" in the output. Without network it does the same.

### Tiers

A tier is a model *and* an effort, chosen together. Artificial Analysis scores
each effort separately and the spread is large: on the 2026-09-20 snapshot
`gpt-5.6-luna` scores 71.4 at its default effort and 44.2 at `low`, and
`claude-opus-5` drops from 78 to 66.9. A label bolted onto a model chosen at
default effort therefore picks the wrong cell, which is what this rule
replaces.

`strong` is the (model, effort) cell with the highest coding index among
reachable models that are not the orchestrator. `cheap` is the lowest output
price among cells within 20 index points of `strong`, ties to the higher
score, so cheap still means competent and never a model at a cliff. `standard`
is the best remaining cell on a third model. A provider's default row and its
`xhigh` row have no launcher setting of their own and stand in for `high` when
they score better than it. The output carries `reasoning` per tier; print the
map before using it, because a reader should be able to disagree with it.

## Classify the task

Metadata first, text second, in the order the research on routing software
engineering work by task metadata suggests (Triage, arXiv 2604.07494):

- `strong` / `high` when any holds: `files` touch a live target, a migration
  or a security boundary; the plan marks the work a gate blocker; 5 points
  with an integration seam; the output is judged by hand afterwards.
- `cheap` / `low` when the work is mechanical: a rename, a move, a generated
  file, a copy of a contract written elsewhere in the plan; or the acceptance
  is a test that already exists.
- `standard` / `medium` otherwise.

Write the reason in one clause. No reason, no hint: a caller that gets
`tier: null` leaves the card unhinted and lets the run's `--reasoning`
default apply.

## Probe before trusting

A name that resolves is not yet a model that launches. Before the first real
dispatch in a run, send each distinct model the `probe-brief` task through
the same launcher the run will use, lowest effort, no files. PONG naming the
requested id means launchable. A launcher that rejects the name means stop
before any card is claimed and ask, offering `resolve`'s closest three. PONG
naming a different model means the proxy routed silently: warn, record both,
continue only on the user's word. Record `Workers verified: ...` in
`execution.md`.

## Launching a tier in each harness

Neither harness takes a bare model id at spawn time, so the tier map has to
be bridged into the form each one launches by.

**Codex.** Custom agents are TOML files under `~/.codex/agents/` with `name`,
`description`, `developer_instructions`, and optionally `model` and
`model_reasoning_effort` (docs: developers.openai.com/codex/subagents). A
parent spawns one by name. `codex-agents` writes one file per tier from the
current map, `qstack_strong`, `qstack_standard`, `qstack_cheap`, and
`qstack_reviewer` when `--reviewer` is given (read-only sandbox). A Codex loop
then spawns `qstack_<tier>` for a card of that tier. Subagents inherit the
parent's sandbox and approval overrides. This is the harness that honours a
mixed tier with any id the proxy serves.

**Claude Code.** The Agent tool names a subagent by one of four aliases,
`fable`, `opus`, `sonnet`, `haiku`, and maps each to a full id through
`ANTHROPIC_DEFAULT_FABLE_MODEL`, `_OPUS_`, `_SONNET_`, `_HAIKU_MODEL`
(docs: code.claude.com/docs/en/model-config). Behind a proxy the id only has
to be one the proxy serves, so three slots can carry non-Claude models while
`fable` stays the orchestrator. `aliases` reports the current mapping. Three
slots, set in the environment that launches the harness, and the harness does
not know which real model an alias means, which is what the probe is for. A
tier a Claude Code run cannot express is a recorded fallback to the first
launchable alias, never a silent one.

## Callers

- `/qstack-plan-to-html`, at breakdown: `tier` once, then this skill per card
  that earns a hint; writes `model` and `reasoning` on `created` and the
  reason in the card's `note`.
- `/qstack-loop-no-nonsense` and `/qstack-loop-trequartista`, at startup:
  `tier --orchestrator`, probe the tier, record it; on a card with no hint,
  this skill decides.
- `/qstack-slalom`, in Preflight step 2: `resolve` each `--workers` name and
  probe it.
- Both loops, for `--reviewer`: `resolve` and probe the reviewer model, and
  refuse it when it is the orchestrator. `score` shows the Intelligence Index
  beside the Coding Index, which is the column a reviewer is chosen on.

## What this skill never does

It never writes a key or a model list into a repository, never launches
work other than the probe, never edits a board or a plan itself. Callers do
that under their own rules.
