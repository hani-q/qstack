# Changelog

## [2.6.1.0] - 2026-09-05

### Added

* `/qstack-libero` interrogates finished work against its goal and removes
  what the goal did not require. It restates the goal, names the assumption
  behind each file, abstraction, flag, dependency, and test the work added,
  reports the sorted list, then deletes first, simplifies second, optimizes
  only against a measurement, and automates last. It never cuts validation at
  a trust boundary, error handling that prevents data loss, security,
  accessibility, or a documented repository invariant. Explicit invocation
  only, because it edits and its natural trigger would match every finished
  task. Inside a QStack execution loop the implementation ladder and the
  adversarial reviewer already cover this ground; the skill is for work outside
  a loop, or a finished branch before a pull request.

## [2.6.0.1] - 2026-09-05

### Changed

* The shared Claude and Codex instructions now explicitly require removing all
  mannered prose.

## [2.6.0.0] - 2026-09-03

### Added

* `/qstack-update-plan-assets` refreshes a repository's shared plan scripts,
  styles, documentation, and fonts from the installed QStack template. It
  replaces only files proven older, preserves target-only files, and leaves
  every plan document and execution record untouched. Its deterministic copier
  rejects paths outside the template and symlinked destinations, writes each
  file atomically, and converges when rerun.

### Changed

* `/qstack-plan-to-html` now checks an existing shared template before rendering
  and applies clearly newer installed assets without asking for another
  approval. Ambiguous or repository-owned differences still stop for a human
  decision. The renderer package carries the update workflow and copier, so a
  `qstack-plan-to-html`-only install can perform the automatic refresh without a
  second skill package.

## [2.5.0.0] - 2026-08-31

### Added

* The execution board has a `Show` filter: one chip per column plus `All`, each carrying its count, and pressing one leaves that column alone on the board. It is a view control and nothing else, so it moves no card, appends no event, and changes no URL. A lane with nothing in the chosen column is hidden rather than left as a head over an empty row, and a board with no cards has no filter at all. The choice is kept in `localStorage` under the plan's own path, so two plans opened from disk do not share one filter and a browser with storage off simply forgets it between visits.

* Pressing a card id opens that card in full, in a modal holding everything the column has to drop: every note rather than the last, every flag, `Needs`, `Unlocks` and `Related` uncapped, the full file paths, and the card's own slice of the event stream in file order, which is the first time a plan can be read as one card's history rather than as a whole board's. Clicking anywhere else on the card opens the same thing. A card id inside the modal retargets it instead of scrolling something behind it, and a `§ref` closes it and opens that clause in the plan view. The 3-second reload refills an open card, so one left open is one being watched, and `Escape`, the backdrop and `Close` all close it.

* `board.js` builds both controls from `.board` rather than reading them out of `plan.html`. A plan whose markup was frozen when execution started gets them by loading the stylesheet and the script, with no edit to the document itself.

* A card can cite the section of `execution.md` where its reasoning was written, through a new optional `entry` field on any board event after `created`. The card shows a `Ledger` row and the dialog names the file; both open it in their own tab, because the board is polling and may have a filter set and a card open. The event carries the anchor slug alone and the board builds `execution.md#<slug>`, so no event can put a scheme, a path or a `javascript:` URL into a link, and a slug that is not lowercase letters, digits and hyphens is a bad write the card reports rather than a link nobody meant. Most cards carry no entry: most cards close in one line, and inventing a section to have something to cite is worse than citing nothing.

* `scripts/fixtures/board-fold-events.js` gained two cards that exercise `entry`: one citing a well-formed anchor, one citing `execution.md#T-18 Deviations`, which is not one. The second folds to a flagged card, so both the accept and the reject path are now facts every implementation of the fold has to agree on rather than behaviour only `board.js` has ever run.

* `board-protocol.md` gained The ledger entry, which is the rule that makes the field worth having. Reasoning is written once, in `execution.md`, under an anchor placed above its heading so the target survives a reviewer rewording it. `note` keeps the one line that belongs to the board: a blocked card's question, which files it wrote to, `review mode final`, what an `8` splits into. A `note` restating a ledger section was the same paragraph maintained in two files, and only one of them can ever be corrected: `board-events.js` is append-only, so the board would keep the first draft after review fixed the ledger. Both loops read that one file, so the rule cannot say two different things.

