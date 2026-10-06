---
name: qstack
description: >
  List every skill installed from QStack and from the optional collections
  QStack's installer offers as a table with a
  one-line description each, then recommend the next skill to run from the
  conversation so far and the plan folder on disk. Use when invoked as /qstack
  or when asked which QStack commands exist.
disable-model-invocation: true
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack

Show what is installed, then what to run next. Nothing is stored here: every
run reads the skills on disk at that moment, so a skill added or a collection
installed yesterday appears today.

## 1. Read the installed skills

Run `scripts/installed-skills`, next to this file, once. It prints one row per
skill as `collection<TAB>name<TAB>path<TAB>description`.

What the script decides, so you do not have to:

- A skill belongs to QStack when its directory is `qstack` or starts with
  `qstack-`. That is the naming contract `install` and skills.sh both keep.
- `human-review` is its own collection.
- Any other skill is included only when the skills.sh lock file records it as
  installed from one of the collections QStack's installer offers, and the
  copy found is the one that entry describes. The script reads the lock where
  that CLI writes it, honouring `XDG_STATE_HOME`, and its `COLLECTIONS` map is
  the one list of those sources.
- Skills from collections QStack does not install (gstack, greptile, ...) are
  left out. They have their own routers.
- A skill linked into more than one harness directory is listed once.

If the script prints nothing, say that no QStack skills were found under
`~/.claude/skills`, `~/.codex/skills`, or `~/.agents/skills`, and stop.

## 2. Render the tables

Condense each description to one line:

- Keep the first sentence. Drop any "Use when ...", "Use for ...", or
  "Triggers on ..." clause; that text is for the model, not the reader.
- About twelve words at most, starting with a verb, no trailing full stop.
- Say only what the description says. Do not add detail it lacks.
- Keep the order the script printed.

Output exactly this, and nothing before it:

```markdown
## qstack

| Skill | What it does |
| --- | --- |
| /qstack-plan-prior-art | ... |

## Installed with qstack

| Skill | Collection | What it does |
| --- | --- | --- |
| /human-review | human-review | ... |
| /ask-matt | Matt Pocock | ... |
```

Write each skill as `/name`. Omit the second table when the script printed no
rows outside qstack. No preamble, no install advice, no remarks about skills
that are absent.

## 3. Recommend the next skill

Apply the `/qstack-next` skill. In a host without a skill tool, read its
`SKILL.md` from the same skills directory and follow it. Append its output
under a `## Next` heading. When it has nothing to recommend, omit the heading.
