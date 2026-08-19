# Execution

- Plan: `qstack/compound_engineering/plans/qstack-skill-expansion/plan.html`
- Mode: no-nonsense
- Status: complete
- Started: 2026-08-19
- Updated: 2026-08-19

## Progress

- [x] Freeze and verify QStack, Gaia, PStack, global-instruction, and release-file baselines.
- [x] Read all ten pinned PStack sources and referenced support files; record the adaptation contracts.
- [x] Add exactly ten QStack skill directories with the approved invocation modes and Codex metadata.
- [x] Add attribution, README catalog entries, and installer instruction pointers without changing discovery.
- [x] Pass repository validation in the approved disposable Python environment before global writes.
- [x] Superseded revision 1 step: insert and byte-verify the exact pinned Unslop block in both global instruction files.
- [x] Dry-run and install QStack with both optional collections disabled; verify thirty primary-checkout links.
- [x] Repeat all release gates and baseline checks.
- [x] Apply the user-approved revision 2 amendment for one shared general-instructions source.
- [x] Add the canonical general instructions, update installer ownership, and migrate both global files.
- [x] Repeat the amended repository, global, installer, and baseline gates.
- Review gate: the final fingerprint and outcome are recorded in the append-only Adversarial reviews section below.

## Design decisions

- The user's explicit approval changed the authoritative plan from Draft to Approved before this execution record was created.
- The previously verified PStack checkout is no longer present locally. Recreate a temporary read-only snapshot under `.context/` from the canonical source repository at the exact pinned commit; this preserves the plan's source-only boundary.
- Keep each new skill self-contained and host-neutral. `qstack-how` alone retains conditional reference files because its explain, exploration, and critique branches contain substantial distinct guidance.
- Treat idempotent convergence as equality of domain invariants rather than byte identity unless the domain requires identical generated values.
- During analysis-only work, use existing tests or inline read-only probes and create no proof file. When proof-file writes are authorized, keep incidental scripts temporary unless a durable artifact was requested. Prefer an honest unproven result over unauthorized, destructive, or production-mutating verification.
- The installer forbids durable links from a Conductor linked worktree. Before installation, mirror the exact uncommitted repository tree into the verified-clean primary QStack checkout, compare temporary-index tree hashes, and run the installer there. This gives all harnesses permanent primary-checkout targets without creating a commit.
- Revision 2 uses root `GENERAL_INSTRUCTIONS.md` as the single source for both global files. It keeps one top-level General instructions section, folds Agent behavior into the adapted writing rules, and uses a concise gstack pointer instead of a copied command catalog because Codex already receives its installed skill catalog dynamically.

## Deviations

- Approved 2026-08-19: after revision 1 implementation and the first adversarial review, the user explicitly directed “change the plan.” Revision 2 replaces the frozen plan's exact global Unslop copies with one QStack-owned general-instructions source, harmonizes Agent behavior with the writing rules, and synchronizes concise gstack routing across Claude and Codex. No skill-directory or publication scope changed.

## Tradeoffs

- Keep source material and raw-byte snapshots under gitignored `.context/` so verification evidence does not become shipped QStack content.

## Open questions

- None.

## Validation

