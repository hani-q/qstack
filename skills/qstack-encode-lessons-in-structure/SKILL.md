---
name: qstack-encode-lessons-in-structure
description: >
  Turn a recurring correction or repeated instruction into the strongest
  practical structural guardrail. Use when the same mistake returns, prose is
  being repeated, or a rule could become a type, schema, lint, check, or script.
license: MIT
---

# Encode lessons in structure

Text asks every future reader to notice, remember, and comply. A structural
mechanism applies the lesson without relying on memory.

## Route the lesson

1. Identify the concrete correction and evidence that it recurs. Keep a true
   one-off as local context instead of turning it into a universal rule.
2. Choose the strongest practical mechanism:
   - a state or type that cannot represent the invalid case;
   - a schema, lint, banned API, or CI check that fails before merge;
   - one canonical helper or generator that removes duplicate choices;
   - a runtime boundary check with a clear failure;
   - a written instruction only when human judgment is irreducible.
3. Implement the mechanism only when the user's request authorizes that edit.
   Otherwise propose the exact target and expected failure behavior.
4. Remove prose or duplicate paths that the new mechanism supersedes. Keep one
   source of truth, but only after proving the mechanism covers the old rule.
5. Exercise the known failure and show that the mechanism catches it.

Route recurring fixes to a local skill or tool and systemic rules to the
smallest shared layer that can enforce them. Recording without enforcement does
not close the loop. Do not invent recurrence; cite the correction or failure
that shows the pattern. Analysis alone does not authorize edits, commits,
pushes, publishing, deployment, or external messages.

Adapted from Lauren Tan's PStack
[`principle-encode-lessons-in-structure`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-encode-lessons-in-structure/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
