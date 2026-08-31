# Execution

- Plan: qstack/compound_engineering/plans/qstack-review/plan.html
- Mode: no-nonsense
- Review mode: final
- Status: complete
- Started: 2026-08-29
- Updated: 2026-08-31

## Design decisions

- Actor slug for this run is `dallas`, the Conductor workspace directory name,
  per the board protocol's slug rule.
- Approval: the user approved QSTACK-REV-001 revision 1 on 2026-08-29 and chose
  `final` review mode. The plan's title block, document bar, and colophon were
  set to Approved before the board was claimed, and the §10 lede sentence
  claiming the document was still a draft was corrected in the same edit. Those
  were pre-execution edits: no `execution.md` existed and no card had been
  claimed. The plan is frozen from the board claim onward.
- Review mode `final` is the least expensive mode the plan permits. §7.8 and
  card T-10 require a fresh plan-adherence agent and a fresh code-review agent
  at one shared fingerprint, so `none` was not available. Per-card reviewers are
  omitted; each `moved` to `done` carries
  `per-card adversarial review omitted: review mode final`.

- Cards whose only `files` entry is this `execution.md` are worked by the
  orchestrator directly rather than by a dispatched subagent (T-01, T-09,
  T-10). The orchestrator writes this file continuously for the whole run, so a
  subagent writing it at the same time would make the protocol's
  path-attribution check unresolvable on exactly the file both are touching.
  Cards owning skill files get their own subagent as normal.

## Deviations

Approved by the user as they arose, on 2026-08-29 and 2026-08-30. Approval does
not rewrite the frozen plan, with one deliberate exception: the fourth deviation
is an approved edit to the frozen plan itself, taken because the alternative was
publishing a private organisation's name.

- **The gate card's `refs` cite design clauses, not release-gate clauses**
  (T-05, departs from §7.7). §7.7 says the gate card's `refs` cite the plan's
  release-gate clauses. No release-gate sheet in this repository carries a
  `.clause` element, because a release gate is a `.matrix` table and `plan.js`
  numbers only `.clause` elements. `board.js:345-350` builds a card's ref link
  as `#s` plus the ref with dots replaced by dashes, so a bare sheet number
  renders a link to an id nothing has. The approved rule is that the gate card
  cites the clauses that define what the final review must establish, which is
  what this board's own T-10 already carries
  (`refs:["7.7","7.8","10.1","10.7"]`).

- **T-08's files gain `install`** (departs from build-order phase 04). Phase 04
  names a per-skill routing block in `GENERAL_INSTRUCTIONS.md`. That file has no
  such block: the `Use /qstack-... to ...` lines are a hardcoded heredoc at
  `install:62-89`. The approved change is that T-08 inserts one line after
  `install:74`, matching the commit that added `/qstack-reflect`, and leaves
  `GENERAL_INSTRUCTIONS.md` untouched. The board is append-only, so T-08's
  `created` event keeps its original `files`; the addition is recorded as a
  `note` on the card and here.

- **The frozen plan was redacted** (approved 2026-08-30, departs from the rule
  that a plan is frozen once execution begins). §1.1 named the private
  organisation the corpus was mined from and the paid reviewer by product name,
  in a repository that is public. The round-1 adherence review raised the same
  class of disclosure against `execution.md`, which T-14 closed; this is the
  half of it the loop could not touch without approval. The clause now reads "A
  year of a paid reviewer's output across a private organisation", keeping every
  count and every mechanism it cites. One clause changed, nothing else, and the
  document still renders at 10 sheets and 34 clauses with no console error.

- **The gate card's Review-column rule lives in the shared protocol** (T-11,
  outside the frozen plan's card list). `board-protocol.md` said the Review
  column "stays empty when the selected mode omits those reviews", which the
  gate card makes false in `final` mode. T-06 and T-07 each wrote the exception
  into their own file, which is the duplication that file was extracted to end:
  its own opening records that these rules drifted twice while they lived in
  both skills. Approved fix: state the exception once in
  `board-protocol.md`'s The transitions, rewrite the column sentence to name
  what the column holds in each of the three modes, and delete the workaround
  from both loops. Card T-11 was appended to the board for it, since T-06 and
  T-07 were already `done` and the file is append-only.

## Tradeoffs

- The branch was fast-forwarded from `5ebaea2` (v2.1.0.0) to `f840027`
  (v2.3.1.0) before any card ran, on the user's explicit instruction. The branch
  held no commits of its own, so this was a fast-forward rather than a rebase,
  and the untracked plan folder survived it. Working the plan against the stale
  base was the alternative: it would have edited both loop skills and
  `board-breakdown.md` as they stood two minor versions ago and conflicted with
  v2.2.0.0 (parallel waves) and v2.3.0.0 (loop review depth) on land.

## Corrections to plan citations

The plan is frozen, so these are recorded here rather than edited into it. All
three moved in the fast-forward described above; the cited text still exists at
the new line, and the clause's claim still holds.

- §6.3 cites `skills/qstack-loop-no-nonsense/SKILL.md:207` for the fresh
  independent reviewer. That text is now at `:316`.
- §6.3 cites `skills/qstack-loop-no-nonsense/SKILL.md:210` for the per-card and
  plan-level split. v2.3.0.0 rewrote that passage around review modes; the
  equivalent statement is now in the `## Run the selected adversarial reviews`
  section beginning at `:300`.