- Workspace baseline: branch `hani-q/review-pstack-skills`, HEAD `9a3ecaac0bbcc47f70f70e57a12b589edf430e06`; only the approved plan decision/status edits were dirty before execution.
- Primary QStack baseline: clean `main` at `9a3ecaac0bbcc47f70f70e57a12b589edf430e06`.
- Gaia baseline: clean `main` at `7b888a366ca7360fdac5fba2e1c99b7a08fb4b3d`.
- PStack baseline: temporary detached checkout of `https://github.com/cursor/plugins.git`, clean at `60c641e4fad674784b30abcf9f8915dea39df38d`; `pstack/LICENSE` is the 2026 Lauren Tan MIT license.
- Global files present: `~/.claude/CLAUDE.md` is 2,399 bytes; `~/.codex/AGENTS.md` is 1,065 bytes.
- Global raw-byte snapshots: `.context/qstack-skill-expansion/CLAUDE.md.before` SHA-256 `bac70985d866d8c0ca4c91e8c46feaad3f7c89906fb7425285233bb3a5280a72`; `.context/qstack-skill-expansion/AGENTS.md.before` SHA-256 `e2bfd0d44786d957249cc0d41f54d938577faa137c88dd745e77f81b698283be`.
- Protected baselines: `version.txt` SHA-256 `59854984853104df5c353e2f681a15fc7924742f9a2e468c29af248dce45ce03`; `.release-please-manifest.json` `2ae8018fa540b531f79940118826b9846a44a8e9db05eab71caa9923fdd04c56`; `CHANGELOG.md` `0b62f87c29ad9ee8ac124175cddb19207c7136d6796b9d74d9414fca5b440017`.
- Required instruction files: QStack root `AGENTS.md`, identical Gaia root `AGENTS.md`/`CLAUDE.md`, and both global instruction files were read; Gaia's required gstack installation is present.
- Plan decision verification: DQ-004 is the sole durable validation-isolation decision and no blocking question remains; `git diff --check` passed. Browser verification could not run because no browser backend was available.
- Independent source-contract passes: two read-only agents reviewed five sources each, confirmed the invocation matrix and host-neutral boundaries, and made no file changes. Their safety clarifications were incorporated before repository validation.
- Initial skill-creator validation under the persistent host Python stopped with `ModuleNotFoundError: yaml`, matching DQ-004's known dependency. No persistent package was installed.
- Disposable environment: installed PyYAML 6.0.3 and `skills-ref` 0.1.0 from CI-pinned Agent Skills commit `38a2ff82958afee88dadf4831509e6f7e9d8ef4e`.
- Installed skill-creator `quick_validate.py`: all nineteen portable projections passed.
- `scripts/validate-skill-invocation`: passed all nineteen skills; approved matrix is eleven automatic and eight manual in both Claude and Codex.
- Local Markdown reference check: all links resolved across twenty-six skill/catalog/notice Markdown files.
- Scope and attribution checks: exactly the ten planned directories are new; the PStack MIT notice occurs exactly once; all ten source lines name Lauren Tan, PStack, the original skill, and the pinned commit.
- Shell and whitespace checks: `bash -n` passed for `install` and both plan server scripts; `git diff --check` and a temporary-index full-tree check passed.
- `npx --yes skills@1.5.21 add . --list --agent codex`: exit 0 and discovered exactly nineteen QStack skills.
- Disposable validation cleanup: the temporary environment was moved to Trash and no longer exists in the workspace; system and global Python were unchanged.
- Superseded revision 1 global proof: both files contained exactly one `qstack:unslop` marker pair immediately after the no-commit rule. Each extracted block was 6,595 bytes and byte-identical to pinned SHA-256 `181883e539caec8258ec9129e3ba5f133409144a2cbf2aa361158ab94cfc3441`. Revision 2 intentionally replaces these blocks.
- Superseded revision 1 safety comparison: after the Unslop write and before the installer expanded QStack's own marked block, removing only the marked Unslop block and its separator made `~/.claude/CLAUDE.md` byte-identical to `.context/qstack-skill-expansion/CLAUDE.md.before` and `~/.codex/AGENTS.md` byte-identical to `.context/qstack-skill-expansion/AGENTS.md.before`.
- Primary mirror: the clean primary QStack checkout received the exact uncommitted tree through a temporary-index patch; both index trees matched `d04bac4313d26077974a31e508185bcfaafa2d9c` before installation, and the temporary indexes were removed.
- Required dry run: `/Users/q/work/code/qstack/install --dry-run --without-matt-pocock --without-human-review` exited 0, listed nineteen skills and three harnesses, and changed no repository status, global-instruction hash, or target-link state.
- Required install: `/Users/q/work/code/qstack/install --without-matt-pocock --without-human-review` exited 0; neither optional collection ran.
- Link proof: all thirty new targets across `~/.claude/skills`, `~/.codex/skills`, and `~/.agents/skills` are symlinks whose link text, resolved directory, and QStack ownership marker point to `/Users/q/work/code/qstack/skills/<skill>`.
- Superseded revision 1 post-install proof: both extracted Unslop blocks remained byte-identical to the 6,595-byte source; both QStack blocks matched the primary installer's `INSTRUCTIONS_BLOCK`; after removing both intentional marked blocks, the remaining Claude and Codex bytes matched their pre-execution snapshots.
- Final validation after the uniform permission-boundary edit: all nineteen installed skill-creator projections passed; pinned `skills-ref` plus invocation parity passed all nineteen; the approved matrix remained eleven automatic and eight manual.
- Final repository proof: local Markdown links resolved across twenty-six files; all ten attributions and the exact-once PStack license passed; exactly the planned ten new skill directories exist; `bash -n` passed for `install` and both plan server scripts; both working-tree and temporary-index whitespace checks passed at the pre-evidence tree `8d327d6352b844e3ccf05e83628078b0d3189543`; skills.sh discovered exactly nineteen skills.
- Final disposable validation cleanup: the second temporary environment was moved to Trash and is absent from the workspace. The persistent system and global Python environments were not changed.
- Revision 1 primary reconciliation before recording its evidence: the primary tree began at the earlier mirror `d04bac4313d26077974a31e508185bcfaafa2d9c`; a temporary-index diff contained only the execution-note and ten permission-boundary updates. After applying it without a commit, both workspace and primary full trees matched `8d327d6352b844e3ccf05e83628078b0d3189543`. A first read-only sync attempt used a relative primary index path and stopped before applying anything; its temporary directory was moved to Trash before retrying with absolute Git directories.
- Superseded revision 1 final global proof and continuing link proof: both Unslop blocks were 6,595-byte exact copies at SHA-256 `181883e539caec8258ec9129e3ba5f133409144a2cbf2aa361158ab94cfc3441`; both QStack blocks matched the installer; the bytes outside both marked blocks equaled the raw baselines. All thirty link texts, resolved targets, and ownership markers continue to point to `/Users/q/work/code/qstack/skills/<name>`. No harness symlink targets the temporary PStack source and no `qstack-unslop` skill exists.
- Superseded revision 1 scope proof: the workspace and primary checkout each contained exactly three intended modified paths and twenty-five intended new files, with no other status entry. Revision 2 intentionally adds `GENERAL_INSTRUCTIONS.md` and revises four existing paths.
- Final source and repository baselines: PStack is clean at `60c641e4fad674784b30abcf9f8915dea39df38d`; Gaia is clean on `main` at `7b888a366ca7360fdac5fba2e1c99b7a08fb4b3d`; the workspace remains on `hani-q/review-pstack-skills` and the primary remains on `main`, both at `9a3ecaac0bbcc47f70f70e57a12b589edf430e06`; `origin/main` is unchanged at the same QStack commit.
- Final protected-file proof: `version.txt`, `.release-please-manifest.json`, and `CHANGELOG.md` retain baseline SHA-256 values `59854984853104df5c353e2f681a15fc7924742f9a2e468c29af248dce45ce03`, `2ae8018fa540b531f79940118826b9846a44a8e9db05eab71caa9923fdd04c56`, and `0b62f87c29ad9ee8ac124175cddb19207c7136d6796b9d74d9414fca5b440017` respectively.
- Final Git authorization proof: this expansion created no commit, push, pull request, post-baseline branch rename, release edit, or Gaia edit. Reflog records `hani-q/khartoum` -> `hani-q/review-pstack-skills` at `2026-08-19T16:50:31+05:00`, before plan approval at `16:59:10` and before this execution record was created at `17:00:52`; the approved execution baseline therefore already contained the current name. No later rename occurred. HEAD and `origin/main` remain at their baselines; previously authorized PR `#16` remains the recorded exception and grants no publication authority for this expansion.
- Round 1 remedy validation: after tightening the two permission boundaries and correcting branch-history wording, all nineteen portable skill-creator projections and pinned `skills-ref` invocation checks passed; the 11/8 invocation matrix stayed exact; all links across twenty-six Markdown files resolved; explicit assertions for both permission remedies passed; shell syntax, working-tree and temporary-index whitespace passed; skills.sh still discovered nineteen skills. The disposable review-fix environment was moved to Trash and is absent.
- Revision 2 plan amendment: the user-approved plan is now revision 2 with locked DQ-005. It replaces the exact global PStack skill copies with root `GENERAL_INSTRUCTIONS.md`, one top section in both files, harmonized Agent behavior and writing rules, and a concise shared gstack pointer. The ten-skill scope and invocation matrix did not change.
- Revision 2 installer unit proof: in an isolated fake home, first install produced exact general and QStack blocks plus nineteen skills; a second install was byte-idempotent; uninstall removed both managed blocks while preserving host-owned lines. The fixture was moved to Trash afterward.
- Revision 2 migration proof: raw revision 1 snapshots are SHA-256 `10ce11ade8028d97db4c581d656e1d68f493873636a3f77718dcecd416fbd433` for Claude and `faf44b05c25b020b2b264bcb3d668a34a39fcbf56c146df338fdd420cb934a0d` for Codex. A temporary hash-gated migration consumed the known no-commit, Unslop, Claude gstack/Agent behavior, and QStack sections, then was moved to Trash. No unclassified host-owned bytes existed in either snapshot.
- Revision 2 global proof: `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md` are byte-identical at SHA-256 `f65e546e08f8362565a91cdd1cef064adc815fe7620a7bb1869503bb97427f40`. Each starts with one `qstack:general-instructions` block whose body exactly matches `GENERAL_INSTRUCTIONS.md`, followed only by the exact installer-owned QStack command block. No legacy `qstack:unslop` marker, skill frontmatter, separate Unslop title, standalone Agent behavior heading, standalone gstack heading, or copied gstack catalog remains.
- Revision 2 real installer proof: the required dry run with both optional collections disabled left repository, global, and thirty-link state unchanged at signature `165d69ff4aeed20c79fc939d7b2caf8524cfe6687793c12b73b68e9822fc4925`. The real install and a second real install both exited 0 and retained the same byte/link signature.
- Revision 2 ordering proof: a final installer audit found that an already-marked block would be refreshed in place even if host edits had moved it. The installer now restores General instructions to the first line and QStack routing to the end. An isolated two-host fixture with both blocks deliberately misplaced preserved all three host-owned lines, produced exact shared managed content, stayed byte-identical on a second install at SHA-256 `d52e8bb2234f1264032115e28a6878daf07e2b57e4412bb32f7348d43b04797a`, and removed both blocks cleanly on uninstall. The fixture was moved to Trash.
- Revision 2 post-ordering install proof: before this evidence update, the primary and workspace temporary-index trees matched `2106c364476557787cd8a1015fa970f33dd42776`. A primary-checkout dry run, real install, and second real install with both optional collections disabled retained repository, global, and thirty-link state at test signature `f826d72172a0bbdc29c01a137e4c1628a0b7acb617741a70f9685082dee65ef8`; both global files remain byte-identical at SHA-256 `f65e546e08f8362565a91cdd1cef064adc815fe7620a7bb1869503bb97427f40`.
- Revision 2 repository validation: all nineteen portable skill-creator projections and pinned `skills-ref` parity checks passed; the matrix remains eleven automatic and eight manual; links resolved across twenty-seven Markdown files; the exact PStack MIT license occurs once and the global `unslop` adaptation is mapped; the plan amendment and its three local resources parsed; shell syntax and full-tree whitespace passed; skills.sh discovered nineteen skills.
- HTML parser note: macOS `/usr/bin/tidy` is an HTML4-era parser and rejected the plan's existing HTML5 elements such as `header`, `nav`, `aside`, and `main`; it was not used as a release gate. Python's HTML parser completed and all three local plan resources resolved. The previously recorded lack of a browser backend remains unchanged.
- Revision 2 cleanup and scope: the final disposable validation environment was moved to Trash. The workspace and primary checkout each contain exactly three intended modified paths and twenty-six intended new files. Before this evidence update, their full temporary-index trees matched `db8f082fd20a2b4f2d777441cce68c5f9588c3bb`.
- Revision 2 final baselines: all thirty installed links still resolve to the primary checkout; no `qstack-unslop` or PStack link exists; protected release hashes, QStack branch/HEAD/origin, clean pinned PStack source, and clean Gaia state remain at their recorded baselines. No commit, push, pull request, post-baseline branch rename, release edit, or Gaia edit occurred.
- Round 2 remedy validation: the installer now validates all four managed markers in one topology pass and rejects nesting, overlap, crossing, duplicates, or unmatched markers before creating output. It also revalidates the intermediate file before the second managed-block pass. Crossed-marker update and uninstall cases both failed closed with the instruction file unchanged at SHA-256 `0ed18259b63c8dddb224ff0fa65e66af15ebb13a32eaa3bdaa4abc489ed85fe4` and no leaked temporary file. A disjoint reversed-order case normalized General instructions to the first line and QStack routing to the end, preserved every host-owned line, stayed byte-identical on reinstall at SHA-256 `d52e8bb2234f1264032115e28a6878daf07e2b57e4412bb32f7348d43b04797a`, and removed both blocks cleanly on uninstall. Both fixtures were moved to Trash; `bash -n install` and `git diff --check` pass.
- Round 2 post-remedy primary proof: before this evidence update, the primary and workspace temporary-index trees matched `315fd72bd5836c598699baec7e9a9df662a40253`. A primary dry run, real install, and second real install with both optional collections disabled retained repository, global, and thirty-link state at test signature `4b3d87d30f2ed33d8c5bb3565014a4b76134cbbd782cbeeaa4ba9e87627a82ab`; the canonical global SHA-256 remains `f65e546e08f8362565a91cdd1cef064adc815fe7620a7bb1869503bb97427f40`.

