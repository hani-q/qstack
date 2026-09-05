---
name: qstack-libero
description: >
  Catch the code that got built because it seemed useful rather than because
  the goal required it. Restate the goal, test each assumption against
  evidence, then remove, simplify, optimize, or automate in that order and
  never further than the goal needs. Does not cut validation, error handling
  that prevents data loss, security, or a repository invariant. Use as
  /qstack-libero after a task or feature is built, or when asked what can be
  deleted or simplified.
disable-model-invocation: true
license: MIT
---

# Libero

The free defender behind the line. After the build, read what got through and
clear it. Run this on finished work before calling it done.

## Interrogate before you edit

1. State the goal in one line, from the request or the plan, not from the
   code. If the goal cannot be stated, stop and ask; nothing below works
   without it.
2. List what the work added or changed: each file, abstraction, flag,
   dependency, configuration, and test.
3. For each item, name the assumption that justifies it and the evidence for
   that assumption. "Might be needed later", "seemed cleaner", and "the
   framework usually wants this" are not evidence.
4. Sort the items: delete when the goal does not need it, simplify when a
   smaller form meets the goal, keep when it is needed as is. Optimize only
   what a measurement shows is too slow. Automate only what will run again.
5. Report the sorted list, with the assumption and evidence beside each item,
   before changing anything.

## Then change it, in that order

Delete first. Simplify what remains. Optimize only against a measurement.
Automate last. Take a rung only when the one above it cannot meet the goal.
Rerun the repository's relevant tests, linters, type checks, and builds after
the edits. A deletion that breaks the goal is reverted, not patched around.

## The floor

Never cut validation at a trust boundary, error handling that prevents data
loss, security, accessibility, or a documented repository invariant, even when
the goal as stated does not mention them. The repository's own instruction
files name its invariants; read them before sorting. When an item looks
unnecessary but sits on one of these, keep it and say why.

## Scope and authority

Invocation authorizes edits to the work just built, within the user's scope.
It never authorizes a commit, push, publication, deployment, or external
message. Inside a QStack execution loop, the implementation ladder and the
adversarial reviewer already cover this ground; use this skill on work outside
a loop, or on a finished branch before opening a pull request.