- §6.5 cites
  `skills/qstack-plan-to-html/references/board-protocol.md:155` for
  "Subagents never write". That heading is now at `:323`, after T-19 and T-21
  inserted rules above it.
- Verified unmoved: `skills/qstack-plan-close/SKILL.md:105` still reads
  `### 4. Check the board is closed`, and `install:148` opens the skill discovery comment, one line
  lower than before T-08 inserted its routing line.

## T-01: evidence provenance and the de-identification standard

**Where the evidence lives.** The corpus behind the generic baseline is the
mined review analysis: 478 pull requests, 1,620 findings, extracted
2026-08-28. Under DQ-006 it is committed to the private organisation's own
repository, under that repository's plan folder, 18 files and 3.1 MB. That
directory carries its
own `README.md` separating the roughly 148 KB of human analysis that does not
regenerate from the 2.85 MB of generated rows that can be rebuilt from GitHub,
where the vendor's review comments remain after the subscription ends.

**Nothing from it is copied here.** This repository is public
(`github.com/hani-q/qstack`, verified public). No file from that evidence
directory is added to this repository by any card in this plan, per DQ-006. The
working copy under `.scratch/` is kept out by an ignore rule rather than by
absence: T-18 added `.scratch/` to `.gitignore`, which it was missing, so a
`git add -A` can no longer sweep the corpus into a public repository.

**The de-identification standard.** Every rule this plan writes into
`skills/qstack-review/SKILL.md` must stand without any of:

1. any repository name from the private organisation the corpus was mined
   from. The reviewer holds that list; it is deliberately not written here,
   because enumerating the names to forbid them publishes them;
2. a pull-request number or a finding identifier of the form `repo#PR#index`;
3. an organisation, product, or host name from that corpus;
4. a defect described closely enough to identify a specific pull request. The
   test is whether someone with access to those repositories could locate the
   original from the rule's wording. A rule may name a mechanism
   ("a container entry point that does not exist in the built artifact") but
   not the incident.

Numbers describing the corpus in aggregate are permitted, since they identify
nothing: the plan's own §1.1 already states 478 pull requests and 1,620
findings.

**Where it is enforced.** T-03 writes the baseline under this standard. T-09
verifies it by scanning the finished skill text for all four classes above and
recording the result. Any hit is a blocking finding on T-09, not a stylistic
note.

## T-02: the review skill's frame

Written at `skills/qstack-review/SKILL.md`, 133 lines: frontmatter, scope
resolution, rules discovery, the read and its completion criterion, severity,
the score table, and the report. The two baseline sections are placeholders that
T-03 fills.

**Correction to the card brief, not to the plan.** The dispatch brief told the
subagent to set an `allowed-tools` frontmatter field "matching how sibling
skills do it". That instruction was wrong on its facts and the field has been
removed. Three reasons, each checked:

1. No QStack skill uses `allowed-tools`. After the subagent wrote it,
   `grep -l 'allowed-tools' skills/*/SKILL.md` returned only this new file.
2. `scripts/validate-skill-invocation` sets `CLAUDE_FIELD =
   "disable-model-invocation"`, one field, and strips only that for the portable
   projection. An `allowed-tools` value written in Claude's
   `Bash(git diff:*)` syntax would ride into the Codex projection, where it
   means nothing.
3. Host-neutral skill text is locked prior art
   (`plans/qstack-skill-expansion/plan.html:529`).

The plan is silent on the field, so this follows the repository's established
pattern under Obey the plan exactly rather than departing from anything. §7.6's
report-only contract is carried in prose, as every other QStack skill carries
it: "The result is analysis, not permission to edit, commit, push, publish,
deploy, or comment anywhere," and the closing "Read, report, stop."

**Known red until T-04 lands.** `scripts/validate-skill-invocation` requires an
`agents/openai.yaml` for every skill directory, so it fails on `qstack-review`
between T-02 and T-04. Expected from the card order, not a defect.

## T-05: parked on the gate card's refs

Written at `skills/qstack-plan-to-html/references/board-breakdown.md`: a new
`## The Review epic` section after `## depends_on and files`, a tenth refusal
condition in `## Check before writing`, an updated epic-derivation sentence, and
a worked bash example that was run end to end in a temporary directory.

Parked because §7.7 cannot be followed literally. It says the gate card's
`refs` cite the plan's release-gate clauses. Verified: no release-gate sheet in
this repository carries a single `.clause` element, in either
`qstack-review/plan.html` or `qstack-skill-expansion/plan.html`, because a
release gate is a `.matrix` table and `plan.js` numbers only `.clause`
elements. `board.js:345-350` builds a card's ref link as `#s` plus the ref with
dots replaced by dashes, so a bare sheet number such as `"9"` renders `§9`
pointing at `#s9`, which no element has.

This plan's own board already departs here: card T-10 carries
`refs:["7.7","7.8","10.1","10.7"]`, the design clauses that specify the gate,
not release-gate refs. So the breakdown that produced this board did not follow
§7.7 either, which is evidence the clause is unimplementable rather than
unimplemented.

The card holds `board-breakdown.md`. No other card owns that path, so nothing
else is stalled by the park.

## T-04: Codex invocation parity