## Source-to-target contracts

- `blast-radius` -> `qstack-blast-radius`: preserve the single critical safety fact, five-level proof ladder, beyond-grep tracing, real risk/cleared-risk split, and honest unproven state. Remove `why`, `arena`, fixed-model, and `unslop` routing; keep analysis read-only unless implementation is requested.
- `principle-separate-before-serializing-shared-state` -> `qstack-separate-before-serializing-shared-state`: identify shared mutation, eliminate the shared target by assigning ownership, and serialize structurally only for a real single-writer invariant. Preserve the rule that instructions are not concurrency control.
- `principle-encode-lessons-in-structure` -> `qstack-encode-lessons-in-structure`: choose the strongest enforceable mechanism, delete superseded prose, and route one-off, recurring, and systemic lessons to the right layer. Do not turn a recommendation into authority to edit unrelated policy.
- `principle-make-operations-idempotent` -> `qstack-make-operations-idempotent`: test consecutive reruns, failure after every mutation point, stale state, and convergence; require reconciliation when leftover state changes the result.
- `principle-model-the-domain` -> `qstack-model-the-domain`: use a structure that removes scattered assumptions, branches, invalid states, or lifecycle risk, while refusing abstractions that only add indirection. Keep it explicit-only.
- `principle-foundational-thinking` -> `qstack-foundational-thinking`: settle data shape, access paths, ownership, concurrency, useful shared setup, subtraction, and coherent increments before logic. Keep it explicit-only.
- `how` -> `qstack-how`: provide a read-only, evidence-backed subsystem explanation that traces entry point, flow, abstractions, ownership, boundaries, file map, and gotchas. Ordinary questions work directly; complex exploration, structured explanation, and explicitly requested critique load only their linked reference. Remove required agents, fixed models, configuration files, and mandatory fan-out.
- `principle-build-the-lever` -> `qstack-build-the-lever`: build the smallest safe rerunnable script, generator, codemod, or verification tool that makes non-trivial work repeatable and reviewable; prove the first unit and avoid a framework. Keep it explicit-only and retain user authority over persistent edits.
- `principle-fix-root-causes` -> `qstack-fix-root-causes`: reproduce before diagnosis, follow each why to the cause, inspect the repeated pattern, instrument instead of guessing, and suspect stale state in restart-only failures. Diagnosis does not authorize a fix.
- `principle-prove-it-works` -> `qstack-prove-it-works`: inspect the real artifact, run the feature, and exercise the complete input-to-output path; use deterministic checks when useful and report any unverified segment instead of inferring from proxies.
- Supporting material read: all four `how/references/*.md` files, `principle-laziness-protocol`, the selected cross-linked principles, PStack README/license, and the exact 6,595-byte `unslop/SKILL.md` source at SHA-256 `181883e539caec8258ec9129e3ba5f133409144a2cbf2aa361158ab94cfc3441`.

