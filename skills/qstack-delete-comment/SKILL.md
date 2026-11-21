---
name: qstack-delete-comment
description: >
  Audit the code comments in a repository or directory and remove them without
  losing knowledge. Classify every comment as a tautology, stale, an excuse, or
  a decision record; delete tautologies and stale comments, turn excuses into
  issues, and move decision records into ADRs under docs/adr/. Then prove that
  only comments changed by comparing each modified file's non-comment token
  stream, build and test, and tighten the repository's comment-ban ratchet.
  Use as /qstack-delete-comment [path], or when asked to delete comments or
  ratchet down comment debt.
disable-model-invocation: true
license: MIT
---

# /qstack-delete-comment

Remove comments from a codebase without losing what they knew. Every comment is
read and classified before it goes, real decisions move into ADRs, real defects
become issues, and the proof that nothing but comments changed comes from the
token stream, not from reading the diff.

`scripts/qstack-comment-tokens` in this skill's directory does the mechanical
parts: `list` prints comments as JSON lines and `check` compares token streams.
Run it with `python3 -I`.

## 1. Settle scope and authority

Take the target from the request: a directory, a file list, or the whole
repository. Then find the repository's own comment lint. Look in its
instruction files (`AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`), its CI
workflows, pre-commit configuration, build files, and `scripts/`. A ratchet
lint usually has a per-file baseline file and modes to list comments, print
statistics, limit to paths, rewrite the baseline, and tolerate slack while
work is in progress.

When the repository has such a lint, it owns the rules: which files count,
which comments are exempt, and how the baseline works. Use its modes, follow
its exemptions, and do not restate or override them here. When it has none,
apply the defaults below and say in the report that there was no ratchet to
tighten. Offer `/qstack-encode-lessons-in-structure` to add one; do not build
it during the sweep.

Default exemptions, used only when no lint defines its own:

- SPDX and copyright header lines. When a header block mixes them with prose,
  keep those lines and classify the prose.
- Compiler, formatter, linter, and static-analysis directives
  (`clang-format off`, `NOLINT`, `fallthrough`, `noqa`, `type: ignore`,
  `eslint-disable`, `cppcheck-suppress`, `#pragma`), shebangs, encoding
  declarations, and machine-checked marker blocks.
- Vendored trees and generated files. Never edit them.

Before editing, ask through the host's question tool for anything the request
left open: the target, and whether to file excuse issues directly or collect
them for the user to approve first. Filing an issue is outward-facing, so do
not assume it. Name the tracker from the repository's instructions or its
`gh` default remote.

## 2. Inventory

Record the base commit; every proof below compares against it. Then list the
non-exempt comments in scope with the repository's lint, in its machine-readable
form when it has one. Without a lint, use `qstack-comment-tokens list <path>...`
for C, C++, Objective-C, and Python, filter out the default exemptions, and for
other languages use the language's own tokenizer.

Give each comment an ID of `path:line:column`, where the comment starts; two
comments can share a line. The ID set is the coverage contract: the sweep is
done only when every ID has exactly one category.

For a sweep of more than a few hundred comments, extract the comments into
batches, each with its file path, line range, text, and the surrounding code
it describes, and classify the batches in parallel with subagents. Each
subagent returns one row per ID: category, one-line reason, and an ADR topic
or issue title where one applies. Merge the rows, then compare the returned ID
set with the inventory. A missing, duplicated, or unknown ID goes back out for
classification; do not guess a category to close the gap.

## 3. Classify every comment as exactly one category

| Category | What it is | Action |
| --- | --- | --- |
| Tautology | Repeats what the code, its names, or its types already show: step narration, section banners, parameter docs that restate the signature, file titles. | Delete. |
| Stale | Names code, files, modes, options, or constraints that no longer exist or are no longer true. | Confirm against the live code with a search, then delete. |
| Excuse | Justifies a hack, workaround, TODO, FIXME, shortcut, missing check, or known defect in code the repository controls. | Delete, and file an issue for the underlying defect or add it to the list for approval. |
| Decision record | Explains a non-obvious why: lock ordering, hot-path invariants, ABI or wire layout, platform or hardware quirks, security boundaries, ordering that looks arbitrary but is not. | Move the reasoning into an ADR, then delete. |

When two categories seem to fit:

- A comment whose subject is gone is stale, whatever else it is. When part of
  it is still true and non-obvious, that part is a decision record.
- A workaround for a defect the repository could fix is an excuse. A
  workaround for a constraint imposed from outside, such as a kernel, compiler,
  hardware, or protocol quirk, is a decision record.
- When unsure between tautology and decision record, choose decision record.
  An unnecessary ADR line costs little; a lost invariant costs an incident.

## 4. Write the ADRs and issues

Use the repository's ADR layout and format when `docs/adr/` exists, and add to
the ADR that already covers a subsystem before creating a new one. Otherwise
create `docs/adr/README.md` with an index, and number new records
`NNNN-<slug>.md` with a status, a date, the scope as file paths, the context,
and the decisions. The comment's location disappears with it, so each decision
names the file and symbol it governs. Keep the index in step with the files.

File one issue per underlying defect, not one per comment. Each issue names the
file, the symbol, the defect, and the deleted comment's text. When the user
chose approval first, write the proposed issues into the report and file
nothing. Never write an issue link back into the code; that is a new comment.

## 5. Delete without touching code

Edit by the lexer's offsets, working from the end of each file toward its
start, never with a pattern match over raw text.

- A comment alone on its lines: delete those lines. Where a block of comment
  lines leaves blank lines on both sides, keep one.
- A trailing comment: delete it and the whitespace before it.
- A comment between two tokens: replace it with one space. Never merge two
  adjacent tokens.
- A line that ended in a backslash continuation must still end in one.
- Leave no trailing whitespace on a line you touched.

## 6. Prove that only comments changed

```bash
python3 -I <skill-dir>/scripts/qstack-comment-tokens check <base>
```

This compares the non-comment token stream of every file changed since the
base, in the working tree, against the base. String, character, and raw-string
literals stay whole, so whitespace inside a string counts, and the end of a
preprocessor directive is a token, so a lost continuation fails. No byte is
discarded in decoding. Added, deleted, or untracked source files fail, because
a comment sweep only modifies files, and so does a file the lexer cannot read,
such as one with an unterminated comment or a trigraph. Documentation and data files, such
as the ADRs and the baseline, are listed as not source.

For a language with no built-in lexer, pass `--lexer <file>`: a Python file
defining `code_tokens(text, path)` that returns the non-comment tokens, built
on the language's own tokenizer. Never skip a file the check cannot read. Any
failure means the edit changed code; fix the edit, not the check.

Then build the repository and run its tests with the commands its instruction
files and CI name. A comment sweep that breaks the build changed code, whatever
the token check said.

## 7. Tighten the ratchet

Rewrite the baseline with the lint's update mode so every file's budget drops
to its new count, then run the lint in its normal mode, with no slack allowed,
and confirm it passes. A deleted comment can then not come back without the
check failing. If the lint has its own tests, run them.

## 8. Report

- Count per category, plus exempt comments kept, and confirmation that the
  classified IDs match the inventory.
- Lines removed, from `git diff --numstat` against the base.
- ADRs written or updated, by path.
- Issues filed, with links, or the proposed list awaiting approval.
- The token check result, the build and test result, and the remaining
  ratchet budget.

Invocation authorizes edits inside the target, new ADR files, and the baseline
update. Filing issues needs the answer from step 1. It never authorizes a
commit, push, pull request, or deployment.
