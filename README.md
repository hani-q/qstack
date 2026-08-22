# qstack

[![skills.sh](https://skills.sh/b/hani-q/qstack)](https://skills.sh/hani-q/qstack)

Personal skill stack — skills I maintain myself, kept separate from vendored
stacks like [gstack](https://github.com/garrytan/gstack) and
[greptile](https://github.com/greptileai/skills) so upgrades to those never
clobber my own work.

## Skills

| Skill | Invocation | Purpose |
| --- | --- | --- |
| [`qstack-plan-prior-art`](skills/qstack-plan-prior-art/) | Automatic | Read the existing compound-engineering plans before a new plan is drafted and report what was already decided, deferred, and learned. |
| [`qstack-plan-to-html`](skills/qstack-plan-to-html/) | Explicit only | Render a markdown plan as a controlled HTML document — HLD half for a PM, LLD half for an execution agent — then break it into the cards of its execution board. Adds a board to a plan that already has HTML and none. |
| [`qstack-ask-plan-open-questions`](skills/qstack-ask-plan-open-questions/) | Automatic | Ask material plan questions one at a time in plain language and write each decision into the authoritative plan. |
| [`qstack-loop-no-nonsense`](skills/qstack-loop-no-nonsense/) | Explicit only | Execute a plan exactly, stopping before any deviation and requiring independent adversarial review. |
| [`qstack-loop-trequartista`](skills/qstack-loop-trequartista/) | Explicit only | Execute a plan with controlled creative freedom, recording adaptations and requiring independent adversarial review. |
| [`qstack-plan-adherence-review`](skills/qstack-plan-adherence-review/) | Automatic | Compare a plan with its execution record and code changes, then assign a guarded 0–5 adherence score. |
| [`qstack-plan-close`](skills/qstack-plan-close/) | Explicit only | Close out an executed plan: write `outcome.md` and close the board. |
| [`qstack-serve-plans`](skills/qstack-serve-plans/) | Explicit only | Serve a repository's QStack plan collection on a local HTTP address. |
| [`qstack-reflect`](skills/qstack-reflect/) | Automatic | Report how a project is actually being worked — workspace topology, momentum, rework, instruction churn — using only counts the reader can reproduce. Accepts plan directories, as in `/qstack-reflect docs/rfcs`, for projects whose plans live anywhere. |
| [`qstack-be-concise`](skills/qstack-be-concise/) | Automatic | Rewrite the previous answer in fewer lines and plain language; accepts an optional line target such as `/qstack-be-concise 4`. |
| [`qstack-unslop`](skills/qstack-unslop/) | Explicit only | Remove AI writing patterns from the previous answer while preserving its meaning, useful detail, and technical accuracy. |
| [`qstack-blast-radius`](skills/qstack-blast-radius/) | Automatic | Find the critical safety fact behind a change, prove it with real code, and mark anything weaker as unproven. |
| [`qstack-separate-before-serializing-shared-state`](skills/qstack-separate-before-serializing-shared-state/) | Automatic | Remove shared mutable ownership before adding locks or sequential access. |
| [`qstack-encode-lessons-in-structure`](skills/qstack-encode-lessons-in-structure/) | Automatic | Turn recurring corrections into the strongest practical structural guardrail. |
| [`qstack-make-operations-idempotent`](skills/qstack-make-operations-idempotent/) | Automatic | Make retries, partial failures, restarts, and stale state converge safely. |
| [`qstack-model-the-domain`](skills/qstack-model-the-domain/) | Automatic | Replace scattered domain assumptions with a fitting structure without forcing abstraction. |
| [`qstack-foundational-thinking`](skills/qstack-foundational-thinking/) | Explicit only | Settle data shape, access, ownership, concurrency, and useful setup before logic. |
| [`qstack-how`](skills/qstack-how/) | Automatic | Explain runtime flow, ownership, files, and non-obvious behavior without changing code. |
| [`qstack-build-the-lever`](skills/qstack-build-the-lever/) | Explicit only | Build the smallest rerunnable tool that makes non-trivial work repeatable and reviewable. |
| [`qstack-fix-root-causes`](skills/qstack-fix-root-causes/) | Automatic | Reproduce and diagnose a failure before proposing or implementing a repair. |
| [`qstack-prove-it-works`](skills/qstack-prove-it-works/) | Automatic | Verify the real artifact and complete feature path instead of trusting a proxy. |

The ten engineering-practice skills above and the writing guidance in
[`GENERAL_INSTRUCTIONS.md`](GENERAL_INSTRUCTIONS.md) are adapted from Lauren
Tan's PStack at a pinned source commit. See
[Third-party notices](THIRD_PARTY_NOTICES.md) for the source map and complete
MIT license.

The plan lifecycle starts with `prior-art`, which reads the existing plans
before a new one is drafted. `plan-to-html` then does the whole conversion in
one command: it renders the document, runs `ask-plan-open-questions` against the
authoritative HTML, and breaks the frozen plan into cards. Either execution loop
works those cards one at a time, `plan-adherence-review` checks the result
independently, and `plan-close` writes what was learned into the plan folder for
the next `prior-art` run.

## Install

```bash
git clone https://github.com/hani-q/qstack.git ~/work/code/qstack
cd ~/work/code/qstack && ./install
```

The installer maintains the same `## General instructions` section at the top
of the user-wide Claude Code and Codex instruction files, plus a small
`## qstack` routing section. The general section includes concise gstack routing;
the host's installed skill catalog remains the command source of truth. Restart
your agent after installation.

Print the installed release and exact source revision with:

```bash
./install --version
```

Or via the [skills.sh](https://skills.sh) CLI, which supports more than 70 agents:

```bash
npx skills add hani-q/qstack
```

List the available skills without installing them:

```bash
npx skills add hani-q/qstack --list
```

Install only one skill with `--skill`, for example:

```bash
npx skills add hani-q/qstack --skill qstack-plan-to-html
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

The plan execution loops require an agent host that can launch a fresh,
independent review agent. They stop before claiming completion when the host
does not provide that capability. The plan renderer and local plan server also
require Bash and Python 3.

| Flag | Effect |
| --- | --- |
| *(none)* | Symlink each skill in. `git pull` then updates every harness at once. |
| `--copy` | Copy instead, for a harness that will not follow a link, or a machine where this checkout is temporary. Needs a re-run after every pull. |
| `--dry-run` | Print what would happen, change nothing. |
| `--with-matt-pocock` | Install [Matt Pocock's skills](https://github.com/mattpocock/skills) globally after QStack, without asking. The upstream installer still lets you select skills and agents. |
| `--without-matt-pocock` | Skip the optional Matt Pocock skills prompt. |
| `--with-human-review` | Install [human-review](https://github.com/petergyang/human-review) globally after QStack, without asking. |
| `--without-human-review` | Skip the optional human-review prompt. |
| `--yes`, `-y` | Accept every optional collection without prompting. A later `--without-…` still wins, so `--yes --without-human-review` takes only the rest. |
| `--uninstall` | Remove the linked skills and both qstack-managed instruction sections. |
| `--version` | Print the release version and exact Git revision. |

### Optional collections

QStack is not only its own skills; it is also a shelf of tools worth having next
to them. An interactive install offers each one separately and defaults to yes,
so a bare Enter takes the recommended set:

| Collection | What it adds |
| --- | --- |
| [Matt Pocock's skills](https://github.com/mattpocock/skills) | A broad general-purpose skill library, installed through the `skills` CLI. |
| [human-review](https://github.com/petergyang/human-review) | Opens an HTML or Markdown file, or a localhost page, in the browser so you can edit the text and comment on specific parts, then sends the whole batch back to the agent. It closes the loop `/qstack-plan-to-html` opens: a rendered plan becomes something you redline directly instead of describing in chat. Needs Node 20+. |

Both need `npx`. Each is installed by running its own upstream installer, so
both stay owned upstream: QStack does not update or uninstall them.

`human-review` is installed from its source tag `v0.5.0` rather than from npm.
Its published release only installs a Claude Code skill; Codex and `~/.agents`
support exists in the tagged source and has never been published, so an install
from npm silently leaves those two harnesses without it. npx cannot install a
git dependency by commit SHA, so QStack clones that repository itself, checks
out the reviewed commit, verifies `HEAD` matches, and runs the installer from
that checkout. What runs is bound to the commit rather than to a tag that could
be moved between being checked and being used. Note that its installer writes into `~/.claude`, `~/.codex` and
`~/.agents` whether or not those harnesses already exist — unlike QStack's own
install, which only touches directories that are already there — and that the
skill it writes tells agents to run `npx -y human-review`, which resolves to
that project's published npm release at the time of use.

In the default ask mode, a non-interactive invocation installs neither, so a
piped or scripted install never pulls third-party code on a silent default. Pass
`--with-…` to opt into one, or `--yes` to take them all — that flag is the whole
answer for an unattended install, and it keeps working as collections are
added. Dry-run and uninstall invocations never prompt.
If one optional install fails, the other is still attempted and the installer
exits non-zero.

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
GitHub Release. Because QStack squash-merges pull requests, the pull request
title must use Conventional Commit syntax; a GitHub Actions check rejects titles
that Release Please cannot parse. Do not update release numbers manually.

## Layout

This repo is the single source of truth; the harnesses hold links back to it, so
there is no second copy to drift.

```
qstack/                              ← this repo, anywhere on disk
├── GENERAL_INSTRUCTIONS.md          ← shared Claude/Codex behavior and writing source
├── install
├── scripts/
│   └── validate-skill-invocation    ← Claude/Codex policy parity + portable validation
└── skills/                          ← the layout skills.sh discovers
    ├── qstack-plan-prior-art/SKILL.md
    ├── qstack-ask-plan-open-questions/SKILL.md
    ├── qstack-plan-close/SKILL.md
    ├── qstack-plan-adherence-review/SKILL.md
    ├── qstack-loop-no-nonsense/SKILL.md
    ├── qstack-loop-trequartista/SKILL.md
    ├── qstack-serve-plans/SKILL.md
    ├── qstack-reflect/SKILL.md
    ├── qstack-be-concise/SKILL.md
    ├── qstack-unslop/SKILL.md
    ├── qstack-blast-radius/SKILL.md
    ├── qstack-separate-before-serializing-shared-state/SKILL.md
    ├── qstack-encode-lessons-in-structure/SKILL.md
    ├── qstack-make-operations-idempotent/SKILL.md
    ├── qstack-model-the-domain/SKILL.md
    ├── qstack-foundational-thinking/SKILL.md
    ├── qstack-how/
    │   ├── SKILL.md
    │   └── references/               ← exploration, explanation, critique
    ├── qstack-build-the-lever/SKILL.md
    ├── qstack-fix-root-causes/SKILL.md
    ├── qstack-prove-it-works/SKILL.md
    └── qstack-plan-to-html/
        ├── SKILL.md
        ├── references/board-breakdown.md   ← epics, cards, points, dependencies
        └── template/v1/             ← "cyanotype & redline" plan template
            ├── board.js  plan.css  plan.js  pretext.js
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

Every skill also has `agents/openai.yaml`, and Claude and Codex use the same
invocation mode. `SKILL.md` owns that choice: omit
`disable-model-invocation` for automatic selection or set it to `true` for a
manual-only skill. Mirror the choice with
`policy.allow_implicit_invocation: true` or `false` in `agents/openai.yaml`.
CI runs `scripts/validate-skill-invocation` in the same Python environment as
its pinned Agent Skills reference validator. The script checks parity, validates
each `agents/openai.yaml`, and sends a temporary portable projection through
`skills-ref`.

## Conventions these skills assume

**Compound engineering.** The renderer creates
`qstack/compound_engineering/plans/<feature>/plan.html`, then asks and records
open decisions directly in that authoritative HTML. The Markdown input is not
maintained. The HTML freezes once work starts, and the same command writes
`board-events.js` beside it. An execution loop maintains that board and
`execution.md` during the work, and `/qstack-plan-close` adds `outcome.md`
afterward.

Nothing in that cycle writes to `CLAUDE.md`. What a plan taught stays in its
folder, where `/qstack-plan-prior-art` reads it before the next plan in the same
area is drafted. A rule strong enough to bind everywhere is not a plan lesson at
all, and `/qstack-encode-lessons-in-structure` turns it into a check that
enforces itself. An always-loaded instruction file that grows with every shipped
plan stops being read.

### Generated project layout

The plan renderer creates this shared structure inside each target repository:

```text
qstack/compound_engineering/plans/
├── .template/v1/
└── <feature>/plan.html
```

The renderer also installs `qstack/scripts/serve.sh` and
`qstack/scripts/migrate-board-log`. During execution and close-out,
`board-events.js`, `execution.md`, and `outcome.md` join `plan.html` in the
feature folder.

The board event stream is a classic script, so `plan.html#board` works when
opened directly from disk as well as over HTTP. Serving adds a stable localhost
URL; it is not required to read the board.

Run `./qstack/scripts/serve.sh [port] [bind-address]` or
`/qstack-serve-plans [address] [port]` to serve
`qstack/compound_engineering/`. The skill asks for any missing address and port
before starting; use `127.0.0.1` for local-only access or explicitly choose
`0.0.0.0` to listen on every interface.
