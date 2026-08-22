# Changelog

## [2.0.0](https://github.com/hani-q/qstack/compare/v1.0.0...v2.0.0) (2026-08-22)


### ⚠ BREAKING CHANGES

* load execution boards from static plans
* `qstack-plan-close` no longer promotes lessons into `CLAUDE.md`. What a plan taught stays in `outcome.md`, where `qstack-plan-prior-art` reads it before the next plan in the same area. A rule strong enough to bind everywhere goes to `qstack-encode-lessons-in-structure` instead. An always-loaded instruction file that grows with every shipped plan stops being read.
* qstack-unyap is replaced by qstack-be-concise; use qstack-unslop for the dedicated human-writing rewrite.

### Features

* add PStack-inspired engineering skills ([#18](https://github.com/hani-q/qstack/issues/18)) ([74ac36b](https://github.com/hani-q/qstack/commit/74ac36b7353eae5154c911ef07e34f1618b03aee))
* add selective skill invocation policies ([#16](https://github.com/hani-q/qstack/issues/16)) ([9a3ecaa](https://github.com/hani-q/qstack/commit/9a3ecaac0bbcc47f70f70e57a12b589edf430e06))
* add the execution board to the plan lifecycle ([#20](https://github.com/hani-q/qstack/issues/20)) ([d4fabfd](https://github.com/hani-q/qstack/commit/d4fabfd3b67cfa5b95e8976149047ee21db23243))
* load execution boards from static plans ([9618b09](https://github.com/hani-q/qstack/commit/9618b090c8f939f526e51219a2ddbfcc2dabf04c))
* replace unyap with concise and unslop commands ([#19](https://github.com/hani-q/qstack/issues/19)) ([3a5bf7a](https://github.com/hani-q/qstack/commit/3a5bf7aeaba81431aff805aaa3970cf8bfe15ac0))

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

## Changelog

Release Please maintains this file from Conventional Commit messages.
