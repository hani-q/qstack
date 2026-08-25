# Changelog

## [2.2.0.0] - 2026-08-26

### Added

* Both execution loops now work a plan board in waves instead of one card at a time. `depends_on` and `files` already said which cards do not need each other, but nothing ever told the loops to use that, so a board of independent cards ran in single file. The loops now claim every ready card whose files nobody else holds, give each one its own subagent, and refill the wave as cards close. `--parallel N` sets the width and `--parallel 1` restores the serial run; the default is four.

* A card's declared `files` are now checked rather than trusted. Each subagent reports the paths it actually wrote, and the orchestrator compares that list against the card's `files` before the card can move to `review`. Running cards side by side rests entirely on that ownership holding, and instructions to a subagent are not concurrency control.

### Changed

* Per-card adversarial reviews now get the diff restricted to that card's `files`, plus the reported path list, rather than the whole working tree. With several cards live at once, a reviewer handed the complete diff reports a sibling card's unfinished work as this card's defect. Plan-level reviews, and every review in a run with no board, still get the complete diff.

* A per-card review fingerprint now covers that card's `files` and only the `execution.md` entries naming that card. The old whole-file scope meant every sibling card's note invalidated every in-flight card review.

### Fixed

* A card with an empty `files` array is no longer ready. It reserved nothing, collided with nothing, and gave its reviewer no paths to look at. The breakdown now also rejects directory paths in `files`, which the ready set compared as strings and read as disjoint from the files inside them.

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
