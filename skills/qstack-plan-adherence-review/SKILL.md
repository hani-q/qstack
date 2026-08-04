---
name: qstack-plan-adherence-review
description: >
  Review whether an approved QStack HTML plan was faithfully executed by
  comparing plan.html with execution.md, executor.md, or legacy implementation
  notes and the actual committed and uncommitted code changes. Build a
  requirement-to-evidence matrix, identify missing or unapproved deviations,
  check whether the execution record matches reality, and assign a guarded
  0-5 adherence score. Use when invoked as /qstack-plan-adherence-review, when
  asked whether a plan was followed, or before closing or landing planned work.
---

# /qstack-plan-adherence-review

Audit the implementation against the plan. Treat the plan as the contract, the
code and test results as ground truth, and the execution record as supporting
evidence that must itself be checked.

This is report-only work. Do not edit the plan, execution record, code, tests,
or repository instructions. Do not commit or push. Write an
`adherence-review.md` only when the user explicitly asks for a saved artifact;
otherwise report in the final response.

## Resolve the evidence

1. Use a plan path supplied by the user.
2. Otherwise use a plan clearly referenced in the conversation.
3. Otherwise inspect `qstack/compound_engineering/plans/*/plan.html`, then
   legacy `compound-engineering/plans/*/plan.html` and `plan.md`. Never select
   `.template/`. Use the only plausible candidate; ask when multiple candidates
   remain.
4. In the plan directory, prefer `execution.md`. Also read `executor.md` and
   legacy `implementation-notes.md` when present; do not discard history merely
   because a newer filename exists.

Read repository instruction files and the whole authoritative plan. Record the
plan status. A draft or proposed plan may be reviewed, but state that it lacked
implementation authority.

Determine the implementation range before judging it. Prefer, in order:

1. a base ref, reviewed fingerprint, or commit range explicitly recorded in the
   execution record;
2. a base supplied by the user;
3. the merge base with the repository's target branch, normally `origin/main`;
4. a range reconstructed from plan history and relevant commits.

Inspect committed changes, working-tree changes, and relevant untracked files.
State the chosen base and inclusions. Exclude unrelated changes only with a
concrete reason; list exclusions so hidden scope cannot improve the score.

## Extract the plan contract

Turn the plan into individually testable obligations. Include:

- user-visible outcomes and acceptance criteria;
- locked decisions, interfaces, data shapes, and architectural constraints;
- required build and migration steps;
- validation and release gates;
- explicit non-goals when the implementation crosses them.

Do not turn background, rationale, rejected options, examples, or tentative
ideas into requirements. Keep the plan's section or clause identifier on every
obligation. Split compound requirements when their parts can succeed or fail
independently.

## Trace each obligation to reality

For every obligation, inspect the implementation and assign exactly one status:

- **Met** — direct code or test evidence satisfies it.
- **Approved deviation** — the implementation differs materially, and the
  record contains concrete evidence that the user approved the change.
- **Partial** — some required behavior exists, but a material part is absent or
  unproven.
- **Missing** — no implementation evidence exists.
- **Unapproved deviation** — reality materially differs without evidenced
  approval.
- **Not verifiable** — available evidence cannot establish the result.

An execution-record claim is not implementation evidence. Verify paths,
symbols, behavior, migrations, generated artifacts, and tests against the
current tree. When safe and proportionate, rerun focused validation rather than
repeating a recorded success. Distinguish a missing test from a failing test
and from a test that was not run.

Check the execution record separately for:

- completed boxes whose implementation is missing;
- changes or decisions absent from the record;
- deviations mislabeled as ordinary implementation detail;
- approval claims with no recorded decision;
- stale validation results or fingerprints;
- a `complete` status that does not satisfy the plan's completion gate.

## Score adherence

Assign one overall score. Use the lowest description that fits the material
evidence; do not average away a serious miss.

| Score | Meaning | Required evidence |
| --- | --- | --- |
| **5 — Faithful** | The approved plan was fully executed. | Every material obligation is met or covered by an evidenced approved deviation; validation passes; the execution record is accurate; no blocker remains. |
| **4 — Substantially faithful** | The intended result is complete, with only minor gaps. | All critical and user-visible obligations are met; remaining issues are non-material documentation, test, or record-quality gaps. |
| **3 — Partially faithful** | The core result exists, but execution departed materially. | At least one material obligation is partial, unverified, or changed without evidenced approval, while the central outcome still works. |
| **2 — Weak adherence** | Important parts of the contract were not delivered. | Multiple material obligations are missing or contradicted, or a release/acceptance gate fails. |
| **1 — Nominal adherence** | Only isolated pieces resemble the plan. | The central behavior or design is absent despite some related changes. |
| **0 — Not executed** | There is no credible implementation of the plan. | No relevant change exists, or the implementation directly abandons the plan's central outcome. |

Apply these score caps:

- Cap at **3** for any material unapproved deviation.
- Cap at **2** for a missing or failing blocker involving security, privacy,
  data correctness, migration safety, or a required release gate.
- Cap at **4** when any material obligation is not verifiable or the execution
  record materially misstates reality.
- Do not penalize an approved deviation merely for differing from the frozen
  plan; judge whether the approved replacement was actually implemented.

Counts support the score but do not determine it. Report totals for each
status, then explain which material evidence set the score and which caps were
applied.

## Report

Lead with the verdict and score. Then provide:

1. **Evidence reviewed** — plan, execution records, base/range, working-tree
   state, and validation run.
2. **Findings** — ordered by severity, with plan clause, code or test evidence,
   impact, and concrete remedy. State explicitly when there are no findings.
3. **Traceability matrix** — one row per obligation: clause, concise promise,
   status, implementation evidence, and execution-record evidence.
4. **Record accuracy** — contradictions and omissions in the execution record.
5. **Score rationale** — status counts, material failures, and any score caps.
6. **Next actions** — the smallest steps needed to reach a 5.

Use repository-relative `file:line` citations and commit identifiers. Never
claim a behavior from filenames or comments alone. Separate verified facts from
inference and say plainly when the evidence is insufficient.