Written at `skills/qstack-review/agents/openai.yaml`, mirroring
`disable-model-invocation: true` as `policy.allow_implicit_invocation: false`,
in the same shape as `skills/qstack-plan-close/agents/openai.yaml`.

`scripts/validate-skill-invocation` needs `skills-ref`, which is not on this
machine's PATH, so the subagent reproduced the CI environment from
`.github/workflows/skills.yml:38-42` at its pinned Agent Skills commit
`38a2ff82958afee88dadf4831509e6f7e9d8ef4e` in a disposable virtual environment.
Exit 0, 24 skills validated, and the line this card exists to produce:
`qstack-review: manual in Claude and Codex`.

That run read T-03's in-flight `SKILL.md`. Its frontmatter already carried
`disable-model-invocation: true`, which is what resolved parity, but T-09
re-runs the validator over the finished tree rather than relying on this.

The virtual environment is at `/tmp/qstack-skills-ref-t04`; T-09 can reuse it
and it is disposable.

## T-08 scope: no version claim inside this plan

Build-order phase 04 names README, the general-instructions block, and
CHANGELOG. It does not name `version.txt`, and T-08's `files` do not include it.
`scripts/qstack-version prepare` writes both `version.txt:363` and
`CHANGELOG.md:361`, so running it inside T-08 would write a path outside the
card's `files`, which the board protocol makes a blocking finding on the card.

So T-08 adds the CHANGELOG entry by hand and leaves `version.txt` alone. The
version claim required by `AGENTS.md` before a branch lands on `main` is a
shipping step outside this plan, whose Ships-when condition names validators and
behaviour rather than landing. Whoever ships this branch runs
`scripts/qstack-version prepare --bump <level>` then.

## T-03: the generic baseline

`skills/qstack-review/SKILL.md` grew from 133 to 193 lines. The six §7.4
invariants are written as checks with the question a reviewer actually asks
(sentinels, state that outlives one call, a test that observes what it names,
lowering that keeps the construct, public endpoints, declared paths reaching the
artifact). The three §7.5 duties each carry an explicit "verify by" clause and
state what happens when the evidence is missing: the finding stands.

Two wording judgements, both preserving the plan's meaning. §7.4's negative
clauses and §7.5's "do not call a shortened wait unsafe" are written as positive
checks that name the failure modes, following the negation guidance in
`writing-for-agents`. Duty 1 leans on the existing "Read the change" rule rather
than restating it, so the full-file read keeps one home and the duty adds only
the proof obligation.

A paragraph opens the Leave-alone section stating that none of the three puts a
subject out of bounds, which is §1.2's finding made binding: the corpus supports
no topic-wide ignore.

Checks on the finished file: 193 lines, zero bytes outside ASCII, so no em
dash, en dash, or curly quote anywhere; no line over 80 characters; and zero
hits scanning for the private organisation's repository names, its own name,
the vendor's name, or any `#NNN`. The one mechanism-level phrase the T-01 standard permits, "a declared
entry point absent from the built artifact", names no incident.

## T-08: partly done, parked on the wrong filename

Written: `README.md` (headline count 23 to 24, the layout tree's count, a
mention beside `/qstack-plan-adherence-review`, and a new `### Code review`
section holding one table row) and `CHANGELOG.md` (one `### Added` bullet under
a new `## [Unreleased]` heading).

`GENERAL_INSTRUCTIONS.md` was not written, because build-order phase 04 names a
block that file does not contain. Verified three ways:

1. `GENERAL_INSTRUCTIONS.md` has no `## qstack` heading and no
   `Use /qstack-... to ...` line. It holds the general instructions and the
   writing guidance only.
2. The installer synchronizes two separate blocks. `GENERAL_INSTRUCTIONS_BLOCK`
   at `install:59` is that file read verbatim. The per-skill routing lines are
   `INSTRUCTIONS_BLOCK`, a hardcoded heredoc at `install:62-89`, whose last
   entry is `install:88`.
3. The commit that added `/qstack-reflect` touched `README.md`, `install`, and
   its own `SKILL.md`. It did not touch `GENERAL_INSTRUCTIONS.md`.

`install` is in no card's `files` on this board, so as it stands
`/qstack-review` never reaches the routing block that lists every other skill.
`GENERAL_INSTRUCTIONS.md:15-18` also tells agents to treat the installed
catalog as the source of truth rather than copying a command list, so adding
one there would contradict the file's own rule.

The release-gate CATALOG row asks only that `README.md` and `CHANGELOG.md` name
the skill, so the gate does not catch this gap either.

**The CHANGELOG heading needs renaming at ship time.**
`scripts/qstack-version check`, run by `.github/workflows/version-gate.yml`,
requires the first `## ` heading to match
`^## \[\d+\.\d+\.\d+\.\d+\] - \d{4}-\d{2}-\d{2}$` and to equal
`version.txt`. `## [Unreleased]` matches neither, and `prepare` rewrites
`CHANGELOG.md` only on a version collision, so the rename is manual either way.
The gate is already red on this branch because `version.txt` has not advanced
past main.

The card holds `README.md`, `CHANGELOG.md`, and `GENERAL_INSTRUCTIONS.md`. No
other card owns any of them, so nothing else is stalled.

## Run 1 stood down

