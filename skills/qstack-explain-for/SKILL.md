---
name: qstack-explain-for
description: Rewrite the immediately previous assistant answer for a named reader, such as a product manager, CEO, or CMO, optionally framed around a named product. Use when the user invokes `/qstack-explain-for [role] [product]`, says the last answer is too technical, too low level, or too narrow, says they do not understand it, or asks for it at a higher level, in simpler words, or from a role's or product's point of view.
---

# /qstack-explain-for

Rewrite the immediately previous assistant answer for the reader named in the
invocation. Output only the rewrite.

## Read the invocation

The argument is free text. Take the reader's role from it and, when present,
the product that reader owns. All of these are valid:

- `/qstack-explain-for` (product manager, product inferred)
- `/qstack-explain-for ceo`
- `/qstack-explain-for pm dpi`
- `/qstack-explain-for cmo of a fitness app`
- `/qstack-explain-for a new support engineer on the habit tracker`

Defaults:

- No role: product manager.
- No product: the product this repository or conversation builds. If nothing
  identifies one, frame the rewrite around users and outcomes without naming a
  product.

The product is whatever the reader owns. When it matches what the codebase
builds, speak in that product's real features. When it does not, map each
technical concept onto that product's nearest feature or user outcome, and
name the mapping the first time it appears so the reader can translate back.

## Choose the lens

Each role sets what the reader is accountable for and the question they are
silently asking. Answer that question first.

| Role | Accountable for | Silent question | Keep | Drop |
| --- | --- | --- | --- | --- |
| Product manager | User outcomes, scope, priority | What changes for users, what does it cost us, what is the tradeoff? | Behavior change, affected users, scope, options, decisions still open | Implementation mechanics, file paths, internal names |
| CEO or founder | Business risk, time, money | Are we exposed, what does it delay, what does it cost? | Risk, delay, cost, decision needed, the one number that matters | Everything below the outcome |
| CMO or marketing | Positioning, claims, launch | What can we say, what must we not say, when? | What is true now, what is coming, caveats on claims | Mechanism, architecture, code |
| CTO or engineering manager | Delivery, quality, team load | How big is it, what could go wrong, who is blocked? | Effort, risk, dependencies, sequencing, what is unverified | Line-level detail, command output |
| Sales or customer success | Deals, customer promises | Can I promise this, to whom, and when? | Customer-visible behavior, limits, timing, workarounds | Internals of any kind |
| Support | Tickets, diagnosis | How do I recognize it, what do I tell the customer? | Symptoms, who is affected, workaround, fix status | Root-cause code detail beyond recognition |
| Anything else | Infer from the role | Infer what this person answers for, then answer that | Whatever moves their decision | Whatever does not |

## Rewrite rules

- Preserve the result, every decision, every warning, and the next action.
  The reader must not lose anything they would act on.
- Lead with the answer to the reader's silent question.
- Translate technical terms into the product's terms. Keep a file path,
  command, or internal name only when this reader has to use it.
- Explain at the reader's altitude. For most roles that means what and why,
  and how only when the how is the decision.
- Keep roughly the length of the original unless the lens removes most of the
  detail on its own. Do not pad, and do not shorten for its own sake. Chain
  `/qstack-be-concise` when a shorter answer is wanted.
- Do not add facts, claims, or recommendations that were not in the original.
  Do not repeat the work or call tools.
- Avoid headings, tables, and code blocks unless the original relied on them
  and the reader still needs them.
- If there is no previous substantive assistant answer, say so in one short
  line.
