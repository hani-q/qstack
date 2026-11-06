---
name: qstack-recap
description: Recap the whole current thread, from its first message, for a user who has lost its context. Use when the user invokes `/qstack-recap`, optionally with `brief` or `full`, or says they have lost context, forgot what the thread is about, have no idea what was said, or asks to be caught up, even when they also ask for a higher level. A request about only the last answer's wording or length belongs to `/qstack-ste` or `/qstack-be-concise`.
---

# /qstack-recap

Rebuild the user's picture of this thread from its full history. The user has
come back to it after time away, or among many open threads, and the last
answer alone no longer makes sense to them. Output only the recap.

## Read the depth

- `/qstack-recap`: the default, about 12 to 20 lines.
- `/qstack-recap brief`: one line per section.
- `/qstack-recap full`: the default plus what was ruled out and why, and the
  key numbers behind each finding.

## Gather from the whole thread

Read from the first user message, not the last answer. Collect:

- **The original ask.** What the user, or the agent that launched the thread,
  asked for, and any limits set on it, such as "assess only, do not edit code".
- **The user's own decisions and corrections** made along the way. These
  override anything the agent proposed before them.
- **What was actually done.** Count only what a tool result shows: files
  changed, commits, pull requests, commands run, tests passed or failed. An
  assistant message saying it did something is not enough on its own.
- **What was only proposed.** Suggestions, plans, and options that nothing has
  acted on yet.
- **What is still open.** Questions the agent asked that the user never
  answered, and decisions the plan needs before it can go ahead.

If earlier turns were compacted into a summary, build from the summary and say
in one line that the early detail comes from it.

When the thread changed files or opened pull requests, one read-only call may
check their current state, such as `git status` and `git log` together, or the
pull request's state, because work can have moved since the thread last spoke.
Otherwise call no tools.

## Write the recap

Use these sections, in this order, each opened by its name in bold:

1. **Where we are.** One line on the state, such as "Assessed, nothing built
   yet, waiting on you" or "Fix merged, one follow-up open".
2. **Why this thread exists.** The original ask in one or two sentences.
3. **What we found.** The problems or findings, high level. Each finding says
   what happens and why it matters, not where in the code it happens.
4. **What I suggest.** The proposed changes, numbered in the order they would
   be done. Mark anything already done as done.
5. **What I need from you.** Each open decision as a question the user can
   answer in a word or a letter, with the recommended answer named. If nothing
   is needed, say so in one line and name the next step.

Skip section 3 or 4 when the thread has nothing for it. Never skip 1 or 5.

## Rewrite rules

- Use everyday words. Name parts of the system by what they do ("the part that
  reads call setup messages"), and give the real name once in brackets only
  when the user will meet it again.
- Keep numbers that carry the finding ("86 of 86 connections missed"). Drop file
  paths, line numbers, byte values, function names, and commit hashes unless the
  user needs one to act.
- Use the user's own names for things when they gave them.
- Do not add findings or suggestions the thread did not contain. Do not
  continue the work in the same answer.
- No preamble, no apology, no commentary about the recap.

## Check before output

- Section 1 tells the user where things stand without reading further.
- Every "done" traces to a tool result in the thread.
- Every open question from the thread appears in section 5 or was answered.
- A reader who saw none of the thread could follow it.