## Adversarial reviews

- Round 1 pre-review fingerprint: combined SHA-256 `27770f9879f50027f3882d3fffbd0594c126d6a35e3b46f81c02902d18a524fa`, computed from tracked diff SHA-256 `ee4a6025a5f866e38c0f39e1b0a535aadda9e4e882a5e0a7319a98972718f9eb`, the twenty-four-file untracked manifest SHA-256 `eed7b578f6b1a76f5eeea806ee1fbd825d083a06c6f5ea749cd33a10dadce86e`, and normalized execution-core SHA-256 `a2ce8bc6d90e3443e3f1ee6a2ce55d9c4128f95741d6e1338ca1204d9990194a`. The execution-core normalization excludes this append-only section plus only the `Status` and `Updated` fields.

  ```text
  7d27b78bc7acbd7c2a574226c3ae9d66ece046d2d67a76b9319d4bd6497a6395  THIRD_PARTY_NOTICES.md
  8b0ef869bdd8dc60a42edcb4821454391d131692ef5edff0f3e96fe8c9f6fe16  skills/qstack-blast-radius/SKILL.md
  2c76ba2df7f85b05a469f0084f4ee10793bae1219f9afda2a1f9aeb81f60897f  skills/qstack-blast-radius/agents/openai.yaml
  d34e6379f85911c3181eaf7a31fd98140158e85f663633c1709688f90691b3de  skills/qstack-build-the-lever/SKILL.md
  327d936880a1f341415f99053f409d6e18a35822005d556c41c60712fda6022b  skills/qstack-build-the-lever/agents/openai.yaml
  4067564a0a4dca96224ac19119b29363ce76996e2feaaebe7a7c9860e6b1e3fe  skills/qstack-encode-lessons-in-structure/SKILL.md
  329ef24fecc01b34e4b93189272948ea9f8d1ce2844fef750e98aa8402e61db0  skills/qstack-encode-lessons-in-structure/agents/openai.yaml
  7e3435419dae5599390b23197429d3f806ea3c8f0aadf8faebe977f8aa6dac04  skills/qstack-fix-root-causes/SKILL.md
  6f1535aa2b52da94b313dafa54884249be25059f0b5ca084d68df3a4f48f4bdc  skills/qstack-fix-root-causes/agents/openai.yaml
  a1fbed153eafd49c62f05b70bb9cbd620ba2578bc5ee8d33ebdb7317fb5ed3da  skills/qstack-foundational-thinking/SKILL.md
  9c777d09b5732c6142c7b4cf91ebde7a2de6d6d27da0e6fd4d5419efd6daa61e  skills/qstack-foundational-thinking/agents/openai.yaml
  17b43f62837c6cd474b8f9f082b6a7918bd59fff89ab2dbbcca61cb499c19ac9  skills/qstack-how/SKILL.md
  09cc85260a7375cca982b53d8d45af3e03da5ead5e19b9138993b12d49a8a3e0  skills/qstack-how/agents/openai.yaml
  38e82dc8cccc988da71d9f16ae69e04745d3874f1224df33059c5f0752d35641  skills/qstack-how/references/critique.md
  6fbd426384f09e1368876f6cad77ac8a715ff30cd604baf508cb9a1da0f60c79  skills/qstack-how/references/explanation.md
  22fce1942f7c8231441de960397a46ae00419807a8eaf92fd279d6ab580192b3  skills/qstack-how/references/exploration.md
  d896257e589dcb2fe3a23c067b386171b304bdb951c1547ce7b80b4e064c6452  skills/qstack-make-operations-idempotent/SKILL.md
  2158bb80bf4bf37d3ef2b7f7cf14da2edad89eb849ea6112dbf28abc899ce7b1  skills/qstack-make-operations-idempotent/agents/openai.yaml
  3bdde00d7ed90951db47dcc1e12bc7551bf37e44a78fa3c5acff2db24f1d9c9a  skills/qstack-model-the-domain/SKILL.md
  dfe3e1726e79253d23dbdd885c88324ba30df171944406d4e2b16614af8561bb  skills/qstack-model-the-domain/agents/openai.yaml
  610130e7cddede5883e96c5e232d15bfa8655ad34eeecf2d7d5e7d278bf26027  skills/qstack-prove-it-works/SKILL.md
  4149200ff63d4528560d4c430c1849715450bf2b3ed1b31eabcb7951237072b3  skills/qstack-prove-it-works/agents/openai.yaml
  86ed5da0470b9e1d9b64a26e7738c6a4d32bae3d4cd8288abee055c1ea4df0df  skills/qstack-separate-before-serializing-shared-state/SKILL.md
  59ec85392deeffe772654ebb884f7fddef1b64f83886a956a0cfd50c42f81b69  skills/qstack-separate-before-serializing-shared-state/agents/openai.yaml
  ```

