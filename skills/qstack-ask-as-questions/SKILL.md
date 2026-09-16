---
name: qstack-ask-as-questions
description: Take every open question the previous assistant answer left for the user and ask each one through the host's structured question tool, rephrased for a named reader (product manager by default), with an ELI10 version, lettered options, and one recommendation. Use when invoked as `/qstack-ask-as-questions [role]`, when the previous answer ends with decisions the user must make, or when the user says they do not understand what is being asked of them. Not for a plan's open-questions section, which `/qstack-ask-plan-open-questions` owns.
disable-model-invocation: true
---

# /qstack-ask-as-questions

Turn the open questions in the immediately previous assistant answer into
questions a reader outside the work can answer. Ask them one round at a time
with the host's structured question tool, and report the answers.

This skill reads the conversation, not the plan. A plan's open-questions
section belongs to `/qstack-ask-plan-open-questions`, which also writes the
answers back into the plan. This skill writes nothing.

## Read the invocation

The argument is free text naming the reader. Take the role from it and, when
present, the product that reader owns.

- `/qstack-ask-as-questions` (product manager)
- `/qstack-ask-as-questions ceo`
- `/qstack-ask-as-questions support lead on the habit tracker`

Choose the lens from the role table in `skills/qstack-explain-for/SKILL.md`
and follow that table where it sits rather than copying it here. The default
reader is a product manager.

## Collect the questions

Read the previous substantive assistant answer. A question is anything that
answer leaves for the user to decide: a sentence that asks, a numbered "your
call" list, a choice between two named options, or a statement that work is
waiting on the user's word. Collect every one. Do not add a question the
answer did not raise, and do not drop one because it seems minor.

If the previous answer holds no such question, say so in one short line and
stop.

Each question carries what the answer already knows about it: what the choice
is, why it came up, what each way costs, and what the answer recommended if it
recommended anything. That context is the raw material for the rephrasing;
nothing is invented beyond it.

## Shape each question

Every question is asked in this shape, in this order:

1. The header, when the tool has one: a short label naming the subject, not
   the question.
2. `For a <role>:` the question at the reader's altitude, written under the
   role's row of the explain-for table. Lead with the reader's silent question
   from that row. Assume the reader has not seen the work, the files, or the
   conversation, so carry the context an outsider needs: what was being done,
   why it stopped on this, and what waits on the answer. Drop file paths and
   internal names unless the reader has to use them.
3. `ELI10:` the same question in two or three sentences a ten-year-old
   follows. A concrete comparison works; jargon does not.
4. `Options:` lettered `A`, `B`, `C`, and so on, each in the reader's
   language, each saying what happens if it is picked and what it costs. The
   recommended option is listed first as `A` with `(Recommended)` in its
   label and a one-sentence reason in its description. If the previous answer
   recommended nothing, recommend the option that keeps the most existing
   decisions intact and say that is why.

The role and ELI10 versions carry the same facts and options the original
question carried and add none of their own. They change the altitude, not the
content.

## Ask

Use the host's structured question tool when it exists. One call carries every
question from the answer, up to the tool's limit; a larger set is asked in
rounds of that size. Each question's text is items 2 and 3 above, separated by
a blank line. The options are item 4, letter first in each label, recommended
first.

Without a structured question tool, print the same shape as plain text, one
block per question, and end with one line asking the reader to answer by
letter, such as `1A 2B`.

## Report

After the answers arrive, print one line per question: the header, the letter
chosen, and what it means in the reader's words. If an answer was free text
rather than a letter, quote it. Then state in one line what happens next as a
result, and stop. This skill does not carry out the decisions; the answers go
back to whatever work was waiting on them.
