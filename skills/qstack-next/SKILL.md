---
name: qstack-next
description: >
  Recommend the one installed skill to run next, from what the conversation
  has done so far and the state of the plan folder on disk. Use when invoked
  as /qstack-next, when asked "what now?" or which skill to use next, or as
  the last step of /qstack.
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-next

Say what was just done, what that leaves undone, and the one skill that closes
the gap. Three or four lines. Name the skill; never run it.

## Evidence, heaviest first

1. **The plan folder.** Files on disk say where the work is more reliably than
   the conversation does. See the table below.
2. **The working tree.** `git branch --show-current`, `git status --short`,
   `git log --oneline -5`. Uncommitted changes mean work that is not yet
   verified or reviewed.
3. **The conversation.** What the user asked last, what was produced, what was
   verified. Facts, not tone: "it's broken" followed by three guards and no
   reproduction is evidence; a frustrated message is not.

Read what you need and no more. This skill is read-only.

## The plan lifecycle

Plan folders are `qstack/compound_engineering/plans/<slug>/`, or the legacy
`compound-engineering/plans/<slug>/`. The folder whose slug matches the branch
or the conversation is the one that matters. Its files arrive in a fixed
order, and the first one missing is the next step:

| The folder has | Run next |
| --- | --- |
| Nothing yet, and the user is describing a feature or change | `/qstack-plan-prior-art`, then draft `plan.md` |
| `plan.md` and no `plan.html` | `/qstack-plan-to-html` |
| `plan.html` with notes at `data-status="open"` | `/qstack-ask-plan-open-questions` |
| `plan.html` and no `board-events.js`, or a board without its complete-breakdown marker | `/qstack-plan-to-html` to finish the board |
| `board-events.js` with cards still open | the execution loop `execution.md` shows was used; `/qstack-loop-no-nonsense` when it shows none |
| every card closed and no `outcome.md`, on a board with no `review` epic | `/qstack-plan-adherence-review`, then `/qstack-plan-close` |
| every card closed and no `outcome.md`, on a board whose `review` epic gate card is `done` | `/qstack-plan-close`; the gate card already ran the adherence review |
| `outcome.md` | nothing from the lifecycle |

Work with no plan folder and no feature being described is outside the
lifecycle; do not push it in.

## Outside the lifecycle

Match the conversation against the `description:` of every installed skill.
The listing command in `/qstack` prints them; `ls ~/.claude/skills
~/.codex/skills ~/.agents/skills` names them. Each description says when its
skill applies; that text is the rule, so this file does not repeat it.

Prefer, in order: a QStack skill, a skill from a collection QStack installs
(Matt Pocock's skills, human-review), anything else installed. Never recommend
a skill that is not installed.

## Output

Three or four short lines of plain prose, no heading, no list:

1. What was just done. One concrete fact: a file written, a card closed, a
   branch merged, a failure described.
2. What that leaves undone.
3. `Run /<skill>`, with its argument when the skill takes one. Name a second
   skill only when it follows directly, as `plan-close` follows
   `plan-adherence-review`.

When a file decided the recommendation, name the file. When nothing is undone
and no description matches: output nothing if `/qstack` called this skill,
otherwise one line, `Nothing pending.` Never pad to reach four lines.

## Hard rules

- Read-only. Edit nothing, run no skill, start no work.
- One recommendation, not a menu.
- Evidence, not mood. Every recommendation rests on a file, a diff, or a
  message you can point to.
