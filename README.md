# qstack

[![skills.sh](https://skills.sh/b/hani-q/qstack)](https://skills.sh/hani-q/qstack)

Agent skills for planning work, executing it against the plan, and proving the
result. QStack installs 23 skills into Claude Code, Codex, and any harness that
reads `~/.agents/skills`, from one checkout that stays the source of truth.

## What this helps with

Coding agents are good at writing code and bad at everything around it. They
agree with a plan and then quietly build something else. They report success
from a clean compile. They rediscover, on every feature, a decision the team
already made six weeks ago and wrote down.

QStack answers those three failures with skills that leave evidence on disk:

**A plan you can review and cite.** `/qstack-plan-to-html` turns a Markdown
draft, or the chat you just had, into a numbered HTML document: a high-level
half for whoever is approving the work, a low-level half for the agent doing it.
Every clause has a `§` number, so review feedback is "§4.2 is wrong" rather than
"the second bit about caching". The document freezes when execution starts.

**Execution that cannot silently drift.** Both loops work the plan card by card,
keep a running `execution.md`, and ask how much independent adversarial review
to run before they change anything. Pick `/qstack-loop-no-nonsense` when the
plan is the contract, or `/qstack-loop-trequartista` when the agent may adapt as
long as it says so in writing. `/qstack-plan-adherence-review` then scores the
outcome from 0 to 5 against the plan, the execution record, and the actual diff.

**Memory that survives the session.** `/qstack-plan-close` writes what the work
actually cost into `outcome.md`, and `/qstack-plan-prior-art` reads that folder
before the next plan in the same area is drafted. None of it goes into
`CLAUDE.md`. An always-loaded instruction file that grows with every shipped
plan stops being read; a rule strong enough to bind everywhere belongs in a
check, which is what `/qstack-encode-lessons-in-structure` builds.

Alongside the lifecycle there are ten engineering-practice skills, adapted from
Lauren Tan's PStack, that fire on their own when the conversation calls for
them: diagnose before patching, prove the real artifact runs, separate
ownership before reaching for a lock.

The skills are also deliberately conservative about authority. A diagnosis skill
diagnoses; it does not fix, commit, push, or deploy. Read-only skills say so in
their own text.

## The plan lifecycle

```
plan.md, or just the chat    a written draft, or the shape you talked through
        ↓
/qstack-plan-to-html          prior art, render, ask the open questions, cut the board
        ↓                     (plan.html is authoritative from here; no Markdown is maintained)
/qstack-loop-no-nonsense      choose review depth, work the cards,
/qstack-loop-trequartista     keep execution.md current
        ↓
/qstack-plan-adherence-review score the result against the plan, 0 to 5
        ↓
/qstack-plan-close            write outcome.md, stand the board down
        ↓
                              the next plan's prior-art pass reads all of it
```

**You do not need a draft file.** If you would rather talk the work through with
the agent than write Markdown first, do that and run `/qstack-plan-to-html`
straight after. It extracts the plan from the conversation, shows you what it
captured, and renders only once you confirm. Anything you discussed but never
settled lands as an `open` clause rather than a decision the agent made for you.
A Markdown draft still works, and `/qstack-plan-prior-art` still runs standalone
before either.

The conversion is one command. `/qstack-plan-to-html` reads the prior art,
renders the document, runs `/qstack-ask-plan-open-questions` against the
authoritative HTML so material decisions are settled and recorded before anyone
starts, then breaks the frozen plan into board cards with points and
dependencies. It never re-renders a plan that already exists, and it adds a
board to an HTML plan that lacks one.

Boards are a static `board-events.js` beside the plan, so `plan.html#board`
works from disk with no server. `/qstack-serve-plans` adds a stable localhost
URL when you want one.

Either loop then works that board in waves rather than one card at a time. The
`depends_on` and `files` on each card say which cards do not need each other, so
the loop claims every ready card whose files nobody else holds, gives each one
its own subagent, and isolates each card's writes and validation. Four
cards at once by default. Use `--parallel N` to change it, or `--parallel 1` for
the old serial run.

Before a new board execution starts, the loop asks for `final` review, `full`
review, or `none`. `final`, the recommended choice, launches one fresh reviewer
after all cards close. `full` also reviews every card against its own diff.
`none` relies on validation and launches no reviewer. Without a board, the
question combines `final` and `full` into one whole-plan-review choice because
their cost is identical. Plan or repository review requirements remove any
weaker choices. The Review board column remains visible and stays empty when
per-card review is omitted. For automation, `--review full|final|none` supplies
the mode without a prompt and is rejected when it violates those requirements.

## Skills

Automatic skills are offered by the agent when the description matches what you
are doing. Explicit skills run only when you type them.

### Plan lifecycle

| Skill | Invocation | Purpose |
| --- | --- | --- |
| [`qstack-plan-prior-art`](skills/qstack-plan-prior-art/) | Automatic | Rank earlier plans by overlap with what you are about to write, then report what was decided, deferred, learned, and superseded, plus live board cards touching the same files. Writes nothing. |
| [`qstack-plan-to-html`](skills/qstack-plan-to-html/) | Explicit | Render a plan as a numbered HLD/LLD document, resolve its open questions, and break it into the cards of its execution board. Takes a Markdown draft or the working agreement reached in the conversation. |
| [`qstack-ask-plan-open-questions`](skills/qstack-ask-plan-open-questions/) | Automatic | Ask the questions whose answers change what gets built, one at a time in plain language, and write each decision and its consequences straight into the plan. |
| [`qstack-loop-no-nonsense`](skills/qstack-loop-no-nonsense/) | Explicit | Execute the plan exactly. Stop before any deviation, keep `execution.md` current, and ask how much adversarial review to run. |
| [`qstack-loop-trequartista`](skills/qstack-loop-trequartista/) | Explicit | Execute the plan with controlled creative freedom. Preserve its intent, record every adaptation, and ask the same review-depth question. |
| [`qstack-plan-adherence-review`](skills/qstack-plan-adherence-review/) | Automatic | Build a requirement-to-evidence matrix from the plan, the execution record, and the real diff, then assign a guarded 0 to 5 adherence score. Report-only. |
| [`qstack-plan-close`](skills/qstack-plan-close/) | Explicit | Fold the board, check nothing is still claimed or in flight, and write `outcome.md`: the delta between the plan and what actually happened. |
| [`qstack-serve-plans`](skills/qstack-serve-plans/) | Explicit | Serve this repository's plan collection over HTTP, asking for the bind address and port instead of guessing your network exposure. |

### Project reflection

| Skill | Invocation | Purpose |
| --- | --- | --- |
| [`qstack-reflect`](skills/qstack-reflect/) | Automatic | Report how the project is actually being worked, across every worktree Git tracks: branch topology, momentum, rework, instruction churn, plan-record completeness. Every finding is a count you can reproduce; a category without evidence is refused, not padded. Takes plan directories, as in `/qstack-reflect docs/rfcs`. |
| [`qstack`](skills/qstack/) | Explicit | List every installed QStack skill and optional collection, read from disk on each run, then recommend what to run next. |
| [`qstack-next`](skills/qstack-next/) | Automatic | Say what was just done, what that leaves undone, and the one skill that closes the gap. Three or four lines. Names the skill; never runs it. |

### Engineering practice

Adapted from PStack. These carry no plan-folder dependency and work in any repo.

| Skill | Invocation | Purpose |
| --- | --- | --- |
| [`qstack-fix-root-causes`](skills/qstack-fix-root-causes/) | Automatic | Reproduce the failure and follow the causal chain until direct evidence supports the root cause. Rejects nil guards that only silence a crash. Diagnosis does not authorize the fix. |
| [`qstack-prove-it-works`](skills/qstack-prove-it-works/) | Automatic | Run the real artifact from input through every boundary to output. A clean compile, a fresh timestamp, and an agent's summary are not proof. |
| [`qstack-blast-radius`](skills/qstack-blast-radius/) | Automatic | Name the one fact the change is safe because of, then prove it with real code or mark it unproven. Follows effects past direct callers into pinned dependency source, wire formats, persisted data, and generated artifacts. |
| [`qstack-how`](skills/qstack-how/) | Automatic | Explain a subsystem from its real runtime flow, ownership, and boundaries. Critiques architecture only when you ask for it. Read-only. |
| [`qstack-model-the-domain`](skills/qstack-model-the-domain/) | Automatic | Replace synchronized booleans, repeated validation, and ever-growing branches with the smallest structure that makes the invalid state unrepresentable. |
| [`qstack-separate-before-serializing-shared-state`](skills/qstack-separate-before-serializing-shared-state/) | Automatic | Remove the shared write target before adding a lock. Serialize only when one canonical writer is a genuine domain invariant. |
| [`qstack-make-operations-idempotent`](skills/qstack-make-operations-idempotent/) | Automatic | Model a crash after every mutation point and the rerun from each partial state, so retries and restarts converge instead of merely not erroring. |
| [`qstack-encode-lessons-in-structure`](skills/qstack-encode-lessons-in-structure/) | Automatic | Turn a recurring correction into the strongest practical guardrail: an unrepresentable state, a CI check, one canonical helper. Prose is the last resort, not the first. |
| [`qstack-foundational-thinking`](skills/qstack-foundational-thinking/) | Explicit | Settle data shape, access paths, ownership, concurrency, and shared setup before feature logic, without deciding more than current requirements justify. |
| [`qstack-build-the-lever`](skills/qstack-build-the-lever/) | Explicit | For work that is more than a couple of obvious edits, build the smallest rerunnable tool that performs or proves it. A tool, not a framework. |

### Writing

| Skill | Invocation | Purpose |
| --- | --- | --- |
| [`qstack-be-concise`](skills/qstack-be-concise/) | Automatic | Rewrite the previous answer in far fewer lines and plainer language. Takes a target, as in `/qstack-be-concise 4`. |
| [`qstack-unslop`](skills/qstack-unslop/) | Explicit | Strip AI writing patterns from the previous answer and restore a human voice, without losing meaning, detail, or technical accuracy. |

## Install

```bash
git clone https://github.com/hani-q/qstack.git ~/work/code/qstack
cd ~/work/code/qstack && ./install
```

Restart your agent afterwards.

Or through the [skills.sh](https://skills.sh) CLI, which supports more than 70
agents:

```bash
npx skills add hani-q/qstack                              # everything
npx skills add hani-q/qstack --list                       # look first
npx skills add hani-q/qstack --skill qstack-plan-to-html  # just one
```

`./install` links every skill into each harness it finds and skips the ones that
are absent:

| Harness | Skill directory | User-wide instructions |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `~/.claude/CLAUDE.md` |
| Codex | `~/.codex/skills/` | `~/.codex/AGENTS.md` |
| generic `agents` (Cline, Warp, Zed, ...) | `~/.agents/skills/` | N/A |

Those paths match the ones the skills.sh CLI uses, so the two installers agree.

The installer also maintains a `## General instructions` section and a small
`## qstack` routing section in the user-wide instruction files, both wrapped in
HTML comment markers. Re-running replaces only the marked block and preserves
every other line. `./install --version` prints the release and the exact source
revision.

### Requirements

Bash and Python 3 for the plan renderer, the local plan server, and the
`/qstack` listing. Node for board-event validation, which every skill that reads
a board runs as `node --check` before trusting it. Git throughout;
`/qstack-reflect` needs a Git repository and says so rather than guessing.

`full` and `final` loop runs need a host that can launch a fresh, independent
review agent. A `none` run does not. When the selected mode requires an agent
and the host has none, the loop stops before claiming completion instead of
reviewing its own work.

### Flags

| Flag | Effect |
| --- | --- |
| *(none)* | Symlink each skill in. `git pull` then updates every harness at once. |
| `--copy` | Copy instead, for a harness that will not follow a link or a machine where this checkout is temporary. Needs a re-run after every pull. |
| `--dry-run` | Print what would happen, change nothing. |
| `--with-matt-pocock` | Install [Matt Pocock's skills](https://github.com/mattpocock/skills) without asking. |
| `--without-matt-pocock` | Skip that prompt. |
| `--with-human-review` | Install [human-review](https://github.com/petergyang/human-review) without asking. |
| `--without-human-review` | Skip that prompt. |
| `--yes`, `-y` | Accept every optional collection without prompting. A later `--without-...` still wins, so `--yes --without-human-review` takes only the rest. |
| `--uninstall` | Remove the linked skills and both qstack-managed instruction sections. |
| `--version` | Print the release version and exact Git revision. |

Link installs must run from the repository's primary Git worktree, because
user-global symlinks into a disposable worktree break when it is removed. The
installer refuses and prints the right path. `--copy` works from anywhere.

Re-running is safe, and the installer never deletes an entry it did not create:
a `qstack-<name>` directory it did not install is reported and left alone.
Symlink installs carry a hidden marker recording the exact target, so uninstall
can still identify them if this checkout later moves or disappears.

### Optional collections

An interactive install offers each one separately and defaults to yes, so a bare
Enter takes the recommended set. Both need `npx`.

| Collection | What it adds |
| --- | --- |
| [Matt Pocock's skills](https://github.com/mattpocock/skills) | A broad general-purpose skill library, installed through the `skills` CLI. |
| [human-review](https://github.com/petergyang/human-review) | Opens an HTML file, a Markdown file, or a localhost page in the browser so you can edit the text and comment on specific parts, then sends the batch back to the agent. It closes the loop `/qstack-plan-to-html` opens: a rendered plan becomes something you redline directly instead of describing in chat. Needs Node 20+. |

Each is installed by running its own upstream installer, so both stay owned
upstream. QStack does not update or uninstall them.

Two things worth knowing about `human-review`. QStack installs it from source
tag `v0.5.0` rather than npm, because the published release only installs a
Claude Code skill while Codex and `~/.agents` support exists in the tagged
source and has never been published. npx cannot install a git dependency by
commit SHA, so QStack clones the repository, checks out the reviewed commit,
verifies `HEAD` matches, and runs the installer from there, binding what runs to
a commit rather than a movable tag. Separately, its installer writes into
`~/.claude`, `~/.codex`, and `~/.agents` whether or not those harnesses exist,
and the skill it writes tells agents to run `npx -y human-review`, which
resolves to that project's current npm release at the time of use. QStack's own
install only touches directories that are already there.

In the default ask mode a non-interactive invocation installs neither, so a
piped or scripted install never pulls third-party code on a silent default. Pass
`--with-...` for one or `--yes` for all; that flag keeps working as collections
are added. Dry-run and uninstall never prompt. If one optional install fails the
other is still attempted, and the installer exits non-zero.

## Layout

This repo is the single source of truth. The harnesses hold links back to it, so
there is no second copy to drift.

```
qstack/                              ← this repo, anywhere on disk
├── GENERAL_INSTRUCTIONS.md          ← shared Claude/Codex behavior and writing source
├── install
├── scripts/
│   ├── qstack-version               ← allocate, write, and validate branch versions
│   ├── test-versioning              ← collision and retry regression tests
│   ├── validate-board-fold          ← board event stream folding rules
│   ├── validate-skill-invocation    ← Claude/Codex policy parity + portable validation
│   └── validate-template-sync       ← keeps the two template copies byte-identical
└── skills/                          ← the layout skills.sh discovers
    ├── qstack/SKILL.md
    ├── qstack-next/SKILL.md
    ├── ...                          ← one directory per skill, 23 in total
    ├── qstack-how/
    │   ├── SKILL.md
    │   └── references/              ← exploration, explanation, critique
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

A skill's directory name is its name: it matches the `name:` in its frontmatter,
which is what the agent invokes. Nothing derives or appends a prefix, so there is
one place to rename a skill.

The `qstack-` prefix is deliberate. The ecosystem convention is to namespace by
`owner/repo` and leave names bare, the way Anthropic ships `frontend-design`
rather than `anthropic-frontend-design`. But these directories are shared with
vendored stacks like [gstack](https://github.com/garrytan/gstack) and
[greptile](https://github.com/greptileai/skills), and the prefix is what stops a
`gstack-upgrade` from clobbering them. A worthwhile deviation.

`template/v1` is vendored rather than authored here; its component reference and
house rules live in
[`skills/qstack-plan-to-html/template/v1/README.md`](skills/qstack-plan-to-html/template/v1/README.md).
The skill copies it into the target repo instead of linking, so a rendered plan
keeps working on a machine that has never heard of qstack.

Local changes to the vendored template, tracked so the drift stays visible:

| Change | Files |
| --- | --- |
| `.eli` asides: plain-English explanation behind an ⓘ, revealed on hover, focus, and tap; prints inline as a footnote | `plan.css` §8, `plan.js`, `plan-template.html`, `README.md` |

Upstream is `<repo>/plans/template/v1` in the workspace this was taken from and
does not have these. Port them across before treating either copy as canonical.

## What QStack writes into your project

The renderer creates this structure inside each target repository:

```text
qstack/
├── compound_engineering/plans/
│   ├── .template/v1/
│   └── <feature>/
│       ├── plan.html          ← authoritative, frozen once execution starts
│       ├── board-events.js    ← append-only card events, written during execution
│       ├── execution.md       ← decisions, deviations, progress
│       └── outcome.md         ← written by /qstack-plan-close
└── scripts/
    ├── serve.sh
    └── migrate-board-log
```

No Markdown is maintained after conversion, and none is written when the plan
came from a conversation. Nothing in the cycle
writes to `CLAUDE.md`: what a plan taught stays in its folder, where
`/qstack-plan-prior-art` reads it before the next plan in the same area.

Serve the collection with `./qstack/scripts/serve.sh [port] [bind-address]` or
`/qstack-serve-plans [address] [port]`. The skill asks for anything missing
before starting. Use `127.0.0.1` for local-only access, or choose `0.0.0.0`
explicitly to listen on every interface.

## Adding a skill

```bash
mkdir -p skills/qstack-<name>
$EDITOR skills/qstack-<name>/SKILL.md    # frontmatter: name: qstack-<name>
./install                                # picks it up automatically
```

Any directory under `skills/` holding a `SKILL.md` is a skill; the installer
finds it with no list to maintain. Keep the directory name and the frontmatter
`name:` identical. skills.sh requires `name` and `description`, lowercase with
hyphens.

Every skill also carries an `agents/openai.yaml`, and Claude and Codex use the
same invocation mode. `SKILL.md` owns that choice: omit
`disable-model-invocation` for automatic selection, or set it to `true` for a
manual-only skill. Mirror it with `policy.allow_implicit_invocation: true` or
`false` in `agents/openai.yaml`. CI runs `scripts/validate-skill-invocation` in
the same Python environment as its pinned Agent Skills reference validator: the
script checks parity, validates each `agents/openai.yaml`, and sends a temporary
portable projection through `skills-ref`.

## Releases

`version.txt` is the release source of truth, using `MAJOR.MINOR.PATCH.MICRO` as
a monotonically increasing identifier. Every branch that ships claims a version
and adds its own topmost changelog entry before landing on `main`.

```bash
scripts/qstack-version prepare --bump patch --pretty
```

Use `micro` for docs and tiny internal changes, `patch` for fixes and small
additions, `minor` for substantial new capability, and `major` for breaking
public changes. The command reads open pull requests and existing sibling Git
worktrees, then writes the next free version atomically. It is safe to rerun: an
unclaimed branch version is reused, while a real collision moves to the next free
slot.

Add a `CHANGELOG.md` entry headed `## [MAJOR.MINOR.PATCH.MICRO] - YYYY-MM-DD`
for that branch's user-visible change. Pull request titles keep Conventional
Commit syntax and are automatically prefixed with the version. CI requires the
version to advance past `main`, match the first changelog entry, and stay
unclaimed by every other open pull request. Protect `main` with the
`Version gate` check required and "Require branches to be up to date before
merging" enabled, so a lower claim rechecks after a higher version lands.

The Skills workflow verifies that the official skills.sh CLI discovers all
current skills. skills.sh owns its catalog index and cached snapshots and its
CLI offers no publish or re-index command, so GitHub releases remain the release
history while skills.sh shows whichever snapshot its service has indexed.

## Credits

The ten engineering-practice skills and the writing guidance in
[`GENERAL_INSTRUCTIONS.md`](GENERAL_INSTRUCTIONS.md) adapt Lauren Tan's PStack
at a pinned commit. The implementation ladder both execution loops apply per
card, the design-sheet rule in `plan-to-html`, and the reviewer's
unrequested-code check adapt Dietrich Gebert's Ponytail, also pinned. Source
maps and the complete MIT licenses are in
[Third-party notices](THIRD_PARTY_NOTICES.md).

QStack is MIT licensed. See [LICENSE](LICENSE).
