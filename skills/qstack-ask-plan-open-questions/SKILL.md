---
name: qstack-ask-plan-open-questions
description: >
  Resolve material open questions in a QStack plan through one-at-a-time,
  plain-language decision dialogs, then write each answer and its consequences
  back into the plan immediately. Accepts a bootstrap Markdown plan or an
  authoritative QStack plan.html; once HTML exists, edits only HTML and never
  maintains a Markdown mirror. Use when invoked as
  /qstack-ask-plan-open-questions, when asked to resolve a plan's open questions,
  or automatically after /qstack-plan-to-html creates plan.html.
---

# /qstack-ask-plan-open-questions

Turn a plan's unresolved choices into explicit decisions the next reader can
trust. Ask only questions whose answers change what gets built or how it can be
executed.

## Resolve the plan

1. Use the supplied path when present.
2. Otherwise use a plan clearly referenced in the conversation.
3. Otherwise inspect `qstack/compound_engineering/plans/*/plan.html`, followed
   by legacy `compound-engineering/plans/*/plan.html` and `plan.md` files. Use
   the only plausible candidate; ask when more than one is plausible or none is.
   Never select `.template/`.

Accept `.html` and `.md` files only. Read the whole plan and the repository's
instruction files before asking anything.

Reject template, stencil, and example artifacts even when explicitly supplied,
including anything inside `.template/` and an uninstantiated
`plan-template.html`. Report that the file is not an instantiated plan and ask
for the rendered plan path. Do not reinterpret placeholder copy as a real open
question.

### Authority

- A supplied Markdown file is a working draft only. Edit it in place when no
  corresponding HTML plan exists yet.
- Once a corresponding `plan.html` exists, it is authoritative. Operate on the
  HTML even if the user supplied the old Markdown path, and tell them which file
  was selected.
- Never synchronize answers back from HTML to Markdown. Never maintain both.
- Never regenerate or overwrite an existing authoritative HTML plan from stale
  Markdown.

Use a corresponding HTML plan only when the relationship is unambiguous from
the standard plan directory, document title, or the current conversion context.
Ask rather than guessing between plausible files.

### Frozen plans

Before editing an HTML plan, check its directory for `execution.md`, legacy
`implementation-notes.md`, or `outcome.md`. If any exists, stop: execution has
started and the plan is frozen. Decisions made after that point belong in the
execution record through an execution-loop skill, not in historical plan text.

## Find real questions

Build the candidate list from the plan's own signals first:

- its Open Questions section;
- decision-bearing HTML notes, clauses, fields, or rows marked
  `data-status="open"`, plus unresolved decision gates;
- explicit `TBD`, `TODO`, unknown, undecided, or placeholder language; and
- contradictions between sections that would make two implementers build
  different things.

Then make one secondary pass for material omissions the plan failed to label.
Include one only when its answer changes scope, user-visible behavior,
architecture, data shape, build order, migration, safety, or a release gate.
Do not turn minor implementation details or stylistic preferences into ceremony.
Document-level Draft metadata, a footer stamp, or a sheet status alone is not a
question; it must point to content that states an unresolved choice.

Before asking a factual question, inspect the relevant repository files,
documentation, types, and existing dependencies. Answer verifiable facts from
evidence and update the plan directly when needed. Ask the user about intent,
taste, risk, product policy, or genuinely unavailable facts. Never make the user
answer something the repository already answers.

Ignore questions already resolved under a stable decision ID. When no material
questions remain, report that briefly and make no edits.

## Ask one decision at a time

Use the host's interactive question-dialog tool when available. Ask exactly one
decision per dialog so its answer can be recorded before moving on. If no dialog
tool is available, render the same decision brief in prose, ask for one explicit
choice, and stop until the user responds. Never silently choose the recommendation.

Each decision brief must contain:

- `D<N>` and a short outcome-framed title;
- an ELI10 explanation in two or three plain sentences, using an everyday
  analogy when the mechanism is hard;
- one sentence explaining what the decision blocks or what goes wrong if it is
  left vague;
- two or three concrete choices with honest benefit and cost;
- a recommended choice and a specific reason; and
- a free-form path when none of the choices captures the user's intent.

`D<N>` is only the dialog sequence for the current invocation. The durable ID
written after the answer is `DQ-###`; do not assume their numbers match.

Keep the ELI10 explanation about the issue, not about syntax or file names. Do
not hide plan facts inside it. When options differ in completeness, say what
each omits instead of using an unexplained score.

## Record each answer immediately

After every answer, update the authoritative artifact before asking the next
question. One answer must produce one coherent edit containing the decision,
rationale, rejected alternatives when useful, and every directly affected plan
clause. Do not wait until the end and reconstruct answers from memory.

Allocate durable IDs as `DQ-001`, `DQ-002`, and so on. Continue after the
largest existing ID and never renumber. These IDs are independent of the HTML
template's runtime `§n.m` clause numbering.

### Markdown working drafts

Turn the original open item into a resolved entry or add it under `## Decisions`:

```markdown
### DQ-003 — Configuration ownership

- Status: resolved
- Decision: Keep configuration in the repository.
- Why: CI and every agent must read the same rules.
- Rejected: User-global configuration, because it cannot be reproduced.
- Affects: Design, phase 2, configuration migration gate.
```

Update the affected sections in the same edit. Markdown remains a bootstrap
artifact; do not promise to maintain it after HTML is created.

### Authoritative HTML

Transform the original open clause in place when possible. Otherwise append a
decision clause to the existing Open Questions sheet, renaming that sheet to
"Decisions and open questions" when it now contains both. Keep the existing
sheet count and template structure.

Use one durable marker per decision:

```html
<article class="clause" data-status="locked" data-decision-id="DQ-003">
  <div>
    <p class="label">Resolved decision · DQ-003</p>
    <h3>Configuration ownership</h3>
    <p><strong>Decision:</strong> Keep configuration in the repository.</p>
    <p><strong>Why:</strong> CI and every agent must read the same rules.</p>
    <p><strong>Affects:</strong> Design, phase 2, migration gate.</p>
  </div>
</article>
```

Use the plan's existing component markup when it differs from the example.
Never use `§n.m` as a decision ID. Preserve valid nesting, relative assets,
inline SVG, ELI10 markup, playground behavior, and status vocabulary.

Propagate the answer into every affected HTML section: options, design, phases,
acceptance matrix, risks, and open-question summaries as applicable. Remove or
rewrite superseded claims; do not leave the decision log saying one thing while
the build order says another. Do not mark the plan approved merely because its
questions are resolved.

Apply all changes for one decision in a single patch when possible. If the host
cannot do that, mark the decision `data-resolution="applying"` before the first
edit and remove that marker only after propagation completes. On a later run,
finish any `applying` decision before asking a new question.

## Verify

After the final answer, reread the whole plan and confirm:

- every answered question has exactly one durable decision ID;
- no resolved question is still presented as open elsewhere;
- no unanswered blocking question was silently removed;
- every `applying` marker is gone;
- the title and status remain honest; and
- no unrelated plan content changed.

For HTML, also perform the checks required by the plan's bundled template
reference. Serve it when the repository has `qstack/scripts/serve.sh`, then
check clause numbering, deep links, theme behavior, narrow layout, print layout,
and that no new network request was introduced. If this skill was called by
`qstack-plan-to-html`, return control only after the edited HTML passes this
second verification.

## Report

State the authoritative path, decisions recorded, sections changed, questions
left open, and verification performed. If there were no questions, say so
without inventing work. Do not commit.
