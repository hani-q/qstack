# AGENTS.md

- Prefer the simplest implementation that fully satisfies current requirements.
  Avoid speculative abstractions, configuration, and indirection, but do not
  create known architectural dead ends. Introduce new modules only when they
  create a meaningful boundary.

- Build incrementally in working end-to-end layers. Keep the product functional
  after each meaningful change.

- Remove obsolete internal paths instead of adding compatibility layers.
  Before breaking public APIs, persisted data, file formats, or integrations,
  explicitly assess compatibility and migration requirements.

- Check existing dependencies, documentation, and types before implementing
  functionality yourself or adding another package. Prefer established,
  well-maintained libraries when they reduce total complexity or improve
  reliability.

- `skills/qstack-plan-to-html/template/v1/` and
  `qstack/compound_engineering/plans/.template/v1/` are byte-identical by
  contract, apart from the `fonts/OFL-*.txt` licences. Changes to either
  directory mean the same change to both. `scripts/validate-template-sync`
  checks this in CI.

- Every branch that lands on `main` owns one version claim and one topmost
  `CHANGELOG.md` entry. Run `scripts/qstack-version prepare --bump <level>`
  before shipping, where `<level>` is `major`, `minor`, `patch`, or `micro`.

- `version.txt` uses `MAJOR.MINOR.PATCH.MICRO` and is the release source of
  truth. Do not hand-edit it. Pull request titles keep Conventional Commit
  syntax; CI prefixes them with the version from `version.txt`.

- Use `micro` for docs and tiny internal changes, `patch` for fixes and small
  additions, `minor` for substantial new capability, and `major` for breaking
  public changes.