Cards closed: T-01, T-02, T-03, T-04. Points 8 of 23. T-05 and T-08 are
`blocked` under `dallas` with the questions below. T-06 and T-07 depend on
T-05, T-09 depends on both of those, and T-10 depends on everything, so nothing
was left ready. `stood-down` appended for `dallas`; a resume re-claims the
board first.

## T-05 and T-08 resumed and closed

**T-05.** The `refs` bullet in `## The Review epic` now reads that the gate
card cites the clauses defining what the final review must establish, the same
clauses `/qstack-plan-adherence-review` scores against, and says explicitly to
cite clause numbers rather than a sheet number, with the reason: `plan.js`
numbers `.clause` elements only, a release gate is a `.matrix` table with none,
and a bare sheet number renders a link to an id nothing has. The worked example's
gate card moved from `refs:["9"]` to `refs:["7.4","7.7"]`. The example was re-run
end to end in a temporary directory: `node --check` passes, it folds to 3 cards
and 11 points, the gate card carries the corrected refs, and the marker is last.

**T-08.** One line inserted after `install:74`, in the block's existing register:

    - Use `/qstack-review` to review a pull request, a branch, or the working
      tree against a correctness baseline plus the repository rules in
      `CODE_REVIEW_RULES.md`, and report findings with a computed score.

Placed after `/qstack-plan-close`, so the plan lifecycle stays contiguous and
the review skill sits where `README.md` also puts it. The line above is the
shipped text. It first read "the repository's own", whose apostrophe closed the
single-quoted block and broke the installer: round 1's P0, closed in T-13.
`bash -n install` passed on the broken version, which is why it was not the
check that caught it.
The block now carries 24 entries against 24 skill directories on disk, which is
the parity the card exists to restore. `GENERAL_INSTRUCTIONS.md` was not
touched, per the approved deviation.

## Design decision: the gate card in `none` review mode

§7.8 and DQ-007 give the gate card two exits, both agents passing at one
fingerprint or a human override. Neither clause covers `none` review mode,
because review depth shipped in v2.3.0.0, after this plan's clauses were
written. T-07 raised the reading and T-06 was briefed to match it.

Confirmed reading: in `none` the gate card carries no review and moves straight
from `in-progress` to `done` with `gate review omitted: review mode none` in the
move's `note`, plus the same skip recorded in `execution.md`. That is the review
mode the user chose, not an override, and it accepts no finding unfixed because
none was raised.

The stricter reading, that a gate card on every board makes a final independent
review a plan requirement and so removes `none` from every future plan, is
rejected for two reasons. The mechanism for a plan that requires review already
exists and is separate: both loops derive the minimum permitted mode from plan
and repository instructions during preflight, so a plan whose own text requires
a final independent review already forces `final` or `full`, exactly as this
plan did. And removing `none` from every board is a behaviour change this plan
never asked for, against a mode v2.3.0.0 added deliberately as a cost choice.

A `none` run therefore closes with a board that says plainly no review ran, which
is the honest record rather than a hidden gap.

## T-07: the gate card in the trequartista loop

One new `## The gate card` section with a `### The human override` subsection,
inserted between `## Run the selected adversarial reviews` and
`## Completion gate`. No existing line changed, and `## Completion gate` needed
no edit because its "every card is `done` or `split`" rule already carries the
gate.

The subagent caught a constraint this plan did not specify: a remediation card's
`files` must never name the gate card's own `execution.md`, because the gate card
owns that path for as long as it is live under ready-set condition 3, so such a
remediation card could never become ready. That is now written into the rule.

The one paragraph that should differ from the no-nonsense loop is this loop's
stance: the gate is not one of its adaptations, a P0 or P1 finding is answered by
a fix or by the override and never by a note explaining why a deviation was
reasonable, and a fix needing a material deviation is asked first with the
finding left open.

## T-06: the gate card in the no-nonsense loop, and the drift it caused

One new `## The gate card` section with a `### The override` subsection, in the
same position as T-07's, between `## Run the selected adversarial reviews` and
`## Completion gate`. No existing line changed.

**The two loops diverged on `none` mode and were reconciled.** T-06 wrote that a
gate card is itself a required final independent review, so its presence removes
`none` from every board. T-07 wrote that `none` closes the gate card with an
omission note. Opposite readings of the same silence, produced in parallel from
the same brief, which is the drift these two files have a shared protocol file to
prevent.

Resolved in favour of T-07's reading, for the reasons recorded above under
"Design decision: the gate card in `none` review mode". T-06's paragraph was
replaced with wording that matches T-07's, adding one sentence keeping the real
mechanism intact: a plan whose own text requires a final independent review still
permits only `final` or `full`, decided from the plan rather than from the
presence of a gate card. That is how this run reached `final`.

Both files were then checked phrase by phrase, whitespace-normalised: the
`none` note string, "never writes an override for itself", "naming who overrode
it", "every finding accepted unfixed", and "is not permission to write one" all
appear in both. Zero em dashes or curly quotes in either.

The paragraph that should differ still differs: trequartista carries the stance
that the gate is not one of its adaptations, which no-nonsense has no need of.

## T-11: one rule, one place

