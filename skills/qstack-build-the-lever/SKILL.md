---
name: qstack-build-the-lever
description: Build the smallest rerunnable tool that makes non-trivial work repeatable, reviewable, and safe to verify.
disable-model-invocation: true
license: MIT
---

# Build the lever

When authorized work is not a couple of obvious edits, build the smallest tool
that performs or proves it instead of repeating the work by hand.

## Build one rerunnable artifact

1. Do one unit manually to learn the real recipe.
2. Choose the smallest fitting artifact: a script, codemod, generator, query,
   check, or a single immutable recipe for delegated work. Build a tool, not a
   framework.
3. Make reruns safe. Detect current state, avoid duplicate effects, expose
   failures, and support a dry run when mutations carry meaningful risk.
4. Run the tool against the first unit and diff its result against the manual
   version. Resolve any mismatch before applying it broadly.
5. Use the tool for the remaining scope and keep its output reviewable.
6. Prove the produced artifacts directly. A deterministic check is part of the
   lever when it is what makes the work trustworthy.

A deterministic lever beats several people or agents applying the same recipe
by hand. If delegation remains useful, give every delegate the same recipe,
verification contract, and write fence. Keep that contract outside their write
scope.

Applying this skill to authorized non-trivial work produces a rerunnable file.
For a read-only request, propose the file and do not create it. Keep every write
inside the user's scope. Invocation alone never authorizes a commit, push,
publication, deployment, or external message.

Adapted from Lauren Tan's PStack
[`principle-build-the-lever`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-build-the-lever/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
