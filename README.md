# qstack

Personal skill stack — skills I maintain myself, kept separate from vendored
stacks like [gstack](https://github.com/garrytan/gstack) and
[greptile](https://github.com/greptileai/skills) so upgrades to those never
clobber my own work.

## Skills

| Skill | Purpose |
| --- | --- |
| [`qstack-plan-to-html`](skills/qstack-plan-to-html/) | Render a markdown plan as a controlled HTML document — HLD half for a PM, LLD half for an execution agent. |
| [`qstack-loop-no-nonsense`](skills/qstack-loop-no-nonsense/) | Execute a plan exactly, stopping before any deviation and requiring independent adversarial review. |
| [`qstack-loop-trequartista`](skills/qstack-loop-trequartista/) | Execute a plan with controlled creative freedom, recording adaptations and requiring independent adversarial review. |
| [`qstack-plan-close`](skills/qstack-plan-close/) | Close out an executed plan: write `outcome.md`, promote durable lessons into `CLAUDE.md`. |
| [`qstack-serve-plans`](skills/qstack-serve-plans/) | Serve a repository's QStack plan collection on a local HTTP address. |
| [`qstack-unyap`](skills/qstack-unyap/) | Rewrite the previous answer in fewer lines and plain language; accepts an optional line target such as `/qstack-unyap 4`. |

The plan lifecycle starts with `plan-to-html`, runs through either execution
loop, and ends with `plan-close`, when what was learned needs to outlive the
session.

## Install

```bash
git clone https://github.com/hani-q/qstack.git ~/work/code/qstack
cd ~/work/code/qstack && ./install
```

The installer also maintains a small `## qstack` routing section in the user-wide
Claude Code and Codex instruction files. Restart your agent after installation.

Print the installed release and exact source revision with:

```bash
./install --version
```

Or, once this repo is public, via the [skills.sh](https://skills.sh) CLI, which
knows ~70 agents:

```bash
npx skills add hani-q/qstack
```

`./install` links every skill into each harness it finds on the machine, and
skips the ones that are not there:

| Harness | Skill directory | User-wide instructions |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `~/.claude/CLAUDE.md` |
| Codex | `~/.codex/skills/` | `~/.codex/AGENTS.md` |
| generic `agents` (Cline, Warp, Zed, …) | `~/.agents/skills/` | — |

Those paths match the ones the skills.sh CLI uses, so the two installers agree
and neither surprises the other.

| Flag | Effect |
| --- | --- |
| *(none)* | Symlink each skill in. `git pull` then updates every harness at once. |
| `--copy` | Copy instead, for a harness that will not follow a link, or a machine where this checkout is temporary. Needs a re-run after every pull. |
| `--dry-run` | Print what would happen, change nothing. |
| `--uninstall` | Remove the linked skills and qstack-managed instruction sections. |
| `--version` | Print the release version and exact Git revision. |

Because the default install creates user-global symlinks, it must be run from
the repository's primary Git worktree. The installer refuses to link from a
linked worktree (including a disposable Conductor workspace) and prints the
primary worktree path to use instead. `--copy` remains available from linked
worktrees because its installed files do not depend on that worktree surviving.

It is safe to re-run, and it never deletes an entry it did not create — a
`qstack-<name>` directory that qstack did not install is reported and left alone.
Symlink installs carry a hidden marker recording the exact target QStack linked,
so uninstall can still identify them if that checkout later moves or disappears
without trusting a user-replaced link.
The instruction sections use HTML comment markers; re-running replaces only the
marked block and preserves every other line in the file.

## Releases

QStack follows Semantic Versioning and uses Release Please on `main`. Write
Conventional Commit messages so the release level is derived automatically:

- `fix:` creates a patch release.
- `feat:` creates a minor release.
- `feat!:` or a `BREAKING CHANGE:` footer creates a major release.

Release Please maintains a release pull request containing `version.txt` and
`CHANGELOG.md`. Merging that pull request creates the matching `vX.Y.Z` tag and
GitHub Release. Do not update release numbers manually.

## Layout

This repo is the single source of truth; the harnesses hold links back to it, so
there is no second copy to drift.

```
qstack/                              ← this repo, anywhere on disk
├── install
└── skills/                          ← the layout skills.sh discovers
    ├── qstack-plan-close/SKILL.md
    ├── qstack-loop-no-nonsense/SKILL.md
    ├── qstack-loop-trequartista/SKILL.md
    ├── qstack-serve-plans/SKILL.md
    ├── qstack-unyap/SKILL.md
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

**Compound engineering.** The renderer creates
`qstack/compound_engineering/plans/<feature>/plan.html`, frozen once work
starts. An execution loop maintains `execution.md` during the work, and
`/qstack-plan-close` adds `outcome.md` afterward.

The point is the promotion step. `CLAUDE.md` holds only rules an agent would
**break something** without; everything else stays in the plan folder, loaded on
demand. Without that split, either the always-on context bloats until the real
invariants drown, or the hard-won detail evaporates when the session ends.

### Generated project layout

The plan renderer creates this shared structure inside each target repository:

```text
qstack/compound_engineering/plans/
├── .template/v1/
└── <feature>/plan.html
```

The renderer also installs `qstack/scripts/serve.sh`. During execution and
close-out, `execution.md` and `outcome.md` join `plan.html` in the feature
folder.

Run `./qstack/scripts/serve.sh [port] [bind-address]` or
`/qstack-serve-plans [address] [port]` to serve
`qstack/compound_engineering/`. The skill asks for any missing address and port
before starting; use `127.0.0.1` for local-only access or explicitly choose
`0.0.0.0` to listen on every interface.