`board-protocol.md` gained one bullet in The transitions naming the gate card as
the exception, and its Review-column sentence now says what the column holds in
each mode: any card between `in-progress` and `done` in `full`, the gate card
alone in `final`, empty in `none`. Both loops lost their own version and now
just move the card through the protocol's transitions. Net effect is shorter
loop files and one authority.

`grep -c 'Review column'` returns 1 in `board-protocol.md` and 0 in both loops.

**Board limitation at the time, since removed.** T-10's `depends_on` was fixed
when the board was written, so it does not name T-11, and the board is
append-only so that edge cannot be added. T-11 was therefore run to completion
before T-09 and T-10 were claimed, by hand rather than by the ready set. Hitting
that repeatedly is what produced round 3's structural finding: `depends_on`
cannot carry the gate's timing. T-21 replaced it with ready-set condition 5,
which holds the gate until every other card closes whenever that card arrived,
so the hand-ordering this paragraph describes is no longer needed.

## T-09: validation, and the five findings it raised

Six checks, all green: template sync (12 files, both copies identical), board
fold (114 facts against the fixture), `bash -n install`, install-block parity
(24 listed, 24 skill directories on disk, nothing missing either way), skill
invocation parity (24 skills, `qstack-review: manual in Claude and Codex`), and
the de-identification scan over the finished skill, clean on repository names,
pull-request and finding identifiers, and organisation, product, and host names.

Three exercises, each run by a fresh agent following the skill with no prior
sight of it. Every one produced the five-part report with no interpretation
needed, and the report-only contract held in all three.

- Unruled repository: reported "the generic baseline ran alone" as §7.3
  requires, and found the planted sentinel defect, a not-found return of `0`
  used by a caller to index, scoring 2/5 on one P0.
- Ruled repository: named the applying rules file and cited the rule line where
  each finding fired, scoring 2/5 on one P0 and one P2.
- P2-only diff: 5/5 on two P2 findings, from the "Otherwise" row. The agent
  stated plainly that the table did no judging once severities existed, which is
  the §2.2 claim tested rather than assumed.

## T-12: the five findings, closed

All five were gaps in the skill's text that stopped it delivering what the plan
already promises, so closing them completes §7.2, §7.3, and §7.6 rather than
departing from anything. `skills/qstack-review/SKILL.md` grew from 193 to 219
lines.

1. **Severity precedence, the one that traces back to the plan.** §7.2 defines
   P1 as "a real defect, or a violation of a Flag rule", while §7.3 has rules
   files carrying Flag rows that name their own severity. A row reading "a
   public function without a docstring: **P2**" is therefore both P2 and P1, and
   the exercise agent hit the conflict live: it swings a score a full point and
   it resolved it correctly only by reasoning about which statement is the more
   specific. The skill now says a Flag rule naming its own severity wins, and
   the three definitions are the fallback for a finding no rule assigned.
2. **Finding individuation.** The score counts findings and nothing said how
   findings are split, so the arithmetic rested on an unstated judgement. The
   rule is now one finding per smallest fix: two consequences one edit removes
   are one finding, two consequences needing two edits are two.
3. **Naming the commit for a working-tree review.** Uncommitted work has no
   commit. The skill now reports the commit the work sits on, as the base rather
   than as the reviewed state.
4. **Scope with no base branch.** "Committed changes on this branch" is now
   defined as the commits above the merge base with the base branch, and stated
   to be none on a default branch or a root-commit-only repository.
5. **Layer 2 against the file or the hunk.** Now stated: both layers apply to
   the whole changed file, a rule firing on an untouched line is still a
   finding, and the finding says it predates the change.

Re-validated after the edits: invocation parity green across 24 skills, zero em
dashes or curly quotes, no line over 80, de-identification scan clean.

## Finding for the user, outside this repository

The severity conflict closed in T-12 item 1 also exists in the private
repository's own `CODE_REVIEW_RULES.md`, which merged while this run was in
progress. Its Severity section defines P1 as covering any Flag-rule violation,
while its own Flag rows assign P0, P1, and P2 individually, so a reviewer
reading it literally scores every P2 row as P1. The fix there is the same
sentence T-12 added here. Out of scope for this plan, which owns only this
repository, and reported to its owner rather than silently left.

## Round 1 findings, and what closed them

Two fresh agents reviewed fingerprint `8a94240...`. Both independently reported
the same P0, which is the strongest evidence the two-agent design produced.

**P0, `install` exited 127.** The catalog line T-08 added contained an
apostrophe in "the repository's own", which closed the single-quoted
`INSTRUCTIONS_BLOCK` opened at `install:62`. The remainder ran as shell. It was
the only apostrophe in the whole 24-entry block, so the convention was there and
the card broke it.

The instructive part is why validation missed it. T-09 ran `bash -n install` and
recorded it green, and that is correct: the quoting still balances, so the file
is syntactically valid. The check that catches it is
`scripts/test-install-instructions`, required at
`.github/workflows/skills.yml:36`, which arrived in the fast-forward and was
never added to phase 05's validator list. Closed in T-13 by rewording to drop
the apostrophe; the test now passes 4/4 across every stat flavour.

**Six P1s, all drift or dead ends.** Closed in T-16 and T-17:

1. Trequartista told the loop to hold the gate card in `review` and stand down,
   violating the section it cited. A card left in `review` is unclaimable by
   every later run, `plan-close` refuses while it sits there, and no rule brings
   it back. It now parks to `blocked` as the other loop does.
