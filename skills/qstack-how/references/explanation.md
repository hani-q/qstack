# Structured explanation

Use this reference for a broad onboarding explanation. Adapt the structure to
the question and omit empty sections.

## Overview

In one or two paragraphs, say what the subsystem is, what it does, and where it
sits in the larger system.

## Key concepts

Define only the types, services, or abstractions needed to follow the flow.

## How it works

Walk from trigger to effect in concrete prose. Name functions, types, and files
so the reader can inspect them. Explain decision points and data changes. Use a
diagram only when prose makes a multi-component flow harder to follow.

## Where things live

Map the small set of files and directories a maintainer needs first.

## Gotchas

Call out surprising behavior, sharp edges, and verified historical artifacts.
Label unexplained oddities as unexplained rather than inventing a rationale.

Prefer concrete statements such as "the handler calls `Queue.enqueue()`" over
phrases such as "the service delegates work." Acknowledge gaps directly.
