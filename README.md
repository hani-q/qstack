# qstack

Personal skill stack — skills I maintain myself, kept separate from vendored
stacks like [gstack](https://github.com/garrytan/gstack) and
[greptile](https://github.com/greptileai/skills) so upgrades to those never
clobber my own work.

## Skills

| Skill | Purpose |
| --- | --- |
| [`qstack-plan-to-html`](skills/qstack-plan-to-html/) | Render a markdown plan as a controlled HTML document — HLD half for a PM, LLD half for an execution agent. |
| [`qstack-plan-close`](skills/qstack-plan-close/) | Close out an executed plan: write `outcome.md`, promote durable lessons into `CLAUDE.md`. |

Together they bracket a piece of work: `plan-to-html` at the start, when the
design needs to be read and approved; `plan-close` at the end, when what was
learned needs to outlive the session.

## Install

```bash
git clone https://github.com/hani-q/qstack.git ~/work/code/qstack
cd ~/work/code/qstack && ./install
```

Then restart your agent. That is the whole setup.

Or, once this repo is public, via the [skills.sh](https://skills.sh) CLI, which
knows ~70 agents:

```bash
npx skills add hani-q/qstack
```

`./install` links every skill into each harness it finds on the machine, and
skips the ones that are not there:

| Harness | Skill directory |
| --- | --- |
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.codex/skills/` |
| generic `agents` (Cline, Warp, Zed, …) | `~/.agents/skills/` |

Those paths match the ones the skills.sh CLI uses, so the two installers agree
and neither surprises the other.

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
qstack/                              ← this repo, anywhere on disk
├── install
└── skills/                          ← the layout skills.sh discovers
    ├── qstack-plan-close/SKILL.md
    └── qstack-plan-to-html/
        ├── SKILL.md
        └── template/v1/             ← "cyanotype & redline" plan template
            ├── plan.css  plan.js  pretext.js
            ├── plan-template.html
            └── fonts/               ← self-hosted woff2, offline-safe

~/.claude/skills/qstack-<name> ┐
~/.codex/skills/qstack-<name>  ├─ symlinks → qstack/skills/qstack-<name>
~/.agents/skills/qstack-<name> ┘
```

**A skill's directory name is its name** — it matches the `name:` in its
frontmatter, which is what the agent invokes. Nothing derives or appends a
prefix, so there is one place to rename a skill.

The `qstack-` prefix is deliberate. The ecosystem convention is to namespace by
`owner/repo` and leave names bare (Anthropic ships `frontend-design`, not
`anthropic-frontend-design`), but these directories are shared with vendored
stacks — the prefix is what stops a `gstack-upgrade` from clobbering them. A
worthwhile deviation.

`template/v1` is vendored, not authored here — its component reference and house
rules are in
[`skills/qstack-plan-to-html/template/v1/README.md`](skills/qstack-plan-to-html/template/v1/README.md).
The skill copies it into the target repo rather than linking to it, so a rendered
plan keeps working on a machine that has never heard of qstack.

### Local changes to the vendored template

Tracked here so the drift from upstream stays visible:

| Change | Files |
| --- | --- |
| **`.eli` asides** — plain-English explanation behind an ⓘ, revealed on hover, focus and tap; prints inline as a footnote | `plan.css` §8, `plan.js`, `plan-template.html`, `README.md` |

Upstream is `<repo>/plans/template/v1` in the workspace this was taken from; it
does not have these. Port them across before treating either copy as canonical.

## Adding a skill

```bash
mkdir -p skills/qstack-<name>
$EDITOR skills/qstack-<name>/SKILL.md    # frontmatter: name: qstack-<name>
./install                                # picks it up automatically
```

Any directory under `skills/` holding a `SKILL.md` is a skill — the installer
finds it with no list to maintain. Keep the directory name and the frontmatter
`name:` identical; skills.sh requires `name` and `description`, lowercase with
hyphens.

## Conventions these skills assume

**Compound engineering.** Substantial work leaves three artifacts in
`compound-engineering/plans/<feature>/`: `plan.md` (before, frozen once work
starts), `implementation-notes.md` (during, written live), `outcome.md` (after,
written by `/qstack-plan-close`).

The point is the promotion step. `CLAUDE.md` holds only rules an agent would
**break something** without; everything else stays in the plan folder, loaded on
demand. Without that split, either the always-on context bloats until the real
invariants drown, or the hard-won detail evaporates when the session ends.
