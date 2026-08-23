---
name: qstack
description: >
  List every skill installed from QStack and from the optional collections
  QStack installs (Matt Pocock's skills, human-review) as a table with a
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

Show what is installed, then what to run next. Nothing is stored in this file:
every run reads the skills on disk at that moment, so a skill added or a
collection installed yesterday appears today.

## 1. Read the installed skills

Run this once. It prints one row per skill as `collection<TAB>name<TAB>description`.

```bash
python3 - <<'PY'
import json, os, re
home = os.path.expanduser("~")
lock = os.path.join(home, ".agents", ".skill-lock.json")
sources = {}
if os.path.isfile(lock):
    for name, entry in json.load(open(lock)).get("skills", {}).items():
        sources[name] = entry.get("source", "")
COLLECTIONS = {"mattpocock/skills": "Matt Pocock"}
def description(path):
    lines = open(path, encoding="utf-8").read().splitlines()
    if not lines or lines[0] != "---":
        return ""
    out, folded = [], False
    for line in lines[1:]:
        if line == "---":
            break
        if folded:
            if line[:1].isspace():
                out.append(line.strip())
                continue
            break
        m = re.match(r"^description:\s*(.*)$", line)
        if m:
            value = m.group(1).strip()
            if value in ("", ">", "|", ">-", "|-"):
                folded = True
            else:
                return value.strip('"')
    return " ".join(out)
seen, rows = set(), []
for d in (".claude/skills", ".codex/skills", ".agents/skills"):
    root = os.path.join(home, d)
    if not os.path.isdir(root):
        continue
    for name in sorted(os.listdir(root)):
        md = os.path.join(root, name, "SKILL.md")
        if name in seen or not os.path.isfile(md):
            continue
        if name == "qstack" or name.startswith("qstack-"):
            group = "qstack"
        elif name == "human-review":
            group = "human-review"
        elif sources.get(name) in COLLECTIONS:
            group = COLLECTIONS[sources[name]]
        else:
            continue
        seen.add(name)
        rows.append((group, name, description(md)))
order = {"qstack": 0, "human-review": 1}
for group, name, desc in sorted(rows, key=lambda r: (order.get(r[0], 2), r[0], r[1])):
    print(f"{group}\t{name}\t{desc}")
PY
```

What the command decides, so you do not have to:

- A skill belongs to QStack when its directory is `qstack` or starts with
  `qstack-`. That is the naming contract `install` and skills.sh both keep.
- `human-review` is its own collection.
- Any other skill is included only when `~/.agents/.skill-lock.json` records
  it as installed from `mattpocock/skills`. That lock file is written by the
  skills.sh CLI, which is how QStack's installer adds that collection.
- Skills from collections QStack does not install (gstack, greptile, ...) are
  left out. They have their own routers.
- A skill linked into more than one harness directory is listed once.

If the command prints nothing, say that no QStack skills were found under
`~/.claude/skills`, `~/.codex/skills`, or `~/.agents/skills`, and stop.

## 2. Render the tables

Condense each description to one line:

- Keep the first sentence. Drop any "Use when ...", "Use for ...", or
  "Triggers on ..." clause; that text is for the model, not the reader.
- About twelve words at most, starting with a verb, no trailing full stop.
- Say only what the description says. Do not add detail it lacks.
- Keep the order the command printed.

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

Write each skill as `/name`. Omit the second table when the command printed no
rows outside qstack. No preamble, no install advice, no remarks about skills
that are absent.

## 3. Recommend the next skill

Apply the `/qstack-next` skill. In a host without a skill tool, read its
`SKILL.md` from the same skills directory and follow it. Append its output
under a `## Next` heading. When it has nothing to recommend, omit the heading.
