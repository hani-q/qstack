# AGENTS.md

- Prefer the simplest implementation that fully satisfies current requirements.
  Avoid speculative abstractions, configuration, and indirection.

- Build incrementally in working end-to-end layers. Keep the product functional
  after each meaningful change.

- Remove obsolete internal paths instead of adding compatibility layers.
  Before breaking public APIs, persisted data, file formats, or integrations,
  explicitly assess compatibility and migration requirements.

- Keep concerns clearly separated, but introduce new modules only when they
  create a meaningful boundary.

- Check existing dependencies, documentation, and types before implementing
  functionality yourself or adding another package.

- Prefer established, well-maintained libraries when they reduce total
  complexity or improve reliability.

- Choose designs that meet present needs without creating known architectural
  dead ends. Do not build unused future capabilities.

- `skills/qstack-plan-to-html/template/v1/` and
  `qstack/compound_engineering/plans/.template/v1/` are byte-identical by
  contract, apart from the `fonts/OFL-*.txt` licences. `/qstack-plan-to-html`
  never overwrites an existing copy, so a change to either directory means the
  same change to both. `scripts/validate-template-sync` checks this in CI.

- Use Conventional Commit prefixes for commits and pull request titles: `fix:`
  for patches, `feat:` for minor releases, and `!` or a `BREAKING CHANGE:` footer
  for major releases. QStack squash-merges pull requests, so Release Please reads
  the pull request title as the resulting commit subject. Use non-releasing
  prefixes such as `docs:`, `test:`, or `chore:` when no release is warranted.

- Do not edit `version.txt`, `.release-please-manifest.json`, or generated
  changelog entries manually. Release Please owns release versioning.
