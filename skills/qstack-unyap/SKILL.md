---
name: qstack-unyap
description: Rewrite the immediately previous assistant answer in plain, non-technical language using far fewer lines. Use when the user invokes `/qstack-unyap`, optionally with a target such as `/qstack-unyap 4`, or asks to make the last answer shorter and simpler.
---

# /qstack-unyap

Rewrite the immediately previous assistant answer. Output only the rewrite.

## Choose the length

- If the invocation includes a positive whole number `N`, use `N` or `N + 1`
  short lines. For example, `/qstack-unyap 4` produces about 4–5 lines.
- Otherwise, count the non-empty lines in the previous answer and use this guide:
  - 1–5 lines: rewrite in 1–2 lines.
  - 6–12 lines: rewrite in 2–3 lines.
  - 13–24 lines: rewrite in 3–5 lines.
  - 25–49 lines: rewrite in 5–7 lines.
  - 50 or more lines: rewrite in 7–10 lines.
- Treat the ranges as ceilings, not quotas. Use fewer lines when they are enough.
- Exceed a requested limit only when needed to avoid an unsafe or seriously
  misleading answer.

## Rewrite rules

- Preserve the important result, decisions, warnings, and next action.
- Use everyday words a non-technical reader can understand.
- Remove jargon, implementation details, file paths, command names, and process
  narration unless the user must know them to act.
- Translate any unavoidable technical term immediately into plain language.
- Do not add new facts, repeat the work, call tools, or change the meaning.
- Prefer one short sentence per line. Avoid headings, tables, code blocks,
  preambles, apologies, and commentary about shortening the answer.
- If there is no previous substantive assistant answer, say so in one short line.