- Round 2 verdict for fingerprint `389a91f7feec7ac9d95a75e35167c6b563a475113bef70502c6daf311b7443b6`: 2/5 with one blocking installer-safety finding and one non-blocking fingerprint-documentation finding. Accepted and corrected: independently valid but crossed managed marker pairs could make sequential removal consume host-owned bytes, so the installer now rejects invalid joint topology before output and revalidates the intermediate file. The next fingerprint will also record its literal three-line combined-hash preimage so the delimiter is unambiguous. The reviewer found no other blocker. The implementation and fingerprinted execution evidence changed, so this fingerprint is superseded and a fresh review is required.

- Round 3 pre-review fingerprint: combined SHA-256 `eb83c844f4c211cf46366341077e1f99095bebff474717863c645e50d9ad0b96`, computed from tracked diff SHA-256 `6f300a37a66d9bfae6bb0bad3a9bb85749d15f7bd2c224c5f28e6859b81a2062`, the twenty-five-file untracked manifest SHA-256 `7977c92b69345899f030cdc847fc5054d8c541ccecd9c63a6527c5e08e1cc3d8`, and normalized execution-core SHA-256 `d4f9e5fdf5505c3139d63d8bb01ee17161c052419a6f443128f7d95d52748ba5`. The tracked component is the binary full-index diff against `origin/main`. The execution core excludes this append-only section plus only the `Status` and `Updated` fields. The exact combined-hash preimage command, including two ASCII spaces after each label and a newline after the final value, is:

  ```bash
  printf 'tracked-diff  %s\nuntracked-manifest  %s\nexecution-core  %s\n' \
    "$tracked_sha" "$manifest_sha" "$execution_core_sha" | shasum -a 256
  ```

  ```text
  2c67e4ac866fe8c544a2bf6caa7b5527916aa552feed30779b13113217c6198c  GENERAL_INSTRUCTIONS.md
  ffcbbd21845dbf47a07f019dd93e01fd4181658196ccb6a767291e958b30c929  THIRD_PARTY_NOTICES.md
  a92e2aa6afbcdf387378d567ea18830029aa257ab369854b08d89097b36940a1  skills/qstack-blast-radius/SKILL.md
  2c76ba2df7f85b05a469f0084f4ee10793bae1219f9afda2a1f9aeb81f60897f  skills/qstack-blast-radius/agents/openai.yaml
  d34e6379f85911c3181eaf7a31fd98140158e85f663633c1709688f90691b3de  skills/qstack-build-the-lever/SKILL.md
  327d936880a1f341415f99053f409d6e18a35822005d556c41c60712fda6022b  skills/qstack-build-the-lever/agents/openai.yaml
  4067564a0a4dca96224ac19119b29363ce76996e2feaaebe7a7c9860e6b1e3fe  skills/qstack-encode-lessons-in-structure/SKILL.md
  329ef24fecc01b34e4b93189272948ea9f8d1ce2844fef750e98aa8402e61db0  skills/qstack-encode-lessons-in-structure/agents/openai.yaml
  7e3435419dae5599390b23197429d3f806ea3c8f0aadf8faebe977f8aa6dac04  skills/qstack-fix-root-causes/SKILL.md
  6f1535aa2b52da94b313dafa54884249be25059f0b5ca084d68df3a4f48f4bdc  skills/qstack-fix-root-causes/agents/openai.yaml
  a1fbed153eafd49c62f05b70bb9cbd620ba2578bc5ee8d33ebdb7317fb5ed3da  skills/qstack-foundational-thinking/SKILL.md
  9c777d09b5732c6142c7b4cf91ebde7a2de6d6d27da0e6fd4d5419efd6daa61e  skills/qstack-foundational-thinking/agents/openai.yaml
  17b43f62837c6cd474b8f9f082b6a7918bd59fff89ab2dbbcca61cb499c19ac9  skills/qstack-how/SKILL.md
  09cc85260a7375cca982b53d8d45af3e03da5ead5e19b9138993b12d49a8a3e0  skills/qstack-how/agents/openai.yaml
  38e82dc8cccc988da71d9f16ae69e04745d3874f1224df33059c5f0752d35641  skills/qstack-how/references/critique.md
  6fbd426384f09e1368876f6cad77ac8a715ff30cd604baf508cb9a1da0f60c79  skills/qstack-how/references/explanation.md
  22fce1942f7c8231441de960397a46ae00419807a8eaf92fd279d6ab580192b3  skills/qstack-how/references/exploration.md
  55ebc9b5ddbf14d83f026d563d86a96b669760bebac37c891cd411a2f42cdcec  skills/qstack-make-operations-idempotent/SKILL.md
  2158bb80bf4bf37d3ef2b7f7cf14da2edad89eb849ea6112dbf28abc899ce7b1  skills/qstack-make-operations-idempotent/agents/openai.yaml
  3bdde00d7ed90951db47dcc1e12bc7551bf37e44a78fa3c5acff2db24f1d9c9a  skills/qstack-model-the-domain/SKILL.md
  dfe3e1726e79253d23dbdd885c88324ba30df171944406d4e2b16614af8561bb  skills/qstack-model-the-domain/agents/openai.yaml
  610130e7cddede5883e96c5e232d15bfa8655ad34eeecf2d7d5e7d278bf26027  skills/qstack-prove-it-works/SKILL.md
  4149200ff63d4528560d4c430c1849715450bf2b3ed1b31eabcb7951237072b3  skills/qstack-prove-it-works/agents/openai.yaml
  86ed5da0470b9e1d9b64a26e7738c6a4d32bae3d4cd8288abee055c1ea4df0df  skills/qstack-separate-before-serializing-shared-state/SKILL.md
  59ec85392deeffe772654ebb884f7fddef1b64f83886a956a0cfd50c42f81b69  skills/qstack-separate-before-serializing-shared-state/agents/openai.yaml
  ```