### Changed

* A board column is 216px at its narrowest rather than 168px, and the lane scrolls sideways under it. A card is now a known width on any screen instead of whatever the window had left over after six columns, which is what made a card look skewed on a narrow one. What a card drops to hold that width is clamped rather than cut: the title at three lines, the note to the last one, `Related` to three, and a long actor slug or file path with an ellipsis. All of it is in the card dialog, and the card border and the state line still say a flagged card is flagged.

### Fixed

* A card no longer overruns the column it was drawn in. Every grid on the board that holds card text was declaring `display: grid` with no template, which puts its children in an implicit `auto` track; an implicit track sizes to max-content and overflows its own box instead of shrinking to it, so a single long actor slug, title or file path pushed a card sideways across the column beside it. Each of those grids now names `minmax(0, 1fr)`.

## [2.4.0.1] - 2026-08-31

### Fixed

* The `qstack-review` plan's `outcome.md` recorded that nothing had been committed and no pull request existed, which was true when written and false from the moment it merged. Its front matter now reads `shipped` with the real merge commit, the open follow-up asking for a commit is closed, and the plan index says shipped. The correction is stated in the file rather than quietly overwritten, because a plan record is what `/qstack-plan-prior-art` reads before the next plan in that area.

## [2.4.0.0] - 2026-08-30

### Added

* `/qstack-review` reviews a pull request, a branch against its base, or the working tree, and reports findings with a score rather than a verdict. It reads two layers of rules: a generic correctness baseline that ships with the skill and applies in any repository, plus the repository's own `CODE_REVIEW_RULES.md` at the root and in every directory holding a changed file, where a nested file governs only the files below it. Every finding carries a `path:line`, the consequence, and the smallest fix that removes it, and the score is arithmetic over the P0, P1, and P2 counts rather than a number a reviewer picks. With no rules file anywhere the report says the baseline ran alone, so an unruled repository reads differently from a clean one. The skill is manual only and report-only: it writes no file, posts no comment, appends no board event, and commits nothing.

### Changed

* Every execution board now ends with a `Review` epic holding one gate card: the whole-plan review, made visible so `/qstack-plan-close` can see whether it happened. The card holds the plan's `execution.md`, launches a fresh plan-adherence agent and a fresh code-review agent against one shared fingerprint, and closes only when both pass or a human records an override naming every finding accepted unfixed. Blocking findings become remediation cards beside it; P2 findings are recorded and block nothing.
* The ready set gained a fifth condition: the gate card is ready only when every other card on the board is `done` or `split`. `depends_on` could not carry this, because it is a snapshot taken at breakdown while the file is append-only, so a card appended later could never join it. Boards written before this release have no `Review` epic and are unaffected.
* The gate card does not count against `--parallel` while it is in `review`, so a serial run cannot deadlock waiting for remediation cards it has no slot to claim.
* In `final` mode the Review column now holds the gate card rather than staying empty. It is empty only under `none`.
* Breakdown refuses a board with no `Review` epic, except when appending cards to an existing board or recovering one written before this release.

## [2.3.1.0] - 2026-08-27

### Fixed

* Reinstalling on Linux no longer aborts with `chmod: invalid mode`. Before rewriting `CLAUDE.md` or `AGENTS.md`, the installer reads the existing file's permission bits so it can put them back on the replacement, and it asked BSD stat first. GNU stat reads that spelling's `-f` as `--file-system`, so it took the format string as a second path, printed filesystem statistics for the real file, and exited non-zero, which then appended the real mode to that output. `chmod` was handed six lines of block counts and refused. The installer now asks GNU stat first, because BSD stat rejects the GNU spelling cleanly while GNU stat fails messily on the BSD one. Only reinstallation was affected: a first install writes a fixed mode, and the failure stopped before the file was replaced, so no instruction file was corrupted. Failed runs did strand a `CLAUDE.md.qstack-final.XXXXXX` file next to the original, which is safe to delete.