2. Trequartista had no triage step, so a wrong finding forced work or a human
   override. Both loops now say "every P0 and P1 finding you accept".
3. The loops wrote different `refs` on remediation cards. Both now carry the
   clauses the finding traces to.
4. Trequartista never exempted the gate card from subagent dispatch, which would
   have handed it to an agent forbidden from writing board events.
5. The gate card's `refs` had no legal source on a plan without acceptance
   clauses. This is the wall T-05 blocked on, and the answer went into this file
   instead of into the rule, so the next planner would have hit it and asked a
   human again. `board-breakdown.md` now carries a three-step fallback.
6. The new check 10 refused every append to a board written before the Review
   epic existed. It is now scoped to breakdowns and recoveries.

Also closed: the override `moved` now names a legal source status, `review` or
`blocked`, rather than assuming the card is still in `review`.

**P1, this file was itself the disclosure.** The de-identification standard in
T-01 covered the skill text and not the record describing it, so this file
carried the private remote URL, the enumerated repository names, the
organisation and vendor names, and a private pull-request number, in a
repository that is public. Closed in T-14. The standard now says the reviewer
holds the forbidden name list and it is deliberately not written here, because
enumerating names to forbid them publishes them.

## T-15: the four unverified gate rows

- **QUIET**, proven by running it. A fresh agent reviewed a clean tree with one
  commit and no changes. Before and after: `git status --porcelain
  --untracked-files=all` empty both times, commit count unchanged, and the
  board file's md5 identical (`2a536fcd...`). Every command the agent ran was a
  read.
- **GATE**, proven live rather than by argument. `qstack-plan-close/SKILL.md:107-108`
  names `review` among the statuses that block `outcome.md`, and card T-10 is in
  `review` as this is written, so the plan genuinely cannot close.
- **REMEDIATE**, exercised for real. The round-1 P0 became card T-13 in the
  `review` epic, the gate card stayed in `review` throughout, and a new
  fingerprint is required before it can close.
- **OVERRIDE**, not exercised, and deliberately so: writing an override needs a
  human instruction, and none was given. Verified by inspection that both loops
  carry the same rule and that neither can produce one for itself.

The QUIET run found one further defect, closed in the same card. The skill
claimed "5/5 means exactly one thing, no P0 and no P1", but a scope resolving to
zero changed files also scored 5, so a pass on work nobody looked at was
indistinguishable from a clean review. That is baseline rule 1, the sentinel
overload, appearing in the skill's own score table. The skill now reports an
empty scope and gives no score.

## The redaction finding, and the false all-clear it produced

`plan.html` §1.1 named the private organisation and the paid reviewer's product
name in a public repository. The loop could not fix it alone because the plan is
frozen. The user approved redaction on 2026-08-30, recorded under Deviations.

**The first pass was incomplete and this section claimed otherwise.** It said a
scan returned zero hits. It did not: the scan pattern used to verify the claim
had the private repository's name dropped from it, so nine occurrences in
`plan.html` went unseen, along with two internal plan paths. Both round-2
reviewers found it independently. A verification claim that is wrong is worse
than the defect it hides, because it stops the next reader looking.

Closed in T-18. All nine were redacted the same way §1.1 was, and the scan was
rerun with a pattern covering the organisation, the vendor, all twelve mined
repository names, and the two internal plan slugs. It returns zero across
`plan.html`, this file, the skill, the YAML, and the tracked diff.

## Open questions

- None. Every question raised during this run was answered and is recorded
  under Deviations.

## Validation

- `git merge --ff-only origin/main`: fast-forwarded to `f840027`, 23 files
  changed, untracked plan folder and `.scratch/` preserved.
- `scripts/validate-template-sync`: passes, 12 template files validated across
  both copies.
- `node --check board-events.js`: passes. At the round-1 fingerprint the board
  folded to 10 cards and 23 points, all `backlog`. It now folds to 25 cards and 46 points with the gate card in `review`; the growth is remediation cards
  T-13 through T-25, which `planner` did not create and which the breakdown
  markers correctly exclude.

## Adversarial reviews

Review mode `final`: no per-card reviewers, one plan-level review on the gate
card T-10.

### Round 1 fingerprint

`8a9424022f1275814b8a2026a0b977b21ef6502fd50087a016aec88f4f52d69f`

Over the tracked diff against `HEAD` (`f840027`), the untracked files below, and
every substantive section of this file, excluding this Adversarial reviews
section plus `Status` and `Updated`.

| sha256 (12) | path |
| --- | --- |
| `993a8d2f0a3d` | `plans/qstack-review/plan.html` |
| `e1a362ea2984` | `plans/qstack-review/qstack-review.css` |
| `cb65a8b58a77` | `plans/qstack-review/qstack-review.js` |
| `e4cb8b6fee54` | `qstack/scripts/migrate-board-log` |
| `6f39581d2305` | `skills/qstack-review/SKILL.md` |
| `44ee63b9f7e2` | `skills/qstack-review/agents/openai.yaml` |
| `699c89b2507f` | this file, substantive sections |

`board-events.js` is excluded: it is append-only and every card transition
during the review would change it.

Two fresh agents launched against this fingerprint, plan-adherence and
code-review, independent of each other and of the orchestrator. Results below.