- Round 3 pre-review validation: repository and primary temporary-index trees match `a6ebe56626241e6e28d9bc6c02f5880405901ea0`; working-tree and full-tree whitespace plus Bash syntax pass; both canonical global files remain byte-identical at SHA-256 `f65e546e08f8362565a91cdd1cef064adc815fe7620a7bb1869503bb97427f40`; all thirty links resolve to the primary checkout; all forty local Markdown links and three plan resources resolve; skills.sh lists nineteen skills; PStack, Gaia, protected release files, branches, HEAD, and `origin/main` retain their recorded baselines.

- Round 3 verdict for fingerprint `eb83c844f4c211cf46366341077e1f99095bebff474717863c645e50d9ad0b96`: 5/5, faithful. The fresh reviewer independently reproduced every fingerprint component, verified the joint marker-topology and intermediate-validation remedy across update and uninstall, and found no remaining path that accepts malformed topology, consumes host-owned lines, writes a partial instruction file, misplaces blocks, or breaks reinstall idempotence. All seventeen release-gate areas passed. No blocking or non-blocking finding remains; this is the final independent review for the completed state.

- Round 1 verdict for fingerprint `27770f9879f50027f3882d3fffbd0594c126d6a35e3b46f81c02902d18a524fa`: 3/5 with three blocking findings. Accepted and corrected: require safe authorized verification for idempotence reruns and fault injection; prohibit temporary proof-file creation during analysis-only blast-radius work; record the pre-execution branch rename and narrow the Git claim to the post-baseline period. The reviewer found no other issue. Because the accepted fixes changed fingerprinted skill and execution content, this fingerprint is superseded and a fresh review is required.