* Neither instruction-file rewrite invents a permission mode any more. The mode is read to carry an existing file's permissions onto its replacement, so a `644` fallback on an unreadable mode would quietly hand a file the user had kept private to every account on the machine. The installer now stops with an explanation, removes its temporary file, and leaves the original alone. What `stat` returns is also checked to be octal rather than trusted, which is what a `stat` failing dirtily looks like from the caller's side.

### Added

* `scripts/test-install-instructions` exercises the installer against a throwaway home under four stat flavours: this machine's, a BSD-only stat, a GNU-only stat, and no working stat at all. Each one covers install, reinstall, a symlinked `CLAUDE.md`, and uninstall, and checks that permissions, hand-written content, and single copies of both qstack blocks survive with no temporary files left behind. The home directory has a space in its name so the installer's quoting stays honest. It runs in CI, where the real GNU stat would have caught this.

## [2.3.0.0] - 2026-08-26

### Added

* Both execution loops now ask how much adversarial review to run before they change execution state or launch an agent. The recommended `final` mode runs one fresh reviewer after the whole board closes, `full` also reviews every card, and `none` relies on validation without launching reviewers. Automation can make the same choice with `--review full|final|none`.

### Changed

* Review mode is recorded in `execution.md` and stays fixed across resumes. Existing execution records without the field keep the former `full` behavior. Invalid, duplicated, conflicting, or weaker-than-required modes stop during read-only preflight without touching the board.

* Cards in `final` and `none` modes now move directly from `in-progress` to `done` after path ownership and validation checks. The Review lane remains visible but stays empty when per-card review is omitted. No-board runs offer one whole-plan review instead of presenting `full` and `final` as different costs.

* Plan adherence review and project reflection now interpret `full`, `final`, `none`, and legacy executions separately, including their required fingerprints, skip records, and valid board transitions.

### Fixed

* Board breakdown guidance now treats blocked cards as still owning their files, matching the execution protocol and preventing another board from planning over unfinished work.

## [2.2.0.0] - 2026-08-26

### Added

* Both execution loops now work a plan board in waves instead of one card at a time. `depends_on` and `files` already said which cards do not need each other, but nothing ever told the loops to use that, so a board of independent cards ran in single file. The loops now claim every ready card whose files nobody else holds, give each one its own subagent, and refill the wave as cards close. `--parallel N` sets the width and `--parallel 1` restores the serial run; the default is four.

* A card's declared `files` are now checked rather than trusted. Before a card can move to `review`, the orchestrator derives the paths it actually wrote from the working tree and compares them against the card's `files`. Running cards side by side rests entirely on that ownership holding, and instructions to a subagent are not concurrency control.

### Changed

* Per-card adversarial reviews now get the diff restricted to that card's `files`, plus the reported path list, rather than the whole working tree. With several cards live at once, a reviewer handed the complete diff reports a sibling card's unfinished work as this card's defect. Plan-level reviews, and every review in a run with no board, still get the complete diff.

* A per-card review fingerprint now covers that card's `files` and only the `execution.md` entries naming that card. The old whole-file scope meant every sibling card's note invalidated every in-flight card review.

### Fixed

* A blocked card now keeps its `files` instead of releasing them. It parks with unfinished edits still in those paths, and handing them to another card gave that card a file carrying half of somebody else's work, which its own scoped review then read as its own.

* A card with an empty `files` array is no longer ready. It reserved nothing, collided with nothing, and gave its reviewer no paths to look at. The board view agrees: an empty-`files` card is flagged rather than badged Ready, and so is a backlog `8`, which the ready set has always refused.

* `files` paths are now normalised before the ownership check. The ready set compares strings, so `src/user.ts`, `./src/user.ts`, a symlink to it, and `src/User.ts` on a case-insensitive checkout read as four cards on four files when they are one. The breakdown rejects directory paths and unnormalised spellings.

## [2.1.0.0] - 2026-08-24

### Added

* `/qstack-plan-to-html` now converts a plan straight from the conversation, with no Markdown draft on disk. It extracts the plan, shows you what it captured, and renders only after you confirm. Anything discussed but never settled becomes an `open` clause instead of a decision the agent makes for you.