## Round 2 findings, and what closed them

Fingerprint `53562f36624d55f1e1c28ee13d335f6e0681865e27ac89ac6cddcf6ed65eaf0c`,
over the same set as round 1 with `board-events.js` excluded. Eight findings.

**P0, the redaction was incomplete and this file claimed otherwise.** The scan
pattern used to verify the round-1 redaction omitted the private repository's
own name, so nine occurrences in `plan.html` and two internal plan slugs went
unseen while this file recorded a clean scan. Both reviewers found it
independently. Closed in T-18: all nine redacted, `.gitignore` gained
`.scratch/`, and the claim was rewritten to say what the scan actually found.
A verification claim that is wrong is worse than the defect it hides, because it
stops the next reader looking.

**P1, the mined corpus had no guard.** `.scratch/` held 3.1 MB of private review
data, untracked and unignored, in a public repository. One `git add -A` would
have published it. Closed in T-18.

**P1 x4, structural defects in the gate machinery, all found by running it.**
Closed in T-19:

1. The plan-level fingerprint covered `board-events.js`, which sits in the plan
   folder and which the gate card's own transitions change. The fingerprint
   could never match, so the completion gate was unsatisfiable. Round 1 hit this
   and improvised the exclusion without recording it; it is now in both loops.
2. A remediation card was forbidden from naming `execution.md`, which made
   round 1's own disclosure finding unfixable, since editing the record was the
   only possible fix. Both loops now say such a finding gets no card and is
   fixed under the gate card with a note.
3. The gate card counted against the wave, so a `--parallel 1` run deadlocked:
   the wave was full and the gate could not close until a card the loop was
   forbidden to claim had landed. `board-protocol.md` now takes it off the count.
4. `no-nonsense` had no rule for a rejected finding, so it could discard a
   reviewer's P0 leaving no record. It now carries trequartista's sentence.

**P1, the review skill contradicted itself on counting.** Baseline rule 2 said
three missing answers are each "its own finding"; the individuation rule said
one fix means one finding. Three P1s score 3, one scores 4, same diff. Closed in
T-20: the individuation rule now governs every other rule in the file.

**P2s** covered a missing `depends_on` in one loop's field list, an override
that recorded less in one loop than the other, and staleness in this file.

### Round 3 fingerprint

`566f918734e86356bdd42e9460cb30512015488f337d86dac662856bf195c831`

Moved from round 2's `53562f3...` by the eight round-2 fixes: T-18 finished the
redaction and added the `.scratch/` ignore rule, T-19 closed four loop and
protocol gaps, T-20 closed the counting contradiction.

`.scratch/` no longer appears in the untracked set the fingerprint walks, which
is the ignore rule doing its job. Five validators green immediately before this
round: install-instructions 4/4, template-sync 12 files, board-fold 114 facts,
versioning 15 tests, invocation parity 24 skills.

### Round 4 fingerprint

`23d04df0677c56af2b9e4d48242caea13d386dca2c31360beb10c77090f08c3b`

Moved from round 3's `566f918...` by four changes, all of them round-3 fixes:

- **T-21, the one structural finding.** The gate card's timing no longer rests
  on `depends_on`. `board-protocol.md`'s ready set gained condition 5: the gate
  card of the `review` epic is ready only when every other card on the board is
  `done` or `split`. `depends_on` is a snapshot taken at breakdown and the file
  is append-only, so a card appended later could never join it, and the gate
  could open beside work still moving. This run hit that repeatedly: every card
  from T-11 on was appended after breakdown and T-10 names none of them, so the
  ordering was maintained by hand each time. Both loops now defer to condition 5
  and neither restates it; the breakdown's `depends_on` rule and check 10 are
  now belt and braces rather than the mechanism.
- **T-22, the record gaps.** Round 2's eight findings had never been written up,
  which both loops require. That section now exists. Six false or stale claims
  were corrected, including two that said "verified" and were wrong, and the
  quoted `install` line now shows the shipped text rather than the apostrophe
  that caused round 1's P0.
- **README.** Its review paragraph still described the pre-gate behaviour and
  repeated the sentence T-11 had already corrected in the protocol. Rewritten to
  describe the Review epic, the two agents, the shared fingerprint, and the
  override.
- **T-23, the version claim.** `2.4.0.0` by minor bump, matching how this
  repository versioned its last two loop-behaviour features. `prepare` wrote
  `version.txt` but left the CHANGELOG heading, because it rewrites that only on
  a collision, so the heading was set by hand. All six repository validators now
  pass, including `qstack-version check`, which had never been in the sweep and
  which was failing.

Six validators green immediately before this round: install-instructions 4/4,
template-sync 12 files, board-fold 114 facts, versioning 15 tests, invocation
parity 24 skills, and `qstack-version check`.

### Round 5 fingerprint

`f2eff8a3330128ae84adb09573a9fbb2421d090c4afdf5d87c67840d8d6e319b`

Moved from round 4 by card T-24, the round-4 P2 sweep. Round 4 returned no
blocking findings from either reviewer; this round exists because accepting
those P2s changed fingerprinted content, and the loop requires a fresh reviewer
after any accepted finding does.