- Round 2 pre-review fingerprint: combined SHA-256 `389a91f7feec7ac9d95a75e35167c6b563a475113bef70502c6daf311b7443b6`, computed from tracked diff SHA-256 `cacbc83573f9924581484fdbd71ce2349ca438b2409b45efb85e827c2a78ef0b`, the twenty-five-file untracked manifest SHA-256 `7977c92b69345899f030cdc847fc5054d8c541ccecd9c63a6527c5e08e1cc3d8`, and normalized execution-core SHA-256 `ffcbe1e88da5a84bf239df92312d78de293d388ef73083b2397c432592c803e0`. The tracked component is the binary full-index diff against `origin/main`. The execution core excludes this append-only section plus only the `Status` and `Updated` fields. The combined hash is SHA-256 over the three labeled component lines `tracked-diff`, `untracked-manifest`, and `execution-core`, in that order.

  ```text
  2c67e4ac866fe8c544a2bf6caa7b5527916aa552feed30779b13113217c6198c  GENERAL_INSTRUCTIONS.md
  ffcbbd21845dbf47a07f019dd93e01fd4181658196ccb6a767291e958b30c929  THIRD_PARTY_NOTICES.md
  a92e2aa6afbcdf387378d567ea18830029aa257ab369854b08d89097b36940a1  skills/qstack-blast-radius/SKILL.md
  2c76ba2df7f85b05a469f0084f4ee10793bae1219f9afda2a1f9aeb81f60897f  skills/qstack-blast-radius/agents/openai.yaml
  d34e6379f85911c3181eaf7a31fd98140158e85f663633c1709688f90691b3de  skills/qstack-build-the-lever/SKILL.md
  327d936880a1f341415f99053f409d6e18a35822005d556c41c60712fda6022b  skills/qstack-build-the-lever/agents/openai.yaml
  4067564a0a4dca96224ac19119b29363ce76996e2feaaebe7a7c9860e6b1e3fe  skills/qstack-encode-lessons-in-structure/SKILL.md
  329ef24fecc01b34e4b93189272948ea9f8d1ce2844fef750e98aa8402e61db0  skills/qstack-encode-lessons-in-structure/agents/openai.yaml
  7e3435419dae5599390b23197429d3f806ea3c8f0aadf8faebe977f8aa6dac04  skills/qstack-fix-root-causes/SKILL.md
  6f1535aa2b52da94b313dafa54884249be25059f0b5ca084d68df3a4f48f4bdc  skills/qstack-fix-root-causes/agents/openai.yaml
  a1fbed153eafd49c62f05b70bb9cbd620ba2578bc5ee8d33ebdb7317fb5ed3da  skills/qstack-foundational-thinking/SKILL.md
  9c777d09b5732c6142c7b4cf91ebde7a2de6d6d27da0e6fd4d5419efd6daa61e  skills/qstack-foundational-thinking/agents/openai.yaml
  17b43f62837c6cd474b8f9f082b6a7918bd59fff89ab2dbbcca61cb499c19ac9  skills/qstack-how/SKILL.md
  09cc85260a7375cca982b53d8d45af3e03da5ead5e19b9138993b12d49a8a3e0  skills/qstack-how/agents/openai.yaml
  38e82dc8cccc988da71d9f16ae69e04745d3874f1224df33059c5f0752d35641  skills/qstack-how/references/critique.md
  6fbd426384f09e1368876f6cad77ac8a715ff30cd604baf508cb9a1da0f60c79  skills/qstack-how/references/explanation.md
  22fce1942f7c8231441de960397a46ae00419807a8eaf92fd279d6ab580192b3  skills/qstack-how/references/exploration.md
  55ebc9b5ddbf14d83f026d563d86a96b669760bebac37c891cd411a2f42cdcec  skills/qstack-make-operations-idempotent/SKILL.md
  2158bb80bf4bf37d3ef2b7f7cf14da2edad89eb849ea6112dbf28abc899ce7b1  skills/qstack-make-operations-idempotent/agents/openai.yaml
  3bdde00d7ed90951db47dcc1e12bc7551bf37e44a78fa3c5acff2db24f1d9c9a  skills/qstack-model-the-domain/SKILL.md
  dfe3e1726e79253d23dbdd885c88324ba30df171944406d4e2b16614af8561bb  skills/qstack-model-the-domain/agents/openai.yaml
  610130e7cddede5883e96c5e232d15bfa8655ad34eeecf2d7d5e7d278bf26027  skills/qstack-prove-it-works/SKILL.md
  4149200ff63d4528560d4c430c1849715450bf2b3ed1b31eabcb7951237072b3  skills/qstack-prove-it-works/agents/openai.yaml
  86ed5da0470b9e1d9b64a26e7738c6a4d32bae3d4cd8288abee055c1ea4df0df  skills/qstack-separate-before-serializing-shared-state/SKILL.md
  59ec85392deeffe772654ebb884f7fddef1b64f83886a956a0cfd50c42f81b69  skills/qstack-separate-before-serializing-shared-state/agents/openai.yaml
  ```
