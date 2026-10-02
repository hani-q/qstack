---
name: qstack-ste
description: Rewrite the immediately previous assistant answer in ASD-STE100 Simplified Technical English at a chosen strictness, keeping every fact, the same reader, and roughly the same length. Use when the user invokes `/qstack-ste`, optionally with a level from 1 to 100 such as `/qstack-ste 80`, or when the user's whole message is about the previous answer, asks no new question, and names no reader, level, or length, for example they quote the answer's own words back or say "what does this mean", "what do you mean", "explain again", or "I don't understand". A request for a shorter answer belongs to `/qstack-be-concise`; a request for a higher level, simpler words, or another reader belongs to `/qstack-explain-for`.
---

# /qstack-ste

Rewrite the immediately previous assistant answer in Simplified Technical
English. Keep every fact, decision, warning, and next action. Keep the same
reader and roughly the same length. Output only the rewrite.

This skill changes wording only. `/qstack-be-concise` changes length,
`/qstack-explain-for` changes the reader, `/qstack-unslop` removes AI writing
patterns. Chain them when more than one is wanted.

## Read the level

The argument is a whole number from 1 to 100. It snaps to a tier. No argument
means 80.

| Argument | Tier | What it applies |
| --- | --- | --- |
| 1 to 60 | light | The core rules below |
| 61 to 90 | standard | Core rules plus the sentence rules: 20 words for an instruction, 25 for a description, one instruction per sentence, present tense for descriptions, no `-ing` verb forms |
| 91 to 100 | full | Standard plus the word rules: only words from the STE dictionary and technical names, one approved meaning per word, no synonyms for the same thing |

The full rule lists for each tier are in [references/rules.md](references/rules.md).
Read that file before the first rewrite in a session.

## Core rules, every tier

1. The first sentence is the answer: yes or no, done or not done, ready or not
   ready, or the number asked for. The reason comes after it.
2. Active voice, and the actor is named: "I pushed it", "You merge it", not
   "It remains unmerged".
3. One name per thing, and the user's name for it when they gave one. Card
   numbers, spec sections, commit hashes, and symbol names are left out unless
   the reader needs them to act. A needed one is explained in plain words the
   first time.
4. A noun cluster has at most three words: "the check that rejects rc
   versions", not "the root version validator".
5. Something the reader must do is a command, one per sentence, condition
   first: "If the review scores 5/5, merge PR 144." If nothing is needed from
   the reader, one line says so.
6. One topic per paragraph, at most six sentences per paragraph. Status from
   other work is not appended to an answer.
7. List numbers stay as they were in the previous answer. A dropped item is
   marked dropped, not renumbered.

## When the skill is invoked automatically

The trigger is a user message that is about the previous answer, contains no
new question or instruction, and names no reader, level, or length:

- the user quotes a passage of the previous answer back;
- the user says "what does this mean", "what do you mean", "explain again",
  "I don't understand", or the like.

The other rewrite skills own the neighbouring requests. "Shorter", "too much",
or a line count is `/qstack-be-concise`. "Simpler words", "higher level", "too
technical", or a named reader is `/qstack-explain-for`. When the message names
one of those, this skill does not fire.

Then:

- If the user quoted a passage, rewrite that passage first and say what it
  means for them. Rewrite the rest of the answer after it, or leave the rest out
  when the passage was the whole question.
- If the message shows the gap is in the idea, not the wording (the user
  disputes a design, asks how a mechanism works, or asks about something the
  answer did not cover), do not rewrite. Answer the question, in the same tier.
- If the message contains a new question or instruction, this skill does not
  apply. Answer normally and apply the core rules.

## Rewrite rules

- Preserve the result, every decision, every warning, and the next action.
- Keep technical facts exact. Rewording never changes a number, a name, or a
  claim.
- Keep the structure the reader relies on: a table stays a table, a numbered
  procedure stays numbered. Apply the tier rules inside each cell and item.
- Do not add facts, do not repeat the work, do not call tools.
- No headings, bold, or commentary about the rewrite. No preamble.
- If there is no previous substantive assistant answer, say so in one line.

## Check before output

- Standard and full: no sentence over its word limit. Count them.
- Every identifier left in is one the reader needs to act.
- The first sentence answers the question.
- Nothing from the original is missing.