Closed in T-24: the resume path now re-checks condition 5, which was the last
door into a card that skips the ready set; both loops received the half of the
override and split drift each was missing; `/qstack-plan-adherence-review` no
longer reports every gate card as an unreviewed `done` card, which would have
been a false finding on every `full`-mode board; baseline rule 4 now defers to
the individuation rule as rule 2 already did; root and nested rules files have a
stated precedence; the breakdown's ready-set restatement points at condition 5;
and `CHANGELOG.md` documents the board behaviour changes rather than only the
new skill.

Deferred with its remedy recorded: `board.js` badges the gate card `Ready` when
condition 5 forbids it, and it cannot be fixed as written because the fold
discards the creating actor, so nothing identifies which card is the gate. The
fix is a durable `"gate":true` marker on the card plus a `board.js` change plus
template sync plus fixture coverage. That is a board-format addition and belongs
in its own plan.

### Round 6 fingerprint

`20df6fc6d15c390bd68d81c8042688eb3d36b7dc01c2b75944e9eec1f69a2240`

Moved from round 5 by cards T-25 and T-26, both closing round-5 P1s.

T-25: `board-breakdown.md`'s append paragraph still told a planner to report
that the final review does not wait on appended cards, which condition 5 made
false in round 3. The same file stated the corrected rule 130 lines lower. Also
moved the gate card's no-split rule into `board-protocol.md` so both loops defer
to one statement rather than one carrying it and the other not.

T-26: the resume path's operational test was narrower than the rule above it.
It read "if a card has been appended or reopened since it parked", while
condition 5 is "every other card on the board is `done` or `split`". A
remediation card opened before the gate parked and still in `backlog` fails
condition 5 and passes the narrower test, and that state is reachable whenever a
run parks the gate on a budget or a missing reviewer. The test is now condition
5 verbatim. The same card restored an orphaned antecedent the round-5 insertion
had created, and added a rule to both loops to wait for both reviewers before
opening remediation cards.

**Self-inflicted damage, found and reverted inside T-26.** A rewrap intended to
fix over-long lines I had added also reflowed pre-existing text, including
markdown blockquotes inside both loops' shared "Choose the review mode" section.
Caught by diffing removed lines against `HEAD`, eight lines restored, and the
shared sections verified byte-identical again. The only removed lines remaining
in either loop are the two changed deliberately for the fingerprint exclusion.
Recorded because a cosmetic fix nobody required came close to corrupting the one
section both loops must keep identical.

Six validators green immediately before this round.

## Round 6: the gate passed

Both fresh agents reviewed fingerprint
`20df6fc6d15c390bd68d81c8042688eb3d36b7dc01c2b75944e9eec1f69a2240` and returned
no blocking findings. The code reviewer returned no findings at any severity.

**Plan adherence.** T-25 and T-26 verified against their stated intent. The
append paragraph points at condition 5; the no-split rule lives once in the
protocol with both loops deferring; the resume test is condition 5 verbatim; the
orphaned antecedent is adjacent again; both loops wait for both reviewers;
`/qstack-next` no longer recommends a review the gate card already ran. Board
replayed to 26 cards and 47 points, everything `done` except the gate card.
Disclosure scan clean. Five validators reproduced green.

**Code review.** Reconstructed round 5's reachable state, a remediation card
opened before the gate parked and still `backlog`, and folded it with the
repository's own `board.js`: the old test passes that state, condition 5 fails
it. The fix catches exactly what it was written for. Also confirmed the
instruction cannot deadlock, since the blocked gate holds only `execution.md`
and remediation cards are forbidden that path, so a claimable card always
exists. Worked example folds to 3 cards and 11 points with the marker matching.
Ten checks in a list that says ten.

**Both reviewers independently verified the self-inflicted rewrap was fully
reverted**, which is the check that mattered most because the damage was mine
and I was the wrong person to confirm it. Exactly two removed lines per loop
file, both deliberate; blockquotes byte-identical to `HEAD`; and the shared
`## Choose the review mode` section identical between the loops and to `HEAD`,
at sha256 `834bcec3b10a228be8623f9ac42fcfc6d003b21eca73245925e4001732825a0a`.

### Superseding entry: the board count in `## Validation`

The adherence review raised one P2. `## Validation` says the board folds to 25
cards and 46 points; it folds to 26 and 47, T-13 through T-26. T-25 refreshed
that line and T-26 landed after it.

**The true figures are 26 cards and 47 points.** That line is superseded by this
entry rather than edited, under this file's own rule to mark replaced entries
superseded rather than rewrite history. The reason is mechanical: the line sits
inside the fingerprint, and editing it would invalidate the round-6 review it is
reporting on, forcing a seventh round to verify a card count that both reviewers
had already verified by replaying the board. The plan's own §7.8 settles the
precedence, since P2 findings are recorded and block nothing. This section is
excluded from the fingerprint precisely so that recording a review cannot
invalidate the review.

### Six rounds, in summary

Findings per round: 8, 8, 2, 11, 4, 0 blocking. Rounds 1 and 2 found defects in
the work, including a P0 that broke the installer and two false verification
claims. Round 2 found four structural defects in the gate machinery itself,
findable only by running it. Rounds 3 through 6 found one structural defect and
then only text left stale by the previous round's fix, which is what convergence
looks like in prose. Both round-4 and round-5 reviewers concluded the structural
class was exhausted after enumerating every way a card's status can change;
round 6 found nothing.
