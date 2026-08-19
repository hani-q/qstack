# Complex exploration

Use this reference when the subject spans several modules, packages, services,
or execution paths. A narrow question should stay in the main skill.

## Split by distinct evidence

Choose a few non-overlapping angles that together cover the question, such as:

- entry point and request or event path;
- data model, state, and ownership;
- configuration, persistence, and external boundaries;
- lifecycle, errors, and observability.

Explore the angles directly or delegate bounded read-only slices when agents
are available and parallel work is useful. Agent fan-out is optional. Give each
delegate a distinct angle and require exact files and symbols. Inspect the code
and reconcile every returned claim yourself.

## Trace each angle

1. Find the actual entry point.
2. Follow every call and data transformation to its effect.
3. Read the central types and state owners.
4. Map what enters and leaves the subsystem.
5. Look for behavior a newcomer would infer incorrectly.

Stop when the full path can be described without guessing. Record unresolved
connections as gaps.

For each angle, retain the components found, step-by-step flow, files read,
boundaries, non-obvious behavior, and open gaps. Merge overlapping evidence and
resolve contradictions against the implementation before writing the answer.