### Changed

* Rewrote `README.md` around what the project helps with, grouped the 23 skills into plan lifecycle, project reflection, engineering practice, and writing, and documented the Node requirement that board-event validation has always had.

## [2.0.0.2] - 2026-08-24

### Fixed

* The Skills workflow now validates CLI discovery without treating a skills.sh install as a publishing API or failing `main` when the external catalog has not indexed the repository.

## [2.0.0.1] - 2026-08-24

### Changed

* Every validated release now requests fresh QStack snapshots from skills.sh and fails CI if any published skill stays stale. Maintainers can also retry publication manually from `main`.

## [2.0.0.0] - 2026-08-24

### Breaking changes

* Execution boards now load from static plan files.
* `qstack-plan-close` no longer promotes lessons into `CLAUDE.md`. Plan-specific lessons stay in `outcome.md`, while rules that should bind every task belong in `qstack-encode-lessons-in-structure`.
* `qstack-unyap` has been replaced by `qstack-be-concise`; use `qstack-unslop` for a dedicated human-writing rewrite.
* Releases now use a four-part `MAJOR.MINOR.PATCH.MICRO` identifier. Each shipping branch claims its version before landing instead of waiting for a generated release PR.

### Added

* Added PStack-inspired engineering skills.
* Added selective skill invocation policies.
* Added the execution board to the plan lifecycle, including implementation ladders and visible dependencies.
* Added `qstack-next` and automatic skill recommendations.
* Added a queue-aware version allocator that reads open pull requests and existing sibling worktrees before claiming a version.
* Added CI gates for version advancement, changelog alignment, collision detection, and version-prefixed pull request titles.

### Changed

* Removed Release Please. `version.txt` and `CHANGELOG.md` are now branch-owned release artifacts written before merge.
* Removed every literal em dash from repository text.

## 1.0.0 (2026-08-07)


### Features

* add --yes to accept every optional collection unprompted ([#13](https://github.com/hani-q/qstack/issues/13)) ([24fea2d](https://github.com/hani-q/qstack/commit/24fea2d80628cb0bd11cc66508eacdbf01a3dbba))
* add plan adherence review skill ([#9](https://github.com/hani-q/qstack/issues/9)) ([ada1781](https://github.com/hani-q/qstack/commit/ada178143a7edd171ec09bddee172e1740fdd20a))
* add qstack-reflect skill ([#12](https://github.com/hani-q/qstack/issues/12)) ([edd1067](https://github.com/hani-q/qstack/commit/edd1067c8ca1e3215bdfbd80f7dd77b2033ad08a))
* enforce release-compatible pull requests ([6efd715](https://github.com/hani-q/qstack/commit/6efd715b587f5937b2c01f1be963f0812d728c4f))
* offer optional skill collections during install ([#11](https://github.com/hani-q/qstack/issues/11)) ([f30ee35](https://github.com/hani-q/qstack/commit/f30ee35c7a4c3af6e4c28504f53de28c8a4879ab))
* publish qstack on skills.sh ([#6](https://github.com/hani-q/qstack/issues/6)) ([5ff10d5](https://github.com/hani-q/qstack/commit/5ff10d568bddbe389902f1e35eaa9195c7c9a6cc))
* resolve open questions in HTML plans ([#5](https://github.com/hani-q/qstack/issues/5)) ([9ccaafc](https://github.com/hani-q/qstack/commit/9ccaafcc29f7290ed62e207469f479f16511becb))


### Bug Fixes

* install human-review from its source tag so Codex gets it too ([#14](https://github.com/hani-q/qstack/issues/14)) ([79407d0](https://github.com/hani-q/qstack/commit/79407d0bee83edc90fa7e2bb36a252b52924bdc1))
* verify the human-review tag instead of pinning a commit npx cannot fetch ([#15](https://github.com/hani-q/qstack/issues/15)) ([a6b872d](https://github.com/hani-q/qstack/commit/a6b872d3c4fb0fc63329c4143edb36830ff20e4a))
