# qstack

Personal skill stack — skills I maintain myself, kept separate from vendored
stacks like [gstack](https://github.com/garrytan/gstack) and
[greptile](https://github.com/greptileai/skills) so upgrades to those never
clobber my own work.

## Skills

| Skill | Purpose |
| --- | --- |
| [`plan-to-html`](plan-to-html/) | Render a markdown plan as a controlled HTML document — HLD half for a PM, LLD half for an execution agent. |
| [`plan-close`](plan-close/) | Close out an executed plan: write `outcome.md`, promote durable lessons into `CLAUDE.md`. |

Together they bracket a piece of work: `plan-to-html` at the start, when the
design needs to be read and approved; `plan-close` at the end, when what was
learned needs to outlive the session.

## Install

```bash
git clone https://github.com/hani-q/qstack.git ~/work/code/qstack
cd ~/work/code/qstack && ./install
```

Then restart your agent. That is the whole setup.

`./install` links every skill into each harness it finds on the machine, and
skips the ones that are not there:

| Harness | Skill directory |
| --- | --- |
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.codex/skills/` |
| generic `agents` | `~/.agents/skills/` |

| Flag | Effect |
| --- | --- |
| *(none)* | Symlink each skill in. `git pull` then updates every harness at once. |
| `--copy` | Copy instead, for a harness that will not follow a link, or a machine where this checkout is temporary. Needs a re-run after every pull. |
| `--dry-run` | Print what would happen, change nothing. |
| `--uninstall` | Remove what the installer added. |

It is safe to re-run, and it never deletes an entry it did not create — a
`qstack-<name>` directory that qstack did not install is reported and left alone.

## Layout

This repo is the single source of truth; the harnesses hold links back to it, so
there is no second copy to drift.

```
qstack/                            ← this repo, anywhere on disk
├── install
├── plan-close/SKILL.md
└── plan-to-html/
    ├── SKILL.md
    └── template/v1/               ← "cyanotype & redline" plan template
        ├── plan.css  plan.js  pretext.js
        ├── plan-template.html
        └── fonts/                 ← self-hosted woff2, offline-safe

~/.claude/skills/qstack-<name> ┐
~/.codex/skills/qstack-<name>  ├─ symlinks → qstack/<name>
~/.agents/skills/qstack-<name> ┘
```

The `qstack-` prefix is deliberate: it keeps these distinct from the vendored
stacks sharing those directories, so a `gstack-upgrade` can never clobber them.

`template/v1` is vendored, not authored here — its component reference and house
rules are in [`plan-to-html/template/v1/README.md`](plan-to-html/template/v1/README.md).
`plan-to-html` copies it into the target repo rather than linking to it, so a
rendered plan keeps working on a machine that has never heard of qstack.

### Local changes to the vendored template

Tracked here so the drift from upstream stays visible:

| Change | Files |
| --- | --- |
| **`.eli` asides** — plain-English explanation behind an ⓘ, revealed on hover, focus and tap; prints inline as a footnote | `plan.css` §8, `plan.js`, `plan-template.html`, `README.md` |

Upstream is `<repo>/plans/template/v1` in the workspace this was taken from; it
does not have these. Port them across before treating either copy as canonical.

## Adding a skill

```bash
mkdir -p <name>
$EDITOR <name>/SKILL.md    # frontmatter: name: qstack-<name>
./install                  # picks it up automatically
```

Any top-level directory holding a `SKILL.md` is a skill — the installer finds it
with no list to maintain. Frontmatter `name:` must be `qstack-<name>`; that is
what the agent invokes.

## Conventions these skills assume

**Compound engineering.** Substantial work leaves three artifacts in
`compound-engineering/plans/<feature>/`: `plan.md` (before, frozen once work
starts), `implementation-notes.md` (during, written live), `outcome.md` (after,
written by `/qstack-plan-close`).

The point is the promotion step. `CLAUDE.md` holds only rules an agent would
**break something** without; everything else stays in the plan folder, loaded on
demand. Without that split, either the always-on context bloats until the real
invariants drown, or the hard-won detail evaporates when the session ends.
