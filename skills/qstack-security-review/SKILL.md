---
name: qstack-security-review
description: >
  Review a pull request, a branch, the working tree, a directory, or the whole
  repository for exploitable security defects and report findings with a
  computed score. Carries its own diff review, adapted from Anthropic's
  claude-code-security-review action, and asks on every run which installed
  security collections to add: Cloudflare's security-audit for a whole-codebase
  audit, or a Trail of Bits skill such as entry-point-analyzer.
  One merged report, report-only: nothing is edited, posted, or landed.
disable-model-invocation: true
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-security-review

Find security defects an attacker can reach, then report them with evidence,
severity, and a score that is arithmetic over the findings. Nothing here probes
a deployed system: every check reads source or runs locally against fixtures.

## Resolve the scope

Take the scope the way `/qstack-review` does: a named pull request, a branch
against its merge base, or otherwise the working tree, naming the exact commit
before reading anything. Those are change reviews. One more scope is an audit:
a named directory, or the whole repository when the user asks for an audit
rather than a review of a change. Everything under it is in scope, and the
commit is `HEAD` plus whether the tree is dirty.

## Discover what is installed

Run `../qstack/scripts/installed-skills`, which ships with the `/qstack` skill
beside this one, and keep the rows whose collection is `Cloudflare` or
`Trail of Bits`. Each row is `collection<TAB>name<TAB>path<TAB>description`.
Only skills the skills.sh lock file attributes to those two sources are
listed; a same-named skill from elsewhere is not, because this file cannot
vouch for what it does.

## Ask what to run

The built-in diff review always runs. Ask one question, every run, through the
question tool when the host has one and as a numbered list otherwise, offering
each row the script printed and letting the user pick more than one. Condense
each description to a line of about twelve words so the choice reads quickly.
When the script printed no rows, say that no security collection is installed,
name `install --with-security-audit` and `install --with-trail-of-bits`, and
continue without asking.

Two notes belong beside a name, because picking it blind wastes a run:

- **Cloudflare `security-audit`** runs in guidance mode for a change review and
  offers its full audit for an audit scope. Say which the scope selects.
- **Trail of Bits `entry-point-analyzer`** is built for an audit scope and adds
  little to a change review. `sarif-parsing` needs a SARIF file from a scanner
  already run; without one there is nothing for it to read.

Record the choice in the report. A skill the user declined is listed as
declined, not as having found nothing.

## Run the built-in diff review

Read `references/diff-review.md` beside this file and apply it to every file in
scope, in full rather than the diff excerpt alone, plus the code each change
depends on. It defines what counts as a finding, the categories, the method,
the classes that are never reported, and the severity and confidence rules.

## Run a chosen installed skill

For each skill the user picked, read its `SKILL.md` at the path the script
printed and follow it, under these limits, which win over anything it says:

- Source inspection only. No request to a deployed endpoint, external service,
  or shared infrastructure. Local execution only against fixtures and dummy
  principals.
- Nothing written inside the repository.
- Its findings come back into this report, each marked with the skill that
  produced it. Where it writes its own report file, name the path.

Picked skills read the repository and write nothing into it, so they run at
the same time as parallel subagents where the host has them.

Cloudflare's `security-audit` has three rules of its own. Its full audit
executes target code only inside the OS-enforced sandbox it describes; without
one it reports those checks as blocked, which this report carries under "Not
checked". Its run directory stays outside the repository, its default. When it
wrote a report, run its `validate-findings.cjs` and
`validate-coverage-ledger.cjs` and quote a failure rather than hiding it.

## Merge

One finding per smallest fix, across every source. Two skills reporting the
same `path:line` and the same cause are one finding that names both sources.
Two consequences one edit removes are one finding; two consequences needing two
edits are two. Keep the sharper exploit scenario and the stronger evidence when
merging. A finding an installed skill made that the built-in exclusion list
rejects stays out, and "Not checked" says which rule excluded it.

Every finding carries a `path:line`, the entry point, the traced path to the
sink, the attacker's steps, the consequence, the smallest fix that removes it,
and the sources that found it. Set severity by consequence under the rules in
`diff-review.md`, never by how much code the change touches or how many skills
agreed.

## Score

Count the P0, P1, and P2 findings and read the score from the table in
`/qstack-review`, in a host without a skill tool from its `SKILL.md` beside
this one, so one repository sees one scale. Two things differ here: no
`CODE_REVIEW_RULES.md` table replaces it, and unverified candidates never
count. An empty scope gets no score.

## The report

Report in the final response, in this order:

1. **Scope**: what was reviewed, the exact commit, and any file left unread.
2. **Ran**: each installed skill picked and the mode it ran in, then each one
   offered and declined. For a Cloudflare full audit, the run directory and
   whether its validators passed.
3. **Findings**, worst first, each with the fields defined under Merge. Say
   plainly when there are none.
4. **Unverified**: candidates between seventy and eighty percent confidence,
   each with what would settle it. Omit the heading when empty.
5. **Score**: the number, the P0, P1, and P2 counts, and the row that produced
   it.
6. **Not checked**: pre-existing weaknesses seen in changed files, classes the
   exclusion list kept out, checks a missing sandbox or tool blocked, and
   collections that were not installed. A reader can tell a clean change from
   an unexamined one only from this part.

Read, report, stop. Delivery belongs to whoever ran the skill: this run writes
no file into the repository, posts no comment, appends no board event, and
commits nothing, on a clean result as much as on a bad one.
